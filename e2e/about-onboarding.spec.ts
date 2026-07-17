import { expect, test } from '@playwright/test';
import {
  ABOUT_CONTENT_METADATA,
  getToolingVerificationSummary,
  TOOLING_VERIFICATION_MAX_AGE_DAYS,
  toolingGuideRegistry,
} from '../src/services/docs/toolingGuideRegistry';

const tabs = [
  ['产品介绍', 'overview', '六步完成一致的 Agent UI 工作流'],
  ['Ant Design 接入', 'antd', '在现有项目中接入主题'],
  ['design.md', 'design', '当前主题的 design.md'],
  ['Ant Design CLI / MCP', 'tooling', 'Ant Design 工具链与 Agent 接入'],
  ['UI Agent', 'agents', 'Claude Code / Codex UI Agent'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.route('https://api.github.com/**', (route) => route.abort());
});

test('0709 release metadata and all canonical tabs are accessible', async ({ page }) => {
  const verificationSummary = getToolingVerificationSummary(toolingGuideRegistry);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about#overview');
  await expect(page.getByText(`内容版本 ${ABOUT_CONTENT_METADATA.version}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`最近更新 ${ABOUT_CONTENT_METADATA.updatedAt}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`CLI/MCP 最近核验 ${verificationSummary.oldestVerifiedAt}`, { exact: true })).toBeVisible();

  for (const [label, hash, heading] of tabs) {
    await page.getByRole('tab', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`/about#${hash}$`));
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('stale CLI/MCP metadata shows a user-facing warning', async ({ page }) => {
  const verifiedAt = new Date(`${toolingGuideRegistry[0].lastVerifiedAt}T00:00:00.000Z`);
  verifiedAt.setUTCDate(verifiedAt.getUTCDate() + TOOLING_VERIFICATION_MAX_AGE_DAYS + 1);
  await page.addInitScript((now) => {
    Date.now = () => now;
  }, verifiedAt.getTime());

  await page.goto('/about#overview');
  await expect(page.getByLabel('产品介绍').getByText('CLI/MCP 核验已过期', { exact: true })).toBeVisible();
  await expect(page.getByLabel('产品介绍').getByRole('link', { name: 'Ant Design CLI / MCP · Claude Code 官方文档' })).toBeVisible();
  await page.goto('/about#tooling');
  await expect(page.getByLabel('Ant Design CLI / MCP', { exact: true }).getByText('CLI/MCP 核验已过期', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Ant Design CLI / MCP', { exact: true }).getByRole('link', { name: '查看官方文档' })).toBeVisible();
});

test('legacy hashes resolve to canonical onboarding content', async ({ page }) => {
  for (const [legacy, canonical, heading] of [
    ['intro', 'overview', '六步完成一致的 Agent UI 工作流'],
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
    await page.getByRole('tab', { name: 'Ant Design CLI / MCP' }).click();
    await expect(page.getByRole('heading', { name: 'Ant Design 工具链与 Agent 接入' })).toBeVisible();
    const body = page.locator('body');
    content += `\n${await body.innerText()}`;
    if (hash === 'tooling') {
      await page.getByText('Codex', { exact: true }).click();
      content += `\n${await body.innerText()}`;
    }
  }
  expect(content).not.toContain('npm create vite');
  expect(content).not.toContain('API Key');
  expect(content).not.toContain('<theme-studio-mcp-command>');
  expect(content).toContain('@ant-design/cli');
  expect(content).toContain('antd setup --client claude');
  expect(content).toContain('antd setup --client codex');
  expect(content).not.toContain('@upstash/context7-mcp');
  expect(content).not.toContain('claude mcp add');
  expect(content).not.toContain('codex mcp add');
});

test('design and agent artifacts expose correct previews and download names', async ({ page }) => {
  await page.goto('/about#design');
  await expect(page.getByLabel('design.md 完整预览')).toContainText('## Verification checklist');
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('design.md');

  await page.goto('/about#agents');
  await expect(page.getByLabel('CLAUDE.md 完整预览')).toContainText('antd_info');
  await expect(page.getByLabel('CLAUDE.md 完整预览')).toContainText('@ant-design/cli');
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
