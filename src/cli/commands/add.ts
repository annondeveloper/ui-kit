import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { componentRegistry } from '../registry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Source root relative to compiled CLI output */
const SRC_ROOT = join(__dirname, '..', '..')

/** Map of tier to source subdirectory */
const TIER_DIRS: Record<string, string> = {
  standard: '',
  lite: 'lite',
  premium: 'premium',
}

/**
 * Resolves a component name to its source directory.
 * Components live in src/components/ or src/domain/ (standard tier),
 * or src/lite/ / src/premium/ for alternate tiers.
 */
function resolveSourcePath(name: string, tier: string): string | null {
  const allComponents = [...componentRegistry.components, ...componentRegistry.domain]
  const match = allComponents.find(c => c.toLowerCase() === name.toLowerCase())
  if (!match) return null

  if (tier === 'lite' || tier === 'premium') {
    return join(SRC_ROOT, TIER_DIRS[tier], `${match}.tsx`)
  }

  // Standard tier: check components/ first, then domain/
  const compPath = join(SRC_ROOT, 'components', `${match}.tsx`)
  const domainPath = join(SRC_ROOT, 'domain', `${match}.tsx`)

  if (existsSync(compPath)) return compPath
  if (existsSync(domainPath)) return domainPath
  return null
}

/**
 * Rewrites internal relative imports to package imports.
 * e.g. `from '../core/styles'` → `from '@annondeveloper/ui-kit'`
 * e.g. `from '../core/tokens/generator'` → `from '@annondeveloper/ui-kit/theme'`
 */
export function rewriteImports(source: string): string {
  return source
    // Theme-related imports
    .replace(
      /from\s+['"]\.\.\/core\/tokens\/(?:generator|themes|tokens)['"]/g,
      "from '@annondeveloper/ui-kit/theme'"
    )
    // Form-related imports
    .replace(
      /from\s+['"]\.\.\/core\/forms\/[^'"]*['"]/g,
      "from '@annondeveloper/ui-kit/form'"
    )
    // All other core imports → main package
    .replace(
      /from\s+['"]\.\.\/core\/[^'"]*['"]/g,
      "from '@annondeveloper/ui-kit'"
    )
    // Relative component imports
    .replace(
      /from\s+['"]\.\.\/components\/[^'"]*['"]/g,
      "from '@annondeveloper/ui-kit'"
    )
    .replace(
      /from\s+['"]\.\.\/domain\/[^'"]*['"]/g,
      "from '@annondeveloper/ui-kit'"
    )
    .replace(
      /from\s+['"]\.\/[^'"]*['"]/g,
      "from '@annondeveloper/ui-kit'"
    )
}

export function addCommand(componentName: string, options: { tier?: string; outDir?: string }): void {
  const tier = options.tier || 'standard'
  const outDir = resolve(options.outDir || './src/components')

  if (!TIER_DIRS.hasOwnProperty(tier)) {
    console.error(`Unknown tier "${tier}". Use: standard, lite, or premium`)
    process.exit(1)
  }

  const sourcePath = resolveSourcePath(componentName, tier)
  if (!sourcePath) {
    console.error(`Component "${componentName}" not found in registry.`)
    console.error('Run "ui-kit list" to see available components.')
    process.exit(1)
  }

  if (!existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`)
    console.error('The component may not have a source file yet.')
    process.exit(1)
  }

  mkdirSync(outDir, { recursive: true })

  const raw = readFileSync(sourcePath, 'utf-8')
  const rewritten = rewriteImports(raw)
  const fileName = sourcePath.split('/').pop()!
  const destPath = join(outDir, fileName)

  writeFileSync(destPath, rewritten, 'utf-8')
  console.log(`\u2713 Copied ${componentName} (${tier}) to ${destPath}`)
  console.log(`  Imports rewritten to use @annondeveloper/ui-kit`)
}
