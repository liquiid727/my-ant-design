import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommunityThemeService } from '../services/community/communityThemeService';
import type { CommunityThemeMeta } from '../services/community/types';
import { useCommunityStore } from './communityStore';

const themes: CommunityThemeMeta[] = [
  { id: 'alpha-a1b2', name: 'Alpha Blue', author: 'a', description: 'Calm ocean', tags: ['blue', 'calm'], preview: 'a.png', format: 'json', config: { algorithm: 'default', token: { colorPrimary: '#1677ff' }, components: {} } },
  { id: 'beta-b1c2', name: 'Beta Rose', author: 'b', description: 'Warm pink', tags: ['pink', 'warm'], preview: 'b.png', format: 'json', config: { algorithm: 'default', token: { colorPrimary: '#eb2f96' }, components: {} } },
  { id: 'gamma-c1d2', name: 'Gamma Forest', author: 'c', description: 'Green calm', tags: ['green', 'calm'], preview: 'c.png', format: 'json', config: { algorithm: 'default', token: { colorPrimary: '#389e0d' }, components: {} } },
];

describe('communityStore', () => {
  beforeEach(() => {
    useCommunityStore.setState({ index: { themes, fetchedAt: Date.now(), source: 'api' }, loading: false, error: null, searchQuery: '', selectedTags: [] });
    vi.restoreAllMocks();
  });

  it('filters by name and description', () => {
    useCommunityStore.getState().setSearchQuery('ocean');
    expect(useCommunityStore.getState().filteredThemes().map((theme) => theme.id)).toEqual(['alpha-a1b2']);
    useCommunityStore.getState().setSearchQuery('rose');
    expect(useCommunityStore.getState().filteredThemes().map((theme) => theme.id)).toEqual(['beta-b1c2']);
  });

  it('toggles tags on and off', () => {
    useCommunityStore.getState().toggleTag('calm');
    expect(useCommunityStore.getState().selectedTags).toEqual(['calm']);
    useCommunityStore.getState().toggleTag('calm');
    expect(useCommunityStore.getState().selectedTags).toEqual([]);
  });

  it('uses OR logic for multiple tags', () => {
    useCommunityStore.setState({ selectedTags: ['blue', 'pink'] });
    expect(useCommunityStore.getState().filteredThemes().map((theme) => theme.id)).toEqual(['alpha-a1b2', 'beta-b1c2']);
  });

  it('deduplicates and sorts available tags', () => {
    expect(useCommunityStore.getState().availableTags()).toEqual(['blue', 'calm', 'green', 'pink', 'warm']);
  });

  it('guards concurrent fetches while loading', async () => {
    const spy = vi.spyOn(CommunityThemeService, 'fetchIndex').mockResolvedValue({ themes, fetchedAt: Date.now(), source: 'api' });
    useCommunityStore.setState({ loading: true });
    await useCommunityStore.getState().fetchThemes();
    expect(spy).not.toHaveBeenCalled();
  });
});
