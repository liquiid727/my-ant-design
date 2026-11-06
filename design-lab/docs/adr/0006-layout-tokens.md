# ADR-0006 · 布局作为 token，断点在编译期展开

**状态**：已采纳（M2）

## 背景

到 M2 为止，页面只有一套手机布局：744 宽下还是单列，两侧大量留白。
需要引入"布局层"，但有两个陷阱：

1. **断点不能是 CSS 变量**。`@media (min-width: var(--x))` 不合法，媒体查询在解析期就要确定值。
2. **媒体查询看的是视口，不是组件**。实验台把 375 宽的手机样机放在 1440 宽的页面里，
   用 `@media` 会让所有样机同时变成"平板布局"——这个坑已经踩过一次（首屏列表在手机样机里变成两列）。

## 决定

- 新增布局 token（与产品或品牌都无关）：
  `layout.breakpoint.{tablet,wide}` · `layout.gutter.{phone,tablet}` ·
  `layout.content.max-{phone,tablet}` · `layout.columns.{phone,tablet}`。
- **断点由编译器展开成字面量**（`@container (min-width: 600px)`），
  其余（gutter / 内容宽度）仍然是 CSS 变量。
- 用**容器查询**而不是媒体查询：`.phone-screen`、`.reality-body` 声明 `container-type: inline-size`，
  `.screen` 与 `[data-cols='2']` 在容器内响应。手机样机只有 375 宽时永远命中 compact。
- 组件用 `data-cols="2"` 声明"我这一块在宽容器里可以两列"，具体列数由生成的样式决定。

## 后果

- 好处：同一份 `.screen` 在 375 与 744 下真的不一样；断点改了只改 JSON，重新编译即可；
  容器查询让"样机尺寸"与"页面尺寸"解耦，实验室里看到的才是真实结果。
- 代价：容器查询需要 Chrome 105+ / Safari 16+；微信小程序 WebView 不支持（老基础库更不行），
  所以 WXSS 产物里没有这段布局规则，小程序侧要么用页面级 class + `matchMedia`，要么等 Skyline。
- 约束：`.screen` 必须有 `container-type` 的祖先才能响应；页面里直接用它时，需要自己包一层。
- 附带修复：`RouteCard` 从 `src/components` 移到 `src/apps/ride`——它是骑行产品组件，
  通用组件里出现它会让"产品语义不越界"这条 lint 直接失效。
