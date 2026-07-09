import type { ThemeConfig, ThemeDiff } from '../../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const diffThemes = (left: Partial<ThemeConfig>, right: Partial<ThemeConfig>) => {
  const diffs: ThemeDiff[] = [];

  const walk = (path: string, oldValue: unknown, newValue: unknown) => {
    if (isRecord(oldValue) && isRecord(newValue)) {
      const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
      keys.forEach((key) => walk(path ? `${path}.${key}` : key, oldValue[key], newValue[key]));
      return;
    }

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;

    diffs.push({
      key: path,
      oldValue,
      newValue,
      type: oldValue === undefined ? 'added' : newValue === undefined ? 'removed' : 'changed',
    });
  };

  walk('', left, right);
  return diffs;
};

