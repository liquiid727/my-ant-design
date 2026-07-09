import { describe, expect, it } from 'vitest';
import { extractThemeFromResponse } from './responseParser';

describe('extractThemeFromResponse', () => {
  it('parses fenced JSON', () => {
    const theme = extractThemeFromResponse('```json\n{"token":{"colorPrimary":"#ff0000"}}\n```');
    expect(theme?.token?.colorPrimary).toBe('#ff0000');
  });

  it('parses mixed text JSON', () => {
    const theme = extractThemeFromResponse('Here is it {"token":{"borderRadius":12}} thanks');
    expect(theme?.token?.borderRadius).toBe(12);
  });

  it('returns null for non JSON', () => {
    expect(extractThemeFromResponse('no theme here')).toBeNull();
  });
});

