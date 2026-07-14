import { create } from 'zustand';
import type { ThemeConfig, ThemeOverrides, ThemeSessionV2 } from '../types';
import { defaultTheme, getPreset as getLegacyPreset } from '../services/theme/presets';
import { StorageService } from '../services/storage';
import { validateThemeConfig } from '../services/theme/themeValidator';
import { getThemePreset, themePresetRegistry } from '../themes/registry';

type ThemeState = {
  currentTheme: ThemeConfig;
  activePresetId: string;
  selectedPresetId: string;
  mode: ThemeSessionV2['mode'];
  overrides: ThemeOverrides;
  setResolvedTheme: (theme: ThemeConfig) => void;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setPreset: (presetId: string) => void;
  setToken: (name: string, value: unknown) => void;
  setComponentToken: (component: string, name: string, value: unknown) => void;
  resetComponent: (component: string) => void;
  resetTheme: () => void;
};

const hasPreset = (id: string) => themePresetRegistry.some((preset) => preset.id === id);

const diffRecord = (current: Record<string, unknown>, baseline: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(current).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(baseline[key])),
  );

const migrateLegacySession = (): { session: ThemeSessionV2; currentTheme: ThemeConfig } => {
  const legacy = StorageService.get<ThemeConfig>('current_theme', defaultTheme);
  const activePresetId = hasPreset(legacy.id) ? legacy.id : 'default';
  const legacyBaseline = getLegacyPreset(legacy.id)?.config;
  const token = diffRecord(
    legacy.token as Record<string, unknown>,
    (legacyBaseline?.token ?? {}) as Record<string, unknown>,
  ) as ThemeConfig['token'];
  const components = diffRecord(
    legacy.components as Record<string, unknown>,
    (legacyBaseline?.components ?? {}) as Record<string, unknown>,
  ) as ThemeConfig['components'];
  const overrides = legacyBaseline ? { token, components } : { token: legacy.token, components: legacy.components };

  return {
    session: {
      schemaVersion: 2,
      activePresetId,
      mode: legacyBaseline && getThemePreset(activePresetId).group === 'official' ? 'preset' : 'custom',
      overrides,
    },
    currentTheme: legacy,
  };
};

const loadInitialState = () => {
  const stored = StorageService.get<ThemeSessionV2 | null>('theme_session_v2', null);
  const legacyTheme = StorageService.get<ThemeConfig>('current_theme', defaultTheme);
  if (stored?.schemaVersion === 2 && hasPreset(stored.activePresetId)) {
    return { session: stored, currentTheme: legacyTheme };
  }
  const migrated = migrateLegacySession();
  StorageService.set('theme_session_v2', migrated.session);
  return migrated;
};

const initial = loadInitialState();

const persistSession = (session: ThemeSessionV2) => StorageService.set('theme_session_v2', session);

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: initial.currentTheme,
  activePresetId: initial.session.activePresetId,
  selectedPresetId: initial.session.activePresetId,
  mode: initial.session.mode,
  overrides: initial.session.overrides,

  setResolvedTheme: (theme) =>
    set((state) => {
      const currentTheme = { ...theme, updatedAt: state.currentTheme.updatedAt };
      StorageService.set('current_theme', currentTheme);
      return { currentTheme };
    }),

  setTheme: (incoming) => {
    const state = get();
    const currentTheme = validateThemeConfig(incoming, state.currentTheme);
    const requestedPreset = incoming.id && hasPreset(incoming.id) ? incoming.id : state.activePresetId;
    const preset = getThemePreset(requestedPreset);
    const mode = incoming.id && !hasPreset(incoming.id) ? 'custom' : preset.group === 'official' ? 'preset' : 'custom';
    const overrides: ThemeOverrides = {
      token: currentTheme.token,
      components: currentTheme.components,
    };
    const session: ThemeSessionV2 = { schemaVersion: 2, activePresetId: requestedPreset, mode, overrides };
    persistSession(session);
    StorageService.set('current_theme', currentTheme);
    set({
      currentTheme,
      activePresetId: requestedPreset,
      selectedPresetId: requestedPreset,
      mode,
      overrides,
    });
  },

  setPreset: (presetId) => {
    const preset = getThemePreset(presetId);
    const session: ThemeSessionV2 = {
      schemaVersion: 2,
      activePresetId: presetId,
      mode: preset.group === 'official' ? 'preset' : 'custom',
      overrides: {},
    };
    persistSession(session);
    set({
      activePresetId: presetId,
      selectedPresetId: presetId,
      mode: session.mode,
      overrides: {},
    });
  },

  setToken: (name, value) => {
    const state = get();
    const overrides: ThemeOverrides = {
      ...state.overrides,
      token: { ...(state.overrides.token ?? {}), [name]: value },
    };
    persistSession({ schemaVersion: 2, activePresetId: state.activePresetId, mode: state.mode, overrides });
    set({ overrides });
  },

  setComponentToken: (component, name, value) => {
    const state = get();
    const current = (state.overrides.components?.[component as keyof ThemeConfig['components']] ?? {}) as Record<string, unknown>;
    const overrides: ThemeOverrides = {
      ...state.overrides,
      components: {
        ...(state.overrides.components ?? {}),
        [component]: { ...current, [name]: value },
      },
    };
    persistSession({ schemaVersion: 2, activePresetId: state.activePresetId, mode: state.mode, overrides });
    set({ overrides });
  },

  resetComponent: (component) => {
    const state = get();
    const components = { ...(state.overrides.components ?? {}) };
    delete components[component as keyof typeof components];
    const overrides = { ...state.overrides, components };
    persistSession({ schemaVersion: 2, activePresetId: state.activePresetId, mode: state.mode, overrides });
    set({ overrides });
  },

  resetTheme: () => {
    const state = get();
    const overrides: ThemeOverrides = {};
    persistSession({ schemaVersion: 2, activePresetId: state.activePresetId, mode: state.mode, overrides });
    set({ overrides });
  },
}));
