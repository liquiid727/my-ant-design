import changesJson from '../generated/changes.json';
import ledgerCatalogJson from '../generated/catalog.ledger.json';
import rideCatalogJson from '../generated/catalog.ride.json';
import manifestJson from '../generated/manifest.json';
import qaLedgerJson from '../generated/qa.ledger.json';
import qaRideJson from '../generated/qa.ride.json';

export const themeNames: ThemeName[] = ['light', 'dark'];

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
  /** 首页示例默认展示的品牌（当前是 Noir）。 */
  featured?: boolean;
  themes: string[];
  counts: { total: number; public: number; byLayer: Record<string, number> };
  tokens: CatalogToken[];
};

export type CatalogApp = {
  app: string;
  appLabel: string;
  appLatin: string;
  designWidth: number;
  brands: CatalogBrand[];
};

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
  app: string;
  summary: { pairs: number; failing: number };
  results: Record<string, ContrastResult[]>;
};

type Manifest = {
  permutations: number;
  apps: {
    id: string;
    label: string;
    brands: number;
    themes: number;
    tokens: { total: number; public: number; byLayer: Record<string, number> };
    darkOverrides: number;
  }[];
  contrast: { pairs: number; failing: number };
  artifacts: { file: string; name: string; app: string | null; bytes: number; kind: string; label: string }[];
};

export const manifest = manifestJson as unknown as Manifest;

export type ArtifactChange = {
  name: string;
  status: 'added' | 'modified' | 'deleted';
  added: number | null;
  removed: number | null;
};

type Changes = {
  available: boolean;
  files: ArtifactChange[];
  summary: { changed: number; added: number; removed: number };
};

/** 本次编译相对 HEAD 改了哪些产物（提交后归零，属本地视图）。 */
export const changes = changesJson as unknown as Changes;

const baseName = (value: string) => value.split('/').pop() ?? value;

/** 产物在 changes.json 里带相对目录（dtcg/…），这里按文件名匹配。 */
export const changeOf = (name: string): ArtifactChange | undefined =>
  changes.files.find((file) => file.name === name || baseName(file.name) === baseName(name));

const catalogs = [rideCatalogJson, ledgerCatalogJson] as unknown as CatalogApp[];
const qaByApp: Record<string, Qa> = {
  ride: qaRideJson as unknown as Qa,
  ledger: qaLedgerJson as unknown as Qa,
};

export const apps = catalogs.map((catalog) => ({
  id: catalog.app,
  label: catalog.appLabel,
  latin: catalog.appLatin,
  brands: catalog.brands,
}));

export type AppEntry = (typeof apps)[number];

export const appById = (appId: string): CatalogApp =>
  catalogs.find((catalog) => catalog.app === appId) ?? catalogs[0];

export const appLabel = (appId: string): string => appById(appId).appLabel;

export const brandsOf = (appId: string): CatalogBrand[] => appById(appId).brands;

export const brandById = (appId: string, brandId: string): CatalogBrand => {
  const list = brandsOf(appId);
  return list.find((brand) => brand.id === brandId) ?? list[0];
};

export const qaFor = (appId: string): Qa => qaByApp[appId] ?? qaByApp.ride;

export const breakpointsOf = (appId: string): { tablet: number; wide: number } => {
  const firstBrand = brandsOf(appId)[0].id;
  const read = (tokenPath: string, fallback: number) => {
    const parsed = parseFloat(valueOf(appId, firstBrand, tokenPath, 'light'));
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return { tablet: read('layout.breakpoint.tablet', 600), wide: read('layout.breakpoint.wide', 900) };
};

export const valueOf = (appId: string, brandId: string, path: string, theme: ThemeName): string => {
  const token = brandById(appId, brandId).tokens.find((item) => item.path === path);
  return token?.values?.[theme] ?? '';
};

export const overriddenCount = (appId: string, brandId: string): number =>
  brandById(appId, brandId).tokens.filter((token) => token.public && token.values.light !== token.values.dark).length;

export const bytes = (size: number) => (size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`);

export const perAppArtifacts = (appId: string) => manifest.artifacts.filter((artifact) => artifact.app === appId);


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
  product: '本产品专有语义',
  component: '组件私有变量',
  unknown: '未标注',
};
