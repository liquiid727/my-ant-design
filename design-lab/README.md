# Design Lab · Token 编译车间

一条可以跑通的设计管线：**源 JSON → 解析 → 多目标产物 → 门禁 → 实验台**。
三个正交维度：**app（产品语义）× brand（视觉身份）× theme（明暗）**。
当前 **2 产品 × 3 品牌 × 2 主题 = 12 套排列**，共用同一套 core 与同一批组件。

```
tokens/*.json  ──▶  编译器（解析 / 换算 / 分级）  ──▶  CSS · WXSS · TS · DTCG · AI 上下文
                          │
                          └──▶ 门禁：主题完整性 / 白名单 / 分层方向 / 对比度 / 硬编码扫描 / 契约可解析
                          └──▶ 实验台：排列矩阵 · 实例三屏 · 桌面 Web · 动效回放 · 审计 · Token 表
```

## 快速开始

```bash
cd design-lab
npm install
npm run tokens      # 编译：src/generated/*
npm run lint:tokens # token 门禁
npm run weapp       # 构建小程序包 + 校验 var() 覆盖
npm run test        # @ds/core 单测
npm run visual            # 排列页基线
npm run visual:studio     # 配方渲染基线（示例配方 × 设备 × 明暗）
# 渲染结果可直接深链：#/studio?sample=1&device=desktop      # PR 级视觉回归（4 套排列 × 3 屏）
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
├── apps/                        # 产品：业务语义 + 页面契约
│   ├── ride/tokens/product.tokens.json + contracts/*.json
│   └── ledger/tokens/product.tokens.json + contracts/*.json
├── brands/                      # 品牌：只换视觉，不碰结构
│   ├── noir/tokens/{brand,dark}.tokens.json
│   ├── cycling/tokens/{brand,dark}.tokens.json
│   └── ledger/tokens/{brand,dark}.tokens.json
├── agents/                      # 两个闭环的契约与示例（提案 / 生成）
├── packages/
│   ├── ds-core/                 # headless：输入 → ViewModel（纯函数 + 单测）
│   └── ds-weapp/                # 小程序组件：WXML/WXSS，只吃 tokens.wxss
├── src/
│   ├── generated/               # 产物（勿手改）：tokens.<app>.{css,wxss,ts} 等
│   ├── components/ui.tsx        # 只吃 token 的通用组件（VM 来自 ds-core）
│   ├── apps/{ride,ledger}/screens.tsx  # 各产品的手机屏
│   └── lab/*                    # 实验台各面板（含现实界面）
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
品牌包和产品语义是**扩展位**，不是新的一层；品牌包只能覆盖白名单里的键。

**三轴**：排列 = `产品 × 品牌 × 主题`。产品决定有哪些语义键，品牌决定这些键长什么样，
主题只补差值（骑行 124 个、记账 126 个变量），
新增排列不需要复制组件样式。风格（运动 / 户外 / 生活记录）是品牌包内部的选择，
不是第四个维度——这样 3 种风格不会变成 6 套组件。

**品牌包能改什么**：`brand.palette` · `color.{brand,surface,ink,action,border}` · `radius.*` ·
`type.{display,title,metric}.*` · `elevation.*` · `motion.easing.*`。白名单之外一律拦截。

**Noir** 是把站点外壳的界面语言写成品牌包：纯黑画布、`#0E0E11` 玻璃卡、白色主操作、
22px 控制圆角 / 26px 卡片、SF Pro 系的 sans + mono 数据、深阴影。它的深色排列做成了独立的
Noir Web 示例；浅色排列是同一套语言的冷白对照。

**白标怎么成立**：产品语义引用品牌意图（`route.primary → {color.action.primary}`），
而不是引用原始色阶。所以换品牌，骑行界面连地图配色和明信片邮戳都会跟着换，结构一行不动。

**跨产品怎么成立**：组件只依赖 semantic / component 层，不碰 `route.*` / `transaction.*`。
记账两屏与骑行三屏用的是同一批组件，只是产品语义和页面不同。

**单位**：源文件按 `px @ 375` 书写。Web 输出 px；小程序输出 rpx（×2）；
`1px` 发丝线永远保持 px，不随屏宽缩放。换算只发生在 `format.mjs` 一处。

**布局**：`layout.breakpoint.*` / `layout.gutter.*` / `layout.content.max-*` / `layout.scale.type.tablet` 是 token。
断点由编译器展开成字面量，其余仍是变量；宽屏下字号按 `layout.scale.type.tablet`（1.08）在编译期放大。

- Web 示例按 `layout.scale.type.web`（1.16）在 CSS 层放大字号；手机屏仍按 375 的设计尺度。
- Web / 实验台用 `@container (min-width: 600px)`——容器查询，看的是样机宽度不是页面宽度；
- 小程序没有容器查询，产物里给的是 `.layout-medium` / `.layout-expanded` 两个 class，
  由 `@ds/weapp` 的 `runtime/layout.js` 按 `windowWidth` 挂到页面根节点上。

见 [ADR-0006](docs/adr/0006-layout-tokens.md) 与 [ADR-0007](docs/adr/0007-weapp-responsive.md)。

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
| `manifest.json` | 产物清单与体积，产出表直接渲染 |
| `changes.json` | 本次编译相对 HEAD 改了哪些产物（对照 git，**不入库**） |
| `timeline.json` | 关于页的时间线，直接来自 `git log`（**不入库**） |

## 门禁

| 规则 | 说明 | 级别 |
| --- | --- | --- |
| 主题完整性 | light / dark 键集合必须一致，不允许只在一边新增 | error |
| 品牌包白名单 | 越权覆盖（例如改 `space.*`）直接失败 | error |
| 分层依赖方向 | 组件 token 引用色阶即失败；颜色必须走语义层 | error |
| 对比度 | 15 组配对 × 12 套排列 = 180 项，AA 阈值按用途区分 | error |
| 组件契约可解析 | 契约里引用的 token 必须存在且公开 | error |
| 禁止硬编码颜色 | 扫描 `src/**`，`#hex` / `rgb()` / `hsl()` 一律拦 | error |
| 产品语义不越界 | 通用组件与小程序组件不许用 `route.*` / `transaction.*`；各 app 只能用自己产品的语义 | error |
| 未被引用的语义 token | 提示，不阻断 | info |

## 通用性的验收

骑行实例（发现 / 骑行结束 / 明信片）覆盖三种密度：列表、数据、情绪化卡片。
验收方式不是"再画三个页面"，而是**加一个视觉完全相反的品牌包**：

- 只新增 `ledger/tokens/*.json` + `pipeline.config.mjs` 一个条目；
- 组件、页面、产品语义、门禁一行不改；
- 结果：同一个骑行界面换品牌后，字体（衬线→无衬线）、圆角（18px→10px）、
  强调色（柠檬绿→砖红）、阴影、缓动全部改变，对比度仍然全过；
- 新增的 `noir` 用同样的方式再走一遍：纯黑 + 玻璃卡 + 白色主操作，作为独立的桌面 Web 示例。

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
| PR 级 | `npm run visual` | 每次提交 | 6 张基线（2 产品 × 品牌/主题组合） |
| 发布级 | `npm run visual:weapp -- --strict` | 发版前 | `tests/visual/weapp/` |

已验证门禁有效：把主色从柠檬绿换成玫红，`cycling-light` 报 3.71%，其余三张 0%。

## Agent 闭环

两个闭环，契约驱动，不用提示词堆可靠性。详见 [agents/README.md](agents/README.md)。

```
提案：TCP JSON → npm run proposal 预检 → 改源文件 → verify → visual → PR
生成：读 design-context.<app>.json → 写 page recipe → npm run recipe 校验 → 实验台 → PR
```

提案预检回答四件事：结构、品牌白名单、影响面、对比度与主题完整性。
示例是一组契约测试（1 通过 / 2 拦截），挂在 `npm run verify` 里：

| 示例 | 结果 |
| --- | --- |
| 新增 `color.action.notice`（双主题） | 通过，影响 2 套排列 |
| 主色换成深绿 | 拦截：`on-primary` 1.52:1 |
| 改 `space.page` | 拦截：不在品牌白名单 |

## 界面结构

`npm run dev` 之后是两个层级，而不是一条长滚动页：

```
#/                 首页：三个示例（Ride / Ledger / Noir）+ 方法摘要 + 三条命令
#/studio           工作台：生成/导入参考图 → 抽出配色角色 → 归一成品牌包 → 重建 + 像素 diff
                   → 自动映射页面配方 → 用配方渲染界面（可切品牌验证"只换变量"）
                   （BYO key 调 OpenAI 兼容的 /images/generations 与 /chat/completions，
                   图片只在浏览器里分析，产出 brand/dark token、visual-recipe、page-recipe）
#/method           方法：五步流程 · 生成方式 · 交付物（切产品 + 本次编译改动）
#/about            关于：为什么做、交付什么、不是什么、现在到哪了、时间线（git log · 按日期/里程碑 · 类型筛选 · 折叠）、谁做的
#/matrix?app=ride  排列矩阵：产品 × 品牌 × 主题，12 套排列一次看全
#/case/ride        示例页：Ride Atlas · 移动端 · 骑行包 · 浅色
#/case/ledger      示例页：Ledger · 移动端 · 记账包 · 浅色
#/case/noir        示例页：Noir · Web · Noir 包 · 深色
                   移动端：概览 / 现实界面 / 动效 / 审计 / Token 表 / 设计决策
                   Web：Web 界面 / 动效 / 审计 / Token 表 / 设计决策
#/case/ledger/reality   深链到某个标签（标签即 URL，可分享）
```

首页只回答"这是什么、解决什么问题、凭什么相信"；怎么实现搬到 `方法`，
为什么做、边界在哪搬到 `关于`。三页各有各的职责，不再把工程细节压在第一屏。

首页只回答三个问题：这套东西怎么做的、产出了什么、AI 怎么参与；三个示例各自锁定一种身份，
全部排列收进 `排列` 页，示例页只展示这一种身份，不再堆在同一屏。

"设计决策"标签的内容不是手写的，而是 `npm run adr` 从 `docs/adr/*.md` 摘出来生成
`src/generated/adr-index.json`——页面上那句话，原文一定在仓库里。
与当前示例直接相关的决策（记账 → ADR-0004/0005/0007）会排在前面并打标。

## 现实界面

`#reality` 段把当前屏按八种真实机型画出来（iPhone SE / 15 Pro / 16 Pro Max、Pixel 7、Galaxy S21、
Fold 外屏、iPad mini / iPad Pro 11），宽度、留白、断行按设备计算，只有外层容器缩放。

每台机型可以单独：

- **切横竖屏**——852 × 393 会触发 medium 档，直接看到两列布局；
- **开关安全区**——按机型画 59/34、24/24、62/34 的侵入区；
- **看档位**——当前宽度落在 compact / medium / expanded 哪一档。

按"手机 / 平板"筛选，就能把三个状态并排比较。

## 当前边界

> 还没做（按顺序）：

1. 平板断点：744 宽下仍是单列布局，需要一套 layout token 才能给出双列；
2. 真机验证：仓库里没有小程序工程，weapp 只有静态校验 + 待接入的截图脚本；
3. 组件不依赖产品语义这条规则，目前只写在 design-context 里，还没有 lint 固化。

## 已知取舍

- 源文件是"友好格式"（`"#B9D58A"`、`"18px"`），DTCG 规范值由编译器产出。见 [ADR-0001](docs/adr/0001-friendly-source.md)。
- 单份构建 + CSS 变量做运行时主题，而不是编译多套包。见 [ADR-0002](docs/adr/0002-runtime-theming.md)。
- Style Dictionary 只负责解析别名，输出格式自己写。见 [ADR-0003](docs/adr/0003-resolver-only.md)。
- 第二个品牌包用白标来验收通用性；密度（spacing）故意留在 core。见 [ADR-0004](docs/adr/0004-second-brand-pack.md)。
