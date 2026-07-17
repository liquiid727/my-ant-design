import { DownOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Segmented } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';

export function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const openSettings = useUIStore((state) => state.openSettings);
  const toggleAI = useUIStore((state) => state.toggleAI);

  return (
    <LayoutHeaderShell>
      <div className="brand">
        <span className="brand-mark">TS</span>
        <span>Ant Design Theme Studio</span>
      </div>
      <Segmented
        value={
          location.pathname === '/library'
            ? '/library'
            : location.pathname === '/square'
              ? '/square'
              : location.pathname === '/about'
                ? '/about'
                : '/'
        }
        options={[
          {
            label: (
              <Dropdown
                trigger={['click']}
                menu={{
                  selectedKeys: [new URLSearchParams(location.search).get('view') || 'components'],
                  items: [
                    { key: 'components', label: 'Components' },
                    { key: 'dashboard', label: 'Dashboard' },
                  ],
                  onClick: ({ key }) => navigate(`/?view=${key}`),
                }}
              >
                <span className="nav-dropdown-label" onClick={(event) => event.stopPropagation()}>
                  Playground <DownOutlined />
                </span>
              </Dropdown>
            ),
            value: '/',
          },
          { label: 'Library', value: '/library' },
          { label: 'Square', value: '/square' },
          { label: 'About', value: '/about' },
        ]}
        onChange={(value) => {
          if (value === '/') navigate('/?view=components');
          else navigate(String(value));
        }}
      />
      <div className="header-actions">
        <Button icon={<SettingOutlined />} onClick={openSettings}>
          Settings
        </Button>
        <Button type="primary" icon={<RobotOutlined />} onClick={toggleAI}>
          AI Chat
        </Button>
      </div>
    </LayoutHeaderShell>
  );
}

function LayoutHeaderShell({ children }: { children: React.ReactNode }) {
  return <header className="app-header">{children}</header>;
}
