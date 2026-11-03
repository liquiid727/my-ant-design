# 接入 Ant Design 教程区块

## Description

实现 About 页面的「接入 Ant Design」Tab 内容。提供从零搭建 antd 项目到应用 Theme Studio 主题的完整分步教程，每步包含可复制的代码片段。同时创建 `codeTemplates.ts` 集中管理所有模板常量。

## Acceptance Criteria

- [x] 创建 `src/components/about/codeTemplates.ts`，集中管理所有代码模板常量
- [x] 分步骤展示：创建 React+Vite 项目 → 安装 antd → 配置 ConfigProvider → 导入 Theme Studio 导出的 token → 应用主题
- [x] 每个步骤包含可复制的代码片段（使用 antd Typography.Paragraph copyable）
- [x] 说明 Theme Studio 导出 token 的格式（JSON）及在 ConfigProvider `theme` prop 中的用法
- [x] 提供一个最小可运行的完整示例代码
- [x] Typecheck/lint passes
- [x] Verify in browser using dev-browser skill

## Dependencies

Issue #014

## Type

ui

## Priority

medium

## SPEC Reference

Section 2.2 AntdGuideSection, Appendix A4
