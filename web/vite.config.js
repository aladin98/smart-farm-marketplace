import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/odata': {
        target: 'https://port4004-workspaces-ws-c97u5.eu10.applicationstudio.cloud.sap',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})