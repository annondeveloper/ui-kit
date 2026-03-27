import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { 'mcp/index': 'src/mcp/index.ts' },
    outDir: 'dist',
    format: ['esm'],
    target: 'node20',
    clean: false,
    splitting: false,
    sourcemap: false,
    external: ['react', 'react-dom'],
  },
  {
    entry: { 'mcp/scripts/build-registry': 'src/mcp/scripts/build-registry.ts' },
    outDir: 'dist',
    format: ['esm'],
    target: 'node20',
    clean: false,
    splitting: false,
    sourcemap: false,
    external: ['react', 'react-dom'],
  },
])
