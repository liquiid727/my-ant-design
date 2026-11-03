# 实现统一的 Claude Code / Codex UI Agent 模块

## Description

在一个 About 一级模块内提供 Claude Code 与 Codex 两个配置选项。两者共用设计规范说明，通过子选项区分正确的文件名、加载机制和配置语法。

## Acceptance Criteria

- [ ] UI Agent 作为一个一级 About Tab
- [ ] 模块内可切换 Claude Code 和 Codex
- [ ] Claude 选项展示、复制和下载 `CLAUDE.md`
- [ ] Codex 选项展示、复制和下载 `AGENTS.md`
- [ ] 两个选项共用相同的设计约束说明
- [ ] 平台差异仅体现在文件名、加载机制和配置语法
- [ ] 切换平台不会丢失当前页面位置
- [ ] 移动端代码预览不撑开页面
- [ ] Typecheck 和 build 通过
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #020, Issue #023

## Type

ui

## Priority

high

## SPEC Reference

Sections 2.2, 5.4, 8, 9.2
