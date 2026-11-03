import { describe, expect, it } from 'vitest';
import { resolveActivePreset, shouldResolveActivePreset } from './DesignDocumentSection';

describe('resolveActivePreset', () => {
  it('uses registry metadata when the current theme matches the active preset', () => {
    expect(resolveActivePreset('default', 'default')).toMatchObject({ name: 'Ant Design', style: 'Ant Design 6' });
  });

  it('falls back for imported or community themes that retain the previous active preset', () => {
    expect(resolveActivePreset('forest-green-h5n8', 'default')).toBeUndefined();
  });

  it('resolves a newly selected preset but preserves imported theme overrides', () => {
    expect(shouldResolveActivePreset('default', 'mui', 'preset', {})).toBe(true);
    expect(shouldResolveActivePreset('imported', 'default', 'custom', { token: { colorPrimary: '#123456' } })).toBe(false);
  });
});
