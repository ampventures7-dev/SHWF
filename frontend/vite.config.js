import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/public': 'http://127.0.0.1:8001',
      '/auth': 'http://127.0.0.1:8001',
      '/reports': 'http://127.0.0.1:8001',
      '/student': 'http://127.0.0.1:8001',
      '/admin': 'http://127.0.0.1:8001',
      '/health': 'http://127.0.0.1:8001',
    }
  }
})
