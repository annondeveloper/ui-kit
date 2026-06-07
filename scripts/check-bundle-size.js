import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'

const DIST = 'dist/esm'

// Size budget (gzipped bytes) for the RUNTIME UI library: standard + domain
// components, the lite and premium tiers, and the graph engine. Tree-shaking
// reduces real imports dramatically (consumers typically ship <20KB tree-shaken).
//
// Baseline note: the lite tier now self-injects its own scoped CSS via useStyles()
// (each lite component embeds a no-motion CSS block) so it renders fully styled with
// no manual CSS import. That moved ~58KB of lite CSS from an external stylesheet into
// the JS bundle — a deliberate tradeoff for a ready-to-use tier — so the runtime
// budget is baselined at 440KB (was 400KB when lite shipped CSS-only).
const BUDGET_TOTAL = 440 * 1024

// The `ai` subpath (@annondeveloper/ui-kit/ai) is a dev-time code-generation utility,
// not runtime UI a consumer ships in their app, so it is reported separately and
// excluded from the runtime budget.
const isDevToolingEntry = (file) => file.startsWith('ai.') || file.startsWith('ai-')

if (!existsSync(DIST)) {
  console.error(`Error: ${DIST} not found. Run "npm run build" first.`)
  process.exit(1)
}

// Collect all JS files (not sourcemaps, not .d.ts)
const files = readdirSync(DIST).filter(f => f.endsWith('.js') && !f.endsWith('.map'))

if (files.length === 0) {
  console.error(`Error: No .js files found in ${DIST}`)
  process.exit(1)
}

let totalRaw = 0
let totalGzip = 0
let devToolingGzip = 0
const results = []

for (const file of files) {
  const filePath = join(DIST, file)
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content)
  totalRaw += content.length
  if (isDevToolingEntry(file)) {
    devToolingGzip += gzipped.length
  } else {
    totalGzip += gzipped.length
  }
  results.push({ file, raw: content.length, gzip: gzipped.length, devTooling: isDevToolingEntry(file) })
}

// Sort by gzip size descending
results.sort((a, b) => b.gzip - a.gzip)

console.log('\nBundle Size Report:')
console.log('\u2500'.repeat(65))

for (const r of results) {
  const sizeKB = (r.gzip / 1024).toFixed(1)
  const bar = '\u2588'.repeat(Math.max(1, Math.ceil(r.gzip / 1024)))
  const tag = r.devTooling ? ' (dev tooling, excluded)' : ''
  console.log(`  ${r.file.padEnd(40)} ${sizeKB.padStart(6)} KB gzip  ${bar}${tag}`)
}

console.log('\u2500'.repeat(65))
console.log(`  ${'Raw total:'.padEnd(40)} ${(totalRaw / 1024).toFixed(1).padStart(6)} KB`)
if (devToolingGzip > 0) {
  console.log(`  ${'Dev tooling (ai, excluded):'.padEnd(40)} ${(devToolingGzip / 1024).toFixed(1).padStart(6)} KB`)
}
console.log(`  ${'Runtime gzip total:'.padEnd(40)} ${(totalGzip / 1024).toFixed(1).padStart(6)} KB`)
console.log()

// Budget check
if (totalGzip > BUDGET_TOTAL) {
  console.error(`OVER BUDGET: ${(totalGzip / 1024).toFixed(1)} KB > ${(BUDGET_TOTAL / 1024).toFixed(0)} KB`)
  process.exit(1)
} else {
  const pct = ((totalGzip / BUDGET_TOTAL) * 100).toFixed(0)
  console.log(`Within budget: ${(totalGzip / 1024).toFixed(1)} KB / ${(BUDGET_TOTAL / 1024).toFixed(0)} KB (${pct}%)`)
}
