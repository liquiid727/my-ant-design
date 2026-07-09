# Theme Library：CRUD + Grid 卡片 + 缩略图 + Import/Export/Share

## Description

实现主题库管理页面。用户可以保存当前主题到库中、从库中加载主题、复制/删除主题。主题以卡片网格展示（含颜色缩略图）。支持 JSON 导入/导出和剪贴板分享。

## Acceptance Criteria

- [ ] Theme Library 页面（`/library` 路由）
- [ ] ThemeGrid：卡片网格展示所有已保存主题
- [ ] 主题卡片：名称 + 颜色缩略图（主色 + 辅色色块）+ 创建日期 + 操作按钮
- [ ] Save：将当前 ThemeConfig 保存为 ThemeRecord（输入名称）
- [ ] Load：点击卡片 → 设为当前主题 → 跳转 Playground
- [ ] Copy：复制主题，名称加 "(Copy)"
- [ ] Delete：删除主题 + 关联的版本历史（内置预设不可删除）
- [ ] Export：选中主题 → 导出为 JSON 文件下载
- [ ] Import：上传/粘贴 JSON → 解析 + schema 校验 → 加入库
- [ ] Share：将 ThemeConfig 序列化 → 复制到剪贴板

## Dependencies

Issue #5

## Type

frontend

## Priority

medium

## SPEC Reference

Section 5.4 Theme Library 操作
