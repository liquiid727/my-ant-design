# About 页面 Tab 布局与 URL hash 同步

## Description

在 AboutPage 中实现 antd Tabs 四区块布局（产品介绍、接入 Ant Design、配置 AI、Agent 配置），支持 Tab 切换时 URL hash 同步更新，页面刷新后根据 hash 自动定位到对应 Tab。

## Acceptance Criteria

- [ ] 页面使用 antd `Tabs` 组件，包含四个 Tab：产品介绍（intro）、接入 Ant Design（antd）、配置 AI（ai）、Agent 配置（agent）
- [ ] Tab 切换时 URL hash 同步更新（如 `#intro`, `#antd`, `#ai`, `#agent`），使用 `replace: true` 避免历史堆积
- [ ] 刷新页面后根据 URL hash 自动定位到对应 Tab
- [ ] 无 hash 或无效 hash 时默认定位到 `intro` Tab
- [ ] 页面整体风格与 PlaygroundPage / LibraryPage 保持一致
- [ ] 在 `styles.css` 中添加 `.about-*` 基础样式
- [ ] 移动端 viewport 下 Tabs 可横向滚动，内容区块不溢出
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #013

## Type

frontend

## Priority

high

## SPEC Reference

Section 2.2 Component Design, Section 5.1, 5.3, Appendix A3
