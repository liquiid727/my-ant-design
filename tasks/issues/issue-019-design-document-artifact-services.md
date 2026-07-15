# 实现 design.md 生成器与文本 Artifact 基础能力

## Description

实现确定性的 `design.md` 生成服务，以及 Markdown 文本复制、下载和错误处理能力。服务只依赖当前主题和主题元数据，不读取 Settings、LLM 或聊天数据。

## Acceptance Criteria

- [ ] 定义 `DesignDocumentContext` 和 `TextArtifact` 类型
- [ ] 实现纯函数 `generateDesignMarkdown()`
- [ ] 输出包含设计意图、颜色、字体、圆角、间距、组件、交互状态、响应式、可访问性和验证清单
- [ ] 只输出 Token Registry 已登记或当前主题实际存在的值
- [ ] 实现 UTF-8 Markdown 文件下载和文件名 allow-list 校验
- [ ] Clipboard 失败时返回规范化错误
- [ ] preset 不存在时可降级生成 Custom Theme 规范
- [ ] 单元测试验证输出确定性、preset 降级和敏感内容隔离
- [ ] 输出不得包含 API Key、Base URL、模型或聊天内容
- [ ] Typecheck 和 unit tests 通过

## Dependencies

None

## Type

frontend

## Priority

high

## SPEC Reference

Sections 3.2, 4.2, 5.3, 6, 7, 9.1
