import { describe, expect, it } from 'vitest';
import type { ThemeConfig } from '../../types';
import { generateDesignMarkdown, type DesignDocumentContext } from './designMdGenerator';

const theme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  algorithm: 'default',
  updatedAt: '2026-07-15T00:00:00.000Z',
  token: {
    colorPrimary: '#123456',
    fontSize: 15,
    borderRadius: 10,
    padding: 18,
    apiKey: 'sentinel-api-key',
  } as ThemeConfig['token'],
  components: {
    Button: { controlHeight: 40, borderRadius: 10 },
  },
};

const context: DesignDocumentContext = {
  theme,
  preset: { id: 'default', name: 'Ant Design', style: 'Ant Design 6' },
  generatedAt: '2026-07-15T00:00:00.000Z',
  contentVersion: '0709',
  studioVersion: '0.1.0',
};

describe('generateDesignMarkdown', () => {
  it('is deterministic for the same explicit context', () => {
    expect(generateDesignMarkdown(context)).toBe(generateDesignMarkdown(structuredClone(context)));
  });

  it('renders registered theme and component values across the required sections', () => {
    const output = generateDesignMarkdown(context);
    expect(output).toContain('# Test Theme Design System');
    expect(output).toContain('## Color system');
    expect(output).toContain('`colorPrimary`: `#123456`');
    expect(output).toContain('## Typography');
    expect(output).toContain('## Radius and borders');
    expect(output).toContain('## Spacing and layout');
    expect(output).toContain('### Button');
    expect(output).toContain('## Interaction states');
    expect(output).toContain('## Responsive rules');
    expect(output).toContain('## Accessibility');
    expect(output).toContain('## Verification checklist');
  });

  it('falls back to Custom theme metadata when the preset is missing', () => {
    const output = generateDesignMarkdown({ ...context, preset: undefined });
    expect(output).toContain('Preset: Test Theme (`test-theme`)');
    expect(output).toContain('Use **Custom theme**');
  });

  it('does not leak unregistered or unrelated sensitive fields', () => {
    const output = generateDesignMarkdown(context);
    expect(output).not.toContain('sentinel-api-key');
    expect(output).not.toMatch(/Base URL|chat content|model name/i);
  });
});
