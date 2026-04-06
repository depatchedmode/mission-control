import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const allowedHosts = (process.env.GP_UI_ALLOWED_HOSTS || 'localhost,127.0.0.1')
  .split(',')
  .map(host => host.trim())
  .filter(Boolean)
const apiHost = process.env.GP_API_HOST || 'localhost'
const apiHttpPort = process.env.GP_HTTP_PORT || '8004'
const apiWsPort = process.env.GP_WS_PORT || '8005'

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  base: '/gp/',
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm']
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/gp-ws': {
        target: `ws://${apiHost}:${apiWsPort}`,
        ws: true,
        rewrite: (path) => path.replace(/^\/gp-ws/, '')
      },
      '/gp-api': {
        target: `http://${apiHost}:${apiHttpPort}`,
        rewrite: (path) => path.replace(/^\/gp-api/, '')
      }
    }
  },
  build: {
    target: 'esnext'
  }
})
