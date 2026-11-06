/**
 * 顶栏的预览主题选择：一个小的图标按钮 + 下拉。
 * 图标跟随当前主题（深色=月亮，浅色=太阳），菜单里的色块则按各自主题的对比度取色。
 */
import { useEffect, useRef, useState } from 'react';
import type { ThemeName } from '../lab/model';

const OPTIONS: { id: ThemeName; label: string }[] = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
];

const SunIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.4v2.2M12 19.4v2.2M4.2 12H2M22 12h-2.2M5.6 5.6 7.2 7.2M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6" />
  </svg>
);

const MoonIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20.4 15.1A8.6 8.6 0 0 1 9 3.7a8.6 8.6 0 1 0 11.4 11.4Z"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const ThemeMenu = ({ value, onChange }: { value: ThemeName; onChange: (theme: ThemeName) => void }) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const current = OPTIONS.find((option) => option.id === value) ?? OPTIONS[1];

  // 打开时焦点落到当前项，键盘可以直接上下切
  useEffect(() => {
    if (!open) return;
    const index = Math.max(0, OPTIONS.findIndex((option) => option.id === value));
    items.current[index]?.focus();
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };

  const pick = (theme: ThemeName) => {
    onChange(theme);
    close();
  };

  // 上下键只挪焦点并即时预览，菜单留着；回车/点击才算选定并收起
  const move = (delta: number) => {
    const index = Math.max(0, OPTIONS.findIndex((option) => option.id === value));
    const next = (index + delta + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[next].id);
    items.current[next]?.focus();
  };

  return (
    <div
      className="topbar-theme"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        type="button"
        ref={trigger}
        className="topbar-theme-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`预览主题 · ${current.label}`}
        title={`预览主题 · ${current.label}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {value === 'light' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      </button>

      {open ? (
        <div className="topbar-theme-menu" role="listbox" aria-label="预览主题">
          {OPTIONS.map((option, index) => (
            <button
              key={option.id}
              ref={(node) => {
                items.current[index] = node;
              }}
              type="button"
              role="option"
              aria-selected={option.id === value}
              className="topbar-theme-option"
              tabIndex={-1}
              onClick={() => pick(option.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  move(1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  move(-1);
                } else if (event.key === 'Tab') {
                  close(false);
                }
              }}
            >
              <span className="topbar-theme-swatch" data-theme={option.id} aria-hidden="true">
                {option.id === 'light' ? <SunIcon size={12} /> : <MoonIcon size={12} />}
              </span>
              <span className="topbar-theme-label">{option.label}</span>
              <span className="topbar-theme-check" aria-hidden="true">
                <CheckIcon />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
