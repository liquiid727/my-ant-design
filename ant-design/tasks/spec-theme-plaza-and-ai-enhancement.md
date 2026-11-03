# SPEC: Theme Plaza & AI Enhancement

> Technical specification derived from: [tasks/prd-theme-plaza-and-ai-enhancement.md](prd-theme-plaza-and-ai-enhancement.md)
> Generated: 2026-07-14 | Target branch: main | Commit: 214af4d

## 1. Summary

### 1.1 What This SPEC Covers

This specification details how to implement three interconnected features for Ant Design Theme Studio: (1) a Theme Plaza for browsing and applying community-contributed themes fetched dynamically via GitHub API, (2) a community contribution system with a tiered JSON/TS format stored in the repository, and (3) an enhanced AI system prompt that injects Ant Design design language knowledge, current theme context, and few-shot examples in both Chinese and English.

### 1.2 PRD Reference

- Source: `tasks/prd-theme-plaza-and-ai-enhancement.md`
- User Stories covered: US-001 through US-012
- Functional Requirements covered: FR-1 through FR-13

### 1.3 Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme Plaza UI | Drawer（与 AI Drawer 并列） | 保持 SPA 单页结构一致，不引入新路由；与现有 Drawer 模式（AI Drawer）视觉统一 |
| Community store | 新增 `useCommunityStore` (Zustand) | 与现有 6 个 Zustand store 模式一致，职责单一 |
| GitHub API 调用 | 未认证 REST API + localStorage 缓存 | 无需 OAuth，60 次/小时足够（缓存 30min TTL，典型用户 1-2 次/小时） |
| 主题格式分级 | JSON 基础 + TS 高级（CI 编译 → GitHub Pages） | 降低基础贡献门槛至 JSON 文件；TS 主题通过 CI 预编译解决浏览器无法运行 TS 的问题 |
| System prompt 结构 | 分层构建：角色 → 设计语言 → token 约束 → 上下文 → few-shot → 输出格式 | 各层职责清晰，方便独立修改和测试 |
| 主题上下文注入 | 动态拼接到最后一条 user message 前 | 不膨胀 system prompt，确保 LLM 始终看到最新主题状态 |
| Prompt 国际化 | 构建函数接受 `locale` 参数 | 中英文分离维护，避免混合语言造成 LLM 混乱 |
| 仓库配置 | Hardcode 默认 + `VITE_COMMUNITY_REPO` 环境变量覆盖 | 主流开源做法（Obsidian/Homebrew），兼顾 fork/私有部署 |
| 主题 ID 格式 | `{name}-{4位随机后缀}` | 避免命名冲突，CI 查重兜底 |
| 预览图 | PNG 存仓库，800×500 px，≤200KB | 简单直接，无外部依赖 |

---

## 2. Architecture

### 2.1 System Context

```
┌───────────────────────────────────────────────────────┐
│                   Browser (SPA)                       │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────────┐ │
│  │ Plaza   │  │ AI       │  │ Playground / Editor   │ │
│  │ Drawer  │  │ Drawer   │  │ (existing)            │ │
│  └────┬────┘  └────┬─────┘  └───────────────────────┘ │
│       │            │                                   │
│  ┌────▼────┐  ┌────▼──────────────────┐               │
│  │Community│  │ LLMClient             │               │
│  │Store    │  │ + Enhanced Prompt      │               │
│  └────┬────┘  └────┬──────────────────┘               │
│       │            │                                   │
│  ┌────▼────────────▼──────────────────┐               │
│  │         StorageService             │               │
│  │    (localStorage cache layer)      │               │
│  └────────────┬───────────────────────┘               │
└───────────────┼───────────────────────────────────────┘
                │
        ┌───────▼────────┐     ┌──────────────────┐
        │ GitHub API     │     │ GitHub Pages      │
        │ Contents API   │     │ (compiled TS      │
        │ (JSON themes)  │     │  themes as JS)    │
        └────────────────┘     └──────────────────┘
```

### 2.2 Component Design

**New modules:**

| Module | Responsibility |
|--------|---------------|
| `src/services/community/communityThemeService.ts` | GitHub API 调用、响应解析、缓存管理、fallback 加载 |
| `src/services/community/types.ts` | 社区主题类型定义 |
| `src/stores/communityStore.ts` | 社区主题列表状态、加载/错误状态、筛选/搜索状态 |
| `src/components/plaza/PlazaDrawer.tsx` | 主题广场抽屉主组件 |
| `src/components/plaza/ThemeCard.tsx` | 单个主题卡片（预览图、名称、标签） |
| `src/components/plaza/ThemePreviewModal.tsx` | 主题预览弹窗（嵌入 ConfigProvider 预览 + diff） |
| `src/services/ai/designLanguage.ts` | Ant Design 设计语言知识模板（中英文） |
| `src/services/ai/fewShotExamples.ts` | Few-shot examples 定义（中英文） |
| `src/services/ai/themeContext.ts` | 当前主题上下文序列化 |
| `src/themes/community/` | 社区主题目录（JSON 文件 + 高级主题文件夹 + README） |

**Modified modules:**

| Module | Changes |
|--------|---------|
| `src/services/ai/systemPrompt.ts` | 重构 `buildSystemPrompt`，分层组装，接受 `locale` + `themeContext` 参数 |
| `src/services/ai/LLMClient.ts` | `request()` 方法注入当前主题上下文到消息列表 |
| `src/components/ai/AIDrawer.tsx` | 传递当前主题上下文给 LLMClient |
| `src/components/settings/SettingsModal.tsx` | 新增 AI Prompt Preview 折叠面板 + AI 语言偏好选项 |
| `src/stores/settingsStore.ts` | 扩展 `LLMConfig` 增加 `locale` 字段 |
| `src/stores/uiStore.ts` | 增加 `isPlazaDrawerOpen` / `openPlaza` / `closePlaza` 状态 |
| `src/components/layout/HeaderBar.tsx` | 增加 Plaza 入口按钮 |
| `src/themes/types.ts` | `ThemePresetDefinition.group` 增加 `'community'` |
| `src/types.ts` | 新增 `CommunityThemeMeta` / `CommunityThemeIndex` 类型 |
| `src/App.tsx` | 新增 lazy import PlazaDrawer |

### 2.3 Module Interactions

**社区主题加载流程:**

```
User opens Plaza Drawer
  → useCommunityStore.fetchThemes()
    → CommunityThemeService.fetchIndex()
      → Check localStorage cache (key: ts_community_themes, TTL: 30min)
        → Cache hit & fresh → return cached
        → Cache miss / stale → GitHub Contents API
          → Success → parse JSON → validate → cache → return
          → Failure (rate limit / network) → return cached (if any) or fallback snapshot
    → Store updates: themes[], loading, error
  → PlazaDrawer renders ThemeCard[] from store
```

**主题预览 & 应用流程:**

```
User clicks ThemeCard
  → ThemePreviewModal opens
    → Creates isolated ConfigProvider with theme's token/components
    → Renders preview components (reuse OfficialComponentsPreview)
    → Shows diffThemes(defaultTheme, communityTheme) as diff list
  → User clicks "Apply"
    → versionStore.createVersion(currentTheme.id, currentTheme, "Before applying community theme: {name}")
    → themeStore.setTheme(communityTheme.config)
    → Close modal → message.success
```

**AI 增强消息流:**

```
User types message in AI Drawer
  → Build context: serializeThemeContext(activePresetId, overrides, currentTheme)
  → LLMClient.chat({messages, themeContext})
    → LLMClient.request()
      → buildSystemPrompt({locale})          // 静态 system prompt（角色 + 设计语言 + token约束 + few-shot + 格式）
      → Inject themeContext as system suffix  // 动态主题上下文
      → [...messages.slice(-10)]             // 历史消息
```

### 2.4 File Structure

```
src/
├── services/
│   ├── community/
│   │   ├── communityThemeService.ts    [NEW]  GitHub API + cache + fallback
│   │   └── types.ts                   [NEW]  CommunityThemeMeta, CommunityThemeIndex
│   └── ai/
│       ├── systemPrompt.ts            [MODIFY] 分层重构，locale 参数
│       ├── designLanguage.ts          [NEW]  Ant Design 设计语言知识（中英文）
│       ├── fewShotExamples.ts         [NEW]  Few-shot examples（中英文）
│       ├── themeContext.ts            [NEW]  主题上下文序列化
│       ├── LLMClient.ts              [MODIFY] 注入 themeContext
│       └── responseParser.ts          [NO CHANGE]
├── stores/
│   ├── communityStore.ts              [NEW]  社区主题状态管理
│   ├── settingsStore.ts               [MODIFY] 增加 locale 字段
│   └── uiStore.ts                     [MODIFY] 增加 Plaza drawer 状态
├── components/
│   ├── plaza/
│   │   ├── PlazaDrawer.tsx            [NEW]  主题广场抽屉
│   │   ├── ThemeCard.tsx              [NEW]  主题卡片组件
│   │   └── ThemePreviewModal.tsx      [NEW]  主题预览弹窗
│   ├── settings/
│   │   └── SettingsModal.tsx          [MODIFY] 增加 Prompt Preview + locale 设置
│   ├── ai/
│   │   └── AIDrawer.tsx               [MODIFY] 传递 themeContext
│   └── layout/
│       └── HeaderBar.tsx              [MODIFY] 增加 Plaza 入口
├── themes/
│   ├── types.ts                       [MODIFY] group 增加 'community'
│   ├── community/
│   │   ├── README.md                  [NEW]  贡献指南
│   │   ├── community-theme.schema.json[NEW]  JSON Schema
│   │   └── (community theme files)    [NEW]  示例主题
│   └── community-snapshot.json        [NEW]  构建时生成的兜底快照
├── types.ts                           [MODIFY] 新增类型
└── App.tsx                            [MODIFY] lazy import PlazaDrawer

.github/
├── PULL_REQUEST_TEMPLATE/
│   └── community-theme.md             [NEW]  PR 模板
└── workflows/
    └── compile-community-themes.yml   [NEW]  TS 主题编译 CI
```

---

## 3. Data Model

### 3.1 New Type Definitions

```typescript
// src/services/community/types.ts

export type CommunityThemeMeta = {
  id: string;                          // e.g. "ocean-blue-a3x9"
  name: string;                        // 展示名
  author: string;                      // GitHub 用户名
  description: string;                 // 简短描述
  tags: string[];                      // 筛选标签
  preview: string;                     // 预览图文件名 (PNG)
  format: 'json' | 'advanced';        // 主题格式级别
  config: {                            // 基础主题的完整配置
    algorithm: ThemeAlgorithmName;
    token: Record<string, unknown>;
    components: Record<string, Record<string, unknown>>;
  };
};

export type CommunityThemeIndex = {
  themes: CommunityThemeMeta[];
  fetchedAt: number;                   // Date.now() timestamp
  source: 'api' | 'cache' | 'fallback';
};

export type CommunityStoreState = {
  index: CommunityThemeIndex | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
  fetchThemes: (force?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  filteredThemes: () => CommunityThemeMeta[];
};
```

### 3.2 Type Extensions

```typescript
// src/themes/types.ts — extend group
export type ThemePresetDefinition = {
  // ... existing fields
  group: 'official' | 'custom' | 'community';  // ADD 'community'
};

// src/types.ts — extend LLMConfig
export type LLMConfig = {
  provider: LLMProvider;
  baseURL: string;
  apiKey: string;
  model: string;
  locale: 'zh-CN' | 'en-US';          // ADD: AI prompt 语言
};

// src/stores/uiStore.ts — extend UIState
type UIState = {
  // ... existing
  isPlazaDrawerOpen: boolean;          // ADD
  openPlaza: () => void;               // ADD
  closePlaza: () => void;              // ADD
};
```

### 3.3 Storage Schema

| Key | Type | TTL | Description |
|-----|------|-----|-------------|
| `ts_community_themes` | `CommunityThemeIndex` | 30 min | 社区主题索引缓存 |
| `ts_settings_llm` | `LLMConfig` (updated) | ∞ | 增加 `locale` 字段 |

Backward compatibility: existing `ts_settings_llm` entries without `locale` fallback to auto-detect via `navigator.language`.

### 3.4 Community Theme JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "author", "description", "tags", "config"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{4}$",
      "description": "Unique ID: {theme-name}-{4-char-suffix}"
    },
    "name": { "type": "string", "minLength": 2, "maxLength": 40 },
    "author": { "type": "string", "pattern": "^[a-zA-Z0-9-]+$" },
    "description": { "type": "string", "maxLength": 200 },
    "tags": {
      "type": "array",
      "items": { "type": "string", "maxLength": 20 },
      "minItems": 1,
      "maxItems": 6
    },
    "preview": { "type": "string", "pattern": "\\.png$" },
    "config": {
      "type": "object",
      "required": ["algorithm", "token"],
      "properties": {
        "algorithm": { "enum": ["default", "dark", "compact", "darkCompact"] },
        "token": { "type": "object" },
        "components": { "type": "object" }
      }
    }
  },
  "additionalProperties": false
}
```

---

## 4. API Design

### 4.1 GitHub Contents API Usage

No custom backend API — all calls are to GitHub's public REST API.

| Operation | Method | URL | Description |
|-----------|--------|-----|-------------|
| List community dir | GET | `https://api.github.com/repos/{owner}/{repo}/contents/src/themes/community` | 获取目录下的文件列表 |
| Read JSON file | GET | `https://api.github.com/repos/{owner}/{repo}/contents/src/themes/community/{filename}` | 获取单个主题文件（base64 content） |
| Read preview image | GET | `https://raw.githubusercontent.com/{owner}/{repo}/main/src/themes/community/{filename}` | 直接获取原始 PNG 文件 |

### 4.2 CommunityThemeService API

```typescript
// src/services/community/communityThemeService.ts

export const CommunityThemeService = {
  /**
   * 获取社区主题索引。优先使用缓存，过期后请求 GitHub API。
   * @param force - 跳过缓存强制刷新
   */
  async fetchIndex(force?: boolean): Promise<CommunityThemeIndex>;

  /**
   * 获取主题预览图的完整 URL
   */
  getPreviewUrl(filename: string): string;

  /**
   * 加载高级主题的预编译 JS 模块（从 GitHub Pages）
   */
  async loadAdvancedTheme(themeId: string): Promise<ThemeRuntimeComponent>;
};
```

### 4.3 Internal Implementation

```typescript
const REPO_CONFIG = {
  owner: import.meta.env.VITE_COMMUNITY_REPO_OWNER || 'default-owner',
  repo: import.meta.env.VITE_COMMUNITY_REPO_NAME || 'theme',
  branch: 'main',
};

const CACHE_KEY = 'community_themes';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const GITHUB_PAGES_BASE = `https://${REPO_CONFIG.owner}.github.io/${REPO_CONFIG.repo}/community-themes`;

async function fetchIndex(force = false): Promise<CommunityThemeIndex> {
  // 1. Check cache
  if (!force) {
    const cached = StorageService.get<CommunityThemeIndex | null>(CACHE_KEY, null);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return { ...cached, source: 'cache' };
    }
  }

  // 2. Call GitHub API
  try {
    const url = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/src/themes/community`;
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (response.status === 403) {
      // Rate limited — use cache or fallback
      return loadFallback();
    }
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);

    const items = await response.json() as GitHubContentItem[];
    const jsonFiles = items.filter(f => f.name.endsWith('.json') && f.name !== 'community-theme.schema.json');

    // 3. Fetch each JSON file content (parallelized, max 5 concurrent)
    const themes = await fetchThemeFiles(jsonFiles);

    // 4. Also detect advanced themes (directories)
    const dirs = items.filter(f => f.type === 'dir');
    const advancedMetas = await fetchAdvancedMetas(dirs);

    const index: CommunityThemeIndex = {
      themes: [...themes, ...advancedMetas],
      fetchedAt: Date.now(),
      source: 'api',
    };

    StorageService.set(CACHE_KEY, index);
    return index;

  } catch {
    return loadFallback();
  }
}

function loadFallback(): CommunityThemeIndex {
  // Try cached data first (even if stale)
  const cached = StorageService.get<CommunityThemeIndex | null>(CACHE_KEY, null);
  if (cached) return { ...cached, source: 'cache' };

  // Last resort: build-time snapshot
  return {
    themes: communitySnapshot.themes,  // import from community-snapshot.json
    fetchedAt: 0,
    source: 'fallback',
  };
}
```

### 4.4 Error Handling

| Error | HTTP Status | Handling | User Message |
|-------|-------------|----------|-------------|
| Rate limited | 403 | Use cache/fallback | "GitHub API 请求受限，正在使用缓存数据" |
| Network error | — | Use cache/fallback | "无法连接到 GitHub，正在使用缓存数据" |
| Invalid JSON | — | Skip theme, log warning | (silent, theme not shown) |
| Validation failed | — | Skip theme, log warning | (silent, theme not shown) |
| Empty directory | 200 (empty array) | Show empty state | "暂无社区主题，成为第一个贡献者！" |

---

## 5. Business Logic

### 5.1 Theme Filtering & Search

```
filteredThemes():
  1. Start with index.themes[]
  2. If searchQuery non-empty:
     filter where name.toLowerCase().includes(query) OR description.toLowerCase().includes(query)
  3. If selectedTags non-empty:
     filter where theme.tags has intersection with selectedTags (OR logic)
  4. Sort by name alphabetically
  5. Return result
```

Available tags are derived dynamically: `[...new Set(themes.flatMap(t => t.tags))]`.

### 5.2 Theme Application Logic

```
applyTheme(communityTheme: CommunityThemeMeta):
  1. Create version snapshot:
     versionStore.createVersion(currentTheme.id, currentTheme, `Before applying community theme: ${communityTheme.name}`)
  2. Build ThemeConfig from community meta:
     {
       id: communityTheme.id,
       name: communityTheme.name,
       algorithm: communityTheme.config.algorithm,
       token: communityTheme.config.token,
       components: communityTheme.config.components,
       updatedAt: new Date().toISOString(),
     }
  3. Validate via validateThemeConfig(built, currentTheme)
  4. Call themeStore.setTheme(validated)
  5. Show message.success(`Applied theme: ${communityTheme.name}`)
```

### 5.3 Cache Invalidation

```
isCacheStale(index: CommunityThemeIndex): boolean
  → Date.now() - index.fetchedAt > CACHE_TTL

When user opens Plaza Drawer:
  → If no index OR cache stale → fetchThemes()
  → If cache fresh → use cached

Manual refresh button:
  → fetchThemes(force: true)
```

### 5.4 Edge Cases

| Case | Handling |
|------|---------|
| Theme ID collides with official preset | `validateThemeConfig` already validates known tokens; collision in `themePresetRegistry` is prevented by the `getThemePreset` lookup never searching community store |
| Theme JSON has unknown token keys | `themeValidator` ignores unknown tokens (current behavior) — safe |
| Preview image missing / 404 | Show fallback placeholder (gradient with theme's `colorPrimary`) |
| User applies theme, then opens Plaza again | Previously applied community theme is now in themeStore as the active theme; Plaza shows it as "currently applied" |
| localStorage quota exceeded | `StorageService.set` already tracks usage; if `isNearLimit`, skip caching and rely on API/fallback |
| Concurrent fetches | `useCommunityStore.fetchThemes` guards with `loading` flag — second call is a no-op while first is in flight |

---

## 6. Error Handling

### 6.1 Error Taxonomy

| Error Code | Component | Condition | User Message |
|------------|-----------|-----------|--------------|
| `RATE_LIMITED` | CommunityThemeService | GitHub API 403 | "GitHub API 请求受限，使用缓存数据中" |
| `NETWORK_ERROR` | CommunityThemeService | fetch throws | "网络错误，使用缓存数据中" |
| `NO_THEMES` | PlazaDrawer | themes[] empty | "暂无社区主题" |
| `PARSE_ERROR` | CommunityThemeService | JSON.parse fails | (silent skip) |
| `ADVANCED_LOAD_FAIL` | CommunityThemeService | import() fails | "该高级主题加载失败" |

### 6.2 Retry Strategy

- GitHub API: No automatic retry (60/hr rate limit is precious). On failure, fall back to cache/snapshot immediately.
- Advanced theme `import()`: Single retry after 2s delay, then show error.

### 6.3 Failure Modes

| Dependency | Failure | Degradation |
|------------|---------|-------------|
| GitHub API | Down / rate limited | Plaza shows cached themes; "using cached data" banner |
| GitHub Pages | Down | Advanced themes unavailable; JSON themes still work |
| localStorage | Full | Plaza works from API without caching; existing data preserved |

---

## 7. Security

### 7.1 Input Validation

- All community theme JSON files pass through `themeValidator.validateThemeConfig()` before any ConfigProvider injection
- Token values are sanitized: colors must be hex, numbers clamped to min/max ranges
- `communityTheme.author` is validated against `^[a-zA-Z0-9-]+$` (GitHub username pattern)
- `communityTheme.description` max 200 chars, rendered as text (no HTML/markdown rendering in cards)
- Preview images are loaded via `<img>` tag (no script execution risk from PNG)

### 7.2 Advanced Theme Isolation

- Advanced themes (pre-compiled JS) are loaded via `import()` which runs in the page's JS context
- Mitigation: CI compilation is done from reviewed/approved PR code only (maintainer approval required)
- CI build uses `external: ['react', 'antd', 'antd-style']` to prevent dependency bundling
- Runtime: advanced themes can only return `ConfigProviderProps` — the type boundary limits what they can do

### 7.3 API Key Protection

- GitHub API calls are unauthenticated (no tokens exposed client-side)
- Existing LLM API key handling (base64 in localStorage) is not changed
- AI Prompt Preview in Settings strips the API key from display

---

## 8. Performance

### 8.1 Expected Load

- GitHub API calls: 1-2 per user session (cache hit rate ~90% with 30min TTL)
- Community theme count: 10-50 themes in first year
- Each JSON theme file: ~0.5-2KB
- Preview images: ~50-200KB each (loaded on demand)

### 8.2 Optimization Strategy

| Strategy | Implementation |
|----------|---------------|
| Cache-first | localStorage cache with TTL, stale data used as fallback |
| Lazy image loading | `<img loading="lazy">` on theme preview PNGs |
| Lazy Plaza Drawer | `React.lazy()` import in `App.tsx` — zero cost if user never opens Plaza |
| Parallel file fetch | Fetch up to 5 JSON files concurrently when populating index |
| Preview image fallback | CSS gradient from `colorPrimary` while PNG loads |
| System prompt memoization | `buildSystemPrompt(locale)` result cached by locale key; only theme context portion rebuilt per message |

### 8.3 System Prompt Token Budget

| Section | Estimated Tokens | Notes |
|---------|-----------------|-------|
| Role definition | ~50 | Existing |
| Design language | ~400 | New: color/radius/spacing/font rules |
| Token constraints | ~200 | Existing: token registry list |
| Current theme context | ~150 | Dynamic: serialized overrides |
| Few-shot examples | ~500 | New: 5 examples × ~100 tokens each |
| Output format | ~50 | Existing |
| **Total** | **~1350** | Up from ~300 currently |

Impact: with `max_tokens: 1600` for response + ~1350 system prompt + ~500 per user message × 10 messages = ~18,350 tokens. Well within 128K context window of all supported models. Even 4K context models (e.g. older GPT-3.5) can handle this comfortably.

---

## 9. Testing Strategy

### 9.1 Unit Tests

| File | Tests |
|------|-------|
| `communityThemeService.test.ts` | - `fetchIndex` returns cached data when fresh<br>- `fetchIndex` calls API when cache stale<br>- `fetchIndex` returns fallback on network error<br>- `fetchIndex(force=true)` bypasses cache<br>- Invalid JSON files are silently skipped<br>- `getPreviewUrl` constructs correct raw.githubusercontent URL |
| `communityStore.test.ts` | - `fetchThemes` sets loading/error states<br>- `filteredThemes` filters by tags (OR logic)<br>- `filteredThemes` filters by search query<br>- `toggleTag` adds/removes tag from selectedTags |
| `systemPrompt.test.ts` | - `buildSystemPrompt({locale: 'en-US'})` returns English prompt<br>- `buildSystemPrompt({locale: 'zh-CN'})` returns Chinese prompt<br>- Prompt contains design language section<br>- Prompt contains few-shot examples<br>- Prompt token count stays under 1500 |
| `themeContext.test.ts` | - Serializes preset + overrides correctly<br>- Handles empty overrides<br>- Handles missing components |
| `designLanguage.test.ts` | - English and Chinese versions have same structure<br>- Covers color/radius/spacing/font sections |

### 9.2 Integration Tests

| Test | Type | Description |
|------|------|-------------|
| Plaza renders themes | E2E (Playwright) | Mock GitHub API → open Plaza → verify cards rendered |
| Theme preview works | E2E | Open Plaza → click card → verify preview modal shows components with theme colors |
| Apply theme | E2E | Preview modal → click Apply → verify Playground uses new theme tokens |
| AI with context | Unit | Verify LLMClient sends themeContext in request payload |

### 9.3 Acceptance Criteria Mapping

| US/FR | Test | Type | Description |
|-------|------|------|-------------|
| US-001 / FR-5 | Plaza grid renders | E2E | Open Plaza → cards visible |
| US-001 / FR-6 | Filter by tag | Unit + E2E | Click tag → filtered results |
| US-002 / FR-7 | Preview in ConfigProvider | E2E | Click card → preview modal |
| US-003 / FR-8 | Version snapshot before apply | Unit | Verify createVersion called |
| US-004 / FR-2 | GitHub API fetch | Unit | Mock fetch → verify parsing |
| US-004 / FR-3 | Cache with TTL | Unit | Verify cache hit/miss behavior |
| US-004 / FR-4 | Fallback to snapshot | Unit | Mock 403 → verify fallback |
| US-005 / FR-1 | JSON schema validation | Unit | Valid/invalid JSON → pass/fail |
| US-008 / FR-10 | Design language in prompt | Unit | Assert prompt sections |
| US-009 / FR-9 | Theme context injection | Unit | Verify context in messages |
| US-010 / FR-11 | Few-shot examples | Unit | Assert examples in prompt |
| US-011 / FR-13 | Prompt Preview panel | E2E | Open Settings → expand panel |
| US-012 | Locale switching | Unit + E2E | Toggle locale → prompt language changes |

---

## 10. Implementation Plan

### 10.1 Phases

**Phase 1: Foundation (社区主题基础设施)**
- Create `src/themes/community/` directory structure
- Define types (`CommunityThemeMeta`, `CommunityThemeIndex`)
- Implement `CommunityThemeService` (GitHub API + cache + fallback)
- Create `useCommunityStore`
- Add JSON Schema + example theme
- Dependencies: None

**Phase 2: Plaza UI (主题广场界面)**
- Implement `PlazaDrawer`, `ThemeCard`, `ThemePreviewModal`
- Add Plaza entry point to `HeaderBar`
- Extend `uiStore` with Plaza state
- Wire up `App.tsx` lazy import
- Dependencies: Phase 1

**Phase 3: AI Enhancement (AI 能力增强)**
- Refactor `systemPrompt.ts` into layered builder
- Create `designLanguage.ts` (zh-CN + en-US)
- Create `fewShotExamples.ts` (zh-CN + en-US)
- Create `themeContext.ts`
- Modify `LLMClient` to inject context
- Extend `settingsStore` with `locale`
- Add Prompt Preview + locale selector to `SettingsModal`
- Dependencies: None (parallel with Phase 1-2)

**Phase 4: Contribution Infrastructure (贡献机制)**
- Write `src/themes/community/README.md` contribution guide
- Create `.github/PULL_REQUEST_TEMPLATE/community-theme.md`
- Create `.github/workflows/compile-community-themes.yml` (CI for TS themes)
- Add 2-3 example community themes
- Dependencies: Phase 1

### 10.2 Issue Mapping

| Issue | SPEC Sections | Phase | Priority | Depends On |
|-------|--------------|-------|----------|------------|
| Community types & service | 3.1, 4.2, 4.3 | 1 | high | — |
| Community store | 3.1, 5.1, 5.3 | 1 | high | types & service |
| JSON Schema & directory | 3.4 | 1 | high | — |
| PlazaDrawer + ThemeCard | 2.2, 5.1 | 2 | high | store |
| ThemePreviewModal | 2.3, 5.2 | 2 | high | PlazaDrawer |
| HeaderBar Plaza entry | 2.2 | 2 | medium | PlazaDrawer |
| System prompt refactor | 8.3 | 3 | high | — |
| Design language module | 5.1 (AI) | 3 | high | prompt refactor |
| Few-shot examples | 5.1 (AI) | 3 | high | prompt refactor |
| Theme context injection | 2.3 (AI flow) | 3 | high | prompt refactor |
| Settings: locale + preview | 2.2 | 3 | medium | prompt refactor |
| Contribution guide & PR template | — | 4 | medium | directory |
| CI workflow for TS themes | 2.4, 7.2 | 4 | low | — |

### 10.3 Incremental Delivery

- Phase 1 + 2 can be merged as one PR (Plaza feature complete)
- Phase 3 is independent and can be a separate PR
- Phase 4 is documentation/CI only, can be its own PR
- No feature flags needed — Plaza Drawer is lazy-loaded and only visible when user clicks the entry button

---

## 11. Open Questions & Risks

### 11.1 Unresolved Questions

1. **预览图尺寸规范**: 建议 800×500 px, ≤200KB, PNG format. 需要在 CI 校验中添加 image dimensions check（可用 `image-size` npm package 在 GitHub Action 中验证）。
2. **社区主题质量门槛**: 建议 JSON Schema 自动校验 + maintainer approval（至少 1 个 approve）。纯自动合并风险过高（低质量/恶意主题）。
3. **GitHub Pages 部署**: CI workflow 需要 `gh-pages` 分支的写权限。如果仓库使用 Vercel 部署主站，GitHub Pages 可用于独立托管编译后的社区主题 JS 文件，两者不冲突。

### 11.2 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GitHub API rate limit (60/hr) exhausted | Plaza shows stale data | 30min cache TTL + build-time fallback snapshot；大多数用户不会频繁刷新 |
| CORS on GitHub raw content | Preview images fail to load | `raw.githubusercontent.com` allows CORS by default；如有问题改用 GitHub API with `Accept: application/vnd.github.v3.raw` |
| System prompt too long for small models | AI response truncated | Monitor total token count；如超限，裁剪 few-shot examples 到 3 个 |
| Advanced theme JS has runtime errors | Page crash | Wrap `import()` in try-catch + ErrorBoundary；isolate in dedicated ConfigProvider |
| Community theme with extreme token values | Ugly preview | `themeValidator` already clamps values to min/max ranges |

### 11.3 Assumptions

- GitHub Contents API response format remains stable (v3 REST API)
- `raw.githubusercontent.com` continues to allow CORS requests from any origin
- Community themes do not need to modify CSS beyond what `ConfigProviderProps` allows (for basic JSON format)
- Build-time snapshot generation can be done as a Vite plugin or pre-build script
- The existing `themeValidator` is sufficient for sanitizing community theme tokens (no new validation rules needed)
