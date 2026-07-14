export const createViteProject = `npm create vite@latest theme-demo -- --template react-ts
cd theme-demo`;

export const installAntd = `npm install antd @ant-design/icons`;

export const exportedThemeJson = `{
  "token": {
    "colorPrimary": "#1677ff",
    "borderRadius": 8,
    "fontFamily": "AlibabaSans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  },
  "components": {
    "Button": {
      "borderRadius": 8,
      "controlHeight": 36
    },
    "Card": {
      "borderRadiusLG": 12
    }
  }
}`;

export const configProviderExample = `import { ConfigProvider } from 'antd';
import theme from './theme.json';

export function App() {
  return (
    <ConfigProvider theme={theme}>
      <YourApplication />
    </ConfigProvider>
  );
}`;

export const minimalThemeApp = `import { ConfigProvider, Button, Card, Space, Typography } from 'antd';
import theme from './theme.json';
import 'antd/dist/reset.css';

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <main style={{ padding: 24 }}>
        <Card title="Theme Studio Demo">
          <Space direction="vertical">
            <Typography.Text>Theme tokens are applied through ConfigProvider.</Typography.Text>
            <Button type="primary">Primary action</Button>
          </Space>
        </Card>
      </main>
    </ConfigProvider>
  );
}`;

export const claudeMdTemplate = `# Theme Studio UI Development

## Project Context
- Build React + TypeScript UI with Ant Design 6.
- Theme styling must flow through ConfigProvider theme tokens.
- Prefer component tokens before ad hoc CSS overrides.
- Keep exported Theme Studio JSON compatible with antd ThemeConfig.

## Development Rules
- Use antd components for layout, forms, navigation, feedback, and data display.
- Keep theme values centralized in token or components config.
- Do not hardcode colors that should come from colorPrimary, colorBgContainer, colorText, or borderRadius.
- Verify UI states for default, hover, active, disabled, loading, empty, and error cases.

## Output Expectations
- Explain token changes and component token choices.
- Include a minimal before/after summary when editing theme code.
- Run build or typecheck before handing work back.`;

export const mcpServerTemplate = `{
  "mcpServers": {
    "theme-studio": {
      "command": "<theme-studio-mcp-command>",
      "args": ["--project", "<absolute-project-path>"],
      "env": {
        "THEME_STUDIO_EXPORT": "./src/theme.json"
      }
    }
  }
}`;

export const systemPromptTemplate = `You are a Theme Studio UI agent.

Build UI with React, TypeScript, and Ant Design.
Use Theme Studio tokens as the design source of truth:
- Global tokens: colorPrimary, colorInfo, colorSuccess, colorWarning, colorError, borderRadius, fontFamily.
- Component tokens: Button, Card, Menu, Table, Modal, Input, Select, Tabs.

When implementing UI:
1. Choose Ant Design components before custom markup.
2. Map visual intent to theme tokens instead of one-off CSS.
3. Keep exported theme JSON valid for ConfigProvider theme.
4. Preserve accessibility, loading states, empty states, and responsive behavior.
5. Return concise implementation notes plus verification steps.`;
