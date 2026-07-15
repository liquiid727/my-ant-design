import { Card, Space, Typography } from 'antd';

export function AntdIntegrationSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>Ant Design 6 主题接入</Typography.Title>
        <Typography.Paragraph type="secondary">
          本区块仅面向已经能够运行的前端项目，说明组件库安装、Theme Studio 文件导入、ConfigProvider 接入和组件验证。
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
