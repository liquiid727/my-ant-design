# 创建社区主题目录结构与类型定义

## Description

创建社区主题的基础设施：目录结构、TypeScript 类型定义和 JSON Schema 校验文件。这是 Theme Plaza 功能的基石，所有后续 Issue 依赖于此。

对应 PRD: US-005 | SPEC: Section 3.1, 3.4

## Acceptance Criteria

- [ ] 创建 `src/themes/community/` 目录
- [ ] 创建 `src/services/community/types.ts`，定义 `CommunityThemeMeta` 和 `CommunityThemeIndex` 类型
- [ ] `CommunityThemeMeta` 包含字段：`id`, `name`, `author`, `description`, `tags`, `preview`, `format`, `config`
- [ ] `CommunityThemeIndex` 包含字段：`themes`, `fetchedAt`, `source`
- [ ] 创建 `src/themes/community/community-theme.schema.json`，定义社区主题 JSON 文件的校验规则
- [ ] JSON Schema 中 `id` 字段匹配 `^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{4}$` 格式
- [ ] 扩展 `src/themes/types.ts` 中 `ThemePresetDefinition.group` 类型为 `'official' | 'custom' | 'community'`
- [ ] Typecheck/lint passes

## Dependencies

None

## Type

infra

## Priority

high

## SPEC Reference

- Section 3.1 — New Type Definitions
- Section 3.4 — Community Theme JSON Schema
- Section 2.4 — File Structure
