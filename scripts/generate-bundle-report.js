import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'

const DIST = 'dist/esm'
const OUTPUT = 'demo/public/bundle-report.json'
const BUDGET_TOTAL = 350 * 1024 // 350KB full bundle

if (!existsSync(DIST)) {
  console.error(`Error: ${DIST} not found. Run "npm run build" first.`)
  process.exit(1)
}

// Collect all JS files (not sourcemaps, not .d.ts)
const jsFiles = readdirSync(DIST).filter(f => f.endsWith('.js') && !f.endsWith('.map'))

if (jsFiles.length === 0) {
  console.error(`Error: No .js files found in ${DIST}`)
  process.exit(1)
}

let totalRaw = 0
let totalGzip = 0
const files = []

for (const file of jsFiles) {
  const filePath = join(DIST, file)
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content)
  const raw = content.length
  const gzip = gzipped.length
  totalRaw += raw
  totalGzip += gzip
  files.push({ name: file, raw, gzip })
}

// Sort by gzip size descending
files.sort((a, b) => b.gzip - a.gzip)

const report = {
  generated: new Date().toISOString(),
  budget: BUDGET_TOTAL,
  files,
  total: { raw: totalRaw, gzip: totalGzip },
}

// Ensure output directory exists
const outputDir = join(OUTPUT, '..')
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

writeFileSync(OUTPUT, JSON.stringify(report, null, 2))

console.log(`Bundle report written to ${OUTPUT}`)
console.log(`  Files: ${files.length}`)
console.log(`  Total raw:  ${(totalRaw / 1024).toFixed(1)} KB`)
console.log(`  Total gzip: ${(totalGzip / 1024).toFixed(1)} KB`)
console.log(`  Budget:     ${(BUDGET_TOTAL / 1024).toFixed(0)} KB`)
console.log(`  Usage:      ${((totalGzip / BUDGET_TOTAL) * 100).toFixed(1)}%`)
