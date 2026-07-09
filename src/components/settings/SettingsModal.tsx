import { App, Button, Form, Input, Modal, Select, Space } from 'antd';
import type { LLMConfig, LLMProvider } from '../../types';
import { LLMClient } from '../../services/ai/LLMClient';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

const providerDefaults: Record<LLMProvider, { baseURL: string; model: string; models: string[] }> = {
  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini', models: ['gpt-4o-mini', 'gpt-4o'] },
  deepseek: { baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat', models: ['deepseek-chat'] },
  qwen: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', models: ['qwen-plus', 'qwen-max'] },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', models: ['openai/gpt-4o-mini'] },
  claude: { baseURL: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-latest', models: ['claude-3-5-sonnet-latest'] },
  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-1.5-flash', models: ['gemini-1.5-flash'] },
  custom: { baseURL: '', model: '', models: [] },
};

export function SettingsModal() {
  const { message } = App.useApp();
  const [form] = Form.useForm<LLMConfig>();
  const isOpen = useUIStore((state) => state.isSettingsOpen);
  const closeSettings = useUIStore((state) => state.closeSettings);
  const llmConfig = useSettingsStore((state) => state.llmConfig);
  const setLLMConfig = useSettingsStore((state) => state.setLLMConfig);

  const provider = Form.useWatch('provider', form) ?? llmConfig.provider;
  const models = providerDefaults[provider].models;

  return (
    <Modal
      title="Settings"
      open={isOpen}
      onCancel={closeSettings}
      onOk={() => {
        const values = form.getFieldsValue();
        setLLMConfig(values);
        closeSettings();
        message.success('Settings saved');
      }}
      afterOpenChange={(open) => open && form.setFieldsValue(llmConfig)}
    >
      <Form form={form} layout="vertical" initialValues={llmConfig}>
        <Form.Item label="Provider" name="provider" rules={[{ required: true }]}>
          <Select
            options={Object.keys(providerDefaults).map((key) => ({ label: key, value: key }))}
            onChange={(next: LLMProvider) => {
              const defaults = providerDefaults[next];
              form.setFieldsValue({ provider: next, baseURL: defaults.baseURL, model: defaults.model });
            }}
          />
        </Form.Item>
        <Form.Item label="Base URL" name="baseURL" rules={[{ required: true }]}>
          <Input placeholder="https://api.openai.com/v1" />
        </Form.Item>
        <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
          <Input.Password placeholder="sk-..." />
        </Form.Item>
        <Form.Item label="Model" name="model" rules={[{ required: true }]}>
          <Select mode="tags" options={models.map((model) => ({ label: model, value: model }))} />
        </Form.Item>
        <Space>
          <Button
            onClick={async () => {
              const values = form.getFieldsValue();
              const result = await new LLMClient(values).testConnection();
              if (result.ok) message.success('Connection succeeded');
              else message.error(result.error);
            }}
          >
            Test Connection
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}

