import type { ThemeConfig, TokenMeta } from '../../types';
import { componentTokens, globalTokens } from './tokenRegistry';

const isHex = (value: unknown) =>
  typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);

const sanitizeValue = (meta: TokenMeta, value: unknown, fallback: unknown) => {
  if (meta.type === 'color') return isHex(value) ? value : fallback;
  if (meta.type === 'number') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    const min = meta.min ?? Number.NEGATIVE_INFINITY;
    const max = meta.max ?? Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(min, numeric));
  }
  if (meta.type === 'string') return typeof value === 'string' ? value : fallback;
  return fallback;
};

export const validateThemeConfig = (incoming: Partial<ThemeConfig>, current: ThemeConfig): ThemeConfig => {
  const token = { ...current.token };

  for (const meta of globalTokens) {
    if (incoming.token && meta.name in incoming.token) {
      token[meta.name as keyof ThemeConfig['token']] = sanitizeValue(
        meta,
        incoming.token[meta.name as keyof ThemeConfig['token']],
        token[meta.name as keyof ThemeConfig['token']] ?? meta.default,
      ) as never;
    }
  }

  const components: ThemeConfig['components'] = { ...current.components };
  const incomingComponents = incoming.components ?? {};

  for (const [component, metas] of Object.entries(componentTokens)) {
    const source = incomingComponents[component as keyof typeof incomingComponents] as Record<string, unknown> | undefined;
    if (!source) continue;

    const target = { ...((components[component as keyof typeof components] as Record<string, unknown>) ?? {}) };
    for (const meta of metas) {
      if (meta.name in source) {
        target[meta.name] = sanitizeValue(meta, source[meta.name], target[meta.name] ?? meta.default);
      }
    }
    components[component as keyof typeof components] = target as never;
  }

  const algorithm = ['default', 'dark', 'compact', 'darkCompact'].includes(String(incoming.algorithm))
    ? incoming.algorithm!
    : current.algorithm;

  return {
    ...current,
    ...incoming,
    id: incoming.id ?? current.id,
    name: incoming.name ?? current.name,
    algorithm,
    token,
    components,
    updatedAt: new Date().toISOString(),
  };
};

