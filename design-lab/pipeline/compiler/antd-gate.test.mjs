import { describe, expect, it } from 'vitest';
import { ANTD_PAIRS, auditThemeContrast, parseCssColor } from './antd-gate.mjs';

const configWith = (token) => ({ token });

describe('parseCssColor', () => {
  it('parses short and long hex', () => {
    expect(parseCssColor('#fff')).toEqual({ components: [1, 1, 1], alpha: 1 });
    expect(parseCssColor('#0A0A0C')).toEqual({
      components: [10 / 255, 10 / 255, 12 / 255],
      alpha: 1,
    });
  });

  it('keeps alpha from rgba and eight-digit hex', () => {
    expect(parseCssColor('rgba(10, 10, 12, 0.1)').alpha).toBeCloseTo(0.1);
    expect(parseCssColor('#0A0A0C80').alpha).toBeCloseTo(0.502, 2);
  });

  it('rejects values it cannot read', () => {
    expect(parseCssColor('rebeccapurple')).toBeNull();
    expect(parseCssColor(14)).toBeNull();
  });
});

describe('auditThemeContrast', () => {
  const base = {
    colorText: '#0A0A0C',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F5F7',
    colorTextSecondary: '#4B4B52',
    colorTextTertiary: '#63636A',
    colorTextLightSolid: '#FFFFFF',
    colorPrimary: '#0A0A0C',
    colorLink: '#46656F',
    colorSuccess: '#4E633D',
    colorWarning: '#84592E',
    colorError: '#8A4A5E',
    colorBorder: '#C9C9D1',
  };

  it('passes a readable theme', () => {
    const results = auditThemeContrast(configWith(base));
    expect(results.filter((item) => !item.pass)).toEqual([]);
    expect(results).toHaveLength(ANTD_PAIRS.length);
  });

  it('catches white text on a white card', () => {
    const results = auditThemeContrast(configWith({ ...base, colorText: '#FFFFFF' }));
    const failing = results.filter((item) => !item.pass).map((item) => item.id);
    expect(failing).toContain('text.container');
  });

  it('flags pairs whose colour cannot be parsed', () => {
    const results = auditThemeContrast(configWith({ ...base, colorBgContainer: 'transparent' }));
    const pair = results.find((item) => item.id === 'text.container');
    expect(pair.pass).toBe(false);
    expect(pair.reason).toBe('颜色无法解析');
  });
});
