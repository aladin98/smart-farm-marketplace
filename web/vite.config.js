import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/odata': {
        target: 'https://smart-farm-marketplace.onrender.com/odata/v4/marketplace',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})