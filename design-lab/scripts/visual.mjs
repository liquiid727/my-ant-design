#!/usr/bin/env node
/**
 * PR 级视觉回归：对每一套排列截「骑行实例」三屏，和基线逐像素比较。
 *
 * 用法：
 *   npm run visual          # 对比基线，超过阈值失败
 *   npm run visual:update   # 重写基线（改完设计后必须提交基线）
 *
 * 注意：基线是**平台相关**的（字体渲染不同）。当前基线在 macOS 上生成，
 * CI 因此跑在 macos-latest；换平台需要重新生成基线。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from 'playwright';
import { compareImage, writeDiff } from './lib/visual-compare.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, 'tests/visual/baselines');
const DIFF_DIR = path.join(ROOT, 'tests/visual/diff');
const PORT = 4519;
const THRESHOLD = 0.006; // 0.6% 像素差异
const update = process.argv.includes('--update');

const PERMUTATIONS = [
  { brand: 'cycling', theme: 'light' },
  { brand: 'cycling', theme: 'dark' },
  { brand: 'ledger', theme: 'light' },
  { brand: 'ledger', theme: 'dark' },
];

const main = async () => {
  await fs.mkdir(BASELINE_DIR, { recursive: true });
  const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'silent' });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await page.waitForSelector('.screens');

  const results = [];

  for (const permutation of PERMUTATIONS) {
    await page.evaluate(
      ({ brand, theme }) => {
        document.documentElement.dataset.brand = brand;
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.scrollBehavior = 'auto';
        document.getElementById('instance').scrollIntoView({ block: 'start' });
      },
      permutation,
    );
    await page.waitForTimeout(700);

    const name = `${permutation.brand}-${permutation.theme}.png`;
    const shot = await page.locator('.screens').screenshot();
    const file = path.join(BASELINE_DIR, name);

    if (update) {
      await fs.writeFile(file, shot);
      results.push({ name, status: '已更新', ratio: 0 });
      continue;
    }

    const outcome = await compareImage(shot, file, THRESHOLD);
    if (outcome.status === 'missing') {
      await fs.writeFile(file, shot);
      results.push({ name, status: '新建基线', ratio: 0 });
      continue;
    }
    if (outcome.status === 'resized') {
      results.push({ name, status: '尺寸变化', ratio: 1 });
      continue;
    }
    if (outcome.status === 'diff') await writeDiff(path.join(DIFF_DIR, name), outcome.diff);
    results.push({ name, status: outcome.status === 'diff' ? '不一致' : '一致', ratio: outcome.ratio, changed: outcome.changed });
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  const failing = results.filter((item) => item.ratio > THRESHOLD);
  console.log('');
  for (const item of results) {
    const pct = (item.ratio * 100).toFixed(2);
    console.log(`  ${item.status === '一致' || item.status === '已更新' || item.status === '新建基线' ? '✓' : '✗'} ${item.name.padEnd(24)} ${pct.padStart(6)}%`);
  }
  console.log('');

  if (failing.length) {
    console.log(`  ${failing.length} 张超出阈值（${(THRESHOLD * 100).toFixed(1)}%）。差异图在 tests/visual/diff/`);
    console.log('  确认是预期改动后运行：npm run visual:update\n');
    process.exitCode = 1;
    return;
  }
  console.log(update ? '  基线已更新，记得提交。\n' : '  视觉一致。\n');
};

main().catch((error) => {
  console.error(`\n视觉回归失败：${error.message}\n`);
  process.exitCode = 1;
});
