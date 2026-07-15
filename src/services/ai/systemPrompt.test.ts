import { describe, expect, it } from 'vitest';
import { buildSystemPrompt } from './systemPrompt';
import { serializeThemeContext } from './themeContext';

describe('AI prompt and theme context', () => {
  it('includes Chinese design language and examples', () => {
    const prompt = buildSystemPrompt({ locale: 'zh-CN' });
    expect(prompt).toContain('Ant Design 设计语言');
    expect(prompt).toContain('## 示例');
  });

  it('includes English design language and examples', () => {
    const prompt = buildSystemPrompt({ locale: 'en-US' });
    expect(prompt).toContain('Ant Design Design Language');
    expect(prompt).toContain('## Examples');
  });

  it('keeps radius constraints explicit and base prompt size reasonable', () => {
    const prompt = buildSystemPrompt({ locale: 'en-US' });
    expect(prompt).toContain('Ensure border radius values follow XS < SM < Base < LG');
    expect(prompt.length).toBeLessThan(12000);
  });

  it('serializes empty and populated overrides', () => {
    expect(serializeThemeContext('default', {})).toContain('"overrides":{}');
    const context = serializeThemeContext('mui', { token: { colorPrimary: '#111111' }, components: { Button: { borderRadius: 12 } } });
    expect(context).toContain('"preset":"mui"');
    expect(context).toContain('colorPrimary');
    expect(context).toContain('Button');
  });
});
