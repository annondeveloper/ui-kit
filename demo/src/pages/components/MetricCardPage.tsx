'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { MetricCard } from '@ui/domain/metric-card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.metric-card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: metric-card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .metric-card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .metric-card-page__hero::before {
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
        .metric-card-page__hero::before { animation: none; }
      }

      .metric-card-page__title {
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

      .metric-card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .metric-card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .metric-card-page__import-code {
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

      .metric-card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .metric-card-page__section {
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
        .metric-card-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .metric-card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .metric-card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .metric-card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .metric-card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .metric-card-page__preview {
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

      /* Subtle dot grid */
      .metric-card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .metric-card-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .metric-card-page__preview--grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .metric-card-page__preview--dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        padding: 2rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .metric-card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .metric-card-page__playground {
          grid-template-columns: 1fr;
        }
        .metric-card-page__playground-controls {
          position: static !important;
        }
      }

      @container metric-card-page (max-width: 680px) {
        .metric-card-page__playground {
          grid-template-columns: 1fr;
        }
        .metric-card-page__playground-controls {
          position: static !important;
        }
      }

      .metric-card-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .metric-card-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      /* Dot grid for playground result */
      .metric-card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .metric-card-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .metric-card-page__playground-controls {
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

      .metric-card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .metric-card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metric-card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .metric-card-page__option-btn {
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
      .metric-card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .metric-card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .metric-card-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .metric-card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .metric-card-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .metric-card-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .metric-card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .metric-card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .metric-card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .metric-card-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .metric-card-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .metric-card-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .metric-card-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Tier selector ──────────────────────────────── */

      .metric-card-page__tier-selector {
        display: flex;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
        inline-size: fit-content;
        background: var(--bg-surface);
        box-shadow: var(--shadow-sm, 0 1px 3px oklch(0% 0 0 / 0.08));
      }

      .metric-card-page__tier-btn {
        padding: 0.5rem 1rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        font-family: inherit;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.12s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
        line-height: 1.2;
      }
      .metric-card-page__tier-btn:not(:last-child) {
        border-inline-end: 1px solid var(--border-default);
      }
      .metric-card-page__tier-btn:hover {
        background: var(--border-subtle);
        color: var(--text-primary);
      }
      .metric-card-page__tier-btn--active {
        background: linear-gradient(135deg, var(--brand) 0%, oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h) 100%);
        color: oklch(100% 0 0);
        box-shadow: 0 2px 8px var(--brand-glow);
      }
      .metric-card-page__tier-btn--active:hover {
        background: linear-gradient(135deg, var(--brand) 0%, oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h) 100%);
        color: oklch(100% 0 0);
      }

      .metric-card-page__tier-size-label {
        font-size: 0.5625rem;
        font-weight: 400;
        opacity: 0.7;
      }

      /* ── Color picker ──────────────────────────────── */

      .metric-card-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .metric-card-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .metric-card-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .metric-card-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .metric-card-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .metric-card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .metric-card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .metric-card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .metric-card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .metric-card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .metric-card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .metric-card-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .metric-card-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Feature sub-heading ────────────────────────── */

      .metric-card-page__feature-heading {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.75rem;
        padding-block-start: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .metric-card-page__hero {
          padding: 2rem 1.25rem;
        }

        .metric-card-page__title {
          font-size: 1.75rem;
        }

        .metric-card-page__preview {
          padding: 1.75rem;
        }

        .metric-card-page__playground {
          grid-template-columns: 1fr;
        }

        .metric-card-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .metric-card-page__labeled-row {
          gap: 1rem;
        }

        .metric-card-page__tier-selector {
          flex-wrap: wrap;
          inline-size: 100%;
        }

        .metric-card-page__tier-btn {
          flex: 1;
          min-inline-size: 0;
        }

        .metric-card-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .metric-card-page__section {
          padding: 1.25rem;
        }

        .metric-card-page__preview--dashboard,
        .metric-card-page__preview--grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .metric-card-page__hero {
          padding: 1.5rem 1rem;
        }

        .metric-card-page__title {
          font-size: 1.5rem;
        }

        .metric-card-page__preview {
          padding: 1rem;
        }

        .metric-card-page__states-grid {
          grid-template-columns: 1fr;
        }

        .metric-card-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .metric-card-page__title {
          font-size: 4rem;
        }

        .metric-card-page__preview {
          padding: 3.5rem;
        }

        .metric-card-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .metric-card-page__import-code,
      .metric-card-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

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
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const metricCardProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', required: true, description: 'Header label describing the metric (e.g., "Revenue", "Users").' },
  { name: 'value', type: 'ReactNode', required: true, description: 'The primary metric value displayed prominently.' },
  { name: 'change', type: '{ value: number; period?: string }', description: 'Percentage change with optional comparison period (e.g., { value: 12.5, period: "last month" }).' },
  { name: 'trend', type: "'up' | 'down' | 'flat'", description: 'Trend direction indicator arrow. Colored green (up), red (down), or neutral (flat).' },
  { name: 'status', type: "'ok' | 'warning' | 'critical'", description: 'Status accent — adds a colored left border to indicate health.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element rendered in the header row next to the title.' },
  { name: 'sparkline', type: 'number[]', description: 'Array of numeric data points rendered as a mini sparkline chart below the value. Requires at least 2 points.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a pulsing skeleton placeholder for the value.' },
  { name: 'error', type: 'ReactNode', description: 'Error state content — replaces the value when present.' },
  { name: 'empty', type: 'ReactNode', description: 'Empty state content — shown when value is falsy and no error.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls entrance animation and hover effects.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical'
type TrendDir = 'up' | 'down' | 'flat'


const IMPORT_STRING = "import { MetricCard } from '@annondeveloper/ui-kit'"

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

const SAMPLE_SPARKLINE = [10, 25, 18, 30, 22, 35, 28, 42, 38, 45, 40, 52]
const SAMPLE_SPARKLINE_DOWN = [52, 48, 45, 38, 42, 35, 30, 28, 25, 20, 22, 18]
const SAMPLE_SPARKLINE_FLAT = [30, 32, 28, 31, 29, 30, 33, 28, 31, 30, 32, 29]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="metric-card-page__copy-btn"
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
    <div className="metric-card-page__control-group">
      <span className="metric-card-page__control-label">{label}</span>
      <div className="metric-card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`metric-card-page__option-btn${opt === value ? ' metric-card-page__option-btn--active' : ''}`}
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
    <label className="metric-card-page__toggle-label">
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
  title: string,
  value: string,
  changeValue: string,
  changePeriod: string,
  trend: TrendDir | 'none',
  status: Status | 'none',
  loading: boolean,
  showIcon: boolean,
  showSparkline: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRING
  const iconImport = showIcon ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = []
  props.push(`  title="${title}"`)
  props.push(`  value="${value}"`)
  if (changeValue && changeValue !== '0') {
    const cv = Number(changeValue)
    const changeParts = [`value: ${cv}`]
    if (changePeriod) changeParts.push(`period: '${changePeriod}'`)
    props.push(`  change={{ ${changeParts.join(', ')} }}`)
  }
  if (trend !== 'none') props.push(`  trend="${trend}"`)
  if (status !== 'none') props.push(`  status="${status}"`)
  if (loading) props.push('  loading')
  if (showIcon) props.push('  icon={<Icon name="activity" size="sm" />}')
  if (showSparkline) props.push('  sparkline={[10, 25, 18, 30, 22, 35, 28, 42, 38, 45]}')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const jsx = `<MetricCard\n${props.join('\n')}\n/>`

  return `${importStr}${iconImport}\n\n${jsx}`
}

function generateHtmlCssCode(
  title: string,
  value: string,
  status: Status | 'none',
): string {
  const statusAttr = status !== 'none' ? ` data-status="${status}"` : ''
  return `<!-- MetricCard — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/metric-card.css">

<div class="ui-metric-card"${statusAttr} role="group" aria-label="${title}">
  <div class="ui-metric-card__header">
    <h3 class="ui-metric-card__title">${title}</h3>
  </div>
  <div class="ui-metric-card__value">${value}</div>
</div>

<!-- Or import in your CSS: -->
<!-- @import '@annondeveloper/ui-kit/css/components/metric-card.css'; -->`
}

function generateVueCode(
  title: string,
  value: string,
  trend: TrendDir | 'none',
  status: Status | 'none',
): string {
  const props: string[] = []
  props.push(`  title="${title}"`)
  props.push(`  value="${value}"`)
  if (trend !== 'none') props.push(`  trend="${trend}"`)
  if (status !== 'none') props.push(`  status="${status}"`)

  return `<template>
  <MetricCard
  ${props.join('\n  ')}
  />
</template>

<script setup>
import { MetricCard } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(
  title: string,
  value: string,
  status: Status | 'none',
): string {
  const statusAttr = status !== 'none' ? `\n  data-status="${status}"` : ''
  return `<!-- Angular — Use the CSS-only approach -->
<div
  class="ui-metric-card"${statusAttr}
  role="group"
  aria-label="${title}"
>
  <div class="ui-metric-card__header">
    <h3 class="ui-metric-card__title">${title}</h3>
  </div>
  <div class="ui-metric-card__value">${value}</div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/metric-card.css';`
}

function generateSvelteCode(
  title: string,
  value: string,
  trend: TrendDir | 'none',
  status: Status | 'none',
): string {
  const props: string[] = []
  props.push(`  title="${title}"`)
  props.push(`  value="${value}"`)
  if (trend !== 'none') props.push(`  trend="${trend}"`)
  if (status !== 'none') props.push(`  status="${status}"`)

  return `<script>
  import { MetricCard } from '@annondeveloper/ui-kit';
</script>

<MetricCard
${props.join('\n')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection() {
  const [title, setTitle] = useState('Revenue')
  const [value, setValue] = useState('$48,250')
  const [changeValue, setChangeValue] = useState('12.5')
  const [changePeriod, setChangePeriod] = useState('last month')
  const [trend, setTrend] = useState<TrendDir | 'none'>('up')
  const [status, setStatus] = useState<Status | 'none'>('none')
  const [loading, setLoading] = useState(false)
  const [showIcon, setShowIcon] = useState(true)
  const [showSparkline, setShowSparkline] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(title, value, changeValue, changePeriod, trend, status, loading, showIcon, showSparkline, motion),
    [title, value, changeValue, changePeriod, trend, status, loading, showIcon, showSparkline, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(title, value, status),
    [title, value, status],
  )

  const vueCode = useMemo(
    () => generateVueCode(title, value, trend, status),
    [title, value, trend, status],
  )

  const angularCode = useMemo(
    () => generateAngularCode(title, value, status),
    [title, value, status],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(title, value, trend, status),
    [title, value, trend, status],
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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  const previewProps: Record<string, unknown> = {
    title,
    value: loading ? undefined : value,
    loading,
    motion,
  }
  if (changeValue && changeValue !== '0') {
    const cv = Number(changeValue)
    if (!isNaN(cv)) {
      previewProps.change = { value: cv, ...(changePeriod ? { period: changePeriod } : {}) }
    }
  }
  if (trend !== 'none') previewProps.trend = trend
  if (status !== 'none') previewProps.status = status
  if (showIcon) previewProps.icon = <Icon name="activity" size="sm" />
  if (showSparkline) previewProps.sparkline = SAMPLE_SPARKLINE

  return (
    <section className="metric-card-page__section" id="playground">
      <h2 className="metric-card-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="metric-card-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="metric-card-page__playground">
        {/* Preview area — left / top */}
        <div className="metric-card-page__playground-preview">
          <div className="metric-card-page__playground-result">
            <div style={{ inlineSize: 'min(320px, 100%)' }}>
              <MetricCard {...previewProps as any} />
            </div>
          </div>

          {/* Tabbed code output */}
          <div className="metric-card-page__code-tabs">
            <div className="metric-card-page__export-row">
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
              {copyStatus && <span className="metric-card-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
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

        {/* Controls panel — right / bottom */}
        <div className="metric-card-page__playground-controls">
          <div className="metric-card-page__control-group">
            <span className="metric-card-page__control-label">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="metric-card-page__text-input"
              placeholder="Metric title..."
            />
          </div>

          <div className="metric-card-page__control-group">
            <span className="metric-card-page__control-label">Value</span>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="metric-card-page__text-input"
              placeholder="Metric value..."
            />
          </div>

          <div className="metric-card-page__control-group">
            <span className="metric-card-page__control-label">Change (%)</span>
            <input
              type="number"
              value={changeValue}
              onChange={e => setChangeValue(e.target.value)}
              className="metric-card-page__text-input"
              placeholder="12.5"
              step="0.1"
            />
          </div>

          <div className="metric-card-page__control-group">
            <span className="metric-card-page__control-label">Period</span>
            <input
              type="text"
              value={changePeriod}
              onChange={e => setChangePeriod(e.target.value)}
              className="metric-card-page__text-input"
              placeholder="last month"
            />
          </div>

          <OptionGroup
            label="Trend"
            options={['none', 'up', 'down', 'flat'] as const}
            value={trend}
            onChange={v => setTrend(v as TrendDir | 'none')}
          />

          <OptionGroup
            label="Status"
            options={['none', 'ok', 'warning', 'critical'] as const}
            value={status}
            onChange={v => setStatus(v as Status | 'none')}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="metric-card-page__control-group">
            <span className="metric-card-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Loading" checked={loading} onChange={setLoading} />
              <Toggle label="Icon" checked={showIcon} onChange={setShowIcon} />
              <Toggle label="Sparkline" checked={showSparkline} onChange={setShowSparkline} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MetricCardPage() {
  useStyles('metric-card-page', pageStyles)

  useTier() // consistent with other pages
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.metric-card-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
    if (CSS.supports?.('animation-timeline', 'view()')) return // CSS handles it

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
    <div className="metric-card-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="metric-card-page__hero">
        <h1 className="metric-card-page__title">MetricCard</h1>
        <p className="metric-card-page__desc">
          Dashboard metric display with value, trend indicators, status accents, sparkline charts,
          and loading states. A domain component built for analytics dashboards and monitoring UIs.
        </p>
        <div className="metric-card-page__import-row">
          <code className="metric-card-page__import-code">{IMPORT_STRING}</code>
          <CopyButton text={IMPORT_STRING} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection />

      {/* ── 3. Variants (Status) ────────────────────────── */}
      <section className="metric-card-page__section" id="variants">
        <h2 className="metric-card-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="metric-card-page__section-desc">
          Status variants add a colored left border accent to communicate metric health at a glance.
          Choose from ok (green), warning (amber), and critical (red) — or leave unset for a neutral card.
        </p>
        <div className="metric-card-page__preview metric-card-page__preview--grid">
          <MetricCard
            title="API Uptime"
            value="99.98%"
            status="ok"
            trend="up"
            change={{ value: 0.02, period: 'last week' }}
            icon={<Icon name="check-circle" size="sm" />}
          />
          <MetricCard
            title="Response Time"
            value="342ms"
            status="warning"
            trend="up"
            change={{ value: 18, period: 'last hour' }}
            icon={<Icon name="alert-triangle" size="sm" />}
          />
          <MetricCard
            title="Error Rate"
            value="4.7%"
            status="critical"
            trend="up"
            change={{ value: 250, period: 'last hour' }}
            icon={<Icon name="x-circle" size="sm" />}
          />
          <MetricCard
            title="Requests/sec"
            value="1,247"
            trend="up"
            change={{ value: 8.3, period: 'yesterday' }}
            icon={<Icon name="activity" size="sm" />}
          />
        </div>
      </section>

      {/* ── 4. Size Scale (Container Queries) ───────────── */}
      <section className="metric-card-page__section" id="sizes">
        <h2 className="metric-card-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="metric-card-page__section-desc">
          MetricCard adapts to its container width using CSS container queries.
          At narrow widths ({'<'}160px), only the value is shown. At medium widths (160-280px),
          the title appears. At wider sizes, sparklines and change indicators are fully visible.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span className="metric-card-page__item-label" style={{ marginBlockEnd: '0.5rem', display: 'block' }}>
              narrow ({'<'} 160px) — value only
            </span>
            <div style={{ inlineSize: '140px' }}>
              <MetricCard
                title="Users"
                value="2,847"
                trend="up"
                change={{ value: 5.2 }}
                sparkline={SAMPLE_SPARKLINE}
              />
            </div>
          </div>
          <div>
            <span className="metric-card-page__item-label" style={{ marginBlockEnd: '0.5rem', display: 'block' }}>
              medium (160-280px) — title + value + change
            </span>
            <div style={{ inlineSize: '240px' }}>
              <MetricCard
                title="Users"
                value="2,847"
                trend="up"
                change={{ value: 5.2, period: 'last week' }}
                sparkline={SAMPLE_SPARKLINE}
              />
            </div>
          </div>
          <div>
            <span className="metric-card-page__item-label" style={{ marginBlockEnd: '0.5rem', display: 'block' }}>
              wide ({'>'} 280px) — full layout with sparkline
            </span>
            <div style={{ inlineSize: '360px' }}>
              <MetricCard
                title="Users"
                value="2,847"
                trend="up"
                change={{ value: 5.2, period: 'last week' }}
                sparkline={SAMPLE_SPARKLINE}
                icon={<Icon name="users" size="sm" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="metric-card-page__section" id="features">
        <h2 className="metric-card-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="metric-card-page__section-desc">
          MetricCard includes trend indicators, loading skeletons, custom icons,
          sparkline charts, error states, and empty states out of the box.
        </p>

        {/* Trend Indicators */}
        <h3 className="metric-card-page__feature-heading">Trend Indicators</h3>
        <div className="metric-card-page__preview metric-card-page__preview--grid" style={{ marginBlockEnd: '1.5rem' }}>
          <MetricCard
            title="Revenue"
            value="$48,250"
            trend="up"
            change={{ value: 12.5, period: 'last month' }}
          />
          <MetricCard
            title="Bounce Rate"
            value="34.2%"
            trend="down"
            change={{ value: -8.1, period: 'last week' }}
          />
          <MetricCard
            title="Avg Session"
            value="3m 42s"
            trend="flat"
            change={{ value: 0.3, period: 'yesterday' }}
          />
        </div>

        {/* Loading Skeleton */}
        <h3 className="metric-card-page__feature-heading">Loading Skeleton</h3>
        <div className="metric-card-page__preview metric-card-page__preview--grid" style={{ marginBlockEnd: '1.5rem' }}>
          <MetricCard
            title="Revenue"
            value=""
            loading
            icon={<Icon name="dollar-sign" size="sm" />}
          />
          <MetricCard
            title="Users Online"
            value=""
            loading
            icon={<Icon name="users" size="sm" />}
          />
          <MetricCard
            title="CPU Usage"
            value=""
            loading
            icon={<Icon name="cpu" size="sm" />}
          />
        </div>

        {/* Custom Icons */}
        <h3 className="metric-card-page__feature-heading">Custom Icons</h3>
        <div className="metric-card-page__preview metric-card-page__preview--grid" style={{ marginBlockEnd: '1.5rem' }}>
          <MetricCard
            title="Downloads"
            value="142K"
            trend="up"
            change={{ value: 23 }}
            icon={<Icon name="download" size="sm" />}
          />
          <MetricCard
            title="Star Rating"
            value="4.8"
            trend="up"
            change={{ value: 0.2 }}
            icon={<Icon name="star" size="sm" />}
          />
          <MetricCard
            title="Time Saved"
            value="38 hrs"
            trend="up"
            change={{ value: 15 }}
            icon={<Icon name="clock" size="sm" />}
          />
        </div>

        {/* Sparkline Charts */}
        <h3 className="metric-card-page__feature-heading">Sparkline Charts</h3>
        <div className="metric-card-page__preview metric-card-page__preview--grid" style={{ marginBlockEnd: '1.5rem' }}>
          <MetricCard
            title="Growth"
            value="+24%"
            trend="up"
            sparkline={SAMPLE_SPARKLINE}
            change={{ value: 24 }}
          />
          <MetricCard
            title="Churn"
            value="2.1%"
            trend="down"
            sparkline={SAMPLE_SPARKLINE_DOWN}
            change={{ value: -1.3 }}
          />
          <MetricCard
            title="Retention"
            value="87%"
            trend="flat"
            sparkline={SAMPLE_SPARKLINE_FLAT}
            change={{ value: 0.1 }}
          />
        </div>

        {/* Error & Empty States */}
        <h3 className="metric-card-page__feature-heading">Error and Empty States</h3>
        <div className="metric-card-page__preview metric-card-page__preview--grid">
          <MetricCard
            title="API Calls"
            value=""
            error="Failed to load metric data"
            icon={<Icon name="x-circle" size="sm" />}
          />
          <MetricCard
            title="New Signups"
            value=""
            empty="No data for this period"
            icon={<Icon name="users" size="sm" />}
          />
        </div>
      </section>

      {/* ── 6. Real-world Examples ──────────────────────── */}
      <section className="metric-card-page__section" id="examples">
        <h2 className="metric-card-page__section-title">
          <a href="#examples">Real-world Examples</a>
        </h2>
        <p className="metric-card-page__section-desc">
          Compelling dashboard compositions showing how MetricCard works in production scenarios.
        </p>

        {/* SaaS Dashboard */}
        <h3 className="metric-card-page__feature-heading">SaaS Revenue Dashboard</h3>
        <div className="metric-card-page__preview metric-card-page__preview--dashboard" style={{ marginBlockEnd: '2rem' }}>
          <MetricCard
            title="Monthly Revenue"
            value="$127,450"
            trend="up"
            status="ok"
            change={{ value: 18.2, period: 'last month' }}
            sparkline={[85, 92, 88, 95, 102, 98, 110, 115, 108, 120, 125, 127]}
            icon={<Icon name="dollar-sign" size="sm" />}
          />
          <MetricCard
            title="Active Subscribers"
            value="8,429"
            trend="up"
            change={{ value: 5.7, period: 'last month' }}
            sparkline={[7200, 7350, 7500, 7650, 7800, 7900, 8000, 8100, 8200, 8300, 8350, 8429]}
            icon={<Icon name="users" size="sm" />}
          />
          <MetricCard
            title="Churn Rate"
            value="2.3%"
            trend="down"
            status="ok"
            change={{ value: -0.8, period: 'last month' }}
            sparkline={[4.5, 4.2, 3.8, 3.5, 3.2, 3.0, 2.8, 2.7, 2.5, 2.4, 2.3, 2.3]}
            icon={<Icon name="activity" size="sm" />}
          />
          <MetricCard
            title="Avg. Revenue Per User"
            value="$15.12"
            trend="up"
            change={{ value: 3.1, period: 'last quarter' }}
            icon={<Icon name="trending-up" size="sm" />}
          />
        </div>

        {/* Infrastructure Monitoring */}
        <h3 className="metric-card-page__feature-heading">Infrastructure Monitoring</h3>
        <div className="metric-card-page__preview metric-card-page__preview--dashboard" style={{ marginBlockEnd: '2rem' }}>
          <MetricCard
            title="CPU Usage"
            value="67%"
            status="warning"
            trend="up"
            change={{ value: 15, period: '1 hour ago' }}
            sparkline={[42, 45, 48, 52, 55, 58, 60, 62, 65, 63, 66, 67]}
            icon={<Icon name="cpu" size="sm" />}
          />
          <MetricCard
            title="Memory"
            value="12.4 GB"
            status="ok"
            trend="flat"
            change={{ value: 2.1, period: 'last hour' }}
            sparkline={[11.8, 12.0, 11.9, 12.1, 12.2, 12.0, 12.3, 12.1, 12.2, 12.3, 12.4, 12.4]}
            icon={<Icon name="hard-drive" size="sm" />}
          />
          <MetricCard
            title="Network I/O"
            value="847 MB/s"
            status="ok"
            trend="up"
            change={{ value: 32, period: '10 min ago' }}
            sparkline={[520, 580, 620, 650, 680, 720, 750, 780, 800, 820, 835, 847]}
            icon={<Icon name="wifi" size="sm" />}
          />
          <MetricCard
            title="Error Rate"
            value="0.03%"
            status="critical"
            trend="up"
            change={{ value: 200, period: 'last 5 min' }}
            sparkline={[0.01, 0.01, 0.01, 0.01, 0.02, 0.01, 0.01, 0.02, 0.02, 0.02, 0.03, 0.03]}
            icon={<Icon name="alert-triangle" size="sm" />}
          />
        </div>

        {/* E-commerce Analytics */}
        <h3 className="metric-card-page__feature-heading">E-commerce Analytics</h3>
        <div className="metric-card-page__preview metric-card-page__preview--dashboard">
          <MetricCard
            title="Orders Today"
            value="1,847"
            trend="up"
            change={{ value: 22, period: 'yesterday' }}
            sparkline={[1200, 1280, 1350, 1420, 1500, 1580, 1620, 1680, 1720, 1780, 1820, 1847]}
            icon={<Icon name="shopping-cart" size="sm" />}
          />
          <MetricCard
            title="Conversion Rate"
            value="3.42%"
            trend="up"
            status="ok"
            change={{ value: 0.28, period: 'last week' }}
            icon={<Icon name="trending-up" size="sm" />}
          />
          <MetricCard
            title="Avg. Order Value"
            value="$68.50"
            trend="down"
            change={{ value: -2.1, period: 'last week' }}
            icon={<Icon name="dollar-sign" size="sm" />}
          />
          <MetricCard
            title="Cart Abandonment"
            value="67.8%"
            trend="down"
            status="warning"
            change={{ value: -3.5, period: 'last month' }}
            icon={<Icon name="x-circle" size="sm" />}
          />
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="metric-card-page__section" id="brand-color">
        <h2 className="metric-card-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="metric-card-page__section-desc">
          Pick a brand color to see all metric cards update in real-time. The theme generates
          derived colors (light, dark, subtle, glow) automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="metric-card-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`metric-card-page__color-preset${brandColor === p.hex ? ' metric-card-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="metric-card-page__section" id="props">
        <h2 className="metric-card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="metric-card-page__section-desc">
          All props accepted by MetricCard. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element (excluding title, which is used as a prop).
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={metricCardProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="metric-card-page__section" id="accessibility">
        <h2 className="metric-card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="metric-card-page__section-desc">
          MetricCard follows WCAG guidelines for data visualization and live updating content.
        </p>
        <Card variant="default" padding="md">
          <ul className="metric-card-page__a11y-list">
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="metric-card-page__a11y-key">role="group"</code> with <code className="metric-card-page__a11y-key">aria-label</code> set to the title text for screen reader context.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live updates:</strong> Pair with <code className="metric-card-page__a11y-key">aria-live="polite"</code> on a parent container to announce value changes to screen readers.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Trend labels:</strong> Trend arrows include <code className="metric-card-page__a11y-key">aria-label</code> text like "Trend: up" for non-visual users.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Sparkline:</strong> Sparkline SVGs are marked <code className="metric-card-page__a11y-key">aria-hidden="true"</code> — they are decorative; the value and change data convey the information.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status accent:</strong> Color is never the sole indicator — status is always paired with the textual change value and trend direction.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All text meets WCAG AA contrast ratio (4.5:1 text, 3:1 UI) against the card background.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Loading state uses a pulsing skeleton with <code className="metric-card-page__a11y-key">data-loading</code> attribute for programmatic detection.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="metric-card-page__a11y-key">forced-colors: active</code> with visible 2px borders and hidden aurora gradients.
              </span>
            </li>
            <li className="metric-card-page__a11y-item">
              <span className="metric-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Removes shadows and decorative backgrounds, adds visible borders, and uses <code className="metric-card-page__a11y-key">break-inside: avoid</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="metric-card-page__section" id="source">
        <h2 className="metric-card-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="metric-card-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/metric-card.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="metric-card-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/domain/metric-card.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
