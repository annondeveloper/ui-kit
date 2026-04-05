'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Highlight } from '@ui/components/highlight'
import { Highlight as LiteHighlight } from '@ui/lite/highlight'
import { Highlight as PremiumHighlight } from '@ui/premium/highlight'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'highlight-page'

const pageStyles = css`
  @layer demo {
    @scope (.${PAGE}) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ${PAGE};
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .${PAGE}__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .${PAGE}__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .${PAGE}__hero::before { animation: none; }
      }

      .${PAGE}__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .${PAGE}__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .${PAGE}__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .${PAGE}__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .${PAGE}__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .${PAGE}__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .${PAGE}__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .${PAGE}__section-title a { color: inherit; text-decoration: none; }
      .${PAGE}__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .${PAGE}__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .${PAGE}__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .${PAGE}__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__search-input {
        position: relative;
        padding: 0.625rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-elevated);
        color: var(--text-primary);
        font-size: var(--text-sm, 0.875rem);
        inline-size: 100%;
        max-inline-size: 320px;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .${PAGE}__search-input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__sample-text {
        position: relative;
        font-size: var(--text-base, 1rem);
        line-height: 1.7;
        color: var(--text-primary);
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .${PAGE}__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Tiers ───────────────────────────────── */

      .${PAGE}__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .${PAGE}__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .${PAGE}__tier-card:hover { border-color: var(--border-default); }
      .${PAGE}__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

      .${PAGE}__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .${PAGE}__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .${PAGE}__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .${PAGE}__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }

      .${PAGE}__tier-preview {
        padding-block-start: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.7;
        color: var(--text-primary);
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__tiers { grid-template-columns: 1fr; }
      }

      /* ── Playground ───────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
        .${PAGE}__playground-controls {
          order: -1;
        }
      }

      .${PAGE}__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .${PAGE}__playground-result {
        position: relative;
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        font-size: var(--text-base, 1rem);
        line-height: 1.7;
        color: var(--text-primary);
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
      }

      .${PAGE}__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .${PAGE}__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .${PAGE}__control-input {
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-elevated);
        color: var(--text-primary);
        font-size: var(--text-sm, 0.875rem);
        outline: none;
        transition: border-color 0.15s ease;
      }

      .${PAGE}__control-input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__control-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__control-checkbox {
        accent-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: oklch(72% 0.17 145);
        font-weight: 500;
      }

      /* ── Accessibility ────────────────────────── */

      .${PAGE}__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .${PAGE}__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-primary);
      }

      .${PAGE}__a11y-icon {
        color: oklch(72% 0.17 145);
        flex-shrink: 0;
        margin-block-start: 0.15rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.35em;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ─────────────────────────── */

      .${PAGE}__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: none;
        padding: 0.375rem 0;
        transition: color 0.15s;
      }

      .${PAGE}__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'children', type: 'string', required: true, description: 'The text content to search within and render.' },
  { name: 'highlight', type: 'string | string[]', required: true, description: 'Search term(s) to highlight. Matching substrings are wrapped in <mark> elements.' },
  { name: 'color', type: 'string', description: 'Background color for highlighted segments.' },
  { name: 'caseSensitive', type: 'boolean', default: 'false', description: 'Whether matching is case-sensitive.' },
  { name: 'highlightClassName', type: 'string', description: 'CSS class applied to each highlighted <mark> element.' },
]

const IMPORT = "import { Highlight } from '@ui/components/highlight'"

const SAMPLE_TEXT =
  'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called components. React makes it painless to create interactive UIs.'

// ─── Code Generators ────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Highlight } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Highlight } from '@annondeveloper/ui-kit'",
  premium: "import { Highlight } from '@annondeveloper/ui-kit/premium'",
}

function generateReactCode(
  tier: Tier,
  terms: string,
  caseSensitive: boolean,
  color: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  const highlightArr = terms.includes(',')
    ? `{[${terms.split(',').map(t => `'${t.trim()}'`).join(', ')}]}`
    : `"${terms}"`
  props.push(`  highlight=${highlightArr}`)
  if (caseSensitive) props.push('  caseSensitive')
  if (color) props.push(`  color="${color}"`)

  return `${importStr}\n\n<Highlight\n${props.join('\n')}\n>\n  {text}\n</Highlight>`
}

function generateHtmlCode(
  terms: string,
  color: string,
): string {
  const bgColor = color || 'oklch(85% 0.15 80 / 0.5)'
  const termsList = terms.includes(',')
    ? terms.split(',').map(t => t.trim())
    : [terms]
  const markedText = termsList.reduce(
    (text, term) => text.replace(new RegExp(`(${term})`, 'gi'), `<mark style="background:${bgColor}">$1</mark>`),
    'React is a JavaScript library for building user interfaces.',
  )
  return `<!-- Highlight — HTML/CSS approach -->\n<p>\n  ${markedText}\n</p>\n\n<style>\n  mark {\n    background: ${bgColor};\n    border-radius: 2px;\n    padding-inline: 0.125em;\n  }\n</style>`
}

function generateVueCode(
  tier: Tier,
  terms: string,
  caseSensitive: boolean,
  color: string,
): string {
  if (tier === 'lite') {
    return `<!-- Vue — Lite tier (CSS-only mark elements) -->\n<template>\n  <p>\n    <mark v-for="segment in segments" :key="segment.id"\n      :style="{ background: '${color || 'oklch(85% 0.15 80 / 0.5)'}' }"\n    >{{ segment.text }}</mark>\n  </p>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`  highlight="${terms}"`]
  if (caseSensitive) props.push('  case-sensitive')
  if (color) props.push(`  color="${color}"`)
  return `<template>\n  <Highlight\n  ${props.join('\n  ')}\n  >\n    {{ text }}\n  </Highlight>\n</template>\n\n<script setup>\nimport { Highlight } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  terms: string,
  color: string,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier -->\n<!-- Use the CSS-only approach with mark elements -->\n<p>\n  <ng-container *ngFor="let segment of segments">\n    <mark *ngIf="segment.match" [style.background]="'${color || 'oklch(85% 0.15 80 / 0.5)'}'">\n      {{ segment.text }}\n    </mark>\n    <span *ngIf="!segment.match">{{ segment.text }}</span>\n  </ng-container>\n</p>\n\n/* Import CSS */\n@import '${importPath}/css/components/highlight.css';`
}

function generateSvelteCode(
  tier: Tier,
  terms: string,
  caseSensitive: boolean,
  color: string,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<p>\n  {#each segments as segment}\n    {#if segment.match}\n      <mark style="background: ${color || 'oklch(85% 0.15 80 / 0.5)'}">{segment.text}</mark>\n    {:else}\n      {segment.text}\n    {/if}\n  {/each}\n</p>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`  highlight="${terms}"`]
  if (caseSensitive) props.push('  caseSensitive')
  if (color) props.push(`  color="${color}"`)
  return `<script>\n  import { Highlight } from '${importPath}';\n</script>\n\n<Highlight\n${props.join('\n')}\n>\n  {text}\n</Highlight>`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HighlightPage() {
  useStyles('highlight-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveHighlight = tier === 'lite' ? LiteHighlight : tier === 'premium' ? PremiumHighlight : Highlight

  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('React')

  // Playground state
  const [pgTerms, setPgTerms] = useState('React')
  const [pgCaseSensitive, setPgCaseSensitive] = useState(false)
  const [pgColor, setPgColor] = useState('')
  const [pgMotion] = useState(0) // Highlight has no motion — kept for audit pattern
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const reactCode = useMemo(
    () => generateReactCode(tier, pgTerms, pgCaseSensitive, pgColor),
    [tier, pgTerms, pgCaseSensitive, pgColor],
  )
  const htmlCssCode = useMemo(
    () => generateHtmlCode(pgTerms, pgColor),
    [pgTerms, pgColor],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, pgTerms, pgCaseSensitive, pgColor),
    [tier, pgTerms, pgCaseSensitive, pgColor],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, pgTerms, pgColor),
    [tier, pgTerms, pgColor],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, pgTerms, pgCaseSensitive, pgColor),
    [tier, pgTerms, pgCaseSensitive, pgColor],
  )
  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Highlight</h1>
        <p className={`${PAGE}__desc`}>
          Text highlighting component that wraps matching substrings in mark elements.
          Useful for search result previews and keyword emphasis.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Live Search ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="live-search">
        <h2 className={`${PAGE}__section-title`}><a href="#live-search">Live Search Highlighting</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Type in the search box to see matching text highlighted in real time.
          The component splits the text and wraps matches in styled mark elements.
        </p>
        <div className={`${PAGE}__preview`}>
          <input
            type="text"
            className={`${PAGE}__search-input`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to highlight..."
            aria-label="Search text to highlight"
          />
          <div className={`${PAGE}__sample-text`}>
            <ActiveHighlight highlight={search}>{SAMPLE_TEXT}</ActiveHighlight>
          </div>
        </div>
      </section>

      {/* ── 2. Multiple Terms & Options ──────────────────── */}
      <section className={`${PAGE}__section`} id="multiple">
        <h2 className={`${PAGE}__section-title`}><a href="#multiple">Multiple Terms & Options</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Pass an array of strings to highlight multiple terms simultaneously.
          Use custom colors and case-sensitive matching for precise control.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>multiple terms: ["React", "components", "UIs"]</span>
            <div className={`${PAGE}__sample-text`}>
              <ActiveHighlight highlight={['React', 'components', 'UIs']}>{SAMPLE_TEXT}</ActiveHighlight>
            </div>
          </div>

          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>custom color (oklch green)</span>
            <div className={`${PAGE}__sample-text`}>
              <ActiveHighlight highlight="JavaScript" color="oklch(75% 0.15 145 / 0.3)">{SAMPLE_TEXT}</ActiveHighlight>
            </div>
          </div>

          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>case-sensitive: "react" (no match) vs "React" (match)</span>
            <div className={`${PAGE}__sample-text`}>
              <ActiveHighlight highlight="react" caseSensitive>{SAMPLE_TEXT}</ActiveHighlight>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Weight Tiers ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}><a href="#tiers">Weight Tiers</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Highlight is a pure rendering utility with no motion, so all three tiers share
          the same implementation. The Lite and Premium packages re-export the Standard component
          unchanged, making Highlight a zero-overhead addition at any tier.
        </p>
        <div className={`${PAGE}__tiers`}>
          {/* Lite */}
          <div className={`${PAGE}__tier-card${tier === 'lite' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Lite</span>
              <span className={`${PAGE}__tier-size`}>~0.3 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Re-exports the Standard component directly. Identical output, no extra overhead.
              Use when only the Lite bundle is imported.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Highlight {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteHighlight highlight="Lite">Lite re-export — same as Standard.</LiteHighlight>
            </div>
          </div>

          {/* Standard */}
          <div className={`${PAGE}__tier-card${tier === 'standard' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Standard</span>
              <span className={`${PAGE}__tier-size`}>~0.3 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Core implementation. Splits text on matching substrings, wraps each in a{' '}
              <code>{'<mark>'}</code> with configurable color and className. Supports arrays of terms.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Highlight {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <Highlight highlight="Standard">Standard highlight component.</Highlight>
            </div>
          </div>

          {/* Premium */}
          <div className={`${PAGE}__tier-card${tier === 'premium' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Premium</span>
              <span className={`${PAGE}__tier-size`}>~0.3 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Re-exports the Standard component unchanged. Highlight has no motion props,
              so Premium adds no additional layer.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Highlight {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumHighlight highlight="Premium">Premium re-export — same as Standard.</PremiumHighlight>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Highlight.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── 5. Playground ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="playground">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#playground">Playground</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Tweak props and preview the result. The code generators update as you change settings.
          Motion level has no effect on Highlight as it is a purely visual component.
        </p>

        <div className={`${PAGE}__playground`}>
          {/* Preview + code */}
          <div className={`${PAGE}__playground-preview`}>
            <div className={`${PAGE}__playground-result`}>
              <ActiveHighlight
                highlight={pgTerms.includes(',') ? pgTerms.split(',').map(t => t.trim()) : pgTerms}
                caseSensitive={pgCaseSensitive}
                color={pgColor || undefined}
              >
                {SAMPLE_TEXT}
              </ActiveHighlight>
            </div>

            {/* Code tabs */}
            <div className={`${PAGE}__code-tabs`}>
              <div className={`${PAGE}__export-row`}>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Icon name="copy" size="sm" />}
                  onClick={() => {
                    navigator.clipboard?.writeText(activeCode).then(() => {
                      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                      setTimeout(() => setCopyStatus(''), 2000)
                    })
                  }}
                >
                  Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
                </Button>
                {copyStatus && <span className={`${PAGE}__export-status`}>{copyStatus}</span>}
              </div>
              <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
                <TabPanel tabId="react">
                  <CopyBlock code={reactCode} language="typescript" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="html">
                  <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="vue">
                  <CopyBlock code={vueCode} language="html" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="angular">
                  <CopyBlock code={angularCode} language="html" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="svelte">
                  <CopyBlock code={svelteCode} language="html" showLineNumbers />
                </TabPanel>
              </Tabs>
            </div>
          </div>

          {/* Controls */}
          <div className={`${PAGE}__playground-controls`}>
            <div className={`${PAGE}__control-group`}>
              <label className={`${PAGE}__control-label`}>Search Terms</label>
              <input
                className={`${PAGE}__control-input`}
                type="text"
                value={pgTerms}
                onChange={e => setPgTerms(e.target.value)}
                placeholder="Comma-separated terms"
                aria-label="Highlight search terms"
              />
            </div>

            <div className={`${PAGE}__control-group`}>
              <label className={`${PAGE}__control-label`}>Brand Color</label>
              <input
                className={`${PAGE}__control-input`}
                type="text"
                value={pgColor}
                onChange={e => setPgColor(e.target.value)}
                placeholder="e.g. oklch(85% 0.15 80 / 0.5)"
                aria-label="Highlight brand color"
              />
            </div>

            <div className={`${PAGE}__control-group`}>
              <div className={`${PAGE}__control-row`}>
                <input
                  className={`${PAGE}__control-checkbox`}
                  type="checkbox"
                  id="pg-case"
                  checked={pgCaseSensitive}
                  onChange={e => setPgCaseSensitive(e.target.checked)}
                />
                <label htmlFor="pg-case" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Case Sensitive
                </label>
              </div>
            </div>

            <div className={`${PAGE}__control-group`}>
              <label className={`${PAGE}__control-label`}>Motion Level</label>
              <select
                className={`${PAGE}__control-input`}
                value={pgMotion}
                disabled
                aria-label="Motion level (not applicable)"
              >
                <option value={0}>N/A (no motion)</option>
              </select>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                Highlight is a pure rendering utility with no motion props.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Accessibility ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Highlight is built on native HTML <code>&lt;mark&gt;</code> elements for maximum
          screen reader compatibility.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses native <code className={`${PAGE}__a11y-key`}>&lt;mark&gt;</code> elements
                which are recognized by assistive technologies as highlighted text.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Screen readers:</strong> VoiceOver, JAWS, and NVDA announce marked text
                with highlight semantics when using <code className={`${PAGE}__a11y-key`}>&lt;mark&gt;</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Default highlight color meets WCAG AA contrast ratio
                for both light and dark themes.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast mode:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with
                system highlight colors.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>No motion:</strong> Highlight is a pure text component with zero animations,
                so <code className={`${PAGE}__a11y-key`}>prefers-reduced-motion</code> has no effect.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Custom class:</strong> The <code className={`${PAGE}__a11y-key`}>highlightClassName</code> prop lets you
                add ARIA-compatible styling without breaking semantic structure.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Source ──────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/highlight.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/domain/highlight.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/highlight.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/highlight.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/highlight.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/highlight.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
