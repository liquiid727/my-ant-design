# @ds/antd · design-lab → Ant Design 的投影

把 design-lab 的 semantic token 投影成 antd `ThemeConfig`，供生产后台使用。
产物在 `src/generated/antd/`：每个品牌 × 主题一份 JSON，外加一份 `index.ts` 汇总。

**这是一次投影，不是翻译。** design-lab 有 92 个 semantic token，只有二十来个该进入后台。

## 边界

| 进入 antd | 不进入 antd | 原因 |
| --- | --- | --- |
| 颜色（surface / ink / border / status / action） | `route.*`、`transaction.*` | 产品语义，后台没有这些概念 |
| 圆角、间距、动效、阴影 | `type.display.*`、`type.metric.*` | 品牌产品 UI 的排版，后台不需要 |
| `type.body` / `type.data` 字体与字号 | `size.touch-min`、`size.nav-height` | 触控尺寸，桌面端没有对应物 |

## 三个已知冲突

1. **触控密度 vs 桌面密度**。`size.control-height` 是 44px 的触控高度，映射后后台的输入框、按钮、表格都会变高。当前选择「忠于品牌」，如果你要紧凑后台，在消费端把 `controlHeight` 覆盖回 32 或使用 antd 的 `compactAlgorithm`。
2. **色阶归属**。antd 从 `colorPrimary` 算法派生十阶，design-lab 是显式色阶。这里只覆盖 seed + 关键 alias，派生色仍归 antd 算法——所以 hover / active 的细微色差会与品牌 UI 不同。
3. **两套暗色**。design-lab 的 dark 是 32 个差值，antd 的 dark 是算法。产物用 `algorithm: 'dark'` + 品牌覆盖色，两者不会像素一致，只保证身份一致。

## 用法

```ts
import { ConfigProvider, theme } from 'antd';
import { antdThemes } from './generated/antd';

<ConfigProvider
  theme={{
    ...antdThemes['noir.light'],
    algorithm: theme.defaultAlgorithm,
  }}
>
```

`antdThemes` 的键是 `brand.theme`：`noir.light`、`noir.dark`、`cycling.light`……

## 门禁

`npm run tokens` 会跑两道门，任何一道不过就中断编译：

1. **覆盖率**：`semantic.tokens.json` 里的 92 个键，要么在 `TOKEN_MAP` / `COMPONENT_MAP` 里，
   要么在 `EXCLUDED` 里带理由地排除。新增一个语义键却没决定它在 antd 里的去向，编译失败——
   「不映射」必须是一个决定，而不是遗漏。当前 36 映射 / 56 显式排除。
2. **对比度**：把投影出来的 CSS 颜色解析回 DTCG，跑 10 组后台真实配对 × 6 套主题 = 60 组。
   边框那组按 antd 自己的基线（1.41:1）只做「没有消失」检查，文字仍是 AA 4.5:1。

外加一条硬约束：映射表里任何路径取不到值，`emitAntd` 直接抛错——后台不能带半张主题出去。
