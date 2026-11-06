/** 数值 → 展示字符串。只做格式化，不读 token、不碰 DOM、不认品牌。 */

export type MetricKind = 'distance' | 'elevation' | 'duration' | 'speed' | 'percent' | 'count' | 'amount';

export type FormattedValue = { value: string; unit: string };

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** 距离：不足 1km 用米，避免 "0.4 km" 这种读数。 */
export const formatDistance = (km: number): FormattedValue => {
  if (!Number.isFinite(km) || km <= 0) return { value: '0', unit: 'km' };
  if (km < 1) return { value: String(Math.round(km * 1000)), unit: 'm' };
  return { value: round(km, 1).toFixed(1), unit: 'km' };
};

export const formatElevation = (meters: number): FormattedValue => ({
  value: String(Math.round(meters)),
  unit: 'm',
});

/** 时长：clock = 1:35，compact = 95 min。骑行详情用 clock，列表用 compact。 */
export const formatDuration = (minutes: number, mode: 'clock' | 'compact' = 'clock'): FormattedValue => {
  const safe = Math.max(0, Math.round(minutes));
  if (mode === 'compact') return { value: String(safe), unit: 'min' };
  const hours = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, '0');
  return hours > 0 ? { value: `${hours}:${rest}`, unit: '' } : { value: `${safe}`, unit: 'min' };
};

export const formatSpeed = (kmh: number): FormattedValue => ({
  value: round(kmh, 1).toFixed(1),
  unit: 'km/h',
});

/** 金额：入参是分，展示保留两位并加千分位。 */
export const formatAmount = (cents: number, currency: 'CNY' = 'CNY'): FormattedValue => {
  const abs = Math.abs(Math.round(cents)) / 100;
  const [integer, fraction] = abs.toFixed(2).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = cents < 0 ? '-' : '';
  const symbol = currency === 'CNY' ? '¥' : '';
  return { value: `${sign}${symbol}${grouped}.${fraction}`, unit: '' };
};

export const formatPercent = (ratio: number): FormattedValue => ({
  value: String(Math.round(clamp(ratio) * 100)),
  unit: '%',
});

export const formatByKind = (kind: MetricKind, value: number, mode: 'clock' | 'compact' = 'clock'): FormattedValue => {
  switch (kind) {
    case 'distance':
      return formatDistance(value);
    case 'elevation':
      return formatElevation(value);
    case 'duration':
      return formatDuration(value, mode);
    case 'speed':
      return formatSpeed(value);
    case 'percent':
      return formatPercent(value);
    case 'amount':
      return formatAmount(value);
    default:
      return { value: String(Math.round(value)), unit: '' };
  }
};
