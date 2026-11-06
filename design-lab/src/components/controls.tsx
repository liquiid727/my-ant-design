/**
 * 站内控件：按钮、输入、分段、标签，全部读组件 token，不再用浏览器默认样式。
 * 只有这里出现的控件才能进页面——门禁的"禁止硬编码"也就能守住它们。
 */
import { cloneElement, isValidElement, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet';

export const Button = ({
  variant = 'primary',
  size = 'md',
  block = false,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  block?: boolean;
}) => (
  <button
    type="button"
    {...rest}
    className={`ctl-button ${className}`.trim()}
    data-variant={variant}
    data-size={size}
    data-block={block || undefined}
  >
    {children}
  </button>
);

export const Segmented = <T extends string | number>({
  value,
  options,
  onChange,
  label,
  semantics = 'group',
}: {
  value: T;
  options: { id: T; label: ReactNode; title?: string; disabled?: boolean }[];
  onChange: (value: T) => void;
  label?: string;
  /** tablist 用于真正的标签页；group 用于其余的分段选择 */
  semantics?: 'group' | 'tablist';
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    let next = activeIndex;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else next = (activeIndex + delta + options.length) % options.length;

    const target = options[next];
    if (!target || target.disabled) return;
    onChange(target.id);
    refs.current[next]?.focus();
  };

  return (
    <div className="ctl-segmented" role={semantics} aria-label={label} onKeyDown={handleKeyDown}>
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          className="ctl-segment"
          data-active={value === option.id}
          title={option.title}
          disabled={option.disabled}
          role={semantics === 'tablist' ? 'tab' : 'button'}
          aria-selected={semantics === 'tablist' ? value === option.id : undefined}
          aria-pressed={semantics === 'group' ? value === option.id : undefined}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export const Field = ({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) => {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  // 只有单个输入控件时才注入无障碍属性；包着一组控件的容器不注入
  const child =
    isValidElement(children) && (children.type === TextInput || children.type === TextArea)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })
      : children;

  return (
    <div className="ctl-field" data-invalid={error ? 'true' : undefined}>
      {label ? (
        <label className="ctl-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {child}
      {error ? (
        <p className="ctl-error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ctl-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export const TextInput = ({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...rest} className={`ctl-input ${className}`.trim()} />
);

export const TextArea = ({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...rest} className={`ctl-input ctl-textarea ${className}`.trim()} />
);

export const Checkbox = ({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) => (
  <label className="ctl-checkbox">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span>{children}</span>
  </label>
);

export const Chip = ({
  active = false,
  children,
  onClick,
  title,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) => (
  <button type="button" className="ctl-chip" data-active={active} onClick={onClick} title={title}>
    {children}
  </button>
);
