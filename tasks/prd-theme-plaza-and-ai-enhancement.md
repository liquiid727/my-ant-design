# PRD: Theme Plaza & AI Enhancement

## Introduction

Ant Design Theme Studio 目前内置了 13 个官方主题和 1 个自定义主题，但缺乏社区贡献渠道和主题发现机制。同时，AI 主题编辑的 system prompt 仅包含基本的 token 列表，缺少 Ant Design 设计语言的深层知识，导致 LLM 生成的主题建议可能不符合设计规范。

本 PRD 涵盖三个核心功能模块：

1. **主题广场 (Theme Plaza)**：一个社区主题市场，用户可浏览、预览和一键应用社区贡献的主题。主题文件存放在仓库的 `src/themes/community/` 目录中，运行时通过 GitHub API 动态拉取，实现"PR 合并即上架"，无需重新部署应用。
2. **社区贡献机制**：开发者通过向仓库发起 PR 贡献主题，支持两个级别——基础级仅需 JSON 配置文件（零门槛），高级可提供完整 TS 主题文件（支持 CSS-in-JS 自定义样式覆盖）。
3. **AI 提示词增强**：在现有 system prompt 基础上注入 Ant Design 的设计语言体系（色彩系统、圆角规范、间距系统）、当前主题上下文、常见修改示例，使 LLM 生成的主题更专业、更符合设计规范。

## Goals

- 建立开放的社区主题生态，降低主题贡献门槛至"提交一个 JSON 文件即可"
- 用户无需等待应用重新部署即可浏览和使用最新的社区主题（GitHub API 动态拉取）
- 主题广场提供预览能力，用户可在应用前查看主题效果
- AI 生成的主题建议符合 Ant Design 设计规范，token 值合理且风格连贯
- AI 能感知当前主题上下文，给出基于当前状态的增量建议而非盲目覆盖

## User Stories

### US-001: 浏览社区主题广场

**Description:** As a user, I want to browse community-contributed themes in a dedicated "Theme Plaza" view so that I can discover themes created by other developers.

**Acceptance Criteria:**
- [ ] 新增「主题广场」入口，可从主界面顶部导航或侧边栏进入
- [ ] 主题广场以卡片网格展示社区主题，每个卡片包含：主题名称、作者、风格标签、缩略预览图
- [ ] 支持按分类筛选（如：暗色系、亮色系、品牌风格、极简风格等），分类由主题的 `tags` 元数据驱动
- [ ] 支持按关键字搜索主题名称和描述
- [ ] 首次加载和刷新时通过 GitHub API 从仓库 `src/themes/community/` 目录拉取主题索引
- [ ] 加载状态有 Skeleton 占位，网络错误有友好提示并支持重试
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: 预览社区主题

**Description:** As a user, I want to preview a community theme before applying it so that I can see how it looks with my components.

**Acceptance Criteria:**
- [ ] 点击主题卡片打开预览抽屉或弹窗，展示该主题的完整效果
- [ ] 预览区域使用当前 Playground 的组件面板渲染，应用该主题的 token 和组件配置
- [ ] 预览中展示主题的 token 差异摘要（与默认 Ant Design 主题的对比）
- [ ] 预览弹窗底部有「应用主题」和「取消」按钮
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: 应用社区主题

**Description:** As a user, I want to apply a community theme with one click so that I can immediately use it in my theme studio.

**Acceptance Criteria:**
- [ ] 点击「应用主题」后，主题配置注入到当前 themeStore，成为活动主题
- [ ] 应用前自动创建版本快照（message: "Before applying community theme: {themeName}"），确保可回退
- [ ] 应用后 Playground 实时刷新，展示新主题效果
- [ ] 应用后可在编辑器中继续微调该主题的 token
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: GitHub API 动态拉取社区主题

**Description:** As a developer, I want themes to be fetched from the GitHub repository at runtime so that new community themes are available without redeploying the application.

**Acceptance Criteria:**
- [ ] 创建 `CommunityThemeService`，通过 GitHub Contents API 读取 `src/themes/community/` 目录下的主题文件
- [ ] 拉取的主题索引缓存到 localStorage，设置合理的 TTL（如 30 分钟），过期后自动刷新
- [ ] 支持手动刷新按钮强制重新拉取
- [ ] 对 GitHub API 的 rate limit 做处理：未认证 60 次/小时，超限时展示提示并使用缓存数据
- [ ] Fallback 机制：如果 GitHub API 不可用，使用构建时打包的主题快照作为兜底
- [ ] Typecheck/lint passes

### US-005: 社区主题文件夹结构与基础主题格式

**Description:** As a theme contributor, I want to submit a simple JSON file to share my theme so that I can contribute without knowing the codebase internals.

**Acceptance Criteria:**
- [ ] 仓库中创建 `src/themes/community/` 目录，包含 `README.md` 贡献指南
- [ ] 基础格式：每个主题为一个 JSON 文件（如 `ocean-blue.json`），schema 为：
  ```json
  {
    "id": "ocean-blue-a3x9",
    "name": "Ocean Blue",
    "author": "github-username",
    "description": "A calm ocean-inspired theme",
    "tags": ["blue", "calm", "light"],
    "preview": "ocean-blue-a3x9-preview.png",
    "config": {
      "algorithm": "default",
      "token": { "colorPrimary": "#0969da" },
      "components": {}
    }
  }
  ```
- [ ] 创建 JSON Schema 文件 `community-theme.schema.json`，用于 PR 校验
- [ ] 主题 ID 采用 `{theme-name}-{4位随机后缀}` 格式（如 `ocean-blue-a3x9`），与文件名一致（不含扩展名），避免与官方主题或其他社区主题命名冲突
- [ ] CI 校验时检查 ID 是否与已有官方/社区主题重复，重复时给出明确提示
- [ ] 预览图以 PNG 格式存放在仓库中，文件名与主题 ID 对应（如 `ocean-blue-a3x9-preview.png`）
- [ ] Typecheck/lint passes

### US-006: 高级主题贡献格式（TS 主题文件）

**Description:** As an advanced contributor, I want to submit a full TypeScript theme file with custom CSS-in-JS overrides so that I can create visually richer themes.

**Acceptance Criteria:**
- [ ] 高级主题以文件夹形式存在：`src/themes/community/{theme-id}/`，包含 `meta.json`（元数据）和 `theme.ts`（主题实现）
- [ ] `theme.ts` 导出一个 `useXxxTheme` hook，返回 `ConfigProviderProps`，与官方主题格式一致
- [ ] 高级主题可使用 `antd-style` 的 `createStyles` 编写自定义 CSS 类覆盖
- [ ] 高级主题通过 GitHub Actions 自动编译为 ES Module JS，发布到 GitHub Pages，运行时通过 `import()` 按需加载，不影响主应用包体积
- [ ] 贡献指南中提供高级主题的模板和示例
- [ ] Typecheck/lint passes

### US-007: 贡献指南与 PR 模板

**Description:** As a theme contributor, I want clear documentation and PR templates so that I know exactly how to submit my theme.

**Acceptance Criteria:**
- [ ] `src/themes/community/README.md` 包含：目录结构说明、基础/高级格式文档、token 对照表、提交步骤
- [ ] 创建 `.github/PULL_REQUEST_TEMPLATE/community-theme.md`，包含 checklist（文件格式正确、ID 唯一、预览图已上传等）
- [ ] README 中提供一个完整的基础主题示例和一个高级主题示例
- [ ] 文档说明如何在本地预览自己的主题效果

### US-008: AI System Prompt 注入 Ant Design 设计语言

**Description:** As a user interacting with the AI, I want the AI to understand Ant Design's design language so that its theme suggestions are professional and consistent.

**Acceptance Criteria:**
- [ ] system prompt 中新增 Ant Design 色彩体系说明：主色与功能色的关系、色板生成规则（主色自动衍生 1-10 色阶）、暗色模式下的色彩反转规则
- [ ] 新增圆角规范说明：XS/SM/Base/LG 的层级关系和适用场景（XS→标签/徽标、SM→小型控件、Base→按钮/输入框、LG→卡片/弹窗）
- [ ] 新增间距系统说明：SM/Base/LG 的使用场景和倍数关系
- [ ] 新增字体大小层级说明：SM→辅助文字、Base→正文、LG→小标题
- [ ] prompt 包含设计一致性约束提示："Ensure all border radius values follow a consistent progression (XS < SM < Base < LG)"
- [ ] Typecheck/lint passes

### US-009: AI 注入当前主题上下文

**Description:** As a user, I want the AI to be aware of my current theme state so that it gives contextual suggestions instead of starting from scratch.

**Acceptance Criteria:**
- [ ] 每次发送消息给 AI 时，将当前活动主题的 token 快照注入到消息上下文中
- [ ] 注入格式为：`Current theme state: { preset: "shadcn", overrides: { token: { colorPrimary: "#000000" }, components: { Button: { borderRadius: 0 } } } }`
- [ ] AI 能基于当前状态给出增量建议（如"你当前的主色是黑色，建议将 colorSuccess 调整为 #22c55e 以保持对比度"）
- [ ] 当用户切换 preset 后，AI 上下文自动更新
- [ ] Typecheck/lint passes

### US-010: AI 内置常见修改示例（Few-shot Prompting）

**Description:** As a user, I want the AI to give well-structured theme responses so that I can directly apply them without manual correction.

**Acceptance Criteria:**
- [ ] system prompt 中加入 3-5 个 few-shot examples，覆盖常见场景：
  - 修改主色（用户说"把主色改成红色" → AI 返回仅包含 colorPrimary 的 JSON）
  - 修改整体圆角风格（"改成圆润风格" → AI 返回 borderRadius/SM/LG/XS 的一组协调值）
  - 修改多个关联 token（"做一个企业级严肃风格" → AI 返回色彩+圆角+间距的组合调整）
  - 暗色主题调整（"切换到暗色模式" → AI 返回包含 algorithm: "dark" 和适配的背景色/文字色）
  - 组件级定制（"让按钮更突出" → AI 返回 components.Button 的 token 调整）
- [ ] 每个示例包含用户输入和期望的 AI JSON 输出
- [ ] few-shot examples 同时提供中文和英文版本的用户输入示例
- [ ] Typecheck/lint passes

### US-012: AI System Prompt 中英文双语支持

**Description:** As a user, I want the AI system prompt to support both Chinese and English so that it can respond appropriately regardless of the language I use.

**Acceptance Criteria:**
- [ ] 设计语言说明部分（色彩体系、圆角规范、间距系统）提供中英文双语版本
- [ ] system prompt 构建函数接受 `locale` 参数（`'zh-CN' | 'en-US'`），根据参数选择对应语言的 prompt 模板
- [ ] 默认根据浏览器 `navigator.language` 自动选择语言
- [ ] Settings 中增加 AI 语言偏好选项，允许用户手动切换
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-011: Settings 中的 AI 提示词预览

**Description:** As a user, I want to see what context the AI receives in the Settings panel so that I can understand and trust the AI's capabilities.

**Acceptance Criteria:**
- [ ] Settings 弹窗中新增「AI Prompt Preview」折叠面板（Collapse），展示当前完整的 system prompt（脱敏处理，不显示 API key）
- [ ] 面板默认折叠，展开后以代码块样式展示 prompt 内容
- [ ] 如用户自定义了额外的 prompt 片段，也在此处展示
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: 系统必须在 `src/themes/community/` 下维护社区主题文件夹，支持 JSON 格式（基础）和 TS 文件夹格式（高级）两种贡献方式
- FR-2: 系统必须提供 `CommunityThemeService`，通过 GitHub Contents API（`https://api.github.com/repos/{owner}/{repo}/contents/src/themes/community`）在运行时拉取社区主题索引
- FR-3: 系统必须将拉取的主题索引缓存到 localStorage（key: `ts_community_themes`），TTL 为 30 分钟
- FR-4: 当 GitHub API 不可用或超出 rate limit 时，系统必须回退到构建时内联的主题快照
- FR-5: 系统必须提供主题广场 UI（路由 `/plaza` 或作为 Drawer），以卡片网格展示社区主题
- FR-6: 主题广场必须支持按标签筛选和关键字搜索
- FR-7: 系统必须提供主题预览能力，在独立的 ConfigProvider 中渲染预览组件
- FR-8: 应用社区主题前，系统必须自动创建版本快照以确保可回退
- FR-9: 系统必须在每次 AI 对话时，将当前活动主题的完整 token 状态注入到消息上下文
- FR-10: AI 的 system prompt 必须包含 Ant Design 设计语言说明（色彩体系、圆角规范、间距系统、字体层级）
- FR-11: AI 的 system prompt 必须包含 3-5 个 few-shot examples 覆盖常见的主题修改场景
- FR-12: 社区主题 JSON 文件必须通过 JSON Schema 校验后才能被合并（可集成为 CI check）
- FR-13: Settings 弹窗必须提供 AI Prompt Preview 面板，展示当前完整的 system prompt

## Non-Goals (Out of Scope)

- **不做用户账号系统**：主题贡献通过 GitHub PR 而非应用内上传，不需要用户注册/登录
- **不做主题评分/评论系统**：第一期不做社交功能，社区互动通过 GitHub Issues/PR comments 进行
- **不做主题的在线编辑后直接提交 PR**：用户需要本地 fork + 提交 PR，不通过应用直接创建 PR
- **不做 system prompt 的用户自定义编辑**：第一期仅提供预览，不允许用户修改内置提示词
- **不做主题的付费/商业化功能**：所有社区主题免费开放
- **不做主题版本管理**：社区主题不跟踪版本历史，以仓库中的最新版为准
- **不做 GitHub OAuth 认证**：API 调用使用未认证方式，接受 60 次/小时的 rate limit

## Design Considerations

### 主题广场 UI

- 主题卡片建议采用与现有 PresetBar 一致的视觉语言，但以更大的卡片形式展示更多信息
- 卡片可展示一个 mini 预览截图（由贡献者提供 PNG）和关键 token 色彩条
- 入口可作为顶部 Tab 或主界面的一个额外 Drawer，与现有 AI Drawer 并列
- 筛选区域放在顶部，使用 Ant Design 的 `Tag.CheckableTag` 组件实现标签筛选

### AI Prompt 结构

- system prompt 按职责分层组织：`角色定义` → `设计语言知识` → `Token 约束` → `当前上下文` → `Few-shot 示例` → `输出格式要求`
- 当前主题上下文作为每次对话的动态注入部分，不固化在 system prompt 中
- Few-shot examples 保持简洁，每个示例不超过 10 行 JSON

### 社区主题结构

```
src/themes/community/
├── README.md                          # 贡献指南
├── community-theme.schema.json        # JSON Schema
├── ocean-blue.json                    # 基础主题（单文件）
├── sunset-warm.json                   # 基础主题（单文件）
└── neon-cyberpunk/                    # 高级主题（文件夹）
    ├── meta.json                      # 元数据
    ├── theme.ts                       # 主题实现
    └── preview.png                    # 预览图
```

## Technical Considerations

### GitHub API 集成

- 使用 GitHub Contents API 读取目录列表和文件内容，避免需要 token 的 GraphQL API
- 未认证 API 限制为 60 次/小时，需合理设置缓存策略
- 文件内容通过 API 返回的 `content` 字段（base64 编码）解析，无需额外请求
- 仓库信息采用 hardcode 上游仓库地址 + 环境变量覆盖的模式（参考 Obsidian/Homebrew 的做法）：
  - 默认值 hardcode 为原始仓库：`const COMMUNITY_REPO = { owner: 'xxx', repo: 'theme' }`
  - 提供 `VITE_COMMUNITY_REPO` 环境变量允许企业/私有部署场景覆盖
  - Fork 用户默认也从上游拉取社区主题（社区内容是共享资产，不应碎片化）

### 主题加载策略（混合模式）

- **基础 JSON 主题**：运行时通过 GitHub API 拉取 → 解析为 `ThemeConfig` → 通过 `themeValidator` 校验 → 注入 ConfigProvider。PR 合并即上架，无需部署。
- **高级 TS 主题**：PR 合并 → GitHub Actions 自动编译为独立 ES Module JS bundle → 发布到 GitHub Pages（如 `https://{user}.github.io/theme/community-themes/neon-cyberpunk.js`） → 运行时通过 `import()` 动态加载预编译模块。参考 Obsidian 社区插件模式：源码是 TS，分发物是编译后的 JS。
- 构建时生成一份 `community-snapshot.json` 作为 fallback，包含所有基础 JSON 主题的内容
- CI 编译流程：`src/themes/community/*/theme.ts` → Vite library mode 单独打包 → 输出到 `gh-pages` 分支的 `community-themes/` 目录

### 现有架构融合

- 社区主题注册为 `group: 'community'` 的 `ThemePresetDefinition`，与 `official` 和 `custom` 并列
- 需要扩展 `ThemePresetDefinition.group` 类型为 `'official' | 'custom' | 'community'`
- `CommunityThemeService` 作为新的 service 放在 `src/services/community/` 下
- 新增 `useCommunityStore` (Zustand) 管理社区主题列表、加载状态、缓存

### AI Prompt 的 Token 预算

- 增强后的 system prompt 预估增加约 800-1200 tokens
- 需确保 system prompt + 历史消息 + 当前主题上下文不超过模型的上下文窗口
- 当前 LLMClient 已限制保留最近 10 条消息，额外需要评估 system prompt 膨胀的影响

## Success Metrics

- 社区主题数量：上线 3 个月内至少 10 个社区贡献主题
- 应用率：主题广场中的主题被应用的次数 > 0（每个主题至少被使用过）
- AI 生成质量：增强后 AI 生成的主题 token 值 100% 通过 `themeValidator` 校验（目前已通过，但新增设计规范约束后需确保不退化）
- AI 上下文感知：AI 回复中引用当前主题状态的比例 > 50%（手动抽样评估）
- 贡献门槛：新贡献者从 fork 到提交 PR 的平均时间 < 30 分钟（通过贡献指南引导）

## Open Questions (Resolved)

> 以下问题已在 PRD 评审中确认解决方案，记录于此供参考。

1. **仓库信息配置** → ✅ 已决定：Hardcode 上游仓库地址为默认值，提供 `VITE_COMMUNITY_REPO` 环境变量允许覆盖。Fork 用户默认从上游拉取社区主题。参考 Obsidian/Homebrew 的主流做法。
2. **预览图的存储** → ✅ 已决定：预览图以 PNG 格式直接存放在仓库中，文件名与主题 ID 对应。
3. **主题命名冲突** → ✅ 已决定：主题 ID 采用 `{theme-name}-{4位随机后缀}` 格式（如 `ocean-blue-a3x9`），CI 校验时检查与官方/已有社区主题的重复并给出提示。
4. **高级主题的运行时加载** → ✅ 已决定：采用混合策略。JSON 基础主题通过 GitHub API 运行时拉取（PR 合并即上架）；TS 高级主题通过 GitHub Actions 自动编译为 ES Module JS → 发布到 GitHub Pages → 运行时 `import()` 动态加载。参考 Obsidian 社区插件的"源码 TS / 分发 JS"模式。
5. **AI system prompt 国际化** → ✅ 已决定：支持中英文双语，system prompt 构建函数接受 `locale` 参数，默认根据 `navigator.language` 自动选择，用户可在 Settings 中手动切换。

## Remaining Open Questions

1. **GitHub Pages 部署配置**：高级主题的预编译 JS 发布到 GitHub Pages 的具体 CI 配置需要进一步设计（workflow yaml、输出目录结构、版本缓存策略）。
2. **预览图尺寸规范**：社区主题的预览 PNG 是否需要规定固定尺寸（如 800x600 或 16:9 比例）和最大文件大小？
3. **社区主题的质量门槛**：除 JSON Schema 校验外，是否需要人工 review（如 maintainer approval）才能合并？还是自动校验通过即可合并？
