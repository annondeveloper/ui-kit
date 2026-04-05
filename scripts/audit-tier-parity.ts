/**
 * audit-tier-parity.ts
 *
 * Automated structural parity audit for Lite/Standard/Premium tiers.
 * Checks whether each component's tiers produce compatible DOM structures.
 *
 * Approach: Static analysis of source files to detect:
 * 1. Root element type (div, span, button, dialog, etc.)
 * 2. Whether Lite uses native HTML (select, title attribute) vs custom
 * 3. Whether Premium wraps Standard or reimplements
 * 4. Props interface compatibility
 * 5. CSS class naming consistency
 *
 * Usage:
 *   npx tsx scripts/audit-tier-parity.ts              # audit all
 *   npx tsx scripts/audit-tier-parity.ts Button        # audit specific
 *   npx tsx scripts/audit-tier-parity.ts --failing-only # only show issues
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, basename } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENTS_DIR = resolve(ROOT, 'src/components')
const DOMAIN_DIR = resolve(ROOT, 'src/domain')
const LITE_DIR = resolve(ROOT, 'src/lite')
const PREMIUM_DIR = resolve(ROOT, 'src/premium')

interface TierAudit {
  component: string
  liteFile: string | null
  premiumFile: string | null
  standardFile: string | null

  // Structural checks
  liteApproach: 'forwardRef-inline' | 'reexport' | 'native-element' | 'custom-impl' | 'missing'
  premiumApproach: 'wraps-standard' | 'reimplements' | 'css-only' | 'missing'

  // Root element analysis
  liteRootElement: string | null
  standardRootElement: string | null
  premiumRootElement: string | null
  rootElementMatch: boolean

  // Native vs custom mismatch (biggest issue)
  usesNativeElement: boolean  // Lite uses <select>, <dialog>, title attr etc differently
  nativeElementDetail: string | null

  // Props compatibility
  litePropsInterface: string | null
  standardPropsInterface: string | null
  propsCompatible: boolean

  // Premium wrapper check
  premiumAddsExtraDOM: boolean
  premiumDOMDetail: string | null

  // Overall verdict
  verdict: 'PASS' | 'PARTIAL' | 'FAIL'
  issues: string[]
}

function getKebabName(componentName: string): string {
  return componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/^three-d/, '3d') // Card3D -> card-3d
}

function findStandardFile(kebab: string): string | null {
  const compPath = resolve(COMPONENTS_DIR, `${kebab}.tsx`)
  if (existsSync(compPath)) return compPath
  const domainPath = resolve(DOMAIN_DIR, `${kebab}.tsx`)
  if (existsSync(domainPath)) return domainPath
  return null
}

function analyzeFile(path: string): {
  approach: string
  rootElement: string | null
  usesNative: boolean
  nativeDetail: string | null
  addsExtraDOM: boolean
  domDetail: string | null
  propsInterface: string | null
} {
  const content = readFileSync(path, 'utf-8')

  // Detect approach
  let approach = 'custom-impl'
  if (/from\s+['"]\.\.\/components\//.test(content) || /from\s+['"]\.\.\/domain\//.test(content)) {
    if (/as\s+Base\w+/.test(content)) approach = 'wraps-standard'
    else approach = 'reexport'
  }
  if (/forwardRef/.test(content) && /style\s*[:=]\s*\{/.test(content) && !/useStyles/.test(content)) {
    approach = 'forwardRef-inline'
  }

  // Detect root element
  let rootElement: string | null = null
  const returnMatch = content.match(/return\s*\(\s*<(\w+)/)
  if (returnMatch) rootElement = returnMatch[1]
  // Also check the Base component pattern
  const baseMatch = content.match(/<Base(\w+)/)
  if (baseMatch) rootElement = `Base${baseMatch[1]}`

  // Detect native element usage
  let usesNative = false
  let nativeDetail: string | null = null
  if (/<select[\s>]/.test(content) && !/<Select/.test(content)) {
    usesNative = true
    nativeDetail = 'Uses native <select> element'
  }
  if (/title\s*=\s*\{.*content/.test(content) && /role="tooltip"/.test(content) === false) {
    usesNative = true
    nativeDetail = 'Uses native title attribute instead of custom tooltip'
  }
  if (/<optgroup/.test(content)) {
    usesNative = true
    nativeDetail = (nativeDetail || '') + ' + <optgroup>'
  }

  // Detect extra DOM from Premium
  let addsExtraDOM = false
  let domDetail: string | null = null
  const wrapperMatch = content.match(/className\s*=\s*["']ui-premium-\w+["']/)
  if (wrapperMatch) {
    // Check if it uses display:contents (no extra DOM impact)
    if (/display:\s*contents/.test(content)) {
      domDetail = 'Premium wrapper with display:contents (no layout impact)'
    } else {
      addsExtraDOM = true
      domDetail = 'Premium adds extra wrapper element'
    }
  }
  // Check for dynamic DOM creation
  if (/document\.createElement|appendChild|insertBefore/.test(content)) {
    addsExtraDOM = true
    domDetail = (domDetail || '') + ' + creates dynamic DOM elements'
  }

  // Props interface
  let propsInterface: string | null = null
  const propsMatch = content.match(/export\s+interface\s+(\w+Props)/)
  if (propsMatch) propsInterface = propsMatch[1]
  // Check if it imports and extends standard props
  const importPropsMatch = content.match(/type\s+(\w+Props)\s*\}?\s*from/)
  if (importPropsMatch) propsInterface = importPropsMatch[1]

  return { approach, rootElement, usesNative, nativeDetail, addsExtraDOM, domDetail, propsInterface }
}

function auditComponent(kebab: string): TierAudit {
  const component = kebab.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')

  const litePath = resolve(LITE_DIR, `${kebab}.tsx`)
  const premiumPath = resolve(PREMIUM_DIR, `${kebab}.tsx`)
  const standardPath = findStandardFile(kebab)

  const liteExists = existsSync(litePath)
  const premiumExists = existsSync(premiumPath)
  const standardExists = standardPath !== null

  const issues: string[] = []

  if (!liteExists) issues.push('No lite variant')
  if (!premiumExists) issues.push('No premium variant')
  if (!standardExists) issues.push('No standard variant')

  const lite = liteExists ? analyzeFile(litePath) : null
  const premium = premiumExists ? analyzeFile(premiumPath) : null
  const standard = standardExists ? analyzeFile(standardPath!) : null

  // Root element match
  let rootMatch = true
  if (lite?.usesNative) {
    rootMatch = false
    issues.push(`Lite uses native element: ${lite.nativeDetail}`)
  }
  if (premium?.addsExtraDOM) {
    if (!premium.domDetail?.includes('display:contents')) {
      rootMatch = false
      issues.push(`Premium adds extra DOM: ${premium.domDetail}`)
    }
  }

  // Props compatibility
  let propsCompatible = true
  if (lite && standard) {
    // If lite has a different props interface name, it might be incompatible
    if (lite.propsInterface && standard.propsInterface &&
        lite.propsInterface !== standard.propsInterface &&
        !lite.propsInterface.startsWith('Lite')) {
      propsCompatible = false
      issues.push(`Props mismatch: Lite=${lite.propsInterface}, Standard=${standard.propsInterface}`)
    }
  }

  // Verdict
  let verdict: 'PASS' | 'PARTIAL' | 'FAIL' = 'PASS'
  if (lite?.usesNative) verdict = 'FAIL'
  else if (premium?.addsExtraDOM && !premium.domDetail?.includes('display:contents')) verdict = 'PARTIAL'
  else if (issues.length > 0 && issues.some(i => !i.includes('display:contents'))) verdict = 'PARTIAL'
  if (!liteExists || !premiumExists) verdict = 'FAIL'

  return {
    component,
    liteFile: liteExists ? litePath : null,
    premiumFile: premiumExists ? premiumPath : null,
    standardFile: standardPath,
    liteApproach: !liteExists ? 'missing' : (lite!.usesNative ? 'native-element' : lite!.approach as any),
    premiumApproach: !premiumExists ? 'missing' : (premium!.approach as any),
    liteRootElement: lite?.rootElement ?? null,
    standardRootElement: standard?.rootElement ?? null,
    premiumRootElement: premium?.rootElement ?? null,
    rootElementMatch: rootMatch,
    usesNativeElement: lite?.usesNative ?? false,
    nativeElementDetail: lite?.nativeDetail ?? null,
    litePropsInterface: lite?.propsInterface ?? null,
    standardPropsInterface: standard?.propsInterface ?? null,
    propsCompatible,
    premiumAddsExtraDOM: premium?.addsExtraDOM ?? false,
    premiumDOMDetail: premium?.domDetail ?? null,
    verdict,
    issues,
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const failingOnly = args.includes('--failing-only')
const specificComponent = args.find(a => !a.startsWith('--'))

// Get all lite components as the source of truth
const allComponents = readdirSync(LITE_DIR)
  .filter(f => f.endsWith('.tsx') && f !== 'index.ts')
  .map(f => basename(f, '.tsx'))
  .filter(f => !specificComponent || f.includes(specificComponent.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')) || f.includes(specificComponent.toLowerCase()))
  .sort()

const results: TierAudit[] = []
for (const kebab of allComponents) {
  results.push(auditComponent(kebab))
}

// Output
const filtered = failingOnly ? results.filter(r => r.verdict !== 'PASS') : results

console.log('\n' + '='.repeat(90))
console.log('  TIER STRUCTURAL PARITY AUDIT')
console.log('='.repeat(90))
console.log('')
console.log(`  ${'Component'.padEnd(30)} ${'Verdict'.padEnd(10)} ${'Lite'.padEnd(18)} ${'Premium'.padEnd(18)} Issues`)
console.log('  ' + '-'.repeat(85))

for (const r of filtered) {
  const verdictIcon = r.verdict === 'PASS' ? '✓' : r.verdict === 'PARTIAL' ? '~' : '✗'
  const issueStr = r.issues.length > 0 ? r.issues[0].slice(0, 40) : ''
  console.log(`  ${r.component.padEnd(30)} ${verdictIcon} ${r.verdict.padEnd(7)} ${r.liteApproach.padEnd(18)} ${r.premiumApproach.padEnd(18)} ${issueStr}`)
}

// Stats
const total = results.length
const pass = results.filter(r => r.verdict === 'PASS').length
const partial = results.filter(r => r.verdict === 'PARTIAL').length
const fail = results.filter(r => r.verdict === 'FAIL').length
const nativeIssues = results.filter(r => r.usesNativeElement)
const extraDOM = results.filter(r => r.premiumAddsExtraDOM)

console.log('')
console.log('  ' + '-'.repeat(85))
console.log(`  Total: ${total} | PASS: ${pass} | PARTIAL: ${partial} | FAIL: ${fail}`)
console.log(`  Native element issues: ${nativeIssues.length} | Premium extra DOM: ${extraDOM.length}`)
console.log('')

if (failingOnly || specificComponent) {
  for (const r of filtered.filter(r => r.verdict !== 'PASS')) {
    console.log(`\n  ── ${r.component} (${r.verdict}) ──`)
    console.log(`  Lite: ${r.liteApproach} | Premium: ${r.premiumApproach}`)
    console.log(`  Root elements: Lite=${r.liteRootElement} | Standard=${r.standardRootElement} | Premium=${r.premiumRootElement}`)
    for (const issue of r.issues) {
      console.log(`    ✗ ${issue}`)
    }
  }
}

process.exit(fail > 0 ? 1 : 0)
