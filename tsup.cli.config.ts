import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'cli/index': 'src/cli/index.ts' },
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  clean: false,
  splitting: false,
  sourcemap: false,
  banner: { js: '#!/usr/bin/env node' },
})
