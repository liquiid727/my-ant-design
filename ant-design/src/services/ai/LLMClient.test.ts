import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LLMConfig } from '../../types';
import { LLMClient } from './LLMClient';

const makeConfig = (overrides: Partial<LLMConfig> = {}): LLMConfig => ({
  provider: 'openai',
  baseURL: 'https://api.openai.com/v1',
  apiKey: 'sk-test',
  model: 'gpt6.1',
  locale: 'en-US',
  ...overrides,
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('LLMClient.listModels', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads OpenAI-compatible model ids, deduped and sorted', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ data: [{ id: 'gpt6.1' }, { id: 'gpt-5.5' }, { id: 'gpt6.1' }] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await new LLMClient(makeConfig()).listModels();

    expect(result).toEqual({ ok: true, data: ['gpt-5.5', 'gpt6.1'] });
    expect(fetchMock).toHaveBeenCalledWith('https://api.openai.com/v1/models', expect.objectContaining({ method: 'GET' }));
  });

  it('strips the models/ prefix from Gemini responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      models: [{ name: 'models/gemini-1.5-flash' }, { name: 'models/gemini-1.5-pro' }],
    })));

    const result = await new LLMClient(
      makeConfig({ provider: 'gemini', baseURL: 'https://generativelanguage.googleapis.com/v1beta' }),
    ).listModels();

    expect(result).toEqual({ ok: true, data: ['gemini-1.5-flash', 'gemini-1.5-pro'] });
  });

  it('treats an empty list as an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ data: [] })));

    const result = await new LLMClient(makeConfig()).listModels();

    expect(result.ok).toBe(false);
  });

  it('surfaces HTTP failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: 'nope' }, 401)));

    const result = await new LLMClient(makeConfig()).listModels();

    expect(result).toEqual({ ok: false, error: 'API Key 无效或无权限。', status: 401 });
  });

  it('explains network and CORS failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    const result = await new LLMClient(makeConfig()).listModels();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('CORS');
  });
});
