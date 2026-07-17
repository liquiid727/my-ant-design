import { expect, test } from '@playwright/test';
import { toolingGuideRegistry } from '../src/services/docs/toolingGuideRegistry';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.route('https://api.github.com/**', (route) => route.abort());
});

test('about route opens and tab hash sync works', async ({ page }, testInfo) => {
  await page.goto('/about#agent');
  await expect(page.getByRole('heading', { name: 'Ant Design Theme Studio' })).toBeVisible();
  await expect(page).toHaveURL(/\/about#agents$/);

  for (const [label, hash] of [
    ['产品介绍', '#overview'],
    ['Ant Design 接入', '#antd'],
    ['design.md', '#design'],
    ['Ant Design CLI / MCP', '#tooling'],
    ['UI Agent', '#agents'],
  ] as const) {
    const tab = page.getByRole('tab', { name: label });
    if (testInfo.project.name === 'mobile') {
      await page.goto(`/about${hash}`);
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    } else {
      await tab.click();
    }
    await expect(page).toHaveURL(new RegExp(`/about${hash}$`));
  }
});

test('about legacy and unknown hashes normalize without adding history entries', async ({ page }) => {
  for (const [legacy, canonical, heading] of [
    ['intro', 'overview', '六步完成一致的 Agent UI 工作流'],
    ['ai', 'design', '当前主题的 design.md'],
    ['agent', 'agents', 'Claude Code / Codex UI Agent'],
    ['unknown', 'overview', '六步完成一致的 Agent UI 工作流'],
  ] as const) {
    await page.goto('/?history=marker');
    await page.goto(`/about#${legacy}`);
    await expect(page).toHaveURL(new RegExp(`/about#${canonical}$`));
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/?history=marker$/);
  }
});

test('about layout does not overflow mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about#antd');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test('Ant Design guide covers install, theme imports, ConfigProvider, and component verification', async ({ page }) => {
  await page.goto('/about#antd');
  await expect(page.getByText('Ant Design 6', { exact: true })).toBeVisible();
  await expect(page.getByText('npm install antd @ant-design/icons', { exact: true })).toBeVisible();
  await expect(page.getByText("import theme from './theme'", { exact: false })).toBeVisible();
  await expect(page.getByLabel('ConfigProvider theme 接入示例')).toBeVisible();
  await expect(page.getByLabel('Button Card Form 主题验证示例')).toBeVisible();
  await expect(page.locator('.about-code-copy .ant-typography-copy')).toHaveCount(5);
  await expect(page.locator('body')).not.toContainText('npm create vite');
});

test('design document can be previewed, copied, and downloaded', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/about#design');
  const preview = page.getByLabel('design.md 完整预览');
  await expect(preview).toContainText('# Default Design System');
  await expect(preview).toContainText('## Interaction states');
  await page.getByRole('button', { name: '复制' }).click();
  await expect(page.getByText('design.md 已复制')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('design.md');
});

test('UI Agent module switches and exports platform-correct files without leaving the section', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/about#agents');
  await expect(page.getByText('共享设计约束')).toBeVisible();
  await expect(page.getByLabel('CLAUDE.md 完整预览')).toContainText('@design.md');
  await expect(page.getByLabel('CLAUDE.md 完整预览')).toContainText('antd_token');

  const claudeDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await claudeDownload).suggestedFilename()).toBe('CLAUDE.md');

  await page.evaluate(() => window.scrollTo(0, 500));
  const before = await page.evaluate(() => window.scrollY);
  await page.getByText('Codex', { exact: true }).click();
  await expect(page).toHaveURL(/\/about#agents$/);
  await expect(page.getByLabel('AGENTS.md 完整预览')).toContainText('read `./design.md`');
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(before - 1);

  await page.getByRole('button', { name: '复制' }).click();
  await expect(page.getByText('AGENTS.md 已复制')).toBeVisible();
  const codexDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await codexDownload).suggestedFilename()).toBe('AGENTS.md');
});

test('Ant Design CLI and MCP guide configures the official tools for both clients', async ({ page }) => {
  const codexGuide = toolingGuideRegistry.find((guide) => guide.client === 'codex')!;
  await page.goto('/about#tooling');
  await expect(page.getByText('npm install -g @ant-design/cli', { exact: true })).toBeVisible();
  await expect(page.getByText('antd setup --client claude', { exact: true })).toBeVisible();
  await expect(page.getByLabel('预览并检查配置')).toContainText('antd setup --client claude --dry-run');
  await expect(page.getByText('npx -y @ant-design/cli mcp', { exact: true })).toBeVisible();
  await expect(page.getByText('由 antd setup --client claude 自动配置', { exact: true })).toBeVisible();

  await page.getByText('Codex', { exact: true }).click();
  await expect(page.getByText('antd setup --client codex', { exact: true })).toBeVisible();
  await expect(page.getByLabel('检查项目并执行规范诊断')).toContainText('antd doctor');
  await expect(page.getByText('由 antd setup --client codex 自动配置', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Ant Design CLI / MCP · Codex 配置示例')).toContainText('@ant-design/cli');
  await expect(page.getByText(`lastVerifiedAt: ${codexGuide.lastVerifiedAt}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`toolVersion: ${codexGuide.verifiedToolVersion}`, { exact: true })).toBeVisible();
  await expect(page.locator('.about-code-copy .ant-typography-copy')).toHaveCount(6);
  await expect(page.locator('body')).not.toContainText('@upstash/context7-mcp');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  )).toBe(true);
});

test('settings language changes prompt preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Settings/ }).click();
  await page.getByText('AI Prompt Preview').click();
  const preview = page.locator('.settings-prompt-preview');
  await expect(preview).toContainText('Ant Design');
  const before = await preview.innerText();

  await page.locator('.settings-form .ant-select').last().click();
  await page.locator('.ant-select-item-option[title="中文 (zh-CN)"]').click();
  await expect(preview).toContainText('Ant Design 设计语言');
  const zhText = await preview.innerText();

  await page.locator('.settings-form .ant-select').last().click();
  await page.locator('.ant-select-item-option[title="English (en-US)"]').click();
  await expect(preview).toContainText('Ant Design Design Language');
  expect(zhText).not.toBe(before);
  expect(await preview.innerText()).not.toBe(zhText);
});

test('square search, filtering, copy, apply, and rollback work with fallback data', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?view=components');
  const primary = page.getByRole('button', { name: 'Primary button' });
  const initialColor = await primary.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.getByText('Square', { exact: true }).click();
  await expect(page).toHaveURL(/\/square$/);
  await expect(page.getByRole('heading', { name: 'Theme Square' })).toBeVisible();
  await expect(page.getByText('Forest Green')).toBeVisible();
  await page.getByPlaceholder('Search themes...').fill('sakura');
  await expect(page.getByText('Sakura Pink')).toBeVisible();
  await expect(page.getByText('Forest Green')).toBeHidden();
  await page.getByPlaceholder('Search themes...').fill('');
  await page.getByRole('checkbox', { name: 'green' }).click();
  await expect(page.getByText('Forest Green')).toBeVisible();

  await page.getByRole('button', { name: /Forest Green/ }).click();
  await page.getByRole('button', { name: 'Copy Theme' }).click();
  const copiedTheme = await page.evaluate(async () => JSON.parse(await navigator.clipboard.readText()));
  expect(copiedTheme).toMatchObject({
    name: 'Forest Green',
    algorithm: expect.any(String),
    token: expect.any(Object),
    components: expect.any(Object),
  });

  await page.getByRole('button', { name: 'Apply Theme' }).click();
  await page.locator('.ant-segmented-item').filter({ hasText: 'Playground' }).click();
  await expect(page).toHaveURL(/\?view=components$/);
  const themedPrimary = page.getByRole('button', { name: 'Primary button' });
  await expect.poll(() => themedPrimary.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(initialColor);

  await page.getByText('Library', { exact: true }).click();
  await page.getByRole('button', { name: 'Rollback' }).click({ force: true });
  await page.goto('/?view=components');
  const restoredPrimary = page.getByRole('button', { name: 'Primary button' });
  await expect.poll(() => restoredPrimary.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(initialColor);
});

test('desktop tablet and mobile routes render', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 834, height: 1112 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'Ant Design Theme Studio' })).toBeVisible();
    await page.goto('/square');
    await expect(page.getByRole('heading', { name: 'Theme Square' })).toBeVisible();
    await expect(page.getByText('Forest Green')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
