import type { ThemeConfig } from '../../types';

const parseJson = (candidate: string) => {
  try {
    return JSON.parse(candidate) as Partial<ThemeConfig>;
  } catch {
    return null;
  }
};

export const extractThemeFromResponse = (text: string): Partial<ThemeConfig> | null => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const parsed = parseJson(fenced[1].trim());
    if (parsed) return parsed;
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const parsed = parseJson(text.slice(firstBrace, lastBrace + 1));
    if (parsed) return parsed;
  }

  return parseJson(text.trim());
};

