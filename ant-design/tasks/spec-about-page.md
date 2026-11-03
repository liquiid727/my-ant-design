# SPEC: About Page — 快速上手指南

> Technical specification derived from: tasks/prd-about-page.md
> Generated: 2026-07-14 | Target branch: main

## 1. Summary

### 1.1 What This SPEC Covers

本 SPEC 描述如何为 Ant Design Theme Studio 新增一个 About 页面（`/about` 路由），采用单页多 Tab 区块设计，包含产品介绍、antd 接入教程、LLM API Key 配置指引和 Agent 配置模板四个内容区块。页面使用 lazy loading，遵循现有的路由、布局和样式约定。

### 1.2 PRD Reference

- Source: `tasks/prd-about-page.md`
- User Stories covered: US-001 ~ US-006
- Functional Requirements covered: FR-1 ~ FR-9

### 1.3 Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 页面路由方式 | React.lazy + Suspense（与 LibraryPage 一致） | 保持现有代码分割模式 |
| Tab 实现 | antd `Tabs` 组件 + URL hash 同步 | PRD 要求锚点切换，antd Tabs 原生支持 activeKey 受控模式 |
| 代码高亮 | 不引入第三方库，使用 antd `Typography.Paragraph` copyable + `<pre>` 样式 | 项目无现有高亮依赖，About 页代码片段简短，无需重量级方案 |
| 样式方案 | 在 `styles.css` 中追加 `.about-*` 类 | 遵循项目现有的全局 CSS 约定 |
| 模板内容存放 | 硬编码为组件内常量 | 模板内容固定，无需运行时加载，后续可抽取 |
| 导航入口 | HeaderBar Segmented 新增 About 选项 | PRD 指定，与现有 Playground/Library 导航一致 |

---

## 2. Architecture

### 2.1 System Context

About 页面是一个纯前端静态内容页，不依赖任何后端接口或 store 状态（除了读取 `useLocation` 进行 hash 同步）。它与现有系统的关系：

```
AppLayout
├── HeaderBar        ← [MODIFY] 新增 About 导航项
├── Routes
│   ├── /            → PlaygroundPage
│   ├── /library     → LibraryPage
│   └── /about       → AboutPage  ← [NEW]
└── Overlays (Settings, AI, Plaza)
```

### 2.2 Component Design

```
AboutPage (主容器)
├── AboutHero         — 顶部 banner：产品名称 + 一句话简介
├── Tabs (antd)
│   ├── IntroSection      — Tab 1: 产品介绍
│   ├── AntdGuideSection  — Tab 2: 接入 Ant Design
│   ├── AIConfigSection   — Tab 3: 配置 AI
│   └── AgentSection      — Tab 4: Agent 配置
└── (每个 Section 内部使用 antd Card / Steps / Typography 组合)
```

**组件职责：**

| 组件 | 职责 |
|------|------|
| `AboutPage` | 容器组件，管理 Tab 状态与 URL hash 同步 |
| `AboutHero` | 页面顶部展示区：产品 logo / 名称 / 简介 |
| `IntroSection` | 核心功能列表 + 产品截图，使用 Card 布局 |
| `AntdGuideSection` | 分步骤教程，使用 Steps + 代码片段 |
| `AIConfigSection` | LLM 配置图文指引，使用 Steps + Alert 安全提示 |
| `AgentSection` | 配置模板展示，使用 Card + copyable 代码块 |

### 2.3 File Structure

```
src/
├── components/
│   └── about/
│       ├── AboutPage.tsx        [NEW] — 页面主组件 + 子区块
│       └── codeTemplates.ts     [NEW] — 模板常量（CLAUDE.md、MCP 配置、system prompt）
├── App.tsx                      [MODIFY] — 新增 /about 路由
├── styles.css                   [MODIFY] — 新增 .about-* 样式
└── components/layout/
    └── HeaderBar.tsx            [MODIFY] — Segmented 新增 About 选项
```

**设计决策：** 所有 Section 子组件定义在 `AboutPage.tsx` 同文件中（非导出），因为它们仅在此页面使用且体量不大。如果单文件超过 400 行则拆分为独立文件。`codeTemplates.ts` 单独抽出是因为模板字符串较长，放在组件文件中影响可读性。

---

## 3. Data Model

无数据库变更。本功能为纯前端静态页面，不涉及持久化存储。

---

## 4. API Design

无新增 API。本功能为纯前端静态页面，不需要后端接口。

---

## 5. Business Logic

### 5.1 Tab 与 URL Hash 同步

```
页面加载时:
  1. 读取 window.location.hash → 去掉 '#' 前缀 → 得到 tabKey
  2. 如果 tabKey 在有效 Tab key 列表 ['intro', 'antd', 'ai', 'agent'] 中
     → 设为 activeKey
  3. 否则 → 默认 activeKey = 'intro'

Tab 切换时:
  1. 更新 activeKey state
  2. 调用 navigate({ hash: newKey }, { replace: true })
     使用 replace 避免每次切换都产生浏览器历史记录
```

### 5.2 代码复制

使用 antd `Typography.Paragraph` 的 `copyable` prop，antd 内部已处理 `navigator.clipboard.writeText` 调用和用户反馈（复制成功提示）。

### 5.3 Tab Key 定义

| Tab Key | Label | 对应 Section |
|---------|-------|-------------|
| `intro` | 产品介绍 | IntroSection |
| `antd` | 接入 Ant Design | AntdGuideSection |
| `ai` | 配置 AI | AIConfigSection |
| `agent` | Agent 配置 | AgentSection |

### 5.4 Edge Cases

| 场景 | 处理方式 |
|------|---------|
| URL hash 值无效（如 `#xyz`） | 降级为默认 Tab `intro` |
| 无 hash | 默认 Tab `intro` |
| 浏览器不支持 clipboard API | antd Typography.Paragraph copyable 已内置 fallback |

---

## 6. Error Handling

本功能为静态内容页面，无网络请求或异步操作，错误场景极少：

| 场景 | 处理 |
|------|------|
| lazy load 加载失败 | 由 App.tsx 中的 `Suspense fallback={null}` 处理，与现有页面一致 |
| 代码复制失败 | antd copyable 内部处理，降级为选中文本 |

---

## 7. Security

### 7.1 内容安全

- 所有代码模板为硬编码常量，不存在注入风险
- 页面不接受用户输入，不渲染用户提供的内容
- API Key 配置指引中需明确提示：Key 仅存储在浏览器 localStorage，不上传服务器

---

## 8. Performance

### 8.1 代码分割

- AboutPage 使用 `React.lazy()` 懒加载，不影响首屏（Playground）的加载性能
- 预计 AboutPage bundle 大小 < 20KB（纯静态内容 + 少量 antd 组件引用）

### 8.2 渲染优化

- 各 Section 组件为纯展示组件，无 re-render 触发源
- 模板常量定义在模块顶层，不在渲染时创建

---

## 9. Testing Strategy

### 9.1 Unit Tests

不要求为纯静态展示页编写 unit test（投入产出比低）。

### 9.2 Browser Verification

每个 US 的验收标准中已包含 "Verify in browser using dev-browser skill"，覆盖：

| 验证点 | 方式 |
|--------|------|
| 路由跳转正常 | 点击导航 About → 页面加载 |
| Tab 切换 + hash 同步 | 点击各 Tab → 检查 URL hash 变化 → 刷新页面 → 确认定位正确 |
| 代码复制 | 点击复制按钮 → 检查剪贴板内容 |
| 内容完整性 | 各区块内容渲染正确，无空白或错位 |
| 响应式 | 缩小窗口 → Tabs 可横向滚动，内容不溢出 |

### 9.3 Acceptance Criteria Mapping

| US/FR | 验证方式 | 描述 |
|-------|---------|------|
| US-001 / FR-1, FR-2 | Browser | 路由注册 + 导航入口 |
| US-002 / FR-3, FR-4 | Browser | Tab 切换 + hash 同步 |
| US-003 / FR-6 | Browser | 产品介绍内容渲染 |
| US-004 / FR-7 | Browser | antd 教程步骤 + 代码复制 |
| US-005 / FR-8 | Browser | AI 配置指引内容 |
| US-006 / FR-5, FR-9 | Browser | Agent 模板 + 复制功能 |

---

## 10. Implementation Plan

### 10.1 Phases

实现按依赖顺序分为 3 个阶段：

**Phase 1: 基础架构**（US-001 + US-002）
1. 创建 `src/components/about/AboutPage.tsx` 骨架组件
2. 在 `App.tsx` 中新增 `/about` 路由（lazy load）
3. 修改 `HeaderBar.tsx` Segmented 新增 About 选项
4. 实现 Tabs 组件 + URL hash 同步逻辑
5. 在 `styles.css` 中添加 `.about-*` 基础样式

**Phase 2: 内容区块**（US-003 + US-004 + US-005 + US-006）
6. 实现 IntroSection — 产品介绍
7. 创建 `codeTemplates.ts` — 所有代码模板常量
8. 实现 AntdGuideSection — 接入 antd 教程
9. 实现 AIConfigSection — LLM 配置指引
10. 实现 AgentSection — Agent 配置模板

**Phase 3: 打磨**
11. 响应式适配（768px / 1200px 断点）
12. 浏览器验证全流程

### 10.2 Issue Mapping

| Issue | SPEC Sections | Priority | Depends On |
|-------|--------------|----------|------------|
| US-001: 路由与导航 | 2.3, 5.1 | high | — |
| US-002: 页面布局与 Tab | 2.2, 5.1, 5.3 | high | US-001 |
| US-003: 产品介绍 | 2.2 | medium | US-002 |
| US-004: 接入 antd 教程 | 2.2, 5.2 | medium | US-002 |
| US-005: 配置 AI 指引 | 2.2, 7.1 | medium | US-002 |
| US-006: Agent 配置模板 | 2.2, 2.3, 5.2 | medium | US-002 |

---

## 11. Open Questions & Risks

### 11.1 Unresolved Questions

- 产品介绍区块是否需要动画/GIF 展示？（建议首期不加，后续迭代）
- Agent 模板是否需要同时提供 Codex 和 Claude Code 两种版本？（建议首期仅 Claude Code，PRD 标题已聚焦于此）
- 接入教程是否覆盖 Next.js？（建议首期仅 Vite，与项目自身技术栈一致）

### 11.2 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| 单文件过长 | 可读性下降 | 设 400 行阈值，超过则拆分 Section 为独立文件 |
| 模板内容过时 | 用户按照旧模板操作失败 | 模板集中在 `codeTemplates.ts`，便于统一更新 |

### 11.3 Assumptions

- antd `Tabs` 组件支持受控 `activeKey` 模式（已确认 antd v6 支持）
- `Typography.Paragraph` 的 `copyable` prop 在所有目标浏览器中可用（antd 内部 polyfill）
- 现有 `styles.css` 可继续承载新增样式而不需要拆分（当前 ~884 行，新增预计 ~80 行）

---

## Appendix: Key Implementation Details

### A1. App.tsx 路由注册模式

```tsx
// 遵循现有 LibraryPage 的 lazy load 模式
const AboutPage = lazy(() =>
  import('./components/about/AboutPage').then((m) => ({ default: m.AboutPage }))
);

// 在 <Routes> 中新增
<Route path="/about" element={<AboutPage />} />
```

### A2. HeaderBar Segmented 改动

```tsx
// Segmented options 新增 About
{ label: 'About', value: '/about' }

// value 判断需兼容 /about
value={
  location.pathname === '/library' ? '/library'
  : location.pathname === '/about' ? '/about'
  : '/'
}
```

### A3. Tab Hash 同步核心逻辑

```tsx
const TABS = ['intro', 'antd', 'ai', 'agent'] as const;
type TabKey = typeof TABS[number];

function AboutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const hashKey = location.hash.slice(1);
  const activeKey: TabKey = TABS.includes(hashKey as TabKey)
    ? (hashKey as TabKey)
    : 'intro';

  const onTabChange = (key: string) => {
    navigate({ hash: key }, { replace: true });
  };

  return (
    <Tabs activeKey={activeKey} onChange={onTabChange} items={[...]}>
  );
}
```

### A4. codeTemplates.ts 结构

```ts
export const ANTD_SETUP_STEPS = {
  createProject: `npm create vite@latest my-app -- --template react-ts`,
  installAntd: `npm install antd`,
  configProvider: `import { ConfigProvider } from 'antd';\nimport themeToken from './theme.json';\n\n...`,
  fullExample: `// 完整示例代码...`,
};

export const CLAUDE_MD_TEMPLATE = `# CLAUDE.md\n\n## 项目概述\n...`;
export const MCP_CONFIG_TEMPLATE = `{\n  "mcpServers": { ... }\n}`;
export const SYSTEM_PROMPT_TEMPLATE = `你是一个前端开发助手...`;
```
