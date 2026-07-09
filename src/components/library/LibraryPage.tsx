import { CopyOutlined, DeleteOutlined, DownloadOutlined, ExportOutlined, ImportOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Tag, Typography } from 'antd';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import type { ThemeConfig, ThemeRecord } from '../../types';
import { exportTheme } from '../../services/theme/themeExporter';
import { validateThemeConfig } from '../../services/theme/themeValidator';
import { useLibraryStore } from '../../stores/libraryStore';
import { useThemeStore } from '../../stores/themeStore';
import { VersionPanel } from '../version/VersionPanel';

type ExportFormat = 'ts' | 'json' | 'design-token' | 'tailwind' | 'css';

const download = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export function LibraryPage() {
  const { message } = App.useApp();
  const [saveOpen, setSaveOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('ts');
  const [importText, setImportText] = useState('');
  const [form] = Form.useForm<{ name: string }>();
  const themes = useLibraryStore((state) => state.themes);
  const saveTheme = useLibraryStore((state) => state.saveTheme);
  const importTheme = useLibraryStore((state) => state.importTheme);
  const deleteTheme = useLibraryStore((state) => state.deleteTheme);
  const copyTheme = useLibraryStore((state) => state.copyTheme);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const exported = exportTheme(currentTheme, format);

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <section className="library-panel preview-padding">
        <Space wrap style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => setSaveOpen(true)}>
            Save Current Theme
          </Button>
          <Button icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
            Import JSON
          </Button>
          <Select
            value={format}
            style={{ width: 180 }}
            options={[
              { label: 'theme.ts', value: 'ts' },
              { label: 'theme.json', value: 'json' },
              { label: 'design-token.json', value: 'design-token' },
              { label: 'tailwind.config.ts', value: 'tailwind' },
              { label: 'css variables', value: 'css' },
            ]}
            onChange={setFormat}
          />
          <Button icon={<DownloadOutlined />} onClick={() => download(`theme.${format === 'json' ? 'json' : 'txt'}`, exported)}>
            Download
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => navigator.clipboard.writeText(exported).then(() => message.success('Copied'))}>
            Copy Export
          </Button>
        </Space>
        <pre className="diff-box">{exported}</pre>
      </section>

      <Row gutter={[16, 16]}>
        {themes.map((theme) => {
          const token = theme.config.token as Record<string, unknown>;
          return (
            <Col key={theme.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                title={theme.name}
                actions={[
                  <ExportOutlined key="load" onClick={() => setTheme(theme.config)} />,
                  <CopyOutlined key="copy" onClick={() => copyTheme(theme.id)} />,
                  <DeleteOutlined key="delete" onClick={() => deleteTheme(theme.id)} />,
                ]}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    {['colorPrimary', 'colorSuccess', 'colorWarning', 'colorError'].map((key) => (
                      <span
                        key={key}
                        style={{
                          display: 'inline-block',
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: String(token[key] ?? '#d9d9d9'),
                        }}
                      />
                    ))}
                  </Space>
                  <Typography.Text type="secondary">{new Date(theme.updatedAt).toLocaleString()}</Typography.Text>
                  {theme.builtIn && <Tag color="blue">Built-in</Tag>}
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <VersionPanel />

      <Modal
        title="Save Theme"
        open={saveOpen}
        onCancel={() => setSaveOpen(false)}
        onOk={() => {
          const name = form.getFieldValue('name') || currentTheme.name;
          saveTheme(name, currentTheme);
          setSaveOpen(false);
          message.success('Theme saved');
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ name: currentTheme.name }}>
          <Form.Item label="Theme name" name="name">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import Theme JSON"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={() => {
          try {
            const parsed = JSON.parse(importText) as Partial<ThemeConfig>;
            const config = validateThemeConfig(parsed, currentTheme);
            const now = new Date().toISOString();
            const record: ThemeRecord = { id: nanoid(), name: config.name || 'Imported Theme', config, createdAt: now, updatedAt: now };
            importTheme(record);
            setImportOpen(false);
            setImportText('');
            message.success('Theme imported');
          } catch {
            message.error('Invalid JSON');
          }
        }}
      >
        <Input.TextArea rows={10} value={importText} onChange={(event) => setImportText(event.target.value)} />
      </Modal>
    </Space>
  );
}

