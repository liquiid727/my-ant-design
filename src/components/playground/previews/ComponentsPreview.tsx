import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  ColorPicker,
  DatePicker,
  Divider,
  Dropdown,
  Flex,
  Input,
  Popconfirm,
  Progress,
  QRCode,
  Radio,
  Rate,
  Segmented,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import {
  AppleFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  DownOutlined,
  FacebookFilled,
  GoogleOutlined,
  MailOutlined,
  MessageOutlined,
  TwitterOutlined,
  YoutubeFilled,
} from '@ant-design/icons';

export function ComponentsPreview() {
  const { token } = theme.useToken();
  const previewVars = {
    '--preview-primary': token.colorPrimary,
    '--preview-primary-hover': token.colorPrimaryHover,
    '--preview-success': token.colorSuccess,
    '--preview-error': token.colorError,
    '--preview-warning': token.colorWarning,
    '--preview-text': token.colorText,
    '--preview-text-secondary': token.colorTextSecondary,
    '--preview-border': token.colorBorder,
    '--preview-bg': token.colorBgContainer,
    '--preview-bg-elevated': token.colorBgElevated,
    '--preview-fill': token.colorFillSecondary,
    '--preview-radius': `${token.borderRadius}px`,
    '--preview-radius-lg': `${token.borderRadiusLG}px`,
    '--preview-shadow': token.boxShadowSecondary,
  } as React.CSSProperties;

  return (
    <div className="reference-grid" style={previewVars}>
      <div className="reference-column reference-left">
        <div className="control-strip">
          <Input className="soft-input email-input" placeholder="antd@email.com" />
          <Select
            className="soft-select fruit-select"
            mode="multiple"
            defaultValue={['Apple', 'Banana']}
            options={[
              { value: 'Apple', label: 'Apple' },
              { value: 'Banana', label: 'Banana' },
              { value: 'Pear', label: 'Pear' },
            ]}
          />
          <div className="color-field">
            <ColorPicker value={token.colorPrimary} />
            <span>{token.colorPrimary.toUpperCase()}</span>
          </div>
          <Dropdown menu={{ items: [{ key: 'dropdown', label: 'Theme option' }] }}>
            <Button className="soft-button">
              Dropdown <DownOutlined />
            </Button>
          </Dropdown>
          <DatePicker className="soft-picker" placeholder="Select Date" />
        </div>

        <div className="toggle-row">
          <Checkbox defaultChecked>Apple</Checkbox>
          <Checkbox>Pear</Checkbox>
          <Radio defaultChecked>Apple</Radio>
          <Radio>Pear</Radio>
          <Switch defaultChecked />
          <Spin size="small" />
        </div>

        <div className="process-row">
          <span className="process-step done">
            <CheckCircleFilled /> Finished
          </span>
          <span className="process-line hot" />
          <span className="process-step danger">
            <CloseCircleFilled /> In Process
          </span>
          <span className="process-line" />
          <span className="process-step muted">
            <b>3</b> Waiting
          </span>
        </div>

        <div className="progress-block">
          <Progress percent={50} showInfo strokeWidth={8} strokeColor={token.colorPrimary} />
          <Progress percent={70} showInfo={false} status="exception" strokeWidth={8} strokeColor={token.colorError} />
        </div>

        <div className="status-row">
          <Badge color={token.colorSuccess} text="Success" />
          <Badge color={token.colorError} text="Error" />
          <Badge color={token.colorTextTertiary} text="Default" />
          <Badge color={token.colorPrimary} text="Processing" />
          <Badge color={token.colorWarning} text="Warning" />
        </div>

        <div className="media-grid">
          <div className="qr-card">
            <QRCode value="https://ant.design" size={170} />
          </div>
          <div className="signal-stack">
            <Flex gap={42} align="center">
              <Spin />
              <Spin indicator={<span className="dot-spinner" />} />
              <Rate defaultValue={3} />
            </Flex>
            <div className="social-row">
              <Tag icon={<TwitterOutlined />} color="blue">
                Twitter
              </Tag>
              <Tag icon={<YoutubeFilled />} color="red">
                Youtube
              </Tag>
              <Tag icon={<FacebookFilled />} color="geekblue">
                Facebook
              </Tag>
            </div>
            <Popconfirm title="Are you OK?">
              <div className="confirm-pop">
                <span className="warning-dot">!</span>
                <span>Are you OK?</span>
                <Button size="small">取消</Button>
                <Button size="small" type="primary">
                  确定
                </Button>
              </div>
            </Popconfirm>
          </div>
        </div>

        <div className="segmented-card">
          <Segmented block defaultValue="1D" options={['1D', '7D', '1M', '1Y', 'All']} />
          <Segmented
            block
            defaultValue="Chats"
            options={[
              { label: 'Chats', value: 'Chats', icon: <MessageOutlined /> },
              { label: 'Emails', value: 'Emails', icon: <MailOutlined /> },
            ]}
          />
        </div>
      </div>

      <div className="reference-column reference-middle">
        <div className="verify-card">
          <Avatar.Group size={46} maxCount={5}>
            <Avatar style={{ background: '#9a6b38' }}>🌰</Avatar>
            <Avatar style={{ background: '#8dd7ff' }}>🤖</Avatar>
            <Avatar style={{ background: '#d8b4fe' }}>紫</Avatar>
            <Avatar style={{ background: '#d6d3d1' }}>🐕</Avatar>
            <Avatar style={{ background: '#fbcfe8' }}>人</Avatar>
            <Avatar style={{ background: '#e5e7eb' }}>+5</Avatar>
          </Avatar.Group>
          <Typography.Title level={4}>Verify account</Typography.Title>
          <Typography.Text type="secondary">We've sent a code to a****@gmail.com</Typography.Text>
          <div className="otp-row">
            {['4', '3', '2', '0', '', ''].map((digit, index) => (
              <span key={index}>{digit}</span>
            ))}
          </div>
          <Typography.Text type="secondary">
            Didn't receive a code? <a>Resend</a>
          </Typography.Text>
        </div>

        <div className="button-cluster">
          <Button type="primary" size="large">
            Primary button
          </Button>
          <Button danger size="large">
            Danger button
          </Button>
          <Button className="dashed-soft" size="large">
            Outlined button
          </Button>
          <Button danger shape="round" size="large">
            Round button
          </Button>
        </div>

        <div className="profile-card">
          <Avatar className="profile-logo" size={74}>
            ◆
          </Avatar>
          <div>
            <Typography.Title level={4}>Ant Design</Typography.Title>
            <Typography.Text type="secondary">@ant-design</Typography.Text>
            <Typography.Paragraph>Building the future of UI for web & mobile.</Typography.Paragraph>
          </div>
        </div>

        <Alert
          className="large-alert"
          type="success"
          showIcon
          closable
          message="Ant Design"
          description="An enterprise-class design system for building modern, intelligent, and delightful user experiences."
        />
      </div>

      <div className="reference-column reference-right">
        <div className="signup-card">
          <Avatar size={58} className="hero-avatar">
            🐱
          </Avatar>
          <Typography.Title level={3}>Create an account</Typography.Title>
          <Typography.Paragraph type="secondary">
            Start your free 7-day trial. No credit card required.
          </Typography.Paragraph>
          <Button type="primary" block size="large">
            Get Started
          </Button>
          <Divider>OR</Divider>
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Button icon={<GoogleOutlined />} block size="large">
              Continue with Google
            </Button>
            <Button icon={<AppleFilled />} block size="large">
              Continue with Apple
            </Button>
          </Space>
        </div>

        <div className="notification-card">
          <CloseOutlined className="notification-close" />
          <Typography.Title level={4}>Ant Design</Typography.Title>
          <Typography.Paragraph>
            Ant Design use CSS-in-JS technology to provide dynamic & mix theme ability.
          </Typography.Paragraph>
          <div className="notification-actions">
            <Button>取消</Button>
            <Button type="primary">确定</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
