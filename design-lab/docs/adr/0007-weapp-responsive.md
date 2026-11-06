# ADR-0007 · 小程序的响应式兜底与宽屏字号

**状态**：已采纳（M2）

## 背景

[ADR-0006](0006-layout-tokens.md) 用容器查询解决了 Web 侧的布局档位，但微信小程序 WebView
不支持 `@container`，WXSS 里那段规则等于不存在。同时，宽屏下字号仍是手机尺寸——内容宽度变了，
阅读密度没变，平板上会显得又小又空。

## 决定

**1. 同一套断点，两种表达**

| 目标 | 表达 | 来源 |
| --- | --- | --- |
| Web / 实验台 | `@container (min-width: 600px)` | 编译器把断点展开成字面量 |
| 小程序 | `.layout-medium` / `.layout-expanded` 两个 class | `runtime/layout.js` 按 `windowWidth` 计算 |

两个 class 覆盖的变量完全一致（`--layout-gutter`、`--layout-content-max`、整套字号），
所以"同一屏在平板上长什么样"在两端是同一份定义。

`runtime/layout.js` 由 `packages/ds-weapp/scripts/build.mjs` 生成，断点值从
`catalog.<app>.json` 里读——不在运行时重复维护一份常量。

**2. 宽屏字号在编译期放大**

- token：`layout.scale.type.tablet = 1.08`；
- 编译器挑出所有"排版尺寸"（`type.*`、别名为 `type.*` 的组件 token、以及 `metric.*-size` 这类字面值），
  乘以系数后写进宽屏块；
- 不做运行时 `calc()` 乘法：产物里是最终像素值，WXSS 与 CSS 都能直接跑，diff 也可读。

## 后果

- 好处：两端行为一致；字号调整只改一个系数；产物里没有运行时计算。
- 代价：宽屏块会把所有排版尺寸再写一遍（约 20 行 × 2 个 class），token 越多块越大。
- 遗留：间距只放大了一档（`layout.gutter`），字号与间距的比例在平板下还不完全成体系；
  `.route-map` 这类固定高度也还没跟着档位走。
