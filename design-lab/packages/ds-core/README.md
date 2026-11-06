# @ds/core · Headless 逻辑

输入 → ViewModel，纯函数，零依赖，不认品牌、不碰样式。

## 为什么是 ViewModel 而不是 hooks / 工具类

小程序的 WXML **不能调用函数**，也不能写复杂表达式。所以"headless"在这个目标平台上只有一种实现方式：
**在 JS 里把所有要显示的东西算好**，WXML 只做插值。

于是 core 的契约被定死为：

```ts
type MetricVM = { value: string; unit: string; label: string; tone: Tone; ariaLabel: string };
```

- 只有数据，没有函数、没有组件、没有 Promise；
- 同一份 VM 可以喂给 React 组件，也可以喂给 WXML 的 `setData`；
- 品牌只影响样式（CSS 变量），不影响 VM。

## API

```ts
import { formatDistance, metricVM, routeCardVM, ringVM, planMotion } from '@ds/core';

formatDistance(23.44);              // { value: '23.4', unit: 'km' }
formatDistance(0.4);                // { value: '400', unit: 'm' }  ← 不足 1km 换单位
formatDuration(95);                 // { value: '1:35', unit: '' }
metricVM({ kind: 'elevation', value: 218, label: '累计爬升' });
// { value: '218', unit: 'm', label: '累计爬升', tone: 'default', ariaLabel: '累计爬升 218 m' }

routeCardVM({ title: '西湖西溪绿道', distanceKm: 23.4, elevationM: 218, durationMin: 95 });
// { title, surfaceLabel: '混合', stats: [MetricVM, MetricVM, MetricVM], ariaLabel }

ringVM(0.78);                       // { ratio: 0.78, dashOffsetFactor: 0.22, percentLabel: '78%' }

planMotion('press', { reducedMotion: false, resolve: (token) => tokens[token] });
// { play: true, durationMs: 140, easing: 'cubic-bezier(...)' }  ← 毫秒数来自编译产物，不重复维护
```

`planMotion` 刻意不内置毫秒数：token 名由 core 声明，值由调用方从 `tokens.ts` 解析。
这样"动效改了"只改 JSON，不会出现 core 里还留着一份旧时长。

## 测试

```bash
npm run test          # design-lab 根目录
```

覆盖：单位切换、时长两种读法、百分比夹取、VM 的 aria 文案、越界夹取、reduced-motion 降级。
