import { describe, expect, it } from 'vitest';
import { diffThemes } from './themeDiff';

describe('diffThemes', () => {
  it('detects added removed and changed values', () => {
    const diff = diffThemes(
      { token: { colorPrimary: '#111111', colorError: '#ff0000' } },
      { token: { colorPrimary: '#222222', colorSuccess: '#00ff00' } },
    );

    expect(diff).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'token.colorPrimary', type: 'changed' }),
        expect.objectContaining({ key: 'token.colorError', type: 'removed' }),
        expect.objectContaining({ key: 'token.colorSuccess', type: 'added' }),
      ]),
    );
  });
});

