# SPEC: Ant Design Theme Studio (AI Design System Builder)

> Technical specification derived from: [prd.md](prd.md)
> Generated: 2026-07-09 | Version: v1.0

## 1. Summary

### 1.1 What This SPEC Covers

一个基于 Vite + React + Ant Design 的纯前端应用，复刻 Ant Design 官方主题预览界面，并在其基础上增加：LLM Provider 配置面板、AI 对话式主题生成/调整、主题库管理、版本控制、多格式导出、CLI/MCP 集成、以及项目主题迁移能力。用户通过自然语言与 AI Agent 对话即可生成、预览、编辑、导出企业级 Design System。

### 1.2 PRD Reference

- Source: [prd.md](prd.md)
- 功能模块覆盖: 5.1 ~ 5.10 + 八（Project Migration）

### 1.3 Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 前端框架 | Vite + React 18 + TypeScript | 构建快、生态成熟、与 antd 原生兼容 |
| UI 框架 | antd 5.x + antd-style | 目标就是 antd Design Token，自身也用 antd 构建 |
| 状态管理 | Zustand | 轻量、TypeScript 友好、无 boilerplate |
| AI 对话 UI | 右侧 Drawer 面板 | 不遮挡主预览区，随时展开/收起 |
| 数据持久化 | LocalStorage + JSON | 零后端依赖，MVP 快速验证 |
| LLM 调用方式 | 浏览器直连 LLM API（CORS proxy 兜底） | 无需自建后端，API Key 仅存本地 |
| 主题版本管理 | LocalStorage 存储版本链表 | 轻量 diff/rollback，无 Git 依赖 |
| 路由 | React Router v6 | SPA 页面切换（Playground / Library） |
| 部署 | Vercel (Static Site) | 零配置部署、全球 CDN、自动 HTTPS |
| Settings 入口 | Header 上的 Settings 按钮 → Modal 弹窗 | 不占用独立页面，随时弹出配置 LLM |

---

## 2. Architecture

### 2.1 System Context

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Playground│  │  Theme   │  │  Theme   │             │
│  │  Preview │  │  Editor  │  │ Library  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │              │              │                   │
│       └──────┬───────┴──────┬───────┘                   │
│              │              │                           │
│       ┌──────▼──────┐ ┌────▼─────┐  ┌───────────────┐ │
│       │ ThemeStore  │ │ Version  │  │ Settings Modal│ │
│       │ (Zustand)   │ │ Store    │  │ (LLM Config)  │ │
│       └──────┬──────┘ └────┬─────┘  └──────┬────────┘ │
│              │              │               │          │
│              │              │         ┌─────▼───┐      │
│              │              │         │ LLM     │      │
│              │              │         │ Client  │      │
│              │              │         └─────┬───┘      │
│              │              │                      │     │
│       ┌──────▼──────────────▼──────────────────────▼───┐│
│       │              LocalStorage                      ││
│       └────────────────────────────────────────────────┘│
│                            │                            │
└────────────────────────────┼────────────────────────────┘
                             │ HTTPS
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         OpenAI API    Claude API    Other LLM APIs
```

### 2.2 Component Design

```
App
├── AppLayout (antd Layout: Header + Content)
│   ├── HeaderBar
│   │   ├── Logo + Title
│   │   ├── Navigation (Playground / Library)
│   │   ├── Settings Button (⚙️ 齿轮图标 → 打开 SettingsModal)
│   │   └── AI Chat Toggle Button
│   │
│   ├── PlaygroundPage
│   │   ├── ThemePresetBar (主题预设图标行)
│   │   ├── TabSwitcher (Components / Dashboard)
│   │   ├── ComponentsPreview
│   │   │   ├── FormWidgets (Input, Select, DatePicker, ColorPicker...)
│   │   │   ├── DataDisplay (Card, Avatar, Tag, Steps, Progress...)
│   │   │   ├── Feedback (Alert, Notification, Modal, Message...)
│   │   │   ├── ActionWidgets (Button variants, Switch, Checkbox, Radio...)
│   │   │   └── AuthCard (Login/Signup 示例卡片)
│   │   ├── DashboardPreview
│   │   │   ├── SiderMenu
│   │   │   ├── StatsCards
│   │   │   ├── ChartsArea
│   │   │   └── DataTable
│   │   └── ThemeEditorSidebar (左侧/底部 Token 编辑器)
│   │       ├── GlobalTokenEditor
│   │       │   ├── ColorSection (Primary, Success, Warning, Error, Info)
│   │       │   ├── SizeSection (BorderRadius, FontSize, Spacing)
│   │       │   └── EffectSection (Shadow, LineWidth)
│   │       └── ComponentTokenEditor
│   │           ├── ComponentSelector (下拉选组件)
│   │           └── TokenForm (该组件可编辑的 Token 列表)
│   │
│   ├── LibraryPage
│   │   ├── ThemeGrid (主题卡片网格)
│   │   │   └── ThemeCard (预览缩略图 + 名称 + 操作)
│   │   ├── ImportDialog
│   │   └── ShareDialog
│   │
│   ├── SettingsModal (antd Modal，Header 齿轮按钮触发)
│   │   ├── LLMProviderConfig
│   │   │   ├── ProviderSelector (OpenAI/Claude/Gemini/DeepSeek/Qwen/OpenRouter/Custom)
│   │   │   ├── BaseURLInput (选择 Provider 后自动填充默认值)
│   │   │   ├── APIKeyInput (type=password + 可见切换)
│   │   │   ├── ModelSelector (根据 Provider 动态列出可选模型)
│   │   │   └── TestConnectionButton (验证 API Key 可用)
│   │   └── ExportSettings
│   │
│   └── AIDrawer (右侧抽屉)
│       ├── ChatHistory (消息列表)
│       ├── MessageBubble (用户/AI 消息)
│       ├── ThemePreviewInline (AI 生成的 Token 实时预览)
│       ├── ChatInput (输入框 + 发送按钮)
│       └── ApplyButton (将 AI 生成的 Theme 应用到 Playground)
│
└── ConfigProviderWrapper (动态包裹整个预览区)
```

### 2.3 Module Interactions

```
用户输入 Prompt
      │
      ▼
  AIDrawer ──→ LLMClient.chat(prompt, currentTheme)
      │                    │
      │                    ▼
      │            LLM API (OpenAI/Claude/...)
      │                    │
      │                    ▼
      │         解析返回的 ThemeConfig JSON
      │                    │
      ▼                    ▼
  ChatHistory ←── AI 消息 + ThemeConfig
      │
      ▼
  用户点击 "Apply"
      │
      ▼
  ThemeStore.setTheme(newTheme)
      │
      ├──→ ConfigProviderWrapper 重新渲染
      │         └──→ 所有 Preview 组件实时刷新
      │
      ├──→ VersionStore.addVersion(newTheme)
      │         └──→ LocalStorage 持久化
      │
      └──→ ThemeEditorSidebar 同步更新 Token 值
```

### 2.4 File Structure

```
src/
├── main.tsx                          [NEW] 应用入口
├── App.tsx                           [NEW] 路由 + 全局 Layout
├── vite-env.d.ts                     [NEW]
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx             [NEW] 主布局 (Header + Content)
│   │   └── HeaderBar.tsx             [NEW] 顶部导航栏
│   │
│   ├── playground/
│   │   ├── PlaygroundPage.tsx        [NEW] Playground 页面容器
│   │   ├── ThemePresetBar.tsx        [NEW] 主题预设图标行
│   │   ├── TabSwitcher.tsx           [NEW] Components/Dashboard 切换
│   │   ├── ComponentsPreview.tsx     [NEW] 组件预览区（复刻官方布局）
│   │   ├── DashboardPreview.tsx      [NEW] Dashboard 预览区
│   │   ├── previews/
│   │   │   ├── FormWidgets.tsx       [NEW] 表单类组件预览
│   │   │   ├── DataDisplay.tsx       [NEW] 数据展示类组件预览
│   │   │   ├── FeedbackWidgets.tsx   [NEW] 反馈类组件预览
│   │   │   ├── ActionWidgets.tsx     [NEW] 操作类组件预览
│   │   │   └── AuthCard.tsx          [NEW] 登录/注册示例卡片
│   │   └── dashboard/
│   │       ├── SiderMenu.tsx         [NEW]
│   │       ├── StatsCards.tsx        [NEW]
│   │       └── DataTable.tsx         [NEW]
│   │
│   ├── editor/
│   │   ├── ThemeEditorSidebar.tsx    [NEW] Token 编辑器侧栏
│   │   ├── GlobalTokenEditor.tsx     [NEW] 全局 Token 编辑
│   │   ├── ComponentTokenEditor.tsx  [NEW] 组件级 Token 编辑
│   │   ├── ColorPicker.tsx           [NEW] 颜色选择器控件
│   │   ├── NumberInput.tsx           [NEW] 数值调节控件
│   │   └── ShadowEditor.tsx         [NEW] 阴影编辑控件
│   │
│   ├── ai/
│   │   ├── AIDrawer.tsx             [NEW] AI 对话抽屉面板
│   │   ├── ChatHistory.tsx          [NEW] 对话历史列表
│   │   ├── MessageBubble.tsx        [NEW] 消息气泡
│   │   ├── ChatInput.tsx            [NEW] 输入框 + 发送
│   │   └── ThemePreviewInline.tsx   [NEW] 内联主题预览（对话中）
│   │
│   ├── library/
│   │   ├── LibraryPage.tsx          [NEW] 主题库页面
│   │   ├── ThemeGrid.tsx            [NEW] 主题卡片网格
│   │   ├── ThemeCard.tsx            [NEW] 单个主题卡片
│   │   └── ShareDialog.tsx          [NEW] 分享对话框
│   │
│   ├── settings/
│   │   ├── SettingsModal.tsx        [NEW] 设置弹窗（Header 齿轮按钮触发）
│   │   ├── LLMProviderConfig.tsx    [NEW] LLM 配置表单
│   │   └── ExportSettings.tsx       [NEW] 导出配置
│   │
│   └── version/
│       ├── VersionPanel.tsx         [NEW] 版本管理面板
│       ├── VersionList.tsx          [NEW] 版本列表
│       └── DiffViewer.tsx           [NEW] Token Diff 对比
│
├── stores/
│   ├── themeStore.ts                [NEW] 主题状态（当前 ThemeConfig）
│   ├── versionStore.ts             [NEW] 版本管理状态
│   ├── libraryStore.ts             [NEW] 主题库状态
│   ├── chatStore.ts                [NEW] AI 对话状态
│   └── settingsStore.ts            [NEW] LLM 配置 + 应用设置
│
├── services/
│   ├── llm/
│   │   ├── LLMClient.ts            [NEW] LLM 调用统一接口
│   │   ├── providers/
│   │   │   ├── openai.ts           [NEW] OpenAI 适配器
│   │   │   ├── claude.ts           [NEW] Claude 适配器
│   │   │   ├── gemini.ts           [NEW] Gemini 适配器
│   │   │   ├── deepseek.ts         [NEW] DeepSeek 适配器
│   │   │   ├── qwen.ts            [NEW] Qwen 适配器
│   │   │   ├── openrouter.ts       [NEW] OpenRouter 适配器
│   │   │   └── custom.ts          [NEW] 自定义 API 适配器
│   │   └── prompts/
│   │       ├── systemPrompt.ts     [NEW] AI Theme Agent 系统提示词
│   │       └── tokenSchema.ts      [NEW] Token 结构定义（给 LLM 用）
│   │
│   ├── theme/
│   │   ├── tokenRegistry.ts        [NEW] Ant Design Token 完整注册表
│   │   ├── themeValidator.ts       [NEW] ThemeConfig 校验器
│   │   ├── themeExporter.ts        [NEW] 多格式导出器
│   │   ├── themeDiff.ts            [NEW] 主题 Diff 算法
│   │   └── presets/                [NEW] 内置预设主题（12 套，来源：官方主题.md）
│   │       ├── index.ts            [NEW] 预设注册表 + 导出
│   │       ├── default.ts          [NEW] #1 Default
│   │       ├── mui.ts              [NEW] #2 MUI (含 createStyles + wave)
│   │       ├── shadcn.ts           [NEW] #3 Shadcn (含 createStyles)
│   │       ├── bootstrap.ts        [NEW] #4 Bootstrap (含 createStyles)
│   │       ├── cartoon.ts          [NEW] #5 Cartoon (含 createStyles)
│   │       ├── dark.ts             [NEW] #6 Dark
│   │       ├── illustration.ts     [NEW] #7 Illustration (含 createStyles)
│   │       ├── glass.ts            [NEW] #8 Glass (含 createStyles)
│   │       ├── geek.ts             [NEW] #9 Geek (含 createStyles)
│   │       ├── lark.ts             [NEW] #10 Lark
│   │       ├── blossom.ts          [NEW] #11 Blossom
│   │       └── v4.ts               [NEW] #12 V4 (需 @ant-design/compatible)
│   │
│   ├── migration/
│   │   ├── projectScanner.ts       [NEW] 项目扫描器
│   │   ├── tokenExtractor.ts       [NEW] 硬编码颜色提取
│   │   └── migrationPlan.ts        [NEW] 迁移方案生成
│   │
│   └── storage/
│       └── localStorage.ts         [NEW] LocalStorage 封装（含序列化/大小检查）
│
├── types/
│   ├── theme.ts                    [NEW] ThemeConfig 类型定义
│   ├── llm.ts                      [NEW] LLM 相关类型
│   ├── version.ts                  [NEW] 版本类型
│   └── chat.ts                     [NEW] 对话消息类型
│
├── utils/
│   ├── color.ts                    [NEW] 颜色工具（hex/rgb/hsl 转换）
│   ├── token.ts                    [NEW] Token 工具函数
│   └── export.ts                   [NEW] 文件下载工具
│
├── hooks/
│   ├── useTheme.ts                 [NEW] 主题操作 Hook
│   ├── useAIChat.ts                [NEW] AI 对话 Hook
│   └── useLLM.ts                   [NEW] LLM 调用 Hook
│
└── assets/
    ├── preset-thumbnails/          [NEW] 预设主题缩略图
    └── icons/                      [NEW] 自定义图标

public/
├── index.html                      [NEW]
└── favicon.svg                     [NEW]

package.json                        [NEW]
tsconfig.json                       [NEW]
vite.config.ts                      [NEW]
vercel.json                         [NEW] SPA rewrites 配置
.eslintrc.cjs                       [NEW]
```

---

## 3. Data Model

### 3.1 核心类型定义

```typescript
// types/theme.ts

import type { ThemeConfig } from 'antd';

/** 扩展的主题配置，包含元信息 */
interface ThemeRecord {
  id: string;                    // nanoid 生成
  name: string;                  // 主题名称
  description?: string;          // 描述
  themeConfig: ThemeConfig;      // antd 原生 ThemeConfig
  algorithm?: 'default' | 'dark' | 'compact'; // 主题算法
  createdAt: number;             // 时间戳
  updatedAt: number;
  tags?: string[];               // 标签
  thumbnail?: string;            // Base64 缩略图（可选）
}

/** 预设主题 */
interface ThemePreset {
  id: string;
  name: string;
  icon: string;                  // 图标组件名或 emoji
  themeConfig: ThemeConfig;
  builtIn: true;
}
```

```typescript
// types/version.ts

interface ThemeVersion {
  id: string;
  themeId: string;               // 关联的 ThemeRecord.id
  version: number;               // 版本号 v1, v2, v3...
  themeConfig: ThemeConfig;
  message?: string;              // 版本说明
  createdAt: number;
  parentVersionId?: string;      // 上一个版本
}

interface ThemeDiff {
  path: string;                  // e.g. "token.colorPrimary"
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'changed';
}
```

```typescript
// types/llm.ts

type LLMProvider = 'openai' | 'claude' | 'gemini' | 'deepseek' | 'qwen' | 'openrouter' | 'custom';

interface LLMConfig {
  provider: LLMProvider;
  baseURL: string;
  apiKey: string;                // 仅存 LocalStorage，不上传
  model: string;
  temperature?: number;          // 默认 0.7
  maxTokens?: number;            // 默认 4096
}

/** Provider 默认配置 */
const PROVIDER_DEFAULTS: Record<LLMProvider, { baseURL: string; models: string[] }> = {
  openai:     { baseURL: 'https://api.openai.com/v1',       models: ['gpt-4o', 'gpt-4o-mini'] },
  claude:     { baseURL: 'https://api.anthropic.com/v1',    models: ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001'] },
  gemini:     { baseURL: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.0-flash', 'gemini-2.5-pro'] },
  deepseek:   { baseURL: 'https://api.deepseek.com/v1',     models: ['deepseek-chat', 'deepseek-coder'] },
  qwen:       { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus'] },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1',    models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o'] },
  custom:     { baseURL: '',                                 models: [] },
};
```

```typescript
// types/chat.ts

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  themeConfig?: ThemeConfig;     // AI 生成的主题（附在 assistant 消息上）
  timestamp: number;
  status: 'sending' | 'streaming' | 'done' | 'error';
  error?: string;
}

interface ChatSession {
  id: string;
  themeId?: string;              // 关联的主题
  messages: ChatMessage[];
  createdAt: number;
}
```

### 3.2 LocalStorage Schema

| Key | Type | Description | Size Estimate |
|-----|------|-------------|---------------|
| `ts_current_theme` | `ThemeConfig` | 当前激活的主题配置 | ~5KB |
| `ts_themes` | `ThemeRecord[]` | 主题库 | ~50KB (10 themes) |
| `ts_versions_{themeId}` | `ThemeVersion[]` | 某主题的版本历史 | ~20KB/theme |
| `ts_llm_config` | `LLMConfig` | LLM 配置（含加密的 API Key） | ~1KB |
| `ts_chat_sessions` | `ChatSession[]` | 对话历史 | ~100KB |
| `ts_presets` | `ThemePreset[]` | 用户自定义预设 | ~30KB |
| `ts_settings` | `AppSettings` | 应用设置 | ~1KB |

API Key 存储：使用 `btoa()` 简单编码存储（非加密，但避免明文展示）。界面上 API Key 输入框使用 `type="password"`，显示时 mask 为 `sk-****xxxx`。

### 3.3 Storage 封装

```typescript
// services/storage/localStorage.ts

const STORAGE_PREFIX = 'ts_';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB LocalStorage 限制

interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  getUsage(): { used: number; total: number; percent: number };
  clear(): void;
}
```

---

## 4. API Design

### 4.1 LLM Client 统一接口

所有 LLM 调用通过统一的 `LLMClient` 抽象，屏蔽各 Provider 差异。

```typescript
// services/llm/LLMClient.ts

interface LLMClient {
  /** 发送对话消息，返回流式响应 */
  chat(params: ChatParams): AsyncGenerator<ChatChunk>;
  
  /** 测试连接 */
  testConnection(): Promise<{ ok: boolean; error?: string; model?: string }>;
}

interface ChatParams {
  messages: Array<{ role: MessageRole; content: string }>;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatChunk {
  type: 'text' | 'theme_config' | 'done' | 'error';
  content?: string;
  themeConfig?: ThemeConfig;
  error?: string;
}
```

### 4.2 Provider 适配器

每个 Provider 实现 `LLMClient` 接口，核心区别在于：

| Provider | API 格式 | Auth Header | 流式协议 |
|----------|---------|-------------|---------|
| OpenAI / DeepSeek / Qwen / OpenRouter | OpenAI-compatible | `Authorization: Bearer {key}` | SSE `data: {...}` |
| Claude | Messages API | `x-api-key: {key}` + `anthropic-version` | SSE `event: content_block_delta` |
| Gemini | generateContent | URL param `?key={key}` | SSE |
| Custom | OpenAI-compatible (默认) | `Authorization: Bearer {key}` | SSE |

OpenAI-compatible 的 Provider（OpenAI、DeepSeek、Qwen、OpenRouter、Custom）共用一个适配器，仅 baseURL 和 model 不同。

### 4.3 AI System Prompt 设计

```typescript
// services/llm/prompts/systemPrompt.ts

const SYSTEM_PROMPT = `
你是 Ant Design Theme Studio 的 AI 主题设计师。你的任务是根据用户的描述，
生成或修改 Ant Design 5.x 的 ThemeConfig 配置。

## 规则
1. 只生成合法的 Ant Design Design Token，不要编造不存在的 Token
2. 输出必须是合法的 JSON，包裹在 \`\`\`json 代码块中
3. 结构必须符合 antd ThemeConfig 类型（token + components + algorithm）
4. 颜色值使用 hex 格式（#RRGGBB）
5. 确保颜色对比度满足 WCAG AA 标准（4.5:1 正文，3:1 大文本）
6. 当用户说"修改"时，只返回需要变更的部分，用 deep merge 合并

## 当前主题
\${currentThemeJSON}

## 可用的 Global Token
colorPrimary, colorSuccess, colorWarning, colorError, colorInfo,
colorTextBase, colorBgBase, borderRadius, fontSize, ...

## 可用的 Component Token
Button: { colorPrimary, borderRadius, fontWeight, ... }
Input: { activeShadow, hoverBorderColor, ... }
...（完整列表见 tokenRegistry）

## 输出格式
回复时先用自然语言解释你的设计理念，然后在 \`\`\`json 块中给出 ThemeConfig：

\`\`\`json
{
  "token": { ... },
  "components": { ... },
  "algorithm": "default" | "dark" | "compact"
}
\`\`\`
`;
```

### 4.4 ThemeConfig JSON 解析

AI 返回的文本中提取 JSON 的策略：

1. 正则匹配 `` ```json ... ``` `` 代码块
2. 尝试 `JSON.parse`
3. 通过 `themeValidator` 校验 Token 合法性
4. 不合法的 Token 自动剥离 + 警告用户
5. 与当前主题 deep merge

```typescript
function extractThemeFromResponse(text: string): {
  themeConfig: ThemeConfig | null;
  explanation: string;
  warnings: string[];
};
```

---

## 5. Business Logic

### 5.1 Theme Preview Engine

核心：将 `ThemeConfig` 传入 `ConfigProvider`，包裹预览组件区域。

```
ThemeStore.currentTheme (Zustand)
      │
      ▼
<ConfigProvider theme={currentTheme}>
  <PlaygroundPreview />
</ConfigProvider>
```

Token 修改 → Zustand 更新 → React 重渲染 → ConfigProvider 传播新 Token → 所有子组件自动刷新。无需手动 forceUpdate。

预览区组件列表（严格复刻官方参考图 `assets/官网参考图.png`）：

**Components Tab — 三列布局：**

左列（表单/数据录入类）：
- Input（placeholder: antd@email.com）
- Select Tags（Apple × Banana ×）
- ColorPicker（#1677FF）+ Dropdown + DatePicker
- Checkbox（Apple ✓, Pear）+ Radio（Apple ●, Pear）+ Switch + Spin
- Steps（Finished → In Process → 3 Waiting）
- Progress（蓝色 50%）+ Progress（红色 error）
- Badge 状态点（Success / Error / Default / Processing / Warning）
- QRCode + Spin + Rate（3星）
- Tags（Twitter / Youtube / Facebook）
- Popconfirm（"Are you OK?" 取消/确定）
- Segmented（1D / 7D / 1M / 1Y / All）
- Segmented（Chats / Emails）

中列（数据展示/反馈类）：
- Avatar Group（多头像 +5）
- Verify Account Card（OTP 输入框 4 3 2 0 + Resend）
- Button Variants（Primary button / Danger button / Outlined button / Round button）
- Social Profile Card（Ant Design @ant-design + 头像 + 描述）
- Alert（Ant Design 成功提示 + 关闭按钮）

右列（业务场景卡片）：
- Create Account Card（头像 + 标题 + 副标题 + "Get Started" 主按钮 + OR 分割线 + "Continue with Google" + "Continue with Apple"）
- Notification Card（Ant Design 标题 + CSS-in-JS 描述 + 取消/确定 按钮）

**顶部：**
- Tab 切换（Components / Dashboard）
- 主题预设图标行（约 15 个图标，对应不同设计风格，参考图右上方）
- "AI 主题生成" 按钮（参考图右上角，我们改为 ⚙️ Settings + 💬 AI Chat 两个按钮）

**Dashboard Tab:**
- Layout: Sider + Header + Content
- Sider: Logo + Menu (vertical)
- Content: Stats Cards Row + Chart Area + Data Table

### 5.2 Theme Editor 逻辑

**Global Token 编辑器：**

| Token 分类 | Token 列表 | 控件类型 |
|-----------|-----------|---------|
| 品牌色 | colorPrimary, colorSuccess, colorWarning, colorError, colorInfo | ColorPicker |
| 文字色 | colorTextBase, colorText, colorTextSecondary, colorTextTertiary | ColorPicker |
| 背景色 | colorBgBase, colorBgContainer, colorBgElevated, colorBgLayout | ColorPicker |
| 边框色 | colorBorder, colorBorderSecondary | ColorPicker |
| 圆角 | borderRadius, borderRadiusXS, borderRadiusSM, borderRadiusLG | Slider + NumberInput |
| 字号 | fontSize, fontSizeSM, fontSizeLG, fontSizeXL | Slider + NumberInput |
| 间距 | padding, paddingSM, paddingLG, margin, marginSM, marginLG | Slider + NumberInput |
| 阴影 | boxShadow, boxShadowSecondary | ShadowEditor |
| 线宽 | lineWidth, lineWidthBold | Slider |

**Component Token 编辑器：**

选择组件 → 显示该组件的可编辑 Token → 修改后只影响该组件。

```typescript
// 编辑流程
onTokenChange(path: string, value: any) {
  // path 例如 "token.colorPrimary" 或 "components.Button.borderRadius"
  themeStore.updateToken(path, value);
  // Zustand 自动触发重渲染
  // 同时写入 LocalStorage 防止丢失
}
```

### 5.3 AI 对话流程

**前置条件：用户必须先在 Settings 中配置 LLM Provider。**

未配置时：AI Drawer 打开后显示引导提示卡片：
```
┌─────────────────────────────────┐
│  ⚙️  请先配置 AI 模型           │
│                                 │
│  点击右上角 Settings 按钮，     │
│  填入你的 API Key 即可开始      │
│  AI 主题生成。                  │
│                                 │
│  [打开设置]                     │
└─────────────────────────────────┘
```

已配置后的正常流程：

```
用户输入 "帮我生成一个苹果风格的主题"
      │
      ▼
  ChatInput.onSend()
      │
      ├── chatStore.addMessage({ role: 'user', content: '...' })
      │
      ▼
  useLLM.sendMessage()
      │
      ├── 拼接 systemPrompt + currentTheme + 历史对话 + 用户消息
      │
      ▼
  LLMClient.chat() ──→ 流式响应
      │
      ├── 逐 token 更新 AI 消息内容（streaming 效果）
      │
      ▼
  响应完成 → extractThemeFromResponse()
      │
      ├── 解析出 ThemeConfig
      ├── themeValidator.validate() → warnings
      │
      ▼
  chatStore.updateMessage({ themeConfig, status: 'done' })
      │
      ▼
  显示 "Apply" 按钮（内联预览对比）
      │
      ▼
  用户点击 "Apply"
      │
      ├── themeStore.setTheme(newTheme)
      ├── versionStore.addVersion()
      └── 预览区实时刷新
```

### 5.4 Theme Library 操作

| 操作 | 说明 |
|------|------|
| Save | 将当前 ThemeConfig 保存为 ThemeRecord，存入 `ts_themes` |
| Load | 从库中选择主题，设为 currentTheme |
| Copy | 复制一份 ThemeRecord，名称加 "(Copy)" |
| Delete | 从 `ts_themes` 中删除，同时删除对应 versions |
| Share | 将 ThemeConfig 序列化为 JSON 字符串 → 复制到剪贴板 |
| Import | 粘贴 JSON 字符串 → 解析 + 校验 → 加入库 |

内置预设主题（builtIn，不可删除）：

数据来源：[官方主题.md](../docs/官方主题.md)（已从 Ant Design 官网手动复制完整 ConfigProvider 配置，共 12 套）

| # | Preset | 主色 | 算法 | 复杂度 | 说明 |
|---|--------|------|------|--------|------|
| 1 | Default | `#1677FF` | default | 简单 | Ant Design 5.x 官方默认 |
| 2 | MUI | `#1976d2` | default | 复杂 | Material UI 风格：Material Shadow、Ripple Wave、uppercase Button |
| 3 | Shadcn | `#262626` | default | 复杂 | shadcn/ui 风格：黑白系、大圆角、无阴影 Button |
| 4 | Bootstrap | `#1677FF` | default | 复杂 | Bootstrap 经典：渐变 Button、inset 阴影、高亮下拉菜单 |
| 5 | Cartoon | `#225555` | default | 中等 | 卡通手绘：墨绿粗线框、大圆角 18、米黄底色 |
| 6 | Dark | `#1677FF` | dark | 简单 | 官方暗色主题 |
| 7 | Illustration | `#52C41A` | default | 复杂 | 插画描边：粗描边 3px、4px 偏移阴影、暖底色 |
| 8 | Glass | `#1677FF` | default | 复杂 | 毛玻璃：backdrop-filter blur、半透明、inset 高光 |
| 9 | Geek | `#39ff14` | dark | 复杂 | 极客终端：荧光绿、零圆角、霓虹发光边框 |
| 10 | Lark | `#00B96B` | default | 简单 | 知识协作（飞书风）：绿色、小圆角、清爽白底 |
| 11 | Blossom | `#ED4192` | default | 简单 | 桃花缘：桃粉、大圆角 16、淡粉底色 |
| 12 | V4 | `#1890ff` | default+v4 | 简单 | Ant Design v4 兼容（需 @ant-design/compatible） |

每个预设包含完整的 `ConfigProviderProps`：`theme`（token + components + algorithm）、`wave`、`button/input/select/notification` 的 `classNames` 覆写等。复杂度标记为"复杂"的预设还包含自定义 `createStyles` 样式（如 MUI 的 Ripple Wave、Bootstrap 的渐变按钮、Glass 的 backdrop-filter）。

### 5.5 Version Management

```typescript
// 版本操作
interface VersionActions {
  /** 创建新版本（自动递增版本号） */
  createVersion(themeId: string, config: ThemeConfig, message?: string): ThemeVersion;
  
  /** 获取版本列表 */
  getVersions(themeId: string): ThemeVersion[];
  
  /** 对比两个版本 */
  diff(v1: ThemeVersion, v2: ThemeVersion): ThemeDiff[];
  
  /** 回滚到指定版本 */
  rollback(versionId: string): ThemeConfig;
}
```

Diff 算法：深度遍历两个 ThemeConfig 对象，逐 key 对比，输出变更列表。使用颜色高亮展示 added（绿）、removed（红）、changed（黄）。

### 5.6 Export 逻辑

```typescript
// services/theme/themeExporter.ts

type ExportFormat = 'theme.ts' | 'theme.json' | 'design-token.json' | 'tailwind.config.ts' | 'css-variables';

function exportTheme(config: ThemeConfig, format: ExportFormat): string {
  switch (format) {
    case 'theme.ts':
      // 生成 TypeScript 文件，包含 ConfigProvider 使用方式
      return generateThemeTS(config);
    case 'theme.json':
      // 纯 JSON 格式
      return JSON.stringify(config, null, 2);
    case 'design-token.json':
      // 扁平化 Token 列表（兼容 Style Dictionary）
      return generateDesignTokenJSON(config);
    case 'tailwind.config.ts':
      // 将 Token 映射到 Tailwind 的 extend 配置
      return generateTailwindConfig(config);
    case 'css-variables':
      // 生成 CSS 自定义属性
      return generateCSSVariables(config);
  }
}
```

**theme.ts 输出示例：**
```typescript
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#007AFF',
    borderRadius: 8,
    // ...
  },
  components: {
    Button: { borderRadius: 8 },
    // ...
  },
};

export default theme;
```

### 5.7 CLI Integration

通过 AI Agent 间接调用 Ant Design CLI 能力：

1. 在 systemPrompt 中嵌入完整的 Ant Design Token 注册表（`tokenRegistry.ts`）
2. AI 生成主题时受限于注册表中的合法 Token
3. 导出时生成的代码可直接被 `antd-cli` 识别

Token 注册表来源：从 antd 源码的 `components/*/style/index.ts` 中提取全部合法 Component Token，静态写入 `tokenRegistry.ts`。

### 5.8 MCP Integration

MVP 阶段通过以下方式模拟 MCP 集成：

1. `tokenRegistry.ts` 中硬编码所有官方 Token（Global + Component）
2. AI System Prompt 中注入 Token 注册表
3. `themeValidator.ts` 中校验生成的 Token 是否在注册表内

未来可接入真正的 Ant Design MCP Server：
```typescript
// 未来扩展点
interface MCPClient {
  queryComponentTokens(component: string): Promise<TokenDefinition[]>;
  queryGlobalTokens(): Promise<TokenDefinition[]>;
  getComponentDemo(component: string): Promise<string>;
}
```

### 5.9 Project Migration

```
用户上传/粘贴项目文件
      │
      ▼
projectScanner.scan(files)
      │
      ├── 查找所有 ConfigProvider 使用
      ├── 查找所有硬编码颜色值 (#xxx, rgb(), rgba())
      ├── 查找所有内联 style 中的 token 等价值
      │
      ▼
tokenExtractor.extract(scanResult)
      │
      ├── 硬编码颜色 → 最近似 Ant Design Token 映射
      ├── 现有 ConfigProvider → 提取 theme prop
      │
      ▼
migrationPlan.generate(extracted)
      │
      ├── 统一 theme.ts 文件
      ├── 替换建议列表（文件:行号 → 建议 Token）
      ├── Diff 预览
      │
      ▼
用户确认 → 导出 theme.ts + 替换指引
```

MVP 限制：仅支持用户粘贴代码片段进行分析，不做真正的文件系统扫描（纯前端应用）。

### 5.10 Edge Cases

| 场景 | 处理 |
|------|------|
| LLM 返回非法 JSON | 提示用户 "AI 输出格式异常，请重试"，保留原始响应文本供查看 |
| LLM 返回不存在的 Token | `themeValidator` 剥离非法 Token + 警告列表 |
| LLM API 超时 | 30s 超时 → 提示 "连接超时，请检查网络或 API 配置" |
| LLM API Key 无效 | testConnection 时报错 → 提示 "API Key 无效" |
| CORS 被阻止 | 提示用户：(1) 使用支持 CORS 的 API 端点 (2) 使用浏览器插件 (3) 配置代理 |
| LocalStorage 满 | `getUsage()` 检测 → 提示用户清理旧版本/对话 |
| 主题 JSON 过大 | 单主题超过 100KB 时警告 |
| 多 Tab 同时编辑 | 使用 `storage` event 监听跨 Tab 同步 |

---

## 6. Error Handling

### 6.1 Error Taxonomy

| Error Code | 场景 | 用户提示 |
|------------|------|---------|
| LLM_AUTH_FAILED | API Key 无效或过期 | "API Key 验证失败，请检查配置" |
| LLM_RATE_LIMIT | 请求频率超限 | "请求过于频繁，请稍后再试" |
| LLM_TIMEOUT | 30s 无响应 | "AI 响应超时，请重试" |
| LLM_PARSE_ERROR | AI 返回内容无法解析为 ThemeConfig | "AI 输出格式异常，已保留原始回复" |
| THEME_INVALID_TOKEN | 生成的 Token 不在注册表中 | "已移除 X 个无效 Token: [list]" |
| STORAGE_FULL | LocalStorage 5MB 已满 | "存储空间不足，请清理旧主题或对话记录" |
| STORAGE_CORRUPT | JSON 解析失败 | "数据读取异常，已重置为默认值" |
| EXPORT_FAILED | 导出生成失败 | "导出失败: [detail]" |
| CORS_BLOCKED | 跨域请求被阻止 | "API 请求被浏览器安全策略阻止，请参考帮助文档" |

### 6.2 Retry Strategy

| 操作 | 可重试 | 策略 |
|------|--------|------|
| LLM chat | 是 | 最多 2 次，间隔 2s/5s |
| LLM testConnection | 是 | 最多 3 次，间隔 1s |
| LocalStorage write | 否 | 立即报错 |
| Theme export | 否 | 立即报错 |

### 6.3 Failure Modes

| 依赖 | 失败时 |
|------|--------|
| LLM API 不可用 | AI 功能不可用，手动编辑仍然正常 |
| LocalStorage 不可用 | 使用内存态，退出丢失，提示用户 |
| antd 版本不兼容 | 锁定 antd 5.x 版本，package.json 限制范围 |

---

## 7. Security

### 7.1 API Key 保护

- API Key 仅存储在用户本地 LocalStorage，不上传任何服务器
- 输入框使用 `type="password"`
- 显示时 mask 为 `sk-****xxxx`（最后 4 位可见）
- LLM 请求直接从浏览器发出（无中间服务器）
- 页面不包含任何第三方分析/追踪脚本

### 7.2 Input Validation

- 用户 Prompt：限制 4000 字符，去除 HTML 标签
- Theme JSON Import：严格 JSON.parse + schema 校验
- Token 值校验：颜色值 hex 格式校验、数值范围校验
- XSS 防护：所有动态内容通过 React JSX 渲染（自动转义）

### 7.3 CORS 处理

浏览器直连 LLM API 的 CORS 策略：

| Provider | CORS 支持 |
|----------|----------|
| OpenAI | 部分支持（需 dangerouslyAllowBrowser） |
| Claude | 不支持浏览器直连 |
| DeepSeek | 支持 |
| OpenRouter | 支持 |

对于不支持 CORS 的 Provider，提供两种方案：
1. 推荐用户使用支持 CORS 的 Provider（OpenRouter 可代理所有模型）
2. 提供简易 CORS Proxy 部署指南（Cloudflare Worker 一键部署）

---

## 8. Performance

### 8.1 Expected Load

纯前端 SPA，无服务端负载。关注点：

| 指标 | 目标 |
|------|------|
| 首屏加载 | < 2s（Vite code split + antd tree shake） |
| Token 修改 → 预览刷新 | < 50ms（React 重渲染） |
| AI 流式首字节 | < 2s（取决于 LLM Provider） |
| 主题切换 | < 100ms |
| 导出文件生成 | < 500ms |

### 8.2 Optimization Strategy

- **antd Tree Shaking**: Vite + antd 5.x 自动按需加载
- **组件懒加载**: Dashboard Preview、Library Page 使用 `React.lazy`
- **Token 编辑防抖**: ColorPicker / Slider 使用 300ms debounce
- **AI 流式渲染**: 使用 `ReadableStream` + `TextDecoder` 逐 token 渲染
- **LocalStorage 批量写入**: Token 编辑时合并多次修改，500ms 内只写一次

### 8.3 Bundle Size 预估

| 依赖 | 大小 (gzip) |
|------|------------|
| React + ReactDOM | ~45KB |
| antd (tree-shaken) | ~150KB |
| antd-style | ~15KB |
| zustand | ~2KB |
| react-router | ~12KB |
| nanoid | ~1KB |
| 业务代码 | ~80KB |
| **Total** | **~305KB** |

---

## 9. Testing Strategy

### 9.1 Unit Tests

| 模块 | 测试内容 | 框架 |
|------|---------|------|
| themeValidator | Token 合法性校验：合法 Token 通过、非法 Token 剥离 | Vitest |
| themeExporter | 各格式导出正确性：theme.ts/json/css-variables | Vitest |
| themeDiff | Diff 算法：added/removed/changed 检测 | Vitest |
| extractThemeFromResponse | AI 响应解析：正常 JSON、畸形 JSON、无 JSON | Vitest |
| localStorage service | 存取、序列化、大小检测 | Vitest |
| color utils | hex/rgb/hsl 互转 | Vitest |

### 9.2 Integration Tests

| 场景 | 测试内容 |
|------|---------|
| Theme Editor → Preview | 修改 colorPrimary → 预览区 Button 颜色变化 |
| AI Chat → Apply | 模拟 AI 返回 → Apply → 预览区刷新 |
| Save → Load | 保存主题 → 重新加载 → 主题一致 |
| Export → Import | 导出 JSON → 导入 → 主题一致 |
| Version → Rollback | 创建 v1 → 修改 → 创建 v2 → 回滚 v1 → 验证 |

测试框架：Vitest + React Testing Library

### 9.3 E2E Tests

| 场景 | 框架 |
|------|------|
| 完整流程：启动 → 选预设 → 编辑 Token → 导出 | Playwright |
| AI 对话流程（Mock LLM） | Playwright + MSW |
| 响应式布局验证 | Playwright viewport |

### 9.4 Acceptance Criteria Mapping

| PRD 模块 | 测试类型 | 验证内容 |
|----------|---------|---------|
| 5.1 Playground | Integration | 所有组件在 ConfigProvider 下正确渲染 |
| 5.2 Theme Editor | Integration | Token 修改实时生效 |
| 5.3 Component Token | Unit | 组件级 Token 独立生效、不影响其他组件 |
| 5.4 AI Generator | Integration | LLM 返回 → 解析 → 校验 → 应用 |
| 5.5 Theme Library | Integration | CRUD + 预设加载 |
| 5.6 Theme Version | Unit + Integration | Diff 正确性 + Rollback 完整性 |
| 5.7 Export | Unit | 各格式输出合法性 |
| 5.8 CLI Integration | Unit | Token 注册表完整性 |
| 5.9 MCP Integration | Unit | Token 校验覆盖率 |
| 5.10 Apply Theme | Integration | 导出代码可运行 |

---

## 10. Implementation Plan

### 10.1 Phases

```
Phase 1: Foundation (基础框架)
├── 项目初始化 (Vite + React + antd + TypeScript)
├── 路由 + 全局 Layout
├── Zustand stores 基础结构
├── LocalStorage 服务
└── 类型定义

Phase 2: Playground (核心预览)
├── ComponentsPreview（复刻官方布局）
├── DashboardPreview
├── ThemePresetBar（内置预设 + 切换）
├── ConfigProviderWrapper（动态主题）
└── Tab 切换（Components / Dashboard）

Phase 3: Theme Editor (主题编辑)
├── GlobalTokenEditor（颜色、圆角、字号、间距）
├── ComponentTokenEditor（组件级 Token）
├── 实时双向绑定（Editor ↔ Preview）
└── Token 注册表 (tokenRegistry.ts)

Phase 4: AI Integration (AI 对话)
├── LLM Client 统一接口
├── Provider 适配器（OpenAI-compatible + Claude + Gemini）
├── AI Drawer (Chat UI)
├── System Prompt + Token Schema
├── ThemeConfig 解析 + 校验
├── 流式渲染 + Apply 按钮
└── Settings Modal (LLM 配置弹窗)

Phase 5: Theme Library (主题库)
├── ThemeRecord CRUD
├── ThemeGrid 卡片展示
├── 缩略图生成
├── Import / Export JSON
└── Share（剪贴板复制）

Phase 6: Version & Export (版本 + 导出)
├── 版本管理（创建 / 列表 / Diff / Rollback）
├── DiffViewer 组件
├── 多格式导出（theme.ts / json / css-variables / tailwind）
└── 文件下载

Phase 7: Advanced Features (高级功能)
├── Project Migration（代码分析 + Token 映射）
├── CLI 集成文档
├── MCP 集成预留
└── 优化 + 测试
```

### 10.2 Issue Mapping

| Phase | SPEC Sections | Priority | Depends On | 估时 |
|-------|--------------|----------|------------|------|
| Phase 1: Foundation | 2.4, 3.1-3.3 | P0 | — | 2d |
| Phase 2: Playground | 5.1 | P0 | Phase 1 | 3d |
| Phase 3: Theme Editor | 5.2 | P0 | Phase 2 | 3d |
| Phase 4: AI Integration | 4.1-4.4, 5.3 | P0 | Phase 3 | 4d |
| Phase 5: Theme Library | 5.4 | P1 | Phase 3 | 2d |
| Phase 6: Version & Export | 5.5, 5.6 | P1 | Phase 5 | 3d |
| Phase 7: Advanced | 5.7-5.9 | P2 | Phase 4 | 3d |

**Total: ~20 工作日**

### 10.3 Incremental Delivery

- **Phase 1-3 完成后**：可作为纯手动 Theme Editor 使用（无 AI）
- **Phase 4 完成后**：核心价值交付 — AI 生成 + 预览 + 编辑
- **Phase 5-6 完成后**：完整产品体验
- **Phase 7**：差异化能力

### 10.4 Deployment (Vercel)

**构建配置：**

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**部署流程：**
1. `git push` 到 GitHub 仓库
2. Vercel 自动检测 Vite 项目，执行 `npm run build`
3. 输出 `dist/` 目录作为静态站点
4. 自动分配 `*.vercel.app` 域名 + HTTPS

**Vite 构建配置：**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

无需任何 Serverless Function — 纯静态站点，LLM API 由浏览器直连。

---

## 11. Open Questions & Risks

### 11.1 Unresolved Questions

| 问题 | 影响 | 建议 |
|------|------|------|
| CORS 限制如何解决？ | Claude API 不支持浏览器直连 | 推荐 OpenRouter 或提供 Cloudflare Worker Proxy 模板 |
| antd Token 注册表如何保持最新？ | antd 版本升级时 Token 可能变化 | 锁定 antd 版本 + 建立更新流程 |
| 是否需要 Dark Mode 支持？ | Theme Studio 本身的暗色主题 | Phase 1 预留 CSS Variable 支持，后续补充 |
| AI 生成的主题质量如何保证？ | 不同 LLM 输出质量差异大 | System Prompt 优化 + Few-shot examples + 校验兜底 |

### 11.2 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CORS 阻止浏览器直连 LLM | AI 核心功能不可用 | 1. 优先推荐 OpenRouter（CORS 友好）2. 提供 Proxy 方案 |
| LLM 返回非法 ThemeConfig | 预览异常/白屏 | themeValidator 严格校验 + 异常回退到上一个合法主题 |
| LocalStorage 5MB 限制 | 主题/版本过多时溢出 | 监控用量 + 提示清理 + 考虑 IndexedDB 升级路径 |
| antd ConfigProvider 性能 | 大量组件同时重渲染卡顿 | debounce Token 修改 + React.memo 优化预览组件 |
| 不同 LLM Provider API 差异 | 适配器维护成本 | OpenAI-compatible 统一大部分；Claude/Gemini 单独适配 |

### 11.3 Assumptions

- 用户自行获取 LLM Provider 的 API Key
- antd 5.x 的 ConfigProvider + Design Token 机制保持稳定
- 目标浏览器：Chrome/Edge 90+、Safari 15+、Firefox 90+
- 不需要用户登录/注册系统
- 不需要服务端存储或团队协作功能（MVP）
- LLM API 的 CORS 限制可通过 OpenRouter 或 Proxy 解决
