# AI 响应解析：ThemeConfig 提取 + 校验 + Apply 按钮

## Description

解析 AI 返回的文本，从中提取 ThemeConfig JSON，通过 themeValidator 校验合法性，展示 Token 变更预览（diff），用户点击 Apply 按钮后应用到当前主题。

## Acceptance Criteria

- [ ] `extractThemeFromResponse(text)`：从 AI 回复中提取 JSON（支持 ```json 代码块、裸 JSON、混合文本）
- [ ] `themeValidator(config)`：校验 Token 合法性 — 颜色 hex 格式、数值范围、未知 key 剥离
- [ ] 校验失败的 Token 自动回退到当前值，不阻止其余有效 Token 应用
- [ ] AI 消息中的 ThemeConfig 渲染为可折叠 diff 预览（变更前/后对比）
- [ ] Apply 按钮：一键应用到 themeStore → 预览区刷新
- [ ] Apply 前自动创建版本快照（version management 集成后）
- [ ] 畸形 JSON / 无 JSON 时显示友好提示，不崩溃

## Dependencies

Issue #11

## Type

fullstack

## Priority

high

## SPEC Reference

Section 4.4 Response Parsing, Section 5.3 AI 对话流程
