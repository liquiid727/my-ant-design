# 12 套内置预设主题 + PresetBar + ConfigProvider 动态切换

## Description

将 `官方主题.md` 中的 12 套主题配置转化为 TypeScript 代码，放入 `presets/` 目录。实现 PresetBar（主题图标行，参考官网顶部图标栏），点击图标切换主题，通过 ConfigProvider 动态应用。

## Acceptance Criteria

- [ ] 创建 `presets/` 目录，每个主题独立文件：default.ts, mui.ts, shadcn.ts, bootstrap.ts, cartoon.ts, dark.ts, illustration.ts, glass.ts, geek.ts, lark.ts, blossom.ts, v4.ts
- [ ] 每个预设导出完整 `ConfigProviderProps`（含 theme、wave、button/input/select classNames 等）
- [ ] `presets/index.ts` 统一注册表：导出预设列表 + 元数据（name, icon, primaryColor）
- [ ] PresetBar 组件：水平图标行，高亮当前选中，点击切换
- [ ] ConfigProviderWrapper 组件：读取 themeStore.currentTheme，包裹预览区
- [ ] 切换预设时预览区实时更新，无白屏/闪烁
- [ ] 含 createStyles 的复杂预设（MUI/Shadcn/Bootstrap/Illustration/Glass/Geek）样式正确

## Dependencies

Issue #3

## Type

frontend

## Priority

high

## SPEC Reference

Section 5.4 Theme Library — 内置预设主题, 官方主题.md
