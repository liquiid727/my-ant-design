import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeApiKey } from '../services/storage';

describe('settingsStore locale migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('defaults locale from navigator language', async () => {
    vi.stubGlobal('navigator', { language: 'zh-CN' });
    const { useSettingsStore } = await import('./settingsStore');
    expect(useSettingsStore.getState().llmConfig.locale).toBe('zh-CN');
  });

  it('adds locale for old localStorage configs', async () => {
    localStorage.setItem('ts_settings_llm', JSON.stringify({ provider: 'openai', baseURL: 'x', apiKey: encodeApiKey('sk-test'), model: 'm' }));
    const { useSettingsStore } = await import('./settingsStore');
    expect(useSettingsStore.getState().llmConfig.locale).toMatch(/zh-CN|en-US/);
    expect(useSettingsStore.getState().llmConfig.apiKey).toBe('sk-test');
  });
});
