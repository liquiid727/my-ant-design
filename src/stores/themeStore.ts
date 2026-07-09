import { create } from 'zustand';
import type { ThemeConfig } from '../types';
import { defaultTheme, getPreset } from '../services/theme/presets';
import { StorageService } from '../services/storage';
import { validateThemeConfig } from '../services/theme/themeValidator';

type ThemeState = {
  currentTheme: ThemeConfig;
  selectedPresetId: string;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setPreset: (presetId: string) => void;
  setToken: (name: string, value: unknown) => void;
  setComponentToken: (component: string, name: string, value: unknown) => void;
  resetTheme: () => void;
};

const persisted = () => StorageService.get<ThemeConfig>('current_theme', defaultTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: persisted(),
  selectedPresetId: persisted().id,

  setTheme: (theme) =>
    set((state) => {
      const currentTheme = validateThemeConfig(theme, state.currentTheme);
      StorageService.set('current_theme', currentTheme);
      return { currentTheme };
    }),

  setPreset: (presetId) => {
    const preset = getPreset(presetId);
    if (!preset) return;
    StorageService.set('current_theme', preset.config);
    set({ currentTheme: preset.config, selectedPresetId: presetId });
  },

  setToken: (name, value) => {
    const state = get();
    state.setTheme({ token: { ...state.currentTheme.token, [name]: value } });
  },

  setComponentToken: (component, name, value) => {
    const state = get();
    const current = (state.currentTheme.components[component as keyof ThemeConfig['components']] ?? {}) as Record<string, unknown>;
    state.setTheme({
      components: {
        ...state.currentTheme.components,
        [component]: { ...current, [name]: value },
      },
    });
  },

  resetTheme: () => get().setPreset(get().selectedPresetId),
}));

