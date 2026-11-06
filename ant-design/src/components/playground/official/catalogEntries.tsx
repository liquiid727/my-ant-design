import {
  Affix,
  Alert,
  Anchor,
  App,
  AutoComplete,
  Avatar,
  Badge,
  BorderBeam,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Form,
  Image,
  Input,
  InputNumber,
  Layout,
  List,
  Masonry,
  Mentions,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  QRCode,
  Radio,
  Rate,
  Result,
  Row,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Splitter,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  Tour,
  Transfer,
  Tree,
  TreeSelect,
  Typography,
  Upload,
  Watermark,
} from 'antd';
import {
  AppstoreOutlined,
  CloudUploadOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import antDesignLogo from '../../../themes/assets/ant-design.svg';

export type CatalogEntry = {
  name: string;
  /** 需要两列宽度的组件（日历、穿梭框这类） */
  wide?: boolean;
  render: () => ReactNode;
};

const small = { size: 'small' as const };

/**
 * FloatButton / BackTop 用的是 position: fixed。
 * 祖先一旦有 transform，fixed 就相对这个祖先定位——正好把它们关回格子里。
 */
const FixedBox = ({ children }: { children: ReactNode }) => (
  <div style={{ height: 40, position: 'relative', transform: 'translateZ(0)', width: '100%' }}>{children}</div>
);

/**
 * 全量组件清单：每个 antd 组件一个最小可渲染示例。
 * 覆盖率由 catalogEntries.test.ts 对着 antd 的导出列表把关——
 * 新增组件没有示例，测试就会失败。
 */
export const catalogEntries: CatalogEntry[] = [
  { name: 'Affix', render: () => <Affix offsetTop={0}><Tag>Affix</Tag></Affix> },
  { name: 'Alert', render: () => <Alert type="info" showIcon title="提示信息" /> },
  { name: 'Anchor', render: () => <Anchor items={[{ key: 'a', href: '#a', title: '锚点一' }]} /> },
  { name: 'App', render: () => <App><Typography.Text>App 上下文</Typography.Text></App> },
  { name: 'AutoComplete', render: () => <AutoComplete style={{ width: 120 }} options={[{ value: 'antd' }]} placeholder="auto" /> },
  { name: 'Avatar', render: () => <Avatar icon={<UserOutlined />} /> },
  { name: 'BackTop', render: () => <FixedBox><FloatButton.BackTop visibilityHeight={0} /></FixedBox> },
  { name: 'Badge', render: () => <Badge count={5}><Avatar shape="square" icon={<UserOutlined />} /></Badge> },
  { name: 'BorderBeam', render: () => <BorderBeam><div style={{ padding: 8 }}>Beam</div></BorderBeam> },
  { name: 'Breadcrumb', render: () => <Breadcrumb items={[{ title: '首页' }, { title: '列表' }]} /> },
  { name: 'Button', render: () => <Button {...small} type="primary">按钮</Button> },
  { name: 'Calendar', wide: true, render: () => <Calendar fullscreen={false} /> },
  { name: 'Card', render: () => <Card {...small} title="卡片" style={{ width: 160 }}>内容</Card> },
  { name: 'Carousel', render: () => <Carousel style={{ width: 140 }}><div>1</div><div>2</div></Carousel> },
  {
    name: 'Cascader',
    render: () => <Cascader style={{ width: 140 }} options={[{ value: 'a', label: 'A', children: [{ value: 'a1', label: 'A1' }] }]} />,
  },
  { name: 'Checkbox', render: () => <Checkbox defaultChecked>选项</Checkbox> },
  { name: 'Col', render: () => <Row><Col span={12}><Tag>Col 12</Tag></Col><Col span={12}><Tag>Col 12</Tag></Col></Row> },
  { name: 'Collapse', render: () => <Collapse {...small} items={[{ key: '1', label: '面板', children: '内容' }]} /> },
  { name: 'ColorPicker', render: () => <ColorPicker defaultValue="#1677ff" /> },
  { name: 'ConfigProvider', render: () => <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}><Button {...small}>覆盖</Button></ConfigProvider> },
  { name: 'DatePicker', render: () => <DatePicker placeholder="选择日期" /> },
  {
    name: 'Descriptions',
    render: () => <Descriptions {...small} column={1} items={[{ key: '1', label: '名称', children: 'Ride Atlas' }]} />,
  },
  { name: 'Divider', render: () => <Divider {...small}>分割</Divider> },
  { name: 'Drawer', render: () => <Button {...small}>抽屉（点击打开）</Button> },
  { name: 'Dropdown', render: () => <Dropdown menu={{ items: [{ key: '1', label: '菜单项' }] }}><Button {...small}>下拉菜单</Button></Dropdown> },
  { name: 'Empty', render: () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" /> },
  { name: 'Flex', render: () => <Flex gap={8}><Tag>1</Tag><Tag>2</Tag><Tag>3</Tag></Flex> },
  { name: 'FloatButton', render: () => <FixedBox><FloatButton icon={<SettingOutlined />} /></FixedBox> },
  { name: 'Form', render: () => <Form layout="inline"><Form.Item label="名称"><Input {...small} placeholder="Ride" style={{ width: 110 }} /></Form.Item></Form> },
  { name: 'Grid', render: () => <Row gutter={8}><Col span={12}><Tag>Row/Col</Tag></Col><Col span={12}><Tag>Row/Col</Tag></Col></Row> },
  { name: 'Image', render: () => <Image width={56} src={antDesignLogo} alt="antd" /> },
  { name: 'Input', render: () => <Input {...small} placeholder="输入内容" style={{ width: 140 }} /> },
  { name: 'InputNumber', render: () => <InputNumber {...small} defaultValue={3} min={0} max={10} /> },
  {
    name: 'Layout',
    render: () => (
      <Layout style={{ width: 180 }}>
        <Layout.Header style={{ height: 28, lineHeight: '28px', paddingInline: 8, fontSize: 12 }}>Header</Layout.Header>
        <Layout.Content style={{ padding: 8, fontSize: 12 }}>Content</Layout.Content>
      </Layout>
    ),
  },
  { name: 'List', render: () => <List {...small} dataSource={['条目一', '条目二']} renderItem={(item) => <List.Item>{item}</List.Item>} style={{ width: 160 }} /> },
  { name: 'Masonry', render: () => <Masonry columns={2} items={[{ key: '1', data: 1 }, { key: '2', data: 2 }, { key: '3', data: 3 }]} itemRender={(item) => <div style={{ padding: 6 }}>{String(item.key)}</div>} /> },
  { name: 'Mentions', render: () => <Mentions style={{ width: 140 }} options={[{ value: 'antd' }]} placeholder="@" /> },
  { name: 'Menu', render: () => <Menu style={{ width: 150, fontSize: 12 }} selectedKeys={['1']} items={[{ key: '1', icon: <HomeOutlined />, label: '首页' }]} /> },
  { name: 'Modal', render: () => <Button {...small}>弹窗（点击打开）</Button> },
  { name: 'Pagination', render: () => <Pagination {...small} total={50} /> },
  { name: 'Popconfirm', render: () => <Popconfirm title="确认？"><Button {...small}>气泡确认</Button></Popconfirm> },
  { name: 'Popover', render: () => <Popover content="气泡内容"><Button {...small}>气泡卡片</Button></Popover> },
  { name: 'Progress', render: () => <Progress percent={60} size="small" style={{ width: 140 }} /> },
  { name: 'QRCode', render: () => <QRCode size={64} value="https://ant.design" /> },
  { name: 'Radio', render: () => <Radio.Group defaultValue="a"><Radio value="a">A</Radio><Radio value="b">B</Radio></Radio.Group> },
  { name: 'Rate', render: () => <Rate defaultValue={3} style={{ fontSize: 16 }} /> },
  { name: 'Result', render: () => <Result status="success" title="完成" style={{ padding: 0 }} /> },
  { name: 'Row', render: () => <Row gutter={8}><Col span={12}><Tag>Row</Tag></Col><Col span={12}><Tag>Row</Tag></Col></Row> },
  { name: 'Segmented', render: () => <Segmented {...small} options={['日', '周']} /> },
  { name: 'Select', render: () => <Select {...small} style={{ width: 120 }} defaultValue="a" options={[{ value: 'a', label: '选项 A' }]} /> },
  { name: 'Skeleton', render: () => <Skeleton active paragraph={{ rows: 2 }} title={false} style={{ width: 160 }} /> },
  { name: 'Slider', render: () => <Slider defaultValue={40} style={{ width: 140 }} /> },
  { name: 'Space', render: () => <Space size={8}><Tag>1</Tag><Tag>2</Tag></Space> },
  { name: 'Spin', render: () => <Spin {...small} /> },
  {
    name: 'Splitter',
    render: () => (
      <Splitter style={{ height: 60, width: 180 }}>
        <Splitter.Panel>左</Splitter.Panel>
        <Splitter.Panel>右</Splitter.Panel>
      </Splitter>
    ),
  },
  { name: 'Statistic', render: () => <Statistic {...small} title="总量" value={1128} /> },
  { name: 'Steps', render: () => <Steps {...small} current={1} items={[{ title: '一' }, { title: '二' }]} /> },
  { name: 'Switch', render: () => <Switch defaultChecked size="small" /> },
  {
    name: 'Table',
    render: () => (
      <Table
        {...small}
        pagination={false}
        style={{ width: 220 }}
        columns={[{ title: '名称', dataIndex: 'name' }]}
        dataSource={[{ key: '1', name: 'Ride Atlas' }]}
      />
    ),
  },
  { name: 'Tabs', render: () => <Tabs {...small} items={[{ key: '1', label: '一', children: '内容一' }]} /> },
  { name: 'Tag', render: () => <Tag color="blue">标签</Tag> },
  { name: 'TimePicker', render: () => <TimePicker placeholder="时间" /> },
  { name: 'Timeline', render: () => <Timeline {...small} items={[{ content: '事件一' }]} /> },
  { name: 'Tooltip', render: () => <Tooltip title="提示"><Button {...small}>悬停</Button></Tooltip> },
  { name: 'Tour', render: () => <Button {...small} icon={<InfoCircleOutlined />}>引导</Button> },
  {
    name: 'Transfer',
    wide: true,
    render: () => (
      <Transfer
        {...small}
        dataSource={[{ key: '1', title: '条目一' }, { key: '2', title: '条目二' }]}
        targetKeys={['1']}
        render={(item) => item.title}
        titles={['源', '目标']}
      />
    ),
  },
  { name: 'Tree', render: () => <Tree {...small} defaultExpandAll treeData={[{ key: '1', title: '节点', children: [{ key: '2', title: '子节点' }] }]} /> },
  { name: 'TreeSelect', render: () => <TreeSelect {...small} style={{ width: 140 }} treeData={[{ value: 'a', title: '节点' }]} placeholder="树选择" /> },
  { name: 'Typography', render: () => <Typography.Title level={5} style={{ margin: 0 }}>标题</Typography.Title> },
  { name: 'Upload', render: () => <Upload showUploadList={false} beforeUpload={() => false}><Button {...small} icon={<CloudUploadOutlined />}>上传</Button></Upload> },
  { name: 'Watermark', render: () => <Watermark content="antd" style={{ width: 140 }}><div style={{ height: 48 }} /></Watermark> },
];

/** 不是可渲染组件、只能通过 API 或对象访问的导出。 */
export const NON_VISUAL_EXPORTS = ['message', 'notification', 'theme', 'version'] as const;
