import antDesignIcon from './assets/ant-design.svg';
import blossomIcon from './assets/blossom-icon.svg';
import bootstrapIcon from './assets/bootstrap-icon.png';
import cartoonIcon from './assets/cartoon-icon.svg';
import darkIcon from './assets/dark-icon.svg';
import geekIcon from './assets/geek-icon.svg';
import glassIcon from './assets/glass-icon.svg';
import illustrationIcon from './assets/illustration-icon.svg';
import larkIcon from './assets/lark-icon.svg';
import muiIcon from './assets/mui-icon.png';
import shadcnIcon from './assets/shadcn-icon.png';
import v4Icon from './assets/v4-icon.svg';
import defaultBackground from './assets/default-bg.jpg';
import blossomBackground from './assets/blossom-bg.webp';
import cartoonBackground from './assets/cartoon-bg.jpg';
import darkBackground from './assets/dark-bg.jpg';
import geekBackground from './assets/geek-bg.jpg';
import illustrationBackground from './assets/illustration-bg.jpg';
import larkBackground from './assets/lark-bg.webp';
import muiBackground from './assets/mui-bg.jpg';
import shadcnBackground from './assets/shadcn-bg.jpg';
import coffeeIcon from '../assets/theme-icons/coffee.png';
import { SereneIcon } from './official/SereneIcon';
import { OFFICIAL_SOURCE_COMMIT } from './types';
import type { ThemePresetDefinition } from './types';
import { runtimeLoader } from './runtime';

const source = (path: string) => ({ commit: OFFICIAL_SOURCE_COMMIT, path });
const raw = (loader: () => Promise<{ default: string }>) => () => loader().then((module) => module.default);
const officialPath = '.dumi/pages/index/components/ThemePreview/previewThemes/';

const registry = [
  {
    id: 'default', group: 'official', order: 0, name: 'Ant Design', style: 'Ant Design 6',
    icon: antDesignIcon, scene: { background: defaultBackground },
    source: source(`${officialPath}index.ts`),
    loadRuntime: runtimeLoader('default', 'Ant Design', () => import('./baseTheme').then((m) => ({ default: m.useDefaultTheme }))),
    loadSource: raw(() => import('./baseTheme.ts?raw')),
  },
  {
    id: 'mui', group: 'official', order: 1, name: 'MUI', style: 'Material UI', icon: muiIcon,
    scene: { background: muiBackground }, source: source(`${officialPath}muiTheme.ts`),
    loadRuntime: runtimeLoader('mui', 'MUI', () => import('./official/muiTheme')),
    loadSource: raw(() => import('./official/muiTheme.ts?raw')),
  },
  {
    id: 'shadcn', group: 'official', order: 2, name: 'shadcn', style: 'Neutral modern', icon: shadcnIcon,
    scene: { background: shadcnBackground }, source: source(`${officialPath}shadcnTheme.ts`),
    loadRuntime: runtimeLoader('shadcn', 'shadcn', () => import('./official/shadcnTheme')),
    loadSource: raw(() => import('./official/shadcnTheme.ts?raw')),
  },
  {
    id: 'bootstrap', group: 'official', order: 3, name: 'Bootstrap', style: 'Classic web', icon: bootstrapIcon,
    scene: { background: 'linear-gradient(180deg, #ffffff 0%, #F5F8FF 100%)' }, source: source(`${officialPath}bootstrapTheme.ts`),
    loadRuntime: runtimeLoader('bootstrap', 'Bootstrap', () => import('./official/bootstrapTheme')),
    loadSource: raw(() => import('./official/bootstrapTheme.ts?raw')),
  },
  {
    id: 'cartoon', group: 'official', order: 4, name: 'Cartoon', style: 'Playful', icon: cartoonIcon,
    scene: { background: cartoonBackground }, source: source(`${officialPath}cartoonTheme.ts`),
    loadRuntime: runtimeLoader('cartoon', 'Cartoon', () => import('./official/cartoonTheme')),
    loadSource: raw(() => import('./official/cartoonTheme.ts?raw')),
  },
  {
    id: 'dark', group: 'official', order: 5, name: 'Dark', style: 'Ant dark', icon: darkIcon,
    scene: { background: darkBackground, dark: true }, source: source(`${officialPath}index.ts`),
    loadRuntime: runtimeLoader('dark', 'Dark', () => import('./baseTheme').then((m) => ({ default: m.useDarkTheme }))),
    loadSource: raw(() => import('./baseTheme.ts?raw')),
  },
  {
    id: 'illustration', group: 'official', order: 6, name: 'Illustration', style: 'Outlined green', icon: illustrationIcon,
    scene: { background: illustrationBackground }, source: source(`${officialPath}illustrationTheme.ts`),
    loadRuntime: runtimeLoader('illustration', 'Illustration', () => import('./official/illustrationTheme')),
    loadSource: raw(() => import('./official/illustrationTheme.ts?raw')),
  },
  {
    id: 'glass', group: 'official', order: 7, name: 'Glass', style: 'Translucent', icon: glassIcon,
    scene: { background: 'linear-gradient(180deg, #ffffff 0%, #F5F8FF 100%)' }, source: source(`${officialPath}glassTheme.ts`),
    loadRuntime: runtimeLoader('glass', 'Glass', () => import('./official/glassTheme')),
    loadSource: raw(() => import('./official/glassTheme.ts?raw')),
  },
  {
    id: 'geek', group: 'official', order: 8, name: 'Geek', style: 'Terminal dark', icon: geekIcon,
    scene: { background: geekBackground, dark: true }, source: source(`${officialPath}geekTheme.ts`),
    loadRuntime: runtimeLoader('geek', 'Geek', () => import('./official/geekTheme')),
    loadSource: raw(() => import('./official/geekTheme.ts?raw')),
  },
  {
    id: 'lark', group: 'official', order: 9, name: 'Document', style: 'Knowledge app', icon: larkIcon,
    scene: { background: larkBackground }, source: source(`${officialPath}larkTheme.ts`),
    loadRuntime: runtimeLoader('lark', 'Document', () => import('./official/larkTheme')),
    loadSource: raw(() => import('./official/larkTheme.ts?raw')),
  },
  {
    id: 'blossom', group: 'official', order: 10, name: 'Blossom', style: 'Warm pink', icon: blossomIcon,
    scene: { background: blossomBackground }, source: source(`${officialPath}blossomTheme.ts`),
    loadRuntime: runtimeLoader('blossom', 'Blossom', () => import('./official/blossomTheme')),
    loadSource: raw(() => import('./official/blossomTheme.ts?raw')),
  },
  {
    id: 'v4', group: 'official', order: 11, name: 'Ant Design V4', style: 'Ant Design 4', icon: v4Icon,
    scene: { background: 'linear-gradient(180deg, #ffffff 0%, #F5F8FF 100%)' }, source: source(`${officialPath}v4Theme.ts`),
    loadRuntime: runtimeLoader('v4', 'Ant Design V4', () => import('./official/v4Theme')),
    loadSource: raw(() => import('./official/v4Theme.ts?raw')),
  },
  {
    id: 'serene', group: 'official', order: 12, name: 'Serene', style: 'Warm neutral', icon: SereneIcon,
    scene: { background: 'linear-gradient(180deg, #ffffff 0%, #F5F8FF 100%)' }, source: source(`${officialPath}sereneTheme.ts`),
    loadRuntime: runtimeLoader('serene', 'Serene', () => import('./official/sereneTheme')),
    loadSource: raw(() => import('./official/sereneTheme.ts?raw')),
  },
  {
    id: 'coffee', group: 'custom', order: 100, name: 'Coffee', style: 'Custom warm neutral', icon: coffeeIcon,
    scene: { background: 'linear-gradient(180deg, #fcfaf8 0%, #f3eee8 100%)' },
    source: source('local/custom/coffee'),
    loadRuntime: runtimeLoader('coffee', 'Coffee', () => import('./baseTheme').then((m) => ({ default: m.useCoffeeTheme }))),
    loadSource: raw(() => import('./baseTheme.ts?raw')),
  },
] satisfies ThemePresetDefinition[];

export const themePresetRegistry: ThemePresetDefinition[] = registry.sort((a, b) => a.order - b.order);

const duplicateIds = themePresetRegistry.filter(
  (item, index) => themePresetRegistry.findIndex((candidate) => candidate.id === item.id) !== index,
);
if (duplicateIds.length) throw new Error(`Duplicate theme preset ids: ${duplicateIds.map((item) => item.id).join(', ')}`);

export const officialThemePresets = themePresetRegistry.filter((item) => item.group === 'official');
export const customThemePresets = themePresetRegistry.filter((item) => item.group === 'custom');

export const getThemePreset = (id: string) => {
  const preset = themePresetRegistry.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown theme preset: ${id}`);
  return preset;
};

export const prefetchThemePreset = (id: string) => getThemePreset(id).loadRuntime();
