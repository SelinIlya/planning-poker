import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import package.json to expose version at build time
// Node ESM supports JSON import assertions
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})


