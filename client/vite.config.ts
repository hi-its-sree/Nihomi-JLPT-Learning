import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Inside docker the backend is another container, so 127.0.0.1 would point at
// the frontend container itself. Compose sets BACKEND_ORIGIN=http://backend:4000.
const target = process.env.BACKEND_ORIGIN ?? 'http://127.0.0.1:4000'

const proxyOptions = {
  target,
  changeOrigin: true,
  secure: false,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Prefixes, not individual endpoints — the SPA has no client-side route
      // under /api or /auth, so nothing here shadows a page.
      '/api': proxyOptions,
      '/auth': proxyOptions,
    },
  },
})
