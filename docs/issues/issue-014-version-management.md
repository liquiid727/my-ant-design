# 版本管理：创建 / 列表 / Diff / Rollback + DiffViewer

## Description

实现主题版本管理功能。每次修改主题可创建版本快照，支持版本列表查看、任意两个版本之间的 Diff 对比（高亮 added/removed/changed Token）、一键 Rollback 回退到指定版本。

## Acceptance Criteria

- [x] `createVersion(themeId, config, message?)`：创建新版本，自动递增版本号
- [x] `getVersions(themeId)`：获取版本列表，按时间倒序
- [x] `diff(v1, v2)`：深度遍历两个 ThemeConfig，输出 ThemeDiff[]（key, oldValue, newValue, type: added|removed|changed）
- [x] `rollback(versionId)`：恢复到指定版本的 ThemeConfig
- [x] 版本列表 UI：时间线或表格展示，显示版本号 + 时间 + 备注
- [x] DiffViewer 组件：颜色高亮（绿=added，红=removed，黄=changed）
- [x] 版本数据存储在 LocalStorage `ts_versions_{themeId}`
- [x] AI Apply 时自动创建版本快照

## Dependencies

Issue #13

## Type

frontend

## Priority

medium

## SPEC Reference

Section 5.5 Version Management
