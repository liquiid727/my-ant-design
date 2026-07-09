import { expect, test } from '@playwright/test';

test('manual theme editor and export flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ant Design Theme Studio')).toBeVisible();
  await page.getByRole('button', { name: 'Dark' }).click();
  await page.getByRole('button', { name: 'Edit Tokens' }).click();
  await page.getByRole('tab', { name: 'Component', exact: true }).click();
  await page.getByRole('tab', { name: 'Global', exact: true }).click();
  await page.locator('.ant-drawer-close').click();
  await page.getByText('Library').click();
  await expect(page.getByText('Save Current Theme')).toBeVisible();
  await page.getByText('theme.ts').click();
  await page.getByText('theme.json').click();
  await expect(page.getByText('"token"')).toBeVisible();
});
