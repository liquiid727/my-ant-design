import { theme as antdTheme } from 'antd';
import { describe, expect, it } from 'vitest';
import type { ThemeConfig } from '../types';
import { buildStudioChromeTheme, isDarkTheme } from './studioChrome';

const makeTheme = (overrides: Partial<ThemeConfig> = {}): ThemeConfig => ({
  id: 'test',
  name: 'Test',
  algorithm: 'default',
  token: {},
  components: {},
  updatedAt: '2026-11-05',
  ...overrides,
});

describe('isDarkTheme', () => {
  it('detects the dark algorithms', () => {
    expect(isDarkTheme('dark')).toBe(true);
    expect(isDarkTheme('darkCompact')).toBe(true);
    expect(isDarkTheme('default')).toBe(false);
    expect(isDarkTheme('compact')).toBe(false);
  });
});

describe('buildStudioChromeTheme', () => {
  it('maps the algorithm name to the antd algorithm', () => {
    expect(buildStudioChromeTheme(makeTheme({ algorithm: 'dark' })).algorithm).toBe(antdTheme.darkAlgorithm);
    expect(buildStudioChromeTheme(makeTheme({ algorithm: 'compact' })).algorithm).toBe(antdTheme.compactAlgorithm);
    expect(buildStudioChromeTheme(makeTheme({ algorithm: 'darkCompact' })).algorithm).toEqual([
      antdTheme.darkAlgorithm,
      antdTheme.compactAlgorithm,
    ]);
    expect(buildStudioChromeTheme(makeTheme()).algorithm).toBe(antdTheme.defaultAlgorithm);
  });

  it('carries the brand tokens that shape the shell', () => {
    const theme = buildStudioChromeTheme(
      makeTheme({ token: { colorPrimary: '#00b96b', borderRadius: 12, fontFamily: 'Inter' } }),
    );

    expect(theme.token).toEqual({ colorPrimary: '#00b96b', borderRadius: 12, fontFamily: 'Inter' });
  });

  it('never forwards neutral colours, so the shell keeps its contrast', () => {
    const theme = buildStudioChromeTheme(
      makeTheme({ token: { colorBgBase: '#ff0000', colorTextBase: '#00ff00', colorPrimary: '#123456' } }),
    );

    expect(theme.token).toEqual({ colorPrimary: '#123456' });
    expect(theme.components).toBeUndefined();
  });
});
