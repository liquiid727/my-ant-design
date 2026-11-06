# Ant Design Theme Studio

基于 Ant Design 6 的主题生产与管理台：19 个预设主题、四个视图（Components / Dashboard /
States / Catalog）、AI 生成与编辑、主题库与主题广场、导出 `ThemeConfig`。

它是 **design-lab 的一个消费者**（见 `design-lab/docs/adr/0008-antd-target.md`）：
design-lab 定义品牌 token，这个工作室把 token 投影成 antd 主题并让人调参。

## 两种运行形态

| 形态 | 入口 | 用途 |
| --- | --- | --- |
| **独立部署** | `npm run dev` / `npm run build`，Vercel 直接指向本目录 | 单独的主题工具站，不依赖 design-lab |
| **被 design-lab 挂载** | design-lab 的 `#/admin` | lab 的一个路由，懒加载，共享 lab 的外壳 |

两种形态共用同一份源码，差别只在谁提供路由和外壳。

## 与 design-lab 的契约

```
design-lab/src/generated/antd/{brand}.{theme}.json     ← 唯一真源
        │  scripts/sync-lab-themes.mjs（dev/build 前自动跑）
        ▼
src/themes/lab/*.json + index.ts                        ← 本仓库的副本，随代码提交
```

- 同步脚本找不到 `../design-lab` 时**跳过**并保留已提交的副本——独立部署靠这一条成立。
- 因此 `src/themes/lab/` 是生成物：要改主题请改 design-lab 的 token 源，不要手改这里。

## 挂载时必须守住的三件事

1. **不写全局**。`:root` / `body` 的字体、背景、`color-scheme` 都收在 `.studio-root` 里；
   `color-scheme` 走 `data-scheme` 属性。挂载时 studio 不能改写 design-lab 的外壳。
2. **入口可懒加载**。`App` 必须是可被 `lazy()` 引入的默认导出，且不自己包 Router
   （独立运行时由 `main.tsx` 包 `BrowserRouter`，挂载时由 lab 包 `MemoryRouter`）。
3. **依赖去重**。lab 通过 `resolve.dedupe` 保证 react / react-router 只有一份，
   否则 hooks 会因为两份实例而崩。

## 命令

```bash
npm install
npm run dev          # 独立开发，默认 5173
npm run build        # sync:lab + 类型检查 + 打包
npm test             # vitest
npm run e2e          # playwright
npm run test:visual  # 主题视觉回归（19 主题 × 2 视图 + States/Catalog 抽样）
```
