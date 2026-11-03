import { ApiOutlined, CheckCircleFilled, CodeOutlined, KeyOutlined, LinkOutlined, RobotOutlined } from '@ant-design/icons';
import { App, AutoComplete, Button, Collapse, Divider, Form, Input, Modal, Select, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { LLMConfig, LLMProvider } from '../../types';
import { LLMClient } from '../../services/ai/LLMClient';
import { buildSystemPrompt } from '../../services/ai/systemPrompt';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

const providerDefaults: Record<LLMProvider, { baseURL: string; model: string; models: string[] }> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-5.5',
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.6', 'gpt-4o-mini', 'gpt-4o'],
  },
  deepseek: { baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat', models: ['deepseek-chat'] },
  qwen: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', models: ['qwen-plus', 'qwen-max'] },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', models: ['openai/gpt-4o-mini'] },
  claude: { baseURL: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-latest', models: ['claude-3-5-sonnet-latest'] },
  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-1.5-flash', models: ['gemini-1.5-flash'] },
  custom: { baseURL: '', model: '', models: [] },
};

const providerLabels: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  qwen: 'Qwen (通义千问)',
  openrouter: 'OpenRouter',
  claude: 'Anthropic Claude',
  gemini: 'Google Gemini',
  custom: 'Custom Provider',
};

const maskApiKey = (apiKey: string) => {
  if (!apiKey) return 'Stored as sk-****xxxx after you save a key.';
  const suffix = apiKey.slice(-4).padStart(4, '*');
  return `Saved key displays as sk-****${suffix}.`;
};

export function SettingsModal() {
  const { message } = App.useApp();
  const [form] = Form.useForm<LLMConfig>();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const isOpen = useUIStore((state) => state.isSettingsOpen);
  const closeSettings = useUIStore((state) => state.closeSettings);
  const llmConfig = useSettingsStore((state) => state.llmConfig);
  const setLLMConfig = useSettingsStore((state) => state.setLLMConfig);

  const provider = Form.useWatch('provider', form) ?? llmConfig.provider;
  const locale = Form.useWatch('locale', form) ?? llmConfig.locale;
  const apiKey = Form.useWatch('apiKey', form) ?? llmConfig.apiKey;
  const models = providerDefaults[provider].models;

  const promptPreview = useMemo(
    () => buildSystemPrompt({ locale: locale ?? undefined }),
    [locale],
  );

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={closeSettings}
      width={520}
      footer={
        <div className="settings-modal-footer">
          <Button
            className="settings-test-btn"
            icon={<ApiOutlined />}
            loading={testing}
            onClick={async () => {
              const values = form.getFieldsValue();
              setTesting(true);
              setTestResult(null);
              const result = await new LLMClient(values).testConnection();
              setTesting(false);
              if (result.ok) {
                setTestResult('success');
                message.success('Connection succeeded');
              } else {
                setTestResult('error');
                message.error(result.error);
              }
            }}
          >
            {testResult === 'success' ? 'Connected' : 'Test Connection'}
          </Button>
          <Space>
            <Button onClick={closeSettings}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => {
                const values = form.getFieldsValue();
                setLLMConfig(values);
                closeSettings();
                message.success('Settings saved');
              }}
            >
              Save
            </Button>
          </Space>
        </div>
      }
      afterOpenChange={(open) => {
        if (open) {
          form.setFieldsValue(llmConfig);
          setTestResult(null);
        }
      }}
      className="settings-modal"
    >
      <div className="settings-modal-header">
        <div className="settings-modal-icon">
          <RobotOutlined />
        </div>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>AI Model Settings</Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Configure the LLM provider for AI theme generation
          </Typography.Text>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <Form form={form} layout="vertical" initialValues={llmConfig} className="settings-form" requiredMark={false}>
        <Form.Item label="Provider" name="provider" rules={[{ required: true }]}>
          <Select
            options={Object.entries(providerLabels).map(([key, label]) => ({
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {label}
                  {key === 'custom' && <Tag color="default" style={{ fontSize: 11, lineHeight: '18px', marginInlineEnd: 0 }}>Advanced</Tag>}
                </span>
              ),
              value: key,
            }))}
            onChange={(next: LLMProvider) => {
              const defaults = providerDefaults[next];
              form.setFieldsValue({ provider: next, baseURL: defaults.baseURL, model: defaults.model });
              setTestResult(null);
            }}
          />
        </Form.Item>
        <Form.Item label="Base URL" name="baseURL" rules={[{ required: true }]}>
          <Input prefix={<LinkOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="https://api.openai.com/v1" />
        </Form.Item>
        <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
          <Input.Password prefix={<KeyOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} placeholder="sk-..." />
        </Form.Item>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16, fontSize: 12 }}>
          {maskApiKey(apiKey)}
        </Typography.Text>
        <Form.Item label="Model" name="model" rules={[{ required: true }]}>
          <AutoComplete
            options={models.map((model) => ({ label: model, value: model }))}
            placeholder="Select or enter a model"
          />
        </Form.Item>
        <Form.Item label="AI Language" name="locale">
          <Select
            allowClear
            placeholder="Auto-detect"
            options={[
              { label: '中文 (zh-CN)', value: 'zh-CN' },
              { label: 'English (en-US)', value: 'en-US' },
            ]}
          />
        </Form.Item>

        {testResult === 'success' && (
          <div className="settings-test-success">
            <CheckCircleFilled style={{ color: '#52c41a' }} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Connection verified successfully</Typography.Text>
          </div>
        )}

        <Collapse
          ghost
          size="small"
          items={[
            {
              key: 'prompt',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <CodeOutlined /> AI Prompt Preview
                </span>
              ),
              children: (
                <pre className="settings-prompt-preview">
                  {promptPreview}
                </pre>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
