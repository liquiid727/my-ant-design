# 补充 0709 内容元数据与端到端验收

## Description

完成 About 接入中心的 0709 内容标记、自动化测试和发布前验证，确保最终内容范围、文件 Artifact、旧链接兼容和响应式表现符合 PRD/SPEC。

## Acceptance Criteria

- [ ] About 页面展示 `0709` 内容版本
- [ ] 页面展示最近更新时间或最近核验时间
- [ ] E2E 覆盖五个 canonical Tab
- [ ] E2E 覆盖 `#intro`, `#ai`, `#agent` 三个 legacy hash
- [ ] E2E 验证页面不包含项目脚手架教程
- [ ] E2E 验证页面不包含 LLM API Key 配置教程
- [ ] E2E 验证 `design.md`, `CLAUDE.md`, `AGENTS.md` 的预览和文件名
- [ ] E2E 验证不存在 Theme Studio MCP 虚假命令
- [ ] 390px、834px、1440px 三种 viewport 通过
- [ ] `npm test` 通过
- [ ] `npm run build` 通过
- [ ] About Playwright 测试通过
- [ ] 手动复核所有 CLI/MCP 命令和官方链接

## Dependencies

Issue #021, Issue #022, Issue #024, Issue #025

## Type

ui

## Priority

high

## SPEC Reference

Section 5.6, Section 9, Section 10.1 Phase 5
