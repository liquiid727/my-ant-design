/**
 * 配方渲染的视觉回归：内置示例配方 × 设备档位 × 明暗。
 * 不需要 API Key，也不经过模型——只锁渲染结果。
 */
import { preview } from 'vite';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareImage, writeDiff } from './lib/visual-compare.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, 'tests/visual/studio');
const DIFF_DIR = path.join(ROOT, 'tests/visual/diff');
const UPDATE = process.argv.includes('--update');

const CASES = [
  { id: 'phone-light', device: 'iPhone SE', theme: '浅色' },
  { id: 'phone-dark', device: 'iPhone SE', theme: '深色' },
  { id: 'tablet-light', device: 'iPad mini', theme: '浅色' },
  { id: 'phone-landscape', device: 'iPhone 16 Pro Max', theme: '浅色', landscape: true },
  { id: 'laptop-light', device: '笔记本 1280', theme: '浅色' },
  { id: 'desktop-light', device: '桌面 1440', theme: '浅色' },
];

await fs.mkdir(BASELINE_DIR, { recursive: true });
await fs.mkdir(DIFF_DIR, { recursive: true });

const server = await preview({ preview: { port: 0 }, logLevel: 'silent' });
const base = server.resolvedUrls.local[0];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto(`${base}?v=${Date.now()}#/studio?sample=1`);
await page.waitForSelector('.recipe-phone');

let failed = 0;

// 主题在顶栏：图标按钮 + 下拉。已经是目标主题就不用再点开。
const setTheme = async (label) => {
  const trigger = page.locator('.topbar-theme-trigger');
  if (!(await trigger.count())) return;
  if ((await trigger.getAttribute('aria-label'))?.includes(label)) return;
  await trigger.click();
  await page.locator('.topbar-theme-menu').waitFor();
  await page.locator(`.topbar-theme-option:has-text("${label}")`).click();
  await page.locator('.topbar-theme-menu').waitFor({ state: 'detached' });
};

for (const item of CASES) {
  await setTheme(item.theme);
  await page.locator(`.studio-render-head .ctl-segment:has-text("${item.device}")`).first().click();
  await page.waitForTimeout(200);

  // 横屏是开关，确保状态和用例一致
  const orientation = page.locator('.studio-orientation');
  const isLandscape = (await orientation.textContent())?.includes('横屏');
  if (Boolean(item.landscape) !== Boolean(isLandscape)) await orientation.click();
  await page.waitForTimeout(350);

  const shot = await page.locator('.recipe-phone').screenshot();
  const baselinePath = path.join(BASELINE_DIR, `${item.id}.png`);

  if (UPDATE) {
    await fs.writeFile(baselinePath, shot);
    console.log(`  ✎ 写入基线 ${item.id}.png`);
    continue;
  }

  let baseline;
  try {
    baseline = await fs.readFile(baselinePath);
  } catch {
    console.log(`  ? 缺少基线 ${item.id}.png（先跑 npm run visual:studio:update）`);
    failed += 1;
    continue;
  }

  const result = await compareImage(shot, baselinePath);
  if (result.status === 'resized') {
    failed += 1;
    console.log(`  ✗ ${item.id}.png  尺寸变了（基线 ${result.baseline.width}×${result.baseline.height}，现在 ${result.actual.width}×${result.actual.height}）`);
    continue;
  }
  if (result.ratio > 0.006) {
    failed += 1;
    await writeDiff(path.join(DIFF_DIR, `studio-${item.id}.png`), result.diff);
    console.log(`  ✗ ${item.id}.png  差异 ${(result.ratio * 100).toFixed(2)}%`);
  } else {
    console.log(`  ✓ ${item.id}.png  ${(result.ratio * 100).toFixed(2)}%`);
  }
}

await browser.close();
await new Promise((resolve) => server.httpServer.close(resolve));

if (UPDATE) {
  console.log(`\n已更新 ${CASES.length} 张基线 → tests/visual/studio/`);
  process.exit(0);
}

if (failed) {
  console.log(`\n${failed} 张不一致，差异图在 tests/visual/diff/`);
  process.exit(1);
}
console.log('\n配方渲染视觉一致。');
