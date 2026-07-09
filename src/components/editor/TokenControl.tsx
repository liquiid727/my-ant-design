import { ColorPicker, Input, InputNumber, Slider, Space } from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { TokenMeta } from '../../types';

type Props = {
  meta: TokenMeta;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function TokenControl({ meta, value, onChange }: Props) {
  if (meta.type === 'color') {
    return (
      <ColorPicker
        value={typeof value === 'string' ? value : String(meta.default)}
        onChangeComplete={(color: Color) => onChange(color.toHexString())}
      />
    );
  }

  if (meta.type === 'number') {
    const numeric = typeof value === 'number' ? value : Number(meta.default);
    return (
      <Space.Compact>
        <Slider
          style={{ width: 120 }}
          min={meta.min}
          max={meta.max}
          value={numeric}
          onChange={(next) => onChange(next)}
        />
        <InputNumber min={meta.min} max={meta.max} value={numeric} onChange={(next) => onChange(next ?? meta.default)} />
      </Space.Compact>
    );
  }

  return <Input value={String(value ?? meta.default)} onChange={(event) => onChange(event.target.value)} />;
}

