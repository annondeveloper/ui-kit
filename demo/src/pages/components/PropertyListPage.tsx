'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PropertyList, type PropertyItem } from '@ui/domain/property-list'
import { PropertyList as LitePropertyList } from '@ui/lite/property-list'
import { PropertyList as PremiumPropertyList } from '@ui/premium/property-list'
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
    @scope (.property-list-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: property-list-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .property-list-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .property-list-page__hero::before {
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
        animation: property-list-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes property-list-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .property-list-page__hero::before { animation: none; }
      }

      .property-list-page__title {
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

      .property-list-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .property-list-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .property-list-page__import-code {
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

      .property-list-page__section {
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
        animation: property-list-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes property-list-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .property-list-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .property-list-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .property-list-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .property-list-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .property-list-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .property-list-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container property-list-page (max-width: 680px) {
        .property-list-page__playground { grid-template-columns: 1fr; }
      }

      .property-list-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .property-list-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .property-list-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .property-list-page__playground-controls {
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

      .property-list-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .property-list-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .property-list-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .property-list-page__option-btn {
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
      .property-list-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .property-list-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .property-list-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .property-list-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .property-list-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .property-list-page__tier-card {
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
      .property-list-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .property-list-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .property-list-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .property-list-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .property-list-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .property-list-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .property-list-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .property-list-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .property-list-page__code-tabs {
        margin-block-start: 1rem;
      }

      .property-list-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .property-list-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      .property-list-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .property-list-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .property-list-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .property-list-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .property-list-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      @media (max-width: 768px) {
        .property-list-page__hero { padding: 2rem 1.25rem; }
        .property-list-page__title { font-size: 1.75rem; }
        .property-list-page__playground { grid-template-columns: 1fr; }
        .property-list-page__tiers { grid-template-columns: 1fr; }
        .property-list-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propDefs: PropDef[] = [
  { name: 'items', type: 'PropertyItem[]', description: 'Array of key-value items to display. Each has label, value, optional copyable, mono, href.' },
  { name: 'columns', type: '1 | 2', default: '1', description: 'Number of columns for the property list layout.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding and font size.' },
  { name: 'striped', type: 'boolean', default: 'false', description: 'Alternate row backgrounds for better readability.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type Columns = 1 | 2

const SIZES: Size[] = ['sm', 'md', 'lg']
const COLUMNS: Columns[] = [1, 2]
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PropertyList } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PropertyList } from '@annondeveloper/ui-kit'",
  premium: "import { PropertyList } from '@annondeveloper/ui-kit/premium'",
}

const sampleItems: PropertyItem[] = [
  { label: 'Hostname', value: 'prod-web-01.dc1.example.com', copyable: true, mono: true },
  { label: 'IP Address', value: '10.0.42.17', copyable: true, mono: true },
  { label: 'Operating System', value: 'Ubuntu 24.04 LTS' },
  { label: 'Kernel', value: '6.8.0-44-generic', mono: true },
  { label: 'Uptime', value: '142 days, 7 hours' },
  { label: 'CPU Cores', value: '16 @ 3.4 GHz' },
  { label: 'Memory', value: '64 GB DDR5' },
  { label: 'Region', value: 'us-east-1' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="property-list-page__control-group">
      <span className="property-list-page__control-label">{label}</span>
      <div className="property-list-page__control-options">
        {options.map(opt => (
          <button
            key={String(opt)}
            type="button"
            className={`property-list-page__option-btn${opt === value ? ' property-list-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {String(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="property-list-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, columns: Columns, striped: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (columns !== 1) props.push(`  columns={${columns}}`)
  if (striped) props.push('  striped')

  return `${importStr}

const items = [
  { label: 'Hostname', value: 'prod-web-01.dc1.example.com', copyable: true, mono: true },
  { label: 'IP Address', value: '10.0.42.17', copyable: true, mono: true },
  { label: 'OS', value: 'Ubuntu 24.04 LTS' },
  { label: 'Uptime', value: '142 days, 7 hours' },
]

<PropertyList
  items={items}
${props.join('\n')}
/>`
}

function generateVueCode(tier: Tier, size: Size, columns: Columns, striped: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':items="items"']
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (columns !== 1) attrs.push(`:columns="${columns}"`)
  if (striped) attrs.push('striped')

  return `<template>
  <PropertyList ${attrs.join(' ')} />
</template>

<script setup>
import { PropertyList } from '${importPath}'

const items = [
  { label: 'Hostname', value: 'prod-web-01', copyable: true, mono: true },
  { label: 'IP', value: '10.0.42.17' },
]
</script>`
}

function generateAngularCode(tier: Tier, size: Size, columns: Columns, striped: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- Use CSS-only approach or React wrapper -->
<div class="ui-property-list" data-size="${size}" ${columns === 2 ? 'data-columns="2"' : ''} ${striped ? 'data-striped="true"' : ''}>
  <!-- Render rows programmatically -->
</div>

/* Import in styles.css */
@import '${importPath}/css/components/property-list.css';`
}

function generateSvelteCode(tier: Tier, size: Size, columns: Columns, striped: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['{items}']
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (columns !== 1) attrs.push(`columns={${columns}}`)
  if (striped) attrs.push('striped')

  return `<script>
  import { PropertyList } from '${importPath}';

  const items = [
    { label: 'Hostname', value: 'prod-web-01', copyable: true },
    { label: 'IP', value: '10.0.42.17' },
  ];
</script>

<PropertyList ${attrs.join(' ')} />`
}

function generateHtmlCode(size: Size, columns: Columns, striped: boolean): string {
  return `<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/property-list.css">

<div class="ui-property-list" data-size="${size}" ${columns === 2 ? 'data-columns="2"' : ''} ${striped ? 'data-striped="true"' : ''}>
  <div class="ui-property-list__row">
    <span class="ui-property-list__label">Hostname</span>
    <span class="ui-property-list__value" data-mono="true">prod-web-01</span>
  </div>
  <div class="ui-property-list__row">
    <span class="ui-property-list__label">IP Address</span>
    <span class="ui-property-list__value" data-mono="true">10.0.42.17</span>
  </div>
</div>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection() {
  const { tier } = useTier()
  const [size, setSize] = useState<Size>('md')
  const [columns, setColumns] = useState<Columns>(1)
  const [striped, setStriped] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const Component = tier === 'lite' ? LitePropertyList : tier === 'premium' ? PremiumPropertyList : PropertyList

  const reactCode = useMemo(() => generateReactCode(tier, size, columns, striped), [tier, size, columns, striped])
  const vueCode = useMemo(() => generateVueCode(tier, size, columns, striped), [tier, size, columns, striped])
  const angularCode = useMemo(() => generateAngularCode(tier, size, columns, striped), [tier, size, columns, striped])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, columns, striped), [tier, size, columns, striped])
  const htmlCode = useMemo(() => generateHtmlCode(size, columns, striped), [size, columns, striped])

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
    <section className="property-list-page__section" id="playground">
      <h2 className="property-list-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="property-list-page__section-desc">
        Configure the PropertyList and see live code output for any framework.
      </p>

      <div className="property-list-page__playground">
        <div className="property-list-page__playground-preview">
          <div className="property-list-page__playground-result">
            <Component items={sampleItems} size={size} columns={columns} striped={striped} />
          </div>

          <div className="property-list-page__code-tabs">
            <div className="property-list-page__export-row">
              <Button
                size="xs"
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
              {copyStatus && <span className="property-list-page__export-status">{copyStatus}</span>}
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

        <div className="property-list-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Columns" options={COLUMNS.map(String) as ('1' | '2')[]} value={String(columns) as '1' | '2'} onChange={v => setColumns(Number(v) as Columns)} />
          <div className="property-list-page__toggle-row">
            <Toggle label="Striped" checked={striped} onChange={setStriped} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PropertyListPage() {
  useStyles(pageStyles)
  const { tier, setTier } = useTier()

  const Component = tier === 'lite' ? LitePropertyList : tier === 'premium' ? PremiumPropertyList : PropertyList
  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="property-list-page">
      {/* Hero */}
      <div className="property-list-page__hero">
        <h1 className="property-list-page__title">PropertyList</h1>
        <p className="property-list-page__desc">
          A structured key-value detail panel for displaying configuration, metadata, or system properties.
          Supports 1 or 2 columns, striped rows, copyable values, and monospace styling.
        </p>
        <div className="property-list-page__import-row">
          <code className="property-list-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* Weight Tiers */}
      <section className="property-list-page__section" id="tiers">
        <h2 className="property-list-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="property-list-page__section-desc">
          Choose the tier that fits your bundle budget. Lite for minimal CSS-only, Standard for full features, Premium for cinematic animations.
        </p>
        <div className="property-list-page__tiers">
          {TIERS.map(t => (
            <div
              key={t.id}
              className={`property-list-page__tier-card${tier === t.id ? ' property-list-page__tier-card--active' : ''}`}
              onClick={() => setTier(t.id)}
            >
              <div className="property-list-page__tier-header">
                <span className="property-list-page__tier-name">{t.label}</span>
                <span className="property-list-page__tier-size">
                  {t.id === 'lite' ? '~0.8KB' : t.id === 'standard' ? '~2.5KB' : '~4KB'}
                </span>
              </div>
              <p className="property-list-page__tier-desc">
                {t.id === 'lite' && 'Minimal CSS-only wrapper. No motion, smallest bundle.'}
                {t.id === 'standard' && 'Full feature set with transitions and copy support.'}
                {t.id === 'premium' && 'Aurora glow, spring entrance, shimmer highlights.'}
              </p>
              <code className="property-list-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
              <div className="property-list-page__tier-preview">
                {t.id === 'lite' && <LitePropertyList items={sampleItems.slice(0, 3)} size="sm" />}
                {t.id === 'standard' && <PropertyList items={sampleItems.slice(0, 3)} size="sm" />}
                {t.id === 'premium' && <PremiumPropertyList items={sampleItems.slice(0, 3)} size="sm" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playground */}
      <PlaygroundSection />

      {/* Sizes */}
      <section className="property-list-page__section" id="sizes">
        <h2 className="property-list-page__section-title">
          <a href="#sizes">Sizes</a>
        </h2>
        <p className="property-list-page__section-desc">
          Three size variants control padding and font size for different contexts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>{s}</p>
              <Component items={sampleItems.slice(0, 4)} size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* Two Columns */}
      <section className="property-list-page__section" id="columns">
        <h2 className="property-list-page__section-title">
          <a href="#columns">Two-Column Layout</a>
        </h2>
        <p className="property-list-page__section-desc">
          Set columns=2 for wider containers. Falls back to single column on narrow viewports.
        </p>
        <div className="property-list-page__preview">
          <Component items={sampleItems} columns={2} />
        </div>
      </section>

      {/* Striped */}
      <section className="property-list-page__section" id="striped">
        <h2 className="property-list-page__section-title">
          <a href="#striped">Striped Rows</a>
        </h2>
        <p className="property-list-page__section-desc">
          Alternate row backgrounds improve scanability in dense property lists.
        </p>
        <div className="property-list-page__preview">
          <Component items={sampleItems} striped />
        </div>
      </section>

      {/* Copyable */}
      <section className="property-list-page__section" id="copyable">
        <h2 className="property-list-page__section-title">
          <a href="#copyable">Copyable Values</a>
        </h2>
        <p className="property-list-page__section-desc">
          Mark items as copyable to show a copy button. Mono styling is applied automatically for code-like values.
        </p>
        <div className="property-list-page__preview">
          <Component
            items={[
              { label: 'API Key', value: 'sk-abc123...xyz', copyable: true, mono: true },
              { label: 'Secret', value: 'wJalrXUtnFEMI/K7MDENG', copyable: true, mono: true },
              { label: 'Endpoint', value: 'https://api.example.com/v2', copyable: true, mono: true },
              { label: 'Region', value: 'us-east-1' },
            ]}
          />
        </div>
      </section>

      {/* Props Table */}
      <section className="property-list-page__section" id="props">
        <h2 className="property-list-page__section-title">
          <a href="#props">Props</a>
        </h2>
        <PropsTable props={propDefs} />
      </section>

      {/* Accessibility */}
      <section className="property-list-page__section" id="accessibility">
        <h2 className="property-list-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <ul className="property-list-page__a11y-list">
          <li className="property-list-page__a11y-item">
            <Icon name="check" size="sm" className="property-list-page__a11y-icon" />
            Uses semantic dl/dt/dd structure for screen reader compatibility
          </li>
          <li className="property-list-page__a11y-item">
            <Icon name="check" size="sm" className="property-list-page__a11y-icon" />
            Copy buttons have clear accessible labels
          </li>
          <li className="property-list-page__a11y-item">
            <Icon name="check" size="sm" className="property-list-page__a11y-icon" />
            Respects prefers-reduced-motion for entrance animations
          </li>
          <li className="property-list-page__a11y-item">
            <Icon name="check" size="sm" className="property-list-page__a11y-icon" />
            WCAG AA contrast ratios maintained across all themes
          </li>
        </ul>
      </section>

      {/* Source */}
      <section className="property-list-page__section" id="source">
        <h2 className="property-list-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <a
          className="property-list-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/property-list.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="code" size="sm" />
          View source on GitHub
        </a>
      </section>
    </div>
  )
}
