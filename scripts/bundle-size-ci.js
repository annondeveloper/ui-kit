import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { gzipSync } from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist', 'esm')
const BASELINE_PATH = join(__dirname, 'bundle-baseline.json')

// Size budget (gzipped bytes) — must match check-bundle-size.js
const BUDGET_TOTAL = 350 * 1024 // 350KB

// Max allowed growth per file before flagging
const MAX_GROWTH_PERCENT = 10

if (!existsSync(DIST)) {
  console.error(`Error: ${DIST} not found. Run "npm run build" first.`)
  process.exit(1)
}

// Load baseline
let baseline = {}
if (existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'))
} else {
  console.warn('Warning: No baseline found at', BASELINE_PATH)
  console.warn('Run scripts/check-bundle-size.js to generate baseline.')
}

// Collect current sizes
const files = readdirSync(DIST).filter(f => f.endsWith('.js') && !f.endsWith('.map'))

if (files.length === 0) {
  console.error(`Error: No .js files found in ${DIST}`)
  process.exit(1)
}

let totalGzip = 0
const results = []

for (const file of files) {
  const filePath = join(DIST, file)
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content)
  const size = gzipped.length
  totalGzip += size

  const baselineSize = baseline[file] || 0
  const delta = size - baselineSize
  const deltaPct = baselineSize > 0 ? ((delta / baselineSize) * 100) : 0

  results.push({ file, size, baselineSize, delta, deltaPct })
}

// Sort by delta descending (biggest growth first)
results.sort((a, b) => b.delta - a.delta)

const baselineTotal = baseline._total || 0
const totalDelta = totalGzip - baselineTotal

// ─── Markdown output ────────────────────────────────────────────────────────
const lines = []
lines.push('## Bundle Size Report')
lines.push('')
lines.push('| File | Current | Baseline | Delta | % |')
lines.push('|------|--------:|---------:|------:|--:|')

for (const r of results) {
  const current = (r.size / 1024).toFixed(1) + ' KB'
  const base = r.baselineSize > 0 ? (r.baselineSize / 1024).toFixed(1) + ' KB' : 'new'
  const sign = r.delta >= 0 ? '+' : ''
  const delta = sign + (r.delta / 1024).toFixed(1) + ' KB'
  const pct = r.baselineSize > 0 ? (sign + r.deltaPct.toFixed(1) + '%') : 'new'
  lines.push(`| ${r.file} | ${current} | ${base} | ${delta} | ${pct} |`)
}

lines.push('')
const totalSign = totalDelta >= 0 ? '+' : ''
lines.push(`**Total:** ${(totalGzip / 1024).toFixed(1)} KB gzip (${totalSign}${(totalDelta / 1024).toFixed(1)} KB from baseline)`)
lines.push('')
lines.push(`**Budget:** ${(BUDGET_TOTAL / 1024).toFixed(0)} KB — ${((totalGzip / BUDGET_TOTAL) * 100).toFixed(0)}% used`)

const markdown = lines.join('\n')
console.log(markdown)

// ─── Checks ─────────────────────────────────────────────────────────────────
let failed = false

// Check total budget
if (totalGzip > BUDGET_TOTAL) {
  console.error(`\nFAIL: Total ${(totalGzip / 1024).toFixed(1)} KB exceeds budget ${(BUDGET_TOTAL / 1024).toFixed(0)} KB`)
  failed = true
}

// Check per-file growth
for (const r of results) {
  if (r.baselineSize > 0 && r.deltaPct > MAX_GROWTH_PERCENT) {
    console.error(`FAIL: ${r.file} grew ${r.deltaPct.toFixed(1)}% (max ${MAX_GROWTH_PERCENT}%)`)
    failed = true
  }
}

if (failed) {
  process.exit(1)
} else {
  console.log('\nAll checks passed.')
}
