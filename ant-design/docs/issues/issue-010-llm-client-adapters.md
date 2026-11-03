# LLM Client 统一接口 + Provider 适配器

## Description

实现 LLM 调用的统一抽象层 `LLMClient`，支持流式对话（`AsyncGenerator<ChatChunk>`）和连接测试。为各 Provider 实现适配器：OpenAI-compatible（覆盖 OpenAI/DeepSeek/Qwen/OpenRouter）、Claude（Messages API）、Gemini。处理 CORS 问题，对不支持浏览器直连的 Provider 提供引导。

## Acceptance Criteria

- [x] `LLMClient` 接口：`chat(params): AsyncGenerator<ChatChunk>`, `testConnection(): Promise<Result>`
- [x] OpenAI-compatible 适配器：支持 OpenAI / DeepSeek / Qwen / OpenRouter / 自定义 Base URL
- [x] Claude 适配器：Anthropic Messages API 格式转换
- [x] Gemini 适配器：Google Generative AI API 格式转换
- [x] 流式响应：使用 `ReadableStream` + `TextDecoder` 逐 token 返回
- [x] 错误处理：401 (API Key 无效), 429 (限流), 网络错误 → 友好提示
- [x] 重试策略：最多 2 次，间隔 2s/5s
- [x] CORS 检测：不支持时提示用户使用 OpenRouter 或 Proxy

## Dependencies

Issue #9

## Type

fullstack

## Priority

high

## SPEC Reference

Section 4.1 LLM Client 统一接口, Section 4.2 Provider 适配器, Section 7.3 CORS 处理
