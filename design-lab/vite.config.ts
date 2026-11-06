import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.dirname(fileURLToPath(import.meta.url));
const studioSrc = path.resolve(root, '../ant-design/src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    // studio 源码在 ../ant-design 下，会就近解析到它自己的 node_modules。
    // 不 dedupe 就会出现两份 React，hooks 直接崩。
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    alias: {
      '@ds/core': path.join(root, 'packages/ds-core/src/index.ts'),
      // antd 主题工作室以路由方式挂载，直接引用源码，不再复制一份产物
      '@studio': studioSrc,
    },
  },
  server: {
    port: 4517,
    fs: {
      allow: [root, studioSrc],
    },
  },
  preview: {
    port: 4517,
  },
  build: {
    // 默认分包即可：工作室整块按路由懒加载，入口不会带上 antd。
    // 手动分块会让 Vite 的 preload 辅助函数落进 vendor 块，反而把 vendor 拉进首屏。
    modulePreload: { polyfill: false },
  },
});
