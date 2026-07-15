import { Card, Space, Tabs, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AntdIntegrationSection } from './sections/AntdIntegrationSection';
import { DesignDocumentSection } from './sections/DesignDocumentSection';
import { OverviewSection } from './sections/OverviewSection';
import { ToolingSection } from './sections/ToolingSection';
import { UIAgentSection } from './sections/UIAgentSection';

export const ABOUT_TAB_KEYS = ['overview', 'antd', 'design', 'tooling', 'agents'] as const;
export type AboutTabKey = typeof ABOUT_TAB_KEYS[number];

const legacyHashes: Record<string, AboutTabKey> = {
  intro: 'overview',
  antd: 'antd',
  ai: 'design',
  agent: 'agents',
};

export const normalizeAboutHash = (hash: string): AboutTabKey => {
  const key = hash.replace(/^#/, '');
  if (ABOUT_TAB_KEYS.includes(key as AboutTabKey)) return key as AboutTabKey;
  return legacyHashes[key] ?? 'overview';
};

export function AboutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = normalizeAboutHash(location.hash);
  const canonicalHash = `#${activeKey}`;

  useEffect(() => {
    if (location.hash !== canonicalHash) {
      navigate(
        { pathname: location.pathname, search: location.search, hash: canonicalHash },
        { replace: true },
      );
    }
  }, [canonicalHash, location.hash, location.pathname, location.search, navigate]);

  return (
    <section className="about-page">
      <div className="about-shell">
        <Card className="about-hero">
          <Space orientation="vertical" size={8}>
            <Tag color="blue">UI Agent Onboarding</Tag>
            <Typography.Title level={2}>Ant Design Theme Studio</Typography.Title>
            <Typography.Paragraph type="secondary">
              为已有前端项目提供从 Ant Design 主题接入、设计规范导出到 Claude Code 与 Codex UI Agent 配置的统一入口。
            </Typography.Paragraph>
          </Space>
        </Card>
        <Tabs
          className="about-tabs"
          activeKey={activeKey}
          onChange={(key) => navigate(
            { pathname: location.pathname, search: location.search, hash: key },
            { replace: true },
          )}
          items={[
            { key: 'overview', label: '产品介绍', children: <OverviewSection /> },
            { key: 'antd', label: 'Ant Design 接入', children: <AntdIntegrationSection /> },
            { key: 'design', label: 'design.md', children: <DesignDocumentSection /> },
            { key: 'tooling', label: 'CLI / MCP', children: <ToolingSection /> },
            { key: 'agents', label: 'UI Agent', children: <UIAgentSection /> },
          ]}
        />
      </div>
    </section>
  );
}

export default AboutPage;
