import { lazy, Suspense, useState } from 'react';
import { BgColorsOutlined, CopyOutlined } from '@ant-design/icons';
import { App, Drawer, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ThemeEditorSidebar } from '../editor/ThemeEditorSidebar';
import { exportTheme } from '../../services/theme/themeExporter';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { PresetBar } from './PresetBar';

const ComponentsPreview = lazy(() =>
  import('./previews/ComponentsPreview').then((module) => ({ default: module.ComponentsPreview })),
);
const DashboardPreview = lazy(() =>
  import('./previews/DashboardPreview').then((module) => ({ default: module.DashboardPreview })),
);

export function PlaygroundPage() {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const openAI = useUIStore((state) => state.openAI);
  const activeView = searchParams.get('view') === 'dashboard' ? 'dashboard' : 'components';

  const copyTheme = async () => {
    await navigator.clipboard.writeText(exportTheme(currentTheme, 'json'));
    message.success('Theme copied');
  };

  return (
    <div className="theme-playground">
      <div className="reference-topbar">
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
            <button className="official-tool-button ai" type="button" aria-label="AI theme generate" onClick={openAI}>
              <ThemeSparkIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <section className="preview-panel reference-panel">
        <div className="reference-padding">
          <Suspense fallback={null}>{activeView === 'dashboard' ? <DashboardPreview /> : <ComponentsPreview />}</Suspense>
        </div>
      </section>
      <Drawer
        className="editor-drawer"
        title="Theme Editor"
        open={isEditorOpen}
        width={420}
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
