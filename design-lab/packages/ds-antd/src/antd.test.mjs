import { describe, expect, it } from 'vitest';
import { classifyVocabulary, COMPONENT_MAP, EXCLUDED, projectTheme, TOKEN_MAP, toAntdTheme } from './index.mjs';

const color = (hex, alpha = 1) => ({
  colorSpace: 'srgb',
  components: [0.1, 0.2, 0.3],
  alpha,
  hex,
});

const dimension = (value, unit = 'px') => ({ value, unit });

const elevation = (alpha = 0.1) => ({
  color: color('#0A0A0C', alpha),
  offsetX: dimension(0),
  offsetY: dimension(14),
  blur: dimension(34),
  spread: dimension(0),
});

const makeSet = (entries, theme = 'light') => ({
  brand: 'noir',
  brandLabel: 'Noir',
  theme,
  byPath: new Map(Object.entries(entries).map(([path, value]) => [path, { value }])),
});

/** 一份刚好够映射的完整集合，测试里再按需覆盖。 */
const completeSet = (overrides = {}, theme = 'light') =>
  makeSet({
    'color.action.primary': color('#0A0A0C'),
    'color.action.on-primary': color('#FFFFFF'),
    'color.surface.canvas': color('#F5F5F7'),
    'color.surface.raised': color('#FFFFFF'),
    'color.surface.sunken': color('#ECECF0'),
    'color.surface.accent-soft': color('#EDEDF1'),
    'color.ink.primary': color('#0A0A0C'),
    'color.ink.secondary': color('#4B4B52'),
    'color.ink.tertiary': color('#63636A'),
    'color.border.strong': color('#C9C9D1'),
    'color.border.subtle': color('#E2E2E8'),
    'color.status.success': color('#4E633D'),
    'color.status.success-soft': color('#E9F0DF'),
    'color.status.warning': color('#84592E'),
    'color.status.warning-soft': color('#F7E8CC'),
    'color.status.danger': color('#8A4A5E'),
    'color.status.danger-soft': color('#F7DFE4'),
    'color.status.info': color('#46656F'),
    'color.status.info-soft': color('#DDEAF0'),
    'radius.control': dimension(22),
    'radius.card': dimension(26),
    'type.body.family': ['-apple-system', 'PingFang SC', 'sans-serif'],
    'type.body.size': dimension(14),
    'type.data.family': ['SF Mono', 'monospace'],
    'space.gutter': dimension(16),
    'space.inline': dimension(12),
    'space.page': dimension(20),
    'space.stack': dimension(8),
    'space.section': dimension(32),
    'size.control-height': dimension(44),
    'motion.duration.fast': dimension(140, 'ms'),
    'motion.duration.base': dimension(220, 'ms'),
    'motion.duration.slow': dimension(320, 'ms'),
    'motion.easing.standard': [0.2, 0, 0, 1],
    'elevation.raised': elevation(0.1),
    'elevation.overlay': elevation(0.18),
    ...overrides,
  }, theme);

describe('TOKEN_MAP', () => {
  it('never maps product semantics into antd', () => {
    const paths = TOKEN_MAP.map((entry) => entry.path);
    expect(paths.some((path) => path.startsWith('route.') || path.startsWith('transaction.'))).toBe(false);
  });

  it('has a unique antd target for every source path group', () => {
    const targets = TOKEN_MAP.map((entry) => entry.token);
    expect(new Set(targets).size).toBe(targets.length);
  });
});

describe('projectTheme', () => {
  it('reports nothing missing for a complete set', () => {
    expect(projectTheme(completeSet()).missing).toEqual([]);
  });

  it('reports every unmapped path instead of silently dropping it', () => {
    const { missing } = projectTheme(completeSet({ 'color.ink.primary': undefined }));
    expect(missing).toEqual(['color.ink.primary']);
  });

  it('projects colours, shape, type and motion onto antd tokens', () => {
    const { token } = toAntdTheme(completeSet());

    expect(token.colorPrimary).toBe('#0A0A0C');
    expect(token.colorTextLightSolid).toBe('#FFFFFF');
    expect(token.borderRadius).toBe(22);
    expect(token.borderRadiusLG).toBe(26);
    expect(token.fontSize).toBe(14);
    expect(token.fontFamily).toBe('-apple-system, "PingFang SC", sans-serif');
    expect(token.motionDurationFast).toBe('0.14s');
    expect(token.motionDurationMid).toBe('0.22s');
    expect(token.motionDurationSlow).toBe('0.32s');
    expect(token.motionEaseInOut).toBe('cubic-bezier(0.2, 0, 0, 1)');
  });

  it('keeps alpha when a colour is translucent', () => {
    const { token } = toAntdTheme(completeSet({ 'color.surface.canvas': color('#17180F', 0.42) }));
    expect(token.colorBgLayout).toBe('rgba(26, 51, 77, 0.42)');
  });

  it('renders elevation as a box-shadow string', () => {
    const { token } = toAntdTheme(completeSet());
    expect(token.boxShadow).toBe('0px 14px 34px 0px rgba(26, 51, 77, 0.1)');
  });

  it('rounds fractional spacing, because antd takes integers', () => {
    const { token } = toAntdTheme(completeSet({ 'space.gutter': dimension(15.6) }));
    expect(token.padding).toBe(16);
  });

  it('marks dark sets with the dark algorithm', () => {
    expect(toAntdTheme(completeSet({}, 'dark')).algorithm).toBe('dark');
    expect(toAntdTheme(completeSet()).algorithm).toBe('default');
  });

  it('drops the antd primary shadow so a black brand does not halo blue', () => {
    const { components } = toAntdTheme(completeSet());
    expect(components.Button.primaryShadow).toBe('none');
    expect(components.Button.borderRadius).toBe(22);
    expect(components.Table.headerBg).toBe('#ECECF0');
  });

  it('omits component overrides it cannot resolve', () => {
    const { components } = toAntdTheme(completeSet({ 'color.surface.sunken': undefined }));
    expect(components.Table.headerBg).toBeUndefined();
    expect(components.Table.rowHoverBg).toBe('#F5F5F7');
  });
});

describe('classifyVocabulary', () => {
  it('classifies every semantic key as mapped or explicitly excluded', () => {
    const result = classifyVocabulary(['color.ink.primary', 'color.surface.inverse', 'type.display.size']);
    expect(result.mapped).toBe(1);
    expect(result.excluded.map((entry) => entry.path)).toEqual(['color.surface.inverse', 'type.display.size']);
    expect(result.unclassified).toEqual([]);
  });

  it('reports a semantic key that nobody decided on', () => {
    const result = classifyVocabulary(['color.ink.primary', 'space.rhythm']);
    expect(result.unclassified).toEqual(['space.rhythm']);
  });

  it('explains why each excluded family stays out of antd', () => {
    EXCLUDED.forEach((rule) => {
      expect(rule.reason.trim().length).toBeGreaterThan(0);
    });
  });

  it('keeps every component override pointing at a real source path', () => {
    COMPONENT_MAP.forEach((entry) => {
      expect(typeof entry.path).toBe('string');
      expect(entry.path.includes('.')).toBe(true);
    });
  });
});
