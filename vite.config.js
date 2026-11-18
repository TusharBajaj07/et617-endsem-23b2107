import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Local dev has no serverless runtime, so /api is forwarded to the live deployment (keys stay on Vercel).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'https://et617-23b2107.vercel.app', changeOrigin: true } },
  },
})
