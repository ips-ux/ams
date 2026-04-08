import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the app at /ams/ (the repo name).
  // In dev mode base stays at / so the dev server works normally.
  base: command === 'build' ? '/ams/' : '/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase — largest dep, isolated for long-lived caching
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase'
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
            return 'router'
          }
          // DnD Kit
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd'
          }
          // Wavesurfer
          if (id.includes('node_modules/wavesurfer')) {
            return 'wavesurfer'
          }
          // React core + tanstack query + zod
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/@tanstack') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules/zustand')
          ) {
            return 'vendor'
          }
        },
      },
    },
  },
}))
