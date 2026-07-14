# 配置 AI（LLM API Key）教程区块

## Description

实现 About 页面的「配置 AI」Tab 内容。展示如何在 Theme Studio Settings 中配置 LLM API Key 以使用 AI 主题生成功能，包含支持的 provider 列表、配置步骤、功能说明和安全提示。

## Acceptance Criteria

- [ ] 列举支持的 LLM 提供商：OpenAI、Claude、Gemini、DeepSeek、Qwen、OpenRouter、Custom
- [ ] 分步骤图文指引：打开 Settings → 选择 Provider → 填入 API Key → 选择模型 → 测试连接 → 保存
- [ ] 简要说明 AI Chat 功能：自然语言描述需求 → AI 生成主题 token
- [ ] 使用 antd Alert 展示安全提示：API Key 仅存储在本地浏览器 localStorage，不会上传到服务器
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #014

## Type

ui

## Priority

medium

## SPEC Reference

Section 2.2 AIConfigSection, Section 7.1
