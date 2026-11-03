import { useEffect, useMemo } from 'react';
import type { ConfigProviderProps, ThemeConfig as AntThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig, ThemeOverrides } from '../types';
import type { ThemeRuntimeComponent } from './types';

type UseTheme = () => ConfigProviderProps;

const mergeTheme = (
  base: AntThemeConfig | undefined,
  overrides: ThemeOverrides,
): AntThemeConfig => {
  const componentKeys = new Set([
    ...Object.keys(base?.components ?? {}),
    ...Object.keys(overrides.components ?? {}),
  ]);
  const components = Object.fromEntries(
    [...componentKeys].map((key) => [
      key,
      {
        ...((base?.components?.[key as keyof typeof base.components] ?? {}) as object),
        ...((overrides.components?.[key as keyof typeof overrides.components] ?? {}) as object),
      },
    ]),
  ) as AntThemeConfig['components'];

  return {
    ...base,
    token: { ...base?.token, ...overrides.token },
    components,
  };
};

const isDarkAlgorithm = (algorithm: AntThemeConfig['algorithm']) => {
  const algorithms = Array.isArray(algorithm) ? algorithm : algorithm ? [algorithm] : [];
  return algorithms.includes(antdTheme.darkAlgorithm);
};

export const createThemeRuntime = (id: string, name: string, useTheme: UseTheme): ThemeRuntimeComponent => {
  const ThemeRuntime: ThemeRuntimeComponent = ({ overrides, onResolvedTheme, children }) => {
    const baseConfig = useTheme();
    const mergedTheme = useMemo(
      () => mergeTheme(baseConfig.theme, overrides),
      [baseConfig.theme, overrides],
    );
    const config = useMemo<ConfigProviderProps>(
      () => ({ ...baseConfig, theme: mergedTheme }),
      [baseConfig, mergedTheme],
    );

    useEffect(() => {
      if (!onResolvedTheme) return;
      onResolvedTheme({
        id,
        name,
        algorithm: isDarkAlgorithm(mergedTheme.algorithm) ? 'dark' : 'default',
        token: mergedTheme.token ?? {},
        components: mergedTheme.components ?? {},
        updatedAt: new Date().toISOString(),
      });
    }, [mergedTheme, onResolvedTheme]);

    return children(config);
  };

  ThemeRuntime.displayName = `${name.replace(/\s+/g, '')}ThemeRuntime`;
  return ThemeRuntime;
};

export const runtimeLoader = (
  id: string,
  name: string,
  loader: () => Promise<{ default: UseTheme }>,
) => async () => {
  const module = await loader();
  return { default: createThemeRuntime(id, name, module.default) };
};
