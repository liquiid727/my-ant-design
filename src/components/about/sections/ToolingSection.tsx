import { CheckCircleOutlined, LinkOutlined, ToolOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Card, List, Segmented, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { toolingGuideRegistry, type ToolingGuide } from '../../../services/docs/toolingGuideRegistry';
import { CopyableCodeBlock } from '../components/CopyableCodeBlock';

export function ToolingSection() {
  const [client, setClient] = useState<ToolingGuide['client']>('claude-code');
  const guide = toolingGuideRegistry.find((item) => item.client === client)!;

  return (
    <Space orientation="vertical" size={16} className="about-section-stack about-tooling-section">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<ToolOutlined />} color="cyan">CLI / MCP</Tag>
          <Typography.Title level={3}>真实客户端接入指南</Typography.Title>
          <Typography.Paragraph type="secondary">
            CLI 负责配置和检查客户端；MCP 为 Agent 连接公开工具。Theme Studio 的设计上下文来自项目内主题文件与 design.md。
          </Typography.Paragraph>
        </Space>
      </Card>
      <Alert
        showIcon
        type="warning"
        icon={<WarningOutlined />}
        title="能力边界"
        description="本项目不提供 Theme Studio CLI 或 Theme Studio MCP Server；以下示例连接真实公开的 Context7 MCP。"
      />
      <Card className="about-section-card about-tooling-picker" title="选择客户端">
        <Segmented<ToolingGuide['client']>
          block
          value={client}
          onChange={setClient}
          options={[
            { label: 'Claude Code', value: 'claude-code' },
            { label: 'Codex', value: 'codex' },
          ]}
        />
      </Card>
      <Card
        className="about-section-card"
        title={guide.title}
        extra={<a href={guide.officialUrl} target="_blank" rel="noreferrer"><LinkOutlined /> 官方文档</a>}
      >
        <Typography.Paragraph type="secondary">{guide.description}</Typography.Paragraph>
        <Space wrap><Tag>lastVerifiedAt: {guide.lastVerifiedAt}</Tag><Tag className="about-config-path-tag">{guide.configPath}</Tag></Space>
      </Card>
      <Card className="about-section-card" title="CLI 命令">
        <Space orientation="vertical" size={16} className="about-section-stack">
          {guide.commands.map((command) => (
            <div key={command.label}>
              <Typography.Text strong>{command.label}</Typography.Text>
              <CopyableCodeBlock label={command.label} code={command.code} />
            </div>
          ))}
        </Space>
      </Card>
      <Card className="about-section-card" title={`配置示例 · ${guide.configPath}`}>
        <CopyableCodeBlock label={`${guide.title} 配置示例`} code={guide.configExample} />
      </Card>
      <Card className="about-section-card" title="验证步骤">
        <List dataSource={guide.verification} renderItem={(item) => <List.Item><Space align="start"><CheckCircleOutlined />{item}</Space></List.Item>} />
      </Card>
      <Card className="about-section-card" title="常见故障排查">
        <List dataSource={guide.troubleshooting} renderItem={(item) => <List.Item><Space align="start"><WarningOutlined />{item}</Space></List.Item>} />
      </Card>
    </Space>
  );
}
