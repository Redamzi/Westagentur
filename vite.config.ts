import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', 'three/examples/jsm/controls/OrbitControls.js'],
          vapi: ['@vapi-ai/web']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
