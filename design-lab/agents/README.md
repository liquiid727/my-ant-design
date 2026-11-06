# Agent 闭环

这里不托管"六个 Agent"，只托管**两个闭环**和它们必须遵守的机器可读契约。
Agent 的可靠性来自约束，不来自提示词。

```
① 提案闭环
   Agent 想加/改 token
        ↓  写 Token Change Proposal（JSON，不直接改文件）
   scripts/proposal.mjs 预检
        │  结构 / 品牌白名单 / 影响面 / 对比度 / 主题完整性
        ├─ 失败 → 改提案，不落盘
        └─ 通过 → 人改 tokens 源文件（或 Agent 按提案改）
                   → npm run verify → npm run visual → PR

② 生成闭环
   Agent 要写页面
        ↓  读 design-context.<app>.json（token / 组件契约 / 硬规则）
   写 Page Recipe（JSON：用了哪些组件、什么 props）
        ↓
   npm run recipe 校验：组件在契约里、props 匹配、token 公开存在、无颜色字面量
        ├─ 失败 → 改配方，不落盘
        └─ 通过 → 落成页面代码 → 实验台 → 视觉回归 → PR
```

## 唯一约束

`design-context.json` 是 Agent 的输入，也是评审的依据：

- `tokens`：业务可见的 token 清单（含值）；
- `components`：组件契约（props / states / 允许使用的 token）；
- `rules`：硬规则（不许硬编码、不许引用原色、深浅必须成对…）；
- `darkOverrides`：深色差值，改浅色时能立刻看到深色是否要跟着动。

每个品牌一份：`design-context.json`（默认品牌）与 `design-context.<brand>.json`。

## 提案格式

见 `token-proposal.schema.json`。最小示例：

```json
{
  "id": "tcp-add-night-notice",
  "author": "agent",
  "intent": "夜间骑行需要一个低饱和的提示色",
  "rationale": "status.warning 是给错误提示用的，夜间需要更柔和的提醒",
  "scope": { "brand": "cycling", "theme": "both" },
  "changes": [
    { "op": "add", "path": "color.action.notice", "type": "color", "value": "{color.ramp.amber.400}" }
  ]
}
```

```bash
npm run proposal -- agents/examples/01-add-night-notice.json
npm run proposal -- agents/examples/02-break-contrast.json --json
```

预检会回答四件事：

| 检查 | 例子 |
| --- | --- |
| 结构 | `op` / `type` / `value` 是否齐全，路径是否合法 |
| 品牌白名单 | 改 `space.page` 会被拦（间距属于 core，见 ADR-0004） |
| 影响面 | 改一个 `color.action.primary` 会连带 `route.primary` / `button.bg` / `ring.fill` |
| 对比度 + 主题完整性 | 深绿主色 → `on-primary` 1.52:1；只改浅色 → `dark 缺少 …` |

`scripts/check-proposals.mjs` 把这三个例子做成契约测试（1 通过 / 2 拦截），挂在 `npm run verify` 里。

## 页面配方（Recipe）

见 `page-recipe.schema.json`。配方只描述"用哪些组件、传什么 props"，不描述样式。

```json
{
  "id": "recipe-ride-home",
  "app": "ride",
  "page": "pages/home/index",
  "sections": [
    {
      "component": "RouteCard",
      "props": { "title": "西湖西溪绿道", "distanceKm": 23.4, "elevationM": 218, "surface": "mixed" },
      "tokens": ["card.radius", "color.route.primary"]
    }
  ]
}
```

```bash
npm run recipe -- agents/examples/04-ride-home.recipe.json
npm run recipe -- agents/examples/05-ride-home-broken.recipe.json --json
```

校验四件事：

| 检查 | 拦截示例 |
| --- | --- |
| 组件必须在该产品的契约里 | `PrimaryButton` → 只有 Action / Metric / ProgressRing / RouteCard |
| props 必须匹配契约 | 未知 `theme`、缺失必填、枚举越界（`surface: "trail"`） |
| 不能写颜色 | `accent: "#B7CE5E"` |
| token 必须公开存在 | `color.ramp.lime.500`（内部原色） |

`scripts/check-recipes.mjs` 同样做成契约测试（1 通过 / 1 拦截），挂在 `verify` 里。

## Agent 不许做什么

- 不许在 WXSS / TSX 里写颜色字面量（lint 会拦）；
- 不许直接引用 `color.ramp.*` 或 `brand.palette.*`（分层门禁会拦）；
- 不许只加浅色值（主题完整性会拦）；
- 不许绕过提案直接改 `pipeline/tokens/core/**`（那是跨品牌行为，需要 ADR）。

## 还缺什么

- recipe → 代码的生成器（当前只校验，不生成）；
- 生成结果的自动打分（视觉差异是否可接受仍靠人看基线）；
- Agent 运行时（本仓库只提供契约与门禁，不绑定具体模型或框架）。
