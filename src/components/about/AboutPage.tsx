import {
  ApiOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  KeyOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, Row, Space, Steps, Tabs, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  claudeMdTemplate,
  configProviderExample,
  createViteProject,
  exportedThemeJson,
  installAntd,
  mcpServerTemplate,
  minimalThemeApp,
  systemPromptTemplate,
} from './codeTemplates';

const TAB_KEYS = ['intro', 'antd', 'ai', 'agent'] as const;

type TabKey = typeof TAB_KEYS[number];

const isTabKey = (key: string): key is TabKey => TAB_KEYS.includes(key as TabKey);

export function AboutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hashKey = location.hash.slice(1);
  const activeKey: TabKey = isTabKey(hashKey) ? hashKey : 'intro';

  return (
    <section className="about-page">
      <div className="about-shell">
        <Card className="about-hero">
          <Space orientation="vertical" size={8}>
            <Tag color="blue">Quick Start</Tag>
            <Typography.Title level={2}>Ant Design Theme Studio</Typography.Title>
            <Typography.Paragraph type="secondary">
              一站式设计、预览、AI 生成并导出 Ant Design 主题，帮助团队把设计语言快速落到可复用的 theme token。
            </Typography.Paragraph>
          </Space>
        </Card>
        <Tabs
          className="about-tabs"
          activeKey={activeKey}
          onChange={(key) => navigate({ pathname: '/about', hash: key }, { replace: true })}
          items={[
            { key: 'intro', label: '产品介绍', children: <IntroSection /> },
            { key: 'antd', label: '接入 Ant Design', children: <AntdGuideSection /> },
            { key: 'ai', label: '配置 AI', children: <AIConfigSection /> },
            { key: 'agent', label: 'Agent 配置', children: <AgentSection /> },
          ]}
        />
      </div>
    </section>
  );
}

function IntroSection() {
  const features: Array<{ icon: ReactNode; title: string; description: string }> = [
    {
      icon: <BgColorsOutlined />,
      title: '可视化编辑 Token',
      description: '在 Playground 中实时调整全局 token 和组件 token，直接观察 antd 组件的主题变化。',
    },
    {
      icon: <RobotOutlined />,
      title: 'AI 生成主题',
      description: '用自然语言描述品牌、情绪和使用场景，由 AI 生成可校验的 ThemeConfig。',
    },
    {
      icon: <ExperimentOutlined />,
      title: 'Playground 预览',
      description: '通过 Components 与 Dashboard 两种视图检查按钮、表单、卡片、表格和导航效果。',
    },
    {
      icon: <DownloadOutlined />,
      title: '主题导出',
      description: '将当前主题导出为 JSON、TypeScript、设计 token、Tailwind 或 CSS variables。',
    },
    {
      icon: <AppstoreOutlined />,
      title: '社区广场',
      description: '浏览社区主题方案，快速复用配色、圆角、阴影和组件细节。',
    },
  ];

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>Theme Studio 是什么？</Typography.Title>
        <Typography.Paragraph type="secondary">
          Theme Studio 面向使用 Ant Design 的产品团队，把主题设计、组件预览、AI 辅助生成和工程导出放在同一个工作流里。
        </Typography.Paragraph>
      </Card>
      <Row gutter={[16, 16]}>
        {features.map((feature) => (
          <Col key={feature.title} xs={24} sm={12} lg={8}>
            <Card className="about-feature-card">
              <div className="about-feature-icon">{feature.icon}</div>
              <Typography.Title level={5}>{feature.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{feature.description}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

function AntdGuideSection() {
  const steps = [
    {
      title: '创建 React + Vite 项目',
      description: '使用 TypeScript 模板创建最小前端项目。',
      code: createViteProject,
    },
    {
      title: '安装 antd',
      description: '安装 Ant Design 组件库和图标包。',
      code: installAntd,
    },
    {
      title: '导出 Theme Studio token',
      description: '在 Library 中选择 JSON 导出，格式可直接传给 ConfigProvider 的 theme prop。',
      code: exportedThemeJson,
    },
    {
      title: '配置 ConfigProvider',
      description: '把导出的 JSON 作为全局主题注入应用根节点。',
      code: configProviderExample,
    },
  ];

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>从零接入 Ant Design 主题</Typography.Title>
        <Typography.Paragraph type="secondary">
          Theme Studio 导出的 JSON 对应 antd `ThemeConfig`：`token` 控制全局设计变量，`components` 覆盖 Button、Card、Menu 等组件 token。
        </Typography.Paragraph>
      </Card>
      <Card className="about-section-card">
        <Steps
          orientation="vertical"
          className="about-steps"
          items={steps.map((step) => ({
            title: step.title,
            content: (
              <div className="about-step-body">
                <Typography.Paragraph type="secondary">{step.description}</Typography.Paragraph>
                <CodeBlock code={step.code} />
              </div>
            ),
          }))}
        />
      </Card>
      <Card className="about-section-card" title="最小可运行示例">
        <CodeBlock code={minimalThemeApp} />
      </Card>
    </Space>
  );
}

function AIConfigSection() {
  const providers = ['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'OpenRouter', 'Custom'];

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>配置 AI 主题生成</Typography.Title>
        <Typography.Paragraph type="secondary">
          在 Settings 中接入 LLM Provider 后，AI Chat 可以根据自然语言需求生成 Ant Design theme token，并展示与当前主题的差异。
        </Typography.Paragraph>
        <Space wrap>
          {providers.map((provider) => (
            <Tag key={provider} color={provider === 'Custom' ? 'default' : 'blue'}>{provider}</Tag>
          ))}
        </Space>
      </Card>
      <Alert
        showIcon
        type="info"
        icon={<SafetyCertificateOutlined />}
        title="API Key 仅保存在本地浏览器 localStorage"
        description="Theme Studio 不会把你的 API Key 上传到服务器。请仍然只在可信设备和可信浏览器环境中使用。"
      />
      <Card className="about-section-card">
        <Steps
          orientation="vertical"
          className="about-steps"
          items={[
            { title: '打开 Settings', content: '点击顶部导航右侧的 Settings 按钮。', icon: <SettingOutlined /> },
            { title: '选择 Provider', content: '选择 OpenAI、Claude、Gemini、DeepSeek、Qwen、OpenRouter 或 Custom。', icon: <ApiOutlined /> },
            { title: '填入 API Key', content: '填写 Base URL、API Key，并选择或输入模型名称。', icon: <KeyOutlined /> },
            { title: '测试连接', content: '点击 Test Connection，确认当前浏览器可以访问该 Provider。', icon: <CheckCircleOutlined /> },
            { title: '保存并使用 AI Chat', content: '保存后打开 AI Chat，用自然语言描述想要的主题风格。', icon: <ThunderboltOutlined /> },
          ]}
        />
      </Card>
      <Card className="about-section-card" title="AI Chat 工作流">
        <Row gutter={[16, 16]}>
          {[
            { icon: <RobotOutlined />, title: '描述需求', text: '例如：生成一个克制、专业、适合数据看板的蓝绿色主题。' },
            { icon: <BgColorsOutlined />, title: '生成 token', text: 'AI 返回可校验的 `token` 和 `components` 配置。' },
            { icon: <ShareAltOutlined />, title: '应用与导出', text: '确认差异后应用主题，再导出到业务项目。' },
          ].map((item) => (
            <Col key={item.title} xs={24} md={8}>
              <div className="about-flow-item">
                <div className="about-feature-icon">{item.icon}</div>
                <Typography.Text strong>{item.title}</Typography.Text>
                <Typography.Paragraph type="secondary">{item.text}</Typography.Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  );
}

function AgentSection() {
  const templates = [
    {
      title: 'CLAUDE.md',
      usage: '放在项目根目录，给 Claude Code 或兼容 Agent 提供项目上下文和开发规范。',
      code: claudeMdTemplate,
    },
    {
      title: 'MCP server 配置',
      usage: '放入 Agent 客户端的 MCP 配置，将 Theme Studio CLI 或内部工具暴露给 Agent。',
      code: mcpServerTemplate,
    },
    {
      title: 'System prompt',
      usage: '用于自定义 Agent 的系统提示，约束它围绕 antd token 体系实现 UI。',
      code: systemPromptTemplate,
    },
  ];

  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>Agent 配置模板</Typography.Title>
        <Typography.Paragraph type="secondary">
          这些模板用于把 Theme Studio 的设计语言、token 约束和验证流程交给 Claude Code、Codex 或其他 Agent 工作流。
        </Typography.Paragraph>
      </Card>
      {templates.map((template) => (
        <Card key={template.title} className="about-section-card" title={template.title}>
          <Typography.Paragraph type="secondary">{template.usage}</Typography.Paragraph>
          <CodeBlock code={template.code} />
        </Card>
      ))}
    </Space>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <Typography.Paragraph className="about-code-copy" copyable={{ text: code }}>
      <pre className="about-code-block">
        <code>{code}</code>
      </pre>
    </Typography.Paragraph>
  );
}

export default AboutPage;
