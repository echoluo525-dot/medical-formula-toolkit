import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 相对 base：同一份产物既能跑在 GitHub Pages 子路径，也能本地预览
export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
