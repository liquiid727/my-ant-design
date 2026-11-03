import forestGreen from './community/forest-green-h5n8.json';
import midnightBlue from './community/midnight-blue-q9w3.json';
import sakuraPink from './community/sakura-pink-f7k2.json';
import type { CommunityThemeMeta } from '../services/community/types';

export const communityThemeSnapshot: CommunityThemeMeta[] = [
  forestGreen,
  midnightBlue,
  sakuraPink,
].map((theme) => {
  const item = theme as Partial<CommunityThemeMeta>;
  return { ...item, format: item.format ?? 'json' } as CommunityThemeMeta;
});
