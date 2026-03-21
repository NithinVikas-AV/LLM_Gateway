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
    proxy: {
      '/auth/google': 'http://backend:8000',
      '/auth/callback': 'http://backend:8000',
      '/auth/me': 'http://backend:8000',
      '/keys': 'http://backend:8000',
      '/gateway': 'http://backend:8000',
      '/usage': 'http://backend:8000',
      '/users': 'http://backend:8000',
      '/admin': 'http://backend:8000',
    }
  }
})