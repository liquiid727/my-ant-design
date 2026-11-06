/**
 * 解析器：读源文件 → 合并 → 归一化 → 交给 Style Dictionary 做别名解析。
 *
 * 这里刻意不自己写引用解析：循环引用、链式别名、类型继承都交给
 * Style Dictionary（它的核心职责就是这件事），我们只负责"喂什么、拿什么"。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';
import { APPS, BRANDS, SHARED, THEMES } from '../pipeline.config.mjs';
import { isAlias, normalize } from './normalize.mjs';
import { ROOT } from './paths.mjs';

const readJson = async (rel) => {
  const file = path.join(ROOT, rel);
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`读取 token 文件失败：${rel}\n${error.message}`);
  }
};

const mergeInto = (target, source, layers, layer, trail = []) => {
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith('$')) {
      target[key] = value;
      continue;
    }
    const trailNext = [...trail, key];
    const isToken = value && typeof value === 'object' && '$value' in value;
    if (isToken) {
      target[key] = value;
      layers.set(trailNext.join('.'), layer);
      continue;
    }
    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
    mergeInto(target[key], value, layers, layer, trailNext);
  }
};

const collectAliases = (node, trail = [], out = []) => {
  if (node && typeof node === 'object' && '$value' in node) {
    if (isAlias(node.$value)) out.push({ path: trail.join('.'), target: node.$value.slice(1, -1) });
    return out;
  }
  for (const [key, value] of Object.entries(node ?? {})) {
    if (!key.startsWith('$')) collectAliases(value, [...trail, key], out);
  }
  return out;
};

const hasPath = (node, segments) =>
  segments.every((segment) => {
    if (!node || typeof node !== 'object' || !(segment in node)) return false;
    node = node[segment];
    return true;
  });

const flattenResolved = (node, trail = [], out = []) => {
  if (node && typeof node === 'object' && '$value' in node) {
    const original = node.original?.$value;
    out.push({
      path: trail.join('.'),
      type: node.$type,
      value: node.$value,
      alias: isAlias(original) ? original.slice(1, -1) : null,
      description: node.$description,
    });
    return out;
  }
  for (const [key, value] of Object.entries(node ?? {})) {
    if (!key.startsWith('$') && typeof value === 'object' && value !== null) {
      flattenResolved(value, [...trail, key], out);
    }
  }
  return out;
};

export const resolveSet = async (app, brand, theme, patch) => {
  const merged = {};
  const layers = new Map();

  const layersToMerge = [
    ['primitive', SHARED.primitive],
    ['semantic', SHARED.semantic],
    ['brand', brand.brand],
    ['product', app.product],
    ['component', SHARED.component],
    ['semantic', brand.themes?.[theme] ?? []],
  ];

  for (const [layer, files] of layersToMerge) {
    for (const file of files) mergeInto(merged, await readJson(file), layers, layer);
  }

  // 提案预演：把补丁树当作最后一层，不落盘
  if (patch) mergeInto(merged, patch, layers, 'brand');

  const canonical = normalize(merged);

  for (const { path: from, target } of collectAliases(canonical)) {
    if (!hasPath(canonical, target.split('.'))) {
      throw new Error(`别名指向不存在的 token：${from} → {${target}}`);
    }
  }

  const sd = new StyleDictionary({
    tokens: canonical,
    usesDtcg: true,
    log: { verbosity: process.env.DEBUG_TOKENS ? 'verbose' : 'silent', warnings: 'disabled' },
    platforms: { raw: { transforms: [] } },
  });

  const resolved = await sd.exportPlatform('raw');
  const tokens = flattenResolved(resolved);

  for (const token of tokens) token.layer = layers.get(token.path) ?? 'unknown';

  return {
    app: app.id,
    appLabel: app.label,
    appLatin: app.latin,
    brand: brand.id,
    brandLabel: brand.label,
    latin: brand.latin,
    featured: Boolean(brand.featured),
    theme,
    tokens,
    byPath: new Map(tokens.map((token) => [token.path, token])),
  };
};

export const resolveAll = async () => {
  const sets = [];
  for (const app of APPS) {
    for (const brand of BRANDS) {
      for (const theme of THEMES) {
        sets.push(await resolveSet(app, brand, theme));
      }
    }
  }
  return sets;
};

export const findApp = (id) => APPS.find((app) => app.id === id) ?? APPS[0];
export const findBrand = (id) => BRANDS.find((brand) => brand.id === id) ?? BRANDS[0];
