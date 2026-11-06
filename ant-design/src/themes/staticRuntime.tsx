import { theme as antdTheme } from 'antd';
import type { ThemeConfig as AntThemeConfig } from 'antd';
import { useMemo } from 'react';
import type { ThemeAlgorithmName, ThemeConfig } from '../types';
import { createThemeRuntime } from './runtime';
import type { ThemeRuntimeComponent } from './types';

const algorithmFor = (name: ThemeAlgorithmName): AntThemeConfig['algorithm'] => {
  switch (name) {
    case 'dark':
      return antdTheme.darkAlgorithm;
    case 'compact':
      return antdTheme.compactAlgorithm;
    case 'darkCompact':
      return [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm];
    default:
      return antdTheme.defaultAlgorithm;
  }
};

/**
 * 把一份静态 ThemeConfig 包成 registry 需要的 runtime。
 * 必须 useMemo：runtime 会在每次 render 里比较 baseConfig.theme 的引用，
 * 每次返回新对象会让 onResolvedTheme 反复触发。
 */
export const createStaticRuntime = (config: ThemeConfig): ThemeRuntimeComponent => {
  const useStaticTheme = () =>
    useMemo(
      () => ({
        theme: {
          algorithm: algorithmFor(config.algorithm),
          token: config.token,
          components: config.components,
        },
      }),
      [],
    );

  return createThemeRuntime(config.id, config.name, useStaticTheme);
};
