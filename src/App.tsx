import { ConfigProvider, App as AntApp } from 'antd';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PlaygroundPage } from './components/playground/PlaygroundPage';
import { useThemeStore } from './stores/themeStore';
import { resolveAlgorithm } from './services/theme/presets';

const LibraryPage = lazy(() => import('./components/library/LibraryPage').then((module) => ({ default: module.LibraryPage })));
const SettingsModal = lazy(() =>
  import('./components/settings/SettingsModal').then((module) => ({ default: module.SettingsModal })),
);
const AIDrawer = lazy(() => import('./components/ai/AIDrawer').then((module) => ({ default: module.AIDrawer })));

export default function App() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const selectedPresetId = useThemeStore((state) => state.selectedPresetId);

  return (
    <ConfigProvider
      theme={{
        algorithm: resolveAlgorithm(currentTheme.algorithm),
        token: currentTheme.token,
        components: currentTheme.components,
      }}
    >
      <AntApp>
        <div className={`theme-skin theme-skin-${selectedPresetId}`}>
          <AppLayout>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<PlaygroundPage />} />
                <Route path="/library" element={<LibraryPage />} />
              </Routes>
            </Suspense>
          </AppLayout>
          <Suspense fallback={null}>
            <SettingsModal />
            <AIDrawer />
          </Suspense>
        </div>
      </AntApp>
    </ConfigProvider>
  );
}
