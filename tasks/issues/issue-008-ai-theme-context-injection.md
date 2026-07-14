# 实现 AI 当前主题上下文注入

## Description

每次用户与 AI 对话时，将当前活动主题的 token 快照动态注入到消息上下文中，使 AI 能基于当前主题状态给出增量建议而非盲目覆盖。

对应 PRD: US-009 | SPEC: Section 2.3 (AI flow)

## Acceptance Criteria

- [ ] 创建 `src/services/ai/themeContext.ts`，导出 `serializeThemeContext(activePresetId, overrides, currentTheme)` 函数
- [ ] 序列化格式为：`Current theme state: { preset: "{presetId}", overrides: { token: {...}, components: {...} } }`
- [ ] 空 overrides 时输出简化格式：`Current theme state: { preset: "{presetId}", overrides: {} }`
- [ ] 修改 `src/services/ai/LLMClient.ts` 的 `request()` 方法：将 themeContext 作为 system prompt 的补充部分注入
- [ ] 对 Claude provider：themeContext 追加到 `system` 字段
- [ ] 对 OpenAI-compatible providers：themeContext 追加到 system message 的 content
- [ ] 修改 `src/components/ai/AIDrawer.tsx`：从 `useThemeStore` 获取当前主题状态并传递给 `LLMClient`
- [ ] 用户切换 preset 后，下一次 AI 对话自动使用最新主题上下文
- [ ] 编写单元测试：验证上下文序列化格式、空 overrides 处理
- [ ] Typecheck/lint passes

## Dependencies

Issue #7

## Type

backend

## Priority

high

## SPEC Reference

- Section 2.3 — Module Interactions (AI enhanced message flow)
- Section 8.3 — Token Budget (context ~150 tokens)
