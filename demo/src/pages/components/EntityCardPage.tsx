'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { EntityCard } from '@ui/domain/entity-card'
import { EntityCard as LiteEntityCard } from '@ui/lite/entity-card'
import { EntityCard as PremiumEntityCard } from '@ui/premium/entity-card'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.entity-card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: entity-card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .entity-card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .entity-card-page__hero::before {
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
        animation: entity-card-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes entity-card-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .entity-card-page__hero::before { animation: none; }
      }

      .entity-card-page__title {
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

      .entity-card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .entity-card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .entity-card-page__import-code {
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

      .entity-card-page__section {
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
        animation: entity-card-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes entity-card-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .entity-card-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .entity-card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .entity-card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .entity-card-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .entity-card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .entity-card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container entity-card-page (max-width: 680px) {
        .entity-card-page__playground { grid-template-columns: 1fr; }
      }

      .entity-card-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .entity-card-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .entity-card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .entity-card-page__playground-controls {
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

      .entity-card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .entity-card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .entity-card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .entity-card-page__option-btn {
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
      .entity-card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .entity-card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .entity-card-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .entity-card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .entity-card-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }

      .entity-card-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .entity-card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .entity-card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .entity-card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .entity-card-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .entity-card-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .entity-card-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .entity-card-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .entity-card-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .entity-card-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .entity-card-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .entity-card-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .entity-card-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .entity-card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .entity-card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .entity-card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .entity-card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .entity-card-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .entity-card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .entity-card-page__code-tabs {
        margin-block-start: 1rem;
      }

      .entity-card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .entity-card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .entity-card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .entity-card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .entity-card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .entity-card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .entity-card-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }

      .entity-card-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .entity-card-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      @media (max-width: 768px) {
        .entity-card-page__hero { padding: 2rem 1.25rem; }
        .entity-card-page__title { font-size: 1.75rem; }
        .entity-card-page__playground { grid-template-columns: 1fr; }
        .entity-card-page__tiers { grid-template-columns: 1fr; }
        .entity-card-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propDefs: PropDef[] = [
  { name: 'name', type: 'string', description: 'Entity display name (required).' },
  { name: 'type', type: 'string', description: 'Entity type label (e.g., "Virtual Machine", "Database").' },
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'", default: "'unknown'", description: 'Operational status with color-coded indicator.' },
  { name: 'metrics', type: '{ label: string; value: string }[]', description: 'Key metrics displayed in a row beneath the header.' },
  { name: 'tags', type: 'string[]', description: 'Categorization tags rendered as pills.' },
  { name: 'actions', type: '{ label: string; icon?: ReactNode; onClick: () => void }[]', description: 'Action buttons in the card footer.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Compact mode with reduced padding.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls card dimensions and typography.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
type Size = 'sm' | 'md' | 'lg'

const STATUSES: Status[] = ['ok', 'warning', 'critical', 'unknown', 'maintenance']
const SIZES: Size[] = ['sm', 'md', 'lg']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { EntityCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { EntityCard } from '@annondeveloper/ui-kit'",
  premium: "import { EntityCard } from '@annondeveloper/ui-kit/premium'",
}

const sampleMetrics = [
  { label: 'CPU', value: '24%' },
  { label: 'RAM', value: '8.2 GB' },
  { label: 'Disk', value: '67%' },
  { label: 'Network', value: '1.2 Gbps' },
]

const sampleTags = ['production', 'us-east-1', 'nginx', 'web-tier']

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }} icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="entity-card-page__control-group">
      <span className="entity-card-page__control-label">{label}</span>
      <div className="entity-card-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`entity-card-page__option-btn${opt === value ? ' entity-card-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="entity-card-page__toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />{label}</label>
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, name: string, status: Status, size: Size, compact: boolean, showMetrics: boolean, showTags: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  name="${name}"`, `  status="${status}"`]
  if (size !== 'md') props.push(`  size="${size}"`)
  if (compact) props.push('  compact')
  if (showMetrics) props.push(`  metrics={[{ label: 'CPU', value: '24%' }, { label: 'RAM', value: '8GB' }]}`)
  if (showTags) props.push(`  tags={['production', 'us-east-1']}`)

  return `${importStr}\n\n<EntityCard\n${props.join('\n')}\n/>`
}

function generateVueCode(tier: Tier, name: string, status: Status): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>\n  <EntityCard name="${name}" status="${status}" :metrics="metrics" />\n</template>\n\n<script setup>\nimport { EntityCard } from '${importPath}'\nconst metrics = [{ label: 'CPU', value: '24%' }]\n</script>`
}

function generateAngularCode(tier: Tier, name: string, status: Status): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- CSS-only approach -->\n<div class="ui-entity-card" data-status="${status}">\n  <span class="ui-entity-card__name">${name}</span>\n</div>\n\n@import '${importPath}/css/components/entity-card.css';`
}

function generateSvelteCode(tier: Tier, name: string, status: Status): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { EntityCard } from '${importPath}';\n</script>\n\n<EntityCard name="${name}" status="${status}" />`
}

function generateHtmlCode(name: string, status: Status): string {
  return `<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/entity-card.css">\n\n<div class="ui-entity-card" data-status="${status}">\n  <div class="ui-entity-card__header">\n    <span class="ui-entity-card__name">${name}</span>\n  </div>\n</div>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection() {
  const { tier } = useTier()
  const [name, setName] = useState('prod-web-01')
  const [status, setStatus] = useState<Status>('ok')
  const [size, setSize] = useState<Size>('md')
  const [compact, setCompact] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true)
  const [showTags, setShowTags] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const Component = tier === 'lite' ? LiteEntityCard : tier === 'premium' ? PremiumEntityCard : EntityCard

  const reactCode = useMemo(() => generateReactCode(tier, name, status, size, compact, showMetrics, showTags), [tier, name, status, size, compact, showMetrics, showTags])
  const vueCode = useMemo(() => generateVueCode(tier, name, status), [tier, name, status])
  const angularCode = useMemo(() => generateAngularCode(tier, name, status), [tier, name, status])
  const svelteCode = useMemo(() => generateSvelteCode(tier, name, status), [tier, name, status])
  const htmlCode = useMemo(() => generateHtmlCode(name, status), [name, status])

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
    <section className="entity-card-page__section" id="playground">
      <h2 className="entity-card-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="entity-card-page__section-desc">Configure the EntityCard and see live code output for any framework.</p>

      <div className="entity-card-page__playground">
        <div className="entity-card-page__playground-preview">
          <div className="entity-card-page__playground-result">
            <Component
              name={name}
              type="Virtual Machine"
              status={status}
              size={size}
              compact={compact}
              metrics={showMetrics ? sampleMetrics : undefined}
              tags={showTags ? sampleTags : undefined}
              actions={[{ label: 'SSH', onClick: () => {} }, { label: 'Restart', onClick: () => {} }]}
            />
          </div>
          <div className="entity-card-page__code-tabs">
            <div className="entity-card-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />} onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="entity-card-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="entity-card-page__playground-controls">
          <div className="entity-card-page__control-group">
            <span className="entity-card-page__control-label">Name</span>
            <input type="text" className="entity-card-page__text-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <OptionGroup label="Status" options={STATUSES} value={status} onChange={setStatus} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <Toggle label="Compact" checked={compact} onChange={setCompact} />
          <Toggle label="Show Metrics" checked={showMetrics} onChange={setShowMetrics} />
          <Toggle label="Show Tags" checked={showTags} onChange={setShowTags} />
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EntityCardPage() {
  useStyles('entity-card-page', pageStyles)
  const { tier, setTier } = useTier()

  const Component = tier === 'lite' ? LiteEntityCard : tier === 'premium' ? PremiumEntityCard : EntityCard
  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="entity-card-page">
      {/* Hero */}
      <div className="entity-card-page__hero">
        <h1 className="entity-card-page__title">EntityCard</h1>
        <p className="entity-card-page__desc">
          Infrastructure resource card for displaying servers, VMs, databases, and other entities
          with status indicators, metrics, tags, and action buttons.
        </p>
        <div className="entity-card-page__import-row">
          <code className="entity-card-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* Weight Tiers */}
      <section className="entity-card-page__section" id="tiers">
        <h2 className="entity-card-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="entity-card-page__section-desc">Choose the tier that fits your bundle budget.</p>
        <div className="entity-card-page__tiers">
          {TIERS.map(t => (
            <div key={t.id} className={`entity-card-page__tier-card${tier === t.id ? ' entity-card-page__tier-card--active' : ''}`} onClick={() => setTier(t.id)}>
              <div className="entity-card-page__tier-header">
                <span className="entity-card-page__tier-name">{t.label}</span>
                <span className="entity-card-page__tier-size">{t.id === 'lite' ? '~1KB' : t.id === 'standard' ? '~3KB' : '~5KB'}</span>
              </div>
              <p className="entity-card-page__tier-desc">
                {t.id === 'lite' && 'Minimal CSS-only card with status indicator.'}
                {t.id === 'standard' && 'Full feature set with metrics, tags, and actions.'}
                {t.id === 'premium' && 'Aurora glow, spring entrance, status pulse animations.'}
              </p>
              <code className="entity-card-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
              <div className="entity-card-page__tier-preview">
                {t.id === 'lite' && <LiteEntityCard name="demo-srv" status="ok" />}
                {t.id === 'standard' && <EntityCard name="demo-srv" status="ok" metrics={[{ label: 'CPU', value: '24%' }]} />}
                {t.id === 'premium' && <PremiumEntityCard name="demo-srv" status="ok" metrics={[{ label: 'CPU', value: '24%' }]} tags={['prod']} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playground */}
      <PlaygroundSection />

      {/* All Statuses */}
      <section className="entity-card-page__section" id="statuses">
        <h2 className="entity-card-page__section-title"><a href="#statuses">Status Variants</a></h2>
        <p className="entity-card-page__section-desc">Five operational statuses with distinct color-coded indicators.</p>
        <div className="entity-card-page__preview">
          {STATUSES.map(s => (
            <Component key={s} name={`server-${s}`} type="VM" status={s} style={{ minWidth: 160 }} />
          ))}
        </div>
      </section>

      {/* Compact Mode */}
      <section className="entity-card-page__section" id="compact">
        <h2 className="entity-card-page__section-title"><a href="#compact">Compact Mode</a></h2>
        <p className="entity-card-page__section-desc">Reduced padding for dense dashboards and list views.</p>
        <div className="entity-card-page__preview">
          <Component name="db-replica-03" type="Database" status="warning" compact tags={['staging']} metrics={[{ label: 'Conns', value: '42' }]} />
          <Component name="cache-01" type="Redis" status="ok" compact tags={['production']} />
        </div>
      </section>

      {/* With Actions */}
      <section className="entity-card-page__section" id="actions">
        <h2 className="entity-card-page__section-title"><a href="#actions">Action Buttons</a></h2>
        <p className="entity-card-page__section-desc">Add contextual actions to the card footer.</p>
        <div className="entity-card-page__preview">
          <Component
            name="lb-main-01"
            type="Load Balancer"
            status="ok"
            metrics={[{ label: 'Connections', value: '1.2k' }, { label: 'RPS', value: '4.8k' }]}
            tags={['production', 'us-east-1']}
            actions={[
              { label: 'SSH', onClick: () => {} },
              { label: 'Restart', onClick: () => {} },
              { label: 'Logs', onClick: () => {} },
            ]}
          />
        </div>
      </section>

      {/* Sizes */}
      <section className="entity-card-page__section" id="sizes">
        <h2 className="entity-card-page__section-title"><a href="#sizes">Size Variants</a></h2>
        <p className="entity-card-page__section-desc">
          Three size variants control card dimensions and typography for different dashboard densities.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>{s}</p>
              <Component
                name={`server-${s}`}
                type="Virtual Machine"
                status="ok"
                size={s}
                metrics={[{ label: 'CPU', value: '24%' }, { label: 'RAM', value: '8GB' }]}
                tags={['production']}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Layout */}
      <section className="entity-card-page__section" id="metrics">
        <h2 className="entity-card-page__section-title"><a href="#metrics">Metrics Display</a></h2>
        <p className="entity-card-page__section-desc">
          Metrics are displayed in a compact row beneath the entity header. The component adapts the metrics
          layout based on available space using container queries.
        </p>
        <div className="entity-card-page__preview">
          <Component
            name="production-db-primary"
            type="PostgreSQL 16"
            status="warning"
            metrics={[
              { label: 'Connections', value: '142/200' },
              { label: 'QPS', value: '8.4k' },
              { label: 'Replication Lag', value: '2.3s' },
              { label: 'Cache Hit', value: '94.7%' },
              { label: 'Disk IOPS', value: '12k' },
            ]}
            tags={['production', 'us-east-1', 'postgresql', 'primary']}
          />
        </div>
      </section>

      {/* Tags Overflow */}
      <section className="entity-card-page__section" id="tags">
        <h2 className="entity-card-page__section-title"><a href="#tags">Tags</a></h2>
        <p className="entity-card-page__section-desc">
          Tags wrap naturally and truncate gracefully when the card is narrow. Use tags for categorization,
          environment labels, and quick filtering.
        </p>
        <div className="entity-card-page__preview" style={{ maxInlineSize: 320 }}>
          <Component
            name="k8s-worker-07"
            type="Kubernetes Node"
            status="ok"
            tags={['production', 'us-west-2', 'kubernetes', 'worker', 'gpu-enabled', 'spot-instance']}
          />
        </div>
      </section>

      {/* Props Table */}
      <section className="entity-card-page__section" id="props">
        <h2 className="entity-card-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={propDefs} />
      </section>

      {/* Accessibility */}
      <section className="entity-card-page__section" id="accessibility">
        <h2 className="entity-card-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <ul className="entity-card-page__a11y-list">
          <li className="entity-card-page__a11y-item"><Icon name="check" size="sm" className="entity-card-page__a11y-icon" />Semantic article structure with accessible name</li>
          <li className="entity-card-page__a11y-item"><Icon name="check" size="sm" className="entity-card-page__a11y-icon" />Status communicated via aria-label, not color alone</li>
          <li className="entity-card-page__a11y-item"><Icon name="check" size="sm" className="entity-card-page__a11y-icon" />Action buttons meet 44px minimum touch target</li>
          <li className="entity-card-page__a11y-item"><Icon name="check" size="sm" className="entity-card-page__a11y-icon" />Respects prefers-reduced-motion</li>
        </ul>
      </section>

      {/* Source */}
      <section className="entity-card-page__section" id="source">
        <h2 className="entity-card-page__section-title"><a href="#source">Source</a></h2>
        <a className="entity-card-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/entity-card.tsx" target="_blank" rel="noopener noreferrer">
          <Icon name="code" size="sm" />View source on GitHub
        </a>
      </section>
    </div>
  )
}
