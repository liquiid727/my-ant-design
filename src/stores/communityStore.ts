import { create } from 'zustand';
import { CommunityThemeService } from '../services/community/communityThemeService';
import type { CommunityThemeIndex, CommunityThemeMeta } from '../services/community/types';

type CommunityState = {
  index: CommunityThemeIndex | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
  fetchThemes: (force?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  filteredThemes: () => CommunityThemeMeta[];
  availableTags: () => string[];
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  index: null,
  loading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],

  fetchThemes: async (force = false) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const index = await CommunityThemeService.fetchIndex(force);
      set({ index, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch themes',
        loading: false,
      });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),

  clearFilters: () => set({ searchQuery: '', selectedTags: [] }),

  filteredThemes: () => {
    const { index, searchQuery, selectedTags } = get();
    if (!index) return [];
    let themes = index.themes;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      themes = themes.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }

    if (selectedTags.length > 0) {
      themes = themes.filter((t) => t.tags.some((tag) => selectedTags.includes(tag)));
    }

    return [...themes].sort((a, b) => a.name.localeCompare(b.name));
  },

  availableTags: () => {
    const { index } = get();
    if (!index) return [];
    return [...new Set(index.themes.flatMap((t) => t.tags))].sort();
  },
}));
