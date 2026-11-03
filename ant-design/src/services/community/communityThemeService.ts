import { StorageService } from '../storage';
import type { CommunityThemeIndex, CommunityThemeMeta } from './types';
import { validateThemeConfig } from '../theme/themeValidator';
import { defaultTheme } from '../theme/presets';
import { communityThemeSnapshot } from '../../themes/communitySnapshot';

const REPO_CONFIG = {
  owner: import.meta.env.VITE_COMMUNITY_REPO_OWNER || 'liquiid727',
  repo: import.meta.env.VITE_COMMUNITY_REPO_NAME || 'my-ant-design',
  branch: 'main',
};

const CACHE_KEY = 'community_themes';
const CACHE_TTL = 30 * 60 * 1000;
const COMMUNITY_PATH = 'src/themes/community';
const MAX_CONCURRENT = 5;
const GITHUB_PAGES_BASE =
  import.meta.env.VITE_COMMUNITY_THEME_BASE_URL ||
  `https://${REPO_CONFIG.owner}.github.io/${REPO_CONFIG.repo}/community-themes`;

type GitHubContentItem = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  content?: string;
  encoding?: string;
};

const isThemeJson = (name: string) =>
  name.endsWith('.json') && name !== 'community-theme.schema.json';

const decodeBase64 = (encoded: string): string => {
  const cleaned = encoded.replace(/\n/g, '');
  return atob(cleaned);
};

const normalizeThemeMeta = (data: Partial<CommunityThemeMeta>, filename: string): CommunityThemeMeta | null => {
  if (
    !data.id ||
    !data.name ||
    !data.author ||
    !data.description ||
    !Array.isArray(data.tags) ||
    !data.preview ||
    !data.config?.token
  ) {
    console.warn(`[CommunityThemeService] Invalid theme metadata: ${filename}`);
    return null;
  }

  const config = validateThemeConfig(
    {
      id: data.id,
      name: data.name,
      algorithm: data.config.algorithm,
      token: data.config.token,
      components: data.config.components,
    },
    defaultTheme,
  );

  return {
    id: data.id,
    name: data.name,
    author: data.author,
    description: data.description,
    tags: data.tags,
    preview: data.preview,
    format: data.format ?? 'json',
    config: {
      algorithm: config.algorithm,
      token: config.token as Record<string, unknown>,
      components: (config.components ?? {}) as Record<string, Record<string, unknown>>,
    },
  };
};

const parseThemeMeta = (raw: string, filename: string): CommunityThemeMeta | null => {
  try {
    return normalizeThemeMeta(JSON.parse(raw) as Partial<CommunityThemeMeta>, filename);
  } catch {
    console.warn(`[CommunityThemeService] Failed to parse ${filename}`);
    return null;
  }
};

const fetchWithLimit = async <T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  limit: number,
): Promise<void> => {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
};

const apiUrl = (path: string) =>
  `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/${path}`;

const fetchDirListing = async (): Promise<GitHubContentItem[]> => {
  const response = await fetch(apiUrl(COMMUNITY_PATH), {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (response.status === 403) throw new Error('RATE_LIMITED');
  if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
  return response.json() as Promise<GitHubContentItem[]>;
};

const fetchFileContent = async (path: string): Promise<string | null> => {
  const response = await fetch(apiUrl(path), {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (response.status === 403) throw new Error('RATE_LIMITED');
  if (!response.ok) return null;
  const data = (await response.json()) as GitHubContentItem;
  if (!data.content || data.encoding !== 'base64') return null;
  return decodeBase64(data.content);
};

const loadCachedIndex = (): CommunityThemeIndex | null =>
  StorageService.get<CommunityThemeIndex | null>(CACHE_KEY, null);

const loadFallback = (): CommunityThemeIndex => {
  const cached = loadCachedIndex();
  if (cached) return { ...cached, source: 'cache' };
  return { themes: communityThemeSnapshot, fetchedAt: 0, source: 'fallback' };
};

export type AdvancedCommunityThemeModule = {
  default?: unknown;
  config?: unknown;
  [exportName: string]: unknown;
};

export const CommunityThemeService = {
  async fetchIndex(force = false): Promise<CommunityThemeIndex> {
    if (!force) {
      const cached = loadCachedIndex();
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return { ...cached, source: 'cache' };
      }
    }

    try {
      const items = await fetchDirListing();
      const jsonFiles = items.filter((f) => f.type === 'file' && isThemeJson(f.name));
      const advancedDirs = items.filter((f) => f.type === 'dir');

      const themes: CommunityThemeMeta[] = [];

      await fetchWithLimit(jsonFiles, async (file) => {
        const content = await fetchFileContent(file.path);
        if (!content) return;
        const meta = parseThemeMeta(content, file.name);
        if (meta) themes.push(meta);
      }, MAX_CONCURRENT);

      await fetchWithLimit(advancedDirs, async (dir) => {
        const metaContent = await fetchFileContent(`${dir.path}/meta.json`);
        if (!metaContent) return;
        const meta = parseThemeMeta(metaContent, `${dir.name}/meta.json`);
        if (meta) themes.push({ ...meta, format: 'advanced' });
      }, MAX_CONCURRENT);

      const index: CommunityThemeIndex = {
        themes,
        fetchedAt: Date.now(),
        source: 'api',
      };

      StorageService.set(CACHE_KEY, index);
      return index;
    } catch {
      return loadFallback();
    }
  },

  getPreviewUrl(filename: string): string {
    if (/^https?:\/\//.test(filename)) return filename;
    return `https://raw.githubusercontent.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/${REPO_CONFIG.branch}/${COMMUNITY_PATH}/${filename}`;
  },

  async loadAdvancedTheme(themeId: string): Promise<AdvancedCommunityThemeModule> {
    try {
      return (await import(/* @vite-ignore */ `${GITHUB_PAGES_BASE}/${themeId}.js`)) as AdvancedCommunityThemeModule;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `该高级主题加载失败：${error.message}`
          : '该高级主题加载失败',
      );
    }
  },

  getRepoConfig() {
    return {
      ...REPO_CONFIG,
      pagesBaseUrl: GITHUB_PAGES_BASE,
      repositoryUrl: `https://github.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}`,
    };
  },
};
