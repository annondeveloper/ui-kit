import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Resolve a source file from the package's `src/` directory. */
function pkgSrc(rel: string): string {
  // In the built CLI, __dirname = <pkg>/dist/cli
  // We need to get to <pkg>/src/
  return path.resolve(__dirname, '..', '..', 'src', rel)
}

export interface InitOptions {
  dir: string
  overwrite: boolean
}

export function init(opts: InitOptions): void {
  const projectRoot = process.cwd()
  const targetDir = path.resolve(projectRoot, opts.dir)
  const stylesDir = path.resolve(projectRoot, 'styles')

  // Ensure target directories exist
  fs.mkdirSync(targetDir, { recursive: true })
  fs.mkdirSync(stylesDir, { recursive: true })

  // 1. Copy theme.css
  const themeSrc = pkgSrc('theme.css')
  const themeDst = path.join(stylesDir, 'ui-kit-theme.css')

  if (fs.existsSync(themeDst) && !opts.overwrite) {
    console.log(`  [skip] ${path.relative(projectRoot, themeDst)} already exists (use --overwrite)`)
  } else {
    fs.copyFileSync(themeSrc, themeDst)
    console.log(`  [copy] ${path.relative(projectRoot, themeDst)}`)
  }

  // 2. Copy utils.ts
  const utilsSrc = pkgSrc('utils.ts')
  const utilsDst = path.join(targetDir, 'utils.ts')

  if (fs.existsSync(utilsDst) && !opts.overwrite) {
    console.log(`  [skip] ${path.relative(projectRoot, utilsDst)} already exists (use --overwrite)`)
  } else {
    fs.copyFileSync(utilsSrc, utilsDst)
    console.log(`  [copy] ${path.relative(projectRoot, utilsDst)}`)
  }

  // 3. Create or update .ui-kit.json
  const configPath = path.join(projectRoot, '.ui-kit.json')
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : { componentDir: opts.dir, installed: [] as string[] }

  config.componentDir = opts.dir
  if (!config.installed.includes('utils')) {
    config.installed.push('utils')
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  console.log(`  [write] .ui-kit.json`)

  // 4. Print setup instructions
  console.log('')
  console.log('  Setup complete! Next steps:')
  console.log('')
  console.log('  1. Import the theme in your root layout or global CSS:')
  console.log('')
  console.log("     @import '../styles/ui-kit-theme.css';")
  console.log('')
  console.log('  2. Install required peer dependencies:')
  console.log('')
  console.log('     npm install clsx tailwind-merge')
  console.log('')
  console.log('  3. Add components:')
  console.log('')
  console.log('     npx @annondeveloper/ui-kit add button')
  console.log('     npx @annondeveloper/ui-kit add data-table')
  console.log('')
}
