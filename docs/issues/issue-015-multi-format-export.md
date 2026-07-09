# 多格式导出（theme.ts / json / css-variables / tailwind）+ 文件下载

## Description

实现主题的多格式导出功能。用户可以将当前主题导出为多种格式的文件，直接下载到本地用于项目集成。

## Acceptance Criteria

- [ ] `theme.ts` 格式：生成 TypeScript 文件，包含 ConfigProvider 使用方式 + 完整 ThemeConfig 对象
- [ ] `theme.json` 格式：纯 JSON 格式的 ThemeConfig
- [ ] `design-token.json` 格式：扁平化 Token 列表（兼容 Style Dictionary）
- [ ] `tailwind.config.ts` 格式：将 Token 映射到 Tailwind 的 extend 配置（colors, borderRadius, spacing, fontSize）
- [ ] `css-variables` 格式：生成 CSS 自定义属性（`--ant-color-primary: #1677FF;`）
- [ ] 导出面板 UI：格式选择 + 代码预览（语法高亮）+ 复制 + 下载
- [ ] 文件下载：使用 Blob + URL.createObjectURL + a.download

## Dependencies

Issue #8

## Type

frontend

## Priority

medium

## SPEC Reference

Section 5.6 Export 逻辑
