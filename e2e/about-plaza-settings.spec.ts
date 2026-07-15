import { expect, test } from '@playwright/test';

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
    ['CLI / MCP', '#tooling'],
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
    ['intro', 'overview', '五步完成一致的 Agent UI 工作流'],
    ['ai', 'design', 'design.md 设计规范'],
    ['agent', 'agents', 'Claude Code / Codex UI Agent'],
    ['unknown', 'overview', '五步完成一致的 Agent UI 工作流'],
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

test('plaza search, tag filtering, apply, snapshot rollback work with fallback data', async ({ page }) => {
  await page.goto('/?view=components');
  const primary = page.getByRole('button', { name: 'Primary button' });
  const initialColor = await primary.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.getByRole('button', { name: /Plaza/ }).click();
  await expect(page.getByText('Forest Green')).toBeVisible();
  await page.getByPlaceholder('Search themes...').fill('sakura');
  await expect(page.getByText('Sakura Pink')).toBeVisible();
  await expect(page.getByText('Forest Green')).toBeHidden();
  await page.getByPlaceholder('Search themes...').fill('');
  await page.getByRole('checkbox', { name: 'green' }).click();
  await expect(page.getByText('Forest Green')).toBeVisible();

  await page.getByRole('button', { name: /Forest Green/ }).click();
  await page.getByRole('button', { name: 'Apply Theme' }).click();
  await expect.poll(() => primary.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(initialColor);
  await page.locator('.plaza-drawer-header button').last().click();
  await expect(page.locator('.plaza-drawer')).toBeHidden();

  await page.getByText('Library').click();
  await page.getByRole('button', { name: 'Rollback' }).click({ force: true });
  await page.goto('/?view=components');
  await expect.poll(() => primary.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(initialColor);
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
  }
});
