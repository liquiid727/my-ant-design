import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '../services/theme/presets';

describe('themeStore V2 session', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('migrates an unchanged built-in V1 theme without creating overrides', async () => {
    localStorage.setItem('ts_current_theme', JSON.stringify(defaultTheme));
    const { useThemeStore } = await import('./themeStore');
    const state = useThemeStore.getState();

    expect(state.activePresetId).toBe('default');
    expect(state.mode).toBe('preset');
    expect(state.overrides.token).toEqual({});
    expect(state.overrides.components).toEqual({});
    expect(JSON.parse(localStorage.getItem('ts_theme_session_v2') ?? '{}').schemaVersion).toBe(2);
  });

  it('persists token overrides and reset clears them without changing the preset', async () => {
    const { useThemeStore } = await import('./themeStore');
    useThemeStore.getState().setPreset('mui');
    useThemeStore.getState().setToken('colorPrimary', '#123456');

    expect(useThemeStore.getState().activePresetId).toBe('mui');
    expect(useThemeStore.getState().overrides.token?.colorPrimary).toBe('#123456');

    useThemeStore.getState().resetTheme();
    expect(useThemeStore.getState().activePresetId).toBe('mui');
    expect(useThemeStore.getState().overrides).toEqual({});
  });

  it('treats an unknown V1 theme as custom on the default runtime', async () => {
    localStorage.setItem(
      'ts_current_theme',
      JSON.stringify({ ...defaultTheme, id: 'imported', name: 'Imported', token: { colorPrimary: '#abcdef' } }),
    );
    const { useThemeStore } = await import('./themeStore');
    const state = useThemeStore.getState();

    expect(state.activePresetId).toBe('default');
    expect(state.mode).toBe('custom');
    expect(state.overrides.token?.colorPrimary).toBe('#abcdef');
  });
});
