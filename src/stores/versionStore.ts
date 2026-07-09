import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ThemeConfig, ThemeVersion } from '../types';
import { StorageService } from '../services/storage';

type VersionState = {
  createVersion: (themeId: string, config: ThemeConfig, message?: string) => ThemeVersion;
  getVersions: (themeId: string) => ThemeVersion[];
  rollback: (themeId: string, versionId: string) => ThemeConfig | null;
};

export const useVersionStore = create<VersionState>(() => ({
  createVersion: (themeId, config, message) => {
    const key = `versions_${themeId}`;
    const versions = StorageService.get<ThemeVersion[]>(key, []);
    const next: ThemeVersion = {
      id: nanoid(),
      themeId,
      version: versions.length + 1,
      message,
      config,
      createdAt: new Date().toISOString(),
    };
    StorageService.set(key, [next, ...versions].slice(0, 50));
    return next;
  },

  getVersions: (themeId) => StorageService.get<ThemeVersion[]>(`versions_${themeId}`, []),

  rollback: (themeId, versionId) => {
    const version = StorageService.get<ThemeVersion[]>(`versions_${themeId}`, []).find((item) => item.id === versionId);
    return version?.config ?? null;
  },
}));

