'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { JsonViewer } from '@ui/domain/json-viewer'
import { JsonViewer as LiteJsonViewer } from '@ui/lite/json-viewer'
import { JsonViewer as PremiumJsonViewer } from '@ui/premium/json-viewer'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

type Tier = 'lite' | 'standard' | 'premium'

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SIMPLE_DATA = {
  name: 'Aurora UI Kit',
  version: '2.3.0',
  description: 'Zero-dependency React component library',
  tags: ['react', 'typescript', 'oklch'],
  author: { name: 'anon', email: 'dev@example.com' },
  published: true,
  downloads: 128_450,
}

const NESTED_DATA = {
  server: {
    host: 'api.example.com',
    port: 443,
    tls: true,
    routes: [
      { path: '/users', method: 'GET', auth: true },
      { path: '/health', method: 'GET', auth: false },
      { path: '/data', method: 'POST', auth: true, rateLimit: { max: 100, window: '1m' } },
    ],
    middleware: ['cors', 'helmet', 'compress'],
  },
  database: {
    host: 'db.internal',
    port: 5432,
    pool: { min: 2, max: 10, idle: 30000 },
  },
}

function makeCircularData() {
  const obj: Record<string, unknown> = { id: 1, label: 'root' }
  const child: Record<string, unknown> = { id: 2, label: 'child' }
  child.parent = obj
  obj.child = child
  return obj
}

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'data', type: 'unknown', required: true, description: 'The JSON data to display. Supports objects, arrays, primitives, null, and handles circular references.' },
  { name: 'initialExpandDepth', type: 'number', description: 'Number of levels to expand by default on initial render.' },
  { name: 'collapsed', type: 'boolean', description: 'When true, all nodes start collapsed regardless of initialExpandDepth.' },
  { name: 'rootName', type: 'string', description: 'Label shown for the root node.' },
  { name: 'enableClipboard', type: 'boolean', description: 'Show copy-to-clipboard button on hover for each value.' },
  { name: 'displayDataTypes', type: 'boolean', description: 'Show type annotations next to values (string, number, etc.).' },
  { name: 'displayObjectSize', type: 'boolean', description: 'Show item count badge next to objects and arrays.' },
  { name: 'theme', type: "'dark' | 'light' | 'auto'", description: 'Color scheme for syntax highlighting.' },
  { name: 'indentWidth', type: 'number', description: 'Number of spaces per indentation level.' },
  { name: 'sortKeys', type: 'boolean', description: 'Alphabetically sort object keys.' },
  { name: 'maxStringLength', type: 'number', description: 'Truncate long strings to this character count with an ellipsis.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.json-viewer-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .json-viewer-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .json-viewer-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .json-viewer-page__hero::before { animation: none; }
      }

      .json-viewer-page__title {
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

      .json-viewer-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .json-viewer-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .json-viewer-page__import-code {
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
      }

      /* ── Sections ───────────────────────────────────── */

      .json-viewer-page__section {
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
        .json-viewer-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .json-viewer-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .json-viewer-page__section-title a { color: inherit; text-decoration: none; }
      .json-viewer-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .json-viewer-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .json-viewer-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .json-viewer-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .json-viewer-page__controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-block-end: 1rem;
      }

      /* ── Tiers ───────────────────────────────── */

      .json-viewer-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .json-viewer-page__tier-card {
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
      .json-viewer-page__tier-card:hover {
        border-color: var(--border-default);
      }
      .json-viewer-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15));
      }

      .json-viewer-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .json-viewer-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .json-viewer-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .json-viewer-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .json-viewer-page__tier-import {
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

      .json-viewer-page__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
        max-block-size: 200px;
        overflow-y: auto;
      }

      @container (max-width: 640px) {
        .json-viewer-page__tiers { grid-template-columns: 1fr; }
      }

      /* ── Playground ─────────────────────────────────── */

      .json-viewer-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container (max-width: 640px) {
        .json-viewer-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .json-viewer-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem;
        position: sticky;
        inset-block-start: 1rem;
      }

      .json-viewer-page__control-label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
      }

      .json-viewer-page__control-label strong {
        color: var(--text-primary);
        font-size: var(--text-xs, 0.75rem);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .json-viewer-page__control-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      /* ── Code Tabs ─────────────────────────────────── */

      .json-viewer-page__code-tabs {
        display: flex;
        gap: 0;
        border-block-end: 1px solid var(--border-subtle);
        margin-block-end: 0;
      }

      .json-viewer-page__code-tab {
        padding: 0.5rem 1rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        background: none;
        border: none;
        cursor: pointer;
        border-block-end: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }

      .json-viewer-page__code-tab:hover {
        color: var(--text-secondary);
      }

      .json-viewer-page__code-tab--active {
        color: var(--brand, oklch(65% 0.2 270));
        border-block-end-color: var(--brand, oklch(65% 0.2 270));
      }

      .json-viewer-page__code-block {
        background: oklch(0% 0 0 / 0.3);
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        padding: 1rem;
        overflow-x: auto;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.6;
        color: var(--text-primary);
        white-space: pre;
      }

      /* ── Accessibility ─────────────────────────────── */

      .json-viewer-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .json-viewer-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .json-viewer-page__a11y-icon {
        color: oklch(72% 0.19 155);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .json-viewer-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.2);
        padding: 0.1em 0.4em;
        border-radius: var(--radius-sm);
        color: var(--text-primary);
      }
    }
  }
`

const IMPORT_STR = "import { JsonViewer } from '@ui/domain/json-viewer'"

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { JsonViewer } from '@annondeveloper/ui-kit/lite'",
  standard: "import { JsonViewer } from '@annondeveloper/ui-kit'",
  premium: "import { JsonViewer } from '@annondeveloper/ui-kit/premium'",
}

const PLAYGROUND_DATA = {
  name: 'Aurora UI Kit',
  version: '2.7.0',
  features: ['OKLCH colors', 'physics motion', 'zero deps'],
  config: { theme: 'dark', motion: 3, responsive: true },
}

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  rootName: string,
  expandDepth: number,
  showTypes: boolean,
  showSizes: boolean,
  enableCopy: boolean,
  sortKeys: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  data={apiResponse}']
  if (rootName) props.push(`  rootName="${rootName}"`)
  if (expandDepth !== 1) props.push(`  initialExpandDepth={${expandDepth}}`)
  if (showTypes && tier !== 'lite') props.push('  displayDataTypes')
  if (showSizes && tier !== 'lite') props.push('  displayObjectSize')
  if (enableCopy && tier !== 'lite') props.push('  enableClipboard')
  if (sortKeys) props.push('  sortKeys')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<JsonViewer\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier,
  rootName: string,
): string {
  return `<!-- JsonViewer \u2014 @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/json-viewer.css">

<div class="ui-json-viewer" role="tree" aria-label="${rootName || 'JSON data'}">
  <div class="ui-json-viewer__node">
    <span class="ui-json-viewer__key">${rootName || 'root'}</span>
    <span class="ui-json-viewer__bracket">{</span>
  </div>
  <!-- Nodes rendered dynamically -->
</div>`
}

function generateVueCode(
  tier: Tier,
  rootName: string,
  expandDepth: number,
  showTypes: boolean,
  enableCopy: boolean,
): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-json-viewer" role="tree" aria-label="${rootName || 'JSON data'}">
    <pre>{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/json-viewer.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :data="apiResponse"']
  if (rootName) attrs.push(`  root-name="${rootName}"`)
  if (expandDepth !== 1) attrs.push(`  :initial-expand-depth="${expandDepth}"`)
  if (showTypes) attrs.push('  display-data-types')
  if (enableCopy) attrs.push('  enable-clipboard')

  return `<template>
  <JsonViewer
  ${attrs.join('\n  ')}
  />
</template>

<script setup>
import { JsonViewer } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, rootName: string): string {
  const cssPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular \u2014 ${tier} tier -->
<div class="ui-json-viewer" role="tree" [attr.aria-label]="'${rootName || 'JSON data'}'">
  <pre>{{ data | json }}</pre>
</div>

/* styles.css */
@import '${cssPath}/css/components/json-viewer.css';`
}

function generateSvelteCode(tier: Tier, rootName: string, expandDepth: number): string {
  if (tier === 'lite') {
    return `<div class="ui-json-viewer" role="tree" aria-label="${rootName || 'JSON data'}">
  <pre>{JSON.stringify(data, null, 2)}</pre>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/json-viewer.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  data={apiResponse}']
  if (rootName) attrs.push(`  rootName="${rootName}"`)
  if (expandDepth !== 1) attrs.push(`  initialExpandDepth={${expandDepth}}`)
  return `<script>
  import { JsonViewer } from '${importPath}';
</script>

<JsonViewer
${attrs.join('\n')}
/>`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JsonViewerPage() {
  useStyles('json-viewer-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveJsonViewer = tier === 'lite' ? LiteJsonViewer : tier === 'premium' ? PremiumJsonViewer : JsonViewer

  const [expandDepth, setExpandDepth] = useState(1)
  const [sorted, setSorted] = useState(false)

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.json-viewer-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="json-viewer-page">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="json-viewer-page__hero">
        <h1 className="json-viewer-page__title">JsonViewer</h1>
        <p className="json-viewer-page__desc">
          Interactive JSON tree explorer with expand/collapse, syntax coloring, copy-to-clipboard,
          and safe circular reference handling. Ideal for API responses and debug panels.
        </p>
        <div className="json-viewer-page__import-row">
          <code className="json-viewer-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
        <div style={{ marginBlockStart: '0.75rem', position: 'relative' }}>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/json-viewer" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-tertiary)' }}>
            Source on GitHub &rarr;
          </a>
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────── */}
      <section className="json-viewer-page__section" id="basic">
        <h2 className="json-viewer-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="json-viewer-page__section-desc">
          Pass any serializable value to <code>data</code>. The viewer renders a collapsible tree
          with syntax highlighting and type annotations.
        </p>
        <div className="json-viewer-page__preview">
          <ActiveJsonViewer data={SIMPLE_DATA} rootName="package" initialExpandDepth={2} />
        </div>
      </section>

      {/* ── 2. Deep Nesting & Controls ───────────────── */}
      <section className="json-viewer-page__section" id="nested">
        <h2 className="json-viewer-page__section-title"><a href="#nested">Deep Nesting &amp; Controls</a></h2>
        <p className="json-viewer-page__section-desc">
          Control expand depth and key sorting. Click any node to toggle its children. Hover a value
          to reveal the copy button.
        </p>
        <div className="json-viewer-page__controls">
          <Button size="sm" variant={expandDepth === 0 ? 'primary' : 'secondary'} onClick={() => setExpandDepth(0)}>Collapsed</Button>
          <Button size="sm" variant={expandDepth === 1 ? 'primary' : 'secondary'} onClick={() => setExpandDepth(1)}>Depth 1</Button>
          <Button size="sm" variant={expandDepth === 3 ? 'primary' : 'secondary'} onClick={() => setExpandDepth(3)}>Depth 3</Button>
          <Button size="sm" variant={sorted ? 'primary' : 'secondary'} onClick={() => setSorted(!sorted)}>
            {sorted ? 'Sorted' : 'Unsorted'}
          </Button>
        </div>
        <div className="json-viewer-page__preview">
          <ActiveJsonViewer
            data={NESTED_DATA}
            rootName="config"
            initialExpandDepth={expandDepth}
            sortKeys={sorted}
            displayObjectSize
            displayDataTypes
          />
        </div>
      </section>

      {/* ── 3. Circular References ───────────────────── */}
      <section className="json-viewer-page__section" id="circular">
        <h2 className="json-viewer-page__section-title"><a href="#circular">Circular References</a></h2>
        <p className="json-viewer-page__section-desc">
          JsonViewer safely detects and renders circular references with a visual indicator
          instead of throwing a stack overflow.
        </p>
        <div className="json-viewer-page__preview">
          <ActiveJsonViewer data={makeCircularData()} rootName="circular" initialExpandDepth={3} />
        </div>
      </section>

      {/* ── 4. Playground ─────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── Tiers ────────────────────────────────────── */}
      <section className="json-viewer-page__section" id="tiers">
        <h2 className="json-viewer-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="json-viewer-page__section-desc">
          Three tiers let you choose the right balance of bundle size and features.
          Lite renders a static pre-formatted text tree; Standard adds interactive
          expand/collapse, syntax coloring, clipboard, and circular reference detection;
          Premium wraps Standard with aurora glow, spring-animated chevrons, and row hover effects.
        </p>
        <div className="json-viewer-page__tiers">
          {/* Lite */}
          <div className={`json-viewer-page__tier-card${tier === 'lite' ? ' json-viewer-page__tier-card--active' : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="json-viewer-page__tier-header">
              <span className="json-viewer-page__tier-name">Lite</span>
              <span className="json-viewer-page__tier-size">~0.4 KB gzip</span>
            </div>
            <p className="json-viewer-page__tier-desc">
              Static pre-formatted output. No interactivity, no motion — just serializes
              data as indented text. Supports data, initialExpandDepth, collapsed, and rootName only.
            </p>
            <div className="json-viewer-page__tier-import">
              import {'{'} JsonViewer {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="json-viewer-page__tier-preview">
              <LiteJsonViewer data={{ name: 'Lite', tags: ['fast', 'tiny'] }} rootName="pkg" initialExpandDepth={2} />
            </div>
          </div>

          {/* Standard */}
          <div className={`json-viewer-page__tier-card${tier === 'standard' ? ' json-viewer-page__tier-card--active' : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="json-viewer-page__tier-header">
              <span className="json-viewer-page__tier-name">Standard</span>
              <span className="json-viewer-page__tier-size">~3.2 KB gzip</span>
            </div>
            <p className="json-viewer-page__tier-desc">
              Interactive tree with expand/collapse per node, syntax highlighting, copy-to-clipboard,
              type annotations, object size badges, key sorting, and safe circular reference handling.
            </p>
            <div className="json-viewer-page__tier-import">
              import {'{'} JsonViewer {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="json-viewer-page__tier-preview">
              <JsonViewer data={{ name: 'Standard', tags: ['interactive', 'full'] }} rootName="pkg" initialExpandDepth={2} enableClipboard displayDataTypes />
            </div>
          </div>

          {/* Premium */}
          <div className={`json-viewer-page__tier-card${tier === 'premium' ? ' json-viewer-page__tier-card--active' : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="json-viewer-page__tier-header">
              <span className="json-viewer-page__tier-name">Premium</span>
              <span className="json-viewer-page__tier-size">~3.6 KB gzip</span>
            </div>
            <p className="json-viewer-page__tier-desc">
              Wraps Standard with aurora glow on hover, spring-animated chevron rotation,
              row hover background, and copy-pulse animation. Motion-level-aware.
            </p>
            <div className="json-viewer-page__tier-import">
              import {'{'} JsonViewer {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="json-viewer-page__tier-preview">
              <PremiumJsonViewer data={{ name: 'Premium', tags: ['aurora', 'spring'] }} rootName="pkg" initialExpandDepth={2} enableClipboard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Props ────────────────────────────────────── */}
      <section className="json-viewer-page__section" id="props">
        <h2 className="json-viewer-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>

      {/* ── Accessibility ──────────────────────────────── */}
      <section className="json-viewer-page__section" id="accessibility">
        <h2 className="json-viewer-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="json-viewer-page__section-desc">
          JsonViewer is built with comprehensive accessibility support following WAI-ARIA tree view best practices.
        </p>
        <div className="json-viewer-page__preview">
          <ul className="json-viewer-page__a11y-list">
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Tree role:</strong> Uses <code className="json-viewer-page__a11y-key">role="tree"</code> on the container with <code className="json-viewer-page__a11y-key">role="treeitem"</code> on each node for proper screen reader navigation.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Keyboard navigation:</strong> Arrow keys navigate between nodes. <code className="json-viewer-page__a11y-key">Enter</code> and <code className="json-viewer-page__a11y-key">Space</code> toggle expand/collapse. <code className="json-viewer-page__a11y-key">Home</code>/<code className="json-viewer-page__a11y-key">End</code> jump to first/last visible node.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Expand state:</strong> Expandable nodes use <code className="json-viewer-page__a11y-key">aria-expanded</code> to announce open/closed state to assistive technology.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Type annotations:</strong> Data type badges are marked <code className="json-viewer-page__a11y-key">aria-hidden="true"</code> as the value itself conveys the type.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Copy button:</strong> Clipboard button includes <code className="json-viewer-page__a11y-key">aria-label="Copy value"</code> and announces copy confirmation via live region.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Motion:</strong> Respects <code className="json-viewer-page__a11y-key">prefers-reduced-motion</code>. Expand/collapse animations are disabled at motion level 0 and 1.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>High contrast:</strong> Supports <code className="json-viewer-page__a11y-key">forced-colors: active</code> with visible borders and system color tokens for syntax highlighting.
              </span>
            </li>
            <li className="json-viewer-page__a11y-item">
              <span className="json-viewer-page__a11y-icon">&#x2713;</span>
              <span>
                <strong>Circular references:</strong> Circular reference markers include <code className="json-viewer-page__a11y-key">aria-label="Circular reference"</code> to explain the visual indicator.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = (tierProp ?? contextTier) as Tier

  const [brandColor, setBrandColor] = useState('#6366f1')
  const [rootName, setRootName] = useState('data')
  const [expandDepth, setExpandDepth] = useState(2)
  const [showTypes, setShowTypes] = useState(true)
  const [showSizes, setShowSizes] = useState(true)
  const [enableCopy, setEnableCopy] = useState(true)
  const [sortKeys, setSortKeys] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const ActiveJsonViewer = tier === 'lite' ? LiteJsonViewer : tier === 'premium' ? PremiumJsonViewer : JsonViewer

  const reactCode = useMemo(
    () => generateReactCode(tier, rootName, expandDepth, showTypes, showSizes, enableCopy, sortKeys, motion),
    [tier, rootName, expandDepth, showTypes, showSizes, enableCopy, sortKeys, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, rootName), [tier, rootName])
  const vueCode = useMemo(
    () => generateVueCode(tier, rootName, expandDepth, showTypes, enableCopy),
    [tier, rootName, expandDepth, showTypes, enableCopy],
  )
  const angularCode = useMemo(() => generateAngularCode(tier, rootName), [tier, rootName])
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, rootName, expandDepth),
    [tier, rootName, expandDepth],
  )

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="json-viewer-page__section" id="playground">
      <h2 className="json-viewer-page__section-title"><a href="#playground">Playground</a></h2>
      <p className="json-viewer-page__section-desc">
        Interactively configure JsonViewer and copy the generated code for any framework.
      </p>

      <div className="json-viewer-page__playground">
        {/* Preview */}
        <div className="json-viewer-page__preview">
          <ActiveJsonViewer
            data={PLAYGROUND_DATA}
            rootName={rootName || undefined}
            initialExpandDepth={expandDepth}
            displayDataTypes={showTypes}
            displayObjectSize={showSizes}
            enableClipboard={enableCopy}
            sortKeys={sortKeys}
            motion={motion}
          />
        </div>

        {/* Controls */}
        <div className="json-viewer-page__playground-controls">
          <label className="json-viewer-page__control-label">
            <strong>Brand Color</strong>
            <input
              type="color"
              value={brandColor}
              onChange={e => setBrandColor(e.target.value)}
              aria-label="Brand color"
              style={{ blockSize: '2rem', inlineSize: '100%', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            />
          </label>

          <label className="json-viewer-page__control-label">
            <strong>Root Name</strong>
            <input
              type="text"
              value={rootName}
              onChange={e => setRootName(e.target.value)}
              style={{ padding: '0.375rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 'var(--text-sm, 0.875rem)' }}
            />
          </label>

          <label className="json-viewer-page__control-label">
            <strong>Expand Depth</strong>
            <div className="json-viewer-page__control-row">
              {[0, 1, 2, 3].map(d => (
                <Button key={d} size="sm" variant={expandDepth === d ? 'primary' : 'secondary'} onClick={() => setExpandDepth(d)}>{d}</Button>
              ))}
            </div>
          </label>

          <label className="json-viewer-page__control-label">
            <strong>Motion Level</strong>
            <div className="json-viewer-page__control-row">
              {([0, 1, 2, 3] as const).map(m => (
                <Button key={m} size="sm" variant={motion === m ? 'primary' : 'secondary'} onClick={() => setMotion(m)}>{m}</Button>
              ))}
            </div>
          </label>

          <label className="json-viewer-page__control-label">
            <strong>Options</strong>
            <div className="json-viewer-page__control-row">
              <Button size="sm" variant={showTypes ? 'primary' : 'secondary'} onClick={() => setShowTypes(!showTypes)}>Types</Button>
              <Button size="sm" variant={showSizes ? 'primary' : 'secondary'} onClick={() => setShowSizes(!showSizes)}>Sizes</Button>
              <Button size="sm" variant={enableCopy ? 'primary' : 'secondary'} onClick={() => setEnableCopy(!enableCopy)}>Copy</Button>
              <Button size="sm" variant={sortKeys ? 'primary' : 'secondary'} onClick={() => setSortKeys(!sortKeys)}>Sort</Button>
            </div>
          </label>
        </div>
      </div>

      {/* Code Output */}
      <div style={{ marginBlockStart: '1.5rem' }}>
        <div className="json-viewer-page__code-tabs" role="tablist">
          {codeTabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeCodeTab === tab.id}
              className={`json-viewer-page__code-tab${activeCodeTab === tab.id ? ' json-viewer-page__code-tab--active' : ''}`}
              onClick={() => setActiveCodeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="json-viewer-page__code-block" role="tabpanel">
          {activeCode}
        </div>
      </div>
    </section>
  )
}
