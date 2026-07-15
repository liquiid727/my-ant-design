import type { ThemeConfig, ThemeOverrides } from '../../types';

export const serializeThemeContext = (
  activePresetId: string,
  overrides: ThemeOverrides,
  currentTheme?: Partial<ThemeConfig>,
): string => {
  const hasTokenOverrides = overrides.token && Object.keys(overrides.token).length > 0;
  const hasComponentOverrides = overrides.components && Object.keys(overrides.components).length > 0;
  const resolved = currentTheme
    ? {
        algorithm: currentTheme.algorithm,
        token: {
          colorPrimary: currentTheme.token?.colorPrimary,
          colorBgBase: currentTheme.token?.colorBgBase,
          colorTextBase: currentTheme.token?.colorTextBase,
          borderRadiusXS: currentTheme.token?.borderRadiusXS,
          borderRadiusSM: currentTheme.token?.borderRadiusSM,
          borderRadius: currentTheme.token?.borderRadius,
          borderRadiusLG: currentTheme.token?.borderRadiusLG,
        },
        components: {
          Button: currentTheme.components?.Button,
          Card: currentTheme.components?.Card,
        },
      }
    : undefined;

  if (!hasTokenOverrides && !hasComponentOverrides) {
    return `Current theme state: ${JSON.stringify({ preset: activePresetId, overrides: {}, resolved })}`;
  }

  const parts: Record<string, unknown> = {};
  if (hasTokenOverrides) parts.token = overrides.token;
  if (hasComponentOverrides) parts.components = overrides.components;

  return `Current theme state: ${JSON.stringify({ preset: activePresetId, overrides: parts, resolved })}`;
};
