// allow-hardcoded-file: 差异热区需要一个固定的警示色，不属于页面样式
/**
 * 参考图 → 配方 → 用 token 重新渲染 → 像素 diff。
 *
 * 这一步回答的是"抽出来的 token 能不能把这张图重建回来"。
 * 文字没法重建（我们只有 token，没有字形），所以文字区域从评分里排除，
 * 单独给出"被排除的面积"，避免用一个看着好看的分数糊弄过去。
 */

export type BlockKind = 'surface' | 'accent' | 'text';

export type RecipeBlock = {
  /** 归一化坐标 0..1 */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BlockKind;
  color: string;
  /** 区块里是否含文字（文字像素不计入评分） */
  text?: boolean;
};

export type Recipe = {
  version: 1;
  source: { width: number; height: number };
  background: string;
  blocks: RecipeBlock[];
};

type Pixels = { data: Uint8ClampedArray; width: number; height: number };

const labOf = (r: number, g: number, b: number) => {
  const lin = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const [lr, lg, lb] = [lin(r / 255), lin(g / 255), lin(b / 255)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
};

const dist = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const hexToLab = (hex: string) => {
  const raw = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
  return labOf(r, g, b);
};

const hexToRgb = (hex: string) => {
  const raw = hex.replace('#', '');
  return [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
};

export const readPixels = (image: HTMLImageElement, width: number): Pixels => {
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('无法创建 canvas');
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return { data, width, height };
};

/** 行 / 列方向的"背景带"切分：先把图切成横条，再在横条里切竖条。 */
const segments = (values: boolean[]) => {
  const runs: { start: number; end: number }[] = [];
  let start = -1;
  values.forEach((isContent, index) => {
    if (isContent && start < 0) start = index;
    if (!isContent && start >= 0) {
      runs.push({ start, end: index });
      start = -1;
    }
  });
  if (start >= 0) runs.push({ start, end: values.length });
  return runs.filter((run) => run.end - run.start >= 3);
};

export const deriveRecipe = (pixels: Pixels, background: string, accent: string): Recipe => {
  const { data, width, height } = pixels;
  const bgLab = hexToLab(background);
  const accentLab = hexToLab(accent);

  const isBackground = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    return dist(labOf(data[offset], data[offset + 1], data[offset + 2]), bgLab) < 0.05;
  };

  const rowBackground = Array.from({ length: height }, (_, y) => {
    let count = 0;
    for (let x = 0; x < width; x += 1) if (isBackground(x, y)) count += 1;
    return count / width > 0.92;
  });

  const bands = segments(rowBackground.map((value) => !value));
  const blocks: RecipeBlock[] = [];

  for (const band of bands) {
    const columnBackground = Array.from({ length: width }, (_, x) => {
      let count = 0;
      for (let y = band.start; y < band.end; y += 1) if (isBackground(x, y)) count += 1;
      return count / (band.end - band.start) > 0.92;
    });

    for (const column of segments(columnBackground.map((value) => !value))) {
      // 众数色：均值会被文字/阴影拉灰，众数更接近"这块本来的颜色"
      const histogram = new Map<number, number>();
      let darkPixels = 0;
      let n = 0;
      for (let y = band.start; y < band.end; y += 1) {
        for (let x = column.start; x < column.end; x += 1) {
          const offset = (y * width + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
          histogram.set(key, (histogram.get(key) ?? 0) + 1);
          if (labOf(r, g, b)[0] < 0.32) darkPixels += 1;
          n += 1;
        }
      }
      if (!n) continue;

      const [modeKey] = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0];
      const mr = ((modeKey >> 8) & 0xf) * 17;
      const mg = ((modeKey >> 4) & 0xf) * 17;
      const mb = (modeKey & 0xf) * 17;
      const color = `#${[mr, mg, mb].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

      const colorLab = hexToLab(color);
      const toAccent = dist(colorLab, accentLab);
      const toBg = dist(colorLab, bgLab);
      const h = (band.end - band.start) / height;

      let kind: BlockKind = 'surface';
      if (toAccent < 0.12 && toBg > 0.1) kind = 'accent';
      else if (toBg > 0.35 && h > 0.1) kind = 'text';
      else if (toBg > 0.35) kind = 'text';

      blocks.push({
        x: column.start / width,
        y: band.start / height,
        w: (column.end - column.start) / width,
        h,
        kind,
        color,
        text: darkPixels / n > 0.015,
      });
    }
  }

  return {
    version: 1,
    source: { width, height },
    background,
    blocks: blocks.slice(0, 60),
  };
};

export type DiffResult = { mismatch: number; ignored: number; heatmap: string; rendered: string };

/** 用 token 颜色重画配方，再和原图逐像素比。 */
export const renderAndDiff = (pixels: Pixels, recipe: Recipe, palette: { accent: string; ink: string }) => {
  const { width, height } = pixels;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('无法创建 canvas');

  context.fillStyle = recipe.background;
  context.fillRect(0, 0, width, height);

  const ignoredMask = new Uint8Array(width * height);

  for (const block of recipe.blocks) {
    if (block.text) {
      const blockLab = hexToLab(block.color);
      const x0 = Math.floor(block.x * width);
      const y0 = Math.floor(block.y * height);
      const x1 = Math.ceil((block.x + block.w) * width);
      const y1 = Math.ceil((block.y + block.h) * height);
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const index = y * width + x;
          const offset = index * 4;
          const lab = labOf(pixels.data[offset], pixels.data[offset + 1], pixels.data[offset + 2]);
          if (Math.abs(lab[0] - blockLab[0]) > 0.12) ignoredMask[index] = 1;
        }
      }
    }
  }

  for (const block of recipe.blocks) {
    const x = block.x * width;
    const y = block.y * height;
    const w = block.w * width;
    const h = block.h * height;
    const radius = Math.min(w, h) * 0.18;

    context.beginPath();
    context.roundRect(x, y, w, h, radius);

    if (block.kind === 'accent') context.fillStyle = palette.accent;
    else if (block.kind === 'text') context.fillStyle = palette.ink;
    else context.fillStyle = block.color;

    context.fill();
  }

  const rendered = context.getImageData(0, 0, width, height).data;
  const heatmap = document.createElement('canvas');
  heatmap.width = width;
  heatmap.height = height;
  const heatContext = heatmap.getContext('2d');
  const heat = heatContext?.createImageData(width, height);

  let mismatch = 0;
  let ignored = 0;
  let counted = 0;

  for (let index = 0; index < width * height; index += 1) {
    if (ignoredMask[index]) {
      ignored += 1;
      if (heat) {
        heat.data[index * 4] = 120;
        heat.data[index * 4 + 1] = 120;
        heat.data[index * 4 + 2] = 120;
        heat.data[index * 4 + 3] = 60;
      }
      continue;
    }

    const offset = index * 4;
    const a = labOf(pixels.data[offset], pixels.data[offset + 1], pixels.data[offset + 2]);
    const b = labOf(rendered[offset], rendered[offset + 1], rendered[offset + 2]);
    const delta = dist(a, b);

    counted += 1;
    if (delta > 0.08) {
      mismatch += 1;
      if (heat) {
        const [r, g, bl] = hexToRgb('#C2410C');
        heat.data[offset] = r;
        heat.data[offset + 1] = g;
        heat.data[offset + 2] = bl;
        heat.data[offset + 3] = Math.min(220, Math.round(delta * 900));
      }
    } else if (heat) {
      heat.data[offset + 3] = 0;
    }
  }

  if (heatContext && heat) heatContext.putImageData(heat, 0, 0);

  return {
    mismatch: counted ? mismatch / counted : 0,
    ignored: ignored / (width * height),
    heatmap: heatmap.toDataURL('image/png'),
    rendered: canvas.toDataURL('image/png'),
  } satisfies DiffResult;
};
