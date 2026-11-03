import { CheckCircleOutlined } from '@ant-design/icons';
import { Alert, Card, Space, Steps, Tag, Typography } from 'antd';
import { CopyableCodeBlock } from '../components/CopyableCodeBlock';

const installCommand = 'npm install antd @ant-design/icons';

const themeTs = `import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
  },
  components: {
    Button: { controlHeight: 36 },
    Card: { borderRadiusLG: 12 },
  },
};

export default theme;`;

const themeJson = `{
  "token": {
    "colorPrimary": "#1677ff",
    "borderRadius": 8
  },
  "components": {
    "Button": { "controlHeight": 36 },
    "Card": { "borderRadiusLG": 12 }
  }
}`;

const configProviderTs = `import { ConfigProvider } from 'antd';
import theme from './theme'; // or: import theme from './theme.json';

export function AppRoot() {
  return (
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  );
}`;

const verificationTsx = `import { Button, Card, Form, Input, Space } from 'antd';

export function ThemeCheck() {
  return (
    <Card title="Theme verification">
      <Form layout="vertical">
        <Form.Item label="Project name" name="name">
          <Input placeholder="Check input tokens" />
        </Form.Item>
        <Space wrap>
          <Button type="primary">Primary action</Button>
          <Button>Secondary action</Button>
        </Space>
      </Form>
    </Card>
  );
}`;

export function AntdIntegrationSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Space orientation="vertical" size={8}>
          <Tag icon={<CheckCircleOutlined />} color="blue">Ant Design 6</Tag>
          <Typography.Title level={3}>在现有项目中接入主题</Typography.Title>
          <Typography.Paragraph type="secondary">
            以下步骤假设你的前端项目已经可以运行，只覆盖 Ant Design 安装、Theme Studio 文件导入和主题验证。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card className="about-section-card" title="1. 安装组件库与图标">
        <CopyableCodeBlock label="安装 Ant Design 6" code={installCommand} />
      </Card>

      <Card className="about-section-card" title="2. 导入 Theme Studio 主题文件">
        <Alert type="info" showIcon title="任选一种导出格式" description="theme.ts 提供类型检查；theme.json 适合跨工具传递。两者都可直接作为 ConfigProvider 的 theme。" />
        <Typography.Title level={5}>theme.ts</Typography.Title>
        <CopyableCodeBlock label="Theme Studio theme.ts 示例" code={themeTs} />
        <Typography.Title level={5}>theme.json</Typography.Title>
        <CopyableCodeBlock label="Theme Studio theme.json 示例" code={themeJson} />
      </Card>

      <Card className="about-section-card" title="3. 注入 ConfigProvider">
        <CopyableCodeBlock label="ConfigProvider theme 接入示例" code={configProviderTs} />
      </Card>

      <Card className="about-section-card" title="4. 验证主题是否生效">
        <Typography.Paragraph type="secondary">
          同时检查 Button、Card 与 Form，确认全局 Token 和组件 Token 都已进入实际组件。
        </Typography.Paragraph>
        <CopyableCodeBlock label="Button Card Form 主题验证示例" code={verificationTsx} />
        <Steps
          className="about-verification-steps"
          items={[
            { title: 'Button', description: '主按钮颜色、圆角和高度符合主题。' },
            { title: 'Card', description: '容器背景、边框和圆角符合主题。' },
            { title: 'Form', description: '输入框、标签和交互状态可用。' },
          ]}
        />
      </Card>
    </Space>
  );
}
