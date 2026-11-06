/**
 * 可访问性体检：对比度是 token 层的属性，不是页面层的事后检查。
 * 每一条配对都在这里声明，编译时算一次，lint 再用同一份结果把门。
 */

export const CONTRAST_PAIRS = [
  { id: 'ink-primary.canvas', fg: 'color.ink.primary', bg: 'color.surface.canvas', min: 4.5, note: '正文 / 画布' },
  { id: 'ink-secondary.canvas', fg: 'color.ink.secondary', bg: 'color.surface.canvas', min: 4.5, note: '次要正文 / 画布' },
  { id: 'ink-tertiary.canvas', fg: 'color.ink.tertiary', bg: 'color.surface.canvas', min: 4.5, note: '辅助文字 / 画布' },
  { id: 'ink-primary.raised', fg: 'color.ink.primary', bg: 'color.surface.raised', min: 4.5, note: '正文 / 卡片' },
  { id: 'ink-primary.accent-soft', fg: 'color.ink.primary', bg: 'color.surface.accent-soft', min: 4.5, note: '正文 / 品牌浅底' },
  { id: 'on-primary.primary', fg: 'color.action.on-primary', bg: 'color.action.primary', min: 4.5, note: '主按钮文字' },
  { id: 'on-secondary.secondary', fg: 'color.action.on-secondary', bg: 'color.action.secondary', min: 4.5, note: '次按钮文字' },
  { id: 'ink-inverse.inverse', fg: 'color.ink.inverse', bg: 'color.surface.inverse', min: 4.5, note: '反白文字' },
  { id: 'status-success.canvas', fg: 'color.status.success', bg: 'color.surface.canvas', min: 4.5, note: '成功文字' },
  { id: 'status-warning.canvas', fg: 'color.status.warning', bg: 'color.surface.canvas', min: 4.5, note: '警告文字' },
  { id: 'status-danger.canvas', fg: 'color.status.danger', bg: 'color.surface.canvas', min: 4.5, note: '危险文字' },
  { id: 'status-info.canvas', fg: 'color.status.info', bg: 'color.surface.canvas', min: 4.5, note: '信息文字' },
  { id: 'ink-primary.warning-soft', fg: 'color.ink.primary', bg: 'color.status.warning-soft', min: 4.5, note: '警告底文字' },
  { id: 'ink-primary.danger-soft', fg: 'color.ink.primary', bg: 'color.status.danger-soft', min: 4.5, note: '危险底文字' },
  { id: 'border-focus.canvas', fg: 'color.border.focus', bg: 'color.surface.canvas', min: 3, note: '焦点框（UI 元素）' },
];

const channelToLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

const luminance = (color) => {
  const [r, g, b] = color.components.map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const composite = (fg, bg) => {
  const alpha = fg.alpha ?? 1;
  if (alpha >= 1) return fg;
  return {
    ...fg,
    alpha: 1,
    components: fg.components.map((channel, index) => channel * alpha + bg.components[index] * (1 - alpha)),
  };
};

export const contrastRatio = (fg, bg) => {
  const front = composite(fg, bg);
  const [light, dark] = [luminance(front), luminance(bg)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

export const runContrast = (set) => {
  const results = [];
  for (const pair of CONTRAST_PAIRS) {
    const fg = set.byPath.get(pair.fg);
    const bg = set.byPath.get(pair.bg);
    if (!fg || !bg) {
      results.push({ ...pair, ratio: null, pass: false, reason: '缺少 token' });
      continue;
    }
    if (fg.type !== 'color' || bg.type !== 'color') {
      results.push({ ...pair, ratio: null, pass: false, reason: '类型不是 color' });
      continue;
    }
    const ratio = contrastRatio(fg.value, bg.value);
    results.push({
      ...pair,
      fgValue: fg.value.hex,
      bgValue: bg.value.hex,
      ratio: Number(ratio.toFixed(2)),
      pass: ratio >= pair.min,
    });
  }
  return results;
};
