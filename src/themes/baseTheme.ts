import { useMemo } from 'react';
import type { ConfigProviderProps, ThemeConfig } from 'antd';
import { theme } from 'antd';
import { DEFAULT_COLOR } from './official';

const previewThemeComponents: NonNullable<ThemeConfig['components']> = {
  Layout: {
    bodyBg: '#f5f8ff',
    footerBg: '#f5f8ff',
    headerBg: '#ffffff',
    headerColor: 'rgba(0, 0, 0, 0.88)',
    siderBg: '#ffffff',
    triggerBg: '#f0f5ff',
    triggerColor: 'rgba(0, 0, 0, 0.88)',
  },
  Menu: { activeBarBorderWidth: 0, itemBg: 'transparent', subMenuItemBg: 'transparent' },
  Button: {}, Alert: {}, Modal: {}, Card: {}, Tooltip: {}, Checkbox: {}, Radio: {},
  Select: {}, Input: {}, Switch: {}, Steps: {}, Slider: {}, ColorPicker: {}, Notification: {},
  Progress: {
    circleTextColor: 'rgba(0, 0, 0, 0.88)',
    defaultColor: DEFAULT_COLOR,
    remainingColor: 'rgba(0, 0, 0, 0.06)',
  },
};

const componentDefaults: Omit<ConfigProviderProps, 'theme'> = {
  wave: {}, app: {}, card: {}, modal: {}, button: {}, alert: {}, colorPicker: {}, checkbox: {},
  dropdown: {}, select: {}, datePicker: {}, input: {}, inputNumber: {}, popover: {}, tooltip: {},
  notification: {}, switch: {}, radio: {}, segmented: {}, progress: {},
};

const createBaseTheme = (dark: boolean): ConfigProviderProps => ({
  ...componentDefaults,
  theme: {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: dark
      ? {
          ...previewThemeComponents,
          Layout: {
            bodyBg: '#050505', footerBg: '#050505', headerBg: '#111111',
            headerColor: 'rgba(255, 255, 255, 0.88)', siderBg: '#050505',
            triggerBg: '#111111', triggerColor: 'rgba(255, 255, 255, 0.88)',
          },
          Menu: {
            darkItemBg: 'transparent', darkItemColor: 'rgba(255, 255, 255, 0.68)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.08)', darkItemHoverColor: '#fff',
            darkItemSelectedBg: 'rgba(22, 119, 255, 0.28)', darkItemSelectedColor: '#fff',
            darkSubMenuItemBg: 'transparent',
          },
          Progress: {
            circleTextColor: 'rgba(255, 255, 255, 0.88)', defaultColor: DEFAULT_COLOR,
            remainingColor: 'rgba(255, 255, 255, 0.12)',
          },
        }
      : previewThemeComponents,
  },
});

export const useDefaultTheme = () => useMemo(() => createBaseTheme(false), []);
export const useDarkTheme = () => useMemo(() => createBaseTheme(true), []);

export const useCoffeeTheme = () =>
  useMemo<ConfigProviderProps>(
    () => ({
      ...componentDefaults,
      theme: {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#312721', colorSuccess: '#6f8f5f', colorWarning: '#b7791f',
          colorError: '#b94a48', colorTextBase: '#2a231d', colorBgBase: '#fcfaf8',
          borderRadius: 4, fontSize: 14,
        },
        components: {
          Button: { borderRadius: 4, fontWeight: 500, primaryShadow: 'none' },
          Card: { borderRadiusLG: 4, colorBgContainer: '#fcfaf8' },
          Input: { borderRadius: 4, activeBorderColor: '#312721', hoverBorderColor: '#312721' },
        },
      },
    }),
    [],
  );
