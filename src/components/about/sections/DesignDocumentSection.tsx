import { Alert, Card, Space, Tag, Typography } from 'antd';
import { lazy, Suspense, useMemo } from 'react';
import type { ThemeOverrides, ThemeSessionV2 } from '../../../types';
import { generateDesignMarkdown } from '../../../services/docs/designMdGenerator';
import type { TextArtifact } from '../../../services/docs/textArtifact';
import { useThemeStore } from '../../../stores/themeStore';
import { themePresetRegistry } from '../../../themes/registry';
import { TextArtifactCard } from '../components/TextArtifactCard';

export const resolveActivePreset = (themeId: string, activePresetId: string) =>
  themeId === activePresetId
    ? themePresetRegistry.find((item) => item.id === activePresetId)
    : undefined;

export const shouldResolveActivePreset = (
  themeId: string,
  activePresetId: string,
  mode: ThemeSessionV2['mode'],
  overrides: ThemeOverrides,
) => {
  if (themeId === activePresetId) return false;
  if (mode === 'preset') return true;
  return Object.keys(overrides.token ?? {}).length === 0 && Object.keys(overrides.components ?? {}).length === 0;
};

export function DesignDocumentSection() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const mode = useThemeStore((state) => state.mode);
  const overrides = useThemeStore((state) => state.overrides);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);
  const activePreset = themePresetRegistry.find((item) => item.id === activePresetId);
  const needsResolution = Boolean(activePreset) && shouldResolveActivePreset(
    currentTheme.id,
    activePresetId,
    mode,
    overrides,
  );
  const ThemeRuntime = useMemo(
    () => activePreset ? lazy(activePreset.loadRuntime) : null,
    [activePreset],
  );

  const result = useMemo(() => {
    const preset = resolveActivePreset(currentTheme.id, activePresetId);
    try {
      const content = generateDesignMarkdown({
        theme: currentTheme,
        preset: preset ? { id: preset.id, name: preset.name, style: preset.style } : undefined,
        generatedAt: currentTheme.updatedAt,
        contentVersion: '0709',
        studioVersion: '0.1.0',
      });
      const artifact: TextArtifact = {
        kind: 'design-md',
        filename: 'design.md',
        content,
        mimeType: 'text/markdown;charset=utf-8',
      };
      return { artifact, presetName: preset?.name ?? 'Custom Theme' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '设计规范生成失败，请重试' };
    }
  }, [activePresetId, currentTheme]);

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      {needsResolution && ThemeRuntime && (
        <Suspense fallback={null}>
          <ThemeRuntime overrides={overrides} onResolvedTheme={setResolvedTheme}>{() => null}</ThemeRuntime>
        </Suspense>
      )}
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag color="purple">确定性生成 · 不调用 LLM</Tag>
          <Typography.Title level={3}>当前主题的 design.md</Typography.Title>
          <Typography.Paragraph type="secondary">
            文档包含视觉定位、Token 映射、组件规则、页面状态、响应式、可访问性和 Agent 验证清单。
          </Typography.Paragraph>
          {'presetName' in result && <Typography.Text>主题来源：{result.presetName}</Typography.Text>}
        </Space>
      </Card>
      {needsResolution ? (
        <Alert type="info" showIcon title="正在解析当前主题" description="完成后会自动刷新 design.md 预览。" />
      ) : 'error' in result ? (
        <Alert type="error" showIcon title="design.md 生成失败" description={result.error} />
      ) : (
        <TextArtifactCard
          artifact={result.artifact}
          title="预览与导出 design.md"
          description="预览内容会随当前 Theme 或 active preset 变化自动更新。复制失败时仍可手动选择预览文本或使用下载。"
        />
      )}
    </Space>
  );
}
