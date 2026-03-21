// For Docker runs

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'llmgateway-production-e66c.up.railway.app',
      'localhost'
    ],
    proxy: {
      '/auth/google': 'https://llmgateway-production.up.railway.app',
      '/auth/callback': 'https://llmgateway-production.up.railway.app',
      '/auth/me': 'https://llmgateway-production.up.railway.app',
      '/keys': 'https://llmgateway-production.up.railway.app',
      '/gateway': 'https://llmgateway-production.up.railway.app',
      '/usage': 'https://llmgateway-production.up.railway.app',
      '/users': 'https://llmgateway-production.up.railway.app',
      '/admin': 'https://llmgateway-production.up.railway.app',
    }
  }
})