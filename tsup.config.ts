import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    form: 'src/form.ts',
    theme: 'src/theme.ts',
    lite: 'src/lite/index.ts',
  },
  outDir: 'dist/esm',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = { js: '"use client";' }
  }
})
