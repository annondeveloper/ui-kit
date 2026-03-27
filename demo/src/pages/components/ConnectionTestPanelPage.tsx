'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ConnectionTestPanel, type TestStep } from '@ui/domain/connection-test-panel'
import { ConnectionTestPanel as LiteConnectionTestPanel } from '@ui/lite/connection-test-panel'
import { ConnectionTestPanel as PremiumConnectionTestPanel } from '@ui/premium/connection-test-panel'
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
    @scope (.connection-test-panel-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: connection-test-panel-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .connection-test-panel-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .connection-test-panel-page__hero::before {
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
        animation: ctp-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ctp-aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .connection-test-panel-page__hero::before { animation: none; } }

      .connection-test-panel-page__title {
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

      .connection-test-panel-page__desc { position: relative; color: var(--text-secondary); font-size: var(--text-base, 1rem); line-height: 1.6; margin: 0 0 1.25rem; max-inline-size: 60ch; text-wrap: pretty; }
      .connection-test-panel-page__import-row { position: relative; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .connection-test-panel-page__import-code { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-sm, 0.875rem); background: oklch(0% 0 0 / 0.2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.5rem 0.875rem; color: var(--text-primary); flex: 1; min-inline-size: 0; overflow-x: auto; white-space: nowrap; backdrop-filter: blur(8px); }

      .connection-test-panel-page__section {
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
        animation: ctp-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ctp-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .connection-test-panel-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .connection-test-panel-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .connection-test-panel-page__section-title a {
        color: inherit;
        text-decoration: none;
      }

      .connection-test-panel-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .connection-test-panel-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .connection-test-panel-page__preview {
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

      .connection-test-panel-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .connection-test-panel-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .connection-test-panel-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @container connection-test-panel-page (max-width: 680px) {
        .connection-test-panel-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .connection-test-panel-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .connection-test-panel-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .connection-test-panel-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .connection-test-panel-page__playground-controls {
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

      .connection-test-panel-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .connection-test-panel-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .connection-test-panel-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .connection-test-panel-page__option-btn {
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

      .connection-test-panel-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .connection-test-panel-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .connection-test-panel-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .connection-test-panel-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }

      .connection-test-panel-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .connection-test-panel-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .connection-test-panel-page__tier-card {
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

      .connection-test-panel-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .connection-test-panel-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .connection-test-panel-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .connection-test-panel-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .connection-test-panel-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .connection-test-panel-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .connection-test-panel-page__tier-import {
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

      .connection-test-panel-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .connection-test-panel-page__code-tabs {
        margin-block-start: 1rem;
      }

      .connection-test-panel-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .connection-test-panel-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .connection-test-panel-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .connection-test-panel-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .connection-test-panel-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .connection-test-panel-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }

      .connection-test-panel-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      @media (max-width: 768px) {
        .connection-test-panel-page__hero { padding: 2rem 1.25rem; }
        .connection-test-panel-page__title { font-size: 1.75rem; }
        .connection-test-panel-page__playground { grid-template-columns: 1fr; }
        .connection-test-panel-page__tiers { grid-template-columns: 1fr; }
        .connection-test-panel-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propDefs: PropDef[] = [
  { name: 'steps', type: 'TestStep[]', description: 'Array of test steps with id, label, status, optional message and duration.' },
  { name: 'title', type: 'string', description: 'Panel header title.' },
  { name: 'onRetry', type: '() => void', description: 'Retry callback. Shows retry button when provided.' },
  { name: 'onCancel', type: '() => void', description: 'Cancel callback. Shows cancel button when running.' },
  { name: 'running', type: 'boolean', default: 'false', description: 'Whether the test is currently executing.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls panel dimensions and typography.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type Scenario = 'mixed' | 'all-passed' | 'with-failure' | 'running'
const SIZES: Size[] = ['sm', 'md', 'lg']
const SCENARIOS: Scenario[] = ['mixed', 'all-passed', 'with-failure', 'running']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ConnectionTestPanel } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ConnectionTestPanel } from '@annondeveloper/ui-kit'",
  premium: "import { ConnectionTestPanel } from '@annondeveloper/ui-kit/premium'",
}

const scenarioSteps: Record<Scenario, TestStep[]> = {
  mixed: [
    { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 12 },
    { id: 'tcp', label: 'TCP Handshake', status: 'passed', duration: 45 },
    { id: 'tls', label: 'TLS Negotiation', status: 'passed', duration: 120 },
    { id: 'auth', label: 'Authentication', status: 'pending' },
    { id: 'ping', label: 'Latency Check', status: 'pending' },
  ],
  'all-passed': [
    { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 8 },
    { id: 'tcp', label: 'TCP Handshake', status: 'passed', duration: 32 },
    { id: 'tls', label: 'TLS Negotiation', status: 'passed', duration: 95 },
    { id: 'auth', label: 'Authentication', status: 'passed', duration: 210 },
    { id: 'ping', label: 'Latency Check', status: 'passed', duration: 15 },
  ],
  'with-failure': [
    { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 14 },
    { id: 'tcp', label: 'TCP Handshake', status: 'failed', message: 'Connection refused on port 5432' },
    { id: 'tls', label: 'TLS Negotiation', status: 'skipped' },
    { id: 'auth', label: 'Authentication', status: 'skipped' },
  ],
  running: [
    { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 11 },
    { id: 'tcp', label: 'TCP Handshake', status: 'running' },
    { id: 'tls', label: 'TLS Negotiation', status: 'pending' },
    { id: 'auth', label: 'Authentication', status: 'pending' },
  ],
}

const scenarioTitles: Record<Scenario, string> = {
  mixed: 'Connection Test',
  'all-passed': 'All Checks Passed',
  'with-failure': 'Database Connection',
  running: 'Connecting...',
}

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
    <div className="connection-test-panel-page__control-group">
      <span className="connection-test-panel-page__control-label">{label}</span>
      <div className="connection-test-panel-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`connection-test-panel-page__option-btn${opt === value ? ' connection-test-panel-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="connection-test-panel-page__toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />{label}</label>
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, title: string, size: Size, running: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  title="${title}"`]
  if (size !== 'md') props.push(`  size="${size}"`)
  if (running) props.push('  running')

  return `${importStr}

const steps = [
  { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 12 },
  { id: 'tcp', label: 'TCP Handshake', status: 'passed', duration: 45 },
  { id: 'tls', label: 'TLS Negotiation', status: 'pending' },
]

<ConnectionTestPanel
  steps={steps}
${props.join('\n')}
  onRetry={() => console.log('retry')}
/>`
}

function generateVueCode(tier: Tier, title: string): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>\n  <ConnectionTestPanel :steps="steps" title="${title}" @retry="handleRetry" />\n</template>\n\n<script setup>\nimport { ConnectionTestPanel } from '${importPath}'\nconst steps = [\n  { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 12 },\n]\nfunction handleRetry() { console.log('retry') }\n</script>`
}

function generateAngularCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- CSS-only approach -->\n<div class="ui-connection-test-panel">\n  <div class="ui-connection-test-panel__header">\n    <span>Connection Test</span>\n  </div>\n  <div class="ui-connection-test-panel__steps">\n    <div class="ui-connection-test-panel__step" data-status="passed">DNS Resolution</div>\n    <div class="ui-connection-test-panel__step" data-status="pending">TCP Handshake</div>\n  </div>\n</div>\n\n@import '${importPath}/css/components/connection-test-panel.css';`
}

function generateSvelteCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { ConnectionTestPanel } from '${importPath}';\n  const steps = [{ id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 12 }];\n</script>\n\n<ConnectionTestPanel {steps} title="Connection Test" on:retry={() => console.log('retry')} />`
}

function generateHtmlCode(): string {
  return `<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/connection-test-panel.css">\n\n<div class="ui-connection-test-panel">\n  <div class="ui-connection-test-panel__header">\n    <span class="ui-connection-test-panel__title">Connection Test</span>\n  </div>\n  <div class="ui-connection-test-panel__steps">\n    <div class="ui-connection-test-panel__step" data-status="passed">\n      <span>DNS Resolution</span>\n      <span>12ms</span>\n    </div>\n    <div class="ui-connection-test-panel__step" data-status="pending">\n      <span>TCP Handshake</span>\n    </div>\n  </div>\n</div>`
}

// ─── Playground ──────────────────────────────────────────────────────────────

function PlaygroundSection() {
  const { tier } = useTier()
  const [scenario, setScenario] = useState<Scenario>('mixed')
  const [size, setSize] = useState<Size>('md')
  const [title, setTitle] = useState('Connection Test')
  const [running, setRunning] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const Component = tier === 'lite' ? LiteConnectionTestPanel : tier === 'premium' ? PremiumConnectionTestPanel : ConnectionTestPanel
  const steps = scenarioSteps[scenario]
  const isRunning = scenario === 'running' || running

  const reactCode = useMemo(() => generateReactCode(tier, title, size, isRunning), [tier, title, size, isRunning])
  const vueCode = useMemo(() => generateVueCode(tier, title), [tier, title])
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
    <section className="connection-test-panel-page__section" id="playground">
      <h2 className="connection-test-panel-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="connection-test-panel-page__section-desc">Configure the ConnectionTestPanel and copy generated code.</p>

      <div className="connection-test-panel-page__playground">
        <div className="connection-test-panel-page__playground-preview">
          <div className="connection-test-panel-page__playground-result">
            <Component
              steps={steps}
              title={title}
              size={size}
              running={isRunning}
              onRetry={() => console.log('retry')}
              onCancel={() => console.log('cancel')}
            />
          </div>
          <div className="connection-test-panel-page__code-tabs">
            <div className="connection-test-panel-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />} onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus('Copied!'); setTimeout(() => setCopyStatus(''), 2000) }) }}>Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="connection-test-panel-page__export-status">{copyStatus}</span>}
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

        <div className="connection-test-panel-page__playground-controls">
          <OptionGroup label="Scenario" options={SCENARIOS} value={scenario} onChange={setScenario} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <div className="connection-test-panel-page__control-group">
            <span className="connection-test-panel-page__control-label">Title</span>
            <input type="text" className="connection-test-panel-page__text-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <Toggle label="Running" checked={running} onChange={setRunning} />
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConnectionTestPanelPage() {
  useStyles(pageStyles)
  const { tier, setTier } = useTier()

  const Component = tier === 'lite' ? LiteConnectionTestPanel : tier === 'premium' ? PremiumConnectionTestPanel : ConnectionTestPanel
  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="connection-test-panel-page">
      {/* Hero */}
      <div className="connection-test-panel-page__hero">
        <h1 className="connection-test-panel-page__title">ConnectionTestPanel</h1>
        <p className="connection-test-panel-page__desc">
          Step-by-step connectivity test panel for verifying DNS, TCP, TLS, authentication,
          and latency checks. Shows status icons, durations, error messages, and retry/cancel actions.
        </p>
        <div className="connection-test-panel-page__import-row">
          <code className="connection-test-panel-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* Weight Tiers */}
      <section className="connection-test-panel-page__section" id="tiers">
        <h2 className="connection-test-panel-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="connection-test-panel-page__section-desc">Choose the tier that fits your bundle budget.</p>
        <div className="connection-test-panel-page__tiers">
          {TIERS.map(t => (
            <div key={t.id} className={`connection-test-panel-page__tier-card${tier === t.id ? ' connection-test-panel-page__tier-card--active' : ''}`} onClick={() => setTier(t.id)}>
              <div className="connection-test-panel-page__tier-header">
                <span className="connection-test-panel-page__tier-name">{t.label}</span>
                <span className="connection-test-panel-page__tier-size">{t.id === 'lite' ? '~0.8KB' : t.id === 'standard' ? '~2.5KB' : '~4KB'}</span>
              </div>
              <p className="connection-test-panel-page__tier-desc">
                {t.id === 'lite' && 'CSS-only steps with status indicators.'}
                {t.id === 'standard' && 'Animated status transitions and duration display.'}
                {t.id === 'premium' && 'Running spinner, spring step entrance, pulse on failure.'}
              </p>
              <code className="connection-test-panel-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Playground */}
      <PlaygroundSection />

      {/* All Passed */}
      <section className="connection-test-panel-page__section" id="all-passed">
        <h2 className="connection-test-panel-page__section-title"><a href="#all-passed">All Passed</a></h2>
        <p className="connection-test-panel-page__section-desc">All steps complete with timing information.</p>
        <div className="connection-test-panel-page__preview">
          <Component steps={scenarioSteps['all-passed']} title="All Checks Passed" />
        </div>
      </section>

      {/* With Failure */}
      <section className="connection-test-panel-page__section" id="with-failure">
        <h2 className="connection-test-panel-page__section-title"><a href="#with-failure">With Failure</a></h2>
        <p className="connection-test-panel-page__section-desc">Failed step with error message and skipped subsequent steps.</p>
        <div className="connection-test-panel-page__preview">
          <Component steps={scenarioSteps['with-failure']} title="Database Connection" onRetry={() => console.log('retry')} />
        </div>
      </section>

      {/* Running State */}
      <section className="connection-test-panel-page__section" id="running">
        <h2 className="connection-test-panel-page__section-title"><a href="#running">Running State</a></h2>
        <p className="connection-test-panel-page__section-desc">Active test with spinner on the current step.</p>
        <div className="connection-test-panel-page__preview">
          <Component steps={scenarioSteps.running} title="Connecting..." running onCancel={() => console.log('cancel')} />
        </div>
      </section>

      {/* Sizes */}
      <section className="connection-test-panel-page__section" id="sizes">
        <h2 className="connection-test-panel-page__section-title"><a href="#sizes">Size Variants</a></h2>
        <p className="connection-test-panel-page__section-desc">
          Three size variants control the panel dimensions and typography for different contexts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>{s}</p>
              <Component
                steps={scenarioSteps['all-passed'].slice(0, 3)}
                title={`Size: ${s}`}
                size={s}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="connection-test-panel-page__section" id="real-world">
        <h2 className="connection-test-panel-page__section-title"><a href="#real-world">Real-World Usage</a></h2>
        <p className="connection-test-panel-page__section-desc">
          ConnectionTestPanel is commonly used in setup wizards, troubleshooting tools, and deployment pipelines.
          Here are some realistic examples.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ maxInlineSize: 480 }}>
            <Component
              steps={[
                { id: 'dns', label: 'Resolve api.stripe.com', status: 'passed', duration: 5 },
                { id: 'tcp', label: 'TCP connect :443', status: 'passed', duration: 28 },
                { id: 'tls', label: 'TLS 1.3 handshake', status: 'passed', duration: 85 },
                { id: 'auth', label: 'API key validation', status: 'passed', duration: 142 },
                { id: 'webhook', label: 'Webhook endpoint reachable', status: 'passed', duration: 67 },
              ]}
              title="Stripe Integration Check"
            />
          </div>
          <div style={{ maxInlineSize: 480 }}>
            <Component
              steps={[
                { id: 'dns', label: 'Resolve smtp.mailgun.com', status: 'passed', duration: 12 },
                { id: 'tcp', label: 'TCP connect :587', status: 'passed', duration: 45 },
                { id: 'tls', label: 'STARTTLS negotiation', status: 'failed', message: 'Certificate chain verification failed: self-signed certificate' },
                { id: 'auth', label: 'SMTP AUTH LOGIN', status: 'skipped' },
                { id: 'send', label: 'Test email delivery', status: 'skipped' },
              ]}
              title="Email Delivery Check"
              onRetry={() => console.log('retry email check')}
            />
          </div>
        </div>
      </section>

      {/* Cancel Action */}
      <section className="connection-test-panel-page__section" id="cancel">
        <h2 className="connection-test-panel-page__section-title"><a href="#cancel">Cancel Action</a></h2>
        <p className="connection-test-panel-page__section-desc">
          When running is true and onCancel is provided, a cancel button appears in the header.
          This allows users to abort long-running connectivity tests.
        </p>
        <div className="connection-test-panel-page__preview">
          <Component
            steps={[
              { id: 'dns', label: 'DNS Resolution', status: 'passed', duration: 11 },
              { id: 'tcp', label: 'TCP Handshake', status: 'running' },
              { id: 'tls', label: 'TLS Negotiation', status: 'pending' },
              { id: 'auth', label: 'Authentication', status: 'pending' },
              { id: 'data', label: 'Data Transfer Test', status: 'pending' },
            ]}
            title="VPN Tunnel Check"
            running
            onCancel={() => console.log('cancelled')}
          />
        </div>
      </section>

      {/* Props Table */}
      <section className="connection-test-panel-page__section" id="props">
        <h2 className="connection-test-panel-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={propDefs} />
      </section>

      {/* Accessibility */}
      <section className="connection-test-panel-page__section" id="accessibility">
        <h2 className="connection-test-panel-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <ul className="connection-test-panel-page__a11y-list">
          <li className="connection-test-panel-page__a11y-item"><Icon name="check" size="sm" className="connection-test-panel-page__a11y-icon" />Step list uses ordered list semantics</li>
          <li className="connection-test-panel-page__a11y-item"><Icon name="check" size="sm" className="connection-test-panel-page__a11y-icon" />Status changes announced via aria-live region</li>
          <li className="connection-test-panel-page__a11y-item"><Icon name="check" size="sm" className="connection-test-panel-page__a11y-icon" />Error messages linked to failed steps</li>
          <li className="connection-test-panel-page__a11y-item"><Icon name="check" size="sm" className="connection-test-panel-page__a11y-icon" />Respects prefers-reduced-motion for running spinner</li>
        </ul>
      </section>

      {/* Source */}
      <section className="connection-test-panel-page__section" id="source">
        <h2 className="connection-test-panel-page__section-title"><a href="#source">Source</a></h2>
        <a className="connection-test-panel-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/connection-test-panel.tsx" target="_blank" rel="noopener noreferrer">
          <Icon name="code" size="sm" />View source on GitHub
        </a>
      </section>
    </div>
  )
}
