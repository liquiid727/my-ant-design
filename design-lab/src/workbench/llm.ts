/**
 * 文本模型调用：把结构配方映射成页面配方。
 * 只做"提议"，产出一律要过 validateRecipe 才能算数。
 */
import type { TextProvider } from './provider';

type Message = { role: 'system' | 'user'; content: string };

export const chatComplete = async (settings: TextProvider, messages: Message[], jsonMode = true): Promise<string> => {
  if (!settings.apiKey.trim()) throw new Error('还没有填 API Key');
  const endpoint = `${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const send = async (useJsonMode: boolean) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey.trim()}` },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        temperature: 0.2,
        messages,
        ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(payload.error?.message ?? `模型返回 ${response.status}`);
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('模型没有返回内容');
    return content;
  };

  try {
    return await send(jsonMode);
  } catch (error) {
    // 有些供应商不支持 response_format，退回普通模式再试一次
    if (jsonMode) return send(false);
    throw error;
  }
};

/** 从可能夹着说明文字的输出里抠出 JSON。 */
export const extractJson = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('模型输出里没有 JSON');
  return JSON.parse(candidate.slice(start, end + 1));
};
