import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.ELECTRON === 'true' ? './' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@tiptap/') || id.includes('prosemirror')) {
            return 'tiptap';
          }
          if (id.includes('@tanstack/')) {
            return 'tanstack';
          }
          if (
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react/')
          ) {
            return 'react';
          }
        },
      },
    },
  },
})
