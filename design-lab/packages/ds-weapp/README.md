# @ds/weapp · 微信小程序组件

WXML / WXSS / JS 三件套，样式**只**引用 `tokens.wxss` 里的自定义属性。
组件不知道品牌是谁，也不知道业务是什么。

## 接入

1. 构建：

```bash
npm run weapp     # design-lab 根目录，产物在 packages/ds-weapp/dist
```

2. 把 `dist/tokens.wxss` 引进 `app.wxss`（全量只进一次）：

```css
@import '/packages/ds-weapp/dist/tokens.wxss';
```

3. 页面里引用组件：

```json
{
  "usingComponents": {
    "ds-action": "/packages/ds-weapp/dist/components/action/index",
    "ds-metric": "/packages/ds-weapp/dist/components/metric/index",
    "ds-ring": "/packages/ds-weapp/dist/components/progress-ring/index"
  }
}
```

4. 数据来自 `@ds/core`，颜色来自生成的 `tokens.ts`：

```js
import { metricVM, ringVM } from '@ds/core';
import { light } from '/packages/ds-weapp/dist/tokens';

Page({
  data: {
    distance: metricVM({ kind: 'distance', value: 23.4, label: '距离' }),
    ring: ringVM(0.78),
    ringColors: {
      track: light['color.surface.sunken'],
      fill: light['color.action.primary'],
    },
  },
});
```

```html
<ds-metric value="{{distance.value}}" unit="{{distance.unit}}" label="{{distance.label}}" aria-label="{{distance.ariaLabel}}" />

<ds-ring
  value="{{ring.ratio}}"
  size="{{96}}"
  stroke="{{6}}"
  track="{{ringColors.track}}"
  fill="{{ringColors.fill}}"
  aria-label="{{ring.ariaLabel}}"
>
  <ds-metric value="{{distance.value}}" unit="{{distance.unit}}" label="完成目标" />
</ds-ring>
```

## 为什么每个值都要走 token

- 组件 wxss 里出现 `#hex` / `rgb()` 会被 `npm run weapp` 直接拦下；
- 组件用到的每个 `var(--x)` 都必须在 `tokens.wxss` 里真实存在，否则构建失败；
- 因此换品牌 / 换主题时，组件不需要改一行代码，`page` 上的变量会继承进来。

## 环形的实现

小程序没有 SVG，`ds-ring` 用 `canvas type="2d"` 画（按 `pixelRatio` 缩放）。
颜色通过属性传入——组件不内建任何品牌色，这正是它能在两个品牌包下都好用的原因。

## 已知边界

- 组件逻辑没有在真机跑过（本仓库没有小程序工程）。构建脚本做的是静态校验：
  变量覆盖、结构完整、无颜色字面量。真机与截图回归是下一步（视觉回归分级）。
- 按压反馈用 `hover-class`；如果要做更细的跟手动画，需要 `wx.createAnimation` 或 Skyline。
