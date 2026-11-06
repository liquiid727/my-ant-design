/**
 * 产物生成：一份解析结果 → 多个目标平台的字符串。
 * 所有产物都带"生成"抬头，禁止手改；diff 就是评审对象。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { DESIGN_WIDTH, OUTPUT_DIR, PRIVATE_PREFIXES } from '../pipeline.config.mjs';
import { cssVarName, formatValue, isPublic } from './format.mjs';
import { ROOT } from './paths.mjs';

const HEADER = '由 design-lab/pipeline/compiler 生成，请勿手改。改动请落在 tokens/ 源文件。';

const write = async (file, content) => {
  const target = path.join(ROOT, OUTPUT_DIR, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf8');
  return { file: target, bytes: Buffer.byteLength(content) };
};

const sortTokens = (set) => [...set.tokens].sort((a, b) => a.path.localeCompare(b.path));

const renderVars = (set, target) =>
  sortTokens(set)
    .filter((token) => isPublic(token, PRIVATE_PREFIXES))
    .map((token) => {
      const value = formatValue(token, target);
      const safe = typeof value === 'string' ? value.replace(/\n/g, ' ') : String(value);
      return `  ${cssVarName(token.path)}: ${safe};`;
    })
    .join('\n');

const diffCount = (set, base) =>
  set.tokens.filter((token) => {
    const other = base.byPath.get(token.path);
    if (!other) return true;
    return JSON.stringify(other.value) !== JSON.stringify(token.value);
  }).length;

const publicCount = (set) => set.tokens.filter((token) => isPublic(token, PRIVATE_PREFIXES)).length;

export const emitCss = async (sets) => {
  const defaultSet = sets[0];
  const lightOf = (brand) => sets.find((set) => set.brand === brand && set.theme === 'light') ?? defaultSet;
  const blocks = [];

  blocks.push(`/* ${defaultSet.brand} · light（默认） */\n:root {\n${renderVars(defaultSet, 'web')}\n}`);

  for (const set of sets) {
    const isDefaultBrand = set.brand === defaultSet.brand;
    const dark = set.theme === 'dark';
    if (isDefaultBrand && dark) {
      blocks.push(
        `/* ${set.theme}：覆盖 ${diffCount(set, defaultSet)} / ${publicCount(set)} 个变量 */\n[data-theme="dark"] {\n${renderVars(set, 'web')}\n}`,
      );
      continue;
    }
    if (isDefaultBrand) continue;
    const selectors = [`[data-brand="${set.brand}"]${dark ? `[data-theme="dark"]` : ''}`];
    blocks.push(
      `/* ${set.brand} · ${set.theme}：覆盖 ${diffCount(set, lightOf(set.brand))} / ${publicCount(set)} 个变量 */\n${selectors.join(',\n')} {\n${renderVars(set, 'web')}\n}`,
    );
  }

  return write('tokens.css', `/* ${HEADER}\n   ${sets.length} 套排列 · 作者单位 px@${DESIGN_WIDTH} · Web 目标 px\n*/\n\n${blocks.join('\n\n')}\n`);
};

export const emitWxss = async (sets) => {
  const defaultSet = sets[0];
  const darkSet = sets.find((set) => set.brand === defaultSet.brand && set.theme === 'dark');
  const lightVars = renderVars(defaultSet, 'weapp');
  const darkVars = darkSet ? renderVars(darkSet, 'weapp') : '';
  const body = [
    `/* 浅色：定义在 page 上，自定义属性会继承进所有自定义组件 */\npage {\n${lightVars}\n}`,
    darkVars
      ? `/* 跟随系统深色 */\n@media (prefers-color-scheme: dark) {\n  page {\n${darkVars
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n')}\n  }\n}`
      : '',
    darkVars ? `/* 手动切换：在页面根 view 上加 class */\n.theme-dark {\n${darkVars}\n}` : '',
    `/* 手动切回浅色 */\n.theme-light {\n${lightVars}\n}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return write(
    'tokens.wxss',
    `/* ${HEADER}\n   微信小程序目标：px@${DESIGN_WIDTH} → rpx（×2），1px 发丝线保持 px\n*/\n\n${body}\n`,
  );
};

export const emitTs = async (sets) => {
  const defaultBrand = sets[0].brand;
  const brandSets = sets.filter((set) => set.brand === defaultBrand);
  const themeNames = brandSets.map((set) => set.theme);

  const renderMap = (set) => {
    const entries = sortTokens(set)
      .filter((token) => isPublic(token, PRIVATE_PREFIXES))
      .map((token) => `  '${token.path}': ${JSON.stringify(formatValue(token, 'web'))},`);
    return `{\n${entries.join('\n')}\n}`;
  };

  const blocks = brandSets.map((set) => `export const ${set.theme} = ${renderMap(set)} as const;`);
  const themeEntries = brandSets.map((set) => `  ${set.theme},`).join('\n');

  return write(
    'tokens.ts',
    `/* ${HEADER} */\n\n${blocks.join('\n\n')}\n\nexport const themes = {\n${themeEntries}\n} as const;\n\nexport type Theme = keyof typeof themes;\nexport type TokenName = keyof typeof ${themeNames[0]};\nexport type TokenValue = (typeof themes)[Theme][TokenName];\n\n/** 在 CSS 里引用同一份变量，避免 TS 与 CSS 两套值。 */\nexport const cssVar = (name: TokenName) => \`var(--\${name.split('.').join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()})\`;\n`,
  );
};

const unflatten = (tokens) => {
  const root = {};
  for (const token of tokens) {
    const segments = token.path.split('.');
    let node = root;
    for (const segment of segments.slice(0, -1)) {
      node[segment] ??= {};
      node = node[segment];
    }
    node[segments.at(-1)] = { $type: token.type, $value: token.value };
  }
  return root;
};

export const emitDtcg = async (sets) => {
  const out = [];
  for (const set of sets) {
    const content = JSON.stringify(
      {
        $description: `design-lab DTCG 交换产物 · ${set.brand} · ${set.theme}（已解析为最终值）`,
        ...unflatten(sortTokens(set)),
      },
      null,
      2,
    );
    out.push(await write(`dtcg/${set.brand}.${set.theme}.tokens.json`, `${content}\n`));
  }
  return out;
};

export const emitCatalog = async (sets) => {
  const brands = [...new Set(sets.map((set) => set.brand))];
  const payload = {
    generatedBy: 'pipeline/compiler',
    designWidth: DESIGN_WIDTH,
    privatePrefixes: PRIVATE_PREFIXES,
    brands: brands.map((brand) => {
      const brandSets = sets.filter((set) => set.brand === brand);
      const base = brandSets[0];
      const tokens = sortTokens(base).map((token) => ({
        path: token.path,
        type: token.type,
        layer: token.layer,
        public: isPublic(token, PRIVATE_PREFIXES),
        alias: token.alias,
        description: token.description,
        values: Object.fromEntries(brandSets.map((set) => [set.theme, formatValue(set.byPath.get(token.path) ?? token, 'web')])),
        hex: Object.fromEntries(brandSets.map((set) => [set.theme, set.byPath.get(token.path)?.value?.hex ?? null])),
      }));
      return {
        id: brand,
        label: base.brandLabel,
        latin: base.latin,
        themes: brandSets.map((set) => set.theme),
        counts: {
          total: tokens.length,
          public: tokens.filter((token) => token.public).length,
          byLayer: Object.fromEntries(
            [...new Set(tokens.map((token) => token.layer))].map((layer) => [layer, tokens.filter((token) => token.layer === layer).length]),
          ),
        },
        tokens,
      };
    }),
  };
  return write('catalog.json', `${JSON.stringify(payload, null, 2)}\n`);
};

export const emitQa = async (report) => write('qa.json', `${JSON.stringify(report, null, 2)}\n`);

const ARTIFACT_LABELS = {
  'tokens.css': 'Web · CSS 变量',
  'tokens.wxss': '微信小程序 · WXSS',
  'tokens.ts': 'TypeScript · 类型',
  'design-context.json': 'AI · 设计上下文',
  'catalog.json': '实验台 · Token 目录',
  'qa.json': '门禁 · 对比度报告',
};

export const emitManifest = async (payload) => {
  const artifacts = payload.artifacts.map((artifact) => {
    const name = path.basename(artifact.file);
    return {
      file: artifact.file,
      name,
      bytes: artifact.bytes,
      kind: name.replace(/\..*$/, ''),
      label: ARTIFACT_LABELS[name] ?? (name.startsWith('cycling.') ? 'DTCG · 交换产物' : name),
    };
  });
  return write('manifest.json', `${JSON.stringify({ ...payload, artifacts }, null, 2)}\n`);
};

export const emitContext = async ({ sets, contractsByBrand, contrastReport }) => {
  const brandIds = [...new Set(sets.map((set) => set.brand))];
  const artifacts = [];

  for (const brandId of brandIds) {
    const brandSets = sets.filter((set) => set.brand === brandId);
    const base = brandSets.find((set) => set.theme === 'light') ?? brandSets[0];
    const dark = brandSets.find((set) => set.theme === 'dark');

    const usable = sortTokens(base)
      .filter((token) => isPublic(token, PRIVATE_PREFIXES))
      .map((token) => [token.path, formatValue(token, 'web')]);

    const payload = {
      $schema: 'design-lab/design-context@1',
      brand: { id: base.brand, label: base.brandLabel, latin: base.latin },
      units: {
        authoring: `px @ ${DESIGN_WIDTH} 设计宽`,
        web: 'px',
        weapp: 'rpx（px × 2）；1px 发丝线保持 px',
      },
      layers: {
        primitive: '原始色阶与刻度，业务不可引用',
        semantic: '用途语义，品牌包覆盖的唯一入口',
        brand: '品牌包：只允许覆盖白名单内的键',
        product: '产品语义（本产品专有），不进 core',
        component: '组件私有变量，只引用语义层',
      },
      components: contractsByBrand[brandId] ?? [],
      tokenCounts: {
        public: usable.length,
        private: base.tokens.length - usable.length,
        contrastPairs: contrastReport.summary.pairs,
        contrastFailing: contrastReport.summary.failing,
      },
      tokens: Object.fromEntries(usable),
      darkOverrides: dark
        ? Object.fromEntries(
            sortTokens(dark)
              .filter((token) => isPublic(token, PRIVATE_PREFIXES))
              .filter((token) => JSON.stringify(token.value) !== JSON.stringify(base.byPath.get(token.path)?.value))
              .map((token) => [token.path, formatValue(token, 'web')]),
          )
        : {},
      rules: [
        '不要在组件或页面里写死颜色、间距、圆角、时长；一律引用 --token 变量。',
        '现有 token 不够用时，先提交 Token 变更提案（新增语义键 + 说明），不要就地写新值。',
        '组件只允许引用 semantic / component 层；引用 color.ramp.* 或 brand.palette.* 视为缺陷。',
        '新增深色值必须同时补 light 与 dark，否则主题完整性检查失败。',
        '1px 边框保持 px；其余尺寸使用 rpx（由编译器换算，不要手写 rpx）。',
        '跨品牌复用页面时只换品牌包；页面结构与组件不应感知品牌 id。',
      ],
    };

    const file = brandId === brandIds[0] ? 'design-context.json' : `design-context.${brandId}.json`;
    artifacts.push(await write(file, `${JSON.stringify(payload, null, 2)}\n`));
  }

  return artifacts;
};
