# Settings Modal（LLM Provider 配置 + API Key + 测试连接）

## Description

实现 Settings 弹窗（antd Modal），由 Header 上的齿轮图标按钮触发。用户在此配置 LLM Provider（OpenAI/Claude/Gemini/DeepSeek/Qwen/OpenRouter/Custom），填入 Base URL 和 API Key，选择模型，测试连接可用性。配置存入 LocalStorage，未配置时 AI 功能不可用。

## Acceptance Criteria

- [x] Header 齿轮按钮点击 → 打开 antd Modal
- [x] ProviderSelector：下拉选择 Provider（OpenAI / Claude / Gemini / DeepSeek / Qwen / OpenRouter / Custom）
- [x] 选择 Provider 后自动填充默认 Base URL
- [x] APIKeyInput：`type="password"` + 可见切换 + mask 显示 `sk-****xxxx`
- [x] ModelSelector：根据 Provider 动态列出可选模型（支持手动输入自定义模型）
- [x] TestConnectionButton：调用 LLM API 验证连接 → 成功/失败提示
- [x] 保存配置到 settingsStore + LocalStorage
- [x] 未配置时 AI Drawer 显示引导提示卡片（"请先配置 AI 模型"）

## Dependencies

Issue #2

## Type

frontend

## Priority

high

## SPEC Reference

Section 2.3 SettingsModal, Section 5.3 AI 对话流程 — 前置条件
