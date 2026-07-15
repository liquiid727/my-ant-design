import { Alert, Card, Space, Typography } from 'antd';

export function ToolingSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>CLI / MCP 客户端接入</Typography.Title>
        <Typography.Paragraph type="secondary">
          介绍 Claude Code 与 Codex 已有的 CLI、MCP 配置位置、验证步骤和常见故障排查。
        </Typography.Paragraph>
      </Card>
      <Alert type="info" showIcon title="能力边界" description="Theme Studio 当前通过项目内的主题文件和 design.md 向 Agent 提供设计上下文。" />
    </Space>
  );
}
