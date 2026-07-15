# 编写并展示真实的 CLI/MCP 接入指南

## Description

提供经过官方资料核验的 Claude Code 和 Codex CLI/MCP 配置、验证及排错指南。本期只介绍现有客户端能力，不开发或虚构 Theme Studio CLI/MCP Server。

## Acceptance Criteria

- [ ] Claude Code 内容覆盖 `claude mcp add`, `list`, `get` 和 `/mcp`
- [ ] Claude Code 内容说明 `.mcp.json` 及配置作用域
- [ ] Codex 内容覆盖 `codex mcp add`, `list` 和 `/mcp`
- [ ] Codex 内容说明 `~/.codex/config.toml` 和可信项目的 `.codex/config.toml`
- [ ] 示例只使用真实公开的 MCP Server
- [ ] 删除 `<theme-studio-mcp-command>` 占位配置
- [ ] 不将 Theme Studio 描述为已有 CLI 或 MCP Server
- [ ] 每套配置包含验证步骤和常见故障排查
- [ ] 展示官方文档链接和 `lastVerifiedAt`
- [ ] 所有代码块支持一键复制
- [ ] Typecheck 和 build 通过
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #020

## Type

ui

## Priority

medium

## SPEC Reference

Sections 3.2, 5.5, 5.6, 9.2
