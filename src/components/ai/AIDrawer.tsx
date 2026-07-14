import { ClearOutlined, RobotOutlined, SendOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { App, Button, Drawer, Input, Space, Tooltip, Typography } from 'antd';
import { useMemo, useRef, useState, useEffect } from 'react';
import { LLMClient } from '../../services/ai/LLMClient';
import { extractThemeFromResponse } from '../../services/ai/responseParser';
import { serializeThemeContext } from '../../services/ai/themeContext';
import { diffThemes } from '../../services/theme/themeDiff';
import { validateThemeConfig } from '../../services/theme/themeValidator';
import { useChatStore } from '../../stores/chatStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useVersionStore } from '../../stores/versionStore';

const suggestions = [
  { text: '生成苹果风格主题', icon: '🍎' },
  { text: '把主色调成红色', icon: '🎨' },
  { text: '调整圆角为圆润风格', icon: '✨' },
];

export function AIDrawer() {
  const { message } = App.useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const overrides = useThemeStore((state) => state.overrides);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const themeContext = serializeThemeContext(activePresetId, overrides);
      let content = '';
      for await (const chunk of client.chat({
        messages: [...messages, userMessage],
        promptOptions: { locale: llmConfig.locale, themeContext },
      })) {
        content += chunk.content;
        updateMessage(assistant.id, content);
      }
    } catch (error) {
      updateMessage(assistant.id, error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const configured = isConfigured();

  return (
    <Drawer
      title={null}
      open={isOpen}
      onClose={closeAI}
      closable={false}
      className="ai-drawer"
      size="large"
      styles={{
        body: { display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' },
        header: { display: 'none' },
      }}
    >
      {/* Header */}
      <div className="ai-drawer-header">
        <div className="ai-drawer-title">
          <div className="ai-drawer-title-icon">
            <ThunderboltOutlined />
          </div>
          <span>AI Theme Agent</span>
        </div>
        <Space size={4}>
          <Tooltip title="Clear history">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearSession}
              disabled={messages.length === 0}
            />
          </Tooltip>
          <Tooltip title="Settings">
            <Button type="text" size="small" icon={<SettingOutlined />} onClick={openSettings} />
          </Tooltip>
          <Button type="text" size="small" onClick={closeAI} style={{ fontSize: 18, lineHeight: 1 }}>×</Button>
        </Space>
      </div>

      {/* Messages area */}
      <div className="ai-drawer-messages">
        {!configured && messages.length === 0 && (
          <div className="ai-drawer-empty">
            <div className="ai-drawer-empty-icon">
              <RobotOutlined />
            </div>
            <Typography.Text strong style={{ fontSize: 15 }}>Configure AI Model</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center' }}>
              Connect an LLM provider to start generating themes with AI
            </Typography.Text>
            <Button type="primary" icon={<SettingOutlined />} onClick={openSettings} style={{ marginTop: 8 }}>
              Open Settings
            </Button>
          </div>
        )}

        {configured && messages.length === 0 && (
          <div className="ai-drawer-empty">
            <div className="ai-drawer-empty-icon">
              <ThunderboltOutlined />
            </div>
            <Typography.Text strong style={{ fontSize: 15 }}>Ready to go!</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center' }}>
              Describe the theme you want, or try a suggestion below
            </Typography.Text>
          </div>
        )}

        {messages.map((item) => (
          <div key={item.id} className={`ai-chat-bubble ${item.role}`}>
            {item.role === 'assistant' && (
              <div className="ai-chat-avatar">
                <ThunderboltOutlined />
              </div>
            )}
            <div className={`ai-chat-content ${item.role}`}>
              {item.content || (
                <span className="ai-chat-typing">
                  <span /><span /><span />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Theme diff */}
        {lastTheme && (
          <div className="ai-diff-card">
            <div className="ai-diff-card-header">
              <Typography.Text strong style={{ fontSize: 13 }}>Theme Changes</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {diffs.length} token{diffs.length !== 1 ? 's' : ''} modified
              </Typography.Text>
            </div>
            <div className="ai-diff-list">
              {diffs.slice(0, 8).map((diff) => (
                <div key={diff.key} className="ai-diff-row">
                  <span className="ai-diff-key">{diff.key}</span>
                  <span className="ai-diff-arrow">→</span>
                  <span className="ai-diff-value">{String(diff.newValue)}</span>
                </div>
              ))}
              {diffs.length > 8 && (
                <Typography.Text type="secondary" style={{ fontSize: 11, paddingInlineStart: 8 }}>
                  +{diffs.length - 8} more changes
                </Typography.Text>
              )}
              {diffs.length === 0 && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>No token changes detected</Typography.Text>
              )}
            </div>
            <Button
              type="primary"
              block
              onClick={() => {
                createVersion(currentTheme.id, currentTheme, 'Before AI Apply');
                setTheme(lastTheme);
                message.success('AI theme applied');
              }}
              style={{ marginTop: 8 }}
            >
              Apply Theme
            </Button>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && configured && (
        <div className="ai-drawer-suggestions">
          {suggestions.map((s) => (
            <button key={s.text} className="ai-suggestion-chip" onClick={() => submit(s.text)}>
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="ai-drawer-input">
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a theme style..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={isLoading}
          className="ai-input-textarea"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={() => submit()}
          loading={isLoading}
          disabled={!input.trim()}
          className="ai-send-btn"
        />
      </div>
    </Drawer>
  );
}
