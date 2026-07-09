import { describe, expect, it } from 'vitest';
import { defaultTheme } from './presets';
import { exportTheme } from './themeExporter';

describe('exportTheme', () => {
  it('exports css variables', () => {
    expect(exportTheme(defaultTheme, 'css')).toContain('--ant-token-color-primary');
  });

  it('exports TypeScript config', () => {
    expect(exportTheme(defaultTheme, 'ts')).toContain('export const themeConfig');
  });
});

