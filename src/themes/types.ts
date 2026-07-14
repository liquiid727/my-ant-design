import type { ComponentType, ReactNode, SVGProps } from 'react';
import type { ConfigProviderProps } from 'antd';
import type { ThemeConfig, ThemeOverrides } from '../types';

export const OFFICIAL_SOURCE_COMMIT = '9a5ca38c95b66764736853e4d0c4123484e69217';

export type ThemeRuntimeProps = {
  overrides: ThemeOverrides;
  onResolvedTheme?: (theme: ThemeConfig) => void;
  children: (config: ConfigProviderProps) => ReactNode;
};

export type ThemeRuntimeComponent = ComponentType<ThemeRuntimeProps>;

export type ThemePresetDefinition = {
  id: string;
  group: 'official' | 'custom';
  order: number;
  name: string;
  style: string;
  icon: string | ComponentType<SVGProps<SVGSVGElement>>;
  scene: {
    background: string;
    dark?: boolean;
  };
  source: {
    commit: string;
    path: string;
  };
  loadRuntime: () => Promise<{ default: ThemeRuntimeComponent }>;
  loadSource: () => Promise<string>;
};
