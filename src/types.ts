import type { ThemeConfig as AntThemeConfig } from 'antd';

export type ThemeAlgorithmName = 'default' | 'dark' | 'compact' | 'darkCompact';

export type ThemeConfig = {
  id: string;
  name: string;
  algorithm: ThemeAlgorithmName;
  token: NonNullable<AntThemeConfig['token']>;
  components: NonNullable<AntThemeConfig['components']>;
  updatedAt: string;
};

export type ThemeRecord = {
  id: string;
  name: string;
  config: ThemeConfig;
  builtIn?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ThemeVersion = {
  id: string;
  themeId: string;
  version: number;
  message?: string;
  config: ThemeConfig;
  createdAt: string;
};

export type ThemeDiff = {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
};

export type LLMProvider =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'deepseek'
  | 'qwen'
  | 'openrouter'
  | 'custom';

export type LLMConfig = {
  provider: LLMProvider;
  baseURL: string;
  apiKey: string;
  model: string;
};

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  theme?: ThemeConfig;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ChatChunk = {
  content: string;
  done?: boolean;
};

export type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export type TokenMeta = {
  name: string;
  type: 'color' | 'number' | 'string';
  default: string | number;
  min?: number;
  max?: number;
  group: string;
  description: string;
};

