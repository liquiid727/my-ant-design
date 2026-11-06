import { useCallback, useState } from 'react';
import { pushToast } from './toast';

/** 最近三次复制前的剪贴板内容（带时间），撤销时回退。 */
type Snapshot = { value: string; at: number };
const clipboardHistory: Snapshot[] = [];

const rememberClipboard = (value: string | null) => {
  if (!value) return;
  clipboardHistory.push({ value, at: Date.now() });
  if (clipboardHistory.length > 3) clipboardHistory.shift();
};

const removeFromHistory = (snapshot: Snapshot) => {
  const index = clipboardHistory.indexOf(snapshot);
  if (index >= 0) clipboardHistory.splice(index, 1);
};

const clock = (at: number) =>
  new Date(at).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const preview = (value: string) => {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return '空';
  return text.length > 10 ? `${text.slice(0, 10)}…` : text;
};

/** 复制：优先 Clipboard API，不可用时退回 execCommand，两次都失败则不给假反馈。 */
export const useCopy = (timeout = 1600) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      // 先记住旧的剪贴板，成功后才提供"撤销"
      let previous: string | null = null;
      try {
        previous = await navigator.clipboard.readText();
      } catch {
        previous = null;
      }
      rememberClipboard(previous);

      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }

      if (!ok) {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          ok = document.execCommand('copy');
        } catch {
          ok = false;
        }
        document.body.removeChild(area);
      }

      if (!ok) return false;
      setCopied(true);
      pushToast('已复制到剪贴板', {
        ttl: 2600,
        actions: [...clipboardHistory]
          .reverse()
          .slice(0, 3)
          .map((snapshot) => ({
            label: `↩ ${preview(snapshot.value)}`,
            title: `${snapshot.value || '（空）'}\n复至于 ${clock(snapshot.at)} 之前的剪贴板`,
            run: () => {
              void navigator.clipboard.writeText(snapshot.value).catch(() => undefined);
              removeFromHistory(snapshot);
              pushToast(`已回退到 ${clock(snapshot.at)} 的剪贴板`);
            },
          })),
      });
      window.setTimeout(() => setCopied(false), timeout);
      return true;
    },
    [timeout],
  );

  return { copied, copy };
};

export const CopyButton = ({
  text,
  label = '复制',
  className = 'code-copy',
}: {
  text: string;
  label?: string;
  className?: string;
}) => {
  const { copied, copy } = useCopy();

  return (
    <button type="button" className={className} onClick={() => void copy(text)} aria-label={copied ? '已复制' : label}>
      {copied ? '已复制' : label}
    </button>
  );
};

/** 代码块 + 复制按钮。 */
export const CodeBlock = ({ code, label = '复制' }: { code: string; label?: string }) => (
  <div className="code-wrap">
    <CopyButton text={code} label={label} />
    <pre className="code">
      <code>{code}</code>
    </pre>
  </div>
);
