import { create } from 'zustand';
import type { LLMConfig } from '../types';
import { decodeApiKey, encodeApiKey, StorageService } from '../services/storage';

const defaultConfig: LLMConfig = {
  provider: 'openai',
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-5.5',
};

type SettingsState = {
  llmConfig: LLMConfig;
  setLLMConfig: (config: Partial<LLMConfig>) => void;
  isConfigured: () => boolean;
};

const loadConfig = (): LLMConfig => {
  const stored = StorageService.get<LLMConfig>('settings_llm', defaultConfig);
  return { ...stored, apiKey: decodeApiKey(stored.apiKey) };
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  llmConfig: loadConfig(),

  setLLMConfig: (config) =>
    set((state) => {
      const llmConfig = { ...state.llmConfig, ...config };
      StorageService.set('settings_llm', { ...llmConfig, apiKey: encodeApiKey(llmConfig.apiKey) });
      return { llmConfig };
    }),

  isConfigured: () => {
    const config = get().llmConfig;
    return Boolean(config.baseURL && config.apiKey && config.model);
  },
}));
