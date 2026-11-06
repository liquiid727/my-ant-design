import type { ThemeConfig } from '../types';
import { labThemeConfigs } from './lab';
import { LabIcon } from './LabIcon';
import { createStaticRuntime } from './staticRuntime';
import type { ThemePresetDefinition } from './types';

/** 品牌场景底：noir 是暗的，其余按各自的气温给一个中性渐变。 */
const SCENES: Record<string, string> = {
  noir: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
  cycling: 'linear-gradient(180deg, #FBF7EF 0%, #F1E8D6 100%)',
  ledger: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1F4 100%)',
};

const DARK_SCENE = 'linear-gradient(180deg, #0E0E11 0%, #000000 100%)';

/** noir 是这套系统的第一个切片，排在前面。 */
const BRAND_ORDER = ['noir', 'cycling', 'ledger'];
const THEME_ORDER = ['light', 'dark'];

const byBrandThenTheme = (a: ThemeConfig, b: ThemeConfig) => {
  const [aBrand, aTheme] = a.id.split('.');
  const [bBrand, bTheme] = b.id.split('.');
  const brandDelta = (BRAND_ORDER.indexOf(aBrand) + 1 || 99) - (BRAND_ORDER.indexOf(bBrand) + 1 || 99);
  if (brandDelta !== 0) return brandDelta;
  return THEME_ORDER.indexOf(aTheme) - THEME_ORDER.indexOf(bTheme);
};

const configs = ([...labThemeConfigs] as unknown as ThemeConfig[]).sort(byBrandThenTheme);

/**
 * design-lab 的品牌投影。它们是「另一种主题来源」，和官方主题并列，
 * 不替换任何现有预设；在这里编辑只会产生 studio 本地的 overrides。
 */
export const labThemePresets: ThemePresetDefinition[] = configs.map((config, index) => {
  const [brand] = config.id.split('.');
  const dark = config.algorithm === 'dark';

  return {
    id: `lab-${config.id.replace(/\./g, '-')}`,
    group: 'lab',
    order: 20 + index,
    name: config.name,
    style: `design-lab · ${brand}`,
    icon: LabIcon,
    scene: { background: dark ? DARK_SCENE : (SCENES[brand] ?? SCENES.ledger), dark },
    source: { commit: 'design-lab', path: `src/generated/antd/${config.id}.json` },
    loadRuntime: async () => ({ default: createStaticRuntime(config) }),
    loadSource: async () => JSON.stringify(config, null, 2),
  };
});
