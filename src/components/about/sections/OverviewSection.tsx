import { CheckCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Space, Steps, Tag, Typography } from 'antd';
import {
  ABOUT_CONTENT_METADATA,
  getToolingVerificationSummary,
  TOOLING_VERIFICATION_MAX_AGE_DAYS,
  toolingGuideRegistry,
} from '../../../services/docs/toolingGuideRegistry';

const workflow = [
  '安装 Ant Design',
  '接入 Theme Studio 主题',
  '导出 design.md',
  '配置 UI Agent',
  '开发并验证页面',
];

export function OverviewSection() {
  const verificationSummary = getToolingVerificationSummary(toolingGuideRegistry);
  const staleGuides = toolingGuideRegistry.filter((guide) => verificationSummary.staleGuideIds.includes(guide.id));

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<CheckCircleOutlined />} color="success">面向已有前端项目</Tag>
          <Space wrap>
            <Tag color="blue">内容版本 {ABOUT_CONTENT_METADATA.version}</Tag>
            <Tag>最近更新 {ABOUT_CONTENT_METADATA.updatedAt}</Tag>
            <Tag color={verificationSummary.isStale ? 'warning' : undefined}>
              CLI/MCP 最近核验 {verificationSummary.oldestVerifiedAt ?? '未核验'}
            </Tag>
          </Space>
          {verificationSummary.isStale && (
            <Alert
              showIcon
              type="warning"
              title="CLI/MCP 核验已过期"
              description={(
                <Space orientation="vertical" size={4}>
                  <Typography.Text>
                    存在超过 {TOOLING_VERIFICATION_MAX_AGE_DAYS} 天未复核的客户端指南，请在使用前核对官方文档。
                  </Typography.Text>
                  <Space wrap>
                    {staleGuides.map((guide) => (
                      <a key={guide.id} href={guide.officialUrl} target="_blank" rel="noreferrer">
                        {guide.title} 官方文档
                      </a>
                    ))}
                  </Space>
                </Space>
              )}
            />
          )}
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
