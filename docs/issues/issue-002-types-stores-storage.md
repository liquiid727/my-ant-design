# 类型定义 + Zustand Stores + LocalStorage 服务

## Description

定义核心 TypeScript 类型（ThemeConfig, LLMConfig, ThemeRecord, ThemeVersion, ChatSession 等），创建 Zustand stores（themeStore, chatStore, settingsStore），实现 LocalStorage 封装服务（前缀 `ts_`、序列化/反序列化、容量检测）。

## Acceptance Criteria

- [x] 定义 `ThemeConfig` 类型（token + components + algorithm）
- [x] 定义 `LLMConfig` 类型（provider, baseURL, apiKey, model）
- [x] 定义 `ThemeRecord`, `ThemeVersion`, `ChatSession`, `ChatMessage` 类型
- [x] 创建 `themeStore`：currentTheme, setToken, setComponentToken, resetTheme
- [x] 创建 `chatStore`：messages, sessions, addMessage, clearSession
- [x] 创建 `settingsStore`：llmConfig, setLLMConfig, isConfigured
- [x] 实现 `StorageService`：get/set/remove/getUsage/clear，前缀 `ts_`
- [x] API Key 使用 `btoa()` 编码存储
- [x] 容量监控：接近 5MB 时提示

## Dependencies

Issue #1

## Type

infra

## Priority

high

## SPEC Reference

Section 3.1 Data Model, Section 3.2 LocalStorage Schema, Section 3.3 Storage 封装
