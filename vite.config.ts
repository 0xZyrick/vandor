import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['starknet', '@starknet-react/core', '@starknet-react/chains'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'starknet': ['starknet'],
          'starknet-react': ['@starknet-react/core', '@starknet-react/chains']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.starknet.extended.exchange',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    dedupe: ['starknet']
  }
})