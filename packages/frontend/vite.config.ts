import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, 
    proxy: {
      // Chuyển hướng mọi request bắt đầu bằng /api/ đến NestJS (port 3000)
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false, 
      },
    },
  },
  resolve: {
    alias: {
      // Thiết lập @shared để trỏ ra thư mục shared/ ở cấp Monorepo
      '@shared': path.resolve(__dirname, '../../shared'), 
    },
  },
});