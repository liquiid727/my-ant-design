# 实现 CommunityThemeService (GitHub API + 缓存 + 降级)

## Description

实现社区主题的数据获取服务，通过 GitHub Contents API 在运行时拉取 `src/themes/community/` 目录下的主题文件，支持 localStorage 缓存（30 分钟 TTL）和构建时快照降级。

对应 PRD: US-004 | SPEC: Section 4.2, 4.3, 4.4

## Acceptance Criteria

- [ ] 创建 `src/services/community/communityThemeService.ts`
- [ ] 实现 `fetchIndex(force?: boolean)` 方法：优先使用缓存，过期后请求 GitHub API
- [ ] 仓库配置 hardcode 默认值（`COMMUNITY_REPO`），支持 `VITE_COMMUNITY_REPO_OWNER` / `VITE_COMMUNITY_REPO_NAME` 环境变量覆盖
- [ ] 通过 GitHub Contents API (`https://api.github.com/repos/{owner}/{repo}/contents/src/themes/community`) 读取目录
- [ ] 解析 API 返回的 base64 编码 `content` 字段为 JSON
- [ ] 过滤 `.json` 文件（排除 `community-theme.schema.json` 和 `README.md`）
- [ ] 对拉取的主题通过 `themeValidator` 校验，跳过无效主题
- [ ] 缓存到 localStorage（key: `ts_community_themes`），TTL 30 分钟
- [ ] GitHub API 返回 403（rate limit）时，回退到缓存数据或构建时快照
- [ ] 网络错误时同样回退到缓存/快照
- [ ] 实现 `getPreviewUrl(filename)` 方法：返回 `raw.githubusercontent.com` 的图片 URL
- [ ] 并行拉取最多 5 个主题文件的内容
- [ ] 编写单元测试覆盖：缓存命中、缓存过期、API 失败降级、强制刷新
- [ ] Typecheck/lint passes

## Dependencies

Issue #1

## Type

backend

## Priority

high

## SPEC Reference

- Section 4.2 — CommunityThemeService API
- Section 4.3 — Internal Implementation
- Section 4.4 — Error Handling
- Section 6.1 — Error Taxonomy
- Section 6.3 — Failure Modes
