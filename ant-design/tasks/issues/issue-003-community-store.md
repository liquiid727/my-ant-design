# 实现 useCommunityStore (Zustand)

## Description

创建 Zustand store 管理社区主题列表状态，包括加载/错误状态、搜索查询和标签筛选逻辑。遵循项目现有的 Zustand store 模式（`themeStore`, `chatStore` 等）。

对应 SPEC: Section 3.1, 5.1, 5.3

## Acceptance Criteria

- [x] 创建 `src/stores/communityStore.ts`
- [x] Store 状态包含：`index` (CommunityThemeIndex | null), `loading`, `error`, `searchQuery`, `selectedTags`
- [x] 实现 `fetchThemes(force?: boolean)` action：调用 `CommunityThemeService.fetchIndex()`，管理 loading/error 状态
- [x] `fetchThemes` 设置 `loading` 守卫，防止并发请求
- [x] 实现 `setSearchQuery(query)` action
- [x] 实现 `toggleTag(tag)` action：添加/移除标签
- [x] 实现 `clearFilters()` action：清空搜索和标签
- [x] 实现 `filteredThemes()` 派生方法：按 searchQuery 过滤名称/描述，按 selectedTags OR 逻辑过滤，按名称排序
- [x] `availableTags` 从 themes 的 tags 字段动态聚合（去重）
- [x] 编写单元测试覆盖筛选逻辑、标签切换、并发守卫
- [x] Typecheck/lint passes

## Dependencies

Issue #1, Issue #2

## Type

frontend

## Priority

high

## SPEC Reference

- Section 3.1 — CommunityStoreState type
- Section 5.1 — Theme Filtering & Search
- Section 5.3 — Cache Invalidation
- Section 5.4 — Edge Cases (concurrent fetches)
