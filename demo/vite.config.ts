import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ui-kit/',
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../src'),
    },
  },
})
