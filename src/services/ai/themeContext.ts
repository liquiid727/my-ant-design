import type { ThemeOverrides } from '../../types';

export const serializeThemeContext = (
  activePresetId: string,
  overrides: ThemeOverrides,
): string => {
  const hasTokenOverrides = overrides.token && Object.keys(overrides.token).length > 0;
  const hasComponentOverrides = overrides.components && Object.keys(overrides.components).length > 0;

  if (!hasTokenOverrides && !hasComponentOverrides) {
    return `Current theme state: { preset: "${activePresetId}", overrides: {} }`;
  }

  const parts: Record<string, unknown> = {};
  if (hasTokenOverrides) parts.token = overrides.token;
  if (hasComponentOverrides) parts.components = overrides.components;

  return `Current theme state: { preset: "${activePresetId}", overrides: ${JSON.stringify(parts)} }`;
};
