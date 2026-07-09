import type { PropsWithChildren } from 'react';
import { Layout } from 'antd';
import { HeaderBar } from './HeaderBar';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Layout className="app-shell">
      <HeaderBar />
      <Layout.Content className="app-content">{children}</Layout.Content>
    </Layout>
  );
}

