import {
  AppstoreOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Card, Col, Layout, Menu, Row, Statistic, Table, Tag, Typography } from 'antd';

const data = [
  { key: '1', theme: 'Lark Enterprise', owner: 'Design Ops', status: 'Active', tokens: 128 },
  { key: '2', theme: 'Dark Console', owner: 'Platform', status: 'Draft', tokens: 112 },
  { key: '3', theme: 'Blossom CRM', owner: 'Growth', status: 'Review', tokens: 96 },
];

export function DashboardPreview() {
  return (
    <Layout className="dashboard-shell">
      <Layout.Sider width={210} theme="light">
        <div style={{ padding: 16, fontWeight: 700 }}>Theme OS</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['themes']}
          items={[
            { key: 'themes', icon: <AppstoreOutlined />, label: 'Themes' },
            { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
            { key: 'tokens', icon: <DatabaseOutlined />, label: 'Tokens' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
          ]}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ background: 'transparent', padding: '0 20px' }}>
          <Typography.Title level={4} style={{ margin: '14px 0' }}>
            Design System Dashboard
          </Typography.Title>
        </Layout.Header>
        <Layout.Content style={{ padding: 20 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="Themes" value={24} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="Token Coverage" value={92} suffix="%" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="Exports" value={1480} />
              </Card>
            </Col>
          </Row>
          <Card title="Usage Trend" style={{ marginTop: 16 }}>
            <div className="chart-placeholder">
              {[40, 62, 44, 72, 50, 90, 58, 76, 66, 88].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </Card>
          <Card title="Theme Inventory" style={{ marginTop: 16 }}>
            <Table
              size="small"
              pagination={false}
              dataSource={data}
              columns={[
                { title: 'Theme', dataIndex: 'theme' },
                { title: 'Owner', dataIndex: 'owner' },
                { title: 'Tokens', dataIndex: 'tokens' },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (status: string) => <Tag color={status === 'Active' ? 'success' : 'processing'}>{status}</Tag>,
                },
              ]}
            />
          </Card>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

