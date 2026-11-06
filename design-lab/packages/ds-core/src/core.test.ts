import { describe, expect, it } from 'vitest';
import {
  amountVM,
  layoutBucket,
  layoutClass,
  typeScale,
  formatAmount,
  formatDistance,
  formatDuration,
  formatPercent,
  formatSpeed,
  metricVM,
  planMotion,
  ringVM,
  routeCardVM,
  unlockVM,
} from './index';

describe('format', () => {
  it('距离不足 1km 时用米，避免出现 0.4 km', () => {
    expect(formatDistance(0.4)).toEqual({ value: '400', unit: 'm' });
    expect(formatDistance(23.44)).toEqual({ value: '23.4', unit: 'km' });
    expect(formatDistance(0)).toEqual({ value: '0', unit: 'km' });
  });

  it('时长有两种读法', () => {
    expect(formatDuration(95)).toEqual({ value: '1:35', unit: '' });
    expect(formatDuration(45)).toEqual({ value: '45', unit: 'min' });
    expect(formatDuration(95, 'compact')).toEqual({ value: '95', unit: 'min' });
  });

  it('百分比会夹到 0–100', () => {
    expect(formatPercent(0.776)).toEqual({ value: '78', unit: '%' });
    expect(formatPercent(1.4)).toEqual({ value: '100', unit: '%' });
    expect(formatPercent(-1)).toEqual({ value: '0', unit: '%' });
  });

  it('金额按分格式化并加千分位', () => {
    expect(formatAmount(348250)).toEqual({ value: '¥3,482.50', unit: '' });
    expect(formatAmount(-12800)).toEqual({ value: '-¥128.00', unit: '' });
    expect(amountVM({ cents: 348250, direction: 'expense' }).ariaLabel).toBe('支出 ¥3,482.50');
  });

  it('速度保留一位小数', () => {
    expect(formatSpeed(18.64)).toEqual({ value: '18.6', unit: 'km/h' });
  });
});

describe('metricVM', () => {
  it('给读屏用的完整描述', () => {
    const vm = metricVM({ kind: 'distance', value: 23.44, label: '距离' });
    expect(vm).toMatchObject({ value: '23.4', unit: 'km', tone: 'default' });
    expect(vm.ariaLabel).toBe('距离 23.4 km');
  });

  it('业务单位可以覆盖默认单位', () => {
    expect(metricVM({ kind: 'count', value: 2, label: '经过村落', unit: '个' })).toMatchObject({ value: '2', unit: '个' });
  });

  it('时长在列表里用紧凑读法', () => {
    const vm = metricVM({ kind: 'duration', value: 95, label: '预计', mode: 'compact' });
    expect(vm).toMatchObject({ value: '95', unit: 'min' });
  });
});

describe('routeCardVM', () => {
  it('有爬升和时长才出现对应指标', () => {
    const full = routeCardVM({ title: '西湖西溪绿道', distanceKm: 23.4, elevationM: 218, durationMin: 95 });
    expect(full.stats.map((item) => item.label)).toEqual(['距离', '爬升', '预计']);
    expect(full.surfaceLabel).toBe('混合');

    const minimal = routeCardVM({ title: '龙井茶山环线', distanceKm: 12.8, surface: 'road' });
    expect(minimal.stats).toHaveLength(1);
    expect(minimal.surfaceLabel).toBe('公路');
    expect(minimal.ariaLabel).toContain('龙井茶山环线');
  });
});

describe('ringVM', () => {
  it('越界值被夹住，dashOffset 与比例互补', () => {
    expect(ringVM(0.78)).toMatchObject({ ratio: 0.78, percentLabel: '78%' });
    expect(ringVM(0.78).dashOffsetFactor).toBeCloseTo(0.22);
    expect(ringVM(2).ratio).toBe(1);
    expect(ringVM(-1).dashOffsetFactor).toBe(1);
  });
});

describe('unlockVM', () => {
  it('只在新解锁时庆祝', () => {
    expect(unlockVM({ isNew: true, label: '山谷征服者' }).shouldCelebrate).toBe(true);
    expect(unlockVM({ isNew: false, label: '山谷征服者' }).shouldCelebrate).toBe(false);
  });
});

describe('planMotion', () => {
  const resolve = (token: string) =>
    ({ 'motion.duration.fast': '140ms', 'motion.easing.standard': 'cubic-bezier(0.2, 0, 0, 1)' })[token] ?? '';

  it('从 token 解析毫秒数与曲线', () => {
    const plan = planMotion('press', { reducedMotion: false, resolve });
    expect(plan).toMatchObject({ play: true, durationMs: 140, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  });

  it('减弱动态效果时直接落位', () => {
    const plan = planMotion('press', { reducedMotion: true, resolve });
    expect(plan).toMatchObject({ play: false, durationMs: 0, easing: 'linear' });
    expect(plan.durationToken).toBe('motion.duration.fast');
  });
});

describe('layoutBucket', () => {
  it('按断点分档：600 以下是紧凑，900 以上是宽', () => {
    expect(layoutBucket(375)).toBe('compact');
    expect(layoutBucket(599)).toBe('compact');
    expect(layoutBucket(600)).toBe('medium');
    expect(layoutBucket(899)).toBe('medium');
    expect(layoutBucket(900)).toBe('expanded');
    expect(layoutBucket(1133)).toBe('expanded');
  });

  it('自定义断点', () => {
    expect(layoutBucket(700, { tablet: 700, wide: 1000 })).toBe('medium');
    expect(layoutBucket(700, { tablet: 800, wide: 1000 })).toBe('compact');
  });

  it('class 名与字号系数', () => {
    expect(layoutClass(393)).toBe('layout-compact');
    expect(layoutClass(744)).toBe('layout-medium');
    expect(typeScale('compact')).toBe(1);
    expect(typeScale('medium')).toBeCloseTo(1.08);
  });
});
