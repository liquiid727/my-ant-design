/**
 * 图片 → 配色画像：把一张参考图压成若干色簇，再推断背景 / 卡片 / 强调 / 文字。
 * 只在浏览器里跑（canvas + OKLab k-means），不上传任何图片。
 */
import { hexToOklch, oklchToHex, type Oklch } from './oklch';

export type Cluster = {
  hex: string;
  oklch: Oklch;
  share: number;
};

export type Role = 'background' | 'surface' | 'accent' | 'ink';

export type Profile = {
  clusters: Cluster[];
  roles: Record<Role, Cluster | null>;
  contrast: { inkOnBackground: number; inkOnSurface: number };
  confidence: Record<Role, number>;
  size: { width: number; height: number };
};

const MAX_SAMPLES = 6000;
const K = 8;
const ITERATIONS = 12;

const srgbToLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const rgbToLab = (r: number, g: number, b: number) => {
  const [lr, lg, lb] = [r, g, b].map((channel) => srgbToLinear(channel / 255));
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
};

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** 感知距离，用于"和参考图有多接近"。 */
export const deltaE = (a: string, b: string) => {
  const toLab = (hex: string) => {
    const raw = hex.replace('#', '');
    const [r, g, bl] = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
    return rgbToLab(r, g, bl);
  };
  return distance(toLab(a), toLab(b)) * 100;
};

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败（可能是跨域限制）'));
    image.src = src;
  });

const kmeans = (samples: readonly (readonly number[])[], k: number, iterations: number) => {
  if (!samples.length) return { centers: [] as number[][], assignment: [] as number[] };

  // 初始化：按亮度分位取点，比随机稳定
  const sorted = [...samples].sort((a, b) => a[0] - b[0]);
  const centers = Array.from({ length: k }, (_, index) => {
    const pick = sorted[Math.floor((index / k) * (sorted.length - 1))];
    return [pick[0], pick[1], pick[2]];
  });

  const assignment = new Array(samples.length).fill(0);

  for (let round = 0; round < iterations; round += 1) {
    for (let index = 0; index < samples.length; index += 1) {
      let best = 0;
      let bestDistance = Infinity;
      for (let center = 0; center < centers.length; center += 1) {
        const d = distance(samples[index], centers[center]);
        if (d < bestDistance) {
          bestDistance = d;
          best = center;
        }
      }
      assignment[index] = best;
    }

    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let index = 0; index < samples.length; index += 1) {
      const bucket = sums[assignment[index]];
      bucket[0] += samples[index][0];
      bucket[1] += samples[index][1];
      bucket[2] += samples[index][2];
      bucket[3] += 1;
    }
    for (let center = 0; center < centers.length; center += 1) {
      const [l, a, b, count] = sums[center];
      if (count > 0) centers[center] = [l / count, a / count, b / count];
    }
  }

  return { centers, assignment };
};

const labToHex = (lab: readonly number[]) => {
  // 借助现有的 OKLCH 转换：先转 LCh，再转 hex
  const [l, a, b] = lab;
  const c = Math.hypot(a, b);
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return oklchToHex({ l, c, h });
};

export const analyzeImage = async (src: string): Promise<Profile> => {
  const image = await loadImage(src);
  const width = 240;
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('无法创建 canvas 上下文');
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);

  const samples: number[][] = [];
  const step = Math.max(1, Math.floor((width * height) / MAX_SAMPLES));
  for (let pixel = 0; pixel < width * height; pixel += step) {
    const offset = pixel * 4;
    if (data[offset + 3] < 200) continue;
    samples.push([...rgbToLab(data[offset], data[offset + 1], data[offset + 2])]);
  }

  const { centers, assignment } = kmeans(samples, K, ITERATIONS);
  const counts = centers.map(() => 0);
  for (const index of assignment) counts[index] += 1;

  const clusters: Cluster[] = centers
    .map((center, index) => {
      const hex = labToHex(center);
      return { hex, oklch: hexToOklch(hex), share: counts[index] / Math.max(1, samples.length) };
    })
    .filter((cluster) => cluster.share > 0.004)
    .sort((a, b) => b.share - a.share);

  const byLightness = [...clusters].sort((a, b) => a.oklch.l - b.oklch.l);
  const background = clusters[0] ?? null;

  // 卡片：比背景略亮/略暗、且色相接近的最大簇
  const surface =
    clusters.find(
      (cluster) =>
        cluster !== background &&
        Math.abs(cluster.oklch.l - (background?.oklch.l ?? 0)) < 0.16 &&
        cluster.share > 0.03,
    ) ?? null;

  // 强调色：色度最高、面积不算太小的簇
  const accent =
    [...clusters]
      .filter((cluster) => cluster.oklch.c > 0.04 && cluster.share > 0.01)
      .sort((a, b) => b.oklch.c * Math.sqrt(b.share) - a.oklch.c * Math.sqrt(a.share))[0] ?? null;

  // 文字：小字会被 k-means 平均进背景，所以直接取最暗的 2% 像素
  const darkest = [...samples].sort((a, b) => a[0] - b[0])[Math.max(0, Math.floor(samples.length * 0.02))];
  const inkFromPixels = darkest ? { hex: labToHex(darkest), oklch: hexToOklch(labToHex(darkest)), share: 0.02 } : null;
  const ink =
    inkFromPixels && inkFromPixels.oklch.l < 0.55
      ? inkFromPixels
      : ([...byLightness].find((cluster) => cluster.oklch.l < 0.45 && cluster.share > 0.005) ?? null);

  const ratio = (fg: Cluster | null, bg: Cluster | null) => {
    if (!fg || !bg) return 0;
    const lum = (hex: string) => {
      const raw = hex.replace('#', '');
      const [r, g, b] = [0, 2, 4].map((index) => srgbToLinear(parseInt(raw.slice(index, index + 2), 16) / 255));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [light, dark] = [lum(fg.hex), lum(bg.hex)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
  };

  const confidence: Record<Role, number> = {
    background: background ? Math.min(1, background.share * 3) : 0,
    surface: surface ? Math.min(1, surface.share * 6) : 0,
    accent: accent ? Math.min(1, accent.share * 8 + accent.oklch.c * 2) : 0,
    ink: ink ? Math.min(1, Math.max(0.35, 0.45 - ink.oklch.l + 0.4)) : 0,
  };

  return {
    clusters,
    roles: { background, surface, accent, ink },
    contrast: {
      inkOnBackground: Number(ratio(ink, background).toFixed(2)),
      inkOnSurface: Number(ratio(ink, surface ?? background).toFixed(2)),
    },
    confidence,
    size: { width: image.naturalWidth, height: image.naturalHeight },
  };
};

export const clusterToOklch = (clusters: Cluster[]) =>
  clusters.map((cluster) => ({ hex: cluster.hex, l: cluster.oklch.l, c: cluster.oklch.c, h: cluster.oklch.h }));
