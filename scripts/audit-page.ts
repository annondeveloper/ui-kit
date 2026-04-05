/**
 * audit-page.ts
 *
 * Automated quality auditor for demo pages. Scores each page against
 * the 11-category rubric (10 points each = 110 max).
 *
 * Usage:
 *   npx tsx scripts/audit-page.ts                    # audit ALL pages
 *   npx tsx scripts/audit-page.ts ButtonPage         # audit specific page
 *   npx tsx scripts/audit-page.ts --failing-only     # only show pages < 110
 *
 * Requires: dist/component-meta.json (run: npx tsx scripts/extract-component-meta.ts)
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, basename } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const META_PATH = resolve(ROOT, 'dist/component-meta.json')
const DEMO_DIR = resolve(ROOT, 'demo/src/pages/components')
const PREMIUM_DIR = resolve(ROOT, 'src/premium')

interface Issue {
  category: string
  severity: 'critical' | 'major' | 'minor'
  message: string
  deduction: number
}

interface PageAudit {
  page: string
  component: string
  score: number
  maxScore: number
  grade: string
  issues: Issue[]
  breakdown: Record<string, number>
}

function getGrade(score: number): string {
  if (score >= 108) return 'S'
  if (score >= 100) return 'A'
  if (score >= 90) return 'B'
  if (score >= 80) return 'C'
  if (score >= 70) return 'D'
  return 'F'
}

function auditPage(pagePath: string): PageAudit {
  const pageName = basename(pagePath, '.tsx')
  const componentName = pageName.replace('Page', '')
  const content = readFileSync(pagePath, 'utf-8')
  const lines = content.split('\n')
  const lineCount = lines.length

  const issues: Issue[] = []
  const breakdown: Record<string, number> = {}

  // ─── 1. Source Quality (10 pts) ───────────────────────────────────
  let sourceScore = 10
  // Check if page is a stub
  if (lineCount < 400) {
    issues.push({ category: 'source', severity: 'critical', message: `Stub page (${lineCount} lines) — needs full rebuild`, deduction: 10 })
    sourceScore = 0
  }
  breakdown['source'] = sourceScore

  // ─── 2. Lite Tier (10 pts) ────────────────────────────────────────
  let liteScore = 10
  const hasLiteImport = /from\s+['"]@ui\/lite\//.test(content)
  if (!hasLiteImport) {
    issues.push({ category: 'lite', severity: 'major', message: 'No lite tier import found', deduction: 5 })
    liteScore -= 5
  }
  const hasLiteSwitch = /tier\s*===\s*['"]lite['"]|effectiveTier\s*===\s*['"]lite['"]|isLite/.test(content)
  if (!hasLiteSwitch && hasLiteImport) {
    issues.push({ category: 'lite', severity: 'minor', message: 'Lite imported but no tier-conditional rendering', deduction: 2 })
    liteScore -= 2
  }
  breakdown['lite'] = Math.max(0, liteScore)

  // ─── 3. Premium Tier (10 pts) ─────────────────────────────────────
  let premiumScore = 10
  const hasPremiumImport = /from\s+['"]@ui\/premium\//.test(content)
  if (!hasPremiumImport) {
    issues.push({ category: 'premium', severity: 'critical', message: 'No premium tier import — shows standard as premium', deduction: 8 })
    premiumScore -= 8
  }
  const premiumPreviewReal = hasPremiumImport && /Premium.*preview|tier.*premium.*component|PremiumComponent/.test(content)
  if (hasPremiumImport && !premiumPreviewReal) {
    // Check if the premium component is actually used in tier card previews
    const tierCardUsesPremium = /tier-preview.*Premium|Premium.*tier-preview/.test(content)
    if (!tierCardUsesPremium) {
      issues.push({ category: 'premium', severity: 'minor', message: 'Premium imported but may not be used in tier card preview', deduction: 2 })
      premiumScore -= 2
    }
  }
  breakdown['premium'] = Math.max(0, premiumScore)

  // ─── 4. Demo Playground (10 pts) ──────────────────────────────────
  let playgroundScore = 10
  const hasPlayground = /playground|Playground/.test(content)
  if (!hasPlayground) {
    issues.push({ category: 'playground', severity: 'critical', message: 'No playground section', deduction: 10 })
    playgroundScore = 0
  }
  const hasMotionControl = /motion.*OptionGroup|motion.*setMotion|Motion.*Level|MotionSelector/.test(content)
  if (!hasMotionControl && hasPlayground) {
    issues.push({ category: 'playground', severity: 'major', message: 'Playground missing motion control', deduction: 3 })
    playgroundScore -= 3
  }
  breakdown['playground'] = Math.max(0, playgroundScore)

  // ─── 5. Props Accuracy (10 pts) ───────────────────────────────────
  let propsScore = 10
  const hasPropsTable = /PropsTable|PropDef/.test(content)
  if (!hasPropsTable) {
    issues.push({ category: 'props', severity: 'critical', message: 'No PropsTable found', deduction: 10 })
    propsScore = 0
  }
  breakdown['props'] = Math.max(0, propsScore)

  // ─── 6. Code Generators (10 pts) ──────────────────────────────────
  let codeGenScore = 10
  const hasReactGen = /generateReactCode|generateReact/.test(content)
  const hasHtmlGen = /generateHtml|generateHtmlCode|generateHtmlExport/.test(content)
  const hasVueGen = /generateVueCode|generateVue/.test(content)
  const hasAngularGen = /generateAngularCode|generateAngular/.test(content)
  const hasSvelteGen = /generateSvelteCode|generateSvelte/.test(content)

  const genCount = [hasReactGen, hasHtmlGen, hasVueGen, hasAngularGen, hasSvelteGen].filter(Boolean).length
  if (genCount === 0) {
    issues.push({ category: 'codegen', severity: 'critical', message: 'No code generators found', deduction: 10 })
    codeGenScore = 0
  } else if (genCount < 5) {
    const missing = []
    if (!hasReactGen) missing.push('React')
    if (!hasHtmlGen) missing.push('HTML')
    if (!hasVueGen) missing.push('Vue')
    if (!hasAngularGen) missing.push('Angular')
    if (!hasSvelteGen) missing.push('Svelte')
    issues.push({ category: 'codegen', severity: 'major', message: `Missing code generators: ${missing.join(', ')}`, deduction: missing.length * 2 })
    codeGenScore -= missing.length * 2
  }
  breakdown['codegen'] = Math.max(0, codeGenScore)

  // ─── 7. Accessibility (10 pts) ────────────────────────────────────
  let a11yScore = 10
  const hasA11ySection = /accessibility|Accessibility|a11y/i.test(content)
  if (!hasA11ySection) {
    issues.push({ category: 'a11y', severity: 'critical', message: 'No accessibility section', deduction: 10 })
    a11yScore = 0
  }
  breakdown['a11y'] = Math.max(0, a11yScore)

  // ─── 8. Visual Design (10 pts) ────────────────────────────────────
  let visualScore = 10
  const hasAuroraHero = /aurora|conic-gradient|hero.*gradient|gradient.*hero/i.test(content)
  if (!hasAuroraHero) {
    issues.push({ category: 'visual', severity: 'major', message: 'No aurora hero section', deduction: 3 })
    visualScore -= 3
  }
  const hasScrollReveal = /animation-timeline.*view|IntersectionObserver|scrollReveal|scroll.*reveal/i.test(content)
  if (!hasScrollReveal) {
    issues.push({ category: 'visual', severity: 'minor', message: 'No scroll reveal animation on sections', deduction: 2 })
    visualScore -= 2
  }
  breakdown['visual'] = Math.max(0, visualScore)

  // ─── 9. Responsive (10 pts) ───────────────────────────────────────
  let responsiveScore = 10
  const hasMediaQuery = /@media.*max-width|@media.*min-width/.test(content)
  const hasContainerQuery = /@container|container-type|container-name/.test(content)
  if (!hasMediaQuery && !hasContainerQuery) {
    issues.push({ category: 'responsive', severity: 'major', message: 'No media or container queries', deduction: 5 })
    responsiveScore -= 5
  }
  breakdown['responsive'] = Math.max(0, responsiveScore)

  // ─── 10. Performance (10 pts) ─────────────────────────────────────
  let perfScore = 10
  const hasBundleSize = /KB.*gzip|gzip.*KB|size-breakdown|size-row/i.test(content)
  if (!hasBundleSize && lineCount > 800) {
    issues.push({ category: 'performance', severity: 'minor', message: 'No bundle size information in tier cards', deduction: 2 })
    perfScore -= 2
  }
  breakdown['performance'] = Math.max(0, perfScore)

  // ─── 11. DX (10 pts) ──────────────────────────────────────────────
  let dxScore = 10
  const hasTierCards = /tier-card|Weight.*Tier|weight.*tier/i.test(content)
  if (!hasTierCards && lineCount > 800) {
    issues.push({ category: 'dx', severity: 'major', message: 'No weight tier cards section', deduction: 5 })
    dxScore -= 5
  }
  const hasSourceLinks = /source.*github|github.*source|Source.*href/i.test(content)
  if (!hasSourceLinks && lineCount > 800) {
    issues.push({ category: 'dx', severity: 'minor', message: 'No source code links', deduction: 2 })
    dxScore -= 2
  }
  // Check for v2 branch links (should be main)
  const hasV2Links = /blob\/v2\//.test(content)
  if (hasV2Links) {
    issues.push({ category: 'dx', severity: 'minor', message: 'Source links point to v2 branch (should be main)', deduction: 1 })
    dxScore -= 1
  }
  const hasBrandColor = /brand.*color|Brand.*Color|ColorInput/i.test(content)
  if (!hasBrandColor && lineCount > 800) {
    issues.push({ category: 'dx', severity: 'minor', message: 'No brand color picker section', deduction: 2 })
    dxScore -= 2
  }
  breakdown['dx'] = Math.max(0, dxScore)

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0)

  return {
    page: pageName,
    component: componentName,
    score: totalScore,
    maxScore: 110,
    grade: getGrade(totalScore),
    issues,
    breakdown,
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const failingOnly = args.includes('--failing-only')
const specificPage = args.find(a => !a.startsWith('--'))

const pages = readdirSync(DEMO_DIR)
  .filter(f => f.endsWith('Page.tsx'))
  .filter(f => !specificPage || f.includes(specificPage))
  .sort()

const results: PageAudit[] = []

for (const page of pages) {
  const result = auditPage(resolve(DEMO_DIR, page))
  results.push(result)
}

// ─── Output ──────────────────────────────────────────────────────────────────

const filtered = failingOnly ? results.filter(r => r.score < 110) : results

// Summary table
console.log('\n' + '='.repeat(80))
console.log('  UI-KIT COMPONENT AUDIT REPORT')
console.log('='.repeat(80))
console.log('')
console.log(`  ${'Component'.padEnd(35)} ${'Score'.padEnd(10)} ${'Grade'.padEnd(8)} Issues`)
console.log('  ' + '-'.repeat(70))

for (const r of filtered.sort((a, b) => b.score - a.score)) {
  const issueCount = r.issues.length
  const critical = r.issues.filter(i => i.severity === 'critical').length
  const major = r.issues.filter(i => i.severity === 'major').length
  const scoreStr = `${r.score}/${r.maxScore}`
  const issueStr = critical > 0 ? `${critical}C ${major}M` : major > 0 ? `${major}M` : '✓'
  console.log(`  ${r.page.padEnd(35)} ${scoreStr.padEnd(10)} ${r.grade.padEnd(8)} ${issueStr}`)
}

// Stats
const total = results.length
const perfect = results.filter(r => r.score === 110).length
const aGrade = results.filter(r => r.score >= 100).length
const failing = results.filter(r => r.score < 80).length
const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / total)

console.log('')
console.log('  ' + '-'.repeat(70))
console.log(`  Total: ${total} pages | Perfect (110): ${perfect} | A+ (100+): ${aGrade} | Failing (<80): ${failing} | Avg: ${avgScore}/110`)
console.log('')

// Detail for failing pages
if (failingOnly || specificPage) {
  for (const r of filtered.filter(r => r.score < 110)) {
    console.log(`\n  ── ${r.page} (${r.score}/${r.maxScore}) ──`)
    console.log(`  Breakdown: ${Object.entries(r.breakdown).map(([k, v]) => `${k}=${v}`).join(' ')}`)
    for (const issue of r.issues) {
      const icon = issue.severity === 'critical' ? '✗' : issue.severity === 'major' ? '!' : '·'
      console.log(`    ${icon} [${issue.category}] ${issue.message} (-${issue.deduction})`)
    }
  }
}

// Exit code
process.exit(perfect === total ? 0 : 1)
