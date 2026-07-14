# Agent 配置模板区块

## Description

实现 About 页面的「Agent 配置」Tab 内容。提供可复制即用的 CLAUDE.md 配置模板、MCP server 配置片段和 system prompt 模板，帮助开发者快速搭建基于 Theme Studio 设计框架的 Claude Code / Agent 开发工作流。

## Acceptance Criteria

- [ ] 提供 CLAUDE.md 配置模板，包含项目上下文（antd + Theme Studio 主题系统）和开发规范
- [ ] 提供 MCP server 配置片段，说明如何接入 CLI 和 MCP
- [ ] 提供 system prompt 模板，引导 Agent 按照 Theme Studio 的 token 体系进行 UI 开发
- [ ] 所有模板内容支持一键复制（antd Typography.Paragraph copyable）
- [ ] 每个模板配有简要的用途和使用场景说明
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #014

## Type

ui

## Priority

medium

## SPEC Reference

Section 2.2 AgentSection, Appendix A4
