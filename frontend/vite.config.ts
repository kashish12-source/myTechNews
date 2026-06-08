import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.log('[Proxy Error]', req.method, req.url, err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('[Proxy Request]', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Proxy Response]', req.method, req.url, 'Status:', proxyRes.statusCode);
          });
        }
      }
    }
  },
})
