import { beforeEach, describe, expect, it } from 'vitest';
import { decodeApiKey, encodeApiKey, StorageService } from './storage';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores values with namespace prefix', () => {
    StorageService.set('sample', { ok: true });
    expect(localStorage.getItem('ts_sample')).toBeTruthy();
    expect(StorageService.get('sample', { ok: false })).toEqual({ ok: true });
  });

  it('encodes api keys reversibly', () => {
    expect(decodeApiKey(encodeApiKey('sk-test'))).toBe('sk-test');
  });
});

