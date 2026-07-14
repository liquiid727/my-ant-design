import { describe, expect, it } from 'vitest';
import {
  customThemePresets,
  getThemePreset,
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

  it('has unique ids and loadable runtimes', async () => {
    expect(new Set(themePresetRegistry.map((theme) => theme.id)).size).toBe(themePresetRegistry.length);
    const modules = await Promise.all(themePresetRegistry.map((theme) => theme.loadRuntime()));
    expect(modules.every((module) => typeof module.default === 'function')).toBe(true);
  });

  it('keeps the full component behavior contracts in every source module', async () => {
    const sources = await Promise.all(themePresetRegistry.map((theme) => theme.loadSource()));
    for (const source of sources) {
      expect(source).toContain('button:');
      expect(source).toContain('input:');
      expect(source).toContain('progress:');
      expect(source).toContain('wave:');
    }
  });
});
