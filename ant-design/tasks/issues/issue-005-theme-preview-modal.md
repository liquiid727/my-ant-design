# 实现 ThemePreviewModal 主题预览弹窗

## Description

实现社区主题的预览弹窗，在独立的 ConfigProvider 中渲染预览组件，展示主题效果和 token 差异摘要，让用户在应用前直观了解主题效果。

对应 PRD: US-002 | SPEC: Section 2.3

## Acceptance Criteria

- [x] 创建 `src/components/plaza/ThemePreviewModal.tsx`
- [x] 使用 Ant Design `Modal` 组件，宽度 720px 以上
- [x] 预览区域使用独立的 `ConfigProvider` 包裹，注入社区主题的 token 和 components 配置
- [x] 复用 `OfficialComponentsPreview` 组件渲染预览面板（Button、Input、Select、Card 等组件）
- [x] 展示 token 差异摘要：调用 `diffThemes(defaultTheme, communityTheme)` 列出修改的 token
- [x] 差异列表样式与 AI Drawer 中的 `ai-diff-card` 保持一致
- [x] 底部操作区域包含「应用主题」和「取消」按钮
- [x] 点击 ThemeCard 时打开此 Modal，传入对应的 `CommunityThemeMeta`
- [x] Typecheck/lint passes
- [x] Verify in browser using dev-browser skill

## Dependencies

Issue #4

## Type

frontend

## Priority

high

## SPEC Reference

- Section 2.3 — Module Interactions (theme preview & apply flow)
- Section 5.4 — Edge Cases
