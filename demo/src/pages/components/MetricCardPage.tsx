'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { MetricCard } from '@ui/domain/metric-card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.mc-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: mc-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .mc-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .mc-page__hero::before {
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
        animation: mc-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes mc-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .mc-page__hero::before { animation: none; }
      }

      .mc-page__title {
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

      .mc-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .mc-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .mc-page__import-code {
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

      .mc-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .mc-page__section {
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
        animation: mc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes mc-section-reveal {
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
        .mc-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .mc-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .mc-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .mc-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .mc-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .mc-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      /* Subtle dot grid */
      .mc-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .mc-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .mc-page__preview--grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .mc-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .mc-page__playground {
          grid-template-columns: 1fr;
        }
        .mc-page__playground-controls {
          position: static !important;
        }
      }

      @container mc-page (max-width: 680px) {
        .mc-page__playground {
          grid-template-columns: 1fr;
        }
        .mc-page__playground-controls {
          position: static !important;
        }
      }

      .mc-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .mc-page__playground-result {
        overflow-x: auto;
        min-block-size: 250px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      /* Dot grid for playground result */
      .mc-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .mc-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .mc-page__playground-controls {
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

      .mc-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .mc-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .mc-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .mc-page__option-btn {
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
      .mc-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .mc-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .mc-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .mc-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .mc-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .mc-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .mc-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .mc-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .mc-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .mc-page__state-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
      }

      .mc-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .mc-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .mc-page__tier-card {
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
      .mc-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .mc-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .mc-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .mc-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .mc-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', monospace; }
      .mc-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; }
      .mc-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        line-height: 1.4;
      }
      .mc-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */

      .mc-page__code-tabs {
        margin-block-start: 1rem;
      }

      .mc-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .mc-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      .mc-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .mc-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .mc-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .mc-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Props table ──────────────────────────────────── */

      .mc-page__props-table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm, 0.875rem);
      }

      .mc-page__props-table th {
        text-align: start;
        padding: 0.5rem 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
        border-block-end: 2px solid var(--border-default);
        white-space: nowrap;
      }

      .mc-page__props-table td {
        padding: 0.5rem 0.75rem;
        border-block-end: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        vertical-align: top;
      }

      .mc-page__props-table td:first-child {
        font-weight: 600;
        color: var(--text-primary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
      }

      .mc-page__props-table td:nth-child(2) {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: oklch(from var(--brand) calc(l + 0.1) c h);
      }

      .mc-page__props-table td:nth-child(3) {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
      }

      .mc-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .mc-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s, border-color 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .mc-page__color-preset:hover { transform: scale(1.2); }
      .mc-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .mc-page__hero {
          padding: 2rem 1.25rem;
        }

        .mc-page__title {
          font-size: 1.75rem;
        }

        .mc-page__preview {
          padding: 1.75rem;
        }

        .mc-page__playground {
          grid-template-columns: 1fr;
        }

        .mc-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .mc-page__labeled-row {
          gap: 1rem;
        }

        .mc-page__states-grid {
          grid-template-columns: 1fr;
        }

        .mc-page__tiers {
          grid-template-columns: 1fr;
        }

        .mc-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .mc-page__tiers {
          grid-template-columns: 1fr;
        }
        .mc-page__hero {
          padding: 1.5rem 1rem;
        }
        .mc-page__title {
          font-size: 1.5rem;
        }
        .mc-page__preview {
          padding: 1rem;
        }
      }

      .mc-page__import-code, .mc-page code, pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }
    }
  }
`

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical'
type Trend = 'up' | 'down' | 'flat'

// ─── Constants ───────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { MetricCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { MetricCard } from '@annondeveloper/ui-kit'",
  premium: "import { MetricCard } from '@annondeveloper/ui-kit/premium'",
}

const SAMPLE_SPARKLINE = [12, 18, 14, 22, 19, 25, 28, 24, 30, 27, 35, 32]

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

// ─── Props Data ─────────────────────────────────────────────────────────────

interface PropDef {
  name: string
  type: string
  default?: string
  description: string
}

const metricCardProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', description: 'Label displayed above the metric value. Typically a short string describing the metric.' },
  { name: 'value', type: 'ReactNode', description: 'The primary numeric or text display. Rendered large and prominent.' },
  { name: 'change', type: '{ value: number; period?: string }', description: 'Percentage change indicator. Shows + prefix for positive values and optional comparison period.' },
  { name: 'trend', type: "'up' | 'down' | 'flat'", description: 'Directional arrow indicator. Colors: up = green, down = red, flat = neutral.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical'", description: 'Status accent: colored left border, ambient glow, and pulsing status dot.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon rendered in the header row next to the title.' },
  { name: 'sparkline', type: 'number[]', description: 'Array of numeric data points. Rendered as a mini SVG sparkline chart below the value.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a skeleton pulse animation and hides the value.' },
  { name: 'error', type: 'ReactNode', description: 'Error state content. Replaces value and hides change/sparkline when set.' },
  { name: 'empty', type: 'ReactNode', description: 'Empty state content shown when value is falsy and error is not set.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0=none, 1=subtle transitions, 2=fade-up entrance, 3=full physics.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="mc-page__copy-btn"
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
    <div className="mc-page__control-group">
      <span className="mc-page__control-label">{label}</span>
      <div className="mc-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`mc-page__option-btn${opt === value ? ' mc-page__option-btn--active' : ''}`}
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
    <label className="mc-page__toggle-label">
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
  value: string,
  trend: Trend | 'none',
  status: Status | 'none',
  changeVal: number,
  showSparkline: boolean,
  showIcon: boolean,
  loading: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = showIcon ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = [`  title="${title}"`, `  value="${value}"`]
  if (trend !== 'none') props.push(`  trend="${trend}"`)
  if (status !== 'none' && tier !== 'lite') props.push(`  status="${status}"`)
  if (changeVal !== 0) props.push(`  change={{ value: ${changeVal}, period: 'last month' }}`)
  if (showSparkline && tier !== 'lite') props.push(`  sparkline={[12, 18, 14, 22, 19, 25, 28, 24, 30, 27, 35, 32]}`)
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="activity" size="sm" />}')
  if (loading && tier !== 'lite') props.push('  loading')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}${iconImport}\n\n<MetricCard\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier,
  title: string,
  value: string,
  trend: Trend | 'none',
  status: Status | 'none',
): string {
  const statusAttr = status !== 'none' && tier !== 'lite' ? ` data-status="${status}"` : ''
  const trendHtml = trend !== 'none'
    ? `\n    <span class="ui-metric-card__trend" data-trend="${trend}">${trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'}</span>`
    : ''

  return `<!-- MetricCard \u2014 @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/metric-card.css">

<div class="ui-metric-card" role="group" aria-label="${title}"${statusAttr}>
  <div class="ui-metric-card__header">
    <h3 class="ui-metric-card__title">${title}</h3>
  </div>
  <div class="ui-metric-card__value">${value}</div>
  <div class="ui-metric-card__change">${trendHtml}
  </div>
</div>`
}

function generateVueCode(
  tier: Tier,
  title: string,
  value: string,
  trend: Trend | 'none',
  status: Status | 'none',
): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-metric-card" role="group" aria-label="${title}">
    <div class="ui-metric-card__header">
      <h3 class="ui-metric-card__title">${title}</h3>
    </div>
    <div class="ui-metric-card__value">${value}</div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/metric-card.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  title="${title}"`, `  value="${value}"`]
  if (trend !== 'none') attrs.push(`  trend="${trend}"`)
  if (status !== 'none') attrs.push(`  status="${status}"`)

  return `<template>
  <MetricCard
  ${attrs.join('\n  ')}
  />
</template>

<script setup>
import { MetricCard } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, title: string, value: string, status: Status | 'none'): string {
  const statusAttr = status !== 'none' && tier !== 'lite' ? ` data-status="${status}"` : ''
  const cssPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular \u2014 ${tier} tier -->\n<div class="ui-metric-card" role="group" aria-label="${title}"${statusAttr}>\n  <div class="ui-metric-card__header">\n    <h3 class="ui-metric-card__title">${title}</h3>\n  </div>\n  <div class="ui-metric-card__value">${value}</div>\n</div>\n\n/* styles.css */\n@import '${cssPath}/css/components/metric-card.css';`
}

function generateSvelteCode(tier: Tier, title: string, value: string, trend: Trend | 'none', status: Status | 'none'): string {
  if (tier === 'lite') {
    return `<div class="ui-metric-card" role="group" aria-label="${title}">\n  <div class="ui-metric-card__header">\n    <h3 class="ui-metric-card__title">${title}</h3>\n  </div>\n  <div class="ui-metric-card__value">${value}</div>\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/css/components/metric-card.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  title="${title}"`, `  value="${value}"`]
  if (trend !== 'none') attrs.push(`  trend="${trend}"`)
  if (status !== 'none') attrs.push(`  status="${status}"`)
  return `<script>\n  import { MetricCard } from '${importPath}';\n</script>\n\n<MetricCard\n${attrs.join('\n')}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [title, setTitle] = useState('Revenue')
  const [value, setValue] = useState('$48,290')
  const [trend, setTrend] = useState<Trend | 'none'>('up')
  const [status, setStatus] = useState<Status | 'none'>('ok')
  const [changeVal, setChangeVal] = useState(12)
  const [showSparkline, setShowSparkline] = useState(true)
  const [showIcon, setShowIcon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, title, value, trend, status, changeVal, showSparkline, showIcon, loading, motion),
    [tier, title, value, trend, status, changeVal, showSparkline, showIcon, loading, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, title, value, trend, status),
    [tier, title, value, trend, status],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, title, value, trend, status),
    [tier, title, value, trend, status],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, title, value, status),
    [tier, title, value, status],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, title, value, trend, status),
    [tier, title, value, trend, status],
  )

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

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  // Build preview card props
  const cardProps: Record<string, unknown> = { title, value }
  if (trend !== 'none') cardProps.trend = trend
  if (status !== 'none' && tier !== 'lite') cardProps.status = status
  if (changeVal !== 0) cardProps.change = { value: changeVal, period: 'last month' }
  if (showSparkline && tier !== 'lite') cardProps.sparkline = SAMPLE_SPARKLINE
  if (showIcon && tier !== 'lite') cardProps.icon = <Icon name="activity" size="sm" />
  if (loading && tier !== 'lite') cardProps.loading = true
  if (motion !== 3 && tier !== 'lite') cardProps.motion = motion

  // Brand color as inline CSS variable on the preview container
  const previewStyle: React.CSSProperties = brandColor !== '#6366f1'
    ? { '--brand': brandColor, '--brand-glow': `${brandColor}40` } as React.CSSProperties
    : {}

  return (
    <section className="mc-page__section" id="playground">
      <h2 className="mc-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="mc-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="mc-page__playground">
        {/* Preview area */}
        <div className="mc-page__playground-preview">
          <div className="mc-page__playground-result" style={{ ...previewStyle, maxInlineSize: '320px', margin: '0 auto' }}>
            <MetricCard {...cardProps as any} />
          </div>

          {/* Tabbed code output */}
          <div className="mc-page__code-tabs">
            <div className="mc-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="mc-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel */}
        <div className="mc-page__playground-controls">
          <OptionGroup
            label="Trend"
            options={['none', 'up', 'down', 'flat'] as const}
            value={trend}
            onChange={v => setTrend(v as Trend | 'none')}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Status"
              options={['none', 'ok', 'warning', 'critical'] as const}
              value={status}
              onChange={v => setStatus(v as Status | 'none')}
            />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="mc-page__control-group">
            <span className="mc-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Sparkline" checked={showSparkline} onChange={setShowSparkline} />}
              {tier !== 'lite' && <Toggle label="Icon" checked={showIcon} onChange={setShowIcon} />}
              {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
            </div>
          </div>

          <div className="mc-page__control-group">
            <span className="mc-page__control-label">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mc-page__text-input"
              placeholder="Metric title..."
            />
          </div>

          <div className="mc-page__control-group">
            <span className="mc-page__control-label">Value</span>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="mc-page__text-input"
              placeholder="Metric value..."
            />
          </div>

          <div className="mc-page__control-group">
            <span className="mc-page__control-label">Change %</span>
            <input
              type="number"
              value={changeVal}
              onChange={e => setChangeVal(Number(e.target.value))}
              className="mc-page__text-input"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MetricCardPage() {
  useStyles('mc-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)

  // Brand color as inline CSS variables (simple, no theme generator)
  const brandStyle: React.CSSProperties = brandColor !== '#6366f1'
    ? { '--brand': brandColor, '--brand-glow': `${brandColor}40`, '--brand-subtle': `${brandColor}20` } as React.CSSProperties
    : {}

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.mc-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
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
    <div className="mc-page" ref={pageRef} style={brandStyle}>

      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="mc-page__hero">
        <h1 className="mc-page__title">MetricCard</h1>
        <p className="mc-page__desc">
          Real-time stats display with trend indicators, status accents, sparkline charts,
          and container-adaptive layout. Ships in three tiers from CSS-only lite to aurora-glow premium.
        </p>
        <div className="mc-page__import-row">
          <code className="mc-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Status Variants ─────────────────────────── */}
      <section className="mc-page__section" id="statuses">
        <h2 className="mc-page__section-title">
          <a href="#statuses">Status Variants</a>
        </h2>
        <p className="mc-page__section-desc">
          Three status levels with color-coded left border, ambient glow shadows, and pulsing status dot.
          Status variants are available in standard and premium tiers.
        </p>
        <div className="mc-page__states-grid">
          <div className="mc-page__state-cell">
            <MetricCard
              title="Uptime"
              value="99.97%"
              status="ok"
              trend="up"
              change={{ value: 0.02, period: 'last week' }}
            />
            <span className="mc-page__state-label">ok</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard
              title="CPU Load"
              value="78%"
              status="warning"
              trend="up"
              change={{ value: 15, period: 'last hour' }}
            />
            <span className="mc-page__state-label">warning</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard
              title="Error Rate"
              value="4.2%"
              status="critical"
              trend="up"
              change={{ value: 280, period: 'yesterday' }}
            />
            <span className="mc-page__state-label">critical</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard
              title="Requests/s"
              value="1,247"
              trend="flat"
            />
            <span className="mc-page__state-label">no status</span>
          </div>
        </div>
      </section>

      {/* ── 4. Trend Indicators ────────────────────────── */}
      <section className="mc-page__section" id="trends">
        <h2 className="mc-page__section-title">
          <a href="#trends">Trend Indicators</a>
        </h2>
        <p className="mc-page__section-desc">
          Directional trend arrows with color-coded change percentages. Positive changes
          show green, negative red, and flat shows neutral.
        </p>
        <div className="mc-page__preview" style={{ gap: '1.5rem' }}>
          <div className="mc-page__labeled-item" style={{ flex: '1', minInlineSize: '180px', maxInlineSize: '260px' }}>
            <MetricCard
              title="Revenue"
              value="$48,290"
              trend="up"
              change={{ value: 12.5, period: 'last month' }}
            />
            <span className="mc-page__item-label">up (+12.5%)</span>
          </div>
          <div className="mc-page__labeled-item" style={{ flex: '1', minInlineSize: '180px', maxInlineSize: '260px' }}>
            <MetricCard
              title="Churn Rate"
              value="2.4%"
              trend="down"
              change={{ value: -8, period: 'last quarter' }}
            />
            <span className="mc-page__item-label">down (-8%)</span>
          </div>
          <div className="mc-page__labeled-item" style={{ flex: '1', minInlineSize: '180px', maxInlineSize: '260px' }}>
            <MetricCard
              title="Active Users"
              value="12,400"
              trend="flat"
              change={{ value: 0, period: 'yesterday' }}
            />
            <span className="mc-page__item-label">flat (0%)</span>
          </div>
        </div>
      </section>

      {/* ── 5. Sparkline Integration ────────────────────── */}
      <section className="mc-page__section" id="sparkline">
        <h2 className="mc-page__section-title">
          <a href="#sparkline">Sparkline Integration</a>
        </h2>
        <p className="mc-page__section-desc">
          Pass an array of numeric data points to render a mini SVG sparkline below the value.
          The chart auto-scales to fit the container and includes a gradient fill area.
        </p>
        <div className="mc-page__preview" style={{ gap: '1.5rem' }}>
          <div style={{ flex: '1', minInlineSize: '200px', maxInlineSize: '300px' }}>
            <MetricCard
              title="Daily Active Users"
              value="32,847"
              trend="up"
              change={{ value: 18, period: 'last week' }}
              sparkline={[20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50]}
              status="ok"
            />
          </div>
          <div style={{ flex: '1', minInlineSize: '200px', maxInlineSize: '300px' }}>
            <MetricCard
              title="Response Time"
              value="142ms"
              trend="down"
              change={{ value: -22, period: 'last deploy' }}
              sparkline={[180, 165, 170, 155, 160, 148, 152, 145, 142, 138, 140, 142]}
            />
          </div>
          <div style={{ flex: '1', minInlineSize: '200px', maxInlineSize: '300px' }}>
            <MetricCard
              title="Memory Usage"
              value="6.2 GB"
              trend="up"
              change={{ value: 5, period: 'last hour' }}
              sparkline={[4.8, 5.0, 5.2, 5.1, 5.5, 5.4, 5.8, 5.7, 6.0, 5.9, 6.1, 6.2]}
              status="warning"
            />
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<MetricCard\n  title="Daily Active Users"\n  value="32,847"\n  trend="up"\n  change={{ value: 18, period: 'last week' }}\n  sparkline={[20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50]}\n  status="ok"\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. States ──────────────────────────────────── */}
      <section className="mc-page__section" id="states">
        <h2 className="mc-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="mc-page__section-desc">
          MetricCard handles loading, error, and empty states gracefully with built-in UI.
        </p>
        <div className="mc-page__states-grid">
          <div className="mc-page__state-cell">
            <MetricCard title="Revenue" value="$48,290" trend="up" change={{ value: 12, period: 'last month' }} />
            <span className="mc-page__state-label">Default</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard title="Revenue" value="$48,290" loading />
            <span className="mc-page__state-label">Loading</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard title="Revenue" value="" error="Failed to fetch data" />
            <span className="mc-page__state-label">Error</span>
          </div>
          <div className="mc-page__state-cell">
            <MetricCard title="Revenue" value="" empty="No data yet" />
            <span className="mc-page__state-label">Empty</span>
          </div>
        </div>
      </section>

      {/* ── 7. Dashboard Grid Example ──────────────────── */}
      <section className="mc-page__section" id="dashboard">
        <h2 className="mc-page__section-title">
          <a href="#dashboard">Dashboard Grid</a>
        </h2>
        <p className="mc-page__section-desc">
          MetricCards work great in grid layouts. Container queries automatically adapt
          the layout — hiding sparklines and headers in narrow containers.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.5rem',
          background: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
        }}>
          <MetricCard
            title="Total Revenue"
            value="$142,847"
            trend="up"
            status="ok"
            change={{ value: 18, period: 'last month' }}
            sparkline={[85, 90, 88, 95, 100, 105, 110, 115, 120, 125, 135, 142]}
          />
          <MetricCard
            title="Active Users"
            value="8,294"
            trend="up"
            change={{ value: 7, period: 'last week' }}
            sparkline={[6500, 6800, 7000, 7200, 7500, 7700, 7900, 8000, 8100, 8200, 8250, 8294]}
          />
          <MetricCard
            title="Error Rate"
            value="0.12%"
            trend="down"
            status="ok"
            change={{ value: -45, period: 'last deploy' }}
          />
          <MetricCard
            title="Avg Response"
            value="89ms"
            trend="down"
            change={{ value: -12, period: 'last hour' }}
            sparkline={[120, 115, 110, 105, 100, 98, 95, 92, 90, 89, 88, 89]}
          />
        </div>
      </section>

      {/* ── 9. Weight Tiers ────────────────────────────── */}
      <section className="mc-page__section" id="tiers">
        <h2 className="mc-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="mc-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same visual design.
          Lite is CSS-only, Standard adds status/sparkline/motion, Premium adds aurora glow and spring animations.
        </p>

        <div className="mc-page__tiers">
          {/* Lite */}
          <div
            className={`mc-page__tier-card${tier === 'lite' ? ' mc-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="mc-page__tier-header">
              <span className="mc-page__tier-name">Lite</span>
              <span className="mc-page__tier-size">~1.2 KB</span>
            </div>
            <p className="mc-page__tier-desc">
              CSS-only stats card. Title, value, and basic trend display.
              No sparkline, no status glow, no motion.
            </p>
            <div className="mc-page__tier-import">
              {IMPORT_STRINGS.lite}
            </div>
            <div className="mc-page__tier-preview">
              <MetricCard title="Revenue" value="$48,290" trend="up" change={{ value: 12, period: 'last month' }} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`mc-page__tier-card${tier === 'standard' ? ' mc-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="mc-page__tier-header">
              <span className="mc-page__tier-name">Standard</span>
              <span className="mc-page__tier-size">~3.5 KB</span>
            </div>
            <p className="mc-page__tier-desc">
              Full-featured MetricCard with sparkline, status glow, pulsing dot,
              icon support, loading/error/empty states, and motion levels.
            </p>
            <div className="mc-page__tier-import">
              {IMPORT_STRINGS.standard}
            </div>
            <div className="mc-page__tier-preview">
              <MetricCard
                title="Revenue"
                value="$48,290"
                trend="up"
                status="ok"
                change={{ value: 12, period: 'last month' }}
                sparkline={SAMPLE_SPARKLINE}
                icon={<Icon name="activity" size="sm" />}
              />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`mc-page__tier-card${tier === 'premium' ? ' mc-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="mc-page__tier-header">
              <span className="mc-page__tier-name">Premium</span>
              <span className="mc-page__tier-size">~5.2 KB</span>
            </div>
            <p className="mc-page__tier-desc">
              Everything in Standard plus aurora atmospheric glow, spring-based entrance
              animation, hover lift, and cinematic motion at level 3.
            </p>
            <div className="mc-page__tier-import">
              {IMPORT_STRINGS.premium}
            </div>
            <div className="mc-page__tier-preview">
              <MetricCard
                title="Revenue"
                value="$48,290"
                trend="up"
                status="ok"
                change={{ value: 12, period: 'last month' }}
                sparkline={SAMPLE_SPARKLINE}
                icon={<Icon name="activity" size="sm" />}
                motion={3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Brand Color ────────────────────────────── */}
      <section className="mc-page__section" id="brand-color">
        <h2 className="mc-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="mc-page__section-desc">
          Customize the accent color used across all MetricCards. The component inherits
          brand color from CSS custom properties.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="mc-page__control-group">
            <span className="mc-page__control-label">Hex Color</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div
                style={{
                  inlineSize: '32px',
                  blockSize: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: brandColor,
                  border: '2px solid var(--border-default)',
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                value={brandColor}
                onChange={e => {
                  const val = e.target.value
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBrandColor(val)
                }}
                className="mc-page__text-input"
                placeholder="#6366f1"
                style={{ maxInlineSize: '120px' }}
              />
            </div>
          </div>
          <div className="mc-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`mc-page__color-preset${brandColor === p.hex ? ' mc-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 11. Props API ───────────────────────────────── */}
      <section className="mc-page__section" id="props">
        <h2 className="mc-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="mc-page__section-desc">
          All props accepted by MetricCard. It also spreads any native HTML div attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <div style={{ overflowX: 'auto' }}>
            <table className="mc-page__props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {metricCardProps.map(prop => (
                  <tr key={prop.name}>
                    <td>{prop.name}</td>
                    <td>{prop.type}</td>
                    <td>{prop.default ?? '\u2014'}</td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ── 12. Accessibility ──────────────────────────── */}
      <section className="mc-page__section" id="accessibility">
        <h2 className="mc-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="mc-page__section-desc">
          MetricCard is built with comprehensive accessibility support following WAI-ARIA best practices.
        </p>
        <Card variant="default" padding="md">
          <ul className="mc-page__a11y-list">
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Uses <code className="mc-page__a11y-key">role="group"</code> with <code className="mc-page__a11y-key">aria-label</code> set to the card title.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status dot:</strong> Pulsing status indicator is marked <code className="mc-page__a11y-key">aria-hidden="true"</code> since status is conveyed through the border.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Trend arrows:</strong> Include <code className="mc-page__a11y-key">aria-label</code> describing the trend direction for screen readers.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Sparkline:</strong> SVG chart is marked <code className="mc-page__a11y-key">aria-hidden="true"</code> as it's decorative. Data is available in the value.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Loading state uses <code className="mc-page__a11y-key">data-loading</code> attribute with skeleton animation.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="mc-page__a11y-key">prefers-reduced-motion</code>. Status pulse animation disabled at motion level 0 and 1.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="mc-page__a11y-key">forced-colors: active</code> with visible 2px borders and hidden decorative gradients.
              </span>
            </li>
            <li className="mc-page__a11y-item">
              <span className="mc-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Removes shadows and gradients, adds solid border, prevents page break inside card.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
