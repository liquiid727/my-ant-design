#!/usr/bin/env node
/**
 * ds-weapp 构建：把组件源码与编译好的 tokens.wxss 打包成可直接拷进小程序的目录。
 *
 * 这里同时是 weapp 侧的门禁：
 *  1. 组件 wxss 里出现的每个 var(--x) 都必须在 tokens.wxss 里定义；
 *  2. 组件 wxss 不允许出现颜色字面量（#hex / rgb / hsl）；
 *  3. 每个组件目录必须是完整的 wxml/wxss/js/json，且 json.component === true。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'packages/ds-weapp/src');
const DIST = path.join(ROOT, 'packages/ds-weapp/dist');
// 一个小程序工程只属于一个产品：用 DS_APP 指定，默认 ride
const APP = process.env.DS_APP ?? 'ride';
const TOKENS_WXSS = path.join(ROOT, `src/generated/tokens.${APP}.wxss`);
const TOKENS_TS = path.join(ROOT, `src/generated/tokens.${APP}.ts`);

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;
const VAR_REF = /var\((--[a-z0-9-]+)/g;

const listFiles = async (dir, filter) => {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, filter)));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
};

const copy = async (from, to) => {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
};

const main = async () => {
  const tokens = await fs.readFile(TOKENS_WXSS, 'utf8');
  const defined = new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));

  await fs.rm(DIST, { recursive: true, force: true });
  const sources = await listFiles(SRC, () => true);
  for (const file of sources) {
    await copy(file, path.join(DIST, path.relative(SRC, file)));
  }
  await copy(TOKENS_WXSS, path.join(DIST, 'tokens.wxss'));
  await copy(TOKENS_TS, path.join(DIST, 'tokens.ts'));

  // 断点从编译产物读，不在运行时重复维护
  const catalog = JSON.parse(await fs.readFile(path.join(ROOT, `src/generated/catalog.${APP}.json`), 'utf8'));
  const tokenValue = (tokenPath) => {
    for (const brand of catalog.brands) {
      const token = brand.tokens.find((item) => item.path === tokenPath);
      if (token) return parseFloat(token.values.light);
    }
    return null;
  };
  const tablet = tokenValue('layout.breakpoint.tablet') ?? 600;
  const wide = tokenValue('layout.breakpoint.wide') ?? 900;

  const layoutRuntime = `/**
 * 布局档位运行时（由 scripts/build.mjs 生成，勿手改）。
 * 小程序没有容器查询，用页面根节点上的 class 表达同一件事。
 * 用法：见 packages/ds-weapp/README.md
 */
const BREAKPOINTS = { tablet: ${tablet}, wide: ${wide} };

export const layoutBucket = (width) => {
  if (width >= BREAKPOINTS.wide) return 'expanded';
  if (width >= BREAKPOINTS.tablet) return 'medium';
  return 'compact';
};

export const layoutClass = (width) => 'layout-' + layoutBucket(width);

const windowWidth = () => {
  const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  return info.windowWidth;
};

export const applyLayout = (page) => {
  const className = layoutClass(windowWidth());
  page.setData({ layoutClass: className });
  return className;
};

export const watchLayout = (page) => {
  if (!wx.onWindowResize) return () => {};
  const handler = () => applyLayout(page);
  wx.onWindowResize(handler);
  return () => {
    if (wx.offWindowResize) wx.offWindowResize(handler);
  };
};
`;

  await fs.mkdir(path.join(DIST, 'runtime'), { recursive: true });
  await fs.writeFile(path.join(DIST, 'runtime/layout.js'), layoutRuntime, 'utf8');

  const issues = [];

  const wxssFiles = await listFiles(DIST, (name) => name.endsWith('.wxss'));
  for (const file of wxssFiles) {
    const content = await fs.readFile(file, 'utf8');
    const rel = path.relative(DIST, file);
    for (const match of content.matchAll(VAR_REF)) {
      if (!defined.has(match[1])) issues.push(`${rel}: var(${match[1]}) 在 tokens.wxss 里没有定义`);
    }
    // tokens.wxss 本身就是颜色定义处，不参与字面量扫描
    if (path.basename(file) === 'tokens.wxss') continue;
    const colors = content.match(COLOR_LITERAL);
    if (colors) issues.push(`${rel}: 出现颜色字面量 ${colors.join(' ')}`);
  }

  const componentDirs = (await fs.readdir(path.join(DIST, 'components'), { withFileTypes: true })).filter((entry) => entry.isDirectory());
  for (const dir of componentDirs) {
    const base = path.join(DIST, 'components', dir.name, 'index');
    for (const ext of ['wxml', 'wxss', 'js', 'json']) {
      try {
        await fs.access(`${base}.${ext}`);
      } catch {
        issues.push(`components/${dir.name}: 缺少 index.${ext}`);
      }
    }
    try {
      const config = JSON.parse(await fs.readFile(`${base}.json`, 'utf8'));
      if (config.component !== true) issues.push(`components/${dir.name}: index.json 必须声明 component: true`);
    } catch (error) {
      if (error instanceof SyntaxError) issues.push(`components/${dir.name}: index.json 不是合法 JSON`);
    }
  }

  const tokenCount = defined.size;
  console.log('');
  console.log(`  ds-weapp 构建  ${componentDirs.length} 个组件 · app=${APP} · 引用 ${defined.size} 个 token 变量`);
  console.log(`  布局断点  tablet=${tablet} · wide=${wide}（生成 runtime/layout.js）`);
  console.log(`  产物  packages/ds-weapp/dist（含 tokens.wxss / tokens.ts）`);
  console.log('');

  if (issues.length) {
    console.log(`  ✗ 发现 ${issues.length} 个问题：`);
    for (const issue of issues.slice(0, 20)) console.log(`      ${issue}`);
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log(`  ✓ ${wxssFiles.length} 个 wxss 全部只用 var()，且变量都有定义`);
  console.log(`  ✓ 组件结构完整（${tokenCount} 个变量可用）`);
  console.log('');
};

main().catch((error) => {
  console.error(`\n构建失败：${error.message}\n`);
  process.exitCode = 1;
});
