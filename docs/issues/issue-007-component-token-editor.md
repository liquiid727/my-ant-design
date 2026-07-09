# ComponentTokenEditor（组件级 Token 编辑）

## Description

实现组件级 Token 编辑面板，允许用户针对特定 antd 组件（Button, Input, Select, Card, Modal 等）单独覆写 Design Token。组件级修改优先于全局 Token，且不影响其他组件。

## Acceptance Criteria

- [ ] 组件选择器：下拉列表选择目标组件（Button, Input, Select, Card, Modal, Alert, Table, Menu 等）
- [ ] 选择组件后展示该组件的可编辑 Token 列表（基于 tokenRegistry）
- [ ] 每个 Token 根据类型展示对应编辑器（颜色 → ColorPicker, 数值 → Slider, 字符串 → Input）
- [ ] 修改 Component Token → themeStore.components[component] 更新 → 仅影响目标组件
- [ ] 已覆写的 Token 标记高亮，可单独 Reset
- [ ] 预览区中目标组件实时更新

## Dependencies

Issue #6

## Type

frontend

## Priority

high

## SPEC Reference

Section 5.2 Theme Editor — Component Token
