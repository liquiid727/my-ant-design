import { theme } from 'antd';
import type { ThemeConfig } from '../../types';

export type PresetTheme = {
  id: string;
  name: string;
  style: string;
  primaryColor: string;
  icon: string;
  config: ThemeConfig;
};

const now = () => new Date().toISOString();

const makePreset = (
  id: string,
  name: string,
  style: string,
  primaryColor: string,
  algorithm: ThemeConfig['algorithm'],
  token: ThemeConfig['token'],
  components: ThemeConfig['components'] = {},
): PresetTheme => ({
  id,
  name,
  style,
  primaryColor,
  icon: name.slice(0, 2),
  config: {
    id,
    name,
    algorithm,
    token: { colorPrimary: primaryColor, ...token },
    components,
    updatedAt: now(),
  },
});

export const presetThemes: PresetTheme[] = [
  makePreset('default', 'Default', 'Ant Design 5', '#1677FF', 'default', {
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
    fontSize: 14,
  }, {
    Button: { borderRadius: 4 },
    Card: { borderRadiusLG: 8 },
    Input: { borderRadius: 6 },
  }),
  makePreset('mui', 'MUI', 'Material UI', '#1976d2', 'default', {
    colorInfo: '#0288d1',
    colorTextBase: '#212121',
    borderRadius: 4,
    fontSize: 14,
    boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
  }, {
    Button: {
      fontWeight: 500,
      borderRadius: 2,
      primaryShadow:
        '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
    },
    Card: { borderRadiusLG: 6 },
    Input: { borderRadius: 4 },
  }),
  makePreset('shadcn', 'Shadcn', 'Neutral modern', '#18181b', 'default', {
    colorSuccess: '#16a34a',
    colorWarning: '#ca8a04',
    colorError: '#dc2626',
    colorBgBase: '#ffffff',
    colorTextBase: '#18181b',
    borderRadius: 6,
  }, {
    Button: { fontWeight: 500, borderRadius: 6, primaryShadow: 'none' },
    Card: { borderRadiusLG: 14 },
    Input: { borderRadius: 6, activeBorderColor: '#18181b', hoverBorderColor: '#18181b' },
  }),
  makePreset('bootstrap', 'Bootstrap', 'Classic web', '#0d6efd', 'default', {
    colorSuccess: '#198754',
    colorWarning: '#ffc107',
    colorError: '#dc3545',
    borderRadius: 4,
  }, {
    Button: { borderRadius: 4, primaryShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' },
    Card: { borderRadiusLG: 6 },
    Input: { borderRadius: 4 },
  }),
  makePreset('cartoon', 'Cartoon', 'Playful', '#225555', 'default', {
    colorSuccess: '#6ab04c',
    colorWarning: '#f9ca24',
    colorError: '#eb4d4b',
    colorBgBase: '#bbaa99',
    colorTextBase: '#51463b',
    borderRadius: 18,
    fontSize: 14,
  }, {
    Button: { borderRadius: 18, controlHeight: 36, primaryShadow: 'none' },
    Card: { borderRadiusLG: 18, colorBgContainer: '#bbaa99' },
    Input: { borderRadius: 18, activeBorderColor: '#225555', hoverBorderColor: '#225555' },
  }),
  makePreset('dark', 'Dark', 'Ant dark', '#1677FF', 'dark', {
    colorBgBase: '#141414',
    colorTextBase: '#f5f5f5',
    borderRadius: 6,
  }, {
    Button: { borderRadius: 4 },
    Card: { borderRadiusLG: 8, colorBgContainer: '#141414' },
    Input: { borderRadius: 6 },
  }),
  makePreset('illustration', 'Illustration', 'Outlined green', '#52C41A', 'default', {
    colorTextBase: '#2c2c2c',
    colorBgBase: '#fff0f6',
    colorWarning: '#faad14',
    colorError: '#ff7875',
    borderRadius: 16,
    lineWidth: 2,
    fontSize: 15,
  }, {
    Button: { borderRadius: 8, fontWeight: 600, primaryShadow: '4px 4px 0 #2c2c2c' },
    Card: { borderRadiusLG: 16, colorBgContainer: '#fff0f6' },
    Input: { borderRadius: 12 },
  }),
  makePreset('glass', 'Glass', 'Translucent', '#1677FF', 'default', {
    colorBgBase: '#f8fbff',
    colorTextBase: '#0f172a',
    borderRadius: 12,
    boxShadow:
      '0 8px 24px rgba(85,85,85,0.1), inset 0 0 5px 2px rgba(255,255,255,0.3), inset 0 5px 2px rgba(255,255,255,0.2)',
  }, {
    Button: {
      borderRadius: 12,
      primaryShadow:
        '0 8px 24px rgba(85,85,85,0.1), inset 0 0 5px 2px rgba(255,255,255,0.3), inset 0 5px 2px rgba(255,255,255,0.2)',
    },
    Card: { borderRadiusLG: 12, colorBgContainer: 'rgba(255,255,255,0.4)' },
    Input: { borderRadius: 12 },
  }),
  makePreset('geek', 'Geek', 'Terminal dark', '#33dc14', 'dark', {
    colorBgBase: '#141414',
    colorTextBase: '#39ff14',
    colorSuccess: '#39ff14',
    colorWarning: '#facc15',
    colorError: '#fb7185',
    borderRadius: 0,
    fontSize: 14,
  }, {
    Button: { borderRadius: 0, fontWeight: 700, primaryShadow: '0 0 3px #33dc14, inset 0 0 10px #33dc14' },
    Card: { borderRadiusLG: 0, colorBgContainer: '#141414' },
    Input: { borderRadius: 0, activeBorderColor: '#33dc14', hoverBorderColor: '#33dc14' },
  }),
  makePreset('lark', 'Lark', 'Knowledge app', '#00B96B', 'default', {
    colorSuccess: '#00B96B',
    colorWarning: '#ffb020',
    colorError: '#f54a45',
    colorInfo: '#3370ff',
    borderRadius: 4,
  }, {
    Button: { borderRadius: 4 },
    Card: { borderRadiusLG: 4 },
    Input: { borderRadius: 4 },
  }),
  makePreset('blossom', 'Blossom', 'Warm pink', '#ED4192', 'default', {
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorBgBase: '#fff7fb',
    borderRadius: 16,
  }, {
    Button: { borderRadius: 8 },
    Card: { borderRadiusLG: 16 },
    Input: { borderRadius: 16 },
  }),
  makePreset('v4', 'V4', 'Ant Design 4', '#1890ff', 'default', {
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 2,
    fontSize: 14,
  }, {
    Button: { borderRadius: 2 },
    Card: { borderRadiusLG: 2 },
    Input: { borderRadius: 2 },
  }),
  makePreset('coffee', 'Coffee', 'Warm neutral', '#312721', 'default', {
    colorBgBase: '#fcfaf8',
    colorTextBase: '#2a231d',
    colorSuccess: '#6f8f5f',
    colorWarning: '#b7791f',
    colorError: '#b94a48',
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'Inter, -apple-system, system-ui, Segoe UI, sans-serif',
  }, {
    Button: { borderRadius: 4, fontWeight: 500, primaryShadow: 'none' },
    Card: { borderRadiusLG: 4, colorBgContainer: '#fcfaf8' },
    Input: { borderRadius: 4, activeBorderColor: '#312721', hoverBorderColor: '#312721' },
  }),
];

export const defaultTheme = presetThemes[0].config;

export const getPreset = (id: string) => presetThemes.find((preset) => preset.id === id);

export const resolveAlgorithm = (algorithm: ThemeConfig['algorithm']) => {
  if (algorithm === 'dark') return theme.darkAlgorithm;
  if (algorithm === 'compact') return theme.compactAlgorithm;
  if (algorithm === 'darkCompact') return [theme.darkAlgorithm, theme.compactAlgorithm];
  return theme.defaultAlgorithm;
};
