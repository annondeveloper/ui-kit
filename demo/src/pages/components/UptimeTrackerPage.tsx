'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { UptimeTracker } from '@ui/domain/uptime-tracker'
import { UptimeTracker as LiteUptimeTracker } from '@ui/lite/uptime-tracker'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data Generators ──────────────────────────────────────────────────

type DayStatus = 'up' | 'degraded' | 'down' | 'unknown'

function generateDays(count: number, degradedChance: number = 0.05, downChance: number = 0.02): { date: string; status: DayStatus; uptime: number }[] {
  const days: { date: string; status: DayStatus; uptime: number }[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rand = Math.random()
    let status: DayStatus = 'up'
    let uptime = 0.999 + Math.random() * 0.001
    if (rand < downChance) {
      status = 'down'
      uptime = 0.7 + Math.random() * 0.15
    } else if (rand < downChance + degradedChance) {
      status = 'degraded'
      uptime = 0.95 + Math.random() * 0.04
    }
    days.push({ date: dateStr, status, uptime })
  }
  return days
}

const SAMPLE_90_DAYS = generateDays(90)
const SAMPLE_30_DAYS = generateDays(30, 0.1, 0.03)
const SAMPLE_PERFECT = Array.from({ length: 60 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (59 - i))
  return { date: d.toISOString().slice(0, 10), status: 'up' as const, uptime: 1 }
})

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.uptime-tracker-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: uptime-tracker-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .uptime-tracker-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .uptime-tracker-page__hero::before {
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
        animation: ut-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ut-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .uptime-tracker-page__hero::before { animation: none; }
      }

      .uptime-tracker-page__title {
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

      .uptime-tracker-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .uptime-tracker-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .uptime-tracker-page__import-code {
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

      .uptime-tracker-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .uptime-tracker-page__section {
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
        animation: ut-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ut-section-reveal {
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
        .uptime-tracker-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .uptime-tracker-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .uptime-tracker-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .uptime-tracker-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .uptime-tracker-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .uptime-tracker-page__preview {
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

      .uptime-tracker-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .uptime-tracker-page__preview--full {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .uptime-tracker-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container uptime-tracker-page (max-width: 680px) {
        .uptime-tracker-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .uptime-tracker-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .uptime-tracker-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .uptime-tracker-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .uptime-tracker-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .uptime-tracker-page__playground-controls {
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

      .uptime-tracker-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .uptime-tracker-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .uptime-tracker-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .uptime-tracker-page__option-btn {
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
      .uptime-tracker-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .uptime-tracker-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .uptime-tracker-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled items ──────────────────────────────── */

      .uptime-tracker-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .uptime-tracker-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .uptime-tracker-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .uptime-tracker-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .uptime-tracker-page__tier-card {
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

      .uptime-tracker-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .uptime-tracker-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .uptime-tracker-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .uptime-tracker-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .uptime-tracker-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .uptime-tracker-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .uptime-tracker-page__tier-import {
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

      .uptime-tracker-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs & exports ────────────────────────── */

      .uptime-tracker-page__code-tabs {
        margin-block-start: 1rem;
      }

      .uptime-tracker-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .uptime-tracker-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      .uptime-tracker-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .uptime-tracker-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .uptime-tracker-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .uptime-tracker-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .uptime-tracker-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .uptime-tracker-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Legend row ─────────────────────────────────── */

      .uptime-tracker-page__legend {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
      }

      .uptime-tracker-page__legend-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .uptime-tracker-page__legend-dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 2px;
        flex-shrink: 0;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .uptime-tracker-page__hero { padding: 2rem 1.25rem; }
        .uptime-tracker-page__title { font-size: 1.75rem; }
        .uptime-tracker-page__preview { padding: 1.75rem; }
        .uptime-tracker-page__playground { grid-template-columns: 1fr; }
        .uptime-tracker-page__tiers { grid-template-columns: 1fr; }
        .uptime-tracker-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .uptime-tracker-page__hero { padding: 1.5rem 1rem; }
        .uptime-tracker-page__title { font-size: 1.5rem; }
        .uptime-tracker-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .uptime-tracker-page__import-code,
      .uptime-tracker-page code,
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

const uptimeProps: PropDef[] = [
  { name: 'days', type: 'UptimeDay[]', required: true, description: 'Array of day objects with date (YYYY-MM-DD), status (up/degraded/down/unknown), and optional uptime (0-1).' },
  { name: 'slaTarget', type: 'number', description: 'SLA target as a decimal (e.g. 0.999 for 99.9%). Displayed when showSla is enabled.' },
  { name: 'showSla', type: 'boolean', default: 'false', description: 'Show the SLA summary line with current uptime percentage and target.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables hover scale transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { UptimeTracker } from '@annondeveloper/ui-kit/lite'",
  standard: "import { UptimeTracker } from '@annondeveloper/ui-kit'",
  premium: "import { UptimeTracker } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="uptime-tracker-page__copy-btn"
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
    <div className="uptime-tracker-page__control-group">
      <span className="uptime-tracker-page__control-label">{label}</span>
      <div className="uptime-tracker-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`uptime-tracker-page__option-btn${opt === value ? ' uptime-tracker-page__option-btn--active' : ''}`}
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
    <label className="uptime-tracker-page__toggle-label">
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

function generateReactCode(tier: Tier, dayCount: number, showSla: boolean, slaTarget: number, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  days={uptimeDays}')
  if (showSla) props.push('  showSla')
  if (showSla && slaTarget !== 0.999) props.push(`  slaTarget={${slaTarget}}`)
  if (showSla && slaTarget === 0.999) props.push('  slaTarget={0.999}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\nimport type { UptimeDay } from '@annondeveloper/ui-kit'\n\n// Generate ${dayCount} days of uptime data\nconst uptimeDays: UptimeDay[] = [\n  { date: '2026-03-22', status: 'up', uptime: 0.999 },\n  { date: '2026-03-23', status: 'degraded', uptime: 0.96 },\n  // ... ${dayCount} days total\n]\n\n<UptimeTracker\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier): string {
  return `<!-- UptimeTracker — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/uptime-tracker.css'}">

<div class="${tier === 'lite' ? 'ui-lite-uptime-tracker' : 'ui-uptime-tracker'}" role="group" aria-label="Uptime history">
  <div class="${tier === 'lite' ? 'ui-lite-uptime-tracker__grid' : 'ui-uptime-tracker__bar'}">
    <div class="${tier === 'lite' ? 'ui-lite-uptime-tracker__cell' : 'ui-uptime-tracker__day'}" data-day-status="up"></div>
    <div class="${tier === 'lite' ? 'ui-lite-uptime-tracker__cell' : 'ui-uptime-tracker__day'}" data-day-status="degraded"></div>
    <div class="${tier === 'lite' ? 'ui-lite-uptime-tracker__cell' : 'ui-uptime-tracker__day'}" data-day-status="up"></div>
    <!-- ... more days -->
  </div>
</div>`
}

function generateVueCode(tier: Tier, showSla: boolean, slaTarget: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const slaProps = showSla ? `\n    showSla\n    :sla-target="${slaTarget}"` : ''
  return `<template>\n  <UptimeTracker\n    :days="uptimeDays"${slaProps}\n  />\n</template>\n\n<script setup>\nimport { UptimeTracker } from '${importPath}'\nimport { ref } from 'vue'\n\nconst uptimeDays = ref([\n  { date: '2026-03-22', status: 'up', uptime: 0.999 },\n  // ... more days\n])\n</script>`
}

function generateAngularCode(tier: Tier, showSla: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->\n<ui-uptime-tracker\n  [days]="uptimeDays"${showSla ? '\n  showSla\n  [slaTarget]="0.999"' : ''}\n></ui-uptime-tracker>\n\n/* Import CSS */\n@import '${importPath}/css/components/uptime-tracker.css';`
}

function generateSvelteCode(tier: Tier, showSla: boolean, slaTarget: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const slaProps = showSla ? `\n  showSla\n  slaTarget={${slaTarget}}` : ''
  return `<script>\n  import { UptimeTracker } from '${importPath}';\n\n  const uptimeDays = [\n    { date: '2026-03-22', status: 'up', uptime: 0.999 },\n    // ... more days\n  ];\n</script>\n\n<UptimeTracker\n  days={uptimeDays}${slaProps}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [dayCount, setDayCount] = useState<'30' | '60' | '90'>('90')
  const [showSla, setShowSla] = useState(true)
  const [slaTarget, setSlaTarget] = useState(0.999)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const TrackerComponent = tier === 'lite' ? LiteUptimeTracker : UptimeTracker

  const days = useMemo(() => {
    const count = Number(dayCount)
    return generateDays(count)
  }, [dayCount])

  const reactCode = useMemo(() => generateReactCode(tier, Number(dayCount), showSla, slaTarget, motion), [tier, dayCount, showSla, slaTarget, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, showSla, slaTarget), [tier, showSla, slaTarget])
  const angularCode = useMemo(() => generateAngularCode(tier, showSla), [tier, showSla])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showSla, slaTarget), [tier, showSla, slaTarget])

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

  const previewProps: Record<string, unknown> = { days }
  if (showSla) {
    previewProps.showSla = true
    previewProps.slaTarget = slaTarget
  }
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="uptime-tracker-page__section" id="playground">
      <h2 className="uptime-tracker-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="uptime-tracker-page__section-desc">
        Configure day range, SLA display, and motion to see the tracker update in real-time.
      </p>

      <div className="uptime-tracker-page__playground">
        <div className="uptime-tracker-page__playground-preview">
          <div className="uptime-tracker-page__playground-result">
            <TrackerComponent {...previewProps} />
          </div>

          <div className="uptime-tracker-page__code-tabs">
            <div className="uptime-tracker-page__export-row">
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
              {copyStatus && <span className="uptime-tracker-page__export-status">{copyStatus}</span>}
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

        <div className="uptime-tracker-page__playground-controls">
          <OptionGroup label="Day range" options={['30', '60', '90'] as const} value={dayCount} onChange={setDayCount} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="uptime-tracker-page__control-group">
            <span className="uptime-tracker-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show SLA summary" checked={showSla} onChange={setShowSla} />
            </div>
          </div>

          {showSla && (
            <OptionGroup
              label="SLA Target"
              options={['0.99', '0.995', '0.999', '0.9999'] as const}
              value={String(slaTarget)}
              onChange={v => setSlaTarget(Number(v))}
            />
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UptimeTrackerPage() {
  useStyles('uptime-tracker-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.uptime-tracker-page__section')
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

  const TrackerComponent = tier === 'lite' ? LiteUptimeTracker : UptimeTracker

  return (
    <div className="uptime-tracker-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="uptime-tracker-page__hero">
        <h1 className="uptime-tracker-page__title">UptimeTracker</h1>
        <p className="uptime-tracker-page__desc">
          GitHub-style uptime bar chart showing daily service status. Hover for day-level detail.
          Tracks SLA compliance with configurable targets and color-coded status cells.
        </p>
        <div className="uptime-tracker-page__import-row">
          <code className="uptime-tracker-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Status Colors ───────────────────────────── */}
      <section className="uptime-tracker-page__section" id="status-colors">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#status-colors">Status Colors</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          Each day cell is colored based on its status: green for up, amber for degraded,
          red for down, and muted for unknown. Hover to see date and uptime percentage.
        </p>
        <div className="uptime-tracker-page__preview uptime-tracker-page__preview--full">
          <TrackerComponent
            days={[
              { date: '2026-03-20', status: 'up', uptime: 1 },
              { date: '2026-03-21', status: 'up', uptime: 0.999 },
              { date: '2026-03-22', status: 'degraded', uptime: 0.97 },
              { date: '2026-03-23', status: 'down', uptime: 0.82 },
              { date: '2026-03-24', status: 'unknown' },
            ]}
            showSla
            slaTarget={0.999}
          />
          <div className="uptime-tracker-page__legend">
            <span className="uptime-tracker-page__legend-item">
              <span className="uptime-tracker-page__legend-dot" style={{ background: 'oklch(72% 0.19 155)' }} /> Up
            </span>
            <span className="uptime-tracker-page__legend-item">
              <span className="uptime-tracker-page__legend-dot" style={{ background: 'oklch(80% 0.18 85)' }} /> Degraded
            </span>
            <span className="uptime-tracker-page__legend-item">
              <span className="uptime-tracker-page__legend-dot" style={{ background: 'oklch(62% 0.22 25)' }} /> Down
            </span>
            <span className="uptime-tracker-page__legend-item">
              <span className="uptime-tracker-page__legend-dot" style={{ background: 'oklch(100% 0 0 / 0.08)' }} /> Unknown
            </span>
          </div>
        </div>
      </section>

      {/* ── 4. SLA Display ─────────────────────────────── */}
      <section className="uptime-tracker-page__section" id="sla">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#sla">SLA Compliance</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          Enable <code>showSla</code> to display the calculated uptime percentage and SLA target.
          The component calculates average uptime from all days with an uptime value.
        </p>
        <div className="uptime-tracker-page__preview uptime-tracker-page__preview--full" style={{ gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>99.9% SLA target — 30 day window</p>
            <TrackerComponent days={SAMPLE_30_DAYS} showSla slaTarget={0.999} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>100% uptime — 60 day window</p>
            <TrackerComponent days={SAMPLE_PERFECT} showSla slaTarget={0.999} />
          </div>
        </div>
      </section>

      {/* ── 5. 90-Day View ─────────────────────────────── */}
      <section className="uptime-tracker-page__section" id="ninety-days">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#ninety-days">90-Day View</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          The classic status page layout. Each thin bar represents one day. The component
          automatically distributes bars using flexbox with a 2px gap.
        </p>
        <div className="uptime-tracker-page__preview uptime-tracker-page__preview--full">
          <TrackerComponent days={SAMPLE_90_DAYS} showSla slaTarget={0.999} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<UptimeTracker\n  days={last90Days}\n  showSla\n  slaTarget={0.999}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Real-World Examples ─────────────────────── */}
      <section className="uptime-tracker-page__section" id="examples">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          Status page patterns showing multiple services with independent uptime tracks.
        </p>
        <div className="uptime-tracker-page__preview uptime-tracker-page__preview--full" style={{ gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>API Gateway</p>
            <TrackerComponent days={generateDays(30, 0.03, 0.01)} showSla slaTarget={0.999} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>Database Cluster</p>
            <TrackerComponent days={generateDays(30, 0.06, 0.02)} showSla slaTarget={0.995} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>CDN Edge Nodes</p>
            <TrackerComponent days={generateDays(30, 0.02, 0.005)} showSla slaTarget={0.9999} />
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="uptime-tracker-page__section" id="tiers">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple grid with title attributes.
          Standard adds hover tooltips, SLA calculation, and motion-level support.
        </p>

        <div className="uptime-tracker-page__tiers">
          {/* Lite */}
          <div
            className={`uptime-tracker-page__tier-card${tier === 'lite' ? ' uptime-tracker-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="uptime-tracker-page__tier-header">
              <span className="uptime-tracker-page__tier-name">Lite</span>
              <span className="uptime-tracker-page__tier-size">~0.3 KB</span>
            </div>
            <p className="uptime-tracker-page__tier-desc">
              CSS-only grid of status cells with native title tooltips.
              No hover animations, no SLA calculation, no JavaScript state.
            </p>
            <div className="uptime-tracker-page__tier-import">
              import {'{'} UptimeTracker {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="uptime-tracker-page__tier-preview">
              <LiteUptimeTracker days={SAMPLE_30_DAYS.slice(0, 15)} slaTarget={0.999} />
            </div>
            <div className="uptime-tracker-page__size-breakdown">
              <div className="uptime-tracker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`uptime-tracker-page__tier-card${tier === 'standard' ? ' uptime-tracker-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="uptime-tracker-page__tier-header">
              <span className="uptime-tracker-page__tier-name">Standard</span>
              <span className="uptime-tracker-page__tier-size">~1.8 KB</span>
            </div>
            <p className="uptime-tracker-page__tier-desc">
              Full-featured tracker with hover tooltips, SLA calculation,
              smooth hover scale animation, and motion-level support.
            </p>
            <div className="uptime-tracker-page__tier-import">
              import {'{'} UptimeTracker {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="uptime-tracker-page__tier-preview">
              <UptimeTracker days={SAMPLE_30_DAYS.slice(0, 15)} showSla slaTarget={0.999} />
            </div>
            <div className="uptime-tracker-page__size-breakdown">
              <div className="uptime-tracker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`uptime-tracker-page__tier-card${tier === 'premium' ? ' uptime-tracker-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="uptime-tracker-page__tier-header">
              <span className="uptime-tracker-page__tier-name">Premium</span>
              <span className="uptime-tracker-page__tier-size">~3.0 KB</span>
            </div>
            <p className="uptime-tracker-page__tier-desc">
              Everything in Standard plus staggered entrance animation,
              ambient glow on incident days, and spring-physics hover.
            </p>
            <div className="uptime-tracker-page__tier-import">
              import {'{'} UptimeTracker {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="uptime-tracker-page__tier-preview">
              <UptimeTracker days={SAMPLE_30_DAYS.slice(0, 15)} showSla slaTarget={0.999} />
            </div>
            <div className="uptime-tracker-page__size-breakdown">
              <div className="uptime-tracker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="uptime-tracker-page__section" id="props">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          All props accepted by UptimeTracker. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={uptimeProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="uptime-tracker-page__section" id="accessibility">
        <h2 className="uptime-tracker-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="uptime-tracker-page__section-desc">
          Designed for screen readers and keyboard users with proper ARIA roles.
        </p>
        <Card variant="default" padding="md">
          <ul className="uptime-tracker-page__a11y-list">
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> Container uses <code className="uptime-tracker-page__a11y-key">role="group"</code> with <code className="uptime-tracker-page__a11y-key">aria-label="Uptime history"</code>.
              </span>
            </li>
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Day labels:</strong> Each day has <code className="uptime-tracker-page__a11y-key">role="img"</code> with an <code className="uptime-tracker-page__a11y-key">aria-label</code> containing date, status, and uptime percentage.
              </span>
            </li>
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status colors:</strong> Uses perceptually distinct OKLCH colors (green/amber/red) that remain differentiable for colorblind users.
              </span>
            </li>
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Hover scale animations respect <code className="uptime-tracker-page__a11y-key">prefers-reduced-motion</code> and motion level 0 disables transitions.
              </span>
            </li>
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="uptime-tracker-page__a11y-key">forced-colors: active</code> with visible borders on each day cell.
              </span>
            </li>
            <li className="uptime-tracker-page__a11y-item">
              <span className="uptime-tracker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltip:</strong> Hover tooltips provide detailed date and status information without requiring a click action.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
