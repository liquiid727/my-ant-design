import { expect, test } from '@playwright/test';

// 0.2%：容忍元素截图最后一行的亚像素取整，真实主题回归远大于这个量级
const visualTest = process.env.VISUAL_REGRESSION === '1' ? test : test.skip;

/** 场景底是图片：等它解码完再截图，否则并行跑的时候会拍到还没画上的背景。 */
const waitForSceneBackground = (page: import('@playwright/test').Page) =>
  page.waitForFunction(async () => {
    const element = document.querySelector('.theme-playground');
    if (!element) return false;
    const match = getComputedStyle(element).backgroundImage.match(/url\("?(.+?)"?\)/);
    if (!match) return true;
    const image = new Image();
    image.src = match[1];
    try {
      await image.decode();
      return true;
    } catch {
      return false;
    }
  });
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
  ['lab-noir-light', 'Noir · light'],
  ['lab-noir-dark', 'Noir · dark'],
  ['lab-cycling-light', 'Ride Atlas · light'],
  ['lab-cycling-dark', 'Ride Atlas · dark'],
  ['lab-ledger-light', 'Ledger · light'],
  ['lab-ledger-dark', 'Ledger · dark'],
] as const;

/**
 * 状态矩阵和全量清单信息量大、截图也大，只对代表性主题做回归：
 * 官方浅色 / 官方深色 / lab 浅色 / lab 深色。
 */
const detailThemes = [
  ['default', 'Ant Design'],
  ['dark', 'Dark'],
  ['lab-noir-light', 'Noir · light'],
  ['lab-noir-dark', 'Noir · dark'],
] as const;

for (const [id, label] of themes) {
  for (const view of ['components', 'dashboard'] as const) {
    visualTest(`${id} ${view} matches the frozen canvas`, async ({ page }) => {
      await page.goto(`/?view=${view}`);
      await page.getByRole('tab', { name: label, exact: true }).click();
      await expect(page.locator('[data-theme-preset]')).toHaveAttribute('data-theme-preset', id);
      await waitForSceneBackground(page);
      await expect(page.locator('.theme-playground')).toHaveScreenshot(`${id}-${view}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.002,
      });
    });
  }
}

for (const [id, label] of detailThemes) {
  for (const view of ['states', 'catalog'] as const) {
    visualTest(`${id} ${view} matches the frozen canvas`, async ({ page }) => {
      await page.goto(`/?view=${view}`);
      await page.getByRole('tab', { name: label, exact: true }).click();
      await expect(page.locator('[data-theme-preset]')).toHaveAttribute('data-theme-preset', id);
      await waitForSceneBackground(page);
      await expect(page.locator('.theme-playground')).toHaveScreenshot(`${id}-${view}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.002,
      });
    });
  }
}
