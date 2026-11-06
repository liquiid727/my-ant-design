import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** 轻量 toast：同一条消息不会互相顶掉，最多同时挂三条。 */
type Action = { label: string; run: () => void; title?: string };
type Item = { id: number; text: string; actions?: Action[] };

const listeners = new Set<(items: Item[]) => void>();
let queue: Item[] = [];
let nextId = 1;

const emit = () => {
  const snapshot = [...queue];
  listeners.forEach((listener) => listener(snapshot));
};

export const pushToast = (text: string, options: { actions?: Action[]; ttl?: number } = {}) => {
  const { actions, ttl = 1800 } = options;
  const id = nextId++;
  // 旧提示保留但剥掉操作，避免同一批历史被列好几遍
  queue = queue.map((item) => ({ ...item, actions: undefined }));
  queue = [...queue, { id, text, actions }].slice(-3);
  emit();
  window.setTimeout(() => {
    queue = queue.filter((item) => item.id !== id);
    emit();
  }, ttl);
};

export const ToastHost = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    setItems([...queue]);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => (
        <span key={item.id} className="copy-toast" role="status">
          {item.text}
          {item.actions?.map((action) => (
            <button
              key={action.label}
              type="button"
              className="copy-toast-action"
              title={action.title ?? action.label}
              onClick={() => {
                action.run();
                queue = queue.filter((entry) => entry.id !== item.id);
                emit();
              }}
            >
              {action.label}
            </button>
          ))}
        </span>
      ))}
    </div>,
    document.body,
  );
};
