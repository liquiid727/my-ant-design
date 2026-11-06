#!/usr/bin/env node
/**
 * 门禁：token 是 API，所以这里的每条规则都对应一次"真实会踩的坑"。
 *
 * error → 阻断合并；warn → 提示，不拦。
 * 用法：npm run lint:tokens
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { APPS, BRAND_OVERRIDE_ALLOWLIST, BRANDS, PRIVATE_PREFIXES } from '../pipeline.config.mjs';
import { resolveAll } from '../compiler/resolve.mjs';
import { runContrast } from '../compiler/qa.mjs';
import { ROOT } from '../compiler/paths.mjs';

const flattenPaths = (node, trail = [], out = []) => {
  if (node && typeof node === 'object' && '$value' in node) {
    out.push(trail.join('.'));
    return out;
  }
  for (const [key, value] of Object.entries(node ?? {})) {
    if (!key.startsWith('$')) flattenPaths(value, [...trail, key], out);
  }
  return out;
};

const readJson = async (rel) => JSON.parse(await fs.readFile(path.join(ROOT, rel), 'utf8'));

const allowed = (tokenPath) =>
  BRAND_OVERRIDE_ALLOWLIST.some((prefix) => (prefix.endsWith('.') ? tokenPath.startsWith(prefix) : tokenPath === prefix || tokenPath.startsWith(`${prefix}.`)));

const PRIMITIVE_ALIAS_PREFIXES = ['color.ramp', 'brand.palette', 'font.', 'shadow.', 'duration.', 'easing.', 'opacity.', 'border.', 'size.', 'radius.'];

const checks = [];

checks.push({
  id: 'theme-completeness',
  title: '主题完整性',
  async run(sets) {
    const issues = [];
    for (const app of APPS) {
      for (const brand of BRANDS) {
        const light = sets.find((set) => set.app === app.id && set.brand === brand.id && set.theme === 'light');
        const dark = sets.find((set) => set.app === app.id && set.brand === brand.id && set.theme === 'dark');
        if (!light || !dark) {
          issues.push(`${app.id}.${brand.id}: 缺少整套排列`);
          continue;
        }
        const lightKeys = new Set(light.tokens.map((token) => token.path));
        const darkKeys = new Set(dark.tokens.map((token) => token.path));
        for (const key of lightKeys) if (!darkKeys.has(key)) issues.push(`${app.id}.${brand.id}: dark 缺少 ${key}`);
        for (const key of darkKeys) if (!lightKeys.has(key)) issues.push(`${app.id}.${brand.id}: dark 多出 ${key}`);
        const missing = [...lightKeys].filter((key) => !dark.byPath.get(key)?.value);
        for (const key of missing) issues.push(`${app.id}.${brand.id}: ${key} 在 dark 下没有值`);
      }
    }
    return issues;
  },
});

checks.push({
  id: 'brand-whitelist',
  title: '品牌包白名单',
  async run() {
    const issues = [];
    for (const brand of BRANDS) {
      for (const file of brand.brand ?? []) {
        const paths = flattenPaths(await readJson(file));
        for (const tokenPath of paths) {
          if (!allowed(tokenPath)) issues.push(`${file}: ${tokenPath} 不在白名单，请改为覆盖语义层或走 Token 提案`);
        }
      }
    }
    return issues;
  },
});

checks.push({
  id: 'layer-direction',
  title: '分层依赖方向',
  async run(sets) {
    const issues = [];
    for (const set of sets) {
      for (const token of set.tokens) {
        if (token.layer !== 'component' || !token.alias) continue;
        const target = set.byPath.get(token.alias);
        if (!target) {
          issues.push(`${set.brand}.${set.theme}: ${token.path} → {${token.alias}} 不存在`);
          continue;
        }
        if (/^color\.ramp\./.test(token.alias)) {
          issues.push(`${token.path} 直接引用了色阶 {${token.alias}}，应引用语义层`);
        }
      }
      for (const token of set.tokens) {
        if (!token.alias) continue;
        if (token.layer !== 'component') continue;
        if (/^(color\.ramp|brand\.palette)\./.test(token.alias)) {
          issues.push(`${token.path} 是 ${token.layer} 层，却直接引用原色 {${token.alias}}；颜色一律走语义层`);
        }
      }
    }
    return [...new Set(issues)];
  },
});

checks.push({
  id: 'contrast',
  title: '对比度（WCAG AA）',
  async run(sets) {
    const issues = [];
    for (const set of sets) {
      for (const result of runContrast(set)) {
        if (!result.pass) {
          issues.push(`${set.brand}.${set.theme} · ${result.id} = ${result.ratio}:1，需要 ${result.min}:1（${result.note}）`);
        }
      }
    }
    return issues;
  },
});

checks.push({
  id: 'contracts',
  title: '组件契约可解析',
  async run(sets) {
    const issues = [];
    for (const app of APPS) {
      const publicPaths = new Set(
        sets
          .filter((set) => set.app === app.id && set.theme === 'light')
          .flatMap((set) => set.tokens.filter((token) => token.layer !== 'primitive').map((token) => token.path)),
      );
      let files = [];
      try {
        files = (await fs.readdir(path.join(ROOT, app.contracts))).filter((file) => file.endsWith('.json'));
      } catch {
        issues.push(`${app.id}: 找不到契约目录 ${app.contracts}`);
        continue;
      }
      for (const file of files) {
        const contract = await readJson(path.join(app.contracts, file));
        for (const tokenPath of contract.tokens ?? []) {
          if (!publicPaths.has(tokenPath)) issues.push(`${app.id}/${file}: 引用了不存在或非公开的 token "${tokenPath}"`);
        }
        for (const required of ['name', 'purpose', 'props', 'states', 'tokens']) {
          if (!contract[required]) issues.push(`${app.id}/${file}: 缺少字段 ${required}`);
        }
      }
    }
    return issues;
  },
});

const SCAN_DIRS = ['src'];
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;

const toVar = (tokenPath) =>
  `--${tokenPath
    .split('.')
    .map((segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase())
    .join('-')}`;

checks.push({
  id: 'product-token-boundary',
  title: '产品语义不越界',
  async run() {
    const issues = [];
    const productVars = new Map();

    for (const app of APPS) {
      const catalog = JSON.parse(await fs.readFile(path.join(ROOT, 'src/generated', `catalog.${app.id}.json`), 'utf8'));
      const vars = new Set(
        catalog.brands
          .flatMap((brand) => brand.tokens)
          .filter((token) => token.layer === 'product')
          .map((token) => toVar(token.path)),
      );
      productVars.set(app.id, vars);
    }

    const allProductVars = new Map();
    for (const [appId, vars] of productVars) for (const variable of vars) allProductVars.set(variable, appId);

    const scan = async (dir, allowedApps) => {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'generated' || entry.name === 'node_modules' || entry.name === 'dist') continue;
          await scan(full, allowedApps);
          continue;
        }
        if (!/\.(tsx?|css)$/.test(entry.name)) continue;
        if (entry.name.endsWith('.css') && !referencedCss.has(full)) continue;
        const content = await fs.readFile(full, 'utf8');
        for (const match of content.matchAll(/var\((--[a-z0-9-]+)/g)) {
          const owner = allProductVars.get(match[1]);
          if (!owner) continue;
          if (!allowedApps.includes(owner)) {
            issues.push(`${path.relative(ROOT, full)}: 使用了 ${owner} 的产品语义 ${match[1]}（只允许在 apps/${owner} 内）`);
          }
        }
      }
    };

    // 通用组件与小程序组件：任何产品语义都不许出现
    await scan(path.join(ROOT, 'src/components'), []);
    await scan(path.join(ROOT, 'packages/ds-weapp/src'), []);

    // 每个 app 只允许用自己的产品语义
    for (const app of APPS) {
      await scan(path.join(ROOT, 'src/apps', app.id), [app.id]);
    }

    return [...new Set(issues)];
  },
});

checks.push({
  id: 'no-hardcoded-color',
  title: '禁止硬编码颜色',
  async run() {
    const issues = [];

    // 只扫描真正被页面引用的 CSS：没人 import 的样式文件不属于"界面代码"
    const referencedCss = new Set();
    const collectImports = async (dir) => {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'generated' || entry.name === 'node_modules') continue;
          await collectImports(full);
          continue;
        }
        if (!/\.(tsx?|html)$/.test(entry.name)) continue;
        const content = await fs.readFile(full, 'utf8');
        for (const match of content.matchAll(/['"]([^'"]+\.css)['"]/g)) {
          const target = match[1].startsWith('.') ? path.resolve(path.dirname(full), match[1]) : null;
          if (target) referencedCss.add(target);
        }
      }
    };
    for (const dir of SCAN_DIRS) await collectImports(path.join(ROOT, dir));
    const walk = async (dir) => {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'generated' || entry.name === 'node_modules') continue;
          await walk(full);
          continue;
        }
        if (!/\.(tsx?|css)$/.test(entry.name)) continue;
        if (entry.name.endsWith('.css') && !referencedCss.has(full)) continue;
        const content = await fs.readFile(full, 'utf8');
        // 文件级豁免：前 5 行写 allow-hardcoded-file 并说明理由
        if (content.split('\n').slice(0, 5).join('\n').includes('allow-hardcoded-file')) continue;
        content.split('\n').forEach((line, index) => {
          if (line.includes('allow-hardcoded')) return;
          const matches = line.match(COLOR_LITERAL);
          if (matches) issues.push(`${path.relative(ROOT, full)}:${index + 1} 出现 ${matches.join(' ')}`);
        });
      }
    };
    for (const dir of SCAN_DIRS) await walk(path.join(ROOT, dir));
    return issues;
  },
});

checks.push({
  id: 'unused-semantic',
  title: '未被引用的语义 token（信息）',
  level: 'info',
  async run(sets) {
    const warnings = [];
    const base = sets.find((set) => set.theme === 'light') ?? sets[0];
    const referenced = new Set();
    for (const token of base.tokens) if (token.alias) referenced.add(token.alias);
    for (const token of base.tokens) {
      if (token.layer !== 'semantic') continue;
      if (PRIVATE_PREFIXES.some((prefix) => token.path.startsWith(prefix))) continue;
      if (referenced.has(token.path)) continue;
      warnings.push(`${token.path} 没有任何别名或组件引用`);
    }
    return warnings;
  },
});

const main = async () => {
  const sets = await resolveAll();
  let errors = 0;
  let warnings = 0;

  console.log('');
  for (const check of checks) {
    const issues = await check.run(sets);
    const level = check.level ?? 'error';
    if (!issues.length) {
      console.log(`  ✓ ${check.title}`);
      continue;
    }
    if (level === 'error') errors += issues.length;
    if (level === 'warn') warnings += issues.length;
    console.log(`  ${level === 'error' ? '✗' : '·'} ${check.title}（${issues.length}）`);
    const shown = level === 'info' ? 3 : 12;
    for (const issue of issues.slice(0, shown)) console.log(`      ${issue}`);
    if (issues.length > shown) console.log(`      …另有 ${issues.length - shown} 条`);
  }
  console.log('');

  if (errors) {
    console.log(`  门禁未通过：${errors} 个错误${warnings ? `、${warnings} 个提示` : ''}\n`);
    process.exitCode = 1;
    return;
  }
  console.log(`  门禁通过${warnings ? `（${warnings} 个提示）` : ''}\n`);
};

main().catch((error) => {
  console.error(`\n门禁执行失败：${error.message}\n`);
  process.exitCode = 1;
});
