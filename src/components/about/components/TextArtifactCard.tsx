import { CopyOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { App, Button, Card, Space, Typography } from 'antd';
import type { TextArtifact } from '../../../services/docs/textArtifact';
import { copyTextArtifact, downloadTextArtifact } from '../../../services/docs/textArtifact';

type Props = {
  artifact: TextArtifact;
  title: string;
  description: string;
};

export function TextArtifactCard({ artifact, title, description }: Props) {
  const { message } = App.useApp();

  const copy = async () => {
    try {
      await copyTextArtifact(artifact.content);
      message.success(`${artifact.filename} 已复制`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '复制失败');
    }
  };

  const download = () => {
    try {
      downloadTextArtifact(artifact);
      message.success(`${artifact.filename} 下载已开始`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '下载失败');
    }
  };

  return (
    <Card
      className="about-section-card about-artifact-card"
      title={<Space><FileTextOutlined />{title}</Space>}
      extra={(
        <Space wrap>
          <Button icon={<CopyOutlined />} onClick={copy}>复制</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={download}>下载</Button>
        </Space>
      )}
    >
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <div className="about-artifact-meta"><Typography.Text code>{artifact.filename}</Typography.Text></div>
      <pre className="about-artifact-preview" aria-label={`${artifact.filename} 完整预览`}><code>{artifact.content}</code></pre>
    </Card>
  );
}
