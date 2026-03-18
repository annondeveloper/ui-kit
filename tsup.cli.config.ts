import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'cli/index': 'src/cli/index.ts' },
  outDir: 'dist',
  format: ['esm'],
  dts: false,
  clean: false,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  platform: 'node',
  target: 'node20',
})
