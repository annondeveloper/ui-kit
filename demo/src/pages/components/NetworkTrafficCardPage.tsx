'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NetworkTrafficCard, formatBitRate } from '@ui/domain/network-traffic-card'
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
    @scope (.ntc-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ntc-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .ntc-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ntc-page__hero::before {
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
        animation: ntc-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ntc-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ntc-page__hero::before { animation: none; }
      }

      .ntc-page__title {
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

      .ntc-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ntc-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ntc-page__import-code {
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

      .ntc-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .ntc-page__section {
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
        animation: ntc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ntc-section-reveal {
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
        .ntc-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .ntc-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .ntc-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .ntc-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ntc-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .ntc-page__preview {
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

      .ntc-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ntc-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .ntc-page__preview--grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .ntc-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container ntc-page (max-width: 680px) {
        .ntc-page__playground {
          grid-template-columns: 1fr;
        }
        .ntc-page__playground-controls {
          position: static !important;
        }
      }

      .ntc-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .ntc-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .ntc-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ntc-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .ntc-page__playground-controls {
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

      .ntc-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ntc-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ntc-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ntc-page__option-btn {
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
      .ntc-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ntc-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ntc-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ntc-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ntc-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .ntc-page__code-tabs {
        margin-block-start: 1rem;
      }

      .ntc-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .ntc-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── States grid ────────────────────────────────── */

      .ntc-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .ntc-page__state-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ntc-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .ntc-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .ntc-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .ntc-page__tier-card {
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

      .ntc-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ntc-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .ntc-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ntc-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ntc-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .ntc-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .ntc-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .ntc-page__tier-import {
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

      .ntc-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .ntc-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .ntc-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .ntc-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .ntc-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .ntc-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ntc-page__a11y-key {
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
        .ntc-page__hero { padding: 2rem 1.25rem; }
        .ntc-page__title { font-size: 1.75rem; }
        .ntc-page__preview { padding: 1.75rem; }
        .ntc-page__playground { grid-template-columns: 1fr; }
        .ntc-page__playground-controls { position: static !important; }
        .ntc-page__tiers { grid-template-columns: 1fr; }
        .ntc-page__section { padding: 1.25rem; }
        .ntc-page__states-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .ntc-page__hero { padding: 1.5rem 1rem; }
        .ntc-page__title { font-size: 1.5rem; }
        .ntc-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .ntc-page__import-code,
      .ntc-page code,
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

const ntcProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', description: 'Card header title. Usually the interface or device name.' },
  { name: 'vendor', type: 'string', description: 'Optional vendor or manufacturer name shown below the title.' },
  { name: 'location', type: 'string', description: 'Optional location string shown next to vendor with a separator.' },
  { name: 'traffic', type: 'TrafficData', description: 'Object with inbound and outbound bytes per second values.' },
  { name: 'trend', type: 'number[]', description: 'Historical data points rendered as a sparkline below the traffic rates.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'unknown'", description: 'Status indicator dot and left border accent color.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Compact mode with reduced padding and hidden sparkline.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls entrance animation and arrow pulse.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical' | 'unknown'
const STATUSES: Status[] = ['ok', 'warning', 'critical', 'unknown']

const SAMPLE_TREND = [120, 150, 130, 180, 200, 190, 220, 250, 230, 260, 240, 280, 310, 290, 320]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { NetworkTrafficCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { NetworkTrafficCard } from '@annondeveloper/ui-kit'",
  premium: "import { NetworkTrafficCard } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="ntc-page__copy-btn"
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
    <div className="ntc-page__control-group">
      <span className="ntc-page__control-label">{label}</span>
      <div className="ntc-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`ntc-page__option-btn${opt === value ? ' ntc-page__option-btn--active' : ''}`}
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
    <label className="ntc-page__toggle-label">
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
  title: string,
  status: Status,
  compact: boolean,
  showVendor: boolean,
  showTrend: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push(`  title="${title}"`)
  if (showVendor) {
    props.push('  vendor="Cisco"')
    props.push('  location="US-East"')
  }
  props.push('  traffic={{ inbound: 125000000, outbound: 87500000 }}')
  if (showTrend) props.push('  trend={[120, 150, 130, 180, 200, 190, 220, 250]}')
  if (status !== 'ok') props.push(`  status="${status}"`)
  else props.push('  status="ok"')
  if (compact) props.push('  compact')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

<NetworkTrafficCard
${props.join('\n')}
/>`
}

function generateHtmlCode(title: string, status: Status): string {
  return `<!-- NetworkTrafficCard — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/network-traffic-card.css">

<div class="ui-network-traffic-card" data-status="${status}">
  <div class="ui-network-traffic-card__header">
    <h3 class="ui-network-traffic-card__title">${title}</h3>
    <span class="ui-network-traffic-card__status" role="status"></span>
  </div>
  <div class="ui-network-traffic-card__vendor">
    <span>Cisco</span>
    <span class="ui-network-traffic-card__vendor-sep">/</span>
    <span>US-East</span>
  </div>
  <div class="ui-network-traffic-card__traffic">
    <div class="ui-network-traffic-card__direction">
      <span class="ui-network-traffic-card__label">Inbound</span>
      <span class="ui-network-traffic-card__rate">1.00 Gbps</span>
    </div>
    <div class="ui-network-traffic-card__direction">
      <span class="ui-network-traffic-card__label">Outbound</span>
      <span class="ui-network-traffic-card__rate">700.00 Mbps</span>
    </div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, title: string, status: Status, compact: boolean, showTrend: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    `  title="${title}"`,
    '  vendor="Cisco"',
    '  location="US-East"',
    '  :traffic="traffic"',
    `  status="${status}"`,
  ]
  if (showTrend) attrs.push('  :trend="trend"')
  if (compact) attrs.push('  compact')

  return `<template>
  <NetworkTrafficCard
${attrs.join('\n')}
  />
</template>

<script setup>
import { NetworkTrafficCard } from '${importPath}'
import { ref } from 'vue'

const traffic = ref({ inbound: 125000000, outbound: 87500000 })
${showTrend ? 'const trend = ref([120, 150, 130, 180, 200, 190, 220, 250])' : ''}
</script>`
}

function generateAngularCode(tier: Tier, title: string, status: Status): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<ui-network-traffic-card
  title="${title}"
  vendor="Cisco"
  location="US-East"
  [traffic]="traffic"
  status="${status}"
  [trend]="trend"
></ui-network-traffic-card>

/* Import component CSS */
@import '${importPath}/css/components/network-traffic-card.css';

// In component.ts
traffic = { inbound: 125000000, outbound: 87500000 };
trend = [120, 150, 130, 180, 200, 190, 220, 250];`
}

function generateSvelteCode(tier: Tier, title: string, status: Status, compact: boolean, showTrend: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    `  title="${title}"`,
    '  vendor="Cisco"',
    '  location="US-East"',
    '  {traffic}',
    `  status="${status}"`,
  ]
  if (showTrend) attrs.push('  {trend}')
  if (compact) attrs.push('  compact')

  return `<script>
  import { NetworkTrafficCard } from '${importPath}';

  const traffic = { inbound: 125000000, outbound: 87500000 };
  ${showTrend ? 'const trend = [120, 150, 130, 180, 200, 190, 220, 250];' : ''}
</script>

<NetworkTrafficCard
${attrs.join('\n')}
/>`
}

// ─── Playground Section ────────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [title, setTitle] = useState('eth0')
  const [status, setStatus] = useState<Status>('ok')
  const [compact, setCompact] = useState(false)
  const [showVendor, setShowVendor] = useState(true)
  const [showTrend, setShowTrend] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [inbound, setInbound] = useState(125000000)
  const [outbound, setOutbound] = useState(87500000)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, title, status, compact, showVendor, showTrend, motion),
    [tier, title, status, compact, showVendor, showTrend, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(title, status),
    [title, status],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, title, status, compact, showTrend),
    [tier, title, status, compact, showTrend],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, title, status),
    [tier, title, status],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, title, status, compact, showTrend),
    [tier, title, status, compact, showTrend],
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
    <section className="ntc-page__section" id="playground">
      <h2 className="ntc-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ntc-page__section-desc">
        Tweak every prop and see the card update in real-time. The generated code updates as you change settings.
      </p>

      <div className="ntc-page__playground">
        <div className="ntc-page__playground-preview">
          <div className="ntc-page__playground-result">
            <NetworkTrafficCard
              title={title}
              vendor={showVendor ? 'Cisco' : undefined}
              location={showVendor ? 'US-East' : undefined}
              traffic={{ inbound, outbound }}
              trend={showTrend ? SAMPLE_TREND : undefined}
              status={status}
              compact={compact}
              motion={motion}
              style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}
            />
          </div>

          <div className="ntc-page__code-tabs">
            <div className="ntc-page__export-row">
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
              {copyStatus && <span className="ntc-page__export-status">{copyStatus}</span>}
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

        <div className="ntc-page__playground-controls">
          <OptionGroup label="Status" options={STATUSES} value={status} onChange={setStatus} />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="ntc-page__control-group">
            <span className="ntc-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Compact mode" checked={compact} onChange={setCompact} />
              <Toggle label="Show vendor/location" checked={showVendor} onChange={setShowVendor} />
              <Toggle label="Show trend sparkline" checked={showTrend} onChange={setShowTrend} />
            </div>
          </div>

          <div className="ntc-page__control-group">
            <span className="ntc-page__control-label">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="ntc-page__text-input"
              placeholder="Interface name..."
            />
          </div>

          <div className="ntc-page__control-group">
            <span className="ntc-page__control-label">Inbound (bytes/s)</span>
            <input
              type="range"
              min={0}
              max={500000000}
              step={1000000}
              value={inbound}
              onChange={e => setInbound(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatBitRate(inbound)}</span>
          </div>

          <div className="ntc-page__control-group">
            <span className="ntc-page__control-label">Outbound (bytes/s)</span>
            <input
              type="range"
              min={0}
              max={500000000}
              step={1000000}
              value={outbound}
              onChange={e => setOutbound(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatBitRate(outbound)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetworkTrafficCardPage() {
  useStyles('ntc-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.ntc-page__section')
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
    <div className="ntc-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ntc-page__hero">
        <h1 className="ntc-page__title">NetworkTrafficCard</h1>
        <p className="ntc-page__desc">
          Real-time network interface card displaying inbound/outbound traffic rates, status indicators,
          vendor info, and trend sparkline. Aurora-glowed surface with OKLCH status colors.
        </p>
        <div className="ntc-page__import-row">
          <code className="ntc-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Statuses ────────────────────────────── */}
      <section className="ntc-page__section" id="statuses">
        <h2 className="ntc-page__section-title">
          <a href="#statuses">Status Variants</a>
        </h2>
        <p className="ntc-page__section-desc">
          Four status states control the left border accent, status dot color, and glow effect.
          Critical status includes a pulsing animation. Each card shows real-time inbound/outbound rates.
        </p>
        <div className="ntc-page__states-grid">
          {STATUSES.map(s => (
            <div key={s} className="ntc-page__state-cell">
              <NetworkTrafficCard
                title={`eth0-${s}`}
                vendor="Cisco"
                location="US-East"
                traffic={{ inbound: 125000000, outbound: 87500000 }}
                status={s}
                trend={SAMPLE_TREND}
              />
              <span className="ntc-page__state-label">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Compact Mode ────────────────────────────── */}
      <section className="ntc-page__section" id="compact">
        <h2 className="ntc-page__section-title">
          <a href="#compact">Compact Mode</a>
        </h2>
        <p className="ntc-page__section-desc">
          Enable <code className="ntc-page__a11y-key">compact</code> for dense dashboards.
          Reduces padding, hides the sparkline, and shrinks rate font sizes. Ideal for side-by-side layouts.
        </p>
        <div className="ntc-page__preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <NetworkTrafficCard
            title="eth0"
            traffic={{ inbound: 125000000, outbound: 87500000 }}
            status="ok"
            compact
          />
          <NetworkTrafficCard
            title="eth1"
            traffic={{ inbound: 50000000, outbound: 30000000 }}
            status="warning"
            compact
          />
          <NetworkTrafficCard
            title="eth2"
            traffic={{ inbound: 5000000, outbound: 2000000 }}
            status="critical"
            compact
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<NetworkTrafficCard
  title="eth0"
  traffic={{ inbound: 125000000, outbound: 87500000 }}
  status="ok"
  compact
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Trend Sparkline ─────────────────────────── */}
      <section className="ntc-page__section" id="sparkline">
        <h2 className="ntc-page__section-title">
          <a href="#sparkline">Trend Sparkline</a>
        </h2>
        <p className="ntc-page__section-desc">
          Pass an array of historical data points via the <code className="ntc-page__a11y-key">trend</code> prop
          to render a smooth sparkline visualization below the traffic rates. The sparkline auto-scales
          and uses a gradient fill for depth.
        </p>
        <div className="ntc-page__preview geo-map-page__preview--col" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <NetworkTrafficCard
            title="wan0"
            vendor="Juniper"
            location="EU-West"
            traffic={{ inbound: 250000000, outbound: 180000000 }}
            status="ok"
            trend={[100, 120, 115, 140, 160, 155, 170, 185, 200, 195, 210, 230, 225, 240, 260, 250, 270, 290]}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<NetworkTrafficCard
  title="wan0"
  vendor="Juniper"
  location="EU-West"
  traffic={{ inbound: 250000000, outbound: 180000000 }}
  status="ok"
  trend={[100, 120, 115, 140, 160, 155, 170, 185, 200]}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Vendor & Location ──────────────────────── */}
      <section className="ntc-page__section" id="vendor">
        <h2 className="ntc-page__section-title">
          <a href="#vendor">Vendor & Location</a>
        </h2>
        <p className="ntc-page__section-desc">
          Optionally display vendor and location metadata below the title. When both are provided,
          they are separated by a styled divider. Either can be used independently.
        </p>
        <div className="ntc-page__preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <NetworkTrafficCard
            title="eth0"
            vendor="Cisco Meraki"
            traffic={{ inbound: 125000000, outbound: 87500000 }}
            status="ok"
          />
          <NetworkTrafficCard
            title="eth1"
            location="US-West-2"
            traffic={{ inbound: 80000000, outbound: 45000000 }}
            status="ok"
          />
          <NetworkTrafficCard
            title="eth2"
            vendor="Arista"
            location="EU-Central"
            traffic={{ inbound: 200000000, outbound: 150000000 }}
            status="warning"
          />
        </div>
      </section>

      {/* ── 7. Motion Levels ──────────────────────────── */}
      <section className="ntc-page__section" id="motion">
        <h2 className="ntc-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="ntc-page__section-desc">
          Control animation intensity with the <code className="ntc-page__a11y-key">motion</code> prop.
          Level 0 disables all animations including hover lift, entrance fade, and arrow pulse.
          Level 2+ enables the entrance fade-up animation.
        </p>
        <div className="ntc-page__preview" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>motion=0</div>
            <NetworkTrafficCard
              title="static"
              traffic={{ inbound: 100000000, outbound: 50000000 }}
              status="ok"
              motion={0}
            />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>motion=3</div>
            <NetworkTrafficCard
              title="animated"
              traffic={{ inbound: 100000000, outbound: 50000000 }}
              status="ok"
              motion={3}
              trend={SAMPLE_TREND}
            />
          </div>
        </div>
      </section>

      {/* ── 8. Bit Rate Formatter ─────────────────────── */}
      <section className="ntc-page__section" id="formatter">
        <h2 className="ntc-page__section-title">
          <a href="#formatter">Bit Rate Formatter</a>
        </h2>
        <p className="ntc-page__section-desc">
          The component exports a <code className="ntc-page__a11y-key">formatBitRate()</code> utility that converts
          bytes-per-second to human-readable bit rates (bps, Kbps, Mbps, Gbps, Tbps).
        </p>
        <div className="ntc-page__preview ntc-page__preview--col" style={{ gap: '0.5rem', fontFamily: "'SF Mono', monospace", fontSize: 'var(--text-sm)' }}>
          <div style={{ color: 'var(--text-secondary)' }}>formatBitRate(100) = <strong style={{ color: 'var(--text-primary)' }}>{formatBitRate(100)}</strong></div>
          <div style={{ color: 'var(--text-secondary)' }}>formatBitRate(125000) = <strong style={{ color: 'var(--text-primary)' }}>{formatBitRate(125000)}</strong></div>
          <div style={{ color: 'var(--text-secondary)' }}>formatBitRate(125000000) = <strong style={{ color: 'var(--text-primary)' }}>{formatBitRate(125000000)}</strong></div>
          <div style={{ color: 'var(--text-secondary)' }}>formatBitRate(125000000000) = <strong style={{ color: 'var(--text-primary)' }}>{formatBitRate(125000000000)}</strong></div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`import { formatBitRate } from '@annondeveloper/ui-kit'

formatBitRate(125000000) // "1.00 Gbps"
formatBitRate(125000)    // "1.00 Mbps"
formatBitRate(100)       // "800 bps"`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 9. Weight Tiers ────────────────────────────── */}
      <section className="ntc-page__section" id="tiers">
        <h2 className="ntc-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="ntc-page__section-desc">
          NetworkTrafficCard ships in three tiers. Lite provides a CSS-only static card,
          Standard adds motion and sparkline, Premium includes aurora glow and entrance animations.
        </p>

        <div className="ntc-page__tiers">
          {/* Lite */}
          <div
            className={`ntc-page__tier-card${tier === 'lite' ? ' ntc-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="ntc-page__tier-header">
              <span className="ntc-page__tier-name">Lite</span>
              <span className="ntc-page__tier-size">~0.8 KB</span>
            </div>
            <p className="ntc-page__tier-desc">
              CSS-only traffic card. Shows title, inbound/outbound rates with static layout.
              No sparkline, no status dot animation, no hover lift, no entrance effects.
            </p>
            <div className="ntc-page__tier-import">
              import {'{'} NetworkTrafficCard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="ntc-page__tier-preview">
              <NetworkTrafficCard
                title="eth0"
                traffic={{ inbound: 125000000, outbound: 87500000 }}
                status="ok"
                motion={0}
              />
            </div>
            <div className="ntc-page__size-breakdown">
              <div className="ntc-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`ntc-page__tier-card${tier === 'standard' ? ' ntc-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="ntc-page__tier-header">
              <span className="ntc-page__tier-name">Standard</span>
              <span className="ntc-page__tier-size">~3.2 KB</span>
            </div>
            <p className="ntc-page__tier-desc">
              Full-featured card with aurora glow, status dot, animated arrows, sparkline trend,
              hover lift, entrance fade-up, vendor/location display, and compact mode.
            </p>
            <div className="ntc-page__tier-import">
              import {'{'} NetworkTrafficCard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="ntc-page__tier-preview">
              <NetworkTrafficCard
                title="eth0"
                vendor="Cisco"
                traffic={{ inbound: 125000000, outbound: 87500000 }}
                status="ok"
                trend={SAMPLE_TREND.slice(0, 8)}
              />
            </div>
            <div className="ntc-page__size-breakdown">
              <div className="ntc-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`ntc-page__tier-card${tier === 'premium' ? ' ntc-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="ntc-page__tier-header">
              <span className="ntc-page__tier-name">Premium</span>
              <span className="ntc-page__tier-size">~4.8 KB</span>
            </div>
            <p className="ntc-page__tier-desc">
              Everything in Standard plus enhanced aurora radial gradients, smooth entrance
              with spring physics, shimmer effect on status transitions, and ambient glow pulsing.
            </p>
            <div className="ntc-page__tier-import">
              import {'{'} NetworkTrafficCard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="ntc-page__tier-preview">
              <NetworkTrafficCard
                title="eth0"
                vendor="Cisco"
                location="US-East"
                traffic={{ inbound: 125000000, outbound: 87500000 }}
                status="ok"
                trend={SAMPLE_TREND.slice(0, 8)}
                motion={3}
              />
            </div>
            <div className="ntc-page__size-breakdown">
              <div className="ntc-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Props API ───────────────────────────────── */}
      <section className="ntc-page__section" id="props">
        <h2 className="ntc-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="ntc-page__section-desc">
          All props accepted by NetworkTrafficCard. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={ntcProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="ntc-page__section" id="accessibility">
        <h2 className="ntc-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ntc-page__section-desc">
          Built with semantic grouping and comprehensive ARIA support for network monitoring dashboards.
        </p>
        <Card variant="default" padding="md">
          <ul className="ntc-page__a11y-list">
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Grouping:</strong> Card uses <code className="ntc-page__a11y-key">role="group"</code> with
                <code className="ntc-page__a11y-key">aria-label</code> set to the title text.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status:</strong> Status dot has <code className="ntc-page__a11y-key">role="status"</code> with
                <code className="ntc-page__a11y-key">aria-label</code> announcing the current status.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Sparkline:</strong> SVG sparkline is marked <code className="ntc-page__a11y-key">aria-hidden="true"</code> as
                it is decorative and the data is presented in text form.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular numbers:</strong> Traffic rates use <code className="ntc-page__a11y-key">font-variant-numeric: tabular-nums</code> for
                stable alignment as values change.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> All animations respect <code className="ntc-page__a11y-key">motion=0</code> and
                <code className="ntc-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="ntc-page__a11y-key">forced-colors: active</code> support
                with visible borders and Highlight-colored status indicators.
              </span>
            </li>
            <li className="ntc-page__a11y-item">
              <span className="ntc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Renders cleanly with no box shadows or aurora gradients in print mode.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
