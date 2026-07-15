import { CheckCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Steps, Tag, Typography } from 'antd';

const workflow = [
  '安装 Ant Design',
  '接入 Theme Studio 主题',
  '导出 design.md',
  '配置 UI Agent',
  '开发并验证页面',
];

export function OverviewSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<CheckCircleOutlined />} color="success">面向已有前端项目</Tag>
          <Space wrap>
            <Tag color="blue">内容版本 0709</Tag>
            <Tag>最近更新 2026-07-15</Tag>
            <Tag>CLI/MCP 最近核验 2026-07-15</Tag>
          </Space>
          <Typography.Title level={3}>五步完成一致的 Agent UI 工作流</Typography.Title>
          <Typography.Paragraph type="secondary">
            将当前主题变成开发者和 Agent 都能读取的工程约束，减少组件选择、Token 使用和响应式实现之间的偏差。
          </Typography.Paragraph>
        </Space>
      </Card>
      <Card className="about-section-card" title="接入流程">
        <Steps responsive current={0} items={workflow.map((title) => ({ title }))} />
      </Card>
      <Row gutter={[16, 16]}>
        {[
          ['主题接入', '将导出的 ThemeConfig 应用到 Ant Design ConfigProvider。'],
          ['机器可读规范', '从当前主题确定性生成 design.md，供团队与 Agent 共用。'],
          ['双 Agent 配置', '在同一模块中分别生成 Claude Code 与 Codex 指令文件。'],
        ].map(([title, description]) => (
          <Col key={title} xs={24} md={8}>
            <Card className="about-feature-card" title={title}>
              <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
