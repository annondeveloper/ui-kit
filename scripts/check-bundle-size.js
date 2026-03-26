import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'

const DIST = 'dist/esm'

// Size budget (gzipped bytes)
// Full library bundle (85+ components). Tree-shaking reduces individual import sizes dramatically.
// Average ~1.5KB gzip per component. Consumers typically import <20KB tree-shaken.
// 95+ standard components + 8 enterprise DataTable features + 18 visual effects
const BUDGET_TOTAL = 250 * 1024 // 250KB full bundle (102 standard + 100 premium + 100 lite)

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
const results = []

for (const file of files) {
  const filePath = join(DIST, file)
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content)
  totalRaw += content.length
  totalGzip += gzipped.length
  results.push({ file, raw: content.length, gzip: gzipped.length })
}

// Sort by gzip size descending
results.sort((a, b) => b.gzip - a.gzip)

console.log('\nBundle Size Report:')
console.log('\u2500'.repeat(65))

for (const r of results) {
  const sizeKB = (r.gzip / 1024).toFixed(1)
  const bar = '\u2588'.repeat(Math.max(1, Math.ceil(r.gzip / 1024)))
  console.log(`  ${r.file.padEnd(40)} ${sizeKB.padStart(6)} KB gzip  ${bar}`)
}

console.log('\u2500'.repeat(65))
console.log(`  ${'Raw total:'.padEnd(40)} ${(totalRaw / 1024).toFixed(1).padStart(6)} KB`)
console.log(`  ${'Gzip total:'.padEnd(40)} ${(totalGzip / 1024).toFixed(1).padStart(6)} KB`)
console.log()

// Budget check
if (totalGzip > BUDGET_TOTAL) {
  console.error(`OVER BUDGET: ${(totalGzip / 1024).toFixed(1)} KB > ${(BUDGET_TOTAL / 1024).toFixed(0)} KB`)
  process.exit(1)
} else {
  const pct = ((totalGzip / BUDGET_TOTAL) * 100).toFixed(0)
  console.log(`Within budget: ${(totalGzip / 1024).toFixed(1)} KB / ${(BUDGET_TOTAL / 1024).toFixed(0)} KB (${pct}%)`)
}
