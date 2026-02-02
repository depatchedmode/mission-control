import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  base: '/mc/',
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm']
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['gary-clawd-bot.exe.xyz', 'localhost'],
    fs: {
      allow: ['..']
    },
    proxy: {
      '/mc-ws': {
        target: 'ws://localhost:8005',
        ws: true,
        rewrite: (path) => path.replace(/^\/mc-ws/, '')
      },
      '/mc-api': {
        target: 'http://localhost:8004',
        rewrite: (path) => path.replace(/^\/mc-api/, '')
      }
    }
  },
  build: {
    target: 'esnext'
  }
})