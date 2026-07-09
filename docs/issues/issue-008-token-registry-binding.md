# Token 注册表 + Editor ↔ Preview 双向绑定

## Description

创建 antd Design Token 注册表（tokenRegistry.ts），记录每个 Token 的名称、类型、默认值、取值范围、分组、描述。实现 Editor 与 Preview 之间的双向绑定：编辑器修改 → 预览实时更新，预览区点击组件 → 定位到对应 Token 编辑项。

## Acceptance Criteria

- [ ] `tokenRegistry.ts`：全局 Token 列表 + 每个组件的 Component Token 列表
- [ ] 每个 Token 条目：`{ name, type: 'color'|'number'|'string', default, min?, max?, group, description }`
- [ ] Editor 修改 → themeStore 更新 → Preview 实时重渲染（< 50ms）
- [ ] Token 值校验：颜色 hex 格式、数值范围限制、非法值回退到默认
- [ ] debounce 策略：ColorPicker/Slider 修改 300ms 防抖

## Dependencies

Issue #6

## Type

frontend

## Priority

high

## SPEC Reference

Section 5.2 Token Registry
