# AI Drawer 对话 UI（流式渲染 + System Prompt + 消息历史）

## Description

实现右侧 AI 对话 Drawer 面板。用户输入自然语言 Prompt，通过 LLM Client 发送请求，流式渲染 AI 回复。包含 System Prompt（指导 LLM 生成 antd ThemeConfig JSON）、消息气泡、快捷 Prompt 建议、对话历史管理。

## Acceptance Criteria

- [x] AI Chat Toggle Button（Header 右侧）→ 打开/关闭右侧 Drawer
- [x] Drawer 不遮挡主预览区，可拖拽调整宽度（默认 400px）
- [x] 消息气泡：用户消息（右侧）+ AI 消息（左侧）+ 系统消息
- [x] 流式渲染：AI 回复逐 token 显示，打字机效果
- [x] System Prompt：包含 antd Design Token schema + 输出格式约束（JSON）+ few-shot 示例
- [x] 快捷 Prompt 建议："生成苹果风格主题" / "把主色调成红色" / "调整圆角为圆润风格"
- [x] 消息历史：上下文携带最近 10 条消息
- [x] 未配置 LLM 时显示引导卡片 + [打开设置] 按钮

## Dependencies

Issue #10

## Type

frontend

## Priority

high

## SPEC Reference

Section 5.3 AI 对话流程, Section 4.3 System Prompt
