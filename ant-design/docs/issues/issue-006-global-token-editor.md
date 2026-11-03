# GlobalTokenEditor（颜色、圆角、字号、间距）

## Description

实现全局 Design Token 编辑面板，允许用户修改 antd 5.x 的全局 Token（colorPrimary, colorSuccess, colorWarning, colorError, borderRadius, fontSize, padding/margin 等），修改后实时反映到预览区。

## Acceptance Criteria

- [x] 颜色编辑：colorPrimary, colorSuccess, colorWarning, colorError, colorInfo, colorBgBase, colorTextBase — 使用 antd ColorPicker
- [x] 圆角编辑：borderRadius, borderRadiusSM, borderRadiusLG, borderRadiusXS — 使用 Slider + InputNumber
- [x] 字号编辑：fontSize, fontSizeSM, fontSizeLG — 使用 Slider + InputNumber
- [x] 间距编辑：padding, paddingSM, paddingLG, margin, marginSM, marginLG — 使用 Slider + InputNumber
- [x] 编辑面板布局：分组折叠（Colors / Border / Typography / Spacing）
- [x] 修改 Token → themeStore 更新 → ConfigProvider 实时生效（debounce 300ms）
- [x] 支持 Reset 按钮回到当前预设的默认值

## Dependencies

Issue #2, Issue #3

## Type

frontend

## Priority

high

## SPEC Reference

Section 5.2 Theme Editor
