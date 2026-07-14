# 贡献指南、PR 模板与示例主题

## Description

编写社区主题贡献指南文档、GitHub PR 模板，并创建 2-3 个示例社区主题作为贡献者参考。

对应 PRD: US-007

## Acceptance Criteria

- [ ] 创建 `src/themes/community/README.md`，内容包含：
  - 目录结构说明
  - 基础格式（JSON）详细文档 + 完整示例
  - 高级格式（TS）详细文档 + 完整示例
  - 支持的 token 对照表（colorPrimary, borderRadius 等）
  - 从 fork 到提交 PR 的完整步骤
  - 如何在本地预览自己的主题效果
  - 预览图规范：800×500 px, ≤200KB, PNG
  - 主题 ID 命名规范：`{theme-name}-{4位随机后缀}`
- [ ] 创建 `.github/PULL_REQUEST_TEMPLATE/community-theme.md`，包含 checklist：
  - [ ] 主题 JSON 通过 schema 校验
  - [ ] 主题 ID 唯一（`{name}-{4位后缀}` 格式）
  - [ ] 预览图已上传（800×500, ≤200KB）
  - [ ] 在本地预览确认效果
- [ ] 创建 2-3 个示例社区主题（JSON 格式），包含预览图：
  - 一个亮色系主题
  - 一个暗色系主题
  - （可选）一个品牌风格主题
- [ ] 示例主题通过 JSON Schema 校验

## Dependencies

Issue #1

## Type

docs

## Priority

medium

## SPEC Reference

- Section 2.4 — File Structure (community directory)
- Section 3.4 — Community Theme JSON Schema
