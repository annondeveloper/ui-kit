'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ServiceStrip, type ServiceItem } from '@ui/domain/service-strip'
import { ServiceStrip as LiteServiceStrip } from '@ui/lite/service-strip'
import { ServiceStrip as PremiumServiceStrip } from '@ui/premium/service-strip'
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
    @scope (.service-strip-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: service-strip-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .service-strip-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .service-strip-page__hero::before {
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
        animation: service-strip-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes service-strip-page-aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .service-strip-page__hero::before { animation: none; } }

      .service-strip-page__title {
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

      .service-strip-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .service-strip-page__import-row { position: relative; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .service-strip-page__import-code { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-sm, 0.875rem); background: oklch(0% 0 0 / 0.2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.5rem 0.875rem; color: var(--text-primary); flex: 1; min-inline-size: 0; overflow-x: auto; white-space: nowrap; backdrop-filter: blur(8px); }

      .service-strip-page__section {
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
        animation: service-strip-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes service-strip-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .service-strip-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .service-strip-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .service-strip-page__section-title a {
        color: inherit;
        text-decoration: none;
      }

      .service-strip-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .service-strip-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .service-strip-page__preview {
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

      .service-strip-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .service-strip-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .service-strip-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .service-strip-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @container service-strip-page (max-width: 680px) {
        .service-strip-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .service-strip-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .service-strip-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .service-strip-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .service-strip-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .service-strip-page__playground-controls {
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

      .service-strip-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .service-strip-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .service-strip-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .service-strip-page__option-btn {
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

      .service-strip-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .service-strip-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .service-strip-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .service-strip-page__tier-card {
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

      .service-strip-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .service-strip-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .service-strip-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .service-strip-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .service-strip-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .service-strip-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .service-strip-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .service-strip-page__tier-import {
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

      .service-strip-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .service-strip-page__code-tabs {
        margin-block-start: 1rem;
      }

      .service-strip-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .service-strip-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Labeled row ────────────────────────────────── */

      .service-strip-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .service-strip-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .service-strip-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── A11y list ──────────────────────────────────── */

      .service-strip-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .service-strip-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .service-strip-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .service-strip-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }

      .service-strip-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar ──────────────────────────────────── */

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }

      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }

      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }

      @media (max-width: 768px) {
        .service-strip-page__hero { padding: 2rem 1.25rem; }
        .service-strip-page__title { font-size: 1.75rem; }
        .service-strip-page__playground { grid-template-columns: 1fr; }
        .service-strip-page__tiers { grid-template-columns: 1fr; }
        .service-strip-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propDefs: PropDef[] = [
  { name: 'services', type: 'ServiceItem[]', description: 'Array of service objects with name, status, optional version and icon.' },
  { name: 'maxVisible', type: 'number', description: 'Maximum number of badges to show before overflow count.' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Badge size variant.' },
  { name: 'onServiceClick', type: '(service: ServiceItem) => void', description: 'Click handler for individual service badges.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md'
const SIZES: Size[] = ['sm', 'md']
const MAX_VISIBLE_OPTIONS = ['3', '5', '8', 'all']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ServiceStrip } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ServiceStrip } from '@annondeveloper/ui-kit'",
  premium: "import { ServiceStrip } from '@annondeveloper/ui-kit/premium'",
}

const allServices: ServiceItem[] = [
  { name: 'nginx', status: 'running' },
  { name: 'postgres', status: 'running' },
  { name: 'redis', status: 'running' },
  { name: 'cron', status: 'stopped' },
  { name: 'docker', status: 'running' },
  { name: 'prometheus', status: 'running' },
  { name: 'grafana', status: 'error' },
  { name: 'alertmanager', status: 'unknown' },
]

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
    <div className="service-strip-page__control-group">
      <span className="service-strip-page__control-label">{label}</span>
      <div className="service-strip-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`service-strip-page__option-btn${opt === value ? ' service-strip-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, maxVisible: number | undefined): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (maxVisible) props.push(`  maxVisible={${maxVisible}}`)

  return `${importStr}

const services = [
  { name: 'nginx', status: 'running' },
  { name: 'postgres', status: 'running' },
  { name: 'redis', status: 'stopped' },
  { name: 'cron', status: 'error' },
]

<ServiceStrip
  services={services}
${props.join('\n')}
  onServiceClick={(svc) => console.log(svc.name)}
/>`
}

function generateVueCode(tier: Tier, size: Size, maxVisible: number | undefined): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [':services="services"']
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (maxVisible) attrs.push(`:max-visible="${maxVisible}"`)
  return `<template>\n  <ServiceStrip ${attrs.join(' ')} @service-click="handleClick" />\n</template>\n\n<script setup>\nimport { ServiceStrip } from '${importPath}'\nconst services = [\n  { name: 'nginx', status: 'running' },\n  { name: 'redis', status: 'stopped' },\n]\nfunction handleClick(svc) { console.log(svc.name) }\n</script>`
}

function generateAngularCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- CSS-only approach -->\n<div class="ui-service-strip">\n  <span class="ui-service-strip__badge" data-status="running">nginx</span>\n  <span class="ui-service-strip__badge" data-status="stopped">redis</span>\n</div>\n\n@import '${importPath}/css/components/service-strip.css';`
}

function generateSvelteCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { ServiceStrip } from '${importPath}';\n  const services = [{ name: 'nginx', status: 'running' }];\n</script>\n\n<ServiceStrip {services} on:serviceClick={e => console.log(e.detail)} />`
}

function generateHtmlCode(): string {
  return `<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/service-strip.css">\n\n<div class="ui-service-strip">\n  <span class="ui-service-strip__badge" data-status="running">nginx</span>\n  <span class="ui-service-strip__badge" data-status="running">postgres</span>\n  <span class="ui-service-strip__badge" data-status="stopped">cron</span>\n  <span class="ui-service-strip__badge" data-status="error">grafana</span>\n</div>`
}

// ─── Playground ──────────────────────────────────────────────────────────────

function PlaygroundSection() {
  const { tier } = useTier()
  const [size, setSize] = useState<Size>('md')
  const [maxVisibleStr, setMaxVisibleStr] = useState('5')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const maxVisible = maxVisibleStr === 'all' ? undefined : Number(maxVisibleStr)
  const Component = tier === 'lite' ? LiteServiceStrip : tier === 'premium' ? PremiumServiceStrip : ServiceStrip

  const reactCode = useMemo(() => generateReactCode(tier, size, maxVisible), [tier, size, maxVisible])
  const vueCode = useMemo(() => generateVueCode(tier, size, maxVisible), [tier, size, maxVisible])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier), [tier])
  const htmlCode = useMemo(() => generateHtmlCode(), [])

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
    <section className="service-strip-page__section" id="playground">
      <h2 className="service-strip-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="service-strip-page__section-desc">Configure the ServiceStrip and copy generated code.</p>

      <div className="service-strip-page__playground">
        <div className="service-strip-page__playground-preview">
          <div className="service-strip-page__playground-result">
            <Component services={allServices} size={size} maxVisible={maxVisible} onServiceClick={svc => console.log(svc.name)} />
          </div>
          <div className="service-strip-page__code-tabs">
            <div className="service-strip-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />} onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus('Copied!'); setTimeout(() => setCopyStatus(''), 2000) }) }}>Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="service-strip-page__export-status">{copyStatus}</span>}
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

        <div className="service-strip-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Max Visible" options={MAX_VISIBLE_OPTIONS as readonly string[]} value={maxVisibleStr} onChange={setMaxVisibleStr} />
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ServiceStripPage() {
  useStyles(pageStyles)
  const { tier, setTier } = useTier()

  const Component = tier === 'lite' ? LiteServiceStrip : tier === 'premium' ? PremiumServiceStrip : ServiceStrip
  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="service-strip-page">
      {/* Hero */}
      <div className="service-strip-page__hero">
        <h1 className="service-strip-page__title">ServiceStrip</h1>
        <p className="service-strip-page__desc">
          Horizontal strip of service badges showing running, stopped, error, and unknown statuses.
          Overflow is handled with a count badge. Compact enough for card headers and dashboards.
        </p>
        <div className="service-strip-page__import-row">
          <code className="service-strip-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* Weight Tiers */}
      <section className="service-strip-page__section" id="tiers">
        <h2 className="service-strip-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="service-strip-page__section-desc">Choose the tier that fits your bundle budget.</p>
        <div className="service-strip-page__tiers">
          {TIERS.map(t => (
            <div key={t.id} className={`service-strip-page__tier-card${tier === t.id ? ' service-strip-page__tier-card--active' : ''}`} onClick={() => setTier(t.id)}>
              <div className="service-strip-page__tier-header">
                <span className="service-strip-page__tier-name">{t.label}</span>
                <span className="service-strip-page__tier-size">{t.id === 'lite' ? '~0.6KB' : t.id === 'standard' ? '~1.8KB' : '~3KB'}</span>
              </div>
              <p className="service-strip-page__tier-desc">
                {t.id === 'lite' && 'CSS-only badges. No animation, smallest bundle.'}
                {t.id === 'standard' && 'Status transitions and overflow badge.'}
                {t.id === 'premium' && 'Status pulse, spring entrance, aurora shimmer.'}
              </p>
              <code className="service-strip-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
              <div className="service-strip-page__tier-preview">
                {t.id === 'lite' && <LiteServiceStrip services={allServices.slice(0, 4)} size="sm" />}
                {t.id === 'standard' && <ServiceStrip services={allServices.slice(0, 4)} size="sm" />}
                {t.id === 'premium' && <PremiumServiceStrip services={allServices.slice(0, 4)} size="sm" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playground */}
      <PlaygroundSection />

      {/* All Statuses */}
      <section className="service-strip-page__section" id="statuses">
        <h2 className="service-strip-page__section-title"><a href="#statuses">Status Variants</a></h2>
        <p className="service-strip-page__section-desc">Four status states with distinct badge colors.</p>
        <div className="service-strip-page__preview">
          <Component services={[
            { name: 'running-svc', status: 'running' },
            { name: 'stopped-svc', status: 'stopped' },
            { name: 'error-svc', status: 'error' },
            { name: 'unknown-svc', status: 'unknown' },
          ]} />
        </div>
      </section>

      {/* Many Services with Overflow */}
      <section className="service-strip-page__section" id="overflow">
        <h2 className="service-strip-page__section-title"><a href="#overflow">Overflow Handling</a></h2>
        <p className="service-strip-page__section-desc">When services exceed maxVisible, a count badge shows the overflow.</p>
        <div className="service-strip-page__preview">
          <Component services={allServices} maxVisible={4} />
        </div>
      </section>

      {/* Sizes */}
      <section className="service-strip-page__section" id="sizes">
        <h2 className="service-strip-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="service-strip-page__section-desc">Two size variants for different contexts.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>{s}</p>
              <Component services={allServices.slice(0, 5)} size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* Click Interaction */}
      <section className="service-strip-page__section" id="click">
        <h2 className="service-strip-page__section-title"><a href="#click">Click Interaction</a></h2>
        <p className="service-strip-page__section-desc">
          Pass onServiceClick to make badges interactive. Useful for opening detail panels
          or navigating to service monitoring pages.
        </p>
        <div className="service-strip-page__preview">
          <Component
            services={allServices}
            onServiceClick={svc => {
              const el = document.getElementById('click-output')
              if (el) el.textContent = `Clicked: ${svc.name} (${svc.status})`
            }}
          />
        </div>
        <p id="click-output" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.5rem', fontFamily: 'monospace' }}>
          Click a service badge above
        </p>
      </section>

      {/* With Version Info */}
      <section className="service-strip-page__section" id="versions">
        <h2 className="service-strip-page__section-title"><a href="#versions">With Version Info</a></h2>
        <p className="service-strip-page__section-desc">
          Services can include version strings displayed alongside the name for deployment tracking.
        </p>
        <div className="service-strip-page__preview">
          <Component
            services={[
              { name: 'nginx', status: 'running', version: '1.25.3' },
              { name: 'postgres', status: 'running', version: '16.2' },
              { name: 'redis', status: 'running', version: '7.2.4' },
              { name: 'node', status: 'running', version: '22.1.0' },
              { name: 'docker', status: 'running', version: '26.0.0' },
            ]}
          />
        </div>
      </section>

      {/* Real-World Example */}
      <section className="service-strip-page__section" id="real-world">
        <h2 className="service-strip-page__section-title"><a href="#real-world">Real-World Usage</a></h2>
        <p className="service-strip-page__section-desc">
          ServiceStrip is designed to be embedded in card headers, dashboard tiles, and entity detail panels.
          Here it is shown in different contexts with varying service counts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>prod-web-01 Services</p>
            <Component services={allServices.slice(0, 4)} size="sm" />
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>monitoring-stack Services</p>
            <Component services={allServices} maxVisible={5} size="sm" />
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>Minimal Host</p>
            <Component services={[{ name: 'sshd', status: 'running' }, { name: 'systemd', status: 'running' }]} size="sm" />
          </div>
        </div>
      </section>

      {/* Props Table */}
      <section className="service-strip-page__section" id="props">
        <h2 className="service-strip-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={propDefs} />
      </section>

      {/* Accessibility */}
      <section className="service-strip-page__section" id="accessibility">
        <h2 className="service-strip-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <ul className="service-strip-page__a11y-list">
          <li className="service-strip-page__a11y-item"><Icon name="check" size="sm" className="service-strip-page__a11y-icon" />Service badges use role="status" for screen reader announcement</li>
          <li className="service-strip-page__a11y-item"><Icon name="check" size="sm" className="service-strip-page__a11y-icon" />Status communicated via text and aria-label, not color alone</li>
          <li className="service-strip-page__a11y-item"><Icon name="check" size="sm" className="service-strip-page__a11y-icon" />Overflow count is accessible with descriptive label</li>
          <li className="service-strip-page__a11y-item"><Icon name="check" size="sm" className="service-strip-page__a11y-icon" />Respects prefers-reduced-motion</li>
        </ul>
      </section>

      {/* Source */}
      <section className="service-strip-page__section" id="source">
        <h2 className="service-strip-page__section-title"><a href="#source">Source</a></h2>
        <a className="service-strip-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/service-strip.tsx" target="_blank" rel="noopener noreferrer">
          <Icon name="code" size="sm" />View source on GitHub
        </a>
      </section>
    </div>
  )
}
