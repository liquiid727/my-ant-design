# ADR-0008 · antd 是投影目标，不是第二个设计系统

**状态**：已采纳（P0 垂直切片：noir）

## 背景

design-lab 自己渲染品牌产品 UI（Web + 小程序），组件只有 7 个；生产后台需要表格、表单、
日期、权限这类"没人愿意自己写"的东西，antd 有 75 个组件和成套交互规范。

两条路都试过、都被否掉：

- 给 design-lab 补组件 → 等于重写 antd，投入以年计且永远追不上；
- 让 studio 反向依赖 design-lab 的代码 → 两个独立项目的发布节奏被绑死。

真正该共享的是**语义**，不是模块。

## 决定

**一份 token 源，两个渲染器。** antd 成为 design-lab 的第 5 个产物目标，与 CSS / WXSS / TS / DTCG 并列：

```
design-lab（语言层，唯一真源）
  └─ emitAntd → src/generated/antd/{brand}.{theme}.json  →  后台的 ConfigProvider theme
```

- 新增 `packages/ds-antd`：纯函数 `projectTheme(set) → { config, missing }`，无依赖、可单测；
- 映射表 `TOKEN_MAP` 是显式的，一行一个 token，**缺任何一个路径就让编译失败**；
- 只读 semantic / brand 层，所以 ride 与 ledger 得到同一份主题（产品语义不进后台）；
- noir 是第一个切片，原生渲染（`tokens.ride.css` 里的 `[data-brand="noir"]`）完全保留，
  antd 主题只是另一种输出类型。

## 发现

1. **92 个 semantic 里只有约 20 个该进后台**。`route.*` / `transaction.*` / `type.display.*` /
   `type.metric.*` 属于品牌产品 UI，映射过去只会污染 antd 的语义。这个比例本身就是
   "design-lab 不需要更多组件"的证据。
2. **触控密度不能直接进桌面**。`size.control-height` 是 44px，映射后后台的输入框、表格都会变高。
   当前选择忠于品牌（noir 的胶囊按钮是身份的一部分），紧凑后台由消费端覆盖 `controlHeight`
   或改用 `compactAlgorithm`，而不是在源里改。
3. **antd 的主按钮默认带一层蓝调阴影**（`0 2px 0 rgba(5,145,255,0.1)`）。noir 的主色是纯黑，
   这层蓝晕会脏，所以组件级覆盖里 `primaryShadow` / `defaultShadow` 置为 `none`——
   组件覆盖只动"品牌身份绕不过去"的地方。
4. **两套暗色无法合并**。design-lab 的 dark 是 32 个差值，antd 的 dark 是算法。
   产物用 `algorithm: 'dark'` + 品牌覆盖色，只保证身份一致，不追求像素一致。

## 门禁（P1）

- **覆盖率**：语义词汇表 92 个键必须逐个归类（映射 36 / 显式排除 56）。新增语义键而未决定去向，
  编译直接失败。理由写在 `EXCLUDED` 里，和映射表放在同一个文件。
- **对比度**：把投影后的 CSS 颜色解析回 DTCG，跑 10 组后台配对 × 6 套主题。这一层是必要的，
  因为它验证的是**产物**而不是源——投影本身也可能写错（`motionDuration*` 就曾把 `'0.22s'`
  写成 `220`，被类型检查抓到）。
- 边框配对按 antd 自己的基线（1.41:1）只做「没有消失」检查：antd 默认主题本身就不满足
  WCAG 1.4.11 的 3:1，不拿比框架更高的标准要求品牌。

## 后果

- 好处：后台白拿 antd 的组件与交互，品牌身份由 token 保证；design-lab 不必向"组件库"方向膨胀。
- 代价：hover / active 这类派生色仍归 antd 算法，与品牌 UI 有细微色差；
  产物多 6 个 JSON + 1 个 index，`npm run tokens` 的产物清单变长。
- 边界：**不做**品牌 UI 与后台 UI 的像素一致；**不做** studio 对 design-lab 的运行时依赖；
  studio 仍是独立的生产管理后台，通过导入 JSON 消费这些主题。
