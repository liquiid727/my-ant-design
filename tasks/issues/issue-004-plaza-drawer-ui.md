# 实现 PlazaDrawer 主题广场界面

## Description

实现主题广场的 Drawer UI，包括主题卡片网格、标签筛选区域、关键字搜索、加载状态和空状态，并在 HeaderBar 中添加入口按钮。

对应 PRD: US-001 | SPEC: Section 2.2, 5.1

## Acceptance Criteria

- [ ] 创建 `src/components/plaza/PlazaDrawer.tsx`：Ant Design Drawer 组件，宽度与 AI Drawer 一致
- [ ] 创建 `src/components/plaza/ThemeCard.tsx`：展示主题预览图、名称、作者、风格标签
- [ ] ThemeCard 预览图使用 `<img loading="lazy">` 懒加载，图片加载失败时显示 colorPrimary 渐变占位
- [ ] 顶部筛选区域使用 `Tag.CheckableTag` 组件，标签从 `availableTags` 动态生成
- [ ] 搜索框使用 `Input.Search`，实时过滤主题名称和描述
- [ ] 加载中状态展示 Skeleton 卡片占位（4-6 个）
- [ ] 网络错误状态展示友好提示 + 重试按钮，如使用缓存数据则展示 "使用缓存数据" 提示条
- [ ] 空状态展示 "暂无社区主题，成为第一个贡献者！" + 链接到贡献指南
- [ ] 右上角手动刷新按钮，调用 `fetchThemes(force: true)`
- [ ] 扩展 `src/stores/uiStore.ts`：增加 `isPlazaDrawerOpen` / `openPlaza` / `closePlaza`
- [ ] 修改 `src/components/layout/HeaderBar.tsx`：增加「主题广场」入口按钮
- [ ] 修改 `src/App.tsx`：lazy import `PlazaDrawer`
- [ ] Drawer 打开时自动触发 `fetchThemes()`（如缓存新鲜则直接使用缓存）
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #3

## Type

frontend

## Priority

high

## SPEC Reference

- Section 2.2 — Component Design (PlazaDrawer, ThemeCard)
- Section 2.3 — Module Interactions (community theme load flow)
- Section 5.1 — Theme Filtering & Search
- Section 8.2 — Optimization Strategy (lazy loading)
