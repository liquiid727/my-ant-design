# 高级主题格式支持 (TS 主题 + CI 编译)

## Description

支持高级社区主题贡献格式：以文件夹形式提供 `meta.json` + `theme.ts`，通过 GitHub Actions 自动编译为 ES Module JS，发布到 GitHub Pages，运行时通过 `import()` 按需加载。

对应 PRD: US-006 | SPEC: Section 7.2

## Acceptance Criteria

- [ ] 高级主题目录结构：`src/themes/community/{theme-id}/meta.json` + `theme.ts` + `preview.png`
- [ ] `meta.json` 包含与基础 JSON 主题相同的元数据字段，`format` 字段值为 `"advanced"`
- [ ] `theme.ts` 导出 `useXxxTheme` hook，返回 `ConfigProviderProps`（与官方主题格式一致）
- [ ] 高级主题可使用 `antd-style` 的 `createStyles` 编写自定义 CSS 类覆盖
- [ ] 创建 `.github/workflows/compile-community-themes.yml`：
  - 触发条件：push to main 且 `src/themes/community/*/theme.ts` 有变更
  - 编译步骤：Vite library mode 单独打包每个高级主题
  - 输出：ES Module JS bundle（external react/antd/antd-style）
  - 发布：push 到 `gh-pages` 分支的 `community-themes/` 目录
- [ ] `CommunityThemeService.loadAdvancedTheme(themeId)` 通过 `import(GITHUB_PAGES_BASE + '/{themeId}.js')` 加载预编译模块
- [ ] 加载失败时 wrap in try-catch，显示 "该高级主题加载失败" 提示
- [ ] 提供高级主题模板（在 README 中）
- [ ] Typecheck/lint passes

## Dependencies

Issue #2

## Type

infra

## Priority

low

## SPEC Reference

- Section 2.4 — File Structure (CI workflow)
- Section 7.2 — Advanced Theme Isolation
- Section 6.2 — Retry Strategy (import retry)
