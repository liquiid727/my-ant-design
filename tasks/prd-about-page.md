# PRD: About Page — 快速上手指南

## Introduction

为 Ant Design Theme Studio 增设一个 About 页面，作为产品的一站式入门指南。页面采用单页多区块（Tab/锚点）形式，涵盖四大核心内容：产品介绍、从零搭建 antd 项目并接入 Theme Studio 主题、在 Settings 中配置 LLM API Key 使用 AI 生成主题、以及提供 Claude Code / Codex Agent 的配置模板实现快速开发。

该页面解决的核心问题是：新用户打开 Theme Studio 后不知道如何将生成的主题应用到自己的项目中，也不清楚 AI 功能和 Agent 开发工作流如何配置。

## Goals

- 提供清晰的产品定位介绍，让用户在 30 秒内理解 Theme Studio 的核心价值
- 引导用户从零搭建 antd 项目并成功接入 Theme Studio 生成的主题
- 帮助用户在 Settings 中完成 LLM API Key 配置，解锁 AI 主题生成功能
- 提供可复制即用的 CLAUDE.md / Agent 配置模板，让开发者快速搭建基于 Theme Studio 设计框架的前端开发工作流
- 顶部导航栏新增 About 入口，用户可随时访问

## User Stories

### US-001: About 页面路由与导航入口

**Description:** As a user, I want to access an About page from the top navigation bar so that I can learn how to use Theme Studio.

**Acceptance Criteria:**
- [ ] 新增 `/about` 路由，使用 lazy loading 加载 AboutPage 组件
- [ ] HeaderBar 顶部导航 Segmented 中新增 "About" 选项，点击跳转至 `/about`
- [ ] 当前路径为 `/about` 时，Segmented 高亮 About 选项
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: About 页面布局与 Tab 导航

**Description:** As a user, I want to navigate between different sections of the About page via tabs so that I can quickly find the information I need.

**Acceptance Criteria:**
- [ ] 页面顶部展示 Tabs 组件，包含四个 Tab：产品介绍、接入 Ant Design、配置 AI、Agent 配置
- [ ] 点击 Tab 切换对应内容区块，URL hash 同步更新（如 `#intro`, `#antd`, `#ai`, `#agent`）
- [ ] 刷新页面后根据 URL hash 自动定位到对应 Tab
- [ ] 页面整体风格与现有 PlaygroundPage / LibraryPage 保持一致
- [ ] 在移动端 viewport 下 Tabs 可横向滚动，内容区块不溢出
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: 产品介绍区块

**Description:** As a new user, I want to understand what Theme Studio is and what it can do so that I know whether it's useful for me.

**Acceptance Criteria:**
- [ ] 展示产品名称、一句话简介和核心功能列表（可视化编辑 Token、AI 生成主题、Playground 预览、主题导出、社区广场）
- [ ] 包含一张产品截图或示意图（可用现有 Playground 截图）
- [ ] 使用 antd 的 Typography、Card 等组件排版，风格简洁
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: 接入 Ant Design 教程区块

**Description:** As a developer, I want a step-by-step guide to set up an antd project and apply a Theme Studio theme so that I can use the generated theme in my own app.

**Acceptance Criteria:**
- [ ] 分步骤展示：创建 React 项目 → 安装 antd → 配置 ConfigProvider → 导入 Theme Studio 导出的 token → 应用主题
- [ ] 每个步骤包含可复制的代码片段（使用 antd Typography.Paragraph copyable 或带复制按钮的代码块）
- [ ] 说明 Theme Studio 导出 token 的格式（JSON）以及如何在 ConfigProvider 的 `theme` prop 中使用
- [ ] 提供一个最小可运行示例的完整代码
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: 配置 AI（LLM API Key）教程区块

**Description:** As a user, I want to know how to configure my LLM API Key in Theme Studio settings so that I can use the AI-powered theme generation feature.

**Acceptance Criteria:**
- [ ] 说明支持的 LLM 提供商（根据 Settings 中实际支持的 provider 列举）
- [ ] 图文指引：打开 Settings → 填入 API Key → 选择模型 → 保存
- [ ] 简要说明 AI Chat 功能能做什么（自然语言描述 → 生成主题 token）
- [ ] 包含安全提示：API Key 仅存储在本地浏览器，不会上传到服务器
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-006: Agent 配置模板区块

**Description:** As a developer, I want copy-paste-ready agent configuration templates so that I can quickly set up Claude Code / Codex to build UIs using Theme Studio's design framework.

**Acceptance Criteria:**
- [ ] 提供 CLAUDE.md 配置模板，包含项目上下文（antd + Theme Studio 主题系统）和开发规范
- [ ] 提供 MCP server 配置片段（如适用），说明如何接入 CLI 和 MCP
- [ ] 提供 system prompt 模板，引导 Agent 按照 Theme Studio 的 token 体系进行 UI 开发
- [ ] 所有模板内容支持一键复制
- [ ] 简要说明每个模板的用途和使用场景
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: 系统必须在 `/about` 路由下渲染 AboutPage 组件
- FR-2: 系统必须在 HeaderBar 的 Segmented 导航中展示 About 选项
- FR-3: 系统必须支持通过 Tabs 组件在四个内容区块之间切换
- FR-4: 系统必须将当前 Tab 状态同步到 URL hash，并在页面加载时从 hash 恢复
- FR-5: 系统必须在代码片段旁提供复制按钮，点击后将代码复制到剪贴板
- FR-6: 系统必须在产品介绍区块展示核心功能列表
- FR-7: 系统必须在接入 Ant Design 区块提供从零搭建到主题应用的完整步骤
- FR-8: 系统必须在配置 AI 区块展示 API Key 配置流程
- FR-9: 系统必须在 Agent 配置区块提供可复制的 CLAUDE.md、MCP 配置和 system prompt 模板

## Non-Goals

- 不做多语言国际化（本期仅中文或中英混排）
- 不做交互式教程或 sandbox 环境（仅静态文档 + 代码片段）
- 不做视频教程嵌入
- 不做用户进度追踪（如"已完成第 2 步"）
- 不做 Agent 的在线运行或测试功能
- 不做 LLM API Key 的代理中转服务

## Design Considerations

- 复用 antd 现有组件：Tabs、Typography、Card、Steps、Alert、Tag
- 代码高亮可使用 Typography.Paragraph 的 `code` 模式或简单的 `<pre>` 标签配合 antd 样式
- 保持与现有页面一致的布局风格：顶部 HeaderBar + 内容区域居中、最大宽度限制
- Tab 切换应流畅，无页面闪烁
- 各区块内容长度可能不一，需保证滚动体验自然

## Technical Considerations

- AboutPage 使用 React.lazy + Suspense 进行代码分割，避免影响首屏加载
- URL hash 同步使用 `useLocation` + `useNavigate` 或原生 `window.location.hash`
- 模板内容（CLAUDE.md、system prompt 等）可硬编码为常量字符串，后续有需要再抽取为独立文件
- 复制功能使用 `navigator.clipboard.writeText` API
- 无新增后端依赖，纯前端页面

## Success Metrics

- 用户通过 About 页面教程可在 10 分钟内完成 antd 项目的主题接入
- AI 配置教程覆盖 Settings 中所有支持的 provider，用户无需额外查找文档
- Agent 配置模板复制后可直接使用，无需手动修改即可运行
- About 页面加载时间不超过 1 秒（lazy load 后）

## Open Questions

- 产品介绍区块是否需要放一段动画/GIF 展示操作流程？
- Agent 配置模板是否需要同时提供 Codex（OpenAI）和 Claude Code 两种版本？
- 是否需要在 About 页面底部添加 GitHub 仓库链接和贡献指南？
- 接入教程是否需要同时覆盖 Vite 和 Next.js 两种项目模板？
