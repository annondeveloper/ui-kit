'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TimeSeriesChart, type TimeSeriesSeries } from '@ui/domain/time-series-chart'
import { TimeSeriesChart as LiteTimeSeriesChart } from '@ui/lite/time-series-chart'
import { TimeSeriesChart as PremiumTimeSeriesChart } from '@ui/premium/time-series-chart'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

function generateSampleData(): TimeSeriesSeries[] {
  const now = Date.now()
  const hour = 3_600_000
  const points = 48 // 30-minute intervals over 24h

  const cpuData = Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * (hour / 2),
    value: 30 + Math.sin(i * 0.3) * 20 + Math.random() * 10 + (i > 30 ? 15 : 0),
  }))

  const memoryData = Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * (hour / 2),
    value: 55 + Math.sin(i * 0.15) * 10 + Math.random() * 5 + i * 0.3,
  }))

  const networkData = Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * (hour / 2),
    value: 10 + Math.abs(Math.sin(i * 0.5)) * 40 + Math.random() * 15,
  }))

  return [
    { id: 'cpu', label: 'CPU Usage (%)', data: cpuData, color: 'oklch(65% 0.2 270)' },
    { id: 'memory', label: 'Memory (%)', data: memoryData, color: 'oklch(72% 0.19 155)' },
    { id: 'network', label: 'Network (Mbps)', data: networkData, color: 'oklch(70% 0.2 30)' },
  ]
}

const ALL_SERIES = generateSampleData()

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.time-series-chart-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: time-series-chart-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .time-series-chart-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .time-series-chart-page__hero::before {
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
        animation: tsc-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes tsc-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .time-series-chart-page__hero::before { animation: none; }
      }

      .time-series-chart-page__title {
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

      .time-series-chart-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .time-series-chart-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .time-series-chart-page__import-code {
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

      .time-series-chart-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .time-series-chart-page__section {
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
        animation: tsc-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tsc-page-section-reveal {
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
        .time-series-chart-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .time-series-chart-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .time-series-chart-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .time-series-chart-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .time-series-chart-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .time-series-chart-page__preview {
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

      .time-series-chart-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .time-series-chart-page__preview--full {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .time-series-chart-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .time-series-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .time-series-chart-page__playground-controls {
          position: static !important;
        }
      }

      @container time-series-chart-page (max-width: 680px) {
        .time-series-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .time-series-chart-page__playground-controls {
          position: static !important;
        }
      }

      .time-series-chart-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .time-series-chart-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .time-series-chart-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .time-series-chart-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .time-series-chart-page__playground-controls {
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

      .time-series-chart-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .time-series-chart-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .time-series-chart-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .time-series-chart-page__option-btn {
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
      .time-series-chart-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .time-series-chart-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .time-series-chart-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Series toggles ─────────────────────────────── */

      .time-series-chart-page__series-toggles {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .time-series-chart-page__series-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .time-series-chart-page__series-swatch {
        inline-size: 0.75rem;
        block-size: 0.1875rem;
        border-radius: 1px;
        flex-shrink: 0;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .time-series-chart-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .time-series-chart-page__tier-card {
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

      .time-series-chart-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .time-series-chart-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .time-series-chart-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .time-series-chart-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .time-series-chart-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .time-series-chart-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .time-series-chart-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .time-series-chart-page__tier-import {
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

      .time-series-chart-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .time-series-chart-page__code-tabs {
        margin-block-start: 1rem;
      }

      .time-series-chart-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .time-series-chart-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .time-series-chart-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .time-series-chart-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .time-series-chart-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .time-series-chart-page__a11y-key {
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
        .time-series-chart-page__hero { padding: 2rem 1.25rem; }
        .time-series-chart-page__title { font-size: 1.75rem; }
        .time-series-chart-page__preview { padding: 1.75rem; }
        .time-series-chart-page__playground { grid-template-columns: 1fr; }
        .time-series-chart-page__playground-result { padding: 1rem; overflow-x: auto;
        min-block-size: 120px; }
        .time-series-chart-page__tiers { grid-template-columns: 1fr; }
        .time-series-chart-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .time-series-chart-page__hero { padding: 1.5rem 1rem; }
        .time-series-chart-page__title { font-size: 1.5rem; }
        .time-series-chart-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .time-series-chart-page__import-code,
      .time-series-chart-page code,
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

const chartProps: PropDef[] = [
  { name: 'series', type: 'TimeSeriesSeries[]', description: 'Array of data series. Each has id, label, data points (timestamp + value), and optional color.' },
  { name: 'height', type: 'number', default: '200', description: 'Chart height in pixels.' },
  { name: 'showXAxis', type: 'boolean', default: 'true', description: 'Show time labels along the x-axis.' },
  { name: 'showYAxis', type: 'boolean', default: 'true', description: 'Show value labels along the y-axis.' },
  { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show horizontal grid lines.' },
  { name: 'showTooltip', type: 'boolean', default: 'true', description: 'Show crosshair and tooltip on hover.' },
  { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show legend below the chart when multiple series exist.' },
  { name: 'yMin', type: 'number', description: 'Override minimum y-axis value. Auto-calculated if not set.' },
  { name: 'yMax', type: 'number', description: 'Override maximum y-axis value. Auto-calculated if not set.' },
  { name: 'formatValue', type: '(v: number) => string', description: 'Custom value formatter for y-axis labels and tooltips.' },
  { name: 'formatTime', type: '(t: number) => string', description: 'Custom time formatter for x-axis labels.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls line draw animation speed.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TimeSeriesChart } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TimeSeriesChart } from '@annondeveloper/ui-kit'",
  premium: "import { TimeSeriesChart } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="time-series-chart-page__copy-btn"
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
    <div className="time-series-chart-page__control-group">
      <span className="time-series-chart-page__control-label">{label}</span>
      <div className="time-series-chart-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`time-series-chart-page__option-btn${opt === value ? ' time-series-chart-page__option-btn--active' : ''}`}
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
    <label className="time-series-chart-page__toggle-label">
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
  showGrid: boolean,
  showXAxis: boolean,
  showYAxis: boolean,
  showTooltip: boolean,
  showLegend: boolean,
  height: number,
  enabledSeries: string[],
): string {
  const importStr = IMPORT_STRINGS[tier]

  const seriesDef = `const series = [
  { id: 'cpu', label: 'CPU Usage (%)', data: cpuData, color: 'oklch(65% 0.2 270)' },
  { id: 'memory', label: 'Memory (%)', data: memoryData, color: 'oklch(72% 0.19 155)' },
  { id: 'network', label: 'Network (Mbps)', data: networkData, color: 'oklch(70% 0.2 30)' },
]`

  const props: string[] = ['  series={series}']
  if (height !== 200) props.push(`  height={${height}}`)
  if (!showGrid) props.push('  showGrid={false}')
  if (!showXAxis) props.push('  showXAxis={false}')
  if (!showYAxis) props.push('  showYAxis={false}')
  if (!showTooltip && tier !== 'lite') props.push('  showTooltip={false}')
  if (!showLegend && tier !== 'lite') props.push('  showLegend={false}')

  return `${importStr}\n\n${seriesDef}\n\n<TimeSeriesChart\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, height: number): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  return `<!-- TimeSeriesChart — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/time-series-chart.css">

<!-- TimeSeriesChart is an interactive SVG component. -->
<!-- For non-React usage, use the CSS classes with server-rendered SVG. -->
<div class="ui-time-series-chart" style="height: ${height}px;">
  <svg role="img" aria-label="Time series chart">
    <!-- Render series paths, grid, and axes server-side -->
  </svg>
</div>`
}

function generateVueCode(tier: Tier, showGrid: boolean, showXAxis: boolean, showYAxis: boolean, height: number): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':series="series"']
  if (height !== 200) attrs.push(`:height="${height}"`)
  if (!showGrid) attrs.push(':show-grid="false"')
  if (!showXAxis) attrs.push(':show-x-axis="false"')
  if (!showYAxis) attrs.push(':show-y-axis="false"')

  return `<template>
  <TimeSeriesChart
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { TimeSeriesChart } from '${importPath}'

const series = [
  { id: 'cpu', label: 'CPU (%)', data: cpuData },
  { id: 'memory', label: 'Memory (%)', data: memoryData },
]
</script>`
}

function generateAngularCode(tier: Tier, height: number): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<div class="ui-time-series-chart" style="height: ${height}px;">
  <!-- Use server-rendered SVG or React integration -->
</div>

/* Import component CSS */
@import '${importPath}/css/components/time-series-chart.css';`
}

function generateSvelteCode(tier: Tier, showGrid: boolean, showXAxis: boolean, showYAxis: boolean, height: number): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = ['{series}']
  if (height !== 200) attrs.push(`height={${height}}`)
  if (!showGrid) attrs.push('showGrid={false}')
  if (!showXAxis) attrs.push('showXAxis={false}')
  if (!showYAxis) attrs.push('showYAxis={false}')

  return `<script>
  import { TimeSeriesChart } from '${importPath}';

  const series = [
    { id: 'cpu', label: 'CPU (%)', data: cpuData },
    { id: 'memory', label: 'Memory (%)', data: memoryData },
  ];
</script>

<TimeSeriesChart
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [showGrid, setShowGrid] = useState(true)
  const [showXAxis, setShowXAxis] = useState(true)
  const [showYAxis, setShowYAxis] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [height, setHeight] = useState(250)
  const [enabledSeries, setEnabledSeries] = useState<string[]>(['cpu', 'memory', 'network'])
  const [copyStatus, setCopyStatus] = useState('')

  const visibleSeries = useMemo(
    () => ALL_SERIES.filter(s => enabledSeries.includes(s.id)),
    [enabledSeries],
  )

  const toggleSeries = useCallback((id: string) => {
    setEnabledSeries(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev // keep at least one
        return prev.filter(s => s !== id)
      }
      return [...prev, id]
    })
  }, [])

  const ChartComponent = tier === 'lite'
    ? (props: any) => <LiteTimeSeriesChart {...props} />
    : tier === 'premium'
    ? PremiumTimeSeriesChart
    : TimeSeriesChart

  const reactCode = useMemo(
    () => generateReactCode(tier, showGrid, showXAxis, showYAxis, showTooltip, showLegend, height, enabledSeries),
    [tier, showGrid, showXAxis, showYAxis, showTooltip, showLegend, height, enabledSeries],
  )

  const htmlCode = useMemo(() => generateHtmlCode(tier, height), [tier, height])
  const vueCode = useMemo(() => generateVueCode(tier, showGrid, showXAxis, showYAxis, height), [tier, showGrid, showXAxis, showYAxis, height])
  const angularCode = useMemo(() => generateAngularCode(tier, height), [tier, height])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showGrid, showXAxis, showYAxis, height), [tier, showGrid, showXAxis, showYAxis, height])

  const [activeCodeTab, setActiveCodeTab] = useState('react')
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

  const previewProps: Record<string, unknown> = {
    series: visibleSeries,
    height,
    showGrid,
    showXAxis,
    showYAxis,
  }
  if (tier !== 'lite') {
    previewProps.showTooltip = showTooltip
    previewProps.showLegend = showLegend
  }

  return (
    <section className="time-series-chart-page__section" id="playground">
      <h2 className="time-series-chart-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="time-series-chart-page__section-desc">
        Toggle series, adjust display options, and see the chart update in real-time with generated code.
      </p>

      <div className="time-series-chart-page__playground">
        <div className="time-series-chart-page__playground-preview">
          <div className="time-series-chart-page__playground-result">
            <ChartComponent {...previewProps} />
          </div>

          <div className="time-series-chart-page__code-tabs">
            <div className="time-series-chart-page__export-row">
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
              {copyStatus && <span className="time-series-chart-page__export-status">{copyStatus}</span>}
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

        <div className="time-series-chart-page__playground-controls">
          {/* Series toggles */}
          <div className="time-series-chart-page__control-group">
            <span className="time-series-chart-page__control-label">Series</span>
            <div className="time-series-chart-page__series-toggles">
              {ALL_SERIES.map(s => (
                <label key={s.id} className="time-series-chart-page__series-toggle">
                  <input
                    type="checkbox"
                    checked={enabledSeries.includes(s.id)}
                    onChange={() => toggleSeries(s.id)}
                    style={{ accentColor: s.color }}
                  />
                  <span className="time-series-chart-page__series-swatch" style={{ background: s.color }} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="time-series-chart-page__control-group">
            <span className="time-series-chart-page__control-label">Height</span>
            <input
              type="range"
              min={120}
              max={400}
              value={height}
              onChange={e => setHeight(Number(e.target.value))}
              style={{ accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{height}px</span>
          </div>

          <div className="time-series-chart-page__control-group">
            <span className="time-series-chart-page__control-label">Display</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Grid lines" checked={showGrid} onChange={setShowGrid} />
              <Toggle label="X axis" checked={showXAxis} onChange={setShowXAxis} />
              <Toggle label="Y axis" checked={showYAxis} onChange={setShowYAxis} />
              {tier !== 'lite' && <Toggle label="Tooltip" checked={showTooltip} onChange={setShowTooltip} />}
              {tier !== 'lite' && <Toggle label="Legend" checked={showLegend} onChange={setShowLegend} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimeSeriesChartPage() {
  useStyles('time-series-chart-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.time-series-chart-page__section')
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

  const ChartComponent = tier === 'lite'
    ? (props: any) => <LiteTimeSeriesChart {...props} />
    : tier === 'premium'
    ? PremiumTimeSeriesChart
    : TimeSeriesChart

  const singleSeries = useMemo(() => [ALL_SERIES[0]], [])
  const dualSeries = useMemo(() => [ALL_SERIES[0], ALL_SERIES[1]], [])

  return (
    <div className="time-series-chart-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="time-series-chart-page__hero">
        <h1 className="time-series-chart-page__title">TimeSeriesChart</h1>
        <p className="time-series-chart-page__desc">
          Interactive time series visualization with multiple series, crosshair tooltip,
          animated line drawing, and auto-scaling axes. Zero dependencies — pure SVG rendering.
        </p>
        <div className="time-series-chart-page__import-row">
          <code className="time-series-chart-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Single Series ───────────────────────────── */}
      <section className="time-series-chart-page__section" id="single-series">
        <h2 className="time-series-chart-page__section-title">
          <a href="#single-series">Single Series</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          A single data series with auto-scaling Y axis. The legend is hidden when only one series is present.
        </p>
        <div className="time-series-chart-page__preview time-series-chart-page__preview--full">
          <ChartComponent series={singleSeries} height={180} />
        </div>
      </section>

      {/* ── 4. Multiple Series ─────────────────────────── */}
      <section className="time-series-chart-page__section" id="multi-series">
        <h2 className="time-series-chart-page__section-title">
          <a href="#multi-series">Multiple Series</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          Multiple overlaid series with distinct colors. The legend and crosshair tooltip show all series values at the hovered timestamp.
        </p>
        <div className="time-series-chart-page__preview time-series-chart-page__preview--full">
          <ChartComponent series={ALL_SERIES} height={220} />
        </div>
      </section>

      {/* ── 5. Minimal (no chrome) ─────────────────────── */}
      <section className="time-series-chart-page__section" id="minimal">
        <h2 className="time-series-chart-page__section-title">
          <a href="#minimal">Minimal Mode</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          Disable grid, axes, and legend for a sparkline-like compact visualization. Useful for dashboards and inline metrics.
        </p>
        <div className="time-series-chart-page__preview time-series-chart-page__preview--full">
          <ChartComponent
            series={dualSeries}
            height={100}
            showGrid={false}
            showXAxis={false}
            showYAxis={false}
            {...(tier !== 'lite' ? { showLegend: false, showTooltip: true } : {})}
          />
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="time-series-chart-page__section" id="tiers">
        <h2 className="time-series-chart-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          Choose between three weight tiers. Lite is static SVG polylines, Standard adds interactivity and animation,
          Premium adds glow effects, enhanced draw animation, and shimmer overlay.
        </p>

        <div className="time-series-chart-page__tiers">
          {/* Lite */}
          <div
            className={`time-series-chart-page__tier-card${tier === 'lite' ? ' time-series-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="time-series-chart-page__tier-header">
              <span className="time-series-chart-page__tier-name">Lite</span>
              <span className="time-series-chart-page__tier-size">~1 KB</span>
            </div>
            <p className="time-series-chart-page__tier-desc">
              Static SVG polylines. No animation, no tooltip, no interactivity. Lightweight chart for static dashboards.
            </p>
            <div className="time-series-chart-page__tier-import">
              import {'{'} TimeSeriesChart {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="time-series-chart-page__tier-preview">
              <LiteTimeSeriesChart series={singleSeries} height={80} width={200} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`time-series-chart-page__tier-card${tier === 'standard' ? ' time-series-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="time-series-chart-page__tier-header">
              <span className="time-series-chart-page__tier-name">Standard</span>
              <span className="time-series-chart-page__tier-size">~4 KB</span>
            </div>
            <p className="time-series-chart-page__tier-desc">
              Full-featured with crosshair tooltip, responsive width, line draw animation, legend, and motion levels.
            </p>
            <div className="time-series-chart-page__tier-import">
              import {'{'} TimeSeriesChart {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="time-series-chart-page__tier-preview">
              <TimeSeriesChart series={singleSeries} height={80} />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`time-series-chart-page__tier-card${tier === 'premium' ? ' time-series-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="time-series-chart-page__tier-header">
              <span className="time-series-chart-page__tier-name">Premium</span>
              <span className="time-series-chart-page__tier-size">~5 KB</span>
            </div>
            <p className="time-series-chart-page__tier-desc">
              Everything in Standard plus line glow, enhanced draw animation with shimmer,
              grid fade-in, glowing hover dots, and frosted tooltip.
            </p>
            <div className="time-series-chart-page__tier-import">
              import {'{'} TimeSeriesChart {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="time-series-chart-page__tier-preview">
              <PremiumTimeSeriesChart series={singleSeries} height={80} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="time-series-chart-page__section" id="props">
        <h2 className="time-series-chart-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          All props accepted by TimeSeriesChart. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={chartProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="time-series-chart-page__section" id="accessibility">
        <h2 className="time-series-chart-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="time-series-chart-page__section-desc">
          Built with semantic SVG and ARIA attributes for screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="time-series-chart-page__a11y-list">
            <li className="time-series-chart-page__a11y-item">
              <span className="time-series-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> SVG element uses <code className="time-series-chart-page__a11y-key">role="img"</code> with descriptive aria-label.
              </span>
            </li>
            <li className="time-series-chart-page__a11y-item">
              <span className="time-series-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Line draw animation respects <code className="time-series-chart-page__a11y-key">prefers-reduced-motion</code> — instantly displays when enabled.
              </span>
            </li>
            <li className="time-series-chart-page__a11y-item">
              <span className="time-series-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="time-series-chart-page__a11y-key">forced-colors: active</code> with CanvasText and GrayText for lines and grid.
              </span>
            </li>
            <li className="time-series-chart-page__a11y-item">
              <span className="time-series-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Responsive:</strong> Chart width adapts via ResizeObserver. The SVG reflows to any container width.
              </span>
            </li>
            <li className="time-series-chart-page__a11y-item">
              <span className="time-series-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Colors:</strong> Series use distinct OKLCH hues with sufficient contrast separation for color-blind users.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
