/**
 * 管线配置：唯一一处声明"哪些文件组成一个品牌、一套主题"。
 * 顺序即优先级，后者覆盖前者。
 */
export const DESIGN_WIDTH = 375;

const CORE = 'pipeline/tokens/core';

export const BRANDS = [
  {
    id: 'cycling',
    label: '骑行',
    latin: 'Ride Atlas',
    description: '以骑行为参考实例验证整条管线的品牌包。',
    layers: {
      primitive: [`${CORE}/primitive.tokens.json`],
      semantic: [`${CORE}/semantic.tokens.json`],
      brand: ['cycling/tokens/brand.tokens.json'],
      product: ['cycling/tokens/product.tokens.json'],
      component: ['pipeline/tokens/component/component.tokens.json'],
    },
    themes: {
      light: [],
      dark: [`${CORE}/themes/dark.tokens.json`, 'cycling/tokens/dark.tokens.json'],
    },
  },
  {
    id: 'ledger',
    label: '记账',
    latin: 'Ledger',
    description: '第二个品牌包：与骑行视觉相反，只换品牌，不碰组件与页面结构。',
    layers: {
      primitive: [`${CORE}/primitive.tokens.json`],
      semantic: [`${CORE}/semantic.tokens.json`],
      brand: ['ledger/tokens/brand.tokens.json'],
      // 同一产品的第二个品牌包（白标）：产品语义沿用骑行，不新增业务词。
      product: ['cycling/tokens/product.tokens.json'],
      component: ['pipeline/tokens/component/component.tokens.json'],
    },
    themes: {
      light: [],
      dark: [`${CORE}/themes/dark.tokens.json`, 'ledger/tokens/dark.tokens.json'],
    },
  },
];

export const THEMES = ['light', 'dark'];

export const OUTPUT_DIR = 'src/generated';

/** 品牌包允许覆盖的键前缀。超出白名单即视为破坏分层。 */
export const BRAND_OVERRIDE_ALLOWLIST = [
  'brand.palette',
  'color.brand',
  'color.surface',
  'color.ink',
  'color.action',
  'color.border',
  'radius.',
  'type.display',
  'type.title',
  'type.metric',
  'elevation',
  'motion.easing',
];

/** 这些前缀下的 token 属于内部原色，不进产物、不允许业务引用。 */
export const PRIVATE_PREFIXES = ['color.ramp', 'brand.palette', 'font.', 'shadow.', 'duration.', 'easing.', 'opacity.', 'border.'];
