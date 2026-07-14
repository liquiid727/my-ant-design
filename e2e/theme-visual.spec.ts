import { expect, test } from '@playwright/test';

const visualTest = process.env.VISUAL_REGRESSION === '1' ? test : test.skip;
const themes = [
  ['default', 'Ant Design'],
  ['mui', 'MUI'],
  ['shadcn', 'shadcn'],
  ['bootstrap', 'Bootstrap'],
  ['cartoon', 'Cartoon'],
  ['dark', 'Dark'],
  ['illustration', 'Illustration'],
  ['glass', 'Glass'],
  ['geek', 'Geek'],
  ['lark', 'Document'],
  ['blossom', 'Blossom'],
  ['v4', 'Ant Design V4'],
  ['serene', 'Serene'],
] as const;

for (const [id, label] of themes) {
  for (const view of ['components', 'dashboard'] as const) {
    visualTest(`${id} ${view} matches the frozen canvas`, async ({ page }) => {
      await page.goto(`/?view=${view}`);
      await page.getByRole('tab', { name: label, exact: true }).click();
      await expect(page.locator('[data-theme-preset]')).toHaveAttribute('data-theme-preset', id);
      await expect(page.locator('.theme-playground')).toHaveScreenshot(`${id}-${view}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.001,
      });
    });
  }
}
