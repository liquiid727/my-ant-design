import type { ThemeConfig, TokenMeta } from '../../types';
import { componentTokens, globalTokens } from './tokenRegistry';

const isHex = (value: unknown) =>
  typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);

/** antd 的 token 值都是标量；对象/数组一律不收，避免把无效结构塞进 ConfigProvider。 */
const isScalar = (value: unknown): value is string | number =>
  typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));

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

export type ValidateOptions = {
  /**
   * 保留 registry 之外的 token。默认开启：registry 决定编辑器渲染哪些控件，
   * 但不该决定一份主题能携带多少数据。关掉后行为回到旧版（只认 registry）。
   */
  preserveUnknown?: boolean;
};

const KNOWN_GLOBAL_KEYS = new Set(globalTokens.map((meta) => meta.name));
const KNOWN_COMPONENT_KEYS = new Map(
  Object.entries(componentTokens).map(([component, metas]) => [component, new Set(metas.map((meta) => meta.name))]),
);

export const validateThemeConfig = (
  incoming: Partial<ThemeConfig>,
  current: ThemeConfig,
  { preserveUnknown = true }: ValidateOptions = {},
): ThemeConfig => {
  const token = { ...current.token } as Record<string, unknown>;

  for (const meta of globalTokens) {
    if (incoming.token && meta.name in incoming.token) {
      token[meta.name] = sanitizeValue(
        meta,
        incoming.token[meta.name as keyof ThemeConfig['token']],
        token[meta.name] ?? meta.default,
      );
    }
  }

  if (preserveUnknown) {
    for (const [key, value] of Object.entries(incoming.token ?? {})) {
      if (KNOWN_GLOBAL_KEYS.has(key) || !isScalar(value)) continue;
      token[key] = value;
    }
  }

  const components = { ...current.components } as Record<string, Record<string, unknown>>;
  const incomingComponents = incoming.components ?? {};

  for (const [component, metas] of Object.entries(componentTokens)) {
    const source = incomingComponents[component as keyof typeof incomingComponents] as Record<string, unknown> | undefined;
    if (!source) continue;

    const target = { ...(components[component] ?? {}) };
    for (const meta of metas) {
      if (meta.name in source) {
        target[meta.name] = sanitizeValue(meta, source[meta.name], target[meta.name] ?? meta.default);
      }
    }
    components[component] = target;
  }

  if (preserveUnknown) {
    for (const [component, overrides] of Object.entries(incomingComponents)) {
      const knownKeys = KNOWN_COMPONENT_KEYS.get(component) ?? new Set<string>();
      const target = { ...(components[component] ?? {}) };
      let touched = false;

      for (const [key, value] of Object.entries((overrides ?? {}) as Record<string, unknown>)) {
        if (knownKeys.has(key) || !isScalar(value)) continue;
        target[key] = value;
        touched = true;
      }

      if (touched) components[component] = target;
    }
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
    token: token as ThemeConfig['token'],
    components: components as ThemeConfig['components'],
    updatedAt: new Date().toISOString(),
  };
};
