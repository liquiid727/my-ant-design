import { Button, Card, Empty, Space, Table, Tag } from 'antd';
import { diffThemes } from '../../services/theme/themeDiff';
import { useThemeStore } from '../../stores/themeStore';
import { useVersionStore } from '../../stores/versionStore';

export function VersionPanel() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const createVersion = useVersionStore((state) => state.createVersion);
  const getVersions = useVersionStore((state) => state.getVersions);
  const rollback = useVersionStore((state) => state.rollback);
  const versions = getVersions(currentTheme.id);

  return (
    <Card title="Version Management">
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => createVersion(currentTheme.id, currentTheme, 'Manual snapshot')}>Create Snapshot</Button>
      </Space>
      {versions.length === 0 ? (
        <Empty description="No versions yet" />
      ) : (
        <Table
          size="small"
          pagination={false}
          dataSource={versions}
          rowKey="id"
          expandable={{
            expandedRowRender: (record) => (
              <div className="diff-box diff-viewer">
                {diffThemes(record.config, currentTheme).length === 0 ? 'No diff' : diffThemes(record.config, currentTheme).slice(0, 30).map((diff) => (
                  <div key={diff.key} className={`diff-line diff-line-${diff.type}`}>
                    <strong>{diff.type}</strong> {diff.key}: {String(diff.oldValue ?? '∅')} → {String(diff.newValue ?? '∅')}
                  </div>
                ))}
              </div>
            ),
          }}
          columns={[
            { title: 'Version', dataIndex: 'version', render: (value: number) => <Tag>v{value}</Tag> },
            { title: 'Message', dataIndex: 'message' },
            { title: 'Created', dataIndex: 'createdAt', render: (value: string) => new Date(value).toLocaleString() },
            {
              title: 'Action',
              render: (_, record) => (
                <Button
                  size="small"
                  onClick={() => {
                    const config = rollback(currentTheme.id, record.id);
                    if (config) setTheme(config);
                  }}
                >
                  Rollback
                </Button>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}
