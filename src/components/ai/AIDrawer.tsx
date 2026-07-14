import { App, Button, Drawer, Empty, Input, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { LLMClient } from '../../services/ai/LLMClient';
import { extractThemeFromResponse } from '../../services/ai/responseParser';
import { diffThemes } from '../../services/theme/themeDiff';
import { validateThemeConfig } from '../../services/theme/themeValidator';
import { useChatStore } from '../../stores/chatStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useVersionStore } from '../../stores/versionStore';

const suggestions = ['生成苹果风格主题', '把主色调成红色', '调整圆角为圆润风格'];

export function AIDrawer() {
  const { message } = App.useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isOpen = useUIStore((state) => state.isAIDrawerOpen);
  const closeAI = useUIStore((state) => state.closeAI);
  const openSettings = useUIStore((state) => state.openSettings);
  const llmConfig = useSettingsStore((state) => state.llmConfig);
  const isConfigured = useSettingsStore((state) => state.isConfigured);
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const clearSession = useChatStore((state) => state.clearSession);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const createVersion = useVersionStore((state) => state.createVersion);

  const lastTheme = useMemo(() => {
    for (const item of [...messages].reverse()) {
      const parsed = extractThemeFromResponse(item.content);
      if (parsed) return validateThemeConfig(parsed, currentTheme);
    }
    return null;
  }, [currentTheme, messages]);

  const diffs = lastTheme ? diffThemes(currentTheme, lastTheme) : [];

  const submit = async (value = input) => {
    if (!value.trim()) return;
    if (!isConfigured()) {
      message.warning('请先配置 AI 模型');
      openSettings();
      return;
    }

    setIsLoading(true);
    const userMessage = addMessage({ role: 'user', content: value });
    const assistant = addMessage({ role: 'assistant', content: '' });
    setInput('');

    try {
      const client = new LLMClient(llmConfig);
      let content = '';
      for await (const chunk of client.chat({ messages: [...messages, userMessage] })) {
        content += chunk.content;
        updateMessage(assistant.id, content);
      }
    } catch (error) {
      updateMessage(assistant.id, error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      title="AI Theme Agent"
      width={440}
      open={isOpen}
      onClose={closeAI}
      extra={<Button onClick={clearSession}>Clear</Button>}
    >
      {!isConfigured() && (
        <Empty description="请先配置 AI 模型">
          <Button type="primary" onClick={openSettings}>
            Open Settings
          </Button>
        </Empty>
      )}

      <Space wrap style={{ marginBottom: 16 }}>
        {suggestions.map((suggestion) => (
          <Button key={suggestion} size="small" onClick={() => submit(suggestion)}>
            {suggestion}
          </Button>
        ))}
      </Space>

      <div>
        {messages.map((item) => (
          <div key={item.id} className={`chat-message ${item.role}`}>
            {item.content || '...'}
          </div>
        ))}
      </div>

      {lastTheme && (
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
          <Typography.Text strong>Theme Diff Preview</Typography.Text>
          <pre className="diff-box">
            {diffs.slice(0, 20).map((diff) => `${diff.type} ${diff.key}: ${String(diff.oldValue)} -> ${String(diff.newValue)}`).join('\n') ||
              'No token changes detected'}
          </pre>
          <Button
            type="primary"
            block
            onClick={() => {
              createVersion(currentTheme.id, currentTheme, 'Before AI Apply');
              setTheme(lastTheme);
              message.success('AI theme applied');
            }}
          >
            Apply Theme
          </Button>
        </Space>
      )}

      <Input.Search
        enterButton="Send"
        loading={isLoading}
        value={input}
        placeholder="Describe a theme..."
        onChange={(event) => setInput(event.target.value)}
        onSearch={submit}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
}
