'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { StatsGrid } from '@ui/components/stats-grid'
import { StatsGrid as LiteStatsGrid } from '@ui/lite/stats-grid'
import { StatsGrid as PremiumStatsGrid } from '@ui/premium/stats-grid'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ───────────��──────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.stats-grid-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: stats-grid-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .stats-grid-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .stats-grid-page__hero::before {
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
        .stats-grid-page__hero::before { animation: none; }
      }

      .stats-grid-page__title {
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

      .stats-grid-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .stats-grid-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .stats-grid-page__import-code {
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

      .stats-grid-page__section {
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
        .stats-grid-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .stats-grid-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .stats-grid-page__section-title a { color: inherit; text-decoration: none; }
      .stats-grid-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .stats-grid-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .stats-grid-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .stats-grid-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .stats-grid-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .stats-grid-page__playground { grid-template-columns: 1fr; }
      }

      @container stats-grid-page (max-width: 680px) {
        .stats-grid-page__playground { grid-template-columns: 1fr; }
      }

      .stats-grid-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .stats-grid-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stats-grid-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .stats-grid-page__playground-controls {
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

      .stats-grid-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .stats-grid-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stats-grid-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .stats-grid-page__option-btn {
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
      .stats-grid-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .stats-grid-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      /* ── Stat card (demo) ──────────────────────────── */

      .stats-grid-page__stat-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .stats-grid-page__stat-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stats-grid-page__stat-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .stats-grid-page__stat-change {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
      }

      .stats-grid-page__stat-change--up { color: oklch(72% 0.19 142); }
      .stats-grid-page__stat-change--down { color: oklch(65% 0.22 25); }

      /* ── Weight Tier Cards ──────────────────────────── */

      .stats-grid-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .stats-grid-page__tier-card {
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

      .stats-grid-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .stats-grid-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .stats-grid-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .stats-grid-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .stats-grid-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', monospace; }
      .stats-grid-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; }
      .stats-grid-page__tier-import {
        font-family: 'SF Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        line-height: 1.4;
      }

      .stats-grid-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── A11y list ──────────────────────────────────── */

      .stats-grid-page__a11y-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .stats-grid-page__a11y-item { display: flex; gap: 0.625rem; align-items: flex-start; }
      .stats-grid-page__a11y-icon { color: oklch(72% 0.19 142); flex-shrink: 0; margin-block-start: 0.1rem; }
      .stats-grid-page__a11y-key {
        font-family: 'SF Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.35em;
        border-radius: 3px;
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ───────────────────────────────── */

      .stats-grid-page__source-link {
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
      .stats-grid-page__source-link:hover { border-color: var(--brand); color: var(--brand); }
    }
  }
`

// ─── Sample Stat Data ─────────────────────────────────────────────────────────

const SAMPLE_STATS = [
  { label: 'Revenue', value: '$48.2K', change: '+12.5%', up: true },
  { label: 'Users', value: '2,847', change: '+8.3%', up: true },
  { label: 'Orders', value: '1,429', change: '-2.1%', up: false },
  { label: 'Conversion', value: '3.24%', change: '+0.8%', up: true },
  { label: 'Avg. Order', value: '$33.72', change: '+5.4%', up: true },
  { label: 'Bounce Rate', value: '42.1%', change: '-1.7%', up: true },
]

// ─── Props ───────────────���────────────────────────────────────────────────────

const statsGridProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Grid children (typically stat/metric cards)' },
  { name: 'columns', type: '2 | 3 | 4 | 5 | 6', default: '4', description: 'Maximum number of columns' },
  { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Gap between grid items' },
]

// ─── Import Strings ───────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { StatsGrid } from '@annondeveloper/ui-kit/lite'",
  standard: "import { StatsGrid } from '@annondeveloper/ui-kit'",
  premium: "import { StatsGrid } from '@annondeveloper/ui-kit/premium'",
}

// ─── Code Generators ───────────��──────────────────────────────────────────────

type Cols = 2 | 3 | 4 | 5 | 6
type Gap = 'sm' | 'md' | 'lg'

function generateReactCode(tier: Tier, columns: Cols, gap: Gap): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (columns !== 4) props.push(`  columns={${columns}}`)
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  const jsx = props.length === 0
    ? `<StatsGrid>\n  {/* stat cards */}\n</StatsGrid>`
    : `<StatsGrid\n${props.join('\n')}\n>\n  {/* stat cards */}\n</StatsGrid>`
  return `${imp}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, columns: Cols, gap: Gap): string {
  const cls = tier === 'lite' ? 'ui-lite-stats-grid' : 'ui-stats-grid'
  return `<div class="${cls}" data-columns="${columns}" data-gap="${gap}" role="region">\n  <!-- stat cards -->\n</div>\n\n<style>\n@import '@annondeveloper/ui-kit/css/components/stats-grid.css';\n</style>`
}

function generateVueCode(tier: Tier, columns: Cols, gap: Gap): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-lite-stats-grid" data-columns="${columns}" data-gap="${gap}" role="region">\n    <slot />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (columns !== 4) attrs.push(`:columns="${columns}"`)
  if (gap !== 'md') attrs.push(`gap="${gap}"`)
  return `<template>\n  <StatsGrid${attrs.length ? ' ' + attrs.join(' ') : ''}>\n    <slot />\n  </StatsGrid>\n</template>\n\n<script setup>\nimport { StatsGrid } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, columns: Cols, gap: Gap): string {
  const cls = tier === 'lite' ? 'ui-lite-stats-grid' : 'ui-stats-grid'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only) -->\n<div class="${cls}" data-columns="${columns}" data-gap="${gap}" role="region">\n  <ng-content></ng-content>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/stats-grid.css';`
}

function generateSvelteCode(tier: Tier, columns: Cols, gap: Gap): string {
  if (tier === 'lite') {
    return `<div class="ui-lite-stats-grid" data-columns="${columns}" data-gap="${gap}" role="region">\n  <slot />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { StatsGrid } from '${importPath}';\n</script>\n\n<StatsGrid columns={${columns}} gap="${gap}">\n  <slot />\n</StatsGrid>`
}

// ─── StatCard Demo Component ─────���────────────────────────────────────────────

function StatCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="stats-grid-page__stat-card">
      <span className="stats-grid-page__stat-label">{label}</span>
      <span className="stats-grid-page__stat-value">{value}</span>
      <span className={`stats-grid-page__stat-change stats-grid-page__stat-change--${up ? 'up' : 'down'}`}>
        {change}
      </span>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function StatsGridPage() {
  const cls = useStyles('stats-grid-page', pageStyles)
  const { tier, setTier } = useTier()
  const [columns, setColumns] = useState<Cols>(4)
  const [gap, setGap] = useState<Gap>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const GridComponent = tier === 'lite' ? LiteStatsGrid : tier === 'premium' ? PremiumStatsGrid : StatsGrid

  const reactCode = useMemo(() => generateReactCode(tier, columns, gap), [tier, columns, gap])
  const htmlCode = useMemo(() => generateHtmlCode(tier, columns, gap), [tier, columns, gap])
  const vueCode = useMemo(() => generateVueCode(tier, columns, gap), [tier, columns, gap])
  const angularCode = useMemo(() => generateAngularCode(tier, columns, gap), [tier, columns, gap])
  const svelteCode = useMemo(() => generateSvelteCode(tier, columns, gap), [tier, columns, gap])

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
      <div className="stats-grid-page__hero">
        <h1 className="stats-grid-page__title">StatsGrid</h1>
        <p className="stats-grid-page__desc">
          Responsive grid layout for stat and metric cards. Auto-fits items with a 200px
          minimum width, constrained by column count. Ideal for dashboards and KPI displays.
        </p>
        <div className="stats-grid-page__import-row">
          <code className="stats-grid-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 1. Live Playground ─────────────────────────── */}
      <section className="stats-grid-page__section" id="playground">
        <h2 className="stats-grid-page__section-title">
          <a href="#playground">Live Playground</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          Tweak columns, gap, and motion to see the StatsGrid adapt in real-time.
        </p>

        <div className="stats-grid-page__playground">
          <div>
            <div className="stats-grid-page__playground-result">
              <GridComponent columns={columns} gap={gap}>
                {SAMPLE_STATS.slice(0, columns > 4 ? 6 : columns === 2 ? 4 : columns).map(s => (
                  <StatCard key={s.label} {...s} />
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

          <div className="stats-grid-page__playground-controls">
            <div className="stats-grid-page__control-group">
              <span className="stats-grid-page__control-label">Columns</span>
              <div className="stats-grid-page__control-options">
                {([2, 3, 4, 5, 6] as Cols[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`stats-grid-page__option-btn${columns === c ? ' stats-grid-page__option-btn--active' : ''}`}
                    onClick={() => setColumns(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="stats-grid-page__control-group">
              <span className="stats-grid-page__control-label">Gap</span>
              <div className="stats-grid-page__control-options">
                {(['sm', 'md', 'lg'] as Gap[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`stats-grid-page__option-btn${gap === g ? ' stats-grid-page__option-btn--active' : ''}`}
                    onClick={() => setGap(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="stats-grid-page__control-group">
              <span className="stats-grid-page__control-label">Motion Level</span>
              <div className="stats-grid-page__control-options">
                {([0, 1, 2, 3] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`stats-grid-page__option-btn${motion === m ? ' stats-grid-page__option-btn--active' : ''}`}
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

      {/* ── 2. Column Variants ─────────────────────────── */}
      <section className="stats-grid-page__section" id="columns">
        <h2 className="stats-grid-page__section-title">
          <a href="#columns">Column Variants</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          StatsGrid supports 2 to 6 columns, auto-fitting items with a 200px minimum child width.
        </p>
        <div className="stats-grid-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>2 columns</p>
              <StatsGrid columns={2} gap="sm">
                <StatCard label="CPU" value="72%" change="+3%" up={true} />
                <StatCard label="Memory" value="8.4 GB" change="-1.2%" up={true} />
              </StatsGrid>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>4 columns</p>
              <StatsGrid columns={4} gap="md">
                {SAMPLE_STATS.slice(0, 4).map(s => <StatCard key={s.label} {...s} />)}
              </StatsGrid>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Gap Sizes ───────────────────────────────── */}
      <section className="stats-grid-page__section" id="gaps">
        <h2 className="stats-grid-page__section-title">
          <a href="#gaps">Gap Sizes</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          Choose between sm (0.5rem), md (1rem), and lg (1.5rem) gap sizes.
        </p>
        <div className="stats-grid-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(['sm', 'md', 'lg'] as Gap[]).map(g => (
              <div key={g}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>gap="{g}"</p>
                <StatsGrid columns={3} gap={g}>
                  <StatCard label="Requests" value="12.8K" change="+5%" up={true} />
                  <StatCard label="Latency" value="42ms" change="-8%" up={true} />
                  <StatCard label="Errors" value="0.3%" change="+0.1%" up={false} />
                </StatsGrid>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Weight Tiers ────────────────────────────── */}
      <section className="stats-grid-page__section" id="tiers">
        <h2 className="stats-grid-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          Choose the right balance of features and bundle size for your project.
        </p>

        <div className="stats-grid-page__tiers">
          <div
            className={`stats-grid-page__tier-card${tier === 'lite' ? ' stats-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="stats-grid-page__tier-header">
              <span className="stats-grid-page__tier-name">Lite</span>
              <span className="stats-grid-page__tier-size">~0.2 KB</span>
            </div>
            <p className="stats-grid-page__tier-desc">
              CSS-only grid. Zero JavaScript beyond the forwardRef wrapper. No motion.
            </p>
            <div className="stats-grid-page__tier-import">
              import {'{'} StatsGrid {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="stats-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>0.2 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`stats-grid-page__tier-card${tier === 'standard' ? ' stats-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="stats-grid-page__tier-header">
              <span className="stats-grid-page__tier-name">Standard</span>
              <span className="stats-grid-page__tier-size">~0.8 KB</span>
            </div>
            <p className="stats-grid-page__tier-desc">
              Full-featured grid with useStyles, scoped CSS, forced-colors and print support.
            </p>
            <div className="stats-grid-page__tier-import">
              import {'{'} StatsGrid {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="stats-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>0.8 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`stats-grid-page__tier-card${tier === 'premium' ? ' stats-grid-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="stats-grid-page__tier-header">
              <span className="stats-grid-page__tier-name">Premium</span>
              <span className="stats-grid-page__tier-size">~1.5 KB</span>
            </div>
            <p className="stats-grid-page__tier-desc">
              Everything in Standard plus staggered entrance animations, aurora glow, and shimmer effects.
            </p>
            <div className="stats-grid-page__tier-import">
              import {'{'} StatsGrid {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="stats-grid-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>1.5 KB</strong> gzip</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Brand Color ─────────────────────────────── */}
      <section className="stats-grid-page__section" id="brand-color">
        <h2 className="stats-grid-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          Pick a brand color to see the grid and stat cards update with derived theme tokens.
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
      <section className="stats-grid-page__section" id="props">
        <h2 className="stats-grid-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          All props accepted by StatsGrid. It also spreads native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={statsGridProps} />
        </Card>
      </section>

      {/* ���─ 7. Accessibility ───────────────────────────── */}
      <section className="stats-grid-page__section" id="accessibility">
        <h2 className="stats-grid-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="stats-grid-page__section-desc">
          StatsGrid is built with accessibility in mind from the ground up.
        </p>
        <Card variant="default" padding="md">
          <ul className="stats-grid-page__a11y-list">
            <li className="stats-grid-page__a11y-item">
              <span className="stats-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Renders as a <code className="stats-grid-page__a11y-key">role="region"</code> landmark for screen reader navigation.
              </span>
            </li>
            <li className="stats-grid-page__a11y-item">
              <span className="stats-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Responsive:</strong> Grid reflows automatically using <code className="stats-grid-page__a11y-key">auto-fit</code> with minimum child widths.
              </span>
            </li>
            <li className="stats-grid-page__a11y-item">
              <span className="stats-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="stats-grid-page__a11y-key">forced-colors: active</code> with proper gap handling.
              </span>
            </li>
            <li className="stats-grid-page__a11y-item">
              <span className="stats-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Compact layout with reduced gaps for print media.
              </span>
            </li>
            <li className="stats-grid-page__a11y-item">
              <span className="stats-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Premium animations respect <code className="stats-grid-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 8. Source ──��───────────────────────────────── */}
      <section className="stats-grid-page__section" id="source">
        <h2 className="stats-grid-page__section-title"><a href="#source">Source</a></h2>
        <p className="stats-grid-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="stats-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/stats-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/components/stats-grid.tsx (Standard)
          </a>
          <a className="stats-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/stats-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/lite/stats-grid.tsx (Lite)
          </a>
          <a className="stats-grid-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/stats-grid.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/premium/stats-grid.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
