import { theme as antdTheme } from 'antd';
import type { ThemeConfig as AntThemeConfig } from 'antd';
import type { ThemeAlgorithmName, ThemeConfig } from '../types';

/**
 * The studio shell (header, library, settings, drawer, about, square) is built
 * from the same Ant Design tokens as the previewed theme. Only the brand-shaping
 * tokens are carried over; neutrals stay with the algorithm so the shell never
 * loses contrast, even for a theme with an unusual `colorBgBase`.
 */
const algorithmFor = (name: ThemeAlgorithmName): AntThemeConfig['algorithm'] => {
  switch (name) {
    case 'dark':
      return antdTheme.darkAlgorithm;
    case 'compact':
      return antdTheme.compactAlgorithm;
    case 'darkCompact':
      return [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm];
    default:
      return antdTheme.defaultAlgorithm;
  }
};

const BRAND_TOKEN_KEYS = [
  'colorPrimary',
  'colorInfo',
  'colorSuccess',
  'colorWarning',
  'colorError',
  'borderRadius',
  'borderRadiusLG',
  'borderRadiusSM',
  'fontFamily',
  'fontSize',
  'boxShadow',
] as const;

export const isDarkTheme = (name: ThemeAlgorithmName) => name === 'dark' || name === 'darkCompact';

export const buildStudioChromeTheme = (source: ThemeConfig): AntThemeConfig => {
  const token: Record<string, unknown> = {};

  BRAND_TOKEN_KEYS.forEach((key) => {
    const value = source.token?.[key];
    if (value !== undefined && value !== null && value !== '') token[key] = value;
  });

  return {
    algorithm: algorithmFor(source.algorithm),
    token,
  };
};
