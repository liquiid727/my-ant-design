import { App, Button, Modal, Typography, theme as antdTheme } from 'antd';
import { useState } from 'react';
import type { CommunityThemeMeta } from '../../services/community/types';
import { CommunityThemeService } from '../../services/community/communityThemeService';
import { diffThemes } from '../../services/theme/themeDiff';
import { validateThemeConfig } from '../../services/theme/themeValidator';
import { useThemeStore } from '../../stores/themeStore';
import { useVersionStore } from '../../stores/versionStore';
import { defaultTheme } from '../../services/theme/presets';
import OfficialComponentsPreview from '../playground/official/OfficialComponentsPreview';

type ThemePreviewModalProps = {
  theme: CommunityThemeMeta | null;
  open: boolean;
  onClose: () => void;
};

export function ThemePreviewModal({ theme, open, onClose }: ThemePreviewModalProps) {
  const { message } = App.useApp();
  const [advancedError, setAdvancedError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const createVersion = useVersionStore((state) => state.createVersion);

  if (!theme) return null;

  const previewConfig = validateThemeConfig(
    {
      id: theme.id,
      name: theme.name,
      algorithm: theme.config.algorithm,
      token: theme.config.token as typeof defaultTheme.token,
      components: theme.config.components as typeof defaultTheme.components,
    },
    defaultTheme,
  );

  const diffs = diffThemes(defaultTheme, previewConfig);
  const isDark = theme.config.algorithm === 'dark' || theme.config.algorithm === 'darkCompact';

  const handleApply = async () => {
    setAdvancedError(null);
    setApplying(true);
    try {
      if (theme.format === 'advanced') {
        await CommunityThemeService.loadAdvancedTheme(theme.id);
      }
      createVersion(currentTheme.id, currentTheme, `Before applying community theme: ${theme.name}`);
      if (previewConfig.id !== currentTheme.id) {
        createVersion(previewConfig.id, currentTheme, `Before applying community theme: ${theme.name}`);
      }
      setTheme(previewConfig);
      message.success(`Applied theme: ${theme.name}`);
      onClose();
    } catch (error) {
      const text = error instanceof Error ? error.message : '该高级主题加载失败';
      setAdvancedError(text.includes('该高级主题加载失败') ? text : '该高级主题加载失败');
      message.error('该高级主题加载失败');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      width={720}
      footer={null}
      className="plaza-preview-modal"
    >
      <div className="plaza-preview-header">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>{theme.name}</Typography.Title>
          <Typography.Text type="secondary">by {theme.author} — {theme.description}</Typography.Text>
        </div>
      </div>

      <div className="plaza-preview-body">
        <div className="plaza-preview-components">
          <OfficialComponentsPreview
            containerClassName="plaza-preview-components-inner"
            config={{
              theme: {
                algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: theme.config.token,
                components: theme.config.components,
              },
            }}
            isDark={isDark}
            isDarkTheme={isDark}
          />
        </div>
        {advancedError && (
          <Typography.Text type="danger" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            {advancedError}
          </Typography.Text>
        )}
      </div>

      {diffs.length > 0 && (
        <div className="plaza-preview-diff">
          <Typography.Text strong style={{ fontSize: 13 }}>Token Changes</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginInlineStart: 8 }}>
            {diffs.length} modified
          </Typography.Text>
          <div className="plaza-diff-list">
            {diffs.slice(0, 10).map((diff) => (
              <div key={diff.key} className="plaza-diff-row">
                <span className="plaza-diff-key">{diff.key}</span>
                <span className="plaza-diff-arrow">→</span>
                <span className="plaza-diff-value">{String(diff.newValue)}</span>
              </div>
            ))}
            {diffs.length > 10 && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                +{diffs.length - 10} more
              </Typography.Text>
            )}
          </div>
        </div>
      )}

      <div className="plaza-preview-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={handleApply} loading={applying}>Apply Theme</Button>
      </div>
    </Modal>
  );
}
