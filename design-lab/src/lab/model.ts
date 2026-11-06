import catalogJson from '../generated/catalog.json';
import manifestJson from '../generated/manifest.json';
import qaJson from '../generated/qa.json';
import { themes } from '../generated/tokens';

export type Layer = 'primitive' | 'semantic' | 'brand' | 'product' | 'component' | 'unknown';
export type ThemeName = 'light' | 'dark';

export type CatalogToken = {
  path: string;
  type: string;
  layer: Layer;
  public: boolean;
  alias: string | null;
  description?: string;
  values: Record<string, string>;
  hex: Record<string, string | null>;
};

export type CatalogBrand = {
  id: string;
  label: string;
  latin: string;
  themes: string[];
  counts: { total: number; public: number; byLayer: Record<string, number> };
  tokens: CatalogToken[];
};

type Catalog = { designWidth: number; brands: CatalogBrand[] };

type ContrastResult = {
  id: string;
  fg: string;
  bg: string;
  min: number;
  note: string;
  ratio: number | null;
  pass: boolean;
  fgValue?: string;
  bgValue?: string;
};

type Qa = {
  summary: { pairs: number; failing: number };
  results: Record<string, ContrastResult[]>;
};

type Manifest = {
  permutations: number;
  tokens: { total: number; public: number; byLayer: Record<string, number> };
  darkOverrides: number;
  contrast: { pairs: number; failing: number };
  artifacts: { file: string; name: string; bytes: number; kind: string; label: string }[];
};

export const catalog = catalogJson as unknown as Catalog;
export const qa = qaJson as unknown as Qa;
export const manifest = manifestJson as unknown as Manifest;

export const brands = catalog.brands;
export const themeNames = brands[0].themes as ThemeName[];
export const activeThemes = themes;

export const brandById = (brandId: string): CatalogBrand => brands.find((item) => item.id === brandId) ?? brands[0];

export const valueOf = (brandId: string, path: string, theme: ThemeName): string => {
  const token = brandById(brandId).tokens.find((item) => item.path === path);
  return token?.values?.[theme] ?? '';
};

export const overriddenCount = (brandId: string): number =>
  brandById(brandId).tokens.filter((token) => token.public && token.values.light !== token.values.dark).length;

export const bytes = (size: number) => (size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`);

export const LAYER_LABEL: Record<string, string> = {
  primitive: '原始',
  semantic: '语义',
  brand: '品牌',
  product: '产品',
  component: '组件',
  unknown: '未知',
};

export const LAYER_NOTE: Record<string, string> = {
  primitive: '色阶与刻度，业务不可引用',
  semantic: '用途语义，品牌覆盖的唯一入口',
  brand: '品牌包，只覆盖白名单',
  product: '骑行专有语义',
  component: '组件私有变量',
  unknown: '未标注',
};
