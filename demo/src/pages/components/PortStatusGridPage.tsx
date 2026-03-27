'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PortStatusGrid, type PortStatus } from '@ui/domain/port-status-grid'
import { PortStatusGrid as LitePortStatusGrid } from '@ui/lite/port-status-grid'
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
    @scope (.psg-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: psg-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .psg-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .psg-page__hero::before {
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
        animation: psg-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes psg-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .psg-page__hero::before { animation: none; }
      }

      .psg-page__title {
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

      .psg-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .psg-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .psg-page__import-code {
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

      .psg-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .psg-page__section {
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
        animation: psg-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes psg-section-reveal {
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
        .psg-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .psg-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .psg-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .psg-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .psg-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .psg-page__preview {
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

      .psg-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .psg-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .psg-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container psg-page (max-width: 680px) {
        .psg-page__playground {
          grid-template-columns: 1fr;
        }
        .psg-page__playground-controls {
          position: static !important;
        }
      }

      .psg-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .psg-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .psg-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .psg-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .psg-page__playground-controls {
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

      .psg-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .psg-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .psg-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .psg-page__option-btn {
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
      .psg-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .psg-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .psg-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .psg-page__code-tabs {
        margin-block-start: 1rem;
      }

      .psg-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .psg-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Event log ──────────────────────────────────── */

      .psg-page__event-log {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.75rem;
        max-block-size: 120px;
        overflow-y: auto;
        line-height: 1.6;
      }

      /* ── Labeled row ────────────────────────────────── */

      .psg-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .psg-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .psg-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .psg-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .psg-page__tier-card {
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

      .psg-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .psg-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .psg-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .psg-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .psg-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .psg-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .psg-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .psg-page__tier-import {
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

      .psg-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .psg-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .psg-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .psg-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .psg-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .psg-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .psg-page__a11y-key {
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
        .psg-page__hero { padding: 2rem 1.25rem; }
        .psg-page__title { font-size: 1.75rem; }
        .psg-page__preview { padding: 1.75rem; }
        .psg-page__playground { grid-template-columns: 1fr; }
        .psg-page__playground-controls { position: static !important; }
        .psg-page__tiers { grid-template-columns: 1fr; }
        .psg-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .psg-page__hero { padding: 1.5rem 1rem; }
        .psg-page__title { font-size: 1.5rem; }
        .psg-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .psg-page__import-code,
      .psg-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const psgProps: PropDef[] = [
  { name: 'ports', type: 'PortStatus[]', description: 'Array of port objects with port number, status, and optional label.' },
  { name: 'columns', type: 'number', default: '8', description: 'Number of columns in the grid layout.' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Grid cell size controlling padding and font size.' },
  { name: 'onPortClick', type: '(port: number) => void', description: 'Callback when a port cell is clicked. Renders ports as buttons when set.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls hover scale transition.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

type PortStatusType = 'ok' | 'warning' | 'critical' | 'unknown'

function generatePorts(count: number, seed = 0): PortStatus[] {
  const statuses: PortStatusType[] = ['ok', 'warning', 'critical', 'unknown']
  const labels: Record<number, string> = {
    22: 'SSH',
    80: 'HTTP',
    443: 'HTTPS',
    3306: 'MySQL',
    5432: 'PostgreSQL',
    6379: 'Redis',
    8080: 'Alt HTTP',
    8443: 'Alt HTTPS',
    27017: 'MongoDB',
    9200: 'Elasticsearch',
  }
  return Array.from({ length: count }, (_, i) => {
    const port = seed + i + 1
    const statusIndex = (port * 7 + 3) % statuses.length
    return {
      port: labels[port] ? port : port,
      status: statusIndex === 0 ? 'ok' : statusIndex === 1 ? 'ok' : statusIndex === 2 ? 'warning' : statusIndex === 3 ? 'critical' : 'unknown',
      label: labels[port],
    }
  })
}

const COMMON_PORTS: PortStatus[] = [
  { port: 22, status: 'ok', label: 'SSH' },
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
  { port: 3306, status: 'warning', label: 'MySQL' },
  { port: 5432, status: 'ok', label: 'PostgreSQL' },
  { port: 6379, status: 'critical', label: 'Redis' },
  { port: 8080, status: 'ok', label: 'Alt HTTP' },
  { port: 8443, status: 'unknown', label: 'Alt HTTPS' },
  { port: 9200, status: 'ok', label: 'Elasticsearch' },
  { port: 27017, status: 'warning', label: 'MongoDB' },
  { port: 5672, status: 'ok', label: 'RabbitMQ' },
  { port: 11211, status: 'ok', label: 'Memcached' },
  { port: 2181, status: 'critical', label: 'Zookeeper' },
  { port: 9092, status: 'ok', label: 'Kafka' },
  { port: 3000, status: 'ok', label: 'Dev Server' },
  { port: 4000, status: 'unknown', label: 'GraphQL' },
]

const DENSE_PORTS: PortStatus[] = Array.from({ length: 48 }, (_, i) => ({
  port: i + 1,
  status: (['ok', 'ok', 'ok', 'warning', 'critical', 'unknown'] as PortStatusType[])[i % 6],
  label: i < 3 ? ['FTP', 'SSH', 'Telnet'][i] : undefined,
}))

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PortStatusGrid } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PortStatusGrid } from '@annondeveloper/ui-kit'",
  premium: "import { PortStatusGrid } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="psg-page__copy-btn"
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
    <div className="psg-page__control-group">
      <span className="psg-page__control-label">{label}</span>
      <div className="psg-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`psg-page__option-btn${opt === value ? ' psg-page__option-btn--active' : ''}`}
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
    <label className="psg-page__toggle-label">
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
  columns: number,
  size: 'sm' | 'md',
  interactive: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  ports={ports}')
  if (columns !== 8) props.push(`  columns={${columns}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (interactive) props.push('  onPortClick={(port) => console.log(`Clicked port ${port}`)}}')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}
import type { PortStatus } from '@annondeveloper/ui-kit'

const ports: PortStatus[] = [
  { port: 22, status: 'ok', label: 'SSH' },
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
  { port: 3306, status: 'warning', label: 'MySQL' },
  { port: 6379, status: 'critical', label: 'Redis' },
  { port: 8443, status: 'unknown', label: 'Alt HTTPS' },
]

<PortStatusGrid
${props.join('\n')}
/>`
}

function generateHtmlCode(columns: number, size: 'sm' | 'md'): string {
  return `<!-- PortStatusGrid — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/port-status-grid.css">

<div class="ui-port-status-grid" data-size="${size}">
  <div class="ui-port-status-grid__grid" style="--columns: ${columns}">
    <div class="ui-port-status-grid__item" data-status="ok">22</div>
    <div class="ui-port-status-grid__item" data-status="ok">80</div>
    <div class="ui-port-status-grid__item" data-status="ok">443</div>
    <div class="ui-port-status-grid__item" data-status="warning">3306</div>
    <div class="ui-port-status-grid__item" data-status="critical">6379</div>
    <div class="ui-port-status-grid__item" data-status="unknown">8443</div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, columns: number, size: 'sm' | 'md', interactive: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :ports="ports"']
  if (columns !== 8) attrs.push(`  :columns="${columns}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (interactive) attrs.push('  @port-click="handlePortClick"')

  return `<template>
  <PortStatusGrid
${attrs.join('\n')}
  />
</template>

<script setup>
import { PortStatusGrid } from '${importPath}'
import { ref } from 'vue'

const ports = ref([
  { port: 22, status: 'ok', label: 'SSH' },
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
  { port: 3306, status: 'warning', label: 'MySQL' },
])

const handlePortClick = (port) => {
  console.log('Clicked port:', port)
}
</script>`
}

function generateAngularCode(tier: Tier, columns: number, size: 'sm' | 'md', interactive: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<ui-port-status-grid
  [ports]="ports"
  ${columns !== 8 ? `[columns]="${columns}"` : ''}
  size="${size}"
  ${interactive ? '(portClick)="onPortClick($event)"' : ''}
></ui-port-status-grid>

/* Import component CSS */
@import '${importPath}/css/components/port-status-grid.css';

// In component.ts
ports = [
  { port: 22, status: 'ok', label: 'SSH' },
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
];`
}

function generateSvelteCode(tier: Tier, columns: number, size: 'sm' | 'md', interactive: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['{ports}']
  if (columns !== 8) attrs.push(`columns={${columns}}`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (interactive) attrs.push('on:portClick={handleClick}')

  return `<script>
  import { PortStatusGrid } from '${importPath}';

  const ports = [
    { port: 22, status: 'ok', label: 'SSH' },
    { port: 80, status: 'ok', label: 'HTTP' },
    { port: 443, status: 'ok', label: 'HTTPS' },
    { port: 3306, status: 'warning', label: 'MySQL' },
  ];

  function handleClick(port) {
    console.log('Clicked port:', port);
  }
</script>

<PortStatusGrid
  ${attrs.join('\n  ')}
/>`
}

// ─── Playground Section ────────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [columns, setColumns] = useState(8)
  const [size, setSize] = useState<'sm' | 'md'>('md')
  const [interactive, setInteractive] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [clickLog, setClickLog] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const handlePortClick = useCallback((port: number) => {
    const portData = COMMON_PORTS.find(p => p.port === port)
    setClickLog(prev => [`Port ${port}${portData?.label ? ` (${portData.label})` : ''} clicked`, ...prev].slice(0, 10))
  }, [])

  const PortComponent = tier === 'lite' ? LitePortStatusGrid : PortStatusGrid

  const reactCode = useMemo(
    () => generateReactCode(tier, columns, size, interactive, motion),
    [tier, columns, size, interactive, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(columns, size),
    [columns, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, columns, size, interactive),
    [tier, columns, size, interactive],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, columns, size, interactive),
    [tier, columns, size, interactive],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, columns, size, interactive),
    [tier, columns, size, interactive],
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
    <section className="psg-page__section" id="playground">
      <h2 className="psg-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="psg-page__section-desc">
        Configure the grid props in real-time. Click on port cells to see interaction events logged below.
      </p>

      <div className="psg-page__playground">
        <div className="psg-page__playground-preview">
          <div className="psg-page__playground-result">
            {tier === 'lite' ? (
              <LitePortStatusGrid
                ports={COMMON_PORTS}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              />
            ) : (
              <PortStatusGrid
                ports={COMMON_PORTS}
                columns={columns}
                size={size}
                onPortClick={interactive ? handlePortClick : undefined}
                motion={motion}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              />
            )}
          </div>

          {interactive && clickLog.length > 0 && (
            <div className="psg-page__event-log">
              {clickLog.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}

          <div className="psg-page__code-tabs">
            <div className="psg-page__export-row">
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
              {copyStatus && <span className="psg-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
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

        <div className="psg-page__playground-controls">
          <OptionGroup
            label="Columns"
            options={['4', '6', '8', '10', '12'] as const}
            value={String(columns)}
            onChange={v => setColumns(Number(v))}
          />

          <OptionGroup label="Size" options={['sm', 'md'] as const} value={size} onChange={setSize} />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="psg-page__control-group">
            <span className="psg-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Interactive (clickable)" checked={interactive} onChange={setInteractive} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortStatusGridPage() {
  useStyles('psg-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.psg-page__section')
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
    <div className="psg-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="psg-page__hero">
        <h1 className="psg-page__title">PortStatusGrid</h1>
        <p className="psg-page__desc">
          Dense grid visualization for network port status monitoring. Shows port numbers in a configurable
          grid with OKLCH status colors, hover tooltips, click interactions, and responsive column layout.
        </p>
        <div className="psg-page__import-row">
          <code className="psg-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Status Colors ───────────────────────────── */}
      <section className="psg-page__section" id="statuses">
        <h2 className="psg-page__section-title">
          <a href="#statuses">Status Colors</a>
        </h2>
        <p className="psg-page__section-desc">
          Four status states with distinct OKLCH colors: ok (green), warning (amber), critical (red),
          and unknown (muted gray). Each cell gets a tinted background and matching border.
        </p>
        <div className="psg-page__preview psg-page__preview--col">
          <PortStatusGrid
            ports={[
              { port: 22, status: 'ok', label: 'SSH - Open' },
              { port: 80, status: 'ok', label: 'HTTP - Open' },
              { port: 443, status: 'ok', label: 'HTTPS - Open' },
              { port: 3306, status: 'warning', label: 'MySQL - Slow' },
              { port: 5432, status: 'warning', label: 'PG - Timeout' },
              { port: 6379, status: 'critical', label: 'Redis - Down' },
              { port: 8443, status: 'unknown', label: 'Unknown' },
              { port: 27017, status: 'unknown', label: 'No response' },
            ]}
            columns={4}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<PortStatusGrid
  ports={[
    { port: 22, status: 'ok', label: 'SSH - Open' },
    { port: 3306, status: 'warning', label: 'MySQL - Slow' },
    { port: 6379, status: 'critical', label: 'Redis - Down' },
    { port: 8443, status: 'unknown', label: 'Unknown' },
  ]}
  columns={4}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Column Layouts ──────────────────────────── */}
      <section className="psg-page__section" id="columns">
        <h2 className="psg-page__section-title">
          <a href="#columns">Column Layouts</a>
        </h2>
        <p className="psg-page__section-desc">
          The <code className="psg-page__a11y-key">columns</code> prop controls the grid layout. Use fewer
          columns for sparse data or more columns for dense port monitoring dashboards.
        </p>
        <div className="psg-page__preview psg-page__preview--col" style={{ gap: '2rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>4 columns</div>
            <PortStatusGrid ports={COMMON_PORTS.slice(0, 8)} columns={4} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>8 columns (default)</div>
            <PortStatusGrid ports={COMMON_PORTS} columns={8} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>12 columns</div>
            <PortStatusGrid ports={DENSE_PORTS.slice(0, 24)} columns={12} />
          </div>
        </div>
      </section>

      {/* ── 5. Size Variants ──────────────────────────── */}
      <section className="psg-page__section" id="sizes">
        <h2 className="psg-page__section-title">
          <a href="#sizes">Size Variants</a>
        </h2>
        <p className="psg-page__section-desc">
          Two size variants for different density requirements. Small is ideal for high-density monitoring
          dashboards, while medium provides comfortable spacing for interactive use.
        </p>
        <div className="psg-page__preview psg-page__preview--col" style={{ gap: '2rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>size="sm"</div>
            <PortStatusGrid ports={COMMON_PORTS.slice(0, 8)} columns={8} size="sm" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>size="md"</div>
            <PortStatusGrid ports={COMMON_PORTS.slice(0, 8)} columns={8} size="md" />
          </div>
        </div>
      </section>

      {/* ── 6. Dense Grid ─────────────────────────────── */}
      <section className="psg-page__section" id="dense">
        <h2 className="psg-page__section-title">
          <a href="#dense">Dense Port Monitoring</a>
        </h2>
        <p className="psg-page__section-desc">
          For monitoring many ports at once, combine small size with high column count. Hover over
          cells to see port labels in the tooltip. The grid handles 48+ ports efficiently.
        </p>
        <div className="psg-page__preview psg-page__preview--col">
          <PortStatusGrid
            ports={DENSE_PORTS}
            columns={12}
            size="sm"
            onPortClick={(port) => alert(`Port ${port}`)}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<PortStatusGrid
  ports={allPorts}   // 48 ports
  columns={12}
  size="sm"
  onPortClick={(port) => openPortDetails(port)}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Interactive Click ──────────────────────── */}
      <section className="psg-page__section" id="interactive">
        <h2 className="psg-page__section-title">
          <a href="#interactive">Interactive Click</a>
        </h2>
        <p className="psg-page__section-desc">
          When <code className="psg-page__a11y-key">onPortClick</code> is provided, port cells render as
          accessible buttons with focus-visible outlines. Click to see the callback in action.
        </p>
        <div className="psg-page__preview psg-page__preview--col">
          <PortStatusGrid
            ports={COMMON_PORTS.slice(0, 8)}
            columns={4}
            onPortClick={(port) => alert(`You clicked port ${port}`)}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<PortStatusGrid
  ports={ports}
  columns={4}
  onPortClick={(port) => {
    openPortDetails(port)
  }}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="psg-page__section" id="tiers">
        <h2 className="psg-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="psg-page__section-desc">
          PortStatusGrid ships in three tiers. Lite provides a flat CSS-only grid, Standard adds
          interactivity and tooltips, and Premium includes hover animations and entrance effects.
        </p>

        <div className="psg-page__tiers">
          {/* Lite */}
          <div
            className={`psg-page__tier-card${tier === 'lite' ? ' psg-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="psg-page__tier-header">
              <span className="psg-page__tier-name">Lite</span>
              <span className="psg-page__tier-size">~0.4 KB</span>
            </div>
            <p className="psg-page__tier-desc">
              CSS-only grid with static port numbers and status-colored backgrounds.
              No hover tooltips, no click handlers, no motion effects.
              Minimal JS wrapper with forwardRef.
            </p>
            <div className="psg-page__tier-import">
              import {'{'} PortStatusGrid {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="psg-page__tier-preview">
              <LitePortStatusGrid
                ports={COMMON_PORTS.slice(0, 6)}
              />
            </div>
            <div className="psg-page__size-breakdown">
              <div className="psg-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`psg-page__tier-card${tier === 'standard' ? ' psg-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="psg-page__tier-header">
              <span className="psg-page__tier-name">Standard</span>
              <span className="psg-page__tier-size">~2.1 KB</span>
            </div>
            <p className="psg-page__tier-desc">
              Full-featured grid with configurable columns, two sizes, hover tooltips,
              click handlers via accessible buttons, focus-visible outlines, and motion levels.
            </p>
            <div className="psg-page__tier-import">
              import {'{'} PortStatusGrid {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="psg-page__tier-preview">
              <PortStatusGrid
                ports={COMMON_PORTS.slice(0, 6)}
                columns={6}
                onPortClick={() => {}}
              />
            </div>
            <div className="psg-page__size-breakdown">
              <div className="psg-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`psg-page__tier-card${tier === 'premium' ? ' psg-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="psg-page__tier-header">
              <span className="psg-page__tier-name">Premium</span>
              <span className="psg-page__tier-size">~3.4 KB</span>
            </div>
            <p className="psg-page__tier-desc">
              Everything in Standard plus hover scale animation, staggered entrance,
              glow effect on critical ports, and smooth tooltip transitions.
            </p>
            <div className="psg-page__tier-import">
              import {'{'} PortStatusGrid {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="psg-page__tier-preview">
              <PortStatusGrid
                ports={COMMON_PORTS.slice(0, 6)}
                columns={6}
                onPortClick={() => {}}
                motion={3}
              />
            </div>
            <div className="psg-page__size-breakdown">
              <div className="psg-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="psg-page__section" id="props">
        <h2 className="psg-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="psg-page__section-desc">
          All props accepted by PortStatusGrid. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={psgProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="psg-page__section" id="accessibility">
        <h2 className="psg-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="psg-page__section-desc">
          Built with accessible patterns for interactive grid visualizations.
        </p>
        <Card variant="default" padding="md">
          <ul className="psg-page__a11y-list">
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> Container uses <code className="psg-page__a11y-key">role="group"</code> with
                <code className="psg-page__a11y-key">aria-label="Port status"</code> for screen reader context.
              </span>
            </li>
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Clickable ports:</strong> When <code className="psg-page__a11y-key">onPortClick</code> is set,
                ports render as <code className="psg-page__a11y-key">&lt;button&gt;</code> elements with descriptive aria-labels.
              </span>
            </li>
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Interactive ports have <code className="psg-page__a11y-key">:focus-visible</code> outlines
                with brand-colored 2px ring and offset.
              </span>
            </li>
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular numbers:</strong> Port numbers use <code className="psg-page__a11y-key">font-variant-numeric: tabular-nums</code> for
                consistent grid alignment.
              </span>
            </li>
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="psg-page__a11y-key">forced-colors: active</code> support
                with visible 2px borders and LinkText for critical ports.
              </span>
            </li>
            <li className="psg-page__a11y-item">
              <span className="psg-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltips:</strong> Hover tooltips display label and status information for ports with labels.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
