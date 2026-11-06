/**
 * 管线配置：三个维度——app（产品语义）× brand（视觉身份）× theme（明暗）。
 * 唯一一处声明"哪些文件组成一个排列"。
 */
export const DESIGN_WIDTH = 375;

const CORE = 'pipeline/tokens/core';

/** 产品：决定业务语义（route / transaction …）与页面契约。 */
export const APPS = [
  {
    id: 'ride',
    label: '骑行',
    latin: 'Ride Atlas',
    description: '路线规划、骑行记录、成就与明信片。',
    product: ['apps/ride/tokens/product.tokens.json'],
    contracts: 'apps/ride/contracts',
  },
  {
    id: 'ledger',
    label: '记账',
    latin: 'Ledger',
    description: '月度账目、分类预算、流水明细。',
    product: ['apps/ledger/tokens/product.tokens.json'],
    contracts: 'apps/ledger/contracts',
  },
];

/** 品牌：只决定视觉身份（颜色 / 字体 / 圆角 / 阴影 / 缓动）。 */
export const BRANDS = [
  {
    id: 'noir',
    label: 'Noir',
    latin: 'Noir',
    description: '纯黑 + 冷白 + 玻璃卡 + 胶囊圆角，站点外壳的暗黑设计感。',
    featured: true,
    brand: ['brands/noir/tokens/brand.tokens.json'],
    themes: {
      light: [],
      dark: [`${CORE}/themes/dark.tokens.json`, 'brands/noir/tokens/dark.tokens.json'],
    },
  },
  {
    id: 'cycling',
    label: '骑行',
    latin: 'Ride Atlas',
    description: '暖米白 + 柠檬绿 + 宋体，自然杂志感。',
    brand: ['brands/cycling/tokens/brand.tokens.json'],
    themes: {
      light: [],
      dark: [`${CORE}/themes/dark.tokens.json`, 'brands/cycling/tokens/dark.tokens.json'],
    },
  },
  {
    id: 'ledger',
    label: '记账',
    latin: 'Ledger',
    description: '冷白 + 砖红 + 无衬线 + 小圆角。',
    brand: ['brands/ledger/tokens/brand.tokens.json'],
    themes: {
      light: [],
      dark: [`${CORE}/themes/dark.tokens.json`, 'brands/ledger/tokens/dark.tokens.json'],
    },
  },
];

/** 与产品、品牌都无关的层。 */
export const SHARED = {
  primitive: [`${CORE}/primitive.tokens.json`],
  semantic: [`${CORE}/semantic.tokens.json`, `${CORE}/layout.tokens.json`],
  component: ['pipeline/tokens/component/component.tokens.json'],
};

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
