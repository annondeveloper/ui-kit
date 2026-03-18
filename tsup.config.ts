import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/form.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'framer-motion',
    '@radix-ui/react-select',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-tooltip',
    '@tanstack/react-table',
    'lucide-react',
    'clsx',
    'tailwind-merge',
    'sonner',
    'react-hook-form',
  ],
})
