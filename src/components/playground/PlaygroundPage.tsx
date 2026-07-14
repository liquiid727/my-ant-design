import { lazy, Suspense, useMemo, useState } from 'react';
import { BgColorsOutlined, CopyOutlined } from '@ant-design/icons';
import { App, Drawer, Segmented, Tooltip } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeEditorSidebar } from '../editor/ThemeEditorSidebar';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { getThemePreset } from '../../themes/registry';
import { PresetBar } from './PresetBar';

const ComponentsPreview = lazy(() =>
  import('./official/OfficialComponentsPreview'),
);
const DashboardPreview = lazy(() =>
  import('./official/OfficialDashboardPreview'),
);

export function PlaygroundPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const overrides = useThemeStore((state) => state.overrides);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);
  const openAI = useUIStore((state) => state.openAI);
  const activeView = searchParams.get('view') === 'dashboard' ? 'dashboard' : 'components';
  const activePreset = getThemePreset(activePresetId);
  const ThemeRuntime = useMemo(() => lazy(activePreset.loadRuntime), [activePreset]);
  const sceneBackground = activePreset.scene.background.startsWith('linear-gradient')
    ? activePreset.scene.background
    : `url(${activePreset.scene.background})`;

  const copyTheme = async () => {
    await navigator.clipboard.writeText(await activePreset.loadSource());
    message.success('Theme copied');
  };

  return (
    <div
      className={`theme-playground ${activePreset.scene.dark ? 'theme-playground-dark' : ''}`}
      style={{ backgroundImage: sceneBackground }}
      data-theme-preset={activePreset.id}
    >
      <div className="reference-topbar">
        <Segmented
          className="preview-mode-switch"
          value={activeView}
          options={[
            { label: 'Components', value: 'components' },
            { label: 'Dashboard', value: 'dashboard' },
          ]}
          onChange={(value) => navigate(`/?view=${value}`)}
        />
        <div className="reference-theme-actions">
          <PresetBar />
          <div className="reference-tool-actions" aria-label="Theme actions">
            <Tooltip title="复制主题">
              <button className="official-tool-button" type="button" aria-label="Copy theme" onClick={copyTheme}>
                <CopyOutlined />
              </button>
            </Tooltip>
            <Tooltip title="修改主题">
              <button
                className="official-tool-button"
                type="button"
                aria-label="Edit Tokens"
                onClick={() => setIsEditorOpen(true)}
              >
                <BgColorsOutlined />
              </button>
            </Tooltip>
            <Tooltip title="AI 主题生成" placement="top">
              <button className="official-tool-button" type="button" aria-label="AI theme generate" onClick={openAI}>
                <ThemeSparkIcon />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="preview-loading" aria-label="Loading theme" />}>
        <ThemeRuntime
          key={activePreset.id}
          overrides={overrides}
          onResolvedTheme={setResolvedTheme}
        >
          {(config) =>
            activeView === 'dashboard' ? (
              <DashboardPreview
                className="official-dashboard-card"
                config={config}
                activeTheme={{
                  icon: activePreset.icon,
                  name: activePreset.name,
                  bgImgDark: activePreset.scene.dark,
                }}
                style={{ borderRadius: 16 }}
              />
            ) : (
              <ComponentsPreview
                className="official-components-card"
                containerClassName="official-preview-container"
                config={config}
                isDark={false}
                isDarkTheme={activePreset.scene.dark}
              />
            )
          }
        </ThemeRuntime>
      </Suspense>
      <Drawer
        className="editor-drawer"
        title="Theme Editor"
        open={isEditorOpen}
        size={420}
        onClose={() => setIsEditorOpen(false)}
      >
        <ThemeEditorSidebar />
      </Drawer>
    </div>
  );
}

function ThemeSparkIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <title>Theme icon</title>
      <g fillRule="evenodd">
        <g fillRule="nonzero">
          <path d="M7.02 3.635l12.518 12.518a1.863 1.863 0 0 1 0 2.635l-1.317 1.318a1.863 1.863 0 0 1-2.635 0L3.068 7.588A2.795 2.795 0 1 1 7.02 3.635Zm2.09 14.428a.932.932 0 1 1 0 1.864.932.932 0 0 1 0-1.864Zm-.043-9.747L7.75 9.635l9.154 9.153 1.318-1.317-9.154-9.155ZM3.52 12.473c.514 0 .931.417.931.931v.932h.932a.932.932 0 1 1 0 1.864h-.932v.931a.932.932 0 0 1-1.863 0v-.931h-.931a.932.932 0 1 1 0-1.864h.931v-.932c0-.514.418-.931.932-.931Zm15.374-3.727a1.398 1.398 0 1 1 0 2.795 1.398 1.398 0 0 1 0-2.795ZM4.385 4.953a.932.932 0 0 0 0 1.317l2.046 2.047L7.75 7 5.703 4.953a.932.932 0 0 0-1.318 0ZM14.701.36a.932.932 0 0 1 .931.932v.931h.932a.932.932 0 1 1 0 1.864h-.932v.932a.932.932 0 1 1-1.863 0v-.932h-.931a.932.932 0 1 1 0-1.864h.931v-.931A.932.932 0 0 1 14.701.36Z" />
        </g>
      </g>
    </svg>
  );
}
