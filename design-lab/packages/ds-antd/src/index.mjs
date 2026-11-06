/**
 * ds-antd：把 design-lab 的 semantic token 投影成 antd ThemeConfig。
 *
 * 这是一次「投影」，不是翻译。design-lab 的 92 个 semantic token 里只有二十来个
 * 该进入后台；其余（route.* / transaction.* / display / metric）属于品牌产品 UI，
 * 强行映射只会污染 antd 的语义。
 *
 * 三条边界：
 *  1. 只映射品牌能表达的东西：色 / 圆角 / 字体 / 间距 / 动效 / 阴影；
 *  2. 不映射桌面密度（antd 的 controlHeight 由后台自己决定，见 README）；
 *  3. 不读产品语义（route.* / transaction.*），所以 ride 和 ledger 得到同一份主题。
 */

const isColor = (value) => Boolean(value) && typeof value === 'object' && typeof value.hex === 'string';

/** DTCG 颜色 → CSS 字符串；带透明度时输出 rgba，避免 hex 丢 alpha。 */
const color = (value) => {
  if (!isColor(value)) return undefined;
  if (value.alpha >= 1) return value.hex;
  const [r, g, b] = value.components.map((channel) => Math.round(channel * 255));
  return `rgba(${r}, ${g}, ${b}, ${value.alpha})`;
};

const px = (value) => (value && typeof value === 'object' && typeof value.value === 'number' ? value.value : undefined);

/** antd 的 motionDuration* 是 CSS 时长字符串（'0.22s'），不是毫秒数字。 */
const seconds = (value) => {
  const number = px(value);
  if (typeof number !== 'number') return undefined;
  return `${Number((number / 1000).toFixed(3))}s`;
};

/** 只保留整数像素：antd 的间距/圆角不接受小数。 */
const pxInt = (value) => {
  const number = px(value);
  return typeof number === 'number' ? Math.round(number) : undefined;
};

const fontFamily = (value) =>
  Array.isArray(value) ? value.map((family) => (family.includes(' ') ? `"${family}"` : family)).join(', ') : undefined;

const bezier = (value) => (Array.isArray(value) ? `cubic-bezier(${value.join(', ')})` : undefined);

const shadow = (value) => {
  if (!value || typeof value !== 'object' || !isColor(value.color)) return undefined;
  const offsetX = px(value.offsetX) ?? 0;
  const offsetY = px(value.offsetY) ?? 0;
  const blur = px(value.blur) ?? 0;
  const spread = px(value.spread) ?? 0;
  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color(value.color)}`;
};

/**
 * semantic → antd 的映射表。每条都记录「为什么」，
 * 因为这张表本身就是两个设计系统之间的契约。
 */
export const TOKEN_MAP = [
  // 颜色：antd 的 seed + alias
  { token: 'colorPrimary', path: 'color.action.primary', read: color },
  { token: 'colorTextLightSolid', path: 'color.action.on-primary', read: color },
  { token: 'colorBgLayout', path: 'color.surface.canvas', read: color },
  { token: 'colorBgContainer', path: 'color.surface.raised', read: color },
  { token: 'colorBgElevated', path: 'color.surface.raised', read: color },
  { token: 'colorText', path: 'color.ink.primary', read: color },
  { token: 'colorTextSecondary', path: 'color.ink.secondary', read: color },
  { token: 'colorTextTertiary', path: 'color.ink.tertiary', read: color },
  { token: 'colorBorder', path: 'color.border.strong', read: color },
  { token: 'colorBorderSecondary', path: 'color.border.subtle', read: color },
  { token: 'colorSplit', path: 'color.border.subtle', read: color },
  { token: 'colorSuccess', path: 'color.status.success', read: color },
  { token: 'colorSuccessBg', path: 'color.status.success-soft', read: color },
  { token: 'colorWarning', path: 'color.status.warning', read: color },
  { token: 'colorWarningBg', path: 'color.status.warning-soft', read: color },
  { token: 'colorError', path: 'color.status.danger', read: color },
  { token: 'colorErrorBg', path: 'color.status.danger-soft', read: color },
  { token: 'colorInfo', path: 'color.status.info', read: color },
  { token: 'colorInfoBg', path: 'color.status.info-soft', read: color },
  { token: 'colorLink', path: 'color.status.info', read: color },

  // 形状与排版
  { token: 'borderRadius', path: 'radius.control', read: pxInt },
  { token: 'borderRadiusLG', path: 'radius.card', read: pxInt },
  { token: 'fontFamily', path: 'type.body.family', read: fontFamily },
  { token: 'fontFamilyCode', path: 'type.data.family', read: fontFamily },
  { token: 'fontSize', path: 'type.body.size', read: pxInt },

  // 间距
  { token: 'padding', path: 'space.gutter', read: pxInt },
  { token: 'paddingSM', path: 'space.inline', read: pxInt },
  { token: 'paddingLG', path: 'space.page', read: pxInt },
  { token: 'margin', path: 'space.gutter', read: pxInt },
  { token: 'marginSM', path: 'space.stack', read: pxInt },
  { token: 'marginLG', path: 'space.section', read: pxInt },

  // 动效
  { token: 'motionDurationFast', path: 'motion.duration.fast', read: seconds },
  { token: 'motionDurationMid', path: 'motion.duration.base', read: seconds },
  { token: 'motionDurationSlow', path: 'motion.duration.slow', read: seconds },
  { token: 'motionEaseInOut', path: 'motion.easing.standard', read: bezier },

  // 阴影
  { token: 'boxShadow', path: 'elevation.raised', read: shadow },
  { token: 'boxShadowSecondary', path: 'elevation.overlay', read: shadow },
];

/**
 * 组件级覆盖：只动「品牌身份绕不过去」的地方，同样逐条声明。
 */
export const COMPONENT_MAP = [
  { component: 'Button', token: 'borderRadius', path: 'radius.control', read: pxInt },
  { component: 'Button', token: 'controlHeight', path: 'size.control-height', read: pxInt },
  { component: 'Card', token: 'borderRadiusLG', path: 'radius.card', read: pxInt },
  { component: 'Card', token: 'paddingLG', path: 'space.page', read: pxInt },
  { component: 'Input', token: 'borderRadius', path: 'radius.control', read: pxInt },
  { component: 'Input', token: 'controlHeight', path: 'size.control-height', read: pxInt },
  { component: 'Select', token: 'borderRadius', path: 'radius.control', read: pxInt },
  { component: 'Select', token: 'optionSelectedBg', path: 'color.surface.accent-soft', read: color },
  { component: 'Modal', token: 'borderRadiusLG', path: 'radius.card', read: pxInt },
  { component: 'Table', token: 'headerBg', path: 'color.surface.sunken', read: color },
  { component: 'Table', token: 'rowHoverBg', path: 'color.surface.canvas', read: color },
  { component: 'Table', token: 'borderColor', path: 'color.border.subtle', read: color },
  { component: 'Menu', token: 'itemSelectedBg', path: 'color.surface.accent-soft', read: color },
  { component: 'Menu', token: 'itemBorderRadius', path: 'radius.control', read: pxInt },
];

/**
 * 不进入 antd 的语义族，逐族写明理由。
 * 新增语义键若落不进任何一条，编译会失败——这样「不映射」也是一个决定，而不是遗漏。
 */
export const EXCLUDED = [
  { prefix: 'color.surface.', reason: 'antd 只用 canvas / raised / sunken / accent-soft；反白表面由 colorBgSpotlight 派生' },
  { prefix: 'color.ink.', reason: 'antd 只用 primary / secondary / tertiary；反白文字由 colorTextLightSolid 派生' },
  { prefix: 'color.action.', reason: 'hover / pressed 由 antd 算法派生；次按钮层级用 antd 自己的 default / text 按钮' },
  { prefix: 'color.border.', reason: '焦点环由 antd 的 colorPrimaryBorder 派生' },
  { prefix: 'color.overlay.', reason: '遮罩由 antd 的 colorBgMask 派生' },
  { prefix: 'radius.', reason: 'sheet / pill 在桌面端没有对应控件' },
  { prefix: 'size.', reason: '触控最小尺寸与移动导航高度只属于品牌产品 UI' },
  { prefix: 'type.display.', reason: '展示排版：后台用 antd 自己的 fontSize 层级' },
  { prefix: 'type.title.', reason: '品牌产品 UI 的标题族，后台用 Card / Typography 的层级' },
  { prefix: 'type.heading.', reason: '品牌产品 UI 的标题族，后台用 Card / Typography 的层级' },
  { prefix: 'type.caption.', reason: '后台用 colorTextSecondary + fontSizeSM 表达' },
  { prefix: 'type.label.', reason: '后台标签用 antd 的 label 排版' },
  { prefix: 'type.metric.', reason: '指标大字只属于品牌产品 UI' },
  { prefix: 'type.body.', reason: '后台只用 family / size；行高、字重、字距交给 antd' },
  { prefix: 'type.data.', reason: '后台只用 family；等宽字体的字号沿用 antd' },
  { prefix: 'motion.duration.', reason: 'sheet / celebrate 是品牌动效；后台只用 fast / base / slow' },
  { prefix: 'motion.easing.', reason: 'enter / spring 属于品牌动效；后台沿用 antd 的 easing' },
  { prefix: 'elevation.', reason: 'subtle 在 antd 里由边框承担' },
];

const MAPPED_PATHS = new Set([...TOKEN_MAP, ...COMPONENT_MAP].map((entry) => entry.path));

/**
 * 覆盖率：语义词汇表里的每个键，要么被映射，要么被显式排除。
 * 返回 unclassified 时说明有人加了语义键却没有决定它在 antd 里怎么办。
 */
export const classifyVocabulary = (paths) => {
  const excluded = [];
  const unclassified = [];

  for (const path of paths) {
    if (MAPPED_PATHS.has(path)) continue;
    const rule = EXCLUDED.find((entry) => entry.prefix && path.startsWith(entry.prefix));
    if (rule) excluded.push({ path, reason: rule.reason });
    else unclassified.push(path);
  }

  return {
    total: paths.length,
    mapped: paths.length - excluded.length - unclassified.length,
    excluded,
    unclassified,
  };
};

const componentOverrides = (read) => {
  const overrides = {};

  for (const { component, token, path, read: transform } of COMPONENT_MAP) {
    const value = read(path, transform);
    if (value === undefined || value === null) continue;
    overrides[component] = { ...overrides[component], [token]: value };
  }

  // antd 的主按钮默认带一层蓝调阴影，配纯黑/纯白主色会脏。
  overrides.Button = { ...overrides.Button, primaryShadow: 'none', defaultShadow: 'none' };
  return overrides;
};

const compact = (record) =>
  Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null));

/**
 * 投影一个排列（brand × theme）到 antd ThemeConfig。
 * `missing` 是映射表里找不到的 token 路径——空数组才代表这份主题是完整的。
 */
export const projectTheme = (set) => {
  const read = (path, transform) => {
    const entry = set.byPath.get(path);
    return entry ? transform(entry.value) : undefined;
  };

  const token = {};
  const missing = [];

  for (const { token: key, path, read: transform } of TOKEN_MAP) {
    const value = read(path, transform);
    if (value === undefined || value === null) missing.push(path);
    else token[key] = value;
  }

  const components = Object.entries(componentOverrides(read)).reduce((acc, [name, overrides]) => {
    const filled = compact(overrides);
    if (Object.keys(filled).length > 0) acc[name] = filled;
    return acc;
  }, {});

  const config = {
    schemaVersion: 1,
    id: `${set.brand}.${set.theme}`,
    name: `${set.latin} · ${set.theme}`,
    algorithm: set.theme === 'dark' ? 'dark' : 'default',
    token,
    components,
  };

  return { config, missing };
};

export const toAntdTheme = (set) => projectTheme(set).config;
