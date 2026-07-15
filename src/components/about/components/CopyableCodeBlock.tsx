import { Typography } from 'antd';

export function CopyableCodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="about-code-artifact" aria-label={label}>
      <Typography.Paragraph className="about-code-copy" copyable={{ text: code, tooltips: ['复制', '已复制'] }}>
        <pre className="about-code-block"><code>{code}</code></pre>
      </Typography.Paragraph>
    </div>
  );
}
