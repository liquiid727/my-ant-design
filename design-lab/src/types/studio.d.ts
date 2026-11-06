/**
 * 挂载的 antd 主题工作室（../ant-design/src）。
 * 它有自己的 tsconfig 和构建，这里只声明入口，避免把它的类型检查混进 lab。
 */
declare module '@studio/App' {
  import type { ComponentType } from 'react';
  const App: ComponentType;
  export default App;
}
