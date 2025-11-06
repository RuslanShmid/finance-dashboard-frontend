import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps in production builds
  },
  // Source maps are enabled by default in dev mode, but we can be explicit
  css: {
    devSourcemap: true, // Enable source maps for CSS
  },
})
