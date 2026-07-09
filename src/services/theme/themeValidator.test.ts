import { describe, expect, it } from 'vitest';
import { defaultTheme } from './presets';
import { validateThemeConfig } from './themeValidator';

describe('validateThemeConfig', () => {
  it('keeps valid token values', () => {
    const next = validateThemeConfig(
      {
        token: {
          colorPrimary: '#ff0000',
          borderRadius: 20,
        },
      },
      defaultTheme,
    );

    expect(next.token.colorPrimary).toBe('#ff0000');
    expect(next.token.borderRadius).toBe(20);
  });

  it('falls back on invalid colors and clamps numbers', () => {
    const next = validateThemeConfig(
      {
        token: {
          colorPrimary: 'red',
          borderRadius: 999,
        },
      },
      defaultTheme,
    );

    expect(next.token.colorPrimary).toBe(defaultTheme.token.colorPrimary);
    expect(next.token.borderRadius).toBe(32);
  });

  it('strips unknown component token keys', () => {
    const next = validateThemeConfig(
      {
        components: {
          Button: {
            borderRadius: 12,
            unknownToken: 'bad',
          } as Record<string, unknown>,
        },
      },
      defaultTheme,
    );

    expect(next.components.Button?.borderRadius).toBe(12);
    expect('unknownToken' in (next.components.Button ?? {})).toBe(false);
  });
});
