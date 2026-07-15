import { CheckCircleOutlined, CodeOutlined } from '@ant-design/icons';
import { Card, List, Segmented, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import {
  generateAgentArtifact,
  sharedUiAgentRules,
  type AgentArtifactKind,
} from '../../../services/docs/agentArtifactGenerator';
import { TextArtifactCard } from '../components/TextArtifactCard';

export function UIAgentSection() {
  const [kind, setKind] = useState<AgentArtifactKind>('claude-md');
  const artifact = useMemo(() => generateAgentArtifact(kind), [kind]);
  const isClaude = kind === 'claude-md';

  return (
    <Space orientation="vertical" size={16} className="about-section-stack about-agent-section">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<CodeOutlined />} color="geekblue">统一 UI Agent 模块</Tag>
          <Typography.Title level={3}>Claude Code / Codex UI Agent</Typography.Title>
          <Typography.Paragraph type="secondary">
            两种 Agent 使用同一套 Ant Design 与主题 Token 约束，仅文件名、加载机制和平台语法不同。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card className="about-section-card" title="共享设计约束">
        <List
          size="small"
          dataSource={[...sharedUiAgentRules]}
          renderItem={(rule) => <List.Item><Space align="start"><CheckCircleOutlined />{rule}</Space></List.Item>}
        />
      </Card>

      <Card className="about-section-card about-agent-picker" title="选择 Agent">
        <Segmented<AgentArtifactKind>
          block
          value={kind}
          onChange={setKind}
          options={[
            { label: 'Claude Code', value: 'claude-md' },
            { label: 'Codex', value: 'codex-agents-md' },
          ]}
        />
        <Typography.Paragraph type="secondary" className="about-agent-platform-note">
          {isClaude
            ? 'Claude Code 使用 CLAUDE.md，并通过 @design.md 导入设计规范。'
            : 'Codex 使用 AGENTS.md，并明确读取 ./design.md 与目录层级指令。'}
        </Typography.Paragraph>
      </Card>

      <TextArtifactCard
        artifact={artifact}
        title={isClaude ? 'Claude Code 配置' : 'Codex 配置'}
        description={isClaude
          ? '将 CLAUDE.md 放在项目根目录或适用的 .claude 目录。'
          : '将 AGENTS.md 放在项目根目录，并按目录层级补充更具体的约束。'}
      />
    </Space>
  );
}
