import { clamp, formatByKind, type MetricKind } from './format';

/**
 * ViewModel：组件只负责把 VM 画出来。
 * 约定——不返回函数、不返回组件、不返回 Promise：WXML 不能调函数，
 * 所以这里的一切都必须是"已经算好的数据"。
 */

export type Tone = 'default' | 'muted';

export type MetricVM = {
  value: string;
  unit: string;
  label: string;
  tone: Tone;
  ariaLabel: string;
};

export const metricVM = ({
  kind,
  value,
  label,
  tone = 'default',
  mode = 'clock',
  unit,
}: {
  kind: MetricKind;
  value: number;
  label: string;
  tone?: Tone;
  mode?: 'clock' | 'compact';
  /** 业务给的单位（"个" / "次"）覆盖默认单位。 */
  unit?: string;
}): MetricVM => {
  const base = formatByKind(kind, value, mode);
  const formatted = unit ? { ...base, unit } : base;
  const spoken = formatted.unit ? `${formatted.value} ${formatted.unit}` : formatted.value;
  return {
    value: formatted.value,
    unit: formatted.unit,
    label,
    tone,
    ariaLabel: `${label} ${spoken}`,
  };
};

export type Surface = 'road' | 'gravel' | 'mixed';

export type RouteCardVM = {
  title: string;
  surfaceLabel: string;
  stats: MetricVM[];
  ariaLabel: string;
};

const SURFACE_LABEL: Record<Surface, string> = {
  road: '公路',
  gravel: '碎石',
  mixed: '混合',
};

export const routeCardVM = ({
  title,
  distanceKm,
  elevationM,
  durationMin,
  surface = 'mixed',
}: {
  title: string;
  distanceKm: number;
  elevationM?: number;
  durationMin?: number;
  surface?: Surface;
}): RouteCardVM => {
  const stats = [metricVM({ kind: 'distance', value: distanceKm, label: '距离' })];
  if (elevationM != null) stats.push(metricVM({ kind: 'elevation', value: elevationM, label: '爬升', tone: 'muted' }));
  if (durationMin != null) stats.push(metricVM({ kind: 'duration', value: durationMin, label: '预计', tone: 'muted', mode: 'compact' }));
  return {
    title,
    surfaceLabel: SURFACE_LABEL[surface],
    stats,
    ariaLabel: `${title}，${SURFACE_LABEL[surface]}，${stats.map((item) => item.ariaLabel).join('，')}`,
  };
};

export type AmountDirection = 'expense' | 'income' | 'transfer';

export type AmountVM = {
  value: string;
  direction: AmountDirection;
  caption: string;
  ariaLabel: string;
};

/** 金额 VM：方向只影响语义标记，格式与颜色都交给样式层。 */
export const amountVM = ({
  cents,
  direction = 'expense',
  caption = '',
}: {
  cents: number;
  direction?: AmountDirection;
  caption?: string;
}): AmountVM => {
  const formatted = formatByKind('amount', cents);
  return {
    value: formatted.value,
    direction,
    caption,
    ariaLabel: `${direction === 'income' ? '收入' : direction === 'transfer' ? '转账' : '支出'} ${formatted.value}`,
  };
};

export type RingVM = {
  ratio: number;
  /** 直接给到 stroke-dashoffset 的比例（1 = 完全未填充）。 */
  dashOffsetFactor: number;
  percentLabel: string;
  ariaLabel: string;
};

export const ringVM = (value: number, label = '完成目标'): RingVM => {
  const ratio = clamp(value);
  return {
    ratio,
    dashOffsetFactor: 1 - ratio,
    percentLabel: `${Math.round(ratio * 100)}%`,
    ariaLabel: `${label} ${Math.round(ratio * 100)}%`,
  };
};

/** 成就解锁动画：只跑一次，重复解锁不再播。 */
export type UnlockVM = { shouldCelebrate: boolean; label: string };

export const unlockVM = ({ isNew, label }: { isNew: boolean; label: string }): UnlockVM => ({
  shouldCelebrate: isNew,
  label,
});
