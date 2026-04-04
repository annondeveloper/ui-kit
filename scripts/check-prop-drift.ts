/**
 * check-prop-drift.ts
 *
 * Compares component-meta.json (source of truth extracted from TypeScript)
 * against all consumers to detect drift:
 * 1. Demo page PropDef arrays
 * 2. MCP registry entries
 * 3. Code generators in demo pages
 * 4. Storybook story coverage
 *
 * Usage: npx tsx scripts/check-prop-drift.ts
 * Exit code 0 = no drift, 1 = drift found
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const META_PATH = resolve(ROOT, 'dist/component-meta.json')
const REGISTRY_PATH = resolve(ROOT, 'dist/mcp/registry.json')
const DEMO_DIR = resolve(ROOT, 'demo/src/pages/components')

interface PropMeta { name: string; type: string; required: boolean }
interface ComponentMeta { name: string; fileName: string; tiers: string[]; props: PropMeta[] }
interface DriftIssue { component: string; consumer: string; issue: string; severity: 'error' | 'warning' }

const issues: DriftIssue[] = []

if (!existsSync(META_PATH)) {
  console.error('component-meta.json not found. Run: npm run build:meta')
  process.exit(1)
}

const meta = JSON.parse(readFileSync(META_PATH, 'utf-8'))
const components: ComponentMeta[] = meta.components

// ─── Check 1: Demo page PropDef arrays ───────────────────────────────────────

for (const comp of components) {
  const pageFile = resolve(DEMO_DIR, comp.name + 'Page.tsx')
  if (!existsSync(pageFile)) continue
  const src = readFileSync(pageFile, 'utf-8')

  if (!src.includes('PropsTable')) {
    issues.push({ component: comp.name, consumer: 'demo-page', issue: 'Missing PropsTable', severity: 'error' })
    continue
  }

  if (!src.includes('useTier') && comp.tiers.length > 1) {
    issues.push({ component: comp.name, consumer: 'demo-page', issue: 'Missing useTier() — no tier switching', severity: 'error' })
  }

  // Extract prop names ONLY from PropDef arrays (look for the pattern near PropsTable)
  // Find the PropDef array section — typically between "PropDef[]" and the closing "]"
  const propDefSection = src.match(/(?:Props|props)\s*(?::\s*PropDef\[\])?\s*=\s*\[([\s\S]*?)\]\s*(?:;|\n\n)/g)
  if (!propDefSection) continue

  const propPattern = /name:\s*['"](\w+)['"]/g
  const demoProps = new Set<string>()
  for (const section of propDefSection) {
    let m: RegExpExecArray | null
    while ((m = propPattern.exec(section)) !== null) demoProps.add(m[1])
  }
  if (demoProps.size === 0) continue

  const sourceProps = new Set(comp.props.map(p => p.name))
  // Skip inherited HTML attributes and common pass-through props
  const skip = new Set(['className', 'children', 'ref', 'style', 'id', 'key', 'tabIndex', 'role', 'onClick', 'onChange', 'onFocus', 'onBlur'])

  for (const p of sourceProps) {
    if (!demoProps.has(p) && !skip.has(p)) {
      issues.push({ component: comp.name, consumer: 'demo-page', issue: `Prop "${p}" in source but missing from PropsTable`, severity: 'warning' })
    }
  }
  for (const p of demoProps) {
    if (!sourceProps.has(p)) {
      issues.push({ component: comp.name, consumer: 'demo-page', issue: `Prop "${p}" in PropsTable but NOT in source — STALE`, severity: 'error' })
    }
  }
}

// ─── Check 2: MCP Registry ──────────────────────────────────────────────────

if (existsSync(REGISTRY_PATH)) {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'))
  const regComponents = registry.components || {}

  for (const comp of components) {
    const regEntry = regComponents[comp.name] || regComponents[comp.name.toLowerCase()]
    if (!regEntry) {
      issues.push({ component: comp.name, consumer: 'mcp-registry', issue: 'Not in MCP registry', severity: 'warning' })
      continue
    }
    const regTiers = [...(regEntry.tier || [])].sort()
    const srcTiers = [...comp.tiers].sort()
    if (JSON.stringify(regTiers) !== JSON.stringify(srcTiers)) {
      issues.push({ component: comp.name, consumer: 'mcp-registry', issue: `Tier mismatch — src:[${srcTiers}] reg:[${regTiers}]`, severity: 'error' })
    }
  }
}

// ─── Check 3: Code generator tier awareness ──────────────────────────────────

for (const comp of components) {
  const pageFile = resolve(DEMO_DIR, comp.name + 'Page.tsx')
  if (!existsSync(pageFile)) continue
  const src = readFileSync(pageFile, 'utf-8')

  if (comp.tiers.includes('lite') && !src.includes('ui-kit/lite')) {
    issues.push({ component: comp.name, consumer: 'code-gen', issue: 'Lite tier exists but no lite import in code gen', severity: 'warning' })
  }
  if (comp.tiers.includes('premium') && !src.includes('ui-kit/premium')) {
    issues.push({ component: comp.name, consumer: 'code-gen', issue: 'Premium tier exists but no premium import in code gen', severity: 'warning' })
  }
}

// ─── Check 4: Storybook ─────────────────────────────────────────────────────

for (const comp of components) {
  const dirs = [resolve(ROOT, 'src/components'), resolve(ROOT, 'src/domain')]
  const has = dirs.some(d => existsSync(resolve(d, comp.fileName + '.stories.tsx')))
  if (!has) {
    issues.push({ component: comp.name, consumer: 'storybook', issue: 'No story file', severity: 'warning' })
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

const errors = issues.filter(i => i.severity === 'error')
const warnings = issues.filter(i => i.severity === 'warning')

console.log('\n' + '='.repeat(60))
console.log('PROP/TIER DRIFT REPORT')
console.log('='.repeat(60))
console.log('Errors: ' + errors.length + ' | Warnings: ' + warnings.length)

if (errors.length > 0) {
  console.log('\n--- ERRORS ---')
  for (const i of errors) console.log('  [' + i.component + '] ' + i.consumer + ': ' + i.issue)
}

if (warnings.length > 0) {
  console.log('\n--- WARNINGS (top 20) ---')
  const grouped = new Map<string, number>()
  for (const w of warnings) {
    const key = w.consumer
    grouped.set(key, (grouped.get(key) || 0) + 1)
  }
  for (const [c, n] of grouped) console.log('  ' + c + ': ' + n + ' warnings')
}

console.log('\n' + '='.repeat(60))
if (errors.length > 0) { console.log('FAIL'); process.exit(1) }
else { console.log('PASS (' + warnings.length + ' warnings)'); process.exit(0) }
