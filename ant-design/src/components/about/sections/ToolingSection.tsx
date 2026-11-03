import { CheckCircleOutlined, LinkOutlined, ToolOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Card, List, Segmented, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import {
  getToolingVerificationStatus,
  TOOLING_VERIFICATION_MAX_AGE_DAYS,
  toolingGuideRegistry,
  type ToolingGuide,
} from '../../../services/docs/toolingGuideRegistry';
import { CopyableCodeBlock } from '../components/CopyableCodeBlock';

export function ToolingSection() {
  const [client, setClient] = useState<ToolingGuide['client']>('claude-code');
  const guide = toolingGuideRegistry.find((item) => item.client === client)!;
  const verificationStatus = getToolingVerificationStatus(guide.lastVerifiedAt);

  return (
    <Space orientation="vertical" size={16} className="about-section-stack about-tooling-section">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<ToolOutlined />} color="cyan">Ant Design CLI / MCP</Tag>
          <Typography.Title level={3}>Ant Design 工具链与 Agent 接入</Typography.Title>
          <Typography.Paragraph type="secondary">
            @ant-design/cli 提供组件知识、设计 Token 和项目诊断；官方 MCP 将这些能力接入 Claude Code 或 Codex。客户端负责承载 Agent，不等于 Ant Design 工具链本身。
          </Typography.Paragraph>
        </Space>
      </Card>
      <Alert
        showIcon
        type="warning"
        icon={<WarningOutlined />}
        title="职责边界"
        description="项目 design.md 与 ThemeConfig 描述当前产品的设计事实；Ant Design CLI/MCP 提供官方组件、Token、示例和版本知识；Claude Code 与 Codex 是使用这些资料和工具的 Agent 客户端。Context7 等第三方 MCP 仅可作为补充。"
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
        <Space wrap>
          <Tag color={verificationStatus === 'fresh' ? undefined : 'warning'}>lastVerifiedAt: {guide.lastVerifiedAt}</Tag>
          <Tag>toolVersion: {guide.verifiedToolVersion}</Tag>
          <Tag className="about-config-path-tag">{guide.configPath}</Tag>
        </Space>
      </Card>
      {verificationStatus !== 'fresh' && (
        <Alert
          showIcon
          type="warning"
          icon={<WarningOutlined />}
          title="CLI/MCP 核验已过期"
          description={(
            <Space wrap>
              <span>
                {verificationStatus === 'invalid'
                  ? '核验日期无效，请在使用命令前重新核验。'
                  : `该客户端指南已超过 ${TOOLING_VERIFICATION_MAX_AGE_DAYS} 天未复核。`}
              </span>
              <a href={guide.officialUrl} target="_blank" rel="noreferrer">查看官方文档</a>
            </Space>
          )}
        />
      )}
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
