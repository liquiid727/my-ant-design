import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ds/core': path.join(root, 'packages/ds-core/src/index.ts'),
    },
  },
  server: {
    port: 4517,
  },
  preview: {
    port: 4517,
  },
});
