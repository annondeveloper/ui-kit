'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SeverityTimeline, type TimelineEvent } from '@ui/domain/severity-timeline'
import { SeverityTimeline as LiteSeverityTimeline } from '@ui/lite/severity-timeline'
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
    @scope (.stl-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: stl-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .stl-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .stl-page__hero::before {
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
        animation: stl-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes stl-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .stl-page__hero::before { animation: none; }
      }

      .stl-page__title {
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

      .stl-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .stl-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .stl-page__import-code {
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

      .stl-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .stl-page__section {
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
        animation: stl-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes stl-section-reveal {
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
        .stl-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .stl-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .stl-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .stl-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .stl-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .stl-page__preview {
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

      .stl-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stl-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .stl-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container stl-page (max-width: 680px) {
        .stl-page__playground {
          grid-template-columns: 1fr;
        }
        .stl-page__playground-controls {
          position: static !important;
        }
      }

      .stl-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .stl-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: start;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .stl-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stl-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .stl-page__playground-controls {
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

      .stl-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .stl-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stl-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .stl-page__option-btn {
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
      .stl-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .stl-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .stl-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .stl-page__code-tabs {
        margin-block-start: 1rem;
      }

      .stl-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .stl-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .stl-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .stl-page__tier-card {
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

      .stl-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .stl-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .stl-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .stl-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .stl-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .stl-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .stl-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .stl-page__tier-import {
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

      .stl-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .stl-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .stl-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .stl-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .stl-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .stl-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .stl-page__a11y-key {
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
        .stl-page__hero { padding: 2rem 1.25rem; }
        .stl-page__title { font-size: 1.75rem; }
        .stl-page__preview { padding: 1.75rem; }
        .stl-page__playground { grid-template-columns: 1fr; }
        .stl-page__playground-controls { position: static !important; }
        .stl-page__tiers { grid-template-columns: 1fr; }
        .stl-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .stl-page__hero { padding: 1.5rem 1rem; }
        .stl-page__title { font-size: 1.5rem; }
        .stl-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .stl-page__import-code,
      .stl-page code,
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

const stlProps: PropDef[] = [
  { name: 'events', type: 'TimelineEvent[]', description: 'Array of timeline events with id, timestamp, severity, title, and optional description.' },
  { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Timeline layout direction. Vertical stacks events top-to-bottom, horizontal scrolls left-to-right.' },
  { name: 'expandable', type: 'boolean', default: 'false', description: 'When true, event descriptions are collapsed by default with a toggle button.' },
  { name: 'maxVisible', type: 'number', description: 'Limit the number of visible events with a "+N more" indicator.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls entrance and transition effects.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

type Severity = 'info' | 'warning' | 'critical' | 'ok'

const now = Date.now()

const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    timestamp: now - 5 * 60000,
    severity: 'critical',
    title: 'Database connection pool exhausted',
    description: 'PostgreSQL connection pool reached 100% capacity. Active connections: 200/200. Queries queuing.',
  },
  {
    id: 'e2',
    timestamp: now - 12 * 60000,
    severity: 'warning',
    title: 'High memory usage on web-server-03',
    description: 'Memory utilization exceeded 85% threshold. Current: 87.3%. Consider scaling horizontally.',
  },
  {
    id: 'e3',
    timestamp: now - 25 * 60000,
    severity: 'info',
    title: 'Deployment v2.4.1 completed',
    description: 'Successfully deployed 12 services across 3 regions. Zero-downtime rolling update.',
  },
  {
    id: 'e4',
    timestamp: now - 45 * 60000,
    severity: 'ok',
    title: 'SSL certificate renewed',
    description: 'Auto-renewal completed for *.example.com. New expiry: 2027-03-25.',
  },
  {
    id: 'e5',
    timestamp: now - 60 * 60000,
    severity: 'warning',
    title: 'API response time degraded',
    description: 'P99 latency increased from 120ms to 340ms on /api/v2/search endpoint.',
  },
  {
    id: 'e6',
    timestamp: now - 90 * 60000,
    severity: 'ok',
    title: 'Backup completed successfully',
    description: 'Full database backup: 42GB compressed. Duration: 18 minutes.',
  },
]

const SHORT_EVENTS: TimelineEvent[] = SAMPLE_EVENTS.slice(0, 3)

const SEVERITY_EVENTS: TimelineEvent[] = [
  { id: 'sev1', timestamp: now - 1 * 60000, severity: 'info', title: 'Info: Routine health check passed' },
  { id: 'sev2', timestamp: now - 5 * 60000, severity: 'warning', title: 'Warning: Disk usage at 78%' },
  { id: 'sev3', timestamp: now - 10 * 60000, severity: 'critical', title: 'Critical: Service unreachable' },
  { id: 'sev4', timestamp: now - 15 * 60000, severity: 'ok', title: 'Resolved: Service recovered' },
]

const LITE_EVENTS = SAMPLE_EVENTS.slice(0, 3).map(e => ({
  ...e,
  timestamp: e.timestamp,
}))

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SeverityTimeline } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SeverityTimeline } from '@annondeveloper/ui-kit'",
  premium: "import { SeverityTimeline } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="stl-page__copy-btn"
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
    <div className="stl-page__control-group">
      <span className="stl-page__control-label">{label}</span>
      <div className="stl-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stl-page__option-btn${opt === value ? ' stl-page__option-btn--active' : ''}`}
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
    <label className="stl-page__toggle-label">
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
  orientation: 'vertical' | 'horizontal',
  expandable: boolean,
  maxVisible: number | undefined,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  events={events}')
  if (orientation !== 'vertical') props.push(`  orientation="${orientation}"`)
  if (expandable) props.push('  expandable')
  if (maxVisible !== undefined) props.push(`  maxVisible={${maxVisible}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}
import type { TimelineEvent } from '@annondeveloper/ui-kit'

const events: TimelineEvent[] = [
  {
    id: 'e1',
    timestamp: Date.now() - 5 * 60000,
    severity: 'critical',
    title: 'Database connection pool exhausted',
    description: 'PostgreSQL pool at 100% capacity.',
  },
  {
    id: 'e2',
    timestamp: Date.now() - 12 * 60000,
    severity: 'warning',
    title: 'High memory usage on web-server-03',
    description: 'Memory at 87.3%. Consider scaling.',
  },
  {
    id: 'e3',
    timestamp: Date.now() - 25 * 60000,
    severity: 'info',
    title: 'Deployment v2.4.1 completed',
  },
]

<SeverityTimeline
${props.join('\n')}
/>`
}

function generateHtmlCode(orientation: 'vertical' | 'horizontal'): string {
  return `<!-- SeverityTimeline — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/severity-timeline.css">

<div class="ui-severity-timeline" data-orientation="${orientation}">
  <ol class="ui-severity-timeline__list">
    <li class="ui-severity-timeline__item">
      <div class="ui-severity-timeline__dot" data-severity="critical"></div>
      <div class="ui-severity-timeline__connector"></div>
      <div class="ui-severity-timeline__content">
        <div class="ui-severity-timeline__title">Database pool exhausted</div>
        <div class="ui-severity-timeline__time">10:35 AM</div>
      </div>
    </li>
    <li class="ui-severity-timeline__item">
      <div class="ui-severity-timeline__dot" data-severity="warning"></div>
      <div class="ui-severity-timeline__connector"></div>
      <div class="ui-severity-timeline__content">
        <div class="ui-severity-timeline__title">High memory usage</div>
        <div class="ui-severity-timeline__time">10:28 AM</div>
      </div>
    </li>
    <li class="ui-severity-timeline__item">
      <div class="ui-severity-timeline__dot" data-severity="ok"></div>
      <div class="ui-severity-timeline__content">
        <div class="ui-severity-timeline__title">Service recovered</div>
        <div class="ui-severity-timeline__time">10:15 AM</div>
      </div>
    </li>
  </ol>
</div>`
}

function generateVueCode(tier: Tier, orientation: 'vertical' | 'horizontal', expandable: boolean, maxVisible: number | undefined): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :events="events"']
  if (orientation !== 'vertical') attrs.push(`  orientation="${orientation}"`)
  if (expandable) attrs.push('  expandable')
  if (maxVisible !== undefined) attrs.push(`  :max-visible="${maxVisible}"`)

  return `<template>
  <SeverityTimeline
${attrs.join('\n')}
  />
</template>

<script setup>
import { SeverityTimeline } from '${importPath}'
import { ref } from 'vue'

const events = ref([
  {
    id: 'e1',
    timestamp: Date.now() - 5 * 60000,
    severity: 'critical',
    title: 'Database connection pool exhausted',
    description: 'Pool at 100% capacity.',
  },
  {
    id: 'e2',
    timestamp: Date.now() - 12 * 60000,
    severity: 'warning',
    title: 'High memory usage',
  },
])
</script>`
}

function generateAngularCode(tier: Tier, orientation: 'vertical' | 'horizontal', expandable: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<ui-severity-timeline
  [events]="events"
  ${orientation !== 'vertical' ? `orientation="${orientation}"` : ''}
  ${expandable ? 'expandable' : ''}
></ui-severity-timeline>

/* Import component CSS */
@import '${importPath}/css/components/severity-timeline.css';

// In component.ts
events = [
  { id: 'e1', timestamp: Date.now(), severity: 'critical', title: 'DB pool exhausted' },
  { id: 'e2', timestamp: Date.now() - 60000, severity: 'warning', title: 'High memory' },
];`
}

function generateSvelteCode(tier: Tier, orientation: 'vertical' | 'horizontal', expandable: boolean, maxVisible: number | undefined): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['{events}']
  if (orientation !== 'vertical') attrs.push(`orientation="${orientation}"`)
  if (expandable) attrs.push('expandable')
  if (maxVisible !== undefined) attrs.push(`maxVisible={${maxVisible}}`)

  return `<script>
  import { SeverityTimeline } from '${importPath}';

  const events = [
    {
      id: 'e1',
      timestamp: Date.now() - 5 * 60000,
      severity: 'critical',
      title: 'Database connection pool exhausted',
      description: 'Pool at 100% capacity.',
    },
    {
      id: 'e2',
      timestamp: Date.now() - 12 * 60000,
      severity: 'warning',
      title: 'High memory usage',
    },
  ];
</script>

<SeverityTimeline
  ${attrs.join('\n  ')}
/>`
}

// ─── Playground Section ────────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [expandable, setExpandable] = useState(false)
  const [useMaxVisible, setUseMaxVisible] = useState(false)
  const [maxVisible, setMaxVisible] = useState(3)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const effectiveMaxVisible = useMaxVisible ? maxVisible : undefined

  const reactCode = useMemo(
    () => generateReactCode(tier, orientation, expandable, effectiveMaxVisible, motion),
    [tier, orientation, expandable, effectiveMaxVisible, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(orientation),
    [orientation],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, orientation, expandable, effectiveMaxVisible),
    [tier, orientation, expandable, effectiveMaxVisible],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, orientation, expandable),
    [tier, orientation, expandable],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, orientation, expandable, effectiveMaxVisible),
    [tier, orientation, expandable, effectiveMaxVisible],
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
    <section className="stl-page__section" id="playground">
      <h2 className="stl-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="stl-page__section-desc">
        Configure timeline props in real-time. Toggle expandable descriptions, switch orientations, and limit visible events.
      </p>

      <div className="stl-page__playground">
        <div className="stl-page__playground-preview">
          <div className="stl-page__playground-result">
            {tier === 'lite' ? (
              <LiteSeverityTimeline
                events={LITE_EVENTS}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              />
            ) : (
              <SeverityTimeline
                events={SAMPLE_EVENTS}
                orientation={orientation}
                expandable={expandable}
                maxVisible={effectiveMaxVisible}
                motion={motion}
                style={{ width: '100%', position: 'relative', zIndex: 1 }}
              />
            )}
          </div>

          <div className="stl-page__code-tabs">
            <div className="stl-page__export-row">
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
              {copyStatus && <span className="stl-page__export-status">{copyStatus}</span>}
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

        <div className="stl-page__playground-controls">
          <OptionGroup
            label="Orientation"
            options={['vertical', 'horizontal'] as const}
            value={orientation}
            onChange={setOrientation}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="stl-page__control-group">
            <span className="stl-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Expandable descriptions" checked={expandable} onChange={setExpandable} />
              <Toggle label="Limit visible events" checked={useMaxVisible} onChange={setUseMaxVisible} />
            </div>
          </div>

          {useMaxVisible && (
            <div className="stl-page__control-group">
              <span className="stl-page__control-label">Max Visible</span>
              <input
                type="range"
                min={1}
                max={6}
                value={maxVisible}
                onChange={e => setMaxVisible(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{maxVisible} events</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeverityTimelinePage() {
  useStyles('stl-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.stl-page__section')
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
    <div className="stl-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="stl-page__hero">
        <h1 className="stl-page__title">SeverityTimeline</h1>
        <p className="stl-page__desc">
          Chronological event timeline with severity-colored dots, connectors, expandable descriptions,
          and horizontal/vertical orientations. Ideal for incident logs, deployment history, and alert feeds.
        </p>
        <div className="stl-page__import-row">
          <code className="stl-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Severity Colors ─────────────────────────── */}
      <section className="stl-page__section" id="severities">
        <h2 className="stl-page__section-title">
          <a href="#severities">Severity Colors</a>
        </h2>
        <p className="stl-page__section-desc">
          Four severity levels with distinct OKLCH colors: info (brand purple), warning (amber),
          critical (red), and ok (green). Each level gets a colored dot indicator on the timeline.
        </p>
        <div className="stl-page__preview stl-page__preview--col">
          <SeverityTimeline events={SEVERITY_EVENTS} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SeverityTimeline
  events={[
    { id: '1', timestamp: Date.now(), severity: 'info', title: 'Info event' },
    { id: '2', timestamp: Date.now(), severity: 'warning', title: 'Warning event' },
    { id: '3', timestamp: Date.now(), severity: 'critical', title: 'Critical event' },
    { id: '4', timestamp: Date.now(), severity: 'ok', title: 'Resolved event' },
  ]}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Horizontal Orientation ──────────────────── */}
      <section className="stl-page__section" id="horizontal">
        <h2 className="stl-page__section-title">
          <a href="#horizontal">Horizontal Orientation</a>
        </h2>
        <p className="stl-page__section-desc">
          Switch to horizontal layout for inline timeline displays. Events scroll horizontally with
          connecting lines between dots. Works well for deployment pipelines and status dashboards.
        </p>
        <div className="stl-page__preview stl-page__preview--col" style={{ overflowX: 'auto' }}>
          <SeverityTimeline
            events={SEVERITY_EVENTS}
            orientation="horizontal"
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SeverityTimeline
  events={events}
  orientation="horizontal"
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Expandable Descriptions ─────────────────── */}
      <section className="stl-page__section" id="expandable">
        <h2 className="stl-page__section-title">
          <a href="#expandable">Expandable Descriptions</a>
        </h2>
        <p className="stl-page__section-desc">
          Enable the <code className="stl-page__a11y-key">expandable</code> prop to collapse descriptions
          by default. Users can toggle individual event details with "Show details" / "Hide details" buttons.
          Uses <code className="stl-page__a11y-key">aria-expanded</code> for accessibility.
        </p>
        <div className="stl-page__preview stl-page__preview--col">
          <SeverityTimeline
            events={SAMPLE_EVENTS.slice(0, 4)}
            expandable
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SeverityTimeline
  events={events}
  expandable
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Max Visible ─────────────────────────────── */}
      <section className="stl-page__section" id="max-visible">
        <h2 className="stl-page__section-title">
          <a href="#max-visible">Limiting Visible Events</a>
        </h2>
        <p className="stl-page__section-desc">
          Use <code className="stl-page__a11y-key">maxVisible</code> to cap the number of displayed events.
          A "+N more events" indicator appears below when events are truncated.
        </p>
        <div className="stl-page__preview stl-page__preview--col">
          <SeverityTimeline
            events={SAMPLE_EVENTS}
            maxVisible={3}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SeverityTimeline
  events={allEvents}    // 6 events
  maxVisible={3}        // Shows 3 + "+3 more events"
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. With Descriptions ──────────────────────── */}
      <section className="stl-page__section" id="descriptions">
        <h2 className="stl-page__section-title">
          <a href="#descriptions">Rich Descriptions</a>
        </h2>
        <p className="stl-page__section-desc">
          Event descriptions accept ReactNode content, allowing rich formatting. When expandable is false
          (default), descriptions are always visible below the event title.
        </p>
        <div className="stl-page__preview stl-page__preview--col">
          <SeverityTimeline events={SAMPLE_EVENTS.slice(0, 3)} />
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="stl-page__section" id="tiers">
        <h2 className="stl-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="stl-page__section-desc">
          SeverityTimeline ships in three tiers. Lite provides a basic static timeline, Standard adds
          expandable descriptions and horizontal orientation, Premium includes entrance animations.
        </p>

        <div className="stl-page__tiers">
          {/* Lite */}
          <div
            className={`stl-page__tier-card${tier === 'lite' ? ' stl-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="stl-page__tier-header">
              <span className="stl-page__tier-name">Lite</span>
              <span className="stl-page__tier-size">~0.5 KB</span>
            </div>
            <p className="stl-page__tier-desc">
              CSS-only timeline with severity-colored dots and static event list.
              No expandable descriptions, no horizontal mode, no motion.
              Minimal forwardRef wrapper only.
            </p>
            <div className="stl-page__tier-import">
              import {'{'} SeverityTimeline {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="stl-page__tier-preview">
              <LiteSeverityTimeline
                events={LITE_EVENTS.slice(0, 2)}
              />
            </div>
            <div className="stl-page__size-breakdown">
              <div className="stl-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`stl-page__tier-card${tier === 'standard' ? ' stl-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="stl-page__tier-header">
              <span className="stl-page__tier-name">Standard</span>
              <span className="stl-page__tier-size">~2.8 KB</span>
            </div>
            <p className="stl-page__tier-desc">
              Full-featured timeline with vertical and horizontal orientations, expandable descriptions
              with aria-expanded, maxVisible truncation, severity dots with connector lines, and motion control.
            </p>
            <div className="stl-page__tier-import">
              import {'{'} SeverityTimeline {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="stl-page__tier-preview">
              <SeverityTimeline
                events={SEVERITY_EVENTS.slice(0, 2)}
              />
            </div>
            <div className="stl-page__size-breakdown">
              <div className="stl-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`stl-page__tier-card${tier === 'premium' ? ' stl-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="stl-page__tier-header">
              <span className="stl-page__tier-name">Premium</span>
              <span className="stl-page__tier-size">~4.1 KB</span>
            </div>
            <p className="stl-page__tier-desc">
              Everything in Standard plus staggered entrance animations for each event,
              smooth expand/collapse transitions, severity dot glow pulses, and animated connector drawing.
            </p>
            <div className="stl-page__tier-import">
              import {'{'} SeverityTimeline {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="stl-page__tier-preview">
              <SeverityTimeline
                events={SEVERITY_EVENTS.slice(0, 2)}
                motion={3}
              />
            </div>
            <div className="stl-page__size-breakdown">
              <div className="stl-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="stl-page__section" id="props">
        <h2 className="stl-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="stl-page__section-desc">
          All props accepted by SeverityTimeline. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={stlProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="stl-page__section" id="accessibility">
        <h2 className="stl-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="stl-page__section-desc">
          Built with semantic ordered lists and comprehensive ARIA patterns for timeline visualizations.
        </p>
        <Card variant="default" padding="md">
          <ul className="stl-page__a11y-list">
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic list:</strong> Events render inside an <code className="stl-page__a11y-key">&lt;ol&gt;</code> element,
                providing inherent ordering context to screen readers.
              </span>
            </li>
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Expandable:</strong> Toggle buttons use <code className="stl-page__a11y-key">aria-expanded</code> to
                announce the collapsed/expanded state of each event description.
              </span>
            </li>
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color + shape:</strong> Severity is conveyed through both color and the dot indicator,
                not color alone, meeting WCAG success criterion 1.4.1.
              </span>
            </li>
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Time formatting:</strong> Timestamps use <code className="stl-page__a11y-key">toLocaleTimeString</code> for
                locale-aware time display with <code className="stl-page__a11y-key">font-variant-numeric: tabular-nums</code>.
              </span>
            </li>
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="stl-page__a11y-key">forced-colors: active</code> support
                with visible 2px dot borders and GrayText connector lines.
              </span>
            </li>
            <li className="stl-page__a11y-item">
              <span className="stl-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Horizontal scroll:</strong> Horizontal orientation uses native overflow scrolling with
                accessible scrollbar for keyboard navigation.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
