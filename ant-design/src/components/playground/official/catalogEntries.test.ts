import * as antd from 'antd';
import { describe, expect, it } from 'vitest';
import { catalogEntries, NON_VISUAL_EXPORTS } from './catalogEntries';

const nonVisual = new Set<string>(NON_VISUAL_EXPORTS);

const exportedComponents = () =>
  Object.keys(antd)
    .filter((name) => /^[A-Z]/.test(name))
    .sort();

describe('catalog coverage', () => {
  it('lists every exported antd component', () => {
    const covered = new Set(catalogEntries.map((entry) => entry.name));
    const missing = exportedComponents().filter((name) => !covered.has(name));
    expect(missing).toEqual([]);
  });

  it('does not invent components that antd does not export', () => {
    const exported = new Set(exportedComponents());
    const unknown = catalogEntries.map((entry) => entry.name).filter((name) => !exported.has(name) && !nonVisual.has(name));
    expect(unknown).toEqual([]);
  });

  it('keeps the non-visual allowlist minimal', () => {
    expect([...NON_VISUAL_EXPORTS].sort()).toEqual(['message', 'notification', 'theme', 'version']);
  });

  it('has a unique name for every entry', () => {
    const names = catalogEntries.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
