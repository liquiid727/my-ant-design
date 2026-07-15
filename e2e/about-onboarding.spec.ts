import { expect, test } from '@playwright/test';

const tabs = [
  ['产品介绍', 'overview', '五步完成一致的 Agent UI 工作流'],
  ['Ant Design 接入', 'antd', '在现有项目中接入主题'],
  ['design.md', 'design', '当前主题的 design.md'],
  ['CLI / MCP', 'tooling', '真实客户端接入指南'],
  ['UI Agent', 'agents', 'Claude Code / Codex UI Agent'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.route('https://api.github.com/**', (route) => route.abort());
});

test('0709 release metadata and all canonical tabs are accessible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about#overview');
  await expect(page.getByText('内容版本 0709', { exact: true })).toBeVisible();
  await expect(page.getByText('最近更新 2026-07-15', { exact: true })).toBeVisible();
  await expect(page.getByText('CLI/MCP 最近核验 2026-07-15', { exact: true })).toBeVisible();

  for (const [label, hash, heading] of tabs) {
    await page.getByRole('tab', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`/about#${hash}$`));
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('legacy hashes resolve to canonical onboarding content', async ({ page }) => {
  for (const [legacy, canonical, heading] of [
    ['intro', 'overview', '五步完成一致的 Agent UI 工作流'],
    ['ai', 'design', '当前主题的 design.md'],
    ['agent', 'agents', 'Claude Code / Codex UI Agent'],
  ] as const) {
    await page.goto(`/about#${legacy}`);
    await expect(page).toHaveURL(new RegExp(`/about#${canonical}$`));
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('release content excludes out-of-scope setup and fictional tooling', async ({ page }) => {
  let content = '';
  for (const [, hash] of tabs) {
    await page.goto(`/about#${hash}`);
    content += `\n${await page.locator('body').innerText()}`;
  }
  expect(content).not.toContain('npm create vite');
  expect(content).not.toContain('API Key');
  expect(content).not.toContain('<theme-studio-mcp-command>');
  expect(content).not.toContain('Theme Studio MCP Server 已');
});

test('design and agent artifacts expose correct previews and download names', async ({ page }) => {
  await page.goto('/about#design');
  await expect(page.getByLabel('design.md 完整预览')).toContainText('## Verification checklist');
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('design.md');

  await page.goto('/about#agents');
  await expect(page.getByLabel('CLAUDE.md 完整预览')).toContainText('@design.md');
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('CLAUDE.md');

  await page.getByText('Codex', { exact: true }).click();
  await expect(page.getByLabel('AGENTS.md 完整预览')).toContainText('read `./design.md`');
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('AGENTS.md');
});

test('all onboarding tabs stay within 390px, 834px, and 1440px viewports', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 834, height: 1112 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [, hash, heading] of tabs) {
      await page.goto(`/about#${hash}`);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      const fitsViewport = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      );
      expect(fitsViewport, `${hash} should fit within the ${viewport.width}px viewport`).toBe(true);
    }
  }
});
