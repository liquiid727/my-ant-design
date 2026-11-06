import { theme } from 'antd';
import { useLayoutEffect } from 'react';

/**
 * Ant Design keeps its CSS variables scoped to a hashed class, so a static
 * stylesheet cannot read them. This publishes the resolved tokens on :root as
 * `--studio-*` variables, which is what `styles.css` consumes. The fallback in
 * every `var()` keeps the first paint identical before the effect runs.
 */
const tokenVars = (token: ReturnType<typeof theme.useToken>['token']) =>
  ({
    '--studio-color-primary': token.colorPrimary,
    '--studio-color-primary-hover': token.colorPrimaryHover,
    '--studio-color-primary-bg': token.colorPrimaryBg,
    '--studio-color-primary-bg-hover': token.colorPrimaryBgHover,
    '--studio-color-primary-border': token.colorPrimaryBorder,
    '--studio-color-success': token.colorSuccess,
    '--studio-color-success-bg': token.colorSuccessBg,
    '--studio-color-success-border': token.colorSuccessBorder,
    '--studio-color-success-text': token.colorSuccessText,
    '--studio-color-warning': token.colorWarning,
    '--studio-color-warning-bg': token.colorWarningBg,
    '--studio-color-warning-border': token.colorWarningBorder,
    '--studio-color-warning-text': token.colorWarningText,
    '--studio-color-error': token.colorError,
    '--studio-color-error-bg': token.colorErrorBg,
    '--studio-color-error-text': token.colorErrorText,
    '--studio-color-purple': token.purple,
    '--studio-color-text': token.colorText,
    '--studio-color-text-secondary': token.colorTextSecondary,
    '--studio-color-text-tertiary': token.colorTextTertiary,
    '--studio-color-text-quaternary': token.colorTextQuaternary,
    '--studio-color-bg-layout': token.colorBgLayout,
    '--studio-color-bg-container': token.colorBgContainer,
    '--studio-color-bg-elevated': token.colorBgElevated,
    '--studio-color-fill-quaternary': token.colorFillQuaternary,
    '--studio-color-border': token.colorBorder,
    '--studio-color-border-secondary': token.colorBorderSecondary,
    '--studio-color-split': token.colorSplit,
    '--studio-radius': `${token.borderRadius}px`,
    '--studio-radius-sm': `${token.borderRadiusSM}px`,
    '--studio-radius-lg': `${token.borderRadiusLG}px`,
    '--studio-font-family': token.fontFamily,
  }) satisfies Record<string, string>;

export function StudioThemeVars({ dark }: { dark: boolean }) {
  const { token } = theme.useToken();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = tokenVars(token);
    Object.entries(vars).forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });
    // color-scheme 挂在 studio 自己的根节点上：被 design-lab 挂载时不能改 html，
    // 否则会盖掉 lab 的暗色外壳。
    root.querySelector('.studio-root')?.setAttribute('data-scheme', dark ? 'dark' : 'light');
  }, [token, dark]);

  return null;
}
