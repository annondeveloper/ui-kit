'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { LogViewer, type LogLine } from '@ui/domain/log-viewer'
import { LogViewer as LiteLogViewer } from '@ui/lite/log-viewer'
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
    @scope (.log-viewer-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: log-viewer-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .log-viewer-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .log-viewer-page__hero::before {
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
        animation: lv-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes lv-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .log-viewer-page__hero::before { animation: none; }
      }

      .log-viewer-page__title {
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

      .log-viewer-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .log-viewer-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .log-viewer-page__import-code {
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

      .log-viewer-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .log-viewer-page__section {
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
        animation: lv-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes lv-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .log-viewer-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .log-viewer-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .log-viewer-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .log-viewer-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .log-viewer-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .log-viewer-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .log-viewer-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .log-viewer-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .log-viewer-page__preview--full {
        padding: 1rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .log-viewer-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container log-viewer-page (max-width: 680px) {
        .log-viewer-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .log-viewer-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .log-viewer-page__playground-result {
        min-block-size: 200px;
        padding: 1rem;
        background: var(--bg-surface);
        border-radius: var(--radius-md);
        position: relative;
        overflow-x: auto;
        overflow-y: auto;
      }

      .log-viewer-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .log-viewer-page__playground-controls {
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

      .log-viewer-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .log-viewer-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .log-viewer-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .log-viewer-page__option-btn {
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
      .log-viewer-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .log-viewer-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .log-viewer-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .log-viewer-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .log-viewer-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .log-viewer-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .log-viewer-page__tier-card {
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

      .log-viewer-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .log-viewer-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .log-viewer-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .log-viewer-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .log-viewer-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .log-viewer-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .log-viewer-page__tier-import {
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

      .log-viewer-page__tier-preview {
        max-height: 120px;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      .log-viewer-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .log-viewer-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .log-viewer-page__code-tabs {
        margin-block-start: 1rem;
      }

      .log-viewer-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .log-viewer-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .log-viewer-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .log-viewer-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .log-viewer-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .log-viewer-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .log-viewer-page__hero { padding: 2rem 1.25rem; }
        .log-viewer-page__title { font-size: 1.75rem; }
        .log-viewer-page__preview { padding: 1.25rem; }
        .log-viewer-page__playground { grid-template-columns: 1fr; }
        .log-viewer-page__tiers { grid-template-columns: 1fr; }
        .log-viewer-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .log-viewer-page__hero { padding: 1.5rem 1rem; }
        .log-viewer-page__title { font-size: 1.5rem; }
        .log-viewer-page__preview { padding: 0.75rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .log-viewer-page__import-code,
      .log-viewer-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const logViewerProps: PropDef[] = [
  { name: 'lines', type: 'LogLine[]', required: true, description: 'Array of log line objects to display. Each has id, message, optional timestamp and level.' },
  { name: 'maxLines', type: 'number', description: 'Maximum number of lines to display. Shows the last N lines when exceeded.' },
  { name: 'autoTail', type: 'boolean', default: 'false', description: 'Auto-scroll to the bottom when new lines are appended.' },
  { name: 'showTimestamp', type: 'boolean', default: 'false', description: 'Show formatted timestamps for each line (standard tier only).' },
  { name: 'showLevel', type: 'boolean', default: 'false', description: 'Show color-coded log level badges (standard tier only).' },
  { name: 'search', type: 'string', description: 'Highlight matching text in log messages with a <mark> element (standard tier only).' },
  { name: 'filterLevel', type: 'string[]', description: 'Filter visible lines by log level (standard tier only).' },
  { name: 'wrap', type: 'boolean', default: 'false', description: 'Enable word wrapping for long log lines (standard tier only).' },
  { name: 'height', type: 'string', description: 'Fixed height for the scroll container. Enables virtual scrolling for 100+ lines.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override (standard tier only).' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

const BASE_TIME = Date.now() - 60000

function makeSampleLines(): LogLine[] {
  return [
    { id: 1, timestamp: BASE_TIME, level: 'info', message: 'Server started on port 3000' },
    { id: 2, timestamp: BASE_TIME + 1200, level: 'debug', message: 'Loading configuration from /etc/app/config.yaml' },
    { id: 3, timestamp: BASE_TIME + 2500, level: 'info', message: 'Database connection established (pool: 10, idle: 5)' },
    { id: 4, timestamp: BASE_TIME + 3800, level: 'info', message: 'Redis cache connected at redis://localhost:6379' },
    { id: 5, timestamp: BASE_TIME + 5100, level: 'warn', message: 'Rate limiter bucket overflow detected for IP 192.168.1.42' },
    { id: 6, timestamp: BASE_TIME + 6500, level: 'info', message: 'GET /api/health 200 OK (12ms)' },
    { id: 7, timestamp: BASE_TIME + 8200, level: 'info', message: 'POST /api/users 201 Created (45ms)' },
    { id: 8, timestamp: BASE_TIME + 9900, level: 'error', message: 'ECONNREFUSED: Connection to payment service at https://pay.example.com failed' },
    { id: 9, timestamp: BASE_TIME + 11000, level: 'warn', message: 'Retry attempt 1/3 for payment service connection' },
    { id: 10, timestamp: BASE_TIME + 12500, level: 'info', message: 'Payment service reconnected successfully' },
    { id: 11, timestamp: BASE_TIME + 14000, level: 'debug', message: 'Cache hit ratio: 87.3% (hits: 1247, misses: 182)' },
    { id: 12, timestamp: BASE_TIME + 15300, level: 'info', message: 'GET /api/products?page=1&limit=20 200 OK (8ms)' },
    { id: 13, timestamp: BASE_TIME + 16800, level: 'error', message: 'Unhandled promise rejection in worker thread #3: TypeError: Cannot read property of undefined' },
    { id: 14, timestamp: BASE_TIME + 18200, level: 'info', message: 'Worker thread #3 restarted automatically' },
    { id: 15, timestamp: BASE_TIME + 19500, level: 'info', message: 'Scheduled job "cleanup-temp" completed in 234ms (deleted 47 files)' },
  ]
}

const SAMPLE_LINES = makeSampleLines()
const SHORT_LINES: LogLine[] = SAMPLE_LINES.slice(0, 5)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { LogViewer } from '@annondeveloper/ui-kit/lite'",
  standard: "import { LogViewer } from '@annondeveloper/ui-kit'",
  premium: "import { LogViewer } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="log-viewer-page__copy-btn"
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

function OptionGroup<T extends string>({
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
    <div className="log-viewer-page__control-group">
      <span className="log-viewer-page__control-label">{label}</span>
      <div className="log-viewer-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`log-viewer-page__option-btn${opt === value ? ' log-viewer-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="log-viewer-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  showTimestamp: boolean,
  showLevel: boolean,
  autoTail: boolean,
  wrap: boolean,
  search: string,
  height: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const typeImport = tier !== 'lite' ? "\nimport type { LogLine } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = ['  lines={logs}']
  if (height) props.push(`  height="${height}"`)
  if (tier !== 'lite') {
    if (showTimestamp) props.push('  showTimestamp')
    if (showLevel) props.push('  showLevel')
    if (autoTail) props.push('  autoTail')
    if (wrap) props.push('  wrap')
    if (search) props.push(`  search="${search}"`)
  }

  return `${importStr}${typeImport}

const logs = [
  { id: 1, timestamp: Date.now(), level: 'info', message: 'Server started' },
  { id: 2, timestamp: Date.now(), level: 'warn', message: 'Rate limit exceeded' },
  { id: 3, timestamp: Date.now(), level: 'error', message: 'Connection failed' },
]

<LogViewer
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier): string {
  return `<!-- LogViewer — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/log-viewer.css">

<div class="${tier === 'lite' ? 'ui-lite-log-viewer' : 'ui-log-viewer'}" role="log">
  <div class="${tier === 'lite' ? '' : 'ui-log-viewer__scroll'}" style="height: 300px">
    <div class="${tier === 'lite' ? 'ui-lite-log-viewer__line' : 'ui-log-viewer__line'}" data-line-level="info">
      <span class="${tier === 'lite' ? 'ui-lite-log-viewer__level' : 'ui-log-viewer__level'}" data-level="info">INFO</span>
      <span class="${tier === 'lite' ? 'ui-lite-log-viewer__msg' : 'ui-log-viewer__message'}">Server started on port 3000</span>
    </div>
    <!-- more lines... -->
  </div>
</div>`
}

function generateVueCode(tier: Tier, showTimestamp: boolean, showLevel: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <LogViewer :lines="logs" max-height="300px" />
</template>

<script setup>
import { LogViewer } from '@annondeveloper/ui-kit/lite'
import { ref } from 'vue'

const logs = ref([
  { id: 1, message: 'Server started' },
  { id: 2, level: 'warn', message: 'Rate limit exceeded' },
])
</script>`
  }
  return `<template>
  <LogViewer
    :lines="logs"
    height="300px"
    ${showTimestamp ? 'show-timestamp' : ''}
    ${showLevel ? 'show-level' : ''}
  />
</template>

<script setup>
import { LogViewer } from '@annondeveloper/ui-kit'
import { ref } from 'vue'

const logs = ref([
  { id: 1, timestamp: Date.now(), level: 'info', message: 'Server started' },
])
</script>`
}

function generateAngularCode(tier: Tier): string {
  return `<!-- Angular — ${tier} tier (CSS-only approach) -->
<div class="${tier === 'lite' ? 'ui-lite-log-viewer' : 'ui-log-viewer'}" role="log"
     style="max-height: 300px; overflow: auto">
  <div *ngFor="let line of logs"
       class="${tier === 'lite' ? 'ui-lite-log-viewer__line' : 'ui-log-viewer__line'}"
       [attr.data-line-level]="line.level">
    <span *ngIf="line.level"
          class="${tier === 'lite' ? 'ui-lite-log-viewer__level' : 'ui-log-viewer__level'}"
          [attr.data-level]="line.level">
      {{ line.level | uppercase }}
    </span>
    <span class="${tier === 'lite' ? 'ui-lite-log-viewer__msg' : 'ui-log-viewer__message'}">
      {{ line.message }}
    </span>
  </div>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/log-viewer.css'}';`
}

function generateSvelteCode(tier: Tier, showTimestamp: boolean, showLevel: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { LogViewer } from '@annondeveloper/ui-kit/lite';
  let logs = [
    { id: 1, message: 'Server started' },
    { id: 2, level: 'error', message: 'Connection failed' },
  ];
</script>

<LogViewer lines={logs} maxHeight="300px" />`
  }
  return `<script>
  import { LogViewer } from '@annondeveloper/ui-kit';
  let logs = [
    { id: 1, timestamp: Date.now(), level: 'info', message: 'Server started' },
  ];
</script>

<LogViewer
  lines={logs}
  height="300px"
  ${showTimestamp ? 'showTimestamp' : ''}
  ${showLevel ? 'showLevel' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [showTimestamp, setShowTimestamp] = useState(true)
  const [showLevel, setShowLevel] = useState(true)
  const [autoTail, setAutoTail] = useState(false)
  const [wrap, setWrap] = useState(false)
  const [search, setSearch] = useState('')
  const [height] = useState('300px')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [lines, setLines] = useState<LogLine[]>(SAMPLE_LINES)

  const reactCode = useMemo(() => generateReactCode(tier, showTimestamp, showLevel, autoTail, wrap, search, height), [tier, showTimestamp, showLevel, autoTail, wrap, search, height])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, showTimestamp, showLevel), [tier, showTimestamp, showLevel])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showTimestamp, showLevel), [tier, showTimestamp, showLevel])

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

  const addLogLine = useCallback(() => {
    const levels: LogLine['level'][] = ['debug', 'info', 'warn', 'error']
    const messages = [
      'GET /api/users 200 OK (14ms)',
      'Cache miss for key user:session:abc123',
      'Memory usage: 72.4% (1.2GB / 1.6GB)',
      'WebSocket connection established from 10.0.0.15',
      'Background job processed: email-notifications (batch: 50)',
    ]
    const newLine: LogLine = {
      id: Date.now(),
      timestamp: Date.now(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
    }
    setLines(prev => [...prev, newLine])
  }, [])

  return (
    <section className="log-viewer-page__section" id="playground">
      <h2 className="log-viewer-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="log-viewer-page__section-desc">
        Tweak every prop and see the result in real-time. Add live log lines to test auto-tail scrolling.
      </p>

      <div className="log-viewer-page__playground">
        <div className="log-viewer-page__playground-preview">
          <div className="log-viewer-page__playground-result">
            {tier === 'lite' ? (
              <LiteLogViewer lines={lines} maxHeight={height} />
            ) : (
              <LogViewer
                lines={lines}
                height={height}
                showTimestamp={showTimestamp}
                showLevel={showLevel}
                autoTail={autoTail}
                wrap={wrap}
                search={search || undefined}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button size="xs" variant="secondary" onClick={addLogLine} icon={<Icon name="plus" size="sm" />}>
              Add Log Line
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setLines(SAMPLE_LINES)} icon={<Icon name="refresh" size="sm" />}>
              Reset
            </Button>
          </div>

          <div className="log-viewer-page__code-tabs">
            <div className="log-viewer-page__export-row">
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
              {copyStatus && <span className="log-viewer-page__export-status">{copyStatus}</span>}
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

        <div className="log-viewer-page__playground-controls">
          {tier !== 'lite' && (
            <>
              <div className="log-viewer-page__control-group">
                <span className="log-viewer-page__control-label">Toggles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Toggle label="Show timestamps" checked={showTimestamp} onChange={setShowTimestamp} />
                  <Toggle label="Show levels" checked={showLevel} onChange={setShowLevel} />
                  <Toggle label="Auto-tail" checked={autoTail} onChange={setAutoTail} />
                  <Toggle label="Word wrap" checked={wrap} onChange={setWrap} />
                </div>
              </div>
              <div className="log-viewer-page__control-group">
                <span className="log-viewer-page__control-label">Search</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="log-viewer-page__text-input"
                  placeholder="Filter text..."
                />
              </div>
            </>
          )}
          <div className="log-viewer-page__control-group">
            <span className="log-viewer-page__control-label">Actions</span>
            <Button size="xs" variant="secondary" onClick={addLogLine}>
              Stream Log Line
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogViewerPage() {
  useStyles('log-viewer-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.log-viewer-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="log-viewer-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="log-viewer-page__hero">
        <h1 className="log-viewer-page__title">LogViewer</h1>
        <p className="log-viewer-page__desc">
          Real-time log stream viewer with virtual scrolling, level filtering, search highlighting,
          timestamps, and auto-tail. Ideal for monitoring dashboards and debugging interfaces.
        </p>
        <div className="log-viewer-page__import-row">
          <code className="log-viewer-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Log Levels ──────────────────────────────── */}
      <section className="log-viewer-page__section" id="levels">
        <h2 className="log-viewer-page__section-title">
          <a href="#levels">Log Levels</a>
        </h2>
        <p className="log-viewer-page__section-desc">
          Four built-in log levels with color-coded badges and subtle background tinting for errors and warnings.
        </p>
        <div className="log-viewer-page__preview log-viewer-page__preview--col log-viewer-page__preview--full">
          {tier === 'lite' ? (
            <LiteLogViewer
              lines={[
                { id: 'd1', level: 'debug', message: 'Verbose debug output for detailed tracing' },
                { id: 'i1', level: 'info', message: 'Informational message about normal operation' },
                { id: 'w1', level: 'warn', message: 'Warning — something unexpected but recoverable' },
                { id: 'e1', level: 'error', message: 'Error — operation failed and requires attention' },
              ]}
              maxHeight="200px"
            />
          ) : (
            <LogViewer
              lines={[
                { id: 'd1', level: 'debug', message: 'Verbose debug output for detailed tracing' },
                { id: 'i1', level: 'info', message: 'Informational message about normal operation' },
                { id: 'w1', level: 'warn', message: 'Warning — something unexpected but recoverable' },
                { id: 'e1', level: 'error', message: 'Error — operation failed and requires attention' },
              ]}
              showLevel
              height="200px"
            />
          )}
        </div>
      </section>

      {/* ── 4. Search Highlighting ─────────────────────── */}
      {tier !== 'lite' && (
        <section className="log-viewer-page__section" id="search">
          <h2 className="log-viewer-page__section-title">
            <a href="#search">Search Highlighting</a>
          </h2>
          <p className="log-viewer-page__section-desc">
            Use the <code>search</code> prop to highlight matching text across all log messages.
            The search is case-insensitive and escapes special regex characters.
          </p>
          <div className="log-viewer-page__preview log-viewer-page__preview--col log-viewer-page__preview--full">
            <LogViewer
              lines={SAMPLE_LINES}
              showLevel
              showTimestamp
              search="connection"
              height="250px"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<LogViewer\n  lines={logs}\n  search="connection"\n  showLevel\n  showTimestamp\n  height="300px"\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 5. Auto-tail Streaming ─────────────────────── */}
      {tier !== 'lite' && (
        <section className="log-viewer-page__section" id="auto-tail">
          <h2 className="log-viewer-page__section-title">
            <a href="#auto-tail">Auto-tail Streaming</a>
          </h2>
          <p className="log-viewer-page__section-desc">
            Enable <code>autoTail</code> to automatically scroll to the latest entry when new lines are appended.
            The component uses <code>aria-live="polite"</code> to announce new content to screen readers.
          </p>
          <div className="log-viewer-page__preview log-viewer-page__preview--col log-viewer-page__preview--full">
            <AutoTailDemo />
          </div>
        </section>
      )}

      {/* ── 6. Virtual Scrolling ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="log-viewer-page__section" id="virtual-scroll">
          <h2 className="log-viewer-page__section-title">
            <a href="#virtual-scroll">Virtual Scrolling</a>
          </h2>
          <p className="log-viewer-page__section-desc">
            When a fixed <code>height</code> is set and there are 100+ lines, LogViewer automatically
            switches to virtual scrolling. Only visible lines are rendered, keeping DOM size constant.
          </p>
          <div className="log-viewer-page__preview log-viewer-page__preview--col log-viewer-page__preview--full">
            <LogViewer
              lines={Array.from({ length: 500 }, (_, i) => ({
                id: i,
                timestamp: BASE_TIME + i * 200,
                level: (['debug', 'info', 'info', 'warn', 'error'] as const)[i % 5],
                message: `Log entry ${i + 1}: Processing request ${Math.random().toString(36).slice(2, 10)}`,
              }))}
              showLevel
              showTimestamp
              height="250px"
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
            500 lines rendered above — scroll to verify smooth performance with virtual windowing.
          </p>
        </section>
      )}

      {/* ── 7. Word Wrap ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="log-viewer-page__section" id="wrap">
          <h2 className="log-viewer-page__section-title">
            <a href="#wrap">Word Wrap</a>
          </h2>
          <p className="log-viewer-page__section-desc">
            Long log lines are nowrap by default (horizontal scrolling). Enable <code>wrap</code> for
            pre-wrap behavior that breaks at any character boundary.
          </p>
          <div className="log-viewer-page__preview log-viewer-page__preview--col log-viewer-page__preview--full">
            <LogViewer
              lines={[
                { id: 1, level: 'error', message: 'Error: Failed to process request at /api/v2/users/search?query=something+very+long&page=1&limit=50&sort=created_at&order=desc&fields=id,name,email,avatar,role,created_at,updated_at&include=permissions,teams,projects' },
                { id: 2, level: 'info', message: 'Stack trace: at processRequest (/app/src/handlers/users.ts:142:15) -> at validateInput (/app/src/middleware/validation.ts:87:22) -> at authenticate (/app/src/middleware/auth.ts:45:10)' },
              ]}
              showLevel
              wrap
              height="150px"
            />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="log-viewer-page__section" id="tiers">
        <h2 className="log-viewer-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="log-viewer-page__section-desc">
          Choose between a minimal Lite tier and the full-featured Standard tier.
          Both render the same visual output; Standard adds interactivity and virtual scrolling.
        </p>

        <div className="log-viewer-page__tiers">
          {/* Lite */}
          <div
            className={`log-viewer-page__tier-card${tier === 'lite' ? ' log-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="log-viewer-page__tier-header">
              <span className="log-viewer-page__tier-name">Lite</span>
              <span className="log-viewer-page__tier-size">~0.3 KB</span>
            </div>
            <p className="log-viewer-page__tier-desc">
              Simple pre-formatted log display. No virtual scrolling, no search,
              no filtering. Just lines in a scrollable container.
            </p>
            <div className="log-viewer-page__tier-import">
              import {'{'} LogViewer {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="log-viewer-page__tier-preview">
              <LiteLogViewer lines={SHORT_LINES} maxHeight="100px" />
            </div>
            <div className="log-viewer-page__size-breakdown">
              <div className="log-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`log-viewer-page__tier-card${tier === 'standard' ? ' log-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="log-viewer-page__tier-header">
              <span className="log-viewer-page__tier-name">Standard</span>
              <span className="log-viewer-page__tier-size">~2.5 KB</span>
            </div>
            <p className="log-viewer-page__tier-desc">
              Full-featured log viewer with virtual scrolling, search highlighting,
              level filtering, timestamps, auto-tail, and word wrap.
            </p>
            <div className="log-viewer-page__tier-import">
              import {'{'} LogViewer {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="log-viewer-page__tier-preview">
              <LogViewer lines={SHORT_LINES} showLevel showTimestamp height="100px" />
            </div>
            <div className="log-viewer-page__size-breakdown">
              <div className="log-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`log-viewer-page__tier-card${tier === 'premium' ? ' log-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="log-viewer-page__tier-header">
              <span className="log-viewer-page__tier-name">Premium</span>
              <span className="log-viewer-page__tier-size">~3-5 KB</span>
            </div>
            <p className="log-viewer-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="log-viewer-page__tier-import">
              import {'{'} LogViewer {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="log-viewer-page__tier-preview">
              <LogViewer lines={SHORT_LINES} showLevel showTimestamp height="100px" />
            </div>
            <div className="log-viewer-page__size-breakdown">
              <div className="log-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="log-viewer-page__section" id="props">
        <h2 className="log-viewer-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="log-viewer-page__section-desc">
          All props accepted by LogViewer. It also spreads any native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={logViewerProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="log-viewer-page__section" id="accessibility">
        <h2 className="log-viewer-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="log-viewer-page__section-desc">
          Built with semantic markup and live region support for screen readers.
        </p>
        <Card variant="default" padding="md">
          <ul className="log-viewer-page__a11y-list">
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA role:</strong> Uses <code className="log-viewer-page__a11y-key">role="log"</code> to identify the component as a log viewer.
              </span>
            </li>
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> When <code className="log-viewer-page__a11y-key">autoTail</code> is enabled, uses <code className="log-viewer-page__a11y-key">aria-live="polite"</code> to announce new entries.
              </span>
            </li>
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Monospace font:</strong> Uses system monospace font stack for consistent character alignment.
              </span>
            </li>
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Search highlighting:</strong> Uses semantic <code className="log-viewer-page__a11y-key">&lt;mark&gt;</code> element for search matches.
              </span>
            </li>
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="log-viewer-page__a11y-key">forced-colors: active</code> with visible borders and highlight colors.
              </span>
            </li>
            <li className="log-viewer-page__a11y-item">
              <span className="log-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independence:</strong> Log levels use both color and text labels — never color alone.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Auto-tail Demo Component ────────────────────────────────────────────────

function AutoTailDemo() {
  const [lines, setLines] = useState<LogLine[]>(SAMPLE_LINES.slice(0, 5))

  useEffect(() => {
    const messages = [
      'Heartbeat check: all services healthy',
      'GET /api/metrics 200 OK (3ms)',
      'Cache eviction: removed 12 stale entries',
      'New WebSocket connection from client-7a8b',
      'Background sync completed for 3 accounts',
      'Query optimization applied: 45% improvement',
      'SSL certificate renewal: 28 days remaining',
      'Rate limit reset for IP pool 10.0.0.0/24',
    ]
    const levels: LogLine['level'][] = ['info', 'debug', 'info', 'warn', 'info', 'debug', 'info', 'info']

    let idx = 0
    const interval = setInterval(() => {
      setLines(prev => [
        ...prev,
        {
          id: Date.now(),
          timestamp: Date.now(),
          level: levels[idx % levels.length],
          message: messages[idx % messages.length],
        },
      ])
      idx++
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <LogViewer
      lines={lines}
      showLevel
      showTimestamp
      autoTail
      height="200px"
    />
  )
}
