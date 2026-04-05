'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ListLayout } from '@ui/components/list-layout'
import { ListLayout as LiteListLayout } from '@ui/lite/list-layout'
import { ListLayout as PremiumListLayout } from '@ui/premium/list-layout'
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
    @scope (.list-layout-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: list-layout-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .list-layout-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .list-layout-page__hero::before {
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
        .list-layout-page__hero::before { animation: none; }
      }

      .list-layout-page__title {
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

      .list-layout-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .list-layout-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .list-layout-page__import-code {
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

      .list-layout-page__section {
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
        .list-layout-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .list-layout-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .list-layout-page__section-title a { color: inherit; text-decoration: none; }
      .list-layout-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .list-layout-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────────────── */

      .list-layout-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .list-layout-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .list-layout-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .list-layout-page__playground { grid-template-columns: 1fr; }
      }

      @container list-layout-page (max-width: 680px) {
        .list-layout-page__playground { grid-template-columns: 1fr; }
      }

      .list-layout-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .list-layout-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .list-layout-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .list-layout-page__playground-controls {
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

      .list-layout-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .list-layout-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .list-layout-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .list-layout-page__option-btn {
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
      .list-layout-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .list-layout-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .list-layout-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .list-layout-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Demo list item ─────────────────────────────── */

      .list-layout-page__list-item {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .list-layout-page__list-item-avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        font-weight: 700;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand, oklch(65% 0.2 270));
      }

      .list-layout-page__list-item-content {
        flex: 1;
        min-inline-size: 0;
      }

      .list-layout-page__list-item-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .list-layout-page__list-item-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      .list-layout-page__list-item-meta {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        flex-shrink: 0;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .list-layout-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .list-layout-page__tier-card {
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

      .list-layout-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .list-layout-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .list-layout-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .list-layout-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .list-layout-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', monospace; }
      .list-layout-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; }
      .list-layout-page__tier-import {
        font-family: 'SF Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        line-height: 1.4;
      }

      .list-layout-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── A11y ───────────────────────────────────────── */

      .list-layout-page__a11y-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
      .list-layout-page__a11y-item { display: flex; gap: 0.625rem; align-items: flex-start; }
      .list-layout-page__a11y-icon { color: oklch(72% 0.19 142); flex-shrink: 0; margin-block-start: 0.1rem; }
      .list-layout-page__a11y-key {
        font-family: 'SF Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.35em;
        border-radius: 3px;
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ───────────────────────────────── */

      .list-layout-page__source-link {
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
      .list-layout-page__source-link:hover { border-color: var(--brand); color: var(--brand); }
    }
  }
`

// ─── Sample List Data ─────────────────────────────────────────────────────────

const SAMPLE_ITEMS = [
  { initials: 'AS', name: 'Alice Smith', desc: 'Engineering Lead', meta: '2 min ago' },
  { initials: 'BJ', name: 'Bob Johnson', desc: 'Product Designer', meta: '15 min ago' },
  { initials: 'CM', name: 'Carol Martinez', desc: 'Backend Engineer', meta: '1 hr ago' },
  { initials: 'DW', name: 'David Wang', desc: 'DevOps Specialist', meta: '3 hr ago' },
  { initials: 'EK', name: 'Eva Kim', desc: 'Frontend Developer', meta: '1 day ago' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

const listLayoutProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'List children' },
  { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Gap between items' },
  { name: 'dividers', type: 'boolean', default: 'false', description: 'Show dividers between items' },
  { name: 'padding', type: "'none' | 'sm' | 'md'", default: "'none'", description: 'Internal padding' },
]

// ─── Import Strings ───────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ListLayout } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ListLayout } from '@annondeveloper/ui-kit'",
  premium: "import { ListLayout } from '@annondeveloper/ui-kit/premium'",
}

// ─── Code Generators ──────────────────────────────────────────────────────────

type Gap = 'sm' | 'md' | 'lg'
type Padding = 'none' | 'sm' | 'md'

function generateReactCode(tier: Tier, gap: Gap, dividers: boolean, padding: Padding): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  if (dividers) props.push('  dividers')
  if (padding !== 'none') props.push(`  padding="${padding}"`)
  const jsx = props.length === 0
    ? `<ListLayout>\n  <div>Item 1</div>\n  <div>Item 2</div>\n</ListLayout>`
    : `<ListLayout\n${props.join('\n')}\n>\n  <div>Item 1</div>\n  <div>Item 2</div>\n</ListLayout>`
  return `${imp}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, gap: Gap, dividers: boolean, padding: Padding): string {
  const cls = tier === 'lite' ? 'ui-lite-list-layout' : 'ui-list-layout'
  const attrs = [`class="${cls}"`, `data-gap="${gap}"`, `data-padding="${padding}"`]
  if (dividers) attrs.push('data-dividers="true"')
  return `<div ${attrs.join(' ')}>\n  <div>Item 1</div>\n  <div>Item 2</div>\n</div>\n\n<style>\n@import '@annondeveloper/ui-kit/css/components/list-layout.css';\n</style>`
}

function generateVueCode(tier: Tier, gap: Gap, dividers: boolean, padding: Padding): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-list-layout"`, `data-gap="${gap}"`, `data-padding="${padding}"`]
    if (dividers) attrs.push('data-dividers="true"')
    return `<template>\n  <div ${attrs.join(' ')}>\n    <slot />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (gap !== 'md') attrs.push(`gap="${gap}"`)
  if (dividers) attrs.push(':dividers="true"')
  if (padding !== 'none') attrs.push(`padding="${padding}"`)
  return `<template>\n  <ListLayout${attrs.length ? ' ' + attrs.join(' ') : ''}>\n    <slot />\n  </ListLayout>\n</template>\n\n<script setup>\nimport { ListLayout } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, gap: Gap, dividers: boolean, padding: Padding): string {
  const cls = tier === 'lite' ? 'ui-lite-list-layout' : 'ui-list-layout'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [`class="${cls}"`, `data-gap="${gap}"`, `data-padding="${padding}"`]
  if (dividers) attrs.push('data-dividers="true"')
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <ng-content></ng-content>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/list-layout.css';`
}

function generateSvelteCode(tier: Tier, gap: Gap, dividers: boolean, padding: Padding): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-list-layout"`, `data-gap="${gap}"`, `data-padding="${padding}"`]
    if (dividers) attrs.push('data-dividers="true"')
    return `<div ${attrs.join(' ')}>\n  <slot />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`gap="${gap}"`]
  if (dividers) attrs.push('dividers')
  if (padding !== 'none') attrs.push(`padding="${padding}"`)
  return `<script>\n  import { ListLayout } from '${importPath}';\n</script>\n\n<ListLayout ${attrs.join(' ')}>\n  <slot />\n</ListLayout>`
}

// ─── ListItem Demo ────────────────────────────────────────────────────────────

function ListItem({ initials, name, desc, meta }: { initials: string; name: string; desc: string; meta: string }) {
  return (
    <div className="list-layout-page__list-item">
      <div className="list-layout-page__list-item-avatar">{initials}</div>
      <div className="list-layout-page__list-item-content">
        <div className="list-layout-page__list-item-name">{name}</div>
        <div className="list-layout-page__list-item-desc">{desc}</div>
      </div>
      <span className="list-layout-page__list-item-meta">{meta}</span>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ListLayoutPage() {
  const cls = useStyles('list-layout-page', pageStyles)
  const { tier, setTier } = useTier()
  const [gap, setGap] = useState<Gap>('md')
  const [dividers, setDividers] = useState(false)
  const [padding, setPadding] = useState<Padding>('none')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const LayoutComponent = tier === 'lite' ? LiteListLayout : tier === 'premium' ? PremiumListLayout : ListLayout

  const reactCode = useMemo(() => generateReactCode(tier, gap, dividers, padding), [tier, gap, dividers, padding])
  const htmlCode = useMemo(() => generateHtmlCode(tier, gap, dividers, padding), [tier, gap, dividers, padding])
  const vueCode = useMemo(() => generateVueCode(tier, gap, dividers, padding), [tier, gap, dividers, padding])
  const angularCode = useMemo(() => generateAngularCode(tier, gap, dividers, padding), [tier, gap, dividers, padding])
  const svelteCode = useMemo(() => generateSvelteCode(tier, gap, dividers, padding), [tier, gap, dividers, padding])

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
      <div className="list-layout-page__hero">
        <h1 className="list-layout-page__title">ListLayout</h1>
        <p className="list-layout-page__desc">
          Vertical list layout with consistent spacing and optional dividers. Perfect for
          activity feeds, notifications, settings panels, and stacked content.
        </p>
        <div className="list-layout-page__import-row">
          <code className="list-layout-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 1. Live Playground ─────────────────────────── */}
      <section className="list-layout-page__section" id="playground">
        <h2 className="list-layout-page__section-title">
          <a href="#playground">Live Playground</a>
        </h2>
        <p className="list-layout-page__section-desc">
          Tweak gap, dividers, padding, and motion to see the ListLayout adapt in real-time.
        </p>

        <div className="list-layout-page__playground">
          <div>
            <div className="list-layout-page__playground-result">
              <LayoutComponent gap={gap} dividers={dividers} padding={padding}>
                {SAMPLE_ITEMS.map(item => (
                  <ListItem key={item.name} {...item} />
                ))}
              </LayoutComponent>
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

          <div className="list-layout-page__playground-controls">
            <div className="list-layout-page__control-group">
              <span className="list-layout-page__control-label">Gap</span>
              <div className="list-layout-page__control-options">
                {(['sm', 'md', 'lg'] as Gap[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`list-layout-page__option-btn${gap === g ? ' list-layout-page__option-btn--active' : ''}`}
                    onClick={() => setGap(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="list-layout-page__control-group">
              <span className="list-layout-page__control-label">Padding</span>
              <div className="list-layout-page__control-options">
                {(['none', 'sm', 'md'] as Padding[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`list-layout-page__option-btn${padding === p ? ' list-layout-page__option-btn--active' : ''}`}
                    onClick={() => setPadding(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="list-layout-page__toggle-row">
              <label className="list-layout-page__toggle-label">
                <input
                  type="checkbox"
                  checked={dividers}
                  onChange={e => setDividers(e.target.checked)}
                />
                Dividers
              </label>
            </div>

            <div className="list-layout-page__control-group">
              <span className="list-layout-page__control-label">Motion Level</span>
              <div className="list-layout-page__control-options">
                {([0, 1, 2, 3] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`list-layout-page__option-btn${motion === m ? ' list-layout-page__option-btn--active' : ''}`}
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

      {/* ── 2. Dividers ────────────────────────────────── */}
      <section className="list-layout-page__section" id="dividers">
        <h2 className="list-layout-page__section-title">
          <a href="#dividers">Dividers</a>
        </h2>
        <p className="list-layout-page__section-desc">
          Enable dividers to show separator lines between list items. The gap is
          replaced by padding to keep spacing consistent.
        </p>
        <div className="list-layout-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>Without dividers</p>
              <ListLayout gap="md">
                {SAMPLE_ITEMS.slice(0, 3).map(item => <ListItem key={item.name} {...item} />)}
              </ListLayout>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>With dividers</p>
              <ListLayout gap="md" dividers>
                {SAMPLE_ITEMS.slice(0, 3).map(item => <ListItem key={item.name} {...item} />)}
              </ListLayout>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Gap & Padding ───────────────────────────── */}
      <section className="list-layout-page__section" id="gaps">
        <h2 className="list-layout-page__section-title">
          <a href="#gaps">Gap & Padding</a>
        </h2>
        <p className="list-layout-page__section-desc">
          Combine gap sizes (sm/md/lg) with padding (none/sm/md) for various density levels.
        </p>
        <div className="list-layout-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(['sm', 'md', 'lg'] as Gap[]).map(g => (
              <div key={g}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>gap="{g}" padding="sm"</p>
                <ListLayout gap={g} padding="sm">
                  <ListItem initials="A" name="Alpha" desc="First item" meta="now" />
                  <ListItem initials="B" name="Beta" desc="Second item" meta="1m" />
                </ListLayout>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Weight Tiers ────────────────────────────── */}
      <section className="list-layout-page__section" id="tiers">
        <h2 className="list-layout-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="list-layout-page__section-desc">
          Choose the right balance of features and bundle size for your project.
        </p>

        <div className="list-layout-page__tiers">
          <div
            className={`list-layout-page__tier-card${tier === 'lite' ? ' list-layout-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="list-layout-page__tier-header">
              <span className="list-layout-page__tier-name">Lite</span>
              <span className="list-layout-page__tier-size">~0.2 KB</span>
            </div>
            <p className="list-layout-page__tier-desc">
              CSS-only vertical list. Zero JavaScript beyond forwardRef. No motion.
            </p>
            <div className="list-layout-page__tier-import">
              import {'{'} ListLayout {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="list-layout-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>0.2 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`list-layout-page__tier-card${tier === 'standard' ? ' list-layout-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="list-layout-page__tier-header">
              <span className="list-layout-page__tier-name">Standard</span>
              <span className="list-layout-page__tier-size">~0.9 KB</span>
            </div>
            <p className="list-layout-page__tier-desc">
              Full scoped CSS with dividers, forced-colors, and print support.
            </p>
            <div className="list-layout-page__tier-import">
              import {'{'} ListLayout {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="list-layout-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>0.9 KB</strong> gzip</span>
            </div>
          </div>

          <div
            className={`list-layout-page__tier-card${tier === 'premium' ? ' list-layout-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="list-layout-page__tier-header">
              <span className="list-layout-page__tier-name">Premium</span>
              <span className="list-layout-page__tier-size">~1.4 KB</span>
            </div>
            <p className="list-layout-page__tier-desc">
              Everything in Standard plus staggered slide-in animations, hover glow, and entrance effects.
            </p>
            <div className="list-layout-page__tier-import">
              import {'{'} ListLayout {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="list-layout-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>1.4 KB</strong> gzip</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Brand Color ─────────────────────────────── */}
      <section className="list-layout-page__section" id="brand-color">
        <h2 className="list-layout-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="list-layout-page__section-desc">
          Pick a brand color to see the list and avatars update with derived theme tokens.
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
      <section className="list-layout-page__section" id="props">
        <h2 className="list-layout-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="list-layout-page__section-desc">
          All props accepted by ListLayout. It also spreads native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={listLayoutProps} />
        </Card>
      </section>

      {/* ── 7. Accessibility ───────────────────────────── */}
      <section className="list-layout-page__section" id="accessibility">
        <h2 className="list-layout-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="list-layout-page__section-desc">
          ListLayout is built with accessibility best practices.
        </p>
        <Card variant="default" padding="md">
          <ul className="list-layout-page__a11y-list">
            <li className="list-layout-page__a11y-item">
              <span className="list-layout-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Uses flexbox column layout with proper spacing via <code className="list-layout-page__a11y-key">gap</code> property.
              </span>
            </li>
            <li className="list-layout-page__a11y-item">
              <span className="list-layout-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dividers:</strong> Uses <code className="list-layout-page__a11y-key">border-block-start</code> for logical dividers that respect writing direction.
              </span>
            </li>
            <li className="list-layout-page__a11y-item">
              <span className="list-layout-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Dividers use <code className="list-layout-page__a11y-key">ButtonText</code> color in forced-colors mode.
              </span>
            </li>
            <li className="list-layout-page__a11y-item">
              <span className="list-layout-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Compact layout with <code className="list-layout-page__a11y-key">GrayText</code> divider color for print media.
              </span>
            </li>
            <li className="list-layout-page__a11y-item">
              <span className="list-layout-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Premium animations respect <code className="list-layout-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 8. Source ──────────────────────────────────── */}
      <section className="list-layout-page__section" id="source">
        <h2 className="list-layout-page__section-title"><a href="#source">Source</a></h2>
        <p className="list-layout-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="list-layout-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/list-layout.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/components/list-layout.tsx (Standard)
          </a>
          <a className="list-layout-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/list-layout.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/lite/list-layout.tsx (Lite)
          </a>
          <a className="list-layout-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/list-layout.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source: src/premium/list-layout.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
