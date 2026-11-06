# Design Lab · Token 编译车间

一条可以跑通的设计管线：**源 JSON → 解析 → 多目标产物 → 门禁 → 实验台**。
骑行（`cycling/`）只是参考实例；`ledger/` 是第二个品牌包（白标），用来证明管线与品牌无关。
当前 **2 品牌 × 2 主题 = 4 套排列**，共用同一套 core、组件与产品语义。

```
tokens/*.json  ──▶  编译器（解析 / 换算 / 分级）  ──▶  CSS · WXSS · TS · DTCG · AI 上下文
                          │
                          └──▶ 门禁：主题完整性 / 白名单 / 分层方向 / 对比度 / 硬编码扫描 / 契约可解析
                          └──▶ 实验台：排列矩阵 · 实例三屏 · 动效回放 · 审计 · Token 表
```

## 快速开始

```bash
cd design-lab
npm install
npm run tokens      # 编译：src/generated/*
npm run lint:tokens # token 门禁
npm run weapp       # 构建小程序包 + 校验 var() 覆盖
npm run test        # @ds/core 单测
npm run visual      # PR 级视觉回归（4 套排列 × 3 屏）
npm run proposal -- agents/examples/01-add-night-notice.json   # Token 提案预检
npm run verify      # tokens + lint + weapp + 提案门禁契约测试
npm run dev         # 实验台 http://localhost:4517
npm run build       # verify + 类型检查 + 打包
```

`src/generated/` 是**提交入库**的：产物进版本库，PR diff 里能直接看到值的变化，
CI 会检查"生成物是不是最新的"。

## 目录

```
design-lab/
├── pipeline/
│   ├── pipeline.config.mjs      # 唯一一处声明：哪些文件组成一个品牌、一套主题
│   ├── tokens/                  # 与品牌无关的 core
│   │   ├── core/primitive.tokens.json   # 色阶与刻度（业务不可引用）
│   │   ├── core/semantic.tokens.json    # 用途语义（品牌唯一的覆盖入口）
│   │   ├── core/themes/dark.tokens.json # 深色只补差值
│   │   └── component/component.tokens.json
│   ├── compiler/
│   │   ├── resolve.mjs          # 合并 → 归一化 → 交给 Style Dictionary 解别名
│   │   ├── normalize.mjs        # 友好写法 → 规范 DTCG 值
│   │   ├── format.mjs           # 值 → 各平台字符串（px / rpx / cubic-bezier …）
│   │   ├── emit.mjs             # 产物渲染
│   │   └── qa.mjs               # 对比度配对与计算
│   └── lint/run.mjs             # 6 条门禁
├── cycling/                     # 参考实例：品牌包 + 产品语义 + 契约
│   ├── tokens/{brand,dark,product}.tokens.json
│   └── contracts/*.component.json
├── ledger/                      # 第二个品牌包：只换视觉，不碰结构
│   └── tokens/{brand,dark}.tokens.json
├── agents/                      # 两个闭环的契约与示例（提案 / 生成）
├── packages/
│   ├── ds-core/                 # headless：输入 → ViewModel（纯函数 + 单测）
│   └── ds-weapp/                # 小程序组件：WXML/WXSS，只吃 tokens.wxss
├── src/
│   ├── generated/               # 产物（勿手改）
│   ├── components/ui.tsx        # 只吃 token 的通用组件（VM 来自 ds-core）
│   ├── cycling/screens.tsx      # 三屏实例
│   └── lab/*                    # 实验台各面板
└── docs/adr/                    # 三个关键取舍
```

依赖方向是单向的：

```
pipeline（源 + 编译器）
      │  产物
      ▼
generated ──▶ ds-core（VM） ──▶ components ──▶ screens ──▶ lab
                    │
                    └──▶ ds-weapp（WXML/WXSS，吃 tokens.wxss）
```

`cycling/` 不能反向被 `pipeline/` 依赖；`components/` 里不许出现业务词；
`ds-core` 不 import 任何 token 或样式；`ds-weapp` 不 import 任何品牌值。

## 三个概念

**分层**：`primitive`（原色，禁止业务引用）→ `semantic`（用途）→ `component`（组件私有）。
品牌包和产品语义是**扩展位**，不是新的一层；品牌包只能覆盖白名单里的 ~20 个键。

**两轴**：排列 = `品牌 × 主题`，两个轴正交。深色只补差值（骑行 53 个、记账 57 个变量），
新增排列不需要复制组件样式。风格（运动 / 户外 / 生活记录）是品牌包内部的选择，
不是第四个维度——这样 3 种风格不会变成 6 套组件。

**品牌包能改什么**：`brand.palette` · `color.{brand,surface,ink,action,border}` · `radius.*` ·
`type.{display,title,metric}.*` · `elevation.*` · `motion.easing.*`。白名单之外一律拦截。

**白标怎么成立**：产品语义引用品牌意图（`route.primary → {color.action.primary}`），
而不是引用原始色阶。所以换品牌，骑行界面连地图配色和明信片邮戳都会跟着换，结构一行不动。

**单位**：源文件按 `px @ 375` 书写。Web 输出 px；小程序输出 rpx（×2）；
`1px` 发丝线永远保持 px，不随屏宽缩放。换算只发生在 `format.mjs` 一处。

## 产物

| 文件 | 用途 |
| --- | --- |
| `tokens.css` | Web：`:root` + `[data-theme="dark"]`，CSS 变量 |
| `tokens.wxss` | 小程序：`page` 上的变量 + `@media (prefers-color-scheme: dark)` + `.theme-dark` 手动切换 |
| `tokens.ts` | 类型安全取值 + `cssVar()`，同一份值不重复维护 |
| `dtcg/*.tokens.json` | DTCG 2025.10 规范交换产物（已解析为最终值） |
| `catalog.json` | 实验台的 Token 表数据源 |
| `qa.json` | 对比度报告，实验台直接渲染 |
| `design-context.json` | 给 AI 的设计上下文：可引用 token、组件契约、硬规则、深色差值 |
| `manifest.json` | 产物清单与体积，编译带直接渲染 |

## 门禁

| 规则 | 说明 | 级别 |
| --- | --- | --- |
| 主题完整性 | light / dark 键集合必须一致，不允许只在一边新增 | error |
| 品牌包白名单 | 越权覆盖（例如改 `space.*`）直接失败 | error |
| 分层依赖方向 | 组件 token 引用色阶即失败；颜色必须走语义层 | error |
| 对比度 | 15 组配对 × 4 套排列 = 60 项，AA 阈值按用途区分 | error |
| 组件契约可解析 | 契约里引用的 token 必须存在且公开 | error |
| 禁止硬编码颜色 | 扫描 `src/**`，`#hex` / `rgb()` / `hsl()` 一律拦 | error |
| 未被引用的语义 token | 提示，不阻断 | info |

## 通用性的验收

骑行实例（发现 / 骑行结束 / 明信片）覆盖三种密度：列表、数据、情绪化卡片。
验收方式不是"再画三个页面"，而是**加一个视觉完全相反的品牌包**：

- 只新增 `ledger/tokens/*.json` + `pipeline.config.mjs` 一个条目；
- 组件、页面、产品语义、门禁一行不改；
- 结果：同一个骑行界面换品牌后，字体（衬线→无衬线）、圆角（18px→10px）、
  强调色（柠檬绿→砖红）、阴影、缓动全部改变，对比度仍然全过。

边界：`ledger` 仍是行驶在骑行产品上的白标。真正的"第二个产品"需要把 `product`
从品牌里拆成 `app` 层（`app × brand × theme`），配置里已预留位置。见 [ADR-0004](docs/adr/0004-second-brand-pack.md)。

## 分层怎么落到代码里

| 包 | 职责 | 不允许 |
| --- | --- | --- |
| `@ds/core` | 格式化、ViewModel、动效意图 | 引 token、引样式、返回函数 |
| `src/components` | React 展示层，只用 `var()` | 硬编码颜色、业务词 |
| `@ds/weapp` | 小程序组件，WXML/WXSS | 品牌值、颜色字面量 |
| `cycling/`、`ledger/` | 品牌包 + 产品语义 + 契约 | 被上层反向依赖 |

`ds-weapp` 的构建脚本本身就是一道门禁：组件 wxss 里每个 `var(--x)` 必须在 `tokens.wxss` 里存在，
出现 `#hex` / `rgb()` 直接失败。

## 视觉回归

两级，共用同一套对比实现与 0.6% 阈值。详见 [docs/visual-regression.md](docs/visual-regression.md)。

| 级别 | 命令 | 何时跑 | 基线 |
| --- | --- | --- | --- |
| PR 级 | `npm run visual` | 每次提交 | `tests/visual/baselines/`（macOS 生成） |
| 发布级 | `npm run visual:weapp -- --strict` | 发版前 | `tests/visual/weapp/` |

已验证门禁有效：把主色从柠檬绿换成玫红，`cycling-light` 报 3.71%，其余三张 0%。

## Agent 闭环

两个闭环，契约驱动，不用提示词堆可靠性。详见 [agents/README.md](agents/README.md)。

```
提案：TCP JSON → npm run proposal 预检 → 改源文件 → verify → visual → PR
生成：读 design-context.json → 只用现有 token/组件 → lint 与契约校验 → 实验台 → PR
```

提案预检回答四件事：结构、品牌白名单、影响面、对比度与主题完整性。
示例是一组契约测试（1 通过 / 2 拦截），挂在 `npm run verify` 里：

| 示例 | 结果 |
| --- | --- |
| 新增 `color.action.notice`（双主题） | 通过，影响 2 套排列 |
| 主色换成深绿 | 拦截：`on-primary` 1.52:1 |
| 改 `space.page` | 拦截：不在品牌白名单 |

## 当前边界

> 还没做（按顺序）：

1. 页面级 recipe schema：现在能校验组件契约，还校验不了"页面组合"；
2. `app` 层拆分：支持"不同产品 × 不同品牌"，而不只是白标；
3. 真机验证：仓库里没有小程序工程，weapp 只有静态校验 + 待接入的截图脚本。

## 已知取舍

- 源文件是"友好格式"（`"#B9D58A"`、`"18px"`），DTCG 规范值由编译器产出。见 [ADR-0001](docs/adr/0001-friendly-source.md)。
- 单份构建 + CSS 变量做运行时主题，而不是编译多套包。见 [ADR-0002](docs/adr/0002-runtime-theming.md)。
- Style Dictionary 只负责解析别名，输出格式自己写。见 [ADR-0003](docs/adr/0003-resolver-only.md)。
- 第二个品牌包用白标来验收通用性；密度（spacing）故意留在 core。见 [ADR-0004](docs/adr/0004-second-brand-pack.md)。
