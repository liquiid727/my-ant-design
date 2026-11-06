/**
 * 资源清单：token 管不到的那一层，别人已经做过的部分。
 *
 * 一屏能读完是硬要求：每条只留一句事实 + 一个"补哪一步"的短标签，
 * 长解释放回各自仓库。图标在 public/res/{id}.png，来源见 docs/resource-assets.md。
 */

export type GroupId = 'direction' | 'tokens' | 'motion' | 'review' | 'regression' | 'agent';

/** adopted = 已经进本仓库的管线；gap = 这里没有、值得补的缺口。 */
export type ResourceState = 'adopted' | 'gap';

export type IconId = 'compass' | 'braces' | 'wave' | 'check' | 'diff' | 'terminal';

export type ResourceGroup = {
  id: GroupId;
  index: string;
  label: string;
  en: string;
  lede: string;
  icon: IconId;
};

export type Resource = {
  id: string;
  name: string;
  group: GroupId;
  state?: ResourceState;
  /** 主入口：站点、文档或仓库。 */
  href: string;
  repo?: string;
  kind: string;
  license: string;
  stars?: string;
  /** 一句话：它是什么。 */
  claim: string;
  /** 三五个字：它补哪一步。 */
  tag: string;
  /** 站内对应位置。 */
  inside?: { label: string; to: string };
};

export const GROUPS: ResourceGroup[] = [
  { id: 'direction', index: '01', label: '方向', en: 'Direction', lede: '先决定长什么样', icon: 'compass' },
  { id: 'tokens', index: '02', label: '令牌', en: 'Tokens', lede: '这一层我们自己在写', icon: 'braces' },
  { id: 'motion', index: '03', label: '动效', en: 'Motion', lede: '节奏、缓动、镜头', icon: 'wave' },
  { id: 'review', index: '04', label: '审查', en: 'Review', lede: '把不对劲说成清单', icon: 'check' },
  { id: 'regression', index: '05', label: '回归', en: 'Regression', lede: '证明它没坏', icon: 'diff' },
  { id: 'agent', index: '06', label: '代理', en: 'Agent', lede: '让模型看见页面', icon: 'terminal' },
];

export const RESOURCES: Resource[] = [
  // 01 · 方向
  {
    id: 'stylekit',
    name: 'StyleKit',
    group: 'direction',
    href: 'https://www.stylekit.top/zh/styles',
    repo: 'https://github.com/AnxForever/stylekit',
    kind: '站点',
    license: 'MIT',
    stars: '770',
    claim: '149 种网页风格，每种都带提示词与 token 配方。',
    tag: '选方向',
    inside: { label: '工作台', to: '/studio' },
  },
  {
    id: 'taste-skill',
    name: 'Taste Skill',
    group: 'direction',
    href: 'https://www.tasteskill.dev/',
    repo: 'https://github.com/Leonxlnx/taste-skill',
    kind: '技能',
    license: 'MIT',
    stars: '110.7k',
    claim: '247 个站点蒸馏成 20 个版面方向，每次发三张牌。',
    tag: '拿版面',
    inside: { label: '校验', to: '/method/process' },
  },

  // 02 · 令牌
  {
    id: 'style-dictionary',
    name: 'Style Dictionary',
    group: 'tokens',
    state: 'adopted',
    href: 'https://styledictionary.com/',
    repo: 'https://github.com/style-dictionary/style-dictionary',
    kind: '工具',
    license: 'Apache-2.0',
    stars: '4.9k',
    claim: '别名解析与跨平台产物——本仓库编译器的底座。',
    tag: '解别名',
    inside: { label: '编译', to: '/method/process' },
  },
  {
    id: 'dtcg',
    name: 'DTCG 规范',
    group: 'tokens',
    href: 'https://www.designtokens.org/',
    repo: 'https://github.com/design-tokens/community-group',
    kind: '规范',
    license: 'W3C CG',
    stars: '2.2k',
    claim: '设计 token 的官方规范，接外部工具的公共语言。',
    tag: '对规范',
    inside: { label: '产物', to: '/method/output' },
  },
  {
    id: 'terrazzo',
    name: 'Terrazzo',
    group: 'tokens',
    href: 'https://terrazzo.app/',
    repo: 'https://github.com/terrazzoapp/terrazzo',
    kind: '工具',
    license: 'MIT',
    stars: '486',
    claim: '只吃 DTCG，直接出 CSS / JS / Swift / Android。',
    tag: '出代码',
  },
  {
    id: 'radix-colors',
    name: 'Radix Colors',
    group: 'tokens',
    href: 'https://www.radix-ui.com/colors',
    repo: 'https://github.com/radix-ui/colors',
    kind: '色阶',
    license: 'MIT',
    stars: '1.7k',
    claim: '12 阶、明暗成对、按可访问性调过的色板。',
    tag: '校色阶',
    inside: { label: '对比度', to: '/case/ride/audit' },
  },

  // 03 · 动效
  {
    id: 'video-shotcraft',
    name: 'video-shotcraft',
    group: 'motion',
    href: 'https://github.com/Vincentwei1021/video-shotcraft',
    repo: 'https://github.com/Vincentwei1021/video-shotcraft',
    kind: '技能',
    license: 'Apache-2.0',
    stars: '17.3k',
    claim: '124 张镜头卡 + 150 条预览，Claude Code / Codex 可用。',
    tag: '取镜头',
    inside: { label: '动效页', to: '/case/ride/motion' },
  },
  {
    id: 'motion',
    name: 'Motion',
    group: 'motion',
    href: 'https://motion.dev/',
    repo: 'https://github.com/motiondivision/motion',
    kind: '库',
    license: 'MIT',
    stars: '34.9k',
    claim: 'React / JS 动画库：布局、spring、滚动编排。',
    tag: '落成代码',
    inside: { label: '动效页', to: '/case/ride/motion' },
  },
  {
    id: 'theatre',
    name: 'Theatre.js',
    group: 'motion',
    href: 'https://www.theatrejs.com/',
    repo: 'https://github.com/theatre-js/theatre',
    kind: '工具',
    license: 'Apache-2.0',
    stars: '12.9k',
    claim: '浏览器里的关键帧编辑器，序列导出成 JSON。',
    tag: '编排',
  },
  {
    id: 'react-bits',
    name: 'React Bits',
    group: 'motion',
    href: 'https://reactbits.dev/',
    repo: 'https://github.com/DavidHDev/react-bits',
    kind: '库',
    license: '自定义',
    stars: '51.3k',
    claim: '动效组件大全：文字、背景、卡片、滚动，给源码。',
    tag: '拿组件',
  },
  {
    id: 'lottie',
    name: 'Lottie',
    group: 'motion',
    href: 'https://airbnb.io/lottie/',
    repo: 'https://github.com/airbnb/lottie-web',
    kind: '库',
    license: 'MIT',
    stars: '32.4k',
    claim: 'After Effects 动画原样落到 Web 与原生。',
    tag: '手绘动效',
  },

  // 04 · 审查
  {
    id: 'impeccable',
    name: 'Impeccable',
    group: 'review',
    href: 'https://impeccable.style/slop',
    repo: 'https://github.com/pbakaus/impeccable',
    kind: '技能',
    license: 'Apache-2.0',
    stars: '104k',
    claim: '62 条 AI 味检查 + 24 个命令，先说清再改。',
    tag: '查 AI 味',
    inside: { label: '门禁', to: '/method/process' },
  },
  {
    id: 'web-interface-guidelines',
    name: 'Web Interface Guidelines',
    group: 'review',
    href: 'https://vercel.com/design/guidelines',
    repo: 'https://github.com/vercel-labs/web-interface-guidelines',
    kind: '规范',
    license: 'MIT',
    stars: '1.1k',
    claim: '键盘、焦点、深链、降级动效的逐条清单。',
    tag: '评审清单',
  },
  {
    id: 'axe-core',
    name: 'axe-core',
    group: 'review',
    state: 'gap',
    href: 'https://github.com/dequelabs/axe-core',
    repo: 'https://github.com/dequelabs/axe-core',
    kind: '工具',
    license: 'MPL-2.0',
    stars: '7.8k',
    claim: '无障碍自动化引擎，Playwright / Storybook 都能挂。',
    tag: '查无障碍',
    inside: { label: '审计', to: '/case/ride/audit' },
  },

  // 05 · 回归
  {
    id: 'playwright',
    name: 'Playwright',
    group: 'regression',
    state: 'adopted',
    href: 'https://playwright.dev/',
    repo: 'https://github.com/microsoft/playwright',
    kind: '工具',
    license: 'Apache-2.0',
    stars: '99.4k',
    claim: '截图、点击、跨浏览器——视觉回归就靠它截。',
    tag: '锁像素',
    inside: { label: '回归', to: '/method/process' },
  },
  {
    id: 'pixelmatch',
    name: 'pixelmatch',
    group: 'regression',
    state: 'adopted',
    href: 'https://github.com/mapbox/pixelmatch',
    repo: 'https://github.com/mapbox/pixelmatch',
    kind: '库',
    license: 'ISC',
    stars: '7.0k',
    claim: '逐像素比较，0.6% 阈值那一步。',
    tag: '看差异',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    group: 'regression',
    state: 'gap',
    href: 'https://storybook.js.org/',
    repo: 'https://github.com/storybookjs/storybook',
    kind: '工具',
    license: 'MIT',
    stars: '91.5k',
    claim: '组件状态排成矩阵：hover、空态、错误态。',
    tag: '排状态',
  },

  // 06 · 代理
  {
    id: 'skills-cli',
    name: 'skills',
    group: 'agent',
    href: 'https://skills.sh/',
    repo: 'https://github.com/vercel-labs/skills',
    kind: '工具',
    license: 'MIT',
    stars: '38.3k',
    claim: 'npx skills add 一行装一个 agent 技能。',
    tag: '装技能',
  },
  {
    id: 'playwright-mcp',
    name: 'Playwright MCP',
    group: 'agent',
    href: 'https://github.com/microsoft/playwright-mcp',
    repo: 'https://github.com/microsoft/playwright-mcp',
    kind: '工具',
    license: 'Apache-2.0',
    stars: '39.2k',
    claim: '把浏览器交给 agent：打开、点击、截图。',
    tag: '给 agent 眼睛',
  },
  {
    id: 'chrome-devtools-mcp',
    name: 'Chrome DevTools MCP',
    group: 'agent',
    href: 'https://github.com/ChromeDevTools/chrome-devtools-mcp',
    repo: 'https://github.com/ChromeDevTools/chrome-devtools-mcp',
    kind: '工具',
    license: 'Apache-2.0',
    stars: '54.9k',
    claim: '性能、控制台、网络面板接进 agent。',
    tag: '给 agent 面板',
  },
];

/** 有真实截图、放在页面最上面先看的四个。 */
export const FEATURED: string[] = ['stylekit', 'impeccable', 'taste-skill', 'video-shotcraft'];

/** 图标与预览都作为模块资源打包：文件没了，构建和测试都会先炸。 */
const LOGO_FILES = import.meta.glob('../assets/res/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const PREVIEW_FILES = import.meta.glob('../assets/res/preview-*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const baseName = (file: string) => file.split('/').pop() ?? file;

const toUrlMap = (files: Record<string, string>, strip?: string) =>
  Object.fromEntries(
    Object.entries(files).map(([file, url]) => {
      const name = baseName(file).replace(/\.(png|jpe?g|webp|svg)$/i, '');
      return [strip && name.startsWith(strip) ? name.slice(strip.length) : name, url];
    }),
  );

const LOGOS = toUrlMap(LOGO_FILES);
const PREVIEWS = toUrlMap(PREVIEW_FILES, 'preview-');

/** 图标：src/assets/res/{id}.png，统一渲成白底圆角方块。 */
export const logoSrc = (id: string) => LOGOS[id] ?? '';

/** 预览图：src/assets/res/preview-{id}.jpg。 */
export const previewSrc = (id: string) => PREVIEWS[id] ?? '';

export const groupById = (id: string): ResourceGroup | undefined => GROUPS.find((group) => group.id === id);

export const resourcesOf = (id: GroupId): Resource[] => RESOURCES.filter((resource) => resource.group === id);

export const resourceById = (id: string): Resource | undefined => RESOURCES.find((resource) => resource.id === id);

export const ADOPTED = RESOURCES.filter((resource) => resource.state === 'adopted');

/** 抓取日期与总数，页面上直接引用，避免文案和数组对不上。 */
export const CAPTURED_AT = '2026-11-06';
