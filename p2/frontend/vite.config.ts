import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        // 백엔드 `p2/backend/.env`의 PORT와 반드시 동일해야 합니다.
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
