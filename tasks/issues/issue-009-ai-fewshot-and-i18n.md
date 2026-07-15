# 实现 AI Few-shot Examples + 中英文双语支持

## Description

在 system prompt 中加入 3-5 个 few-shot examples 覆盖常见主题修改场景，并实现中英文双语版本，使 AI 输出更精准、更结构化。

对应 PRD: US-010, US-012 | SPEC: Section 8.3

## Acceptance Criteria

- [x] 创建 `src/services/ai/fewShotExamples.ts`，导出中英文两个版本的示例集
- [x] 包含 5 个 few-shot examples，覆盖以下场景：
  - 修改主色（"把主色改成红色" → 仅 colorPrimary 的 JSON）
  - 修改整体圆角风格（"改成圆润风格" → borderRadius 全系列协调值）
  - 多 token 组合调整（"企业级严肃风格" → 色彩+圆角+间距组合）
  - 暗色模式切换（"切换暗色模式" → algorithm: "dark" + 适配的背景色/文字色）
  - 组件级定制（"让按钮更突出" → components.Button token 调整）
- [x] 每个示例包含用户输入（中英文）和期望的 AI JSON 输出
- [x] 每个示例不超过 10 行 JSON
- [x] 修改 `buildSystemPrompt` 将 few-shot examples 按 locale 选择并注入
- [x] `buildSystemPrompt` 的 `locale` 参数默认值由 `navigator.language` 推断（`zh` 开头 → `zh-CN`，其他 → `en-US`）
- [x] 编写单元测试：验证两种 locale 的 prompt 均包含示例
- [x] Typecheck/lint passes

## Dependencies

Issue #7

## Type

backend

## Priority

high

## SPEC Reference

- Section 8.3 — System Prompt Token Budget (few-shot ~500 tokens)
- Section 2.2 — fewShotExamples.ts module
