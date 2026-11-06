# ADR-0002 · 单份构建 + CSS 变量，运行时切换主题

**状态**：已采纳（M1）

## 背景

小程序要做深色主题，有三条路：

1. 编译两套主题包，按需加载；
2. 编译两套 WXSS，用 `page[data-theme]` 切换；
3. **一份产物 + CSS 自定义属性**，在 `page` 上定义变量，深色块只覆盖差值。

同时还要支持运行时切换（用户手动选择），而小程序原生能力（导航栏、tabBar、map）
不受 CSS 变量控制，必须另有 `theme.ts` 调用 `wx.setNavigationBarColor`。

## 决定

- 选方案 3。`tokens.wxss` 输出：
  - `page { … }` 浅色全量（自定义属性会继承进自定义组件，不受 styleIsolation 影响）；
  - `@media (prefers-color-scheme: dark) { page { … } }` 跟随系统（需 `app.json` 开 `darkmode`）；
  - `.theme-dark` / `.theme-light` 供手动切换（class 特异性高于 `page`）。
- 深色块只写差值（当前 53 个变量），保证"加一个 token"不会逼你写两遍。
- 原生能力（导航栏 / tabBar / map 样式）由运行时 `theme.ts` 处理，不由 CSS 负责。

## 后果

- 好处：单包体积可控；主题切换零构建；变量的继承天然穿透组件边界。
- 代价：`tokens.wxss` 里有四份块（浅色全量 + 深色 ×3 份），体积约 22 KB；
  如果继续膨胀，再按"全量 + 差值"拆分并按需 `@import`。
- 约束：组件样式必须 100% `var()` 驱动。这是 P0 规则，硬编码颜色由 lint 拦截。
