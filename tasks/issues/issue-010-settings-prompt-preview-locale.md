# Settings 增加 AI Prompt Preview + 语言偏好

## Description

在 Settings 弹窗中新增 AI Prompt Preview 折叠面板（展示当前完整 system prompt）和 AI 语言偏好选项，让用户了解 AI 收到的上下文并选择 prompt 语言。

对应 PRD: US-011, US-012 | SPEC: Section 2.2

## Acceptance Criteria

- [ ] 修改 `src/stores/settingsStore.ts`：`LLMConfig` 增加 `locale: 'zh-CN' | 'en-US'` 字段，默认值根据 `navigator.language` 自动选择
- [ ] 向后兼容：已有 `ts_settings_llm` 缓存如无 `locale` 字段，fallback 到自动检测
- [ ] 修改 `src/types.ts`：`LLMConfig` 类型增加 `locale` 字段
- [ ] 修改 `src/components/settings/SettingsModal.tsx`：
  - 新增「AI Language」Select 组件，选项：`中文 (zh-CN)` / `English (en-US)`
  - 新增「AI Prompt Preview」Collapse 面板，默认折叠
  - 面板展开后以 `Typography.Text` + `code` 样式展示完整 system prompt
  - Prompt 预览调用 `buildSystemPrompt({ locale })` 生成，不显示 API key 等敏感信息
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill：切换语言后 prompt 预览内容变化

## Dependencies

Issue #7, Issue #9

## Type

frontend

## Priority

medium

## SPEC Reference

- Section 2.2 — Modified modules (SettingsModal)
- Section 3.2 — Type Extensions (LLMConfig.locale)
