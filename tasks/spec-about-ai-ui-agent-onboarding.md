# SPEC: About 与 UI Agent 快速接入中心

> Technical specification derived from: `tasks/prd-about-ai-ui-agent-onboarding.md`
> Generated: 2026-07-15 | Target branch: `codex/complete-theme-issues` | Commit: `b0ded7c`

## 1. Summary

### 1.1 What This SPEC Covers

本 SPEC 描述如何增量升级现有 `/about` 页面，将其建设为面向已有前端项目的 Ant Design 与专业 UI Agent 接入中心。本期提供 Ant Design 安装、Theme Studio 主题接入、确定性生成 `design.md`、统一的 Claude Code / Codex UI Agent 配置模块，以及经过官方资料核验的 CLI/MCP 配置教程。

本期不创建 React、TypeScript、Vite 或其他项目脚手架，不提供本地 LLM Key 配置，不新增 AI 主题生成入口，也不开发 Theme Studio CLI 或 MCP Server。

### 1.2 PRD Reference

- Source: `tasks/prd-about-ai-ui-agent-onboarding.md`
- User Stories covered: US-001 ~ US-006
- Functional Requirements covered: FR-1 ~ FR-12

### 1.3 Design Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| 页面建设 | 增量重构现有 `AboutPage` | 路由、导航和基础内容已存在 |
| Ant Design 教程边界 | 只覆盖安装、主题导入和验证 | 用户已经拥有可运行的前端项目 |
| `design.md` | 使用纯函数确定性生成 | 避免 LLM 输出漂移并便于测试 |
| 文件交付 | 页面预览、剪贴板复制、Blob 下载 | 无需申请浏览器文件系统权限 |
| UI Agent 内容 | 一个模块、Claude/Codex 两个子选项 | 共用设计约束，同时保留正确的平台语法 |
| Agent 指令文件 | Claude 使用 `CLAUDE.md`，Codex 使用 `AGENTS.md` | 符合各客户端官方加载机制 |
| CLI/MCP 范围 | 只介绍真实存在的客户端配置 | 不伪造 Theme Studio CLI/MCP 能力 |
| 文档时效 | 记录内容版本和最近核验日期 | CLI/MCP 配置可能随客户端升级变化 |
| 新依赖 | 不新增运行时依赖 | 现有 React、Ant Design 和浏览器 API 已足够 |

---

## 2. Architecture

### 2.1 System Context

```text
AppLayout
├── HeaderBar
├── Routes
│   ├── /             → PlaygroundPage
│   ├── /library      → LibraryPage
│   └── /about        → AboutPage [MODIFY]
└── Existing overlays

AboutPage
├── OverviewSection
├── AntdIntegrationSection
├── DesignDocumentSection
├── ToolingSection
└── UIAgentSection
    ├── Claude Code option → CLAUDE.md
    └── Codex option       → AGENTS.md
```

About 页面只读取当前主题和主题 Registry，不访问 LLM，不修改 Settings 状态，也不新增网络请求。

### 2.2 Component Design

| Module | Responsibility |
|---|---|
| `AboutPage` | 页面布局、Tab 状态、URL hash 解析与兼容映射 |
| `OverviewSection` | 展示五步接入流程与 0709 内容版本 |
| `AntdIntegrationSection` | 展示 Ant Design 安装、主题导入和验证代码 |
| `DesignDocumentSection` | 生成、预览、复制和下载 `design.md` |
| `ToolingSection` | 展示 Claude/Codex CLI 与 MCP 配置、验证和排错 |
| `UIAgentSection` | 统一承载 Claude Code / Codex 两套 Agent 配置 |
| `TextArtifactCard` | 统一处理文本预览、复制、下载和反馈 |
| `designMdGenerator` | 从当前主题生成稳定的 Markdown 设计规范 |
| `agentArtifactGenerator` | 从共享规则生成 `CLAUDE.md` 和 `AGENTS.md` |
| `toolingGuideRegistry` | 维护经过核验的 CLI/MCP 内容和官方链接 |
| `textArtifact` | 提供文本文件名清理、复制和下载辅助能力 |

### 2.3 Module Interactions

#### Generate `design.md`

```text
User opens #design
  → DesignDocumentSection reads currentTheme + activePresetId
  → resolves preset metadata from themePresetRegistry
  → generateDesignMarkdown(context)
  → renders TextArtifactCard
  → user previews, copies, or downloads design.md
```

#### Generate Agent instructions

```text
User opens #agents
  → selects Claude Code or Codex
  → UIAgentSection calls generateAgentArtifact(kind)
  → shared UI rules are rendered through platform-specific wrapper
  → user copies or downloads CLAUDE.md / AGENTS.md
```

#### View CLI/MCP guide

```text
User opens #tooling
  → selects client and transport/example
  → ToolingSection reads static verified guide registry
  → renders commands, config locations, verification and troubleshooting
```

### 2.4 File Structure

```text
src/
├── components/about/
│   ├── AboutPage.tsx                         [MODIFY]
│   ├── components/
│   │   └── TextArtifactCard.tsx              [NEW]
│   └── sections/
│       ├── OverviewSection.tsx               [NEW]
│       ├── AntdIntegrationSection.tsx        [NEW]
│       ├── DesignDocumentSection.tsx         [NEW]
│       ├── ToolingSection.tsx                [NEW]
│       └── UIAgentSection.tsx                [NEW]
├── services/docs/
│   ├── designMdGenerator.ts                  [NEW]
│   ├── designMdGenerator.test.ts             [NEW]
│   ├── agentArtifactGenerator.ts             [NEW]
│   ├── agentArtifactGenerator.test.ts        [NEW]
│   ├── toolingGuideRegistry.ts               [NEW]
│   ├── textArtifact.ts                       [NEW]
│   └── textArtifact.test.ts                  [NEW]
└── styles.css                                [MODIFY]

e2e/
└── about-onboarding.spec.ts                  [NEW]

src/components/about/codeTemplates.ts         [REMOVE after migration]
```

`SettingsModal.tsx`、`settingsStore.ts`、`LLMClient.ts` 不在本期修改范围内。

---

## 3. Data Model

### 3.1 Schema Changes

无数据库、后端 API 或持久化 Schema 变更。

### 3.2 Entity Definitions

```ts
type DesignDocumentContext = {
  theme: ThemeConfig;
  preset: {
    id: string;
    name: string;
    style: string;
  };
  generatedAt: string;
  contentVersion: '0709';
  studioVersion: string;
};

type AgentArtifactKind = 'claude-md' | 'codex-agents-md';

type TextArtifact = {
  kind: 'design-md' | AgentArtifactKind;
  filename: 'design.md' | 'CLAUDE.md' | 'AGENTS.md';
  content: string;
  mimeType: 'text/markdown;charset=utf-8';
};

type ToolingGuide = {
  id: string;
  client: 'claude-code' | 'codex';
  category: 'cli' | 'mcp';
  title: string;
  description: string;
  command?: string;
  configPath?: string;
  configExample?: string;
  verification: string[];
  troubleshooting: string[];
  officialUrl: string;
  lastVerifiedAt: string;
};
```

### 3.3 Relationships

- `DesignDocumentContext.theme` 来自 `useThemeStore.currentTheme`。
- `DesignDocumentContext.preset` 通过 `activePresetId` 查询 `themePresetRegistry`。
- Agent Artifact 不读取 Store；它只依赖共享的静态 UI 规则和默认 `design.md` 路径。
- Tooling Guide 为版本控制中的静态内容，不写入 localStorage。

### 3.4 Migration Plan

无数据迁移。旧 About 模板字符串迁移至新 Registry 后删除 `codeTemplates.ts`。现有路由和 Header 导航保持不变。

---

## 4. API Design

### 4.1 HTTP Endpoints

本期无新增 HTTP API。

### 4.2 Internal Service Contracts

#### Generate design document

```ts
generateDesignMarkdown(context: DesignDocumentContext): string
```

规则：

- 输入缺少必要 Theme 结构时抛出 `DesignDocumentError`。
- 相同输入必须生成相同正文；仅元数据时间允许变化。
- 不读取浏览器存储、Settings、聊天记录或 LLM 配置。

#### Generate Agent artifact

```ts
generateAgentArtifact(
  kind: AgentArtifactKind,
  options?: { designDocPath?: string; themeFilePath?: string },
): TextArtifact
```

默认值：

- `designDocPath`: `./design.md`
- `themeFilePath`: `./src/theme.ts`

#### Copy artifact

```ts
copyTextArtifact(content: string): Promise<void>
```

#### Download artifact

```ts
downloadTextArtifact(artifact: TextArtifact): void
```

文件名必须经过 allow-list 校验，不允许路径分隔符。

### 4.3 Breaking Changes

无公共 API 破坏性变更。

About hash 将使用新 canonical key，但通过 alias 保持旧链接兼容：

| Legacy hash | Canonical hash |
|---|---|
| `#intro` | `#overview` |
| `#antd` | `#antd` |
| `#ai` | `#design` |
| `#agent` | `#agents` |

未知 hash 降级为 `#overview`。

---

## 5. Business Logic

### 5.1 About Navigation

Canonical Tab：

| Key | Label | Content |
|---|---|---|
| `overview` | 产品介绍 | 五步接入流程、适用人群、0709 元数据 |
| `antd` | Ant Design 接入 | 安装、ConfigProvider、验证片段 |
| `design` | design.md | 生成、预览、复制、下载 |
| `tooling` | CLI / MCP | Claude/Codex 配置与排错 |
| `agents` | UI Agent | Claude Code / Codex 双选项 |

页面加载逻辑：

1. 读取 `location.hash`。
2. 若为 legacy key，转换为 canonical key。
3. 若为未知 key，使用 `overview`。
4. 必要时使用 `navigate(..., { replace: true })` 规范化 URL。
5. Tab 切换同样使用 `replace`，避免产生大量历史记录。

### 5.2 Ant Design Integration Guide

本区块假设用户已经有可运行的前端项目，只包含：

1. 安装：

   ```bash
   npm install antd @ant-design/icons
   ```

2. 从 Theme Studio 导出 `theme.ts` 或 `theme.json`。
3. 将导出内容传入根节点 `ConfigProvider theme`。
4. 使用 Button、Card、Form 代码片段检查主题是否生效。
5. 标记示例面向 Ant Design 6。

禁止出现：

- `npm create vite`
- React/TypeScript/Vite/Next.js 项目初始化
- 路由、状态管理、目录结构等通用项目教程

### 5.3 `design.md` Generation

输出章节顺序固定：

1. Document metadata
2. Design intent
3. Theme foundation
4. Color system
5. Typography
6. Radius and borders
7. Spacing
8. Component rules
9. Interaction states
10. Responsive rules
11. Accessibility
12. Agent implementation rules
13. Verification checklist

生成规则：

- Theme 名称来自 `currentTheme.name`。
- 风格描述来自对应 preset 的 `style`。
- 算法来自 `currentTheme.algorithm`。
- 全局 Token 按 `tokenRegistry.global` 分组输出。
- 组件 Token 按 `tokenRegistry.components` 输出。
- 仅输出 Registry 已登记或当前主题明确存在的值。
- 不为缺失 Token 伪造业务含义。
- 色彩值使用代码格式；数值保留其实际单位说明。
- `generatedAt` 使用 ISO 8601。
- 输出不得调用 LLM。

### 5.4 Unified UI Agent Module

UI Agent 为一个用户故事和一个页面模块，使用 Segmented/Tabs 在 Claude Code 与 Codex 之间切换。

两套配置共享以下规则：

- UI 工作开始前读取 `design.md`、主题文件和已有组件结构。
- 优先使用 Ant Design 组件。
- 视觉值优先来自 Theme Token 或组件 Token。
- 禁止无理由硬编码颜色、圆角、阴影和间距。
- 覆盖 loading、empty、error、disabled、hover、focus 状态。
- 验证桌面端、平板端和移动端。
- 执行 typecheck、build 和相关 UI 测试。
- 汇报新引入的硬编码视觉值及理由。

平台差异：

| Client | Filename | Platform-specific behavior |
|---|---|---|
| Claude Code | `CLAUDE.md` | 使用 `@design.md` 导入设计规范；保留 Claude Code 语法 |
| Codex | `AGENTS.md` | 明确要求读取 `./design.md`；遵循目录层级指令发现机制 |

Claude Code 官方文档说明项目指令可以放在 `./CLAUDE.md` 或 `./.claude/CLAUDE.md`，并支持 `@path` 导入其他文件：<https://code.claude.com/docs/en/memory>

Codex 官方文档说明 Codex 从项目根目录向当前目录发现并组合 `AGENTS.md`：<https://learn.chatgpt.com/docs/agent-configuration/agents-md>

两套模板必须提供三类示例任务：

- 根据 `design.md` 实现新页面。
- 将旧页面重构为 Ant Design + Token 驱动。
- 审查页面协调性、响应式和硬编码样式。

### 5.5 CLI and MCP Guides

本期只介绍 Claude Code 和 Codex 的现有能力。

Claude Code 至少覆盖：

- `claude mcp add`
- `claude mcp list`
- `claude mcp get <name>`
- 交互界面的 `/mcp`
- 项目共享配置 `.mcp.json`
- local/project/user scope 的区别

官方文档：<https://code.claude.com/docs/en/mcp>

Codex 至少覆盖：

- `codex mcp add`
- `codex mcp list`
- TUI 中的 `/mcp`
- 用户级 `~/.codex/config.toml`
- 可信项目的 `.codex/config.toml`
- `[mcp_servers.<name>]` 配置格式

官方文档：<https://learn.chatgpt.com/docs/extend/mcp>

允许展示的示例必须对应真实公开 MCP，例如 Playwright、Figma、GitHub 或官方文档服务。不得继续展示：

```text
<theme-studio-mcp-command>
```

也不得将 Theme Studio 描述为已经提供 CLI 或 MCP Server。

### 5.6 Content Versioning

About 页面展示：

- 内容版本：`0709`
- 最近更新时间
- CLI/MCP 最近核验日期
- 指向 Claude Code 与 Codex 官方文档的链接

`lastVerifiedAt` 为内容元数据，不在运行时自动联网更新。

### 5.7 Edge Cases

| Scenario | Handling |
|---|---|
| 当前 preset ID 不存在 | 使用当前 Theme 名称和 `Custom theme` 风格描述 |
| Theme 缺少某一 Token 组 | 跳过该项，不生成伪造值 |
| Clipboard API 不可用 | 保留可选中文本并提示使用下载 |
| Blob 下载失败 | 提示复制内容，不清空预览 |
| 旧 `#ai` 链接 | 映射到 `#design`，不展示 LLM Key 教程 |
| 未知 hash | 显示 Overview 并规范化 URL |
| MCP 示例已过期 | 以 `lastVerifiedAt` 和官方链接提示重新核验 |
| 移动端代码过长 | 代码块内部横向滚动，不扩大页面宽度 |

---

## 6. Error Handling

### 6.1 Error Taxonomy

| Error Code | Condition | User Message |
|---|---|---|
| `DESIGN_CONTEXT_INVALID` | 当前主题缺少必要结构 | 当前主题数据不完整，无法生成 design.md |
| `DESIGN_GENERATION_FAILED` | Markdown 生成异常 | 设计规范生成失败，请重试 |
| `ARTIFACT_COPY_FAILED` | Clipboard API 失败或权限被拒绝 | 无法复制，请手动选择文本或下载文件 |
| `ARTIFACT_DOWNLOAD_FAILED` | Blob 或下载触发失败 | 下载失败，请复制内容后手动保存 |
| `PRESET_NOT_FOUND` | active preset 不存在 | 使用当前主题生成基础设计规范 |
| `UNKNOWN_ABOUT_HASH` | URL hash 无效 | 自动返回产品介绍 |

### 6.2 Retry Strategy

- 文档生成是本地同步操作，不自动重试。
- 复制与下载由用户主动重试。
- 外部官方链接加载失败不影响页面本地内容。
- 本期无网络 API 重试逻辑。

### 6.3 Failure Modes

- 单个 Artifact 生成失败时，其他 Tab 仍必须正常使用。
- Tooling Guide 内容为静态数据，不因外部网站不可用而消失。
- 未识别 Theme 数据时不得渲染空白页。

---

## 7. Security

### 7.1 Authentication & Authorization

本期为公开静态页面，无认证或角色权限变化。

### 7.2 Input Validation

- Artifact 文件名使用固定 enum，不接受任意用户路径。
- Markdown 内容以纯文本方式预览，不使用 `dangerouslySetInnerHTML`。
- MCP 示例中的 Token 必须使用环境变量占位符。
- 不执行用户复制进页面的命令或配置。

### 7.3 Data Protection

- `designMdGenerator` 不得导入 Settings Store、Chat Store 或 Storage Service。
- Agent Artifact 不得包含 API Key、Base URL、模型、聊天内容或绝对用户目录。
- 单元测试使用哨兵字符串检查导出内容不存在敏感信息。
- 本期不修改或读取本地 LLM Key。

---

## 8. Performance

### 8.1 Expected Load

- About 页面为单用户浏览器内静态内容。
- `design.md` 只在主题或 preset 变化时重新生成。
- 典型文档正文预计小于 100KB。

### 8.2 Optimization Strategy

- 保持 AboutPage 的 `React.lazy` 路由加载。
- 生成器实现为无副作用纯函数。
- 模板和 Tooling Guide 在模块顶层定义。
- 可通过 `useMemo` 基于 `currentTheme` 和 `activePresetId` 生成 Artifact。
- 不引入 Markdown 编辑器、语法高亮器或新的文档运行时。

### 8.3 Performance Targets

- 常规主题生成 `design.md` 小于 20ms。
- About lazy chunk gzip 后增量目标小于 40KB。
- Tab 切换不触发网络请求。
- 移动端代码块滚动不得导致主文档横向溢出。

---

## 9. Testing Strategy

### 9.1 Unit Tests

#### `designMdGenerator.test.ts`

- 相同 Context 生成相同正文。
- 输出包含 Theme 名称、preset 风格和算法。
- 全局 Token 按正确章节输出。
- Component Token 按组件输出。
- 缺失 preset 时正确降级。
- 未登记 Token 不产生未经说明的规范。
- 输出不包含 API Key 哨兵、Base URL、模型或聊天内容。

#### `agentArtifactGenerator.test.ts`

- Claude Artifact 文件名为 `CLAUDE.md`。
- Codex Artifact 文件名为 `AGENTS.md`。
- 两个 Artifact 均要求读取 `design.md`。
- 两个 Artifact 均包含 Ant Design、Token、响应式和验证要求。
- Claude Artifact 使用 Claude 适用的导入说明。
- Codex Artifact 不错误使用 Claude 专属语法。
- 两个 Artifact 均包含新建、重构、Review 三类任务示例。

#### `textArtifact.test.ts`

- 下载文件名拒绝路径分隔符。
- Blob MIME 为 UTF-8 Markdown。
- 创建的 Object URL 最终被释放。
- Clipboard reject 时向上抛出规范错误。

### 9.2 Integration / Browser Tests

- `/about#intro` 映射到 Overview。
- `/about#ai` 映射到 Design Document。
- `/about#agent` 映射到 UI Agent。
- 五个 canonical Tab 均可访问。
- Ant Design 区块包含安装命令和 ConfigProvider 示例。
- Ant Design 区块不包含 `npm create vite`。
- `design.md` 预览包含当前主题名称和主色。
- Copy 成功显示反馈。
- Download 文件名为 `design.md`。
- UI Agent 模块可以切换 Claude Code 与 Codex。
- Claude 下载文件名为 `CLAUDE.md`。
- Codex 下载文件名为 `AGENTS.md`。
- Tooling 区块不存在 Theme Studio MCP 占位命令。
- 页面不包含 LLM API Key 配置教程。
- 390px、834px、1440px 三种 viewport 无横向溢出。

### 9.3 Acceptance Criteria Mapping

| PRD Story / FR | Test Type | Coverage |
|---|---|---|
| US-001 / FR-1, FR-2, FR-12 | E2E | 页面结构、hash、响应式 |
| US-002 / FR-3, FR-4, FR-5 | E2E | 安装、主题接入、排除脚手架教程 |
| US-003 / FR-6, FR-7 | Unit + E2E | design.md 生成、预览、复制、下载 |
| US-004 / FR-8 | Unit + E2E | 统一 UI Agent 模块和双平台 Artifact |
| US-005 / FR-9, FR-10, FR-11 | Content + E2E | 真实 CLI/MCP 配置与能力边界 |
| US-006 | E2E + Manual | 0709 标记、核验日期、示例检查 |

### 9.4 Verification Commands

```bash
npm test
npm run build
npx playwright test e2e/about-onboarding.spec.ts
```

---

## 10. Implementation Plan

### 10.1 Phases

#### Phase 1: Artifact services

1. 定义 `DesignDocumentContext`、`TextArtifact` 和生成器接口。
2. 实现 `designMdGenerator`。
3. 实现共享 UI 规则与 Claude/Codex Artifact Generator。
4. 实现复制、下载与错误包装。
5. 完成单元测试。

#### Phase 2: About information architecture

1. 拆分现有 `AboutPage.tsx`。
2. 实现五个 canonical Tab。
3. 实现 legacy hash alias。
4. 增加 0709 与最近核验日期。

#### Phase 3: Ant Design and design document UI

1. 将 Ant Design 内容收敛为安装、主题导入、ConfigProvider 和验证片段。
2. 删除 Vite 项目创建命令。
3. 实现 Design Document 预览、复制与下载。

#### Phase 4: Unified UI Agent and tooling guides

1. 实现一个 UI Agent 模块和 Claude/Codex 两个子选项。
2. 提供 `CLAUDE.md`、`AGENTS.md` 预览与下载。
3. 写入经过核验的 CLI/MCP 配置。
4. 删除虚假的 Theme Studio MCP 占位模板。

#### Phase 5: Verification

1. 补充 About E2E。
2. 执行单测和 build。
3. 执行三档 viewport 浏览器验证。
4. 手动复核所有命令、链接与复制内容。

### 10.2 Issue Mapping

| Suggested Issue | SPEC Sections | Priority | Depends On |
|---|---|---|---|
| 1. Design and Agent artifact services | 3, 4.2, 5.3, 5.4 | High | — |
| 2. About navigation and section refactor | 2, 5.1 | High | — |
| 3. Ant Design integration and design.md UI | 5.2, 5.3 | High | #1, #2 |
| 4. Unified Claude/Codex Agent module | 5.4 | High | #1, #2 |
| 5. CLI/MCP verified guide | 5.5, 5.6 | Medium | #2 |
| 6. E2E and release verification | 9 | High | #3, #4, #5 |

### 10.3 Incremental Delivery

- Phase 1 可独立合入，不改变现有 UI。
- Phase 2 通过 legacy hash 保证旧链接兼容。
- Phase 3～4 可按 Tab 独立交付。
- Phase 5 完成后才标记 0709 内容为已核验。
- 无需 feature flag；未完成的新 Tab 不应提前暴露空内容。

---

## 11. Open Questions & Risks

### 11.1 Unresolved Questions

- 0709 当前按 About 内容版本处理，不新增博客路由。
- 如果未来新增 Theme Studio CLI/MCP，应单独建立 PRD/SPEC，不在本方案中预留虚假命令。

### 11.2 Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Claude/Codex 配置格式变化 | 用户复制后无法使用 | 保存 `lastVerifiedAt` 并链接官方文档 |
| `design.md` 输出过长 | Agent 上下文浪费 | 仅输出登记和实际存在的 Token |
| Claude/Codex 模板混用语法 | Agent 无法加载指令 | 共享规则、平台 wrapper 分离并单测 |
| Clipboard 权限被拒绝 | 一键复制失败 | 保留文本预览和下载入口 |
| 旧 hash 失效 | 既有链接回归 | Alias 映射和 E2E 覆盖 |
| 代码块撑开移动页面 | 页面横向溢出 | 代码块内部滚动和 viewport E2E |
| 内容继续提及 LLM Key | 超出最终范围 | E2E/内容断言禁止相关教程文本 |

### 11.3 Assumptions

- 用户已经拥有可运行的前端项目。
- `design.md` 基于当前解析后的完整 Theme 生成，不只输出 overrides。
- Agent 通过项目文件读取 Theme 和 `design.md`，不通过 Theme Studio MCP 获取数据。
- 当前项目继续使用 Ant Design 6。
- CLI/MCP 内容在实际实施或发布当天需要再次对照官方文档核验。
