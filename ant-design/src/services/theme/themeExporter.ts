import type { ThemeConfig, ThemeOverrides } from '../../types';

type ExportContext = {
  basePresetId: string;
  overrides: ThemeOverrides;
};

const flatten = (input: Record<string, unknown>, prefix = ''): Record<string, unknown> =>
  Object.entries(input).reduce<Record<string, unknown>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flatten(value as Record<string, unknown>, nextKey));
    } else {
      acc[nextKey] = value;
    }
    return acc;
  }, {});

const kebab = (value: string) => value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/\./g, '-');

export const exportTheme = (
  theme: ThemeConfig,
  format: 'ts' | 'json' | 'design-token' | 'tailwind' | 'css',
  context?: ExportContext,
) => {
  if (format === 'json') {
    return JSON.stringify(
      context
        ? {
            schemaVersion: 2,
            name: theme.name,
            basePresetId: context.basePresetId,
            overrides: context.overrides,
            resolvedTheme: theme,
          }
        : theme,
      null,
      2,
    );
  }

  if (format === 'ts') {
    return `import type { ThemeConfig } from 'antd';\n\nexport const themeConfig: ThemeConfig = ${JSON.stringify(
      {
        token: theme.token,
        components: theme.components,
      },
      null,
      2,
    )};\n\nexport default themeConfig;\n`;
  }

  const flat = flatten({ token: theme.token, components: theme.components });

  if (format === 'design-token') return JSON.stringify(flat, null, 2);

  if (format === 'css') {
    return `:root {\n${Object.entries(flat)
      .map(([key, value]) => `  --ant-${kebab(key)}: ${String(value)};`)
      .join('\n')}\n}\n`;
  }

  const token = theme.token as Record<string, unknown>;
  return `import type { Config } from 'tailwindcss';\n\nconst config: Config = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '${token.colorPrimary ?? '#1677FF'}',\n        success: '${token.colorSuccess ?? '#52c41a'}',\n        warning: '${token.colorWarning ?? '#faad14'}',\n        danger: '${token.colorError ?? '#ff4d4f'}',\n      },\n      borderRadius: {\n        DEFAULT: '${token.borderRadius ?? 6}px',\n      },\n      fontSize: {\n        base: '${token.fontSize ?? 14}px',\n      },\n      spacing: {\n        DEFAULT: '${token.padding ?? 16}px',\n      },\n    },\n  },\n};\n\nexport default config;\n`;
};
