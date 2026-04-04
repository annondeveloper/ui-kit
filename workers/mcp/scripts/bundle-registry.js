// Copies registry.json into the worker's src/ so wrangler can bundle it
import { copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../dist/mcp/registry.json')
const dest = resolve(__dirname, '../src/registry.json')

if (!existsSync(src)) {
  console.error('Registry not found. Run `npm run build:mcp` from the project root first.')
  process.exit(1)
}

copyFileSync(src, dest)
console.log('Bundled registry.json into worker/src/')
