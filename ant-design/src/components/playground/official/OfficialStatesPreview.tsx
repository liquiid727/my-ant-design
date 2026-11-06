import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  Menu,
  Progress,
  Radio,
  Select,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ConfigProviderProps } from 'antd';
import type { ReactNode } from 'react';

type InteractionState = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'error';
type SemanticState = 'info' | 'success' | 'warning' | 'error' | 'loading';

const INTERACTION_STATES: Array<{ key: InteractionState; label: string }> = [
  { key: 'default', label: 'Default' },
  { key: 'hover', label: 'Hover' },
  { key: 'focus', label: 'Focus' },
  { key: 'active', label: 'Active' },
  { key: 'disabled', label: 'Disabled' },
  { key: 'loading', label: 'Loading' },
  { key: 'error', label: 'Error' },
];

const SEMANTIC_STATES: Array<{ key: SemanticState; label: string }> = [
  { key: 'info', label: 'Info' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
  { key: 'loading', label: 'Loading' },
];

const EM_DASH = <Typography.Text type="secondary">—</Typography.Text>;

const interactionRows: Array<{ id: string; label: string; render: (state: InteractionState) => ReactNode }> = [
  {
    id: 'button',
    label: 'Button',
    render: (state) => {
      if (state === 'disabled') return <Button size="small" type="primary" disabled>按钮</Button>;
      if (state === 'loading') return <Button size="small" type="primary" loading>按钮</Button>;
      if (state === 'error') return <Button size="small" danger>按钮</Button>;
      return <Button size="small" type="primary">按钮</Button>;
    },
  },
  {
    id: 'input',
    label: 'Input',
    render: (state) => {
      if (state === 'disabled') return <Input size="small" disabled placeholder="输入" />;
      if (state === 'error') return <Input size="small" status="error" placeholder="输入" />;
      if (state === 'loading') return EM_DASH;
      return <Input size="small" placeholder="输入" />;
    },
  },
  {
    id: 'select',
    label: 'Select',
    render: (state) => {
      const options = [{ value: 'a', label: '选项 A' }];
      if (state === 'disabled') return <Select size="small" disabled options={options} placeholder="选择" />;
      if (state === 'loading') return <Select size="small" loading options={options} placeholder="选择" />;
      if (state === 'error') return <Select size="small" status="error" options={options} placeholder="选择" />;
      if (state === 'active') return EM_DASH;
      return <Select size="small" options={options} placeholder="选择" />;
    },
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    render: (state) => {
      if (state === 'disabled') return <Checkbox disabled defaultChecked>选项</Checkbox>;
      if (state === 'error' || state === 'loading' || state === 'active') return EM_DASH;
      return <Checkbox defaultChecked>选项</Checkbox>;
    },
  },
  {
    id: 'radio',
    label: 'Radio',
    render: (state) => {
      if (state === 'disabled') return <Radio disabled defaultChecked>选项</Radio>;
      if (state === 'error' || state === 'loading' || state === 'active') return EM_DASH;
      return <Radio defaultChecked>选项</Radio>;
    },
  },
  {
    id: 'switch',
    label: 'Switch',
    render: (state) => {
      if (state === 'disabled') return <Switch size="small" disabled defaultChecked />;
      if (state === 'loading') return <Switch size="small" loading defaultChecked />;
      if (state === 'error' || state === 'active') return EM_DASH;
      return <Switch size="small" defaultChecked />;
    },
  },
  {
    id: 'menu',
    label: 'Menu',
    render: (state) => {
      if (state === 'disabled') return <Menu style={{ width: 120, fontSize: 12 }} items={[{ key: '1', label: '菜单项', disabled: true }]} />;
      if (state === 'active') return <Menu style={{ width: 120, fontSize: 12 }} selectedKeys={['1']} items={[{ key: '1', label: '菜单项' }]} />;
      if (state === 'error' || state === 'loading') return EM_DASH;
      return <Menu style={{ width: 120, fontSize: 12 }} items={[{ key: '1', label: '菜单项' }]} />;
    },
  },
  {
    id: 'table',
    label: 'Table',
    render: (state) => {
      if (state === 'loading') return <Table size="small" loading pagination={false} columns={[{ title: '名称', dataIndex: 'name' }]} dataSource={[{ key: '1', name: 'Ride' }]} style={{ width: 150 }} />;
      if (state === 'disabled' || state === 'error' || state === 'active') return EM_DASH;
      return (
        <Table
          size="small"
          pagination={false}
          columns={[{ title: '名称', dataIndex: 'name' }]}
          dataSource={[{ key: '1', name: 'Ride' }]}
          style={{ width: 150 }}
        />
      );
    },
  },
];

const semanticRows: Array<{ id: string; label: string; render: (state: SemanticState) => ReactNode }> = [
  {
    id: 'alert',
    label: 'Alert',
    render: (state) => {
      if (state === 'loading') return EM_DASH;
      return <Alert type={state} showIcon title={state} />;
    },
  },
  {
    id: 'tag',
    label: 'Tag',
    render: (state) => {
      if (state === 'loading') return EM_DASH;
      const color = { info: 'blue', success: 'green', warning: 'gold', error: 'red' }[state];
      return <Tag color={color}>{state}</Tag>;
    },
  },
  {
    id: 'badge',
    label: 'Badge',
    render: (state) => {
      if (state === 'loading') return <Badge status="processing" text="处理中" />;
      return <Badge status={state === 'info' ? 'default' : state} text={state} />;
    },
  },
  {
    id: 'progress',
    label: 'Progress',
    render: (state) => {
      if (state === 'loading') return <Progress percent={40} status="active" size="small" style={{ width: 120 }} />;
      if (state === 'info') return <Progress percent={40} size="small" style={{ width: 120 }} />;
      if (state === 'error') return <Progress percent={40} status="exception" size="small" style={{ width: 120 }} />;
      if (state === 'success') return <Progress percent={100} status="success" size="small" style={{ width: 120 }} />;
      return <Progress percent={40} status="normal" size="small" style={{ width: 120 }} />;
    },
  },
  {
    id: 'steps',
    label: 'Steps',
    render: (state) => {
      if (state === 'loading') return <Steps size="small" current={1} status="process" items={[{ title: '一' }, { title: '二' }]} />;
      if (state === 'error') return <Steps size="small" current={1} status="error" items={[{ title: '一' }, { title: '二' }]} />;
      if (state === 'success') return <Steps size="small" current={2} items={[{ title: '一' }, { title: '二' }]} />;
      return <Steps size="small" current={1} items={[{ title: '一' }, { title: '二' }]} />;
    },
  },
];

const gridStyle = (columns: number) => ({
  display: 'grid',
  gridTemplateColumns: `120px repeat(${columns}, minmax(110px, 1fr))`,
});

export function OfficialStatesPreview({ config }: { config: ConfigProviderProps }) {
  return (
    <ConfigProvider {...config}>
      <div className="states-panel">
        <Typography.Paragraph type="secondary" className="states-hint">
          Hover / Focus / Active 是伪类，需要真实交互：把鼠标移到格子上，或用 Tab 聚焦。窄屏可横向滚动查看全部状态。
        </Typography.Paragraph>

        <Typography.Title level={5} className="states-title">交互状态</Typography.Title>
        <div className="states-grid" style={gridStyle(INTERACTION_STATES.length)}>
          <div className="states-head" />
          {INTERACTION_STATES.map((state) => (
            <div className="states-head" key={state.key}>{state.label}</div>
          ))}
          {interactionRows.map((row) => (
            <div className="states-row" key={row.id} style={{ display: 'contents' }}>
              <div className="states-label">{row.label}</div>
              {INTERACTION_STATES.map((state) => (
                <div className="states-cell" key={state.key}>{row.render(state.key)}</div>
              ))}
            </div>
          ))}
        </div>

        <Typography.Title level={5} className="states-title">语义状态</Typography.Title>
        <div className="states-grid" style={gridStyle(SEMANTIC_STATES.length)}>
          <div className="states-head" />
          {SEMANTIC_STATES.map((state) => (
            <div className="states-head" key={state.key}>{state.label}</div>
          ))}
          {semanticRows.map((row) => (
            <div className="states-row" key={row.id} style={{ display: 'contents' }}>
              <div className="states-label">{row.label}</div>
              {SEMANTIC_STATES.map((state) => (
                <div className="states-cell" key={state.key}>{row.render(state.key)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
}
