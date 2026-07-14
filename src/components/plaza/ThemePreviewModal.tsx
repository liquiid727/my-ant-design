import { App, Button, ConfigProvider, Modal, Typography, theme as antdTheme } from 'antd';
import type { CommunityThemeMeta } from '../../services/community/types';
import { diffThemes } from '../../services/theme/themeDiff';
import { validateThemeConfig } from '../../services/theme/themeValidator';
import { useThemeStore } from '../../stores/themeStore';
import { useVersionStore } from '../../stores/versionStore';
import { defaultTheme } from '../../services/theme/presets';

type ThemePreviewModalProps = {
  theme: CommunityThemeMeta | null;
  open: boolean;
  onClose: () => void;
};

export function ThemePreviewModal({ theme, open, onClose }: ThemePreviewModalProps) {
  const { message } = App.useApp();
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

  const handleApply = () => {
    createVersion(currentTheme.id, currentTheme, `Before applying community theme: ${theme.name}`);
    setTheme(previewConfig);
    message.success(`Applied theme: ${theme.name}`);
    onClose();
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
        <ConfigProvider
          theme={{
            algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            token: theme.config.token as Record<string, unknown>,
            components: theme.config.components as Record<string, Record<string, unknown>>,
          }}
        >
          <div className="plaza-preview-components" style={{ padding: 24, borderRadius: 8, background: isDark ? '#141414' : '#fafafa' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button danger>Danger</Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="primary" size="small">Small</Button>
              <Button type="primary" size="middle">Middle</Button>
              <Button type="primary" size="large">Large</Button>
            </div>
          </div>
        </ConfigProvider>
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
        <Button type="primary" onClick={handleApply}>Apply Theme</Button>
      </div>
    </Modal>
  );
}
