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
const PORT = Number(process.env.VISUAL_PORT ?? 0);
const THRESHOLD = 0.006; // 0.6% 像素差异
const update = process.argv.includes('--update');

const PERMUTATIONS = [
  { app: 'ride', brand: 'cycling', theme: 'light' },
  { app: 'ride', brand: 'cycling', theme: 'dark' },
  { app: 'ride', brand: 'ledger', theme: 'light' },
  { app: 'ledger', brand: 'cycling', theme: 'light' },
  { app: 'ledger', brand: 'ledger', theme: 'light' },
  { app: 'ledger', brand: 'ledger', theme: 'dark' },
];

const main = async () => {
  await fs.mkdir(BASELINE_DIR, { recursive: true });
  // port 0 = 让 vite 自己挑一个空闲端口，避免上一次运行残留的服务占端口
  const server = await preview({ preview: { port: PORT, strictPort: false }, logLevel: 'silent' });
  const baseUrl = server.resolvedUrls?.local?.[0] ?? `http://localhost:${PORT}/`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('.home');

  const results = [];

  for (const permutation of PERMUTATIONS) {
    if (process.env.VISUAL_DEBUG) console.error('· start', permutation.app, permutation.brand, permutation.theme, baseUrl);
    // 案例页按 app 路由进入；带 query 强制真实导航（只改 hash 不会触发 load）
    await page.goto(`${baseUrl}?matrix=${permutation.app}#/matrix?app=${permutation.app}`, { waitUntil: 'load' });
    if (process.env.VISUAL_DEBUG) console.error('  navigated to', await page.evaluate(() => location.href));
    await page.waitForSelector('.matrix .screens');
    if (process.env.VISUAL_DEBUG) console.error('  screens found');
    await page.evaluate(
      ({ brand, theme }) => {
        document.documentElement.dataset.brand = brand;
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.scrollBehavior = 'auto';
      },
      permutation,
    );
    await page.waitForTimeout(700);

    const name = `${permutation.app}-${permutation.brand}-${permutation.theme}.png`;
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
  await Promise.race([
    new Promise((resolve) => server.httpServer.close(resolve)),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);

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
