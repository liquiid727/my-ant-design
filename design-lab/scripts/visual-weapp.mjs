#!/usr/bin/env node
/**
 * 发布级视觉回归：用微信开发者工具的 automator 截真机渲染，与基线比较。
 *
 * 说明：这一步必须有真实小程序工程 + 微信开发者工具，本仓库没有，
 * 所以默认"跳过"并返回 0；在发布流程里用 --strict 让它变成硬门禁。
 *
 * 用法：
 *   MINIAPP_PROJECT=/path/to/miniapp WECHAT_DEVTOOLS_CLI=/Applications/.../cli npm run visual:weapp
 *   npm run visual:weapp -- --update    # 更新基线
 *   npm run visual:weapp -- --strict    # 没有环境时直接失败
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareImage } from './lib/visual-compare.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, 'tests/visual/weapp');

const project = process.env.MINIAPP_PROJECT;
const cliPath = process.env.WECHAT_DEVTOOLS_CLI;
const update = process.argv.includes('--update');
const strict = process.argv.includes('--strict');

/** 发布前要看的页面：路径 + 主题。 */
const SHOTS = [
  { name: 'home-light', route: 'pages/home/index', theme: 'light' },
  { name: 'ride-end-light', route: 'pages/ride-end/index', theme: 'light' },
  { name: 'home-dark', route: 'pages/home/index', theme: 'dark' },
];

const skip = (reason) => {
  console.log('');
  console.log(`  · 跳过小程序截图：${reason}`);
  console.log('   需要真实小程序工程 + 微信开发者工具；本仓库没有，属于已知边界。');
  console.log('   发布流程里请带 --strict，缺环境即失败。');
  console.log('');
  if (strict) process.exitCode = 1;
};

const main = async () => {
  if (!project) return skip('未设置 MINIAPP_PROJECT');
  const exists = await fs.stat(project).catch(() => null);
  if (!exists) return skip(`工程目录不存在：${project}`);

  let automator;
  try {
    automator = (await import('miniprogram-automator')).default;
  } catch {
    return skip('未安装 miniprogram-automator');
  }

  let miniProgram;
  try {
    miniProgram = await automator.launch({ projectPath: project, ...(cliPath ? { cliPath } : {}) });
  } catch (error) {
    return skip(`开发者工具启动失败：${error.message}`);
  }

  const results = [];

  try {
    for (const shot of SHOTS) {
      const page = await miniProgram.reLaunch(`/${shot.route}`);
      await page.waitFor(800);
      // 运行时主题：页面通过 data-theme 或页面栈状态切换，这里只做兜底
      await page.callMethod?.('setTheme', shot.theme).catch(() => {});
      await page.waitFor(300);

      const buffer = await miniProgram.screenshot();
      const file = path.join(BASELINE_DIR, `${shot.name}.png`);

      if (update) {
        await fs.mkdir(BASELINE_DIR, { recursive: true });
        await fs.writeFile(file, buffer);
        results.push({ name: shot.name, status: '已更新', ratio: 0 });
        continue;
      }

      const outcome = await compareImage(buffer, file);
      results.push({
        name: shot.name,
        status: outcome.status === 'ok' ? '一致' : outcome.status === 'missing' ? '新建基线' : '不一致',
        ratio: outcome.ratio,
      });
    }
  } finally {
    await miniProgram.close().catch(() => {});
  }

  console.log('');
  for (const item of results) {
    console.log(`  ${item.status === '不一致' ? '✗' : '✓'} ${item.name.padEnd(20)} ${(item.ratio * 100).toFixed(2).padStart(6)}%`);
  }
  console.log('');

  if (results.some((item) => item.status === '不一致')) {
    console.log('  小程序渲染与基线不一致。确认后运行 npm run visual:weapp -- --update\n');
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(`\n小程序视觉回归失败：${error.message}\n`);
  process.exitCode = 1;
});
