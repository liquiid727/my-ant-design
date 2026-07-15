import { Card, Space, Typography } from 'antd';

export function UIAgentSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>Claude Code / Codex UI Agent</Typography.Title>
        <Typography.Paragraph type="secondary">
          一个统一模块承载两种 Agent 配置，共享 Ant Design 与主题 Token 约束，并保留各自正确的指令文件名和加载机制。
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
