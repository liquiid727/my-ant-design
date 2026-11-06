import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * 图片对比的唯一实现：两个脚本（实验台 / 小程序）共用。
 * 返回 { status: 'missing' | 'resized' | 'same' | 'diff' | 'ok', ratio, diff }
 */
export const compareImage = async (buffer, baselineFile, threshold = 0.006) => {
  const actual = PNG.sync.read(buffer);
  const exists = await fs.stat(baselineFile).catch(() => null);
  if (!exists) return { status: 'missing', ratio: 1, actual };

  const baseline = PNG.sync.read(await fs.readFile(baselineFile));
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    return { status: 'resized', ratio: 1, actual, baseline };
  }

  const diff = new PNG({ width: actual.width, height: actual.height });
  const changed = pixelmatch(baseline.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0.12 });
  const ratio = changed / (actual.width * actual.height);

  return { status: ratio > threshold ? 'diff' : 'ok', ratio, changed, diff, actual, baseline };
};

export const writeDiff = async (file, diff) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, PNG.sync.write(diff));
};
