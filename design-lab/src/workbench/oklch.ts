// allow-hardcoded-file: 颜色工具本身就在算色值，两个极值候选用于判断字色深/浅
/**
 * OKLCH 色彩工具：在浏览器里从一个品牌色派生整套色阶。
 * 用感知均匀空间而不是 HSL，明暗阶梯才看起来一样"重"。
 */

const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const toGamma = (channel: number) =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;

export type Oklch = { l: number; c: number; h: number };

export const hexToOklch = (hex: string): Oklch => {
  const raw = hex.replace('#', '');
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const [r, g, b] = [0, 2, 4].map((index) => toLinear(parseInt(value.slice(index, index + 2), 16) / 255));

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(A * A + B * B);
  const hue = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: chroma, h: (hue + 360) % 360 };
};

export const oklchToHex = ({ l, c, h }: Oklch): string => {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((channel) => {
    const encoded = toGamma(Math.min(1, Math.max(0, channel)));
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
      .toString(16)
      .padStart(2, '0');
  });

  return `#${rgb.join('')}`.toUpperCase();
};

const mix = (seed: Oklch, l: number, chromaFactor: number, maxChroma: number): Oklch => ({
  l,
  c: Math.min(seed.c * chromaFactor, maxChroma),
  h: seed.h,
});

export type Ramp = Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>;

const RAMP_STEPS: { key: keyof Ramp; l: number; factor: number }[] = [
  { key: '50', l: 0.975, factor: 0.12 },
  { key: '100', l: 0.945, factor: 0.2 },
  { key: '200', l: 0.89, factor: 0.35 },
  { key: '300', l: 0.82, factor: 0.55 },
  { key: '400', l: 0.75, factor: 0.8 },
  { key: '500', l: 0.68, factor: 1 },
  { key: '600', l: 0.6, factor: 1 },
  { key: '700', l: 0.52, factor: 0.95 },
  { key: '800', l: 0.42, factor: 0.85 },
  { key: '900', l: 0.3, factor: 0.7 },
];

export const buildRamp = (seedHex: string): Ramp => {
  const seed = hexToOklch(seedHex);
  const base: Ramp = {} as Ramp;
  for (const step of RAMP_STEPS) {
    base[step.key] = oklchToHex(mix(seed, step.l, step.factor, 0.16));
  }
  return base;
};

export const tint = (seedHex: string, l: number, factor: number, maxChroma = 0.03) =>
  oklchToHex(mix(hexToOklch(seedHex), l, factor, maxChroma));

/** 相对亮度 → 对比度，用来决定行动色上放深字还是浅字。 */
export const luminance = (hex: string) => {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((index) => toLinear(parseInt(value.slice(index, index + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

export const readableOn = (background: string, light = '#FFFFFF', dark = '#14160F') =>
  contrast(background, light) >= contrast(background, dark) ? light : dark;
