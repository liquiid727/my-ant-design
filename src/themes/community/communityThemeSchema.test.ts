import { describe, expect, it } from 'vitest';
import forest from './forest-green-h5n8.json';
import midnight from './midnight-blue-q9w3.json';
import sakura from './sakura-pink-f7k2.json';
import advanced from './example-advanced-a1b2/meta.json';

const themes = [forest, midnight, sakura, advanced];

describe('community theme examples', () => {
  it('match the local JSON schema contract', () => {
    for (const theme of themes) {
      expect(theme.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{4}$/);
      expect(theme.name.length).toBeGreaterThanOrEqual(2);
      expect(theme.author).toMatch(/^[a-zA-Z0-9-]+$/);
      expect(theme.tags.length).toBeGreaterThan(0);
      expect(theme.preview).toMatch(/\.png$/);
      expect(['json', 'advanced', undefined]).toContain((theme as { format?: string }).format);
      expect(['default', 'dark', 'compact', 'darkCompact']).toContain(theme.config.algorithm);
      expect(theme.config.token).toBeTruthy();
    }
  });
});
