# 重构 AI System Prompt 并注入设计语言知识

## Description

将现有的 `buildSystemPrompt()` 重构为分层构建模式，并新增 Ant Design 设计语言知识模块（色彩体系、圆角规范、间距系统、字体层级），使 LLM 生成的主题更符合设计规范。

对应 PRD: US-008 | SPEC: Section 8.3

## Acceptance Criteria

- [x] 重构 `src/services/ai/systemPrompt.ts`：`buildSystemPrompt` 接受 `{ locale: 'zh-CN' | 'en-US' }` 参数
- [x] prompt 分层组装：角色定义 → 设计语言知识 → Token 约束 → 输出格式要求
- [x] 创建 `src/services/ai/designLanguage.ts`，导出中英文两个版本的设计语言说明
- [x] 设计语言包含：
  - 色彩体系：主色与功能色关系、色阶衍生规则、暗色模式色彩反转
  - 圆角规范：XS/SM/Base/LG 的层级关系和适用场景
  - 间距系统：SM/Base/LG 的使用场景和倍数关系
  - 字体大小：SM/Base/LG 层级说明
- [x] 包含设计一致性约束："Ensure border radius values follow XS < SM < Base < LG"
- [x] 中英文版本结构完全一致，仅语言不同
- [x] system prompt 总 token 数控制在 1500 以内（不含 few-shot 和 context）
- [x] 编写单元测试：验证中英文 prompt 包含所有必要章节
- [x] Typecheck/lint passes

## Dependencies

None

## Type

backend

## Priority

high

## SPEC Reference

- Section 8.3 — System Prompt Token Budget
- Section 2.2 — designLanguage.ts module
