import { describe, expect, it } from 'vitest';
import {
  customThemePresets,
  getThemePreset,
  labThemePresets,
  officialThemePresets,
  themePresetRegistry,
} from './registry';
import { OFFICIAL_SOURCE_COMMIT } from './types';

describe('theme preset registry', () => {
  it('contains the frozen official themes in website order', () => {
    expect(officialThemePresets.map((theme) => theme.id)).toEqual([
      'default',
      'mui',
      'shadcn',
      'bootstrap',
      'cartoon',
      'dark',
      'illustration',
      'glass',
      'geek',
      'lark',
      'blossom',
      'v4',
      'serene',
    ]);
    expect(officialThemePresets.every((theme) => theme.source.commit === OFFICIAL_SOURCE_COMMIT)).toBe(true);
  });

  it('keeps Coffee in the custom group and rejects unknown ids', () => {
    expect(customThemePresets.map((theme) => theme.id)).toEqual(['coffee']);
    expect(() => getThemePreset('missing')).toThrow('Unknown theme preset: missing');
  });

  it('lists the design-lab projections as their own group', () => {
    expect(labThemePresets.map((theme) => theme.id)).toEqual([
      'lab-noir-light',
      'lab-noir-dark',
      'lab-cycling-light',
      'lab-cycling-dark',
      'lab-ledger-light',
      'lab-ledger-dark',
    ]);
    expect(labThemePresets.every((theme) => theme.group === 'lab')).toBe(true);
    expect(labThemePresets.every((theme) => theme.source.commit === 'design-lab')).toBe(true);
  });

  it('exposes each lab projection as a complete ThemeConfig', async () => {
    const sources = await Promise.all(labThemePresets.map((theme) => theme.loadSource()));
    for (const source of sources) {
      const config = JSON.parse(source);
      expect(config.algorithm === 'default' || config.algorithm === 'dark').toBe(true);
      expect(Object.keys(config.token).length).toBeGreaterThan(20);
      expect(config.token.colorPrimary).toMatch(/^#|^rgb/);
    }
  });

  it('has unique ids and loadable runtimes', async () => {
    expect(new Set(themePresetRegistry.map((theme) => theme.id)).size).toBe(themePresetRegistry.length);
    const modules = await Promise.all(themePresetRegistry.map((theme) => theme.loadRuntime()));
    expect(modules.every((module) => typeof module.default === 'function')).toBe(true);
  });

  it('keeps the full component behavior contracts in every official source module', async () => {
    const sources = await Promise.all(officialThemePresets.map((theme) => theme.loadSource()));
    for (const source of sources) {
      expect(source).toContain('button:');
      expect(source).toContain('input:');
      expect(source).toContain('progress:');
      expect(source).toContain('wave:');
    }
  });
});
