/**
 * 产物生成：一份解析结果 → 多个目标平台的字符串。
 *
 * 产物按 app 拆分（一个产品一份 CSS / WXSS / TS），
 * 因为一个产品只需要自己的产品语义，没必要把所有 app 打进同一个包。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { APPS, DESIGN_WIDTH, OUTPUT_DIR, PRIVATE_PREFIXES } from '../pipeline.config.mjs';
import { cssVarName, formatValue, isPublic } from './format.mjs';
import { ROOT } from './paths.mjs';

const HEADER = '由 design-lab/pipeline/compiler 生成，请勿手改。改动请落在 tokens 源文件。';

const write = async (file, content) => {
  const target = path.join(ROOT, OUTPUT_DIR, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf8');
  return { file: target, bytes: Buffer.byteLength(content) };
};

const sortTokens = (set) => [...set.tokens].sort((a, b) => a.path.localeCompare(b.path));

const publicTokens = (set) => sortTokens(set).filter((token) => isPublic(token, PRIVATE_PREFIXES));

const renderVars = (set, target) =>
  publicTokens(set)
    .map((token) => {
      const value = formatValue(token, target);
      const safe = typeof value === 'string' ? value.replace(/\n/g, ' ') : String(value);
      return `  ${cssVarName(token.path)}: ${safe};`;
    })
    .join('\n');

/** 宽屏字号：只放大与排版相关的尺寸，颜色/间距各自走自己的变量。 */
const TYPE_EXTRA_TARGETS = new Set(['metric.muted-size', 'metric.unit-size']);

const typeScaleOf = (set) => {
  const value = set.byPath.get('layout.scale.type.tablet')?.value;
  return typeof value === 'number' ? value : 1.08;
};

const typeTargets = (set) =>
  set.tokens.filter(
    (token) =>
      token.type === 'dimension' &&
      isPublic(token, PRIVATE_PREFIXES) &&
      (token.path.startsWith('type.') || (token.alias ?? '').startsWith('type.') || TYPE_EXTRA_TARGETS.has(token.path)),
  );

const renderScaledType = (set, indent = '    ') => {
  const scale = typeScaleOf(set);
  return typeTargets(set)
    .map((token) => {
      const value = token.value;
      if (!value || typeof value !== 'object' || value.unit !== 'px') return null;
      const scaled = Math.round(value.value * scale * 10) / 10;
      return `${indent}${cssVarName(token.path)}: ${scaled}px;`;
    })
    .filter(Boolean)
    .join('\n');
};

const diffCount = (set, base) =>
  set.tokens.filter((token) => {
    const other = base.byPath.get(token.path);
    if (!other) return true;
    return JSON.stringify(other.value) !== JSON.stringify(token.value);
  }).length;

/** 布局块：断点值在编译期展开，其余仍然是变量。 */
const renderLayout = (appId, set) => {
  const px = (tokenPath) => {
    const value = set.byPath.get(tokenPath)?.value;
    return value && typeof value === 'object' ? `${value.value}${value.unit}` : null;
  };
  const tablet = px('layout.breakpoint.tablet');
  const wide = px('layout.breakpoint.wide');
  if (!tablet) return '';

  // 用容器查询，而不是媒体查询：手机样机放在 1440 宽的页面里，视口宽度毫无意义。
  const rules = [
    '/* 布局：断点取自 layout.breakpoint.*，宽度与间距仍是变量 */',
    `[data-app="${appId}"] .screen {`,
    '  --layout-gutter: var(--layout-gutter-phone);',
    '  --layout-content-max: var(--layout-content-max-phone);',
    '}',
    '',
    `@container (min-width: ${tablet}) {`,
    `  [data-app="${appId}"] .screen {`,
    '    --layout-gutter: var(--layout-gutter-tablet);',
    '    --layout-content-max: var(--layout-content-max-tablet);',
    renderScaledType(set),
    '  }',
    '',
    `  [data-app="${appId}"] [data-cols='2'] {`,
    '    grid-template-columns: repeat(2, minmax(0, 1fr));',
    '  }',
    '}',
  ];

  if (wide) {
    rules.push(
      '',
      `@container (min-width: ${wide}) {`,
      `  [data-app="${appId}"] [data-cols='3'] {`,
      '    grid-template-columns: repeat(3, minmax(0, 1fr));',
      '  }',
      '}',
    );
  }

  return rules.join('\n');
};

const groupBy = (sets, key) =>
  sets.reduce((acc, set) => {
    const value = set[key];
    (acc[value] ??= []).push(set);
    return acc;
  }, {});

const APP_ORDER = APPS.map((app) => app.id);

export const emitCss = async (sets) => {
  const byApp = groupBy(sets, 'app');
  const firstApp = APP_ORDER[0];
  const artifacts = [];

  for (const [appId, appSets] of Object.entries(byApp)) {
    const blocks = [];
    const defaultSet = appSets.find((set) => set.theme === 'light');
    const brands = [...new Set(appSets.map((set) => set.brand))];

    if (appId === firstApp) {
      blocks.push(`/* 默认（未设置 data-app 时） */\n:root {\n${renderVars(defaultSet, 'web')}\n}`);
    }

    blocks.push(`/* ${appId} · 默认品牌 */\n[data-app="${appId}"] {\n${renderVars(defaultSet, 'web')}\n}`);

    for (const brand of brands) {
      const light = appSets.find((set) => set.brand === brand && set.theme === 'light');
      const dark = appSets.find((set) => set.brand === brand && set.theme === 'dark');
      blocks.push(
        `/* ${brand} · light：覆盖 ${diffCount(light, defaultSet)} / ${publicTokens(light).length} 个变量 */\n[data-app="${appId}"][data-brand="${brand}"] {\n${renderVars(light, 'web')}\n}`,
      );
      if (dark) {
        blocks.push(
          `/* ${brand} · dark：覆盖 ${diffCount(dark, light)} / ${publicTokens(dark).length} 个变量 */\n[data-app="${appId}"][data-brand="${brand}"][data-theme="dark"] {\n${renderVars(dark, 'web')}\n}`,
        );
      }
    }

    blocks.push(renderLayout(appId, defaultSet));

    artifacts.push(
      await write(
        `tokens.${appId}.css`,
        `/* ${HEADER}\n   ${appId} · ${brands.length} 品牌 × 2 主题 · 作者单位 px@${DESIGN_WIDTH} · Web 目标 px\n*/\n\n${blocks.join('\n\n')}\n`,
      ),
    );
  }

  return artifacts;
};

export const emitWxss = async (sets) => {
  const byApp = groupBy(sets, 'app');
  const artifacts = [];

  for (const [appId, appSets] of Object.entries(byApp)) {
    // 小程序一次构建只有一个品牌，取第一个品牌
    const brand = appSets[0].brand;
    const light = appSets.find((set) => set.brand === brand && set.theme === 'light');
    const dark = appSets.find((set) => set.brand === brand && set.theme === 'dark');
    const lightVars = renderVars(light, 'weapp');
    const darkVars = dark ? renderVars(dark, 'weapp') : '';
    const indent = (block) => block.split('\n').map((line) => `  ${line}`).join('\n');

    const body = [
      `/* 浅色：定义在 page 上，自定义属性会继承进所有自定义组件 */\npage {\n${lightVars}\n}`,
      darkVars ? `/* 跟随系统深色 */\n@media (prefers-color-scheme: dark) {\n  page {\n${indent(darkVars)}\n  }\n}` : '',
      darkVars ? `/* 手动切换：在页面根 view 上加 class */\n.theme-dark {\n${darkVars}\n}` : '',
      `/* 手动切回浅色 */\n.theme-light {\n${lightVars}\n}`,
      `/* 布局：小程序没有容器查询，由 @ds/weapp 的 runtime 给页面根节点加 class */\npage {\n  --layout-gutter: var(--layout-gutter-phone);\n  --layout-content-max: var(--layout-content-max-phone);\n}`,
      `.layout-medium {\n  --layout-gutter: var(--layout-gutter-tablet);\n  --layout-content-max: var(--layout-content-max-tablet);\n${renderScaledType(light, '  ')}\n}`,
      `.layout-expanded {\n  --layout-gutter: var(--layout-gutter-tablet);\n  --layout-content-max: var(--layout-content-max-tablet);\n${renderScaledType(light, '  ')}\n}`,
      `.layout-medium [data-cols='2'],\n.layout-expanded [data-cols='2'] {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}`,
      `.layout-expanded [data-cols='3'] {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    artifacts.push(
      await write(
        `tokens.${appId}.wxss`,
        `/* ${HEADER}\n   ${appId} · 品牌 ${brand} · 微信小程序目标：px@${DESIGN_WIDTH} → rpx（×2），1px 发丝线保持 px\n*/\n\n${body}\n`,
      ),
    );
  }

  return artifacts;
};

export const emitTs = async (sets) => {
  const byApp = groupBy(sets, 'app');
  const artifacts = [];

  for (const [appId, appSets] of Object.entries(byApp)) {
    const brands = [...new Set(appSets.map((set) => set.brand))];
    const renderMap = (set) => {
      const entries = publicTokens(set).map((token) => `    '${token.path}': ${JSON.stringify(formatValue(token, 'web'))},`);
      return `{\n${entries.join('\n')}\n  }`;
    };

    const brandBlocks = brands.map((brand) => {
      const themes = appSets.filter((set) => set.brand === brand);
      const themeEntries = themes.map((set) => `    ${set.theme}: ${renderMap(set)},`).join('\n');
      return `  ${brand}: {\n${themeEntries}\n  },`;
    });

    const firstBrand = brands[0];
    artifacts.push(
      await write(
        `tokens.${appId}.ts`,
        `/* ${HEADER} */\n\nexport const brands = {\n${brandBlocks.join('\n')}\n} as const;\n\nexport type Brand = keyof typeof brands;\nexport type Theme = 'light' | 'dark';\nexport type TokenName = keyof (typeof brands)['${firstBrand}']['light'];\nexport type TokenValue = (typeof brands)[Brand][Theme][TokenName];\n\n/** 在 CSS 里引用同一份变量，避免 TS 与 CSS 两套值。 */\nexport const cssVar = (name: TokenName) => \`var(--\${name.split('.').join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()})\`;\n`,
      ),
    );
  }

  return artifacts;
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
  const artifacts = [];
  for (const set of sets) {
    const content = JSON.stringify(
      {
        $description: `design-lab DTCG 交换产物 · ${set.app} · ${set.brand} · ${set.theme}（只含业务可见 token，内部原色不导出）`,
        ...unflatten(publicTokens(set)),
      },
      null,
      2,
    );
    artifacts.push(await write(`dtcg/${set.app}.${set.brand}.${set.theme}.tokens.json`, `${content}\n`));
  }
  return artifacts;
};

export const emitCatalog = async (sets) => {
  const byApp = groupBy(sets, 'app');
  const artifacts = [];

  for (const [appId, appSets] of Object.entries(byApp)) {
    const brands = [...new Set(appSets.map((set) => set.brand))];
    const payload = {
      generatedBy: 'pipeline/compiler',
      app: appId,
      appLabel: appSets[0].appLabel,
      designWidth: DESIGN_WIDTH,
      privatePrefixes: PRIVATE_PREFIXES,
      brands: brands.map((brand) => {
        const brandSets = appSets.filter((set) => set.brand === brand);
        const base = brandSets.find((set) => set.theme === 'light') ?? brandSets[0];
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
    artifacts.push(await write(`catalog.${appId}.json`, `${JSON.stringify(payload, null, 2)}\n`));
  }

  return artifacts;
};

export const emitQa = async (reportByApp) => {
  const artifacts = [];
  for (const [appId, report] of Object.entries(reportByApp)) {
    artifacts.push(await write(`qa.${appId}.json`, `${JSON.stringify(report, null, 2)}\n`));
  }
  return artifacts;
};

export const emitContext = async ({ sets, contractsByApp }) => {
  const byApp = groupBy(sets, 'app');
  const artifacts = [];

  for (const [appId, appSets] of Object.entries(byApp)) {
    const brands = [...new Set(appSets.map((set) => set.brand))];
    const brandPayloads = {};

    for (const brand of brands) {
      const brandSets = appSets.filter((set) => set.brand === brand);
      const base = brandSets.find((set) => set.theme === 'light') ?? brandSets[0];
      const dark = brandSets.find((set) => set.theme === 'dark');
      brandPayloads[brand] = {
        label: base.brandLabel,
        latin: base.latin,
        tokens: Object.fromEntries(publicTokens(base).map((token) => [token.path, formatValue(token, 'web')])),
        darkOverrides: dark
          ? Object.fromEntries(
              publicTokens(dark)
                .filter((token) => JSON.stringify(token.value) !== JSON.stringify(base.byPath.get(token.path)?.value))
                .map((token) => [token.path, formatValue(token, 'web')]),
            )
          : {},
      };
    }

    const baseSet = appSets[0];
    const payload = {
      $schema: 'design-lab/design-context@2',
      app: { id: appId, label: baseSet.appLabel },
      units: {
        authoring: `px @ ${DESIGN_WIDTH} 设计宽`,
        web: 'px',
        weapp: 'rpx（px × 2）；1px 发丝线保持 px',
      },
      layers: {
        primitive: '原始色阶与刻度，业务不可引用',
        semantic: '用途语义，品牌包覆盖的唯一入口',
        brand: '品牌包：只允许覆盖白名单内的键',
        product: '本产品专有的业务语义',
        component: '组件私有变量，只引用语义层',
      },
      components: contractsByApp[appId] ?? [],
      brands: brandPayloads,
      rules: [
        '不要在组件或页面里写死颜色、间距、圆角、时长；一律引用 --token 变量。',
        '现有 token 不够用时，先提交 Token 变更提案（新增语义键 + 说明），不要就地写新值。',
        '组件只允许引用 semantic / component 层；引用 color.ramp.* 或 brand.palette.* 视为缺陷。',
        '新增深色值必须同时补 light 与 dark，否则主题完整性检查失败。',
        '1px 边框保持 px；其余尺寸使用 rpx（由编译器换算，不要手写 rpx）。',
        '跨品牌复用页面时只换品牌包；页面结构与组件不应感知品牌 id。',
        '跨产品复用组件时只换 app 层；组件不应引用 route.* / transaction.* 这类产品语义。',
      ],
    };

    artifacts.push(await write(`design-context.${appId}.json`, `${JSON.stringify(payload, null, 2)}\n`));
  }

  return artifacts;
};

const ARTIFACT_LABELS = (appId) => ({
  [`tokens.${appId}.css`]: 'Web · CSS 变量',
  [`tokens.${appId}.wxss`]: '微信小程序 · WXSS',
  [`tokens.${appId}.ts`]: 'TypeScript · 类型',
  [`design-context.${appId}.json`]: 'AI · 设计上下文',
  [`catalog.${appId}.json`]: '实验台 · Token 目录',
  [`qa.${appId}.json`]: '门禁 · 对比度报告',
});

export const emitManifest = async (payload) => {
  const artifacts = payload.artifacts.map((artifact) => {
    const name = path.basename(artifact.file);
    const appId = payload.apps.map((app) => app.id).find((id) => name.includes(`.${id}.`));
    const labels = appId ? ARTIFACT_LABELS(appId) : {};
    const dtcg = name.endsWith('.tokens.json');
    const ext = name.split('.').at(-1);
    return {
      file: artifact.file,
      name,
      bytes: artifact.bytes,
      kind: dtcg ? 'dtcg' : ext,
      label: labels[name] ?? (dtcg ? 'DTCG · 交换产物' : name),
    };
  });
  return write('manifest.json', `${JSON.stringify({ ...payload, artifacts }, null, 2)}\n`);
};
