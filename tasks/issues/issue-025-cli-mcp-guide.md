# 编写并展示 Ant Design 官方 CLI/MCP 接入指南

## Description

以 Ant Design 官方 `@ant-design/cli` 为核心，说明 CLI、MCP、项目 `design.md`/ThemeConfig 与 Claude Code/Codex Agent 客户端的职责边界。不得再用 Context7 或客户端自身的 MCP 命令替代 Ant Design 工具链。

## Acceptance Criteria

- [ ] 展示 `npm install -g @ant-design/cli` 与 `antd -V`
- [ ] CLI 内容覆盖组件、文档、示例、Token、design.md、semantic、changelog 与项目诊断
- [ ] 展示 `npx -y @ant-design/cli mcp`
- [ ] Claude Code 内容覆盖 `antd setup --client claude`、`--dry-run` 和 `--check`
- [ ] Codex 内容覆盖 `antd setup --client codex`
- [ ] 配置示例使用 server 名称 `antd` 和包 `@ant-design/cli`
- [ ] 明确 `design.md`/ThemeConfig 是项目设计事实，CLI/MCP 是 Ant Design 知识与诊断来源
- [ ] 明确 Claude Code/Codex 是 Agent 客户端，不是 Ant Design CLI/MCP
- [ ] Context7 等第三方 MCP 只可作为补充，不可作为官方工具链替代
- [ ] Agent Artifact 要求优先调用 `antd_info`、`antd_doc`、`antd_demo`、`antd_token` 等工具核验 API
- [ ] 每套配置包含验证步骤、常见故障排查、官方文档、`lastVerifiedAt` 和工具版本
- [ ] 所有代码块支持一键复制
- [ ] Typecheck 和 build 通过
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #020

## Type

ui

## Priority

high

## SPEC Reference

Sections 3.2, 5.5, 5.6, 9.2
