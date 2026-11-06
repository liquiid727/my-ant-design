# 资源页的图标与预览

`src/lab/resources.ts` 里每条资源都有一张图标，前四条另有页面截图。两者都是**第三方资产**，
只用于识别与链接，版权归原项目；这里记清楚每个文件从哪来，方便以后替换或下架。

## 图标

统一处理：抓下原始图标，在白底 `#f4f4f5` 的圆角方块里以 76/128 的比例居中，
用 Playwright 以 2× 渲染成 256×256 PNG（`src/assets/res/{id}.png`）。
白底是为了让深浅两色的 logo 都站得住，同时也让 20 个图标看起来像一排 app icon。

| 文件 | 来源 |
| --- | --- |
| `stylekit.png` | https://www.stylekit.top/brand/v3/icon.svg |
| `taste-skill.png` | https://www.tasteskill.dev/apple-touch-icon.webp |
| `style-dictionary.png` | https://styledictionary.com/favicon.png |
| `dtcg.png` | https://www.designtokens.org/favicon.ico |
| `terrazzo.png` | https://terrazzo.app/favicon.ico |
| `radix-colors.png` | https://www.radix-ui.com/favicon-black.svg |
| `video-shotcraft.png` | https://github.com/Vincentwei1021/video-shotcraft/blob/main/assets/brand/logo-mark.svg |
| `motion.png` | https://motion.dev/favicon.svg |
| `theatre.png` | https://www.theatrejs.com/logo_square.png |
| `react-bits.png` | https://reactbits.dev/favicon.ico |
| `lottie.png` | https://cdn.simpleicons.org/airbnb/FF5A5F（Lottie 出自 Airbnb；项目本身没有独立图标，用 bélo 代替） |
| `impeccable.png` | https://impeccable.style/favicon.svg |
| `web-interface-guidelines.png` | https://vercel.com/favicon.ico |
| `axe-core.png` | https://github.com/dequelabs.png |
| `playwright.png` / `playwright-mcp.png` | https://playwright.dev/img/playwright-logo.svg |
| `pixelmatch.png` | https://github.com/mapbox.png |
| `storybook.png` | https://storybook.js.org/icon.svg |
| `skills-cli.png` | https://skills.sh/favicon.ico |
| `chrome-devtools-mcp.png` | https://github.com/ChromeDevTools.png |

替换时保持同一套处理方式，否则一排白底方块会立刻显得参差。

## 预览图

`preview-{id}.jpg` 是 2026-11-06 用 Playwright 对四个站点首页/主页面截的 1280×800 视口图，
向下滚一段触发懒加载后回到顶部再截，最后缩到 900×562、JPEG 72。

| 文件 | 页面 |
| --- | --- |
| `preview-stylekit.jpg` | https://www.stylekit.top/zh/styles |
| `preview-impeccable.jpg` | https://impeccable.style/slop |
| `preview-taste-skill.jpg` | https://www.tasteskill.dev/ |
| `preview-video-shotcraft.jpg` | https://vincentwei1021.github.io/video-shotcraft/ |

站点改版后截图会过期；这些图只用于"它长什么样"，判断功能仍然去各自仓库。
