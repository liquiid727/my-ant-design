# 重构 About 页面信息架构与 hash 兼容

## Description

将现有 About 单文件重构为五个独立内容区块，并兼容已有 URL hash，保证旧链接在新版内容结构下继续可用。

## Acceptance Criteria

- [ ] 页面包含 Overview、Ant Design、design.md、CLI/MCP、UI Agent 五个 Tab
- [ ] 每个内容区块拆分为独立 Section 组件
- [ ] `#intro` 映射到 `#overview`
- [ ] `#ai` 映射到 `#design`
- [ ] `#agent` 映射到 `#agents`
- [ ] 未知 hash 自动降级到 Overview
- [ ] hash 规范化使用 replace，不产生多余浏览历史
- [ ] 保留 `/about` 的 lazy loading
- [ ] 桌面端、平板端和移动端无页面级横向溢出
- [ ] Typecheck 和 build 通过
- [ ] Verify in browser using dev-browser skill

## Dependencies

None

## Type

ui

## Priority

high

## SPEC Reference

Sections 2.1-2.4, 4.3, 5.1, 9.2
