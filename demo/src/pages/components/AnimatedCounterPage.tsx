'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { AnimatedCounter as LiteAnimatedCounter } from '@ui/lite/animated-counter'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.animated-counter-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: animated-counter-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .animated-counter-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .animated-counter-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .animated-counter-page__hero::before { animation: none; }
      }

      .animated-counter-page__title {
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

      .animated-counter-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .animated-counter-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .animated-counter-page__import-code {
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

      .animated-counter-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .animated-counter-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        .animated-counter-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .animated-counter-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .animated-counter-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .animated-counter-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .animated-counter-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .animated-counter-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .animated-counter-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .animated-counter-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container animated-counter-page (max-width: 680px) {
        .animated-counter-page__playground {
          grid-template-columns: 1fr;
        }
        .animated-counter-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .animated-counter-page__playground {
          grid-template-columns: 1fr;
        }
        .animated-counter-page__playground-controls {
          position: static !important;
        }
      }

      .animated-counter-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .animated-counter-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .animated-counter-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .animated-counter-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .animated-counter-page__counter-display {
        position: relative;
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 800;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
        z-index: 1;
      }

      .animated-counter-page__playground-controls {
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

      .animated-counter-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .animated-counter-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .animated-counter-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .animated-counter-page__option-btn {
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
      .animated-counter-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .animated-counter-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .animated-counter-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .animated-counter-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .animated-counter-page__range-input {
        inline-size: 100%;
        accent-color: var(--brand);
      }

      /* ── Labeled row ────────────────────────────────── */

      .animated-counter-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-end;
      }

      .animated-counter-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .animated-counter-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .animated-counter-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
      }

      .animated-counter-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .animated-counter-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .animated-counter-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .animated-counter-page__state-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
      }

      /* ── Button row ─────────────────────────────────── */

      .animated-counter-page__button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .animated-counter-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .animated-counter-page__tier-card {
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

      .animated-counter-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .animated-counter-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .animated-counter-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .animated-counter-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .animated-counter-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .animated-counter-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .animated-counter-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .animated-counter-page__tier-import {
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

      .animated-counter-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .animated-counter-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .animated-counter-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .animated-counter-page__code-tabs {
        margin-block-start: 1rem;
      }

      .animated-counter-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .animated-counter-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .animated-counter-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .animated-counter-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .animated-counter-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .animated-counter-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color presets ──────────────────────────────── */

      .animated-counter-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .animated-counter-page__color-preset {
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
      .animated-counter-page__color-preset:hover {
        transform: scale(1.2);
      }
      .animated-counter-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .animated-counter-page__hero { padding: 2rem 1.25rem; }
        .animated-counter-page__title { font-size: 1.75rem; }
        .animated-counter-page__preview { padding: 1.75rem; }
        .animated-counter-page__playground { grid-template-columns: 1fr; }
        .animated-counter-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .animated-counter-page__labeled-row { gap: 1rem; }
        .animated-counter-page__states-grid { grid-template-columns: repeat(2, 1fr); }
        .animated-counter-page__tiers { grid-template-columns: 1fr; }
        .animated-counter-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .animated-counter-page__hero { padding: 1.5rem 1rem; }
        .animated-counter-page__title { font-size: 1.5rem; }
        .animated-counter-page__preview { padding: 1rem; }
        .animated-counter-page__states-grid { grid-template-columns: 1fr; }
        .animated-counter-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .animated-counter-page__title { font-size: 4rem; }
        .animated-counter-page__preview { padding: 3.5rem; }
        .animated-counter-page__labeled-row { gap: 2.5rem; }
      }

      .animated-counter-page__import-code,
      .animated-counter-page code,
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

const animatedCounterProps: PropDef[] = [
  { name: 'value', type: 'number', required: true, description: 'The target numeric value to display. Changes trigger animated transitions.' },
  { name: 'format', type: '(value: number) => string', description: 'Custom formatter function. Defaults to Intl.NumberFormat with locale-aware formatting.' },
  { name: 'duration', type: 'number', default: '500', description: 'Animation duration in milliseconds.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = instant, 1 = ease-out cubic, 2+ = physics spring solver.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLSpanElement>', description: 'Forwarded ref to the underlying <span> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FormatStyle = 'default' | 'currency' | 'percent' | 'compact' | 'bytes'

const FORMAT_STYLES: FormatStyle[] = ['default', 'currency', 'percent', 'compact', 'bytes']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { AnimatedCounter } from '@annondeveloper/ui-kit/lite'",
  standard: "import { AnimatedCounter } from '@annondeveloper/ui-kit'",
  premium: "import { AnimatedCounter } from '@annondeveloper/ui-kit'",
}

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

const FORMAT_FNS: Record<FormatStyle, ((v: number) => string) | undefined> = {
  default: undefined,
  currency: (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(v)),
  percent: (v: number) => `${(v * 100).toFixed(1)}%`,
  compact: (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(v)),
  bytes: (v: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let val = Math.abs(Math.round(v))
    let i = 0
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
    return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
  },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="animated-counter-page__copy-btn"
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
    <div className="animated-counter-page__control-group">
      <span className="animated-counter-page__control-label">{label}</span>
      <div className="animated-counter-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`animated-counter-page__option-btn${opt === value ? ' animated-counter-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, value: number, formatStyle: FormatStyle, duration: number, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  value={${value}}`]
  if (formatStyle !== 'default') {
    if (formatStyle === 'currency') props.push(`  format={(v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(v))}`)
    else if (formatStyle === 'percent') props.push(`  format={(v) => \`\${(v * 100).toFixed(1)}%\`}`)
    else if (formatStyle === 'compact') props.push(`  format={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Math.round(v))}`)
    else if (formatStyle === 'bytes') props.push(`  format={formatBytes}`)
  }
  if (duration !== 500 && tier !== 'lite') props.push(`  duration={${duration}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<AnimatedCounter\n${props.join('\n')}\n/>`
}

function generateHtmlCode(value: number): string {
  return `<!-- AnimatedCounter -- requires JavaScript for animation -->
<!-- Use the React component or build your own animation logic -->

<span class="ui-animated-counter" role="status" aria-live="polite">
  ${new Intl.NumberFormat().format(value)}
</span>

<!-- CSS -->
<style>
.ui-animated-counter {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
</style>`
}

function generateVueCode(tier: Tier, value: number): string {
  if (tier === 'lite') {
    return `<template>
  <span class="ui-lite-animated-counter">{{ formatted }}</span>
</template>

<script setup>
import { computed } from 'vue'
const value = ${value}
const formatted = computed(() => new Intl.NumberFormat().format(value))
</script>`
  }
  return `<template>
  <AnimatedCounter :value="${value}" />
</template>

<script setup>
import { AnimatedCounter } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, value: number): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (static display) -->
<span class="ui-lite-animated-counter">
  {{ ${value} | number }}
</span>`
  }
  return `<!-- Angular -- Standard tier -->
<span
  class="ui-animated-counter"
  role="status"
  aria-live="polite"
>
  {{ animatedValue | number }}
</span>

/* Implement animation in component TypeScript */
@import '@annondeveloper/ui-kit/css/components/animated-counter.css';`
}

function generateSvelteCode(tier: Tier, value: number): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (static display) -->
<span class="ui-lite-animated-counter">
  {new Intl.NumberFormat().format(${value})}
</span>`
  }
  return `<script>
  import { AnimatedCounter } from '@annondeveloper/ui-kit';
  let value = ${value};
</script>

<AnimatedCounter {value} />`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [value, setValue] = useState(42195)
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('default')
  const [duration, setDuration] = useState(500)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const CounterComponent = tier === 'lite' ? LiteAnimatedCounter : AnimatedCounter
  const formatFn = FORMAT_FNS[formatStyle]

  const reactCode = useMemo(
    () => generateReactCode(tier, value, formatStyle, duration, motion),
    [tier, value, formatStyle, duration, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(value), [value])
  const vueCode = useMemo(() => generateVueCode(tier, value), [tier, value])
  const angularCode = useMemo(() => generateAngularCode(tier, value), [tier, value])
  const svelteCode = useMemo(() => generateSvelteCode(tier, value), [tier, value])

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

  const previewProps: Record<string, unknown> = { value }
  if (formatFn) previewProps.format = formatFn
  if (tier !== 'lite') {
    previewProps.duration = duration
    previewProps.motion = motion
  }

  const randomize = useCallback(() => {
    if (formatStyle === 'percent') setValue(Math.random())
    else if (formatStyle === 'bytes') setValue(Math.floor(Math.random() * 10737418240))
    else setValue(Math.floor(Math.random() * 1000000))
  }, [formatStyle])

  return (
    <section className="animated-counter-page__section" id="playground">
      <h2 className="animated-counter-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="animated-counter-page__section-desc">
        Change the value and watch the counter animate smoothly. The animation uses either ease-out cubic
        (motion level 1) or a real spring physics solver (motion level 2+).
      </p>

      <div className="animated-counter-page__playground">
        <div className="animated-counter-page__playground-preview">
          <div className="animated-counter-page__playground-result">
            <span className="animated-counter-page__counter-display">
              <CounterComponent {...previewProps as any} />
            </span>
          </div>

          <div className="animated-counter-page__button-row">
            <Button size="sm" variant="primary" onClick={randomize}>
              <Icon name="refresh" size="sm" /> Randomize
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setValue(0)}>Reset to 0</Button>
            <Button size="sm" variant="secondary" onClick={() => setValue(prev => prev + 1000)}>+1,000</Button>
            <Button size="sm" variant="secondary" onClick={() => setValue(prev => Math.max(0, prev - 1000))}>-1,000</Button>
          </div>

          <div className="animated-counter-page__code-tabs">
            <div className="animated-counter-page__export-row">
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
              {copyStatus && <span className="animated-counter-page__export-status">{copyStatus}</span>}
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

        <div className="animated-counter-page__playground-controls">
          <OptionGroup label="Format" options={FORMAT_STYLES} value={formatStyle} onChange={setFormatStyle} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          {tier !== 'lite' && (
            <div className="animated-counter-page__control-group">
              <span className="animated-counter-page__control-label">Duration: {duration}ms</span>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="animated-counter-page__range-input"
              />
            </div>
          )}

          <div className="animated-counter-page__control-group">
            <span className="animated-counter-page__control-label">Value</span>
            <input
              type="number"
              value={value}
              onChange={e => setValue(Number(e.target.value) || 0)}
              className="animated-counter-page__text-input"
              placeholder="Enter a number..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnimatedCounterPage() {
  useStyles('animated-counter-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  // Demo counters that auto-increment
  const [demoRevenue, setDemoRevenue] = useState(148250)
  const [demoUsers, setDemoUsers] = useState(23847)
  const [demoRequests, setDemoRequests] = useState(1847293)
  const [demoUptime, setDemoUptime] = useState(0.9987)

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoRevenue(v => v + Math.floor(Math.random() * 500))
      setDemoUsers(v => v + Math.floor(Math.random() * 5))
      setDemoRequests(v => v + Math.floor(Math.random() * 1000))
      setDemoUptime(v => Math.min(1, v + (Math.random() * 0.0001 - 0.00005)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
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

  // Scroll reveal for sections -- JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.animated-counter-page__section')
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

  const CounterComponent = tier === 'lite' ? LiteAnimatedCounter : AnimatedCounter

  const currencyFormat = useCallback(
    (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(v)),
    [],
  )
  const compactFormat = useCallback(
    (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(v)),
    [],
  )
  const percentFormat = useCallback(
    (v: number) => `${(v * 100).toFixed(2)}%`,
    [],
  )

  return (
    <div className="animated-counter-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="animated-counter-page__hero">
        <h1 className="animated-counter-page__title">AnimatedCounter</h1>
        <p className="animated-counter-page__desc">
          Smoothly animates between numeric values using requestAnimationFrame with physics-based
          spring solver or ease-out interpolation. Supports custom formatters and tabular numerals.
        </p>
        <div className="animated-counter-page__import-row">
          <code className="animated-counter-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Format Styles ───────────────────────────── */}
      <section className="animated-counter-page__section" id="formats">
        <h2 className="animated-counter-page__section-title">
          <a href="#formats">Format Styles</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          Pass a custom <code>format</code> function to display values as currency, percentages,
          compact notation, or any other format.
        </p>
        <div className="animated-counter-page__states-grid">
          <div className="animated-counter-page__state-cell">
            <span className="animated-counter-page__state-value">
              <CounterComponent value={demoRevenue} format={currencyFormat} />
            </span>
            <span className="animated-counter-page__state-label">Currency</span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span className="animated-counter-page__state-value">
              <CounterComponent value={demoUsers} format={compactFormat} />
            </span>
            <span className="animated-counter-page__state-label">Compact</span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span className="animated-counter-page__state-value">
              <CounterComponent value={demoUptime} format={percentFormat} />
            </span>
            <span className="animated-counter-page__state-label">Percent</span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span className="animated-counter-page__state-value">
              <CounterComponent value={demoRequests} />
            </span>
            <span className="animated-counter-page__state-label">Default (Intl)</span>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
          These counters auto-increment every 3 seconds to demonstrate live animation.
        </p>
      </section>

      {/* ── 4. Motion Levels ──────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="animated-counter-page__section" id="motion">
          <h2 className="animated-counter-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="animated-counter-page__section-desc">
            Control animation intensity. Motion 0 instantly snaps to new values.
            Motion 1 uses smooth ease-out cubic interpolation. Motion 2+ uses a real spring physics
            solver (differential equation) for natural-feeling overshoot and settle.
          </p>
          <div className="animated-counter-page__states-grid">
            {([0, 1, 2, 3] as const).map(m => (
              <MotionDemoCell key={m} motion={m} />
            ))}
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<AnimatedCounter value={count} motion={0} /> {/* Instant */}\n<AnimatedCounter value={count} motion={1} /> {/* Ease-out cubic */}\n<AnimatedCounter value={count} motion={2} /> {/* Spring physics */}\n<AnimatedCounter value={count} motion={3} /> {/* Full cinematic spring */}`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="animated-counter-page__section" id="motion">
          <h2 className="animated-counter-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="animated-counter-page__section-desc">
            Motion control enables animation from instant snap to physics-based spring solver.
          </p>
          <p className="animated-counter-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Animation and motion control require Standard tier. Lite displays values statically.
          </p>
        </section>
      )}

      {/* ── 5. Dashboard Example ────────────────────── */}
      <section className="animated-counter-page__section" id="dashboard">
        <h2 className="animated-counter-page__section-title">
          <a href="#dashboard">Dashboard Example</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          Combine AnimatedCounter with different formatters to build live-updating dashboard metrics.
          Values update every 3 seconds automatically.
        </p>
        <div className="animated-counter-page__states-grid">
          <div className="animated-counter-page__state-cell">
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Revenue</span>
            <span className="animated-counter-page__state-value" style={{ color: 'var(--status-ok, oklch(72% 0.19 145))' }}>
              <CounterComponent value={demoRevenue} format={currencyFormat} />
            </span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Users</span>
            <span className="animated-counter-page__state-value" style={{ color: 'var(--status-info, oklch(65% 0.2 270))' }}>
              <CounterComponent value={demoUsers} format={compactFormat} />
            </span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Requests</span>
            <span className="animated-counter-page__state-value">
              <CounterComponent value={demoRequests} format={compactFormat} />
            </span>
          </div>
          <div className="animated-counter-page__state-cell">
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Uptime</span>
            <span className="animated-counter-page__state-value" style={{ color: 'var(--status-ok, oklch(72% 0.19 145))' }}>
              <CounterComponent value={demoUptime} format={percentFormat} />
            </span>
          </div>
        </div>
      </section>

      {/* ── 6. Duration Control ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="animated-counter-page__section" id="duration">
          <h2 className="animated-counter-page__section-title">
            <a href="#duration">Duration Control</a>
          </h2>
          <p className="animated-counter-page__section-desc">
            Adjust the <code>duration</code> prop to control how long the animation takes.
            Default is 500ms. Shorter durations feel snappy, longer durations feel more dramatic.
          </p>
          <DurationDemoSection />
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="animated-counter-page__section" id="tiers">
        <h2 className="animated-counter-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides static display,
          Standard adds animated transitions with spring physics.
        </p>

        <div className="animated-counter-page__tiers">
          {/* Lite */}
          <div
            className={`animated-counter-page__tier-card${tier === 'lite' ? ' animated-counter-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="animated-counter-page__tier-header">
              <span className="animated-counter-page__tier-name">Lite</span>
              <span className="animated-counter-page__tier-size">~0.1 KB</span>
            </div>
            <p className="animated-counter-page__tier-desc">
              Static display only. Zero JavaScript animation. Just renders the formatted value.
              Supports custom format function but no transitions.
            </p>
            <div className="animated-counter-page__tier-import">
              import {'{'} AnimatedCounter {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="animated-counter-page__tier-preview">
              <LiteAnimatedCounter value={42195} />
            </div>
            <div className="animated-counter-page__size-breakdown">
              <div className="animated-counter-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`animated-counter-page__tier-card${tier === 'standard' ? ' animated-counter-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="animated-counter-page__tier-header">
              <span className="animated-counter-page__tier-name">Standard</span>
              <span className="animated-counter-page__tier-size">~1.5 KB</span>
            </div>
            <p className="animated-counter-page__tier-desc">
              Full-featured counter with spring physics solver, ease-out interpolation,
              motion levels, direct DOM updates for 60fps, and ARIA live region.
            </p>
            <div className="animated-counter-page__tier-import">
              import {'{'} AnimatedCounter {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="animated-counter-page__tier-preview">
              <AnimatedCounter value={42195} />
            </div>
            <div className="animated-counter-page__size-breakdown">
              <div className="animated-counter-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`animated-counter-page__tier-card${tier === 'premium' ? ' animated-counter-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="animated-counter-page__tier-header">
              <span className="animated-counter-page__tier-name">Premium</span>
              <span className="animated-counter-page__tier-size">~1.5 KB</span>
            </div>
            <p className="animated-counter-page__tier-desc">
              Uses the Standard tier component. AnimatedCounter is fully featured
              at the Standard level -- no additional premium wrapper needed.
            </p>
            <div className="animated-counter-page__tier-import">
              import {'{'} AnimatedCounter {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="animated-counter-page__tier-preview">
              <AnimatedCounter value={99942} format={currencyFormat} />
            </div>
            <div className="animated-counter-page__size-breakdown">
              <div className="animated-counter-page__size-row">
                <span>Same as Standard: <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="animated-counter-page__section" id="brand-color">
        <h2 className="animated-counter-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          Pick a brand color to see page accents update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="animated-counter-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`animated-counter-page__color-preset${brandColor === p.hex ? ' animated-counter-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="animated-counter-page__section" id="props">
        <h2 className="animated-counter-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          All props accepted by AnimatedCounter. It also spreads any native HTML span attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={animatedCounterProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="animated-counter-page__section" id="accessibility">
        <h2 className="animated-counter-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="animated-counter-page__section-desc">
          Built with ARIA live regions for screen reader announcements.
        </p>
        <Card variant="default" padding="md">
          <ul className="animated-counter-page__a11y-list">
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Uses <code className="animated-counter-page__a11y-key">role="status"</code> with <code className="animated-counter-page__a11y-key">aria-live="polite"</code> for screen reader updates.
              </span>
            </li>
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular numerals:</strong> Uses <code className="animated-counter-page__a11y-key">font-variant-numeric: tabular-nums</code> to prevent layout shift during animation.
              </span>
            </li>
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion respect:</strong> Motion level 0 instantly shows final value with no animation.
              </span>
            </li>
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="animated-counter-page__a11y-key">forced-colors: active</code> with ButtonText fallback.
              </span>
            </li>
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Performance:</strong> Direct DOM updates via <code className="animated-counter-page__a11y-key">textContent</code> instead of React state -- avoids 60 re-renders/sec.
              </span>
            </li>
            <li className="animated-counter-page__a11y-item">
              <span className="animated-counter-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Locale-aware:</strong> Default formatter uses <code className="animated-counter-page__a11y-key">Intl.NumberFormat</code> for proper number formatting.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MotionDemoCell({ motion }: { motion: 0 | 1 | 2 | 3 }) {
  const [val, setVal] = useState(1000)
  const labels = ['Instant', 'Ease-out', 'Spring', 'Cinematic']
  return (
    <div className="animated-counter-page__state-cell" onClick={() => setVal(v => v + Math.floor(Math.random() * 5000))} style={{ cursor: 'pointer' }}>
      <span className="animated-counter-page__state-value">
        <AnimatedCounter value={val} motion={motion} />
      </span>
      <span className="animated-counter-page__state-label">Motion {motion} -- {labels[motion]}</span>
      <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>Click to increment</span>
    </div>
  )
}

function DurationDemoSection() {
  const [val, setVal] = useState(5000)
  const durations = [100, 300, 500, 1000, 2000]

  return (
    <div>
      <div className="animated-counter-page__button-row" style={{ marginBlockEnd: '1rem' }}>
        <Button size="sm" variant="primary" onClick={() => setVal(Math.floor(Math.random() * 100000))}>
          <Icon name="refresh" size="sm" /> Randomize All
        </Button>
      </div>
      <div className="animated-counter-page__states-grid">
        {durations.map(d => (
          <div key={d} className="animated-counter-page__state-cell">
            <span className="animated-counter-page__state-value">
              <AnimatedCounter value={val} duration={d} />
            </span>
            <span className="animated-counter-page__state-label">{d}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}
