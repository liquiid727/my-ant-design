import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../storage';
import { CommunityThemeService } from './communityThemeService';

const encode = (value: unknown) => btoa(JSON.stringify(value));
const theme = {
  id: 'ocean-blue-a1b2',
  name: 'Ocean Blue',
  author: 'tester',
  description: 'Blue test theme',
  tags: ['blue'],
  preview: 'ocean-blue-a1b2-preview.png',
  config: { algorithm: 'default', token: { colorPrimary: '#1677ff' }, components: {} },
};

describe('CommunityThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns fresh cache without hitting GitHub', async () => {
    StorageService.set('community_themes', { themes: [theme], fetchedAt: Date.now(), source: 'api' });
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    const index = await CommunityThemeService.fetchIndex();
    expect(index.source).toBe('cache');
    expect(index.themes).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requests GitHub after cache expires', async () => {
    StorageService.set('community_themes', { themes: [], fetchedAt: Date.now() - 31 * 60 * 1000, source: 'api' });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.endsWith('/src/themes/community')) {
        return { ok: true, status: 200, json: async () => [{ name: 'ocean-blue-a1b2.json', path: 'src/themes/community/ocean-blue-a1b2.json', type: 'file' }] };
      }
      return { ok: true, status: 200, json: async () => ({ content: encode(theme), encoding: 'base64' }) };
    }));

    const index = await CommunityThemeService.fetchIndex();
    expect(index.source).toBe('api');
    expect(index.themes[0].id).toBe(theme.id);
  });

  it('falls back to stale cache when API fails', async () => {
    StorageService.set('community_themes', { themes: [theme], fetchedAt: 1, source: 'api' });
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })));

    const index = await CommunityThemeService.fetchIndex(true);
    expect(index.source).toBe('cache');
    expect(index.themes[0].id).toBe(theme.id);
  });

  it('falls back to build snapshot without cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));

    const index = await CommunityThemeService.fetchIndex(true);
    expect(index.source).toBe('fallback');
    expect(index.themes.length).toBeGreaterThanOrEqual(3);
  });

  it('force refresh skips fresh cache', async () => {
    StorageService.set('community_themes', { themes: [theme], fetchedAt: Date.now(), source: 'api' });
    const fetch = vi.fn(async () => { throw new Error('offline'); });
    vi.stubGlobal('fetch', fetch);

    const index = await CommunityThemeService.fetchIndex(true);
    expect(fetch).toHaveBeenCalled();
    expect(index.source).toBe('cache');
  });

  it('skips invalid theme metadata', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.endsWith('/src/themes/community')) {
        return { ok: true, status: 200, json: async () => [
          { name: 'bad.json', path: 'src/themes/community/bad.json', type: 'file' },
          { name: 'ocean-blue-a1b2.json', path: 'src/themes/community/ocean-blue-a1b2.json', type: 'file' },
        ] };
      }
      const payload = url.includes('bad.json') ? { name: 'Bad' } : theme;
      return { ok: true, status: 200, json: async () => ({ content: encode(payload), encoding: 'base64' }) };
    }));

    const index = await CommunityThemeService.fetchIndex(true);
    expect(index.themes.map((item) => item.id)).toEqual([theme.id]);
  });
});
