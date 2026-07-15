import { ColorPicker, Input, InputNumber, Slider, Space } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useEffect, useRef, useState } from 'react';
import type { TokenMeta } from '../../types';

type Props = {
  meta: TokenMeta;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function TokenControl({ meta, value, onChange }: Props) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<number | null>(null);

  useEffect(() => setDraft(value), [value]);

  const debounceChange = (next: unknown) => {
    setDraft(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(next), 300);
  };

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (meta.type === 'color') {
    return (
      <ColorPicker
        value={typeof draft === 'string' ? draft : String(meta.default)}
        onChange={(color: Color) => debounceChange(color.toHexString())}
        onChangeComplete={(color: Color) => onChange(color.toHexString())}
      />
    );
  }

  if (meta.type === 'number') {
    const numeric = typeof draft === 'number' ? draft : Number(meta.default);
    return (
      <Space.Compact>
        <Slider
          style={{ width: 120 }}
          min={meta.min}
          max={meta.max}
          value={numeric}
          onChange={(next) => debounceChange(next)}
          onChangeComplete={(next) => onChange(next)}
        />
        <InputNumber min={meta.min} max={meta.max} value={numeric} onChange={(next) => onChange(next ?? meta.default)} />
      </Space.Compact>
    );
  }

  return <Input value={String(value ?? meta.default)} onChange={(event) => onChange(event.target.value)} />;
}
