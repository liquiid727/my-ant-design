import { lazy, Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import '@studio/styles.css';

/**
 * 以路由方式挂载 antd 主题工作室。
 *
 * 它是 design-lab 的一个消费者（见 ADR-0008），不是第二个设计系统：
 * 这里只负责把它塞进 lab 的外壳，工作室自己的构建与测试完全不动。
 */
const StudioApp = lazy(() => import('@studio/App'));

export function AdminStudio({ path }: { path: string }) {
  return (
    <div className="admin-mount">
      <Suspense
        fallback={(
          <div className="admin-loading" role="status" aria-live="polite">
            正在加载主题工作室…
          </div>
        )}
      >
        <MemoryRouter initialEntries={[path]}>
          <StudioApp />
        </MemoryRouter>
      </Suspense>
    </div>
  );
}
