import { expect, test } from '@playwright/test';

const officialThemes = [
  'Ant Design',
  'MUI',
  'shadcn',
  'Bootstrap',
  'Cartoon',
  'Dark',
  'Illustration',
  'Glass',
  'Geek',
  'Document',
  'Blossom',
  'Ant Design V4',
  'Serene',
];

test('all official themes keep exception progress separate from primary', async ({ page }, testInfo) => {
  await page.goto('/?view=components');

  for (const theme of officialThemes) {
    await page.getByRole('tab', { name: theme, exact: true }).click();
    await expect(page.locator('[role="progressbar"]')).toHaveCount(3);
    if (testInfo.project.name === 'mobile') continue;
    const colors = await page.locator('.ant-progress-line .ant-progress-track').evaluateAll((bars) =>
      bars.slice(0, 2).map((bar) => getComputedStyle(bar).backgroundColor),
    );
    expect(colors).toHaveLength(2);
    expect(colors[0], `${theme} primary progress`).not.toBe('');
    expect(colors[1], `${theme} exception progress`).not.toBe(colors[0]);
  }
});

test('theme switching is reversible and dashboard uses the same runtime', async ({ page }) => {
  await page.goto('/?view=components');
  const primaryButton = page.getByRole('button', { name: 'Primary button' });
  const initial = await primaryButton.evaluate((button) => getComputedStyle(button).backgroundColor);

  await page.getByRole('tab', { name: 'MUI', exact: true }).click();
  const mui = await primaryButton.evaluate((button) => getComputedStyle(button).backgroundColor);
  expect(mui).not.toBe(initial);

  await page.getByRole('tab', { name: 'Ant Design', exact: true }).click();
  await expect.poll(() => primaryButton.evaluate((button) => getComputedStyle(button).backgroundColor)).toBe(initial);

  await page.getByText('Dashboard', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'All Employees' })).toBeVisible();
  await expect(page.getByText('US$228,441')).toBeVisible();
});

test('input focus and theme editor override remain interactive', async ({ page }) => {
  await page.goto('/?view=components');
  const input = page.getByPlaceholder('antd@email.com');
  if (await input.isVisible()) {
    const before = await input.evaluate((element) => getComputedStyle(element).borderColor);
    await input.focus();
    const focused = await input.evaluate((element) => getComputedStyle(element).borderColor);
    expect(focused).not.toBe(before);
  }

  await page.getByRole('button', { name: 'Edit Tokens' }).click();
  await expect(page.getByText('Theme Editor', { exact: true }).first()).toBeVisible();
});
