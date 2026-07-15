import { Card, Space, Typography } from 'antd';

export function DesignDocumentSection() {
  return (
    <Space orientation="vertical" size={16} className="about-section-stack">
      <Card className="about-section-card">
        <Typography.Title level={3}>design.md 设计规范</Typography.Title>
        <Typography.Paragraph type="secondary">
          根据当前 Theme 与 Token Registry 生成可预览、复制和下载的设计规范，不调用 LLM，也不读取聊天或设置数据。
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
