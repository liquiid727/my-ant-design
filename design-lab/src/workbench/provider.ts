/**
 * 供应商配置：生图与文本分开存、分开测。
 * Key 只写进本机 localStorage，不经过本站服务器。
 */

export type ImageProvider = {
  baseUrl: string;
  apiKey: string;
  model: string;
  size: string;
  count: number;
};

export type TextProvider = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ProviderKind = 'image' | 'text';

export const DEFAULT_IMAGE: ImageProvider = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-image-1',
  size: '1024x1024',
  count: 2,
};

export const DEFAULT_TEXT: TextProvider = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};

export const MODEL_SUGGESTIONS = ['gpt-image-1', 'gpt-2-image', 'gpt-2.5-image', 'gpt-2.6-image', 'dall-e-3'];
export const TEXT_MODEL_SUGGESTIONS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'deepseek-chat', 'qwen-plus'];
export const SIZE_SUGGESTIONS = ['1024x1024', '1024x1536', '1536x1024', '512x512'];

const IMAGE_KEY = 'design-lab:provider:image';
const TEXT_KEY = 'design-lab:provider:text';
const LEGACY_KEY = 'design-lab:image-provider';

type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeProviders = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emit = () => listeners.forEach((listener) => listener());

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 隐私模式写不进去，不影响本次会话
  }
  emit();
};

export const loadImageProvider = (): ImageProvider => {
  const current = read<ImageProvider>(IMAGE_KEY, DEFAULT_IMAGE);
  if (current.apiKey) return current;
  // 迁移旧版的单配置
  const legacy = read<Partial<ImageProvider> & { textModel?: string }>(LEGACY_KEY, {});
  return legacy.apiKey ? { ...DEFAULT_IMAGE, ...legacy, textModel: undefined } as ImageProvider : current;
};

export const saveImageProvider = (value: ImageProvider) => write(IMAGE_KEY, value);

export const loadTextProvider = (): TextProvider => {
  const current = read<TextProvider>(TEXT_KEY, DEFAULT_TEXT);
  if (current.apiKey) return current;
  const legacy = read<Partial<ImageProvider> & { textModel?: string }>(LEGACY_KEY, {});
  return legacy.apiKey
    ? { baseUrl: legacy.baseUrl ?? DEFAULT_TEXT.baseUrl, apiKey: legacy.apiKey, model: legacy.textModel || DEFAULT_TEXT.model }
    : current;
};

export const saveTextProvider = (value: TextProvider) => write(TEXT_KEY, value);

export const clearProviders = () => {
  try {
    window.localStorage.removeItem(IMAGE_KEY);
    window.localStorage.removeItem(TEXT_KEY);
  } catch {
    // ignore
  }
  emit();
};

const endpoint = (baseUrl: string, path: string) => `${baseUrl.replace(/\/+$/, '')}${path}`;

/** 从上游拉模型清单，填进下拉。 */
export const fetchModels = async (profile: { baseUrl: string; apiKey: string }): Promise<string[]> => {
  if (!profile.apiKey.trim()) throw new Error('还没有填 API Key');
  let response: Response;
  try {
    response = await fetch(endpoint(profile.baseUrl, '/models'), {
      headers: { Authorization: `Bearer ${profile.apiKey.trim()}` },
    });
  } catch (error) {
    throw new Error(`请求发不出去：${(error as Error).message}（可能是 CORS）`);
  }
  const payload = (await response.json().catch(() => ({}))) as {
    data?: { id?: string }[];
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(payload.error?.message ?? `上游返回 ${response.status}`);
  const models = (payload.data ?? []).map((item) => item.id).filter((id): id is string => Boolean(id));
  if (!models.length) throw new Error('上游没有返回模型列表');
  return models.sort();
};

export type TestResult = { ok: boolean; message: string; ms: number };

/** 连通性测试：文本走一次最小对话；生图只探 /models，不试跑生成（避免计费）。 */
export const testProvider = async (kind: ProviderKind, profile: ImageProvider | TextProvider): Promise<TestResult> => {
  const started = performance.now();
  try {
    if (!profile.apiKey.trim()) throw new Error('还没有填 API Key');

    if (kind === 'text') {
      const response = await fetch(endpoint(profile.baseUrl, '/chat/completions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${profile.apiKey.trim()}` },
        body: JSON.stringify({
          model: profile.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? `上游返回 ${response.status}`);
      return { ok: true, message: `对话可用 · ${profile.model}`, ms: Math.round(performance.now() - started) };
    }

    const models = await fetchModels(profile);
    return {
      ok: true,
      message: `连接正常 · 上游有 ${models.length} 个模型（生图不试跑，避免计费）`,
      ms: Math.round(performance.now() - started),
    };
  } catch (error) {
    return { ok: false, message: (error as Error).message, ms: Math.round(performance.now() - started) };
  }
};

type ImageResponse = {
  data?: { b64_json?: string; url?: string }[];
  error?: { message?: string };
};

export const generateImages = async (settings: ImageProvider, promptText: string): Promise<string[]> => {
  if (!settings.apiKey.trim()) throw new Error('还没有填 API Key');
  if (!promptText.trim()) throw new Error('先写一句提示词');

  let response: Response;
  try {
    response = await fetch(endpoint(settings.baseUrl, '/images/generations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey.trim()}` },
      body: JSON.stringify({
        model: settings.model.trim(),
        prompt: promptText,
        n: Math.min(4, Math.max(1, settings.count)),
        size: settings.size,
        response_format: 'b64_json',
      }),
    });
  } catch (error) {
    throw new Error(`请求发不出去：${(error as Error).message}（可能是 CORS 或网络问题）`);
  }

  const payload = (await response.json().catch(() => ({}))) as ImageResponse;
  if (!response.ok) throw new Error(payload.error?.message ?? `供应商返回 ${response.status}`);

  const images = (payload.data ?? [])
    .map((item) => (item.b64_json ? `data:image/png;base64,${item.b64_json}` : item.url ?? ''))
    .filter(Boolean);

  if (!images.length) throw new Error('供应商没有返回图片');
  return images;
};
