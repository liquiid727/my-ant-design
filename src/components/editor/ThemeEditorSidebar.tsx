import { Card, Tabs } from 'antd';
import { ComponentTokenEditor } from './ComponentTokenEditor';
import { GlobalTokenEditor } from './GlobalTokenEditor';

export function ThemeEditorSidebar() {
  return (
    <aside className="editor-panel">
      <Card bordered={false} title="Theme Editor">
        <Tabs
          defaultActiveKey="global"
          items={[
            { key: 'global', label: 'Global', children: <GlobalTokenEditor /> },
            { key: 'component', label: 'Component', children: <ComponentTokenEditor /> },
          ]}
        />
      </Card>
    </aside>
  );
}

