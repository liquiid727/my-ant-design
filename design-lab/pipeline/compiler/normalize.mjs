/**
 * 归一化：把"人写起来舒服"的源格式，转成规范的 DTCG 2025.10 值。
 *
 * 源里可以直接写  "#B9D58A" / "18px" / "220ms" / "0 10px 28px rgba(...)"；
 * 产物（dist 与生成物）里一律是 { colorSpace, components } / { value, unit }。
 * 原因：DTCG 的 color / dimension 是对象，手写会让人放弃维护 token。
 */

const ALIAS = /^\{[^{}]+\}$/;

export const isAlias = (value) => typeof value === 'string' && ALIAS.test(value);

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const parseHex = (hex) => {
  const raw = hex.replace('#', '');
  const expand = raw.length === 3 || raw.length === 4 ? raw.split('').map((c) => c + c).join('') : raw;
  const r = parseInt(expand.slice(0, 2), 16);
  const g = parseInt(expand.slice(2, 4), 16);
  const b = parseInt(expand.slice(4, 6), 16);
  const a = expand.length === 8 ? parseInt(expand.slice(6, 8), 16) / 255 : 1;
  return {
    colorSpace: 'srgb',
    components: [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)],
    alpha: Number(a.toFixed(3)),
    hex: `#${expand.slice(0, 6).toUpperCase()}`,
  };
};

const parseColor = (value) => {
  if (typeof value === 'string' && value.startsWith('#')) return parseHex(value);
  if (typeof value === 'string') {
    const match = value.match(/^rgba?\(([^)]+)\)$/i);
    if (match) {
      const parts = match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
      const [r, g, b, a = 1] = parts;
      const toHex = (n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
      return {
        colorSpace: 'srgb',
        components: [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)],
        alpha: Number(clamp01(a).toFixed(3)),
        hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      };
    }
  }
  return value;
};

const parseDimension = (value) => {
  if (typeof value === 'number') return { value, unit: 'px' };
  const match = String(value).trim().match(/^(-?[\d.]+)(px|rem|em|%|vw|vh|rpx)?$/);
  if (!match) return value;
  return { value: Number(match[1]), unit: match[2] ?? 'px' };
};

const parseDuration = (value) => {
  const match = String(value).trim().match(/^(-?[\d.]+)(ms|s)$/);
  if (!match) return value;
  return { value: Number(match[1]), unit: match[2] };
};

const parseShadow = (value) => {
  if (typeof value !== 'string') return value;
  const colorMatch = value.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
  const color = colorMatch ? parseColor(colorMatch[0]) : parseColor('#000000');
  const numbers = value
    .replace(colorMatch?.[0] ?? '', '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const [x = '0', y = '0', blur = '0', spread = '0'] = numbers;
  return {
    color,
    offsetX: parseDimension(x),
    offsetY: parseDimension(y),
    blur: parseDimension(blur),
    spread: parseDimension(spread),
  };
};

const NORMALIZERS = {
  color: parseColor,
  dimension: parseDimension,
  duration: parseDuration,
  shadow: parseShadow,
  cubicBezier: (v) => (Array.isArray(v) ? v.map(Number) : v),
  fontFamily: (v) => (Array.isArray(v) ? v : [String(v)]),
  fontWeight: (v) => Number(v),
  number: (v) => Number(v),
};

/**
 * 遍历整棵 token 树：补全继承的 $type，并把值转成规范形式。
 * 返回新树，不修改入参。
 */
export const normalize = (tree) => {
  const walk = (node, inheritedType) => {
    const type = node.$type ?? inheritedType;
    if ('$value' in node) {
      const out = {};
      if (type) out.$type = type;
      if (node.$description) out.$description = node.$description;
      out.$value = isAlias(node.$value) ? node.$value : (NORMALIZERS[type] ?? ((v) => v))(node.$value);
      return out;
    }
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === '$description' || key === '$deprecated' || key === '$extensions') {
        out[key] = value;
        continue;
      }
      if (key.startsWith('$')) continue;
      out[key] = walk(value, type);
    }
    return out;
  };
  return walk(tree, undefined);
};
