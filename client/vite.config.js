import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    assetsInlineLimit: 0, // Ensures that videos are not inlined as base64
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
