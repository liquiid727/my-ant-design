import type { ChatChunk, ChatMessage, LLMConfig, Result } from '../../types';
import { buildSystemPrompt } from './systemPrompt';

type ChatParams = {
  messages: ChatMessage[];
};

const providerPaths: Record<LLMConfig['provider'], string> = {
  openai: '/chat/completions',
  deepseek: '/chat/completions',
  qwen: '/chat/completions',
  openrouter: '/chat/completions',
  custom: '/chat/completions',
  claude: '/messages',
  gemini: '',
};

const trimSlash = (value: string) => value.replace(/\/$/, '');

const parseOpenAIStream = async function* (response: Response): AsyncGenerator<ChatChunk> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const clean = line.trim();
      if (!clean.startsWith('data:')) continue;
      const payload = clean.slice(5).trim();
      if (payload === '[DONE]') {
        yield { content: '', done: true };
        return;
      }
      try {
        const json = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield { content };
      } catch {
        continue;
      }
    }
  }
};

const normalizeError = async (response: Response) => {
  if (response.status === 401) return 'API Key 无效或无权限。';
  if (response.status === 429) return '请求被限流，请稍后重试。';
  const text = await response.text().catch(() => '');
  return text || `LLM 请求失败：${response.status}`;
};

export class LLMClient {
  constructor(private readonly config: LLMConfig) {}

  async testConnection(): Promise<Result> {
    try {
      const response = await fetch(`${trimSlash(this.config.baseURL)}${providerPaths[this.config.provider]}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(this.body([{ role: 'user', content: 'Return {"ok":true}' }])),
      });

      if (!response.ok) return { ok: false, error: await normalizeError(response), status: response.status };
      return { ok: true, data: true };
    } catch {
      return {
        ok: false,
        error: '网络或 CORS 阻止了浏览器直连。请尝试 OpenRouter、自定义代理或允许 CORS 的 Base URL。',
      };
    }
  }

  async *chat(params: ChatParams): AsyncGenerator<ChatChunk> {
    const response = await this.request(params.messages);
    if (!response.ok) throw new Error(await normalizeError(response));

    if (response.body) {
      yield* parseOpenAIStream(response);
      return;
    }

    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    yield { content: json.choices?.[0]?.message?.content ?? '', done: true };
  }

  private async request(messages: ChatMessage[]) {
    const payload = [
      { role: 'system' as const, content: buildSystemPrompt() },
      ...messages.slice(-10).map((message) => ({ role: message.role, content: message.content })),
    ];

    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`${trimSlash(this.config.baseURL)}${providerPaths[this.config.provider]}`, {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(this.body(payload)),
        });
        if (response.ok || response.status !== 429) return response;
        await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2000 : 5000));
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2000 : 5000));
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('网络或 CORS 阻止了浏览器直连。请尝试 OpenRouter 或 Proxy。');
  }

  private headers(): Record<string, string> {
    if (this.config.provider === 'claude') {
      return {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      };
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  private body(messages: { role: string; content: string }[]) {
    if (this.config.provider === 'claude') {
      return {
        model: this.config.model,
        max_tokens: 1600,
        stream: true,
        system: buildSystemPrompt(),
        messages: messages.filter((message) => message.role !== 'system'),
      };
    }

    if (this.config.provider === 'gemini') {
      return {
        contents: messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
      };
    }

    return {
      model: this.config.model,
      stream: true,
      temperature: 0.4,
      messages,
    };
  }
}
