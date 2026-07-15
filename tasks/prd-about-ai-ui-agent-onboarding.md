# PRD: About 与 UI Agent 快速接入中心

## 1. Introduction / Overview

项目当前已经具备 `/about` 页面、Ant Design 接入说明和基础 Agent 模板。本需求将在此基础上升级 About 页面，使其成为前端 UI 开发接入中心，帮助已经具备前端项目的开发者完成以下工作流：

1. 在现有项目中安装 Ant Design。
2. 将 Theme Studio 导出的主题配置接入 Ant Design。
3. 根据当前主题生成并导出 `design.md`。
4. 配置 Claude Code 或 Codex 专业前端 Agent。
5. 通过现有 CLI、MCP 和 `design.md` 约束 Agent 按统一设计语言开发页面。

本期不负责创建 React、TypeScript 或 Vite 项目，不提供本地 LLM Key 配置教程，也不建设新的 AI 主题生成入口。本文档对应 0709（7 月）内容版本。

## 2. Goals

- 帮助已有前端项目快速安装并接入 Ant Design。
- 说明如何将 Theme Studio 导出的主题应用到 `ConfigProvider`。
- 提供可直接预览、复制或下载的 `design.md`。
- 分别提供 Claude Code 与 Codex 的专业 UI Agent 配置模板。
- 说明现有 CLI、MCP 与 Agent 的真实连接方式。
- 约束 Agent 使用 Ant Design 与主题 Token，减少页面间的视觉偏差。
- 保留现有 About 页面路由并升级其内容，不重复建设页面。

## 3. User Stories

### US-001：升级 About 页面信息架构

**Description:** As a developer, I want a clear onboarding path so that I can configure an Agent-driven Ant Design UI workflow.

**Acceptance Criteria:**

- [ ] `/about` 页面包含：产品介绍、Ant Design 接入、设计规范、CLI/MCP、Agent 配置五个导航区块。
- [ ] 页面首屏展示完整流程：安装 Ant Design → 接入主题 → 导出规范 → 配置 Agent → 开发页面。
- [ ] URL hash 与当前区块同步。
- [ ] 旧的 `/about#intro`、`#antd`、`#ai`、`#agent` 链接仍可访问并映射到有效内容。
- [ ] 桌面端、平板端和移动端无横向溢出。
- [ ] Typecheck、build 和现有测试通过。
- [ ] Verify in browser using dev-browser skill.

### US-002：Ant Design 安装与主题接入

**Description:** As a frontend developer with an existing project, I want to install Ant Design and apply a Theme Studio theme so that I can use the design framework immediately.

**Acceptance Criteria:**

- [ ] 展示 Ant Design 及图标包的安装命令。
- [ ] 展示 `ConfigProvider` 接入示例。
- [ ] 展示 Theme Studio JSON/TypeScript 主题文件的导入方式。
- [ ] 提供使用 Button、Card、Form 验证主题是否生效的最小代码片段。
- [ ] 每段命令和代码均支持一键复制。
- [ ] 明确标注示例所适用的 Ant Design 主版本。
- [ ] 不包含 React、TypeScript、Vite 或其他项目脚手架的创建教程。
- [ ] Verify in browser using dev-browser skill.

### US-003：生成并导出 `design.md`

**Description:** As a frontend developer, I want a machine-readable design guide so that Claude Code or Codex can implement consistent pages.

**Acceptance Criteria:**

- [ ] 系统可以根据当前主题生成 `design.md`。
- [ ] `design.md` 包含产品视觉定位、颜色、字体、圆角、阴影、间距与布局规则。
- [ ] `design.md` 包含 Ant Design 全局 Token 与重点组件 Token 的映射。
- [ ] `design.md` 包含页面状态规范：加载、空状态、错误、禁用、悬浮和响应式。
- [ ] `design.md` 包含允许和禁止的 UI 实现方式。
- [ ] 用户可以预览、复制或下载文件。
- [ ] Verify in browser using dev-browser skill.

### US-004：Claude Code / Codex 专业 UI Agent 配置

**Description:** As a Claude Code or Codex user, I want ready-to-use frontend Agent configurations so that either Agent can build and review pages consistently under the same design system.

**Acceptance Criteria:**

- [ ] 在同一个 UI Agent 配置模块中提供 Claude Code 与 Codex 两种选项。
- [ ] Claude Code 选项提供可复制或下载的 `CLAUDE.md` 模板。
- [ ] 提供适用于 Codex 的 `AGENTS.md` 模板。
- [ ] 两套模板均要求先读取 `design.md`、主题文件和现有组件结构。
- [ ] 两套模板均要求优先使用 Ant Design 组件和主题 Token。
- [ ] 两套模板均禁止无理由硬编码颜色、圆角、阴影和间距。
- [ ] 两套模板均要求验证桌面端、平板端和移动端。
- [ ] 两套模板均要求执行 typecheck、build 和相关 UI 测试。
- [ ] 两套模板均要求报告新增硬编码样式及其理由。
- [ ] 提供实现新页面、重构旧页面和 UI Review 三类示例任务。
- [ ] Claude 与 Codex 使用同一套设计约束，但保留各自正确的文件名和配置语法。
- [ ] Verify in browser using dev-browser skill.

### US-005：CLI 与 MCP 接入说明

**Description:** As an Agent user, I want clear CLI and MCP setup instructions so that my Agent can use the expected tools and design artifacts.

**Acceptance Criteria:**

- [ ] 页面分别解释 CLI 与 MCP 的职责。
- [ ] 提供 Claude Code 和 Codex 各自的配置位置与真实示例。
- [ ] 不展示不存在的 Theme Studio CLI 或 MCP Server。
- [ ] 配置示例说明如何让 Agent 读取主题文件和 `design.md`。
- [ ] 提供配置验证命令或验证步骤。
- [ ] 配置错误时提供排查清单。
- [ ] Verify in browser using dev-browser skill.

### US-006：0709 内容发布

**Description:** As a project maintainer, I want the July onboarding content to be identifiable so that it can be maintained as a coherent release article.

**Acceptance Criteria:**

- [ ] 内容标记为 0709 / 7 月版本。
- [ ] 内容包含 Ant Design 安装、主题接入、CLI/MCP、`design.md`、Claude 和 Codex。
- [ ] 页面显示最近更新时间或最近验证时间。
- [ ] 文档中的命令、配置和界面名称与项目当前实现一致。
- [ ] 发布前逐项验证所有可复制示例。
- [ ] Verify in browser using dev-browser skill.

## 4. Functional Requirements

- FR-1: 系统必须保留 `/about` 作为统一接入入口。
- FR-2: 系统必须展示从 Ant Design 安装到 Agent 开发的完整流程。
- FR-3: 系统必须提供 Ant Design 和图标包的安装命令。
- FR-4: 系统必须提供 Theme Studio 主题接入 `ConfigProvider` 的代码。
- FR-5: 系统不得包含项目脚手架创建教程。
- FR-6: 系统必须从当前主题生成 `design.md`。
- FR-7: 系统必须支持预览、复制和下载 `design.md`。
- FR-8: 系统必须在统一的 UI Agent 配置模块中提供 Claude Code 和 Codex 两套配置模板。
- FR-9: 系统必须提供现有 Claude Code 和 Codex CLI 的配置说明。
- FR-10: 系统必须提供现有 MCP 客户端配置说明。
- FR-11: 系统必须明确区分真实可用能力和未实现能力。
- FR-12: 系统必须在移动端提供可用的内容导航和代码阅读体验。

## 5. Non-Goals

- 不创建 React、TypeScript、Vite、Next.js 或其他项目脚手架。
- 不提供本地 LLM API Key 的录入、保存、清除或安全教程。
- 不建设新的 AI 主题生成入口或候选主题预览流程。
- 不开发 Theme Studio CLI 或 Theme Studio MCP Server。
- 不提供 LLM 用量计费或额度管理。
- 不在本期开发通用 IDE 插件。
- 不允许 Agent 从 About 页面直接获得无限制系统权限。
- 不自动提交、推送或部署 Agent 生成的代码。
- 不在本期覆盖 Ant Design 之外的组件库。

## 6. Design Considerations

- About 页面采用步骤式接入中心，避免堆叠成长篇说明书。
- 首屏突出五步工作流和预计完成时间。
- Ant Design 区块假设用户已经拥有可运行的前端项目。
- 代码块必须支持复制，并在复制成功后提供反馈。
- UI Agent 模块统一说明设计约束，并通过 Claude Code / Codex 子选项区分文件名和配置语法。
- 未实现能力必须明确标记，不得使用看似可执行的占位配置。
- 页面视觉必须使用当前 Theme Studio Token，不另建一套硬编码主题。

## 7. Technical Considerations

- 复用现有 `/about` 路由和 `AboutPage`，按增量升级处理。
- 复用现有主题 Store、主题 Registry、Token Registry 和主题导出能力。
- `design.md` 应由结构化数据确定性生成，不依赖 LLM。
- Agent 模板应作为独立资源维护，避免继续堆积在单一 TSX 文件中。
- CLI/MCP 内容必须基于 Claude Code 和 Codex 当前官方配置。
- 不修改现有 Settings Modal、Settings Store 或 LLM Client。

## 8. Success Metrics

- 用户能在 5 分钟内完成 Ant Design 安装和 Theme Studio 主题接入。
- `design.md`、Claude 配置和 Codex 配置均可直接预览、复制或下载。
- 使用生成配置完成示例页面时，不出现未经说明的硬编码主题色。
- About 页关键流程的端到端测试通过率为 100%。
- 所有 CLI/MCP 示例在发布前经过实际命令或官方文档核验。

## 9. Open Questions

- `[Assumption]` 0709 作为 About 内容的版本标记，而不是另建独立博客路由。
- `design.md` 基于当前解析后的完整主题生成，而不是仅输出 overrides。
- 本期 Agent 通过项目文件读取主题规范，不通过 Theme Studio MCP 自动读取主题。
