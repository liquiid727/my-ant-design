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

  it('keeps component tokens the registry does not know about', () => {
    const next = validateThemeConfig(
      {
        components: {
          Button: {
            borderRadius: 12,
            unknownToken: 'kept',
          } as Record<string, unknown>,
        },
      },
      defaultTheme,
    );

    expect(next.components.Button?.borderRadius).toBe(12);
    expect((next.components.Button as Record<string, unknown>).unknownToken).toBe('kept');
  });

  it('keeps global tokens outside the registry, so an imported antd theme survives intact', () => {
    const imported = {
      token: {
        colorPrimary: '#0A0A0C',
        colorBgLayout: '#F5F5F7',
        colorText: '#0A0A0C',
        colorBorderSecondary: '#E2E2E8',
        fontFamily: '-apple-system, "PingFang SC", sans-serif',
        fontFamilyCode: '"SF Mono", monospace',
        motionDurationMid: '0.22s',
        motionEaseInOut: 'cubic-bezier(0.2, 0, 0, 1)',
        boxShadow: '0px 14px 34px 0px rgba(10, 10, 12, 0.1)',
      },
    };

    const next = validateThemeConfig(imported, defaultTheme) as unknown as {
      token: Record<string, unknown>;
    };

    Object.entries(imported.token).forEach(([key, value]) => {
      expect(next.token[key]).toBe(value);
    });
  });

  it('keeps component names outside the registry', () => {
    const next = validateThemeConfig(
      {
        components: {
          Table: { headerBg: '#ECECF0' },
          Segmented: { itemSelectedBg: '#17171C' },
        } as Record<string, Record<string, unknown>>,
      },
      defaultTheme,
    ) as unknown as { components: Record<string, Record<string, unknown>> };

    expect(next.components.Table.headerBg).toBe('#ECECF0');
    expect(next.components.Segmented.itemSelectedBg).toBe('#17171C');
  });

  it('drops non-scalar values instead of handing them to ConfigProvider', () => {
    const next = validateThemeConfig(
      {
        token: { colorPrimary: '#123456', nested: { bad: true } } as never,
        components: { Button: { weird: ['a'] } } as never,
      },
      defaultTheme,
    ) as unknown as { token: Record<string, unknown>; components: Record<string, Record<string, unknown>> };

    expect(next.token.nested).toBeUndefined();
    expect(next.components.Button.weird).toBeUndefined();
  });

  it('can opt out of preserving unknown tokens', () => {
    const next = validateThemeConfig(
      { token: { colorBgLayout: '#F5F5F7' } as never },
      defaultTheme,
      { preserveUnknown: false },
    ) as unknown as { token: Record<string, unknown> };

    expect(next.token.colorBgLayout).toBeUndefined();
  });

  it('keeps the imported algorithm', () => {
    expect(validateThemeConfig({ algorithm: 'dark' }, defaultTheme).algorithm).toBe('dark');
    expect(validateThemeConfig({ algorithm: 'nonsense' as never }, defaultTheme).algorithm).toBe(
      defaultTheme.algorithm,
    );
  });
});
