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
      // Deduplicate React — force library source to use demo's React instance
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
    },
  },
})
