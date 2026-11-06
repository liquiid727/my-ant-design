/**
 * 值格式化 + 变量命名。所有目标平台的字符串形态只在这里产生。
 */
import { DESIGN_WIDTH } from '../pipeline.config.mjs';

export const toKebab = (segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();

export const tokenName = (tokenPath) => tokenPath.split('.').map(toKebab).join('-');

export const cssVarName = (tokenPath) => `--${tokenName(tokenPath)}`;

const round = (n, digits = 3) => Number(n.toFixed(digits));

const colorToCss = (color) => {
  if (typeof color !== 'object') return String(color);
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  const alpha = color.alpha ?? 1;
  if (alpha >= 1 && color.hex) return color.hex.toLowerCase();
  return `rgba(${r}, ${g}, ${b}, ${round(alpha)})`;
};

const dimensionToCss = (dimension, { unit } = {}) => {
  if (typeof dimension !== 'object') return String(dimension);
  if (dimension.unit !== 'px') return `${dimension.value}${dimension.unit}`;
  if (unit !== 'rpx') return `${dimension.value}px`;
  // 1px 是发丝线，跟随物理像素，不随屏宽缩放。
  if (dimension.value === 0 || dimension.value === 1) return `${dimension.value}px`;
  return `${Math.round((dimension.value * 750) / DESIGN_WIDTH)}rpx`;
};

const shadowToCss = (shadow) => {
  if (typeof shadow !== 'object') return String(shadow);
  const parts = [shadow.offsetX, shadow.offsetY, shadow.blur, shadow.spread]
    .map((value) => dimensionToCss(value))
    .filter((value, index) => !(index === 3 && value === '0px'));
  return `${parts.join(' ')} ${colorToCss(shadow.color)}`;
};

export const formatValue = (token, target = 'web') => {
  const { type, value } = token;
  switch (type) {
    case 'color':
      return colorToCss(value);
    case 'dimension':
      return dimensionToCss(value, target === 'weapp' ? { unit: 'rpx' } : undefined);
    case 'duration':
      return typeof value === 'object' ? `${value.value}${value.unit}` : String(value);
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'fontFamily':
      return (Array.isArray(value) ? value : [value]).map((name) => (/\s/.test(name) ? `'${name}'` : name)).join(', ');
    case 'shadow':
      return shadowToCss(value);
    case 'number':
    case 'fontWeight':
      return Number(value);
    default:
      return Array.isArray(value) ? value.join(', ') : value;
  }
};

/** 业务可见的 token：排除原色与内部刻度。 */
export const isPublic = (token, privatePrefixes) =>
  token.layer !== 'primitive' && !privatePrefixes.some((prefix) => token.path === prefix || token.path.startsWith(`${prefix}.`));
