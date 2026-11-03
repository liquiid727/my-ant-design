const en = `
## Ant Design Design Language

### Color System
- colorPrimary is the brand color. Ant Design auto-generates a 10-step palette (Primary-1 to Primary-10) from it.
- Functional colors (Success, Warning, Error, Info) should maintain sufficient contrast with the primary color.
- In dark mode, colorBgBase should be dark (#141414 or similar) and colorTextBase should be light (#ffffff or similar). The algorithm handles most derivative color inversions automatically.
- When changing colorPrimary, do NOT change functional colors unless explicitly asked — they are independent.

### Border Radius
- Follows a strict progression: borderRadiusXS < borderRadiusSM < borderRadius < borderRadiusLG.
- XS (2px): tags, badges, small indicators.
- SM (4px): small controls, compact inputs.
- Base (6px): buttons, inputs, selects — the default interactive element radius.
- LG (8px): cards, modals, drawers — container-level elements.
- For a "rounded" style, scale all proportionally (e.g., XS=6, SM=8, Base=12, LG=16).
- For a "sharp" style, set all to 0 or near-0.

### Spacing System
- Follows a progression: paddingSM/marginSM < padding/margin < paddingLG/marginLG.
- SM (12px): compact layouts, tight grouping within a section.
- Base (16px): default spacing between elements.
- LG (24px): section-level separation, generous breathing room.
- Always maintain the ratio: SM ≈ 0.75×Base, LG ≈ 1.5×Base.

### Typography
- fontSizeSM (12px): captions, helper text, secondary labels.
- fontSize (14px): body text, form labels, default content.
- fontSizeLG (16px): subtitles, section headers, emphasized content.
- Keep progression: fontSizeSM < fontSize < fontSizeLG.

### Consistency Rules
- When adjusting one token in a group (e.g., borderRadius), adjust ALL tokens in that group proportionally.
- Return ONLY the tokens that change — do not repeat tokens with their default values.
- Prefer minimal changes that achieve the user's intent.
`;

const zh = `
## Ant Design 设计语言

### 色彩体系
- colorPrimary 是品牌主色。Ant Design 会自动从主色生成 10 级色板（Primary-1 到 Primary-10）。
- 功能色（Success、Warning、Error、Info）应与主色保持足够的对比度。
- 暗色模式下，colorBgBase 应设为深色（如 #141414），colorTextBase 应设为浅色（如 #ffffff）。算法会自动处理大部分衍生色的反转。
- 修改 colorPrimary 时，除非用户明确要求，不要改动功能色——它们是独立的。

### 圆角规范
- 严格遵循层级递进：borderRadiusXS < borderRadiusSM < borderRadius < borderRadiusLG。
- XS (2px)：标签、徽标、小型指示器。
- SM (4px)：小型控件、紧凑输入框。
- Base (6px)：按钮、输入框、选择器——默认交互元素圆角。
- LG (8px)：卡片、弹窗、抽屉——容器级元素。
- 「圆润风格」：按比例放大（如 XS=6, SM=8, Base=12, LG=16）。
- 「直角风格」：全部设为 0 或接近 0。

### 间距系统
- 遵循递进关系：paddingSM/marginSM < padding/margin < paddingLG/marginLG。
- SM (12px)：紧凑布局、区域内部紧密分组。
- Base (16px)：元素间的默认间距。
- LG (24px)：区域级分隔、宽松的呼吸空间。
- 始终保持比例：SM ≈ 0.75×Base，LG ≈ 1.5×Base。

### 字体大小
- fontSizeSM (12px)：辅助文字、帮助提示、次要标签。
- fontSize (14px)：正文、表单标签、默认内容。
- fontSizeLG (16px)：小标题、区域标题、强调内容。
- 保持递进：fontSizeSM < fontSize < fontSizeLG。

### 一致性规则
- 调整某个分组内的一个 token（如 borderRadius）时，应按比例调整该分组内的所有 token。
- 仅返回发生变化的 token，不要重复输出默认值。
- 优先采用最小变更来实现用户意图。
`;

export const designLanguage = { 'en-US': en, 'zh-CN': zh } as const;

export type PromptLocale = keyof typeof designLanguage;
