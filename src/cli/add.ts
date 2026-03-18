import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findComponent, type ComponentInfo } from './registry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Resolve a source file from the package's `src/` directory. */
function pkgSrc(rel: string): string {
  return path.resolve(__dirname, '..', '..', 'src', rel)
}

export interface AddOptions {
  dir: string
  overwrite: boolean
}

interface UiKitConfig {
  componentDir: string
  installed: string[]
}

function readConfig(): UiKitConfig | null {
  const configPath = path.join(process.cwd(), '.ui-kit.json')
  if (!fs.existsSync(configPath)) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

function writeConfig(config: UiKitConfig): void {
  const configPath = path.join(process.cwd(), '.ui-kit.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}

/**
 * Rewrite internal imports so copied files reference siblings in the target dir.
 * - `'../utils'` becomes `'./utils'`
 * - `'./truncated-text'` stays as-is (same directory)
 */
function rewriteImports(content: string): string {
  // Rewrite `from '../utils'` to `from './utils'`
  return content.replace(/from\s+['"]\.\.\/utils['"]/g, "from './utils'")
}

/** Collect all transitive internal deps for a component. */
function collectDeps(name: string, seen: Set<string> = new Set()): string[] {
  if (seen.has(name)) return []
  seen.add(name)

  const comp = findComponent(name)
  if (!comp) return []

  const deps: string[] = []
  for (const dep of comp.internalDeps) {
    deps.push(...collectDeps(dep, seen))
    deps.push(dep)
  }
  return deps
}

export function add(componentName: string, opts: AddOptions): void {
  const comp = findComponent(componentName)
  if (!comp) {
    console.error(`  Error: Unknown component "${componentName}".`)
    console.error(`  Run "npx @annondeveloper/ui-kit list" to see available components.`)
    process.exit(1)
  }

  const projectRoot = process.cwd()
  const config = readConfig() || { componentDir: opts.dir, installed: [] as string[] }
  const targetDir = path.resolve(projectRoot, config.componentDir || opts.dir)

  fs.mkdirSync(targetDir, { recursive: true })

  // Collect all components to install (including transitive deps)
  const allDeps = collectDeps(componentName)
  const toInstall: ComponentInfo[] = []

  // Add missing deps first
  for (const depName of allDeps) {
    if (!config.installed.includes(depName)) {
      const dep = findComponent(depName)
      if (dep) toInstall.push(dep)
    }
  }

  // Add the requested component itself
  if (!config.installed.includes(componentName) || opts.overwrite) {
    toInstall.push(comp)
  } else {
    console.log(`  [skip] ${componentName} already installed (use --overwrite)`)
    if (toInstall.length === 0) return
  }

  // Copy files
  const allNpmDeps: Set<string> = new Set()

  for (const entry of toInstall) {
    for (const file of entry.files) {
      const src = pkgSrc(file)
      const dst = path.join(targetDir, path.basename(file))

      if (fs.existsSync(dst) && !opts.overwrite && config.installed.includes(entry.name)) {
        console.log(`  [skip] ${path.relative(projectRoot, dst)} (already exists)`)
        continue
      }

      if (!fs.existsSync(src)) {
        console.error(`  [error] Source file not found: ${src}`)
        continue
      }

      let content = fs.readFileSync(src, 'utf-8')
      content = rewriteImports(content)
      fs.writeFileSync(dst, content)

      const label = entry.name === componentName ? 'copy' : 'dep '
      console.log(`  [${label}] ${path.relative(projectRoot, dst)}`)
    }

    for (const dep of entry.dependencies) {
      allNpmDeps.add(dep)
    }

    if (!config.installed.includes(entry.name)) {
      config.installed.push(entry.name)
    }
  }

  writeConfig(config)

  // Print npm dependency install suggestion
  if (allNpmDeps.size > 0) {
    console.log('')
    console.log('  Required npm dependencies:')
    console.log('')
    console.log(`    npm install ${[...allNpmDeps].join(' ')}`)
    console.log('')
  }
}
