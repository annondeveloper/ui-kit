import { defineConfig } from 'tsup'
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const USE_CLIENT_BANNER = '"use client";\n'

/**
 * Inject "use client" directive at the top of every JS file in the output
 * directory. The esbuild `banner` option only applies to entry points when
 * code-splitting is enabled, so split chunks (chunk-*.js) are missed.
 * This post-build step fixes that — but skips the RSC entry which must
 * remain a Server Component export.
 */
async function injectUseClientDirective(outDir: string) {
  const files = await readdir(outDir)
  const jsFiles = files.filter(
    (f) => f.endsWith('.js') && !f.startsWith('rsc')
  )
  await Promise.all(
    jsFiles.map(async (file) => {
      const filePath = join(outDir, file)
      const content = await readFile(filePath, 'utf-8')
      if (!content.startsWith('"use client"')) {
        await writeFile(filePath, USE_CLIENT_BANNER + content)
      }
    })
  )
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    form: 'src/form.ts',
    theme: 'src/theme.ts',
    lite: 'src/lite/index.ts',
    premium: 'src/premium/index.ts',
    rsc: 'src/rsc/index.ts',
    'web-components': 'src/web-components/index.ts',
  },
  outDir: 'dist/esm',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom'],
  async onSuccess() {
    await injectUseClientDirective('dist/esm')
  },
})
