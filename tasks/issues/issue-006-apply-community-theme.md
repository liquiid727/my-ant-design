# 实现社区主题一键应用（含版本快照）

## Description

实现在 ThemePreviewModal 中点击「应用主题」的完整流程：自动创建版本快照确保可回退，校验并注入主题配置，刷新 Playground。

对应 PRD: US-003 | SPEC: Section 5.2

## Acceptance Criteria

- [ ] 点击「应用主题」时，先调用 `versionStore.createVersion(currentTheme.id, currentTheme, "Before applying community theme: {themeName}")` 创建版本快照
- [ ] 使用 `validateThemeConfig()` 校验社区主题 config，确保 token 值在合法范围内
- [ ] 调用 `themeStore.setTheme()` 注入校验后的主题配置
- [ ] 应用后关闭 PreviewModal，显示 `message.success('Applied theme: {themeName}')`
- [ ] 应用后 Playground 实时刷新，展示新主题效果
- [ ] 应用后用户可在 Editor 中继续微调主题 token
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill：应用主题后验证颜色变化、回退到历史版本

## Dependencies

Issue #5

## Type

frontend

## Priority

high

## SPEC Reference

- Section 5.2 — Theme Application Logic
- Section 2.3 — Module Interactions (preview & apply flow)
