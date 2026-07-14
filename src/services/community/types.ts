import type { ThemeAlgorithmName } from '../../types';

export type CommunityThemeMeta = {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  preview: string;
  format: 'json' | 'advanced';
  config: {
    algorithm: ThemeAlgorithmName;
    token: Record<string, unknown>;
    components: Record<string, Record<string, unknown>>;
  };
};

export type CommunityThemeIndex = {
  themes: CommunityThemeMeta[];
  fetchedAt: number;
  source: 'api' | 'cache' | 'fallback';
};
