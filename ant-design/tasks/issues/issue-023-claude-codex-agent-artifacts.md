# 生成 Claude Code 与 Codex UI Agent 配置

## Description

使用一套共享的 UI 开发规则，分别生成平台正确的 `CLAUDE.md` 和 `AGENTS.md`。共享设计约束，但不得混用 Claude Code 与 Codex 的指令加载语法。

## Acceptance Criteria

- [ ] 实现共享 UI Agent 设计约束
- [ ] Claude Artifact 文件名为 `CLAUDE.md`
- [ ] Codex Artifact 文件名为 `AGENTS.md`
- [ ] Claude 模板使用正确的 `@design.md` 导入说明
- [ ] Codex 模板明确要求读取 `./design.md`
- [ ] 两套模板均要求读取主题文件和现有组件结构
- [ ] 两套模板均要求优先使用 Ant Design 和 Theme Token
- [ ] 两套模板均限制无理由硬编码颜色、圆角、阴影和间距
- [ ] 两套模板均包含响应式、状态、build 和 UI 验证要求
- [ ] 两套模板均提供新建页面、重构页面、UI Review 三类示例任务
- [ ] 单元测试确认两种平台语法不会混用
- [ ] Typecheck 和 unit tests 通过

## Dependencies

Issue #019

## Type

frontend

## Priority

high

## SPEC Reference

Sections 4.2, 5.4, 7.3, 9.1
