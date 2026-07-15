# 实现 design.md 预览、复制与下载界面

## Description

在 About 页面中读取当前主题，调用确定性生成器创建 `design.md`，并提供适合开发者和 Agent 使用的预览、复制及浏览器下载界面。

## Acceptance Criteria

- [ ] 从 Theme Store 读取当前完整主题
- [ ] 通过 active preset 获取名称和风格元数据
- [ ] preset 不存在时使用 Custom Theme 降级信息
- [ ] 页面预览生成后的完整 Markdown
- [ ] 支持复制 `design.md`
- [ ] 支持下载文件名为 `design.md` 的 UTF-8 文件
- [ ] 复制或下载失败时显示明确反馈
- [ ] Theme 或 preset 变化后预览同步更新
- [ ] 本模块不读取 Settings、LLM 或 Chat Store
- [ ] Typecheck、unit tests 和 build 通过
- [ ] Verify in browser using dev-browser skill

## Dependencies

Issue #019, Issue #020

## Type

ui

## Priority

high

## SPEC Reference

Sections 2.3, 4.2, 5.3, 6, 8, 9.2
