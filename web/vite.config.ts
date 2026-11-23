import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', port: 5173, strictPort: true,
    proxy: { '/api': process.env.PORTFOLIO_API_URL || 'http://127.0.0.1:3001' },
  },
});
