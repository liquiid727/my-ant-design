import { ConfigProvider, App as AntApp } from 'antd';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PlaygroundPage } from './components/playground/PlaygroundPage';

const LibraryPage = lazy(() => import('./components/library/LibraryPage').then((module) => ({ default: module.LibraryPage })));
const SettingsModal = lazy(() =>
  import('./components/settings/SettingsModal').then((module) => ({ default: module.SettingsModal })),
);
const AIDrawer = lazy(() => import('./components/ai/AIDrawer').then((module) => ({ default: module.AIDrawer })));

export default function App() {
  return (
    <ConfigProvider>
      <AntApp>
        <div className="studio-root">
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
