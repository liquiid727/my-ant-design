import { tokenRegistry } from '../theme/tokenRegistry';
import { designLanguage, type PromptLocale } from './designLanguage';
import { fewShotExamples } from './fewShotExamples';

const detectLocale = (): PromptLocale =>
  typeof navigator !== 'undefined' && navigator.language?.startsWith('zh') ? 'zh-CN' : 'en-US';

export type SystemPromptOptions = {
  locale?: PromptLocale;
  themeContext?: string;
};

export const buildSystemPrompt = (options: SystemPromptOptions = {}): string => {
  const locale = options.locale ?? detectLocale();

  const role = `You are an Ant Design ThemeConfig generator.
Return only JSON. Do not include markdown unless the user explicitly asks for explanation.`;

  const shape = `Allowed output shape:
{
  "algorithm": "default" | "dark" | "compact" | "darkCompact",
  "token": { "colorPrimary": "#1677FF" },
  "components": { "Button": { "borderRadius": 8 } }
}
Only include fields that change. Omit "algorithm" if unchanged.`;

  const tokens = `Allowed global tokens:
${tokenRegistry.global.map((t) => `- ${t.name}: ${t.type}`).join('\n')}

Allowed component tokens:
${Object.entries(tokenRegistry.components)
  .map(([component, list]) => `- ${component}: ${list.map((t) => t.name).join(', ')}`)
  .join('\n')}

Use valid hex colors and reasonable numeric values.`;

  const design = designLanguage[locale];
  const examples = fewShotExamples[locale];

  const parts = [role, design, shape, tokens, examples];

  if (options.themeContext) {
    parts.push(options.themeContext);
  }

  return parts.join('\n\n');
};
