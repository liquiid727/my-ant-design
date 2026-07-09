import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ThemeConfig, ThemeRecord } from '../types';
import { StorageService } from '../services/storage';
import { presetThemes } from '../services/theme/presets';

const builtInRecords = (): ThemeRecord[] =>
  presetThemes.map((preset) => ({
    id: preset.id,
    name: preset.name,
    config: preset.config,
    builtIn: true,
    createdAt: preset.config.updatedAt,
    updatedAt: preset.config.updatedAt,
  }));

type LibraryState = {
  themes: ThemeRecord[];
  saveTheme: (name: string, config: ThemeConfig) => ThemeRecord;
  importTheme: (record: ThemeRecord) => void;
  deleteTheme: (id: string) => void;
  copyTheme: (id: string) => void;
};

const loadThemes = () => {
  const saved = StorageService.get<ThemeRecord[]>('library_themes', []);
  const savedIds = new Set(saved.map((theme) => theme.id));
  return [...builtInRecords().filter((theme) => !savedIds.has(theme.id)), ...saved];
};

const persistUserThemes = (themes: ThemeRecord[]) =>
  StorageService.set(
    'library_themes',
    themes.filter((theme) => !theme.builtIn),
  );

export const useLibraryStore = create<LibraryState>((set, get) => ({
  themes: loadThemes(),

  saveTheme: (name, config) => {
    const now = new Date().toISOString();
    const record: ThemeRecord = {
      id: nanoid(),
      name,
      config: { ...config, id: nanoid(), name, updatedAt: now },
      createdAt: now,
      updatedAt: now,
    };
    const themes = [record, ...get().themes];
    persistUserThemes(themes);
    set({ themes });
    return record;
  },

  importTheme: (record) =>
    set((state) => {
      const themes = [record, ...state.themes];
      persistUserThemes(themes);
      return { themes };
    }),

  deleteTheme: (id) =>
    set((state) => {
      const themes = state.themes.filter((theme) => theme.id !== id || theme.builtIn);
      persistUserThemes(themes);
      StorageService.remove(`versions_${id}`);
      return { themes };
    }),

  copyTheme: (id) => {
    const source = get().themes.find((theme) => theme.id === id);
    if (!source) return;
    get().saveTheme(`${source.name} (Copy)`, source.config);
  },
}));

