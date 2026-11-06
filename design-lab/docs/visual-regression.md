# 视觉回归分级

像素回归在小程序上的难点是"渲染在哪"。Playwright 渲染不了 WXSS，开发者工具截图慢且依赖 GUI。
所以分成两级，各自回答不同的问题。

| 级别 | 工具 | 频率 | 回答什么 | 保真度 |
| --- | --- | --- | --- | --- |
| PR 级 | Playwright + 实验台 DOM 截图 | 每次提交 | 有没有把别的排列/屏幕改坏 | 中（Web 渲染，但用的是同一份 CSS 变量与组件） |
| 发布级 | `miniprogram-automator` + 开发者工具 | 发版前 | 真机渲染下是否一致 | 高（WXSS 真实渲染） |

两级共用同一套对比实现（`scripts/lib/visual-compare.mjs`）和同样的 0.6% 阈值。

## PR 级

```bash
npm run build          # 先有 dist
npm run visual         # 对比基线
npm run visual:update  # 改完设计后重写基线
```

- 覆盖 4 套排列（2 品牌 × 2 主题）× 骑行三屏；
- 基线在 `tests/visual/baselines/`，**提交入库**；
- 超过阈值时差异图写到 `tests/visual/diff/`（gitignore）；
- 已验证有效：把 `color.action.primary` 从柠檬绿换成玫红，`cycling-light` 报 3.71%，
  其余三张 0%（因为深色与 ledger 各自覆盖了主色）。

**基线是平台相关的。** 当前基线在 macOS 上生成，CI 的视觉任务因此跑在 `macos-latest`；
换平台（Linux 容器 / 不同 macOS 版本）需要 `npm run visual:update` 重新生成，并单独提交。

## 发布级

```bash
MINIAPP_PROJECT=/path/to/miniapp \
WECHAT_DEVTOOLS_CLI=/Applications/wechatwebdevtools.app/Contents/MacOS/cli \
npm run visual:weapp

npm run visual:weapp -- --strict   # 发布流程：缺环境直接失败
npm run visual:weapp -- --update   # 更新基线
```

- 需要真实小程序工程 + 微信开发者工具；本仓库没有，所以默认**跳过**并返回 0；
- `--strict` 时缺环境返回 1，适合放进发布流水线；
- 基线在 `tests/visual/weapp/`，同样提交入库；
- 它验证的是：同一份 `tokens.wxss` + 同一批组件，在真实渲染器里的样子。

## 不覆盖什么

- 真机（iOS / Android 不同 WebView 版本）的字体与滚动差异；
- 动画中间帧（只截稳定态）；
- 组件库的交互状态矩阵（那是 `design-lab` 的状态画廊要补的）。

## 为什么阈值是 0.6%

低于 0.6% 的差异基本来自抗锯齿和字体 hinting，肉眼不可见；
高于它通常意味着布局或颜色真的变了。改阈值只改一个常量，两处脚本共用。
