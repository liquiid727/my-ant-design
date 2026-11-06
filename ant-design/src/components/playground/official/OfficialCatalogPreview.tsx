import { ConfigProvider, Typography } from 'antd';
import type { ConfigProviderProps } from 'antd';
import { clsx } from 'clsx';
import { catalogEntries } from './catalogEntries';

export function OfficialCatalogPreview({ config }: { config: ConfigProviderProps }) {
  return (
    <ConfigProvider {...config}>
      <div className="catalog-panel">
        <Typography.Paragraph type="secondary" className="catalog-hint">
          {catalogEntries.length} 个 antd 组件，全部吃当前主题。缺哪个组件就补哪个示例——覆盖率有测试把关。
        </Typography.Paragraph>
        <div className="catalog-grid">
          {catalogEntries.map((entry) => (
            <div className={clsx('catalog-cell', entry.wide && 'catalog-cell-wide')} key={entry.name}>
              <Typography.Text type="secondary" className="catalog-label">
                {entry.name}
              </Typography.Text>
              <div className="catalog-demo">{entry.render()}</div>
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
}
