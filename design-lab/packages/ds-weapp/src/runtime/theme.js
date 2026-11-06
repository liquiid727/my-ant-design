/**
 * 原生能力运行时：CSS 变量管不到导航栏 / tabBar，这里补上。
 * 颜色从生成的 tokens.ts 里取，不在页面里写死。
 */

const luminance = (hex) => {
  const raw = hex.replace('#', '');
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const linear = (channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

/** 导航栏前景只接受 #ffffff / #000000，按背景亮度选。 */
export const frontColorFor = (background) => (luminance(background) > 0.5 ? '#000000' : '#ffffff');

export const applyNavigationTheme = ({ background, foreground, duration = 0 }) => {
  if (!background) return;
  wx.setNavigationBarColor({
    backgroundColor: background,
    frontColor: foreground || frontColorFor(background),
    animation: { duration, timingFunc: 'easeIn' },
  });
};

export const currentSystemTheme = () => {
  try {
    return wx.getSystemInfoSync().theme || 'light';
  } catch (error) {
    return 'light';
  }
};

export const watchSystemTheme = (handler) => {
  if (!wx.onThemeChange) return () => {};
  wx.onThemeChange(handler);
  return () => {
    if (wx.offThemeChange) wx.offThemeChange(handler);
  };
};
