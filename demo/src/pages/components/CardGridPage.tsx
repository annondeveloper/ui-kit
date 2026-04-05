'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CardGrid } from '@ui/components/card-grid'
import { CardGrid as LiteCardGrid } from '@ui/lite/card-grid'
import { CardGrid as PremiumCardGrid } from '@ui/premium/card-grid'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.card-grid-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: card-grid-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .card-grid-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .card-grid-page__hero::before {
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
        .card-grid-page__hero::before { animation: none; }
      }

      .card-grid-page__title {
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

      .card-grid-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .card-grid-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .card-grid-page__import-code {
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
      }

      /* ── Sections ───────────────────────────────────── */

      .card-grid-page__section {
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
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .card-grid-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .card-grid-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .card-grid-page__section-title a { color: inherit; text-decoration: none; }
      .card-grid-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .card-grid-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────────────── */

      .card-grid-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .card-grid-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .card-grid-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .card-grid-page__playground { grid-template-columns: 1fr; }
      }

      @container card-grid-page (max-width: 680px) {
        .card-grid-page__playground { grid-template-columns: 1fr; }
      }

      .card-grid-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .card-grid-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .card-grid-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .card-grid-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .card-grid-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .card-grid-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .card-grid-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .card-grid-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .card-grid-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .card-grid-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      /* ── Demo cards ─────────────────────────────────── */

      .card-grid-page__demo-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .card-grid-page__demo-card-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .card-grid-page__demo-card-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .card-grid-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .card-grid-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
      }

      .card-grid-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .card-grid-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .card-grid-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .card-grid-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .card-grid-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', monospace; }
      .card-grid-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; }
      .card-grid-page__tier-import {
        font-family: 'SF Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        line-height: 1.4;
      }

      .card-grid-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── A11y ───────────────────────────────────────── */

      .card-grid-page__a11y-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .card-grid-page__a11y-item { display: flex; gap: 0.625rem; align-items: flex-start; }
      .card-grid-page__a11y-icon { color: oklch(72% 0.19 142); flex-shrink: 0; margin-block-start: 0.1rem; }
      .card-grid-page__a11y-key {
        font-family: 'SF Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.35em;
        border-radius: 3px;
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ───────────────────────────────── */

      .card-grid-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm, 0.875rem);
        font-family: 'SF Mono', monospace;
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        transition: border-color 0.2s, color 0.2s;
      }
      .card-grid-page__source-link:hover { border-color: var(--brand); color: var(--brand); }

      .card-grid-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
    }
  }
`

// ─── Sample Cards ─────────────────────────────────────────────────────────────

const SAMPLE_CARDS = [
  { title: 'Analytics Dashboard', desc: 'Real-time metrics, charts, and KPI tracking for your business.' },
  { title: 'User Management', desc: 'Manage team members, roles, and permissions with ease.' },
  { title: 'Billing & Payments', desc: 'Track invoices, subscriptions, and revenue trends.' },
  { title: 'API Documentation', desc: 'Interactive API explorer with code generation.' },
  { title: 'System Health', desc: 'Monitor uptime, latency, and error rates.' },
  { title: 'Integrations', desc: 'Connect with 200+ third-party services and tools.' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

const cardGridProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Grid children (typically Card components)' },
  { name: 'columns', type: '1 | 2 | 3 | 4 | 5 | 6', default: '3', description: 'Number of columns when minChildWidth is not set' },
  { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Gap between grid items' },
  { name: 'minChildWidth', type: 'string', description: "Minimum child width — overrides column count with auto-fill (e.g. '280px')" },
]

// ─── Import Strings ───────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CardGrid } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CardGrid } from '@annondeveloper/ui-kit'",
  premium: "import { CardGrid } from '@annondeveloper/ui-kit/premium'",
}

// ─── Code Generators ──────────────────────────────────────────────────────────

type Cols = 1 | 2 | 3 | 4 | 5 | 6
type Gap = 'sm' | 'md' | 'lg'

function generateReactCode(tier: Tier, columns: Cols, gap: Gap, minChildWidth: string): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (columns !== 3) props.push(`  columns={${columns}}`)
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  if (minChildWidth) props.push(`  minChildWidth="${minChildWidth}"`)
  const jsx = props.length === 0
    ? `<CardGrid>\n  <Card>...</Card>\n  <Card>...</Card>\n</CardGrid>`
    : `<CardGrid\n${props.join('\n')}\n>\n  <Card>...</Card>\n  <Card>...</Card>\n</CardGrid>`
  return `${imp}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, columns: Cols, gap: Gap, minChildWidth: string): string {
  const cls = tier === 'lite' ? 'ui-lite-card-grid' : 'ui-card-grid'
  const style = minChildWidth ? ` style="--card-grid-min-child-width: ${minChildWidth}"` : ''
  return `<div class="${cls}" data-columns="${columns}" data-gap="${gap}"${style}>\n  <div class="ui-card">...</div>\n  <div class="ui-card">...</div>\n</div>\n\n<style>\n@import '@annondeveloper/ui-kit/css/components/card-grid.css';\n</style>`
}

function generateVueCode(tier: Tier, columns: Cols, gap: Gap, minChildWidth: string): string {
  if (tier === 'lite') {
    const style = minChildWidth ? ` :style="{ '--card-grid-min-child-width': '${minChildWidth}' }"` : ''
    return `<template>\n  <div class="ui-lite-card-grid" data-columns="${columns}" data-gap="${gap}"${style}>\n    <slot />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (columns !== 3) attrs.push(`:columns="${columns}"`)
  if (gap !== 'md') attrs.push(`gap="${gap}"`)
  if (minChildWidth) attrs.push(`minChildWidth="${minChildWidth}"`)
  return `<template>\n  <CardGrid${attrs.length ? ' ' + attrs.join(' ') : ''}>\n    <slot />\n  </CardGrid>\n</template>\n\n<script setup>\nimport { CardGrid } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, columns: Cols, gap: Gap, minChildWidth: string): string {
  const cls = tier === 'lite' ? 'ui-lite-card-grid' : 'ui-card-grid'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const style = minChildWidth ? ` [style.--card-grid-min-child-width]="'${minChildWidth}'"` : ''
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only) -->\n<div class="${cls}" data-columns="${columns}" data-gap="${gap}"${style}>\n  <ng-content></ng-content>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/card-grid.css';`
}

function generateSvelteCode(tier: Tier, columns: Cols, gap: Gap, minChildWidth: string): string {
  if (tier === 'lite') {
    const style = minChildWidth ? ` style="--card-grid-min-child-width: ${minChildWidth}"` : ''
    return `<div class="ui-lite-card-grid" data-columns="${columns}" data-gap="${gap}"${style}>\n  <slot />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`columns={${columns}}`, `gap="${gap}"`]
  if (minChildWidth) attrs.push(`minChildWidth="${minChildWidth}"`)
  return `<script>\n  import { CardGrid } from '${importPath}';\n</script>\n\n<CardGrid ${attrs.join(' ')}>\n  <slot />\n</CardGrid>`
}

// ─── DemoCard ─────────────────────────────────────────────────────────────────

function DemoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card-grid-page__demo-card">
      <span className="card-grid-page__demo-card-title">{title}</span>
      <span className="card-grid-page__demo-card-desc">{desc}</span>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CardGridPage() {
  const cls = useStyles('card-grid-page', pageStyles)
  const { tier, setTier } = useTier()
  const [columns, setColumns] = useState<Cols>(3)
  const [gap, setGap] = useState<Gap>('md')
  const [minChildWidth, setMinChildWidth] = useState('')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const GridComponent = tier === 'lite' ? LiteCardGrid : tier === 'premium' ? PremiumCardGrid : CardGrid

  const reactCode = useMemo(() => generateReactCode(tier, columns, gap, minChildWidth), [tier, columns, gap, minChildWidth])
  const htmlCode = useMemo(() => generateHtmlCode(tier, columns, gap, minChildWidth), [tier, columns, gap, minChildWidth])
  const vueCode = useMemo(() => generateVueCode(tier, columns, gap, minChildWidth), [tier, columns, gap, minChildWidth])
  const angularCode = useMemo(() => generateAngularCode(tier, columns, gap, minChildWidth), [tier, columns, gap, minChildWidth])
  const svelteCode = useMemo(() => generateSvelteCode(tier, columns, gap, minChildWidth), [tier, columns, gap, minChildWidth])

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

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  return (
    <div className={cls('root')}>
      {/* ── Hero ───────────────────────────────────────── */}
      <div className="card-grid-page__hero">
        <h1 className="card-grid-page__title">CardGrid</h1>
        <p className="card-grid-page__desc">
          Responsive card grid layout. Supports fixed column counts or auto-fill with a
          minimum child width for fluid layouts that adapt to any container size.
        </p>
        <div className="card-grid-page__import-row">
          <code className="card-grid-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 1. Live Playground ─────────────────────────── */}
      <section className="card-grid-page__section" id="playground">
        <h2 className="card-grid-page__section-title">
          <a href="#playground">Live Playground</a>
        </h2>
        <p className="card-grid-page__section-desc">
          Tweak columns, gap, minChildWidth, and motion to see the CardGrid adapt in real-time.
        </p>

        <div className="card-grid-page__playground">
          <div>
            <div className="card-grid-page__playground-result">
              <GridComponent columns={columns} gap={gap} minChildWidth={minChildWidth || undefined}>
                {SAMPLE_CARDS.slice(0, columns > 4 ? 6 : columns === 1 ? 2 : columns).map(c => (
                  <DemoCard key={c.title} {...c} />
                ))}
              </GridComponent>
            </div>

            <div style={{ marginBlockStart: '1rem' }}>
              <Tabs
                tabs={codeTabs}
                activeTab={activeCodeTab}
                onTabChange={setActiveCodeTab}
                size="sm"
              >
                {codeTabs.map(tab => (
                  <TabPanel key={tab.id} id={tab.id}>
                    <CopyBlock code={activeCode} language="tsx" />
                  </TabPanel>
                ))}
              </Tabs>
            </div>
          </div>

          <div className="card-grid-page__playground-controls">
            <div className="card-grid-page__control-group">
              <span className="card-grid-page__control-label">Columns</span>
              <div className="card-grid-page__control-options">
                {([1, 2, 3, 4, 5, 6] as Cols[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`card-grid-page__option-btn${columns === c ? ' card-grid-page__option-btn--active' : ''}`}
                    onClick={() => setColumns(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-grid-page__control-group">
              <span className="card-grid-page__control-label">Gap</span>
              <div className="card-grid-page__control-options">
                {(['sm', 'md', 'lg'] as Gap[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`card-grid-page__option-btn${gap === g ? ' card-grid-page__option-btn--active' : ''}`}
                    onClick={() => setGap(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-grid-page__control-group">
              <span className="card-grid-page__control-label">Min Child Width</span>
              <input
                type="text"
                className="card-grid-page__text-input"
                placeholder="e.g. 280px"
                value={minChildWidth}
                onChange={e => setMinChildWidth(e.target.value)}
              />
            </div>

            <div className="card-grid-page__control-group">
              <span className="card-grid-page__control-label">Motion Level</span>
              <div className="card-grid-page__control-options">
                {([0, 1, 2, 3] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`card-grid-page__option-btn${motion === m ? ' card-grid-page__option-btn--active' : ''}`}
                    onClick={() => setMotion(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Fixed Columns ───────────────────────────── */}
      <section className="card-grid-page__section" id="fixed-columns">
        <h2 className="card-grid-page__section-title">
          <a href="#fixed-columns">Fixed Column Layouts</a>
        </h2>
        <p className="card-grid-page__section-desc">
          When no minChildWidth is set, CardGrid uses fixed column counts.
        </p>
        <div className="card-grid-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>2 columns</p>
              <CardGrid columns={2} gap="sm">
                <DemoCard title="Project Alpha" desc="Machine learning pipeline." />
                <DemoCard title="Project Beta" desc="Real-time data streaming." />
              </CardGrid>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>4 columns</p>
              <CardGrid columns={4} gap="md">
                {SAMPLE_CARDS.slice(0, 4).map(c => <DemoCard key={c.title} {...c} />)}
              </CardGrid>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Auto-fill Mode ──────────────────────────── */}
      <section className="card-grid-page__section" id="auto-fill">
        <h2 className="card-grid-page__section-title">
          <a href="#auto-fill">Auto-Fill Mode</a>
        </h2>
        <p className="card-grid-page__section-desc">
          Set minChildWidth to enable auto-fill mode. Items wrap to new rows when the container is too narrow.
        </p>
        <div className="card-grid-page__preview">
          <CardGrid minChildWidth="240px" gap="md">
            {SAMPLE_CARDS.map(c => <DemoCard key={c.title} {...c} />)}
          </CardGrid>
        </div>
      </section>

      {/* ── 4. Weight Tiers ────────────────────────────── */}
      <section className="card-grid-page__section" id="tiers">
        <h2 className="card-grid-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="card-grid-page__section-desc">
          Choose the right balance of features and bundle size for your project.
        </p>

        <div className="card-grid-page__tiers">
          <div
            className={`card-grid-page__tier-card${tier === 'lite' ? ' card-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="card-grid-page__tier-header">
              <span className="card-grid-page__tier-name">Lite</span>
              <span className="card-grid-page__tier-size">~0.3 KB</span>
            </div>
            <p className="card-grid-page__tier-desc">
              CSS-only grid wrapper. Zero JavaScript beyond forwardRef. No motion.
            </p>
            <div className="card-grid-page__tier-import">
              import {'{'} CardGrid {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="card-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>0.3 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`card-grid-page__tier-card${tier === 'standard' ? ' card-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="card-grid-page__tier-header">
              <span className="card-grid-page__tier-name">Standard</span>
              <span className="card-grid-page__tier-size">~1.0 KB</span>
            </div>
            <p className="card-grid-page__tier-desc">
              Full scoped CSS with auto-fill mode, forced-colors, and print support.
            </p>
            <div className="card-grid-page__tier-import">
              import {'{'} CardGrid {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="card-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.0 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>1.0 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`card-grid-page__tier-card${tier === 'premium' ? ' card-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="card-grid-page__tier-header">
              <span className="card-grid-page__tier-name">Premium</span>
              <span className="card-grid-page__tier-size">~1.8 KB</span>
            </div>
            <p className="card-grid-page__tier-desc">
              Everything in Standard plus staggered entrance animations, glass morphism, and aurora glow.
            </p>
            <div className="card-grid-page__tier-import">
              import {'{'} CardGrid {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="card-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>1.8 KB</strong> gzip</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Brand Color ─────────────────────────────── */}
      <section className="card-grid-page__section" id="brand-color">
        <h2 className="card-grid-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="card-grid-page__section-desc">
          Pick a brand color to preview themed card grids.
        </p>
        <ColorInput
          name="brand-color"
          value={brandColor}
          onChange={setBrandColor}
          size="sm"
          swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b']}
        />
      </section>

      {/* ── 6. Props API ───────────────────────────────── */}
      <section className="card-grid-page__section" id="props">
        <h2 className="card-grid-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="card-grid-page__section-desc">
          All props accepted by CardGrid. It also spreads native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={cardGridProps} />
        </Card>
      </section>

      {/* ── 7. Accessibility ───────────────────────────── */}
      <section className="card-grid-page__section" id="accessibility">
        <h2 className="card-grid-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="card-grid-page__section-desc">
          CardGrid is built with accessibility best practices.
        </p>
        <Card variant="default" padding="md">
          <ul className="card-grid-page__a11y-list">
            <li className="card-grid-page__a11y-item">
              <span className="card-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Responsive:</strong> Uses CSS Grid <code className="card-grid-page__a11y-key">auto-fill</code> to reflow cards at any viewport width.
              </span>
            </li>
            <li className="card-grid-page__a11y-item">
              <span className="card-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="card-grid-page__a11y-key">forced-colors: active</code> mode.
              </span>
            </li>
            <li className="card-grid-page__a11y-item">
              <span className="card-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Collapses to single-column for print media.
              </span>
            </li>
            <li className="card-grid-page__a11y-item">
              <span className="card-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Premium animations respect <code className="card-grid-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 8. Source ──────────────────────────────────── */}
      <section className="card-grid-page__section" id="source">
        <h2 className="card-grid-page__section-title"><a href="#source">Source</a></h2>
        <p className="card-grid-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="card-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/card-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/components/card-grid.tsx (Standard)
          </a>
          <a className="card-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/card-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/lite/card-grid.tsx (Lite)
          </a>
          <a className="card-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/card-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/premium/card-grid.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
