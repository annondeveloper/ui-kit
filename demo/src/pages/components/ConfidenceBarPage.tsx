'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ConfidenceBar } from '@ui/domain/confidence-bar'
import { ConfidenceBar as LiteConfidenceBar } from '@ui/lite/confidence-bar'
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
    @scope (.confidence-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: confidence-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .confidence-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .confidence-bar-page__hero::before {
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
        animation: cb-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes cb-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .confidence-bar-page__hero::before { animation: none; }
      }

      .confidence-bar-page__title {
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

      .confidence-bar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .confidence-bar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .confidence-bar-page__import-code {
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

      .confidence-bar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .confidence-bar-page__section {
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
        animation: cb-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes cb-section-reveal {
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
        .confidence-bar-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .confidence-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .confidence-bar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .confidence-bar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .confidence-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .confidence-bar-page__preview {
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
      .confidence-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .confidence-bar-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .confidence-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .confidence-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .confidence-bar-page__playground-controls {
          position: static !important;
        }
      }

      @container confidence-bar-page (max-width: 680px) {
        .confidence-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .confidence-bar-page__playground-controls {
          position: static !important;
        }
      }

      .confidence-bar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .confidence-bar-page__playground-result {
        overflow-x: auto;
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
      .confidence-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .confidence-bar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .confidence-bar-page__playground-controls {
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

      .confidence-bar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .confidence-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .confidence-bar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .confidence-bar-page__option-btn {
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
      .confidence-bar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .confidence-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .confidence-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .confidence-bar-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .confidence-bar-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .confidence-bar-page__range-input {
        inline-size: 100%;
        accent-color: var(--brand);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .confidence-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .confidence-bar-page__tier-card {
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

      .confidence-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .confidence-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .confidence-bar-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .confidence-bar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .confidence-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .confidence-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .confidence-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .confidence-bar-page__tier-import {
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

      .confidence-bar-page__tier-preview {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-block-start: 0.5rem;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .confidence-bar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .confidence-bar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .confidence-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .confidence-bar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .confidence-bar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .confidence-bar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .confidence-bar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color picker ──────────────────────────────── */

      .confidence-bar-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .confidence-bar-page__color-preset {
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
      .confidence-bar-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .confidence-bar-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .confidence-bar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .confidence-bar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .confidence-bar-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .confidence-bar-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 150px;
      }

      .confidence-bar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .confidence-bar-page__hero {
          padding: 2rem 1.25rem;
        }

        .confidence-bar-page__title {
          font-size: 1.75rem;
        }

        .confidence-bar-page__preview {
          padding: 1.75rem;
        }

        .confidence-bar-page__playground {
          grid-template-columns: 1fr;
        }

        .confidence-bar-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .confidence-bar-page__tiers {
          grid-template-columns: 1fr;
        }

        .confidence-bar-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .confidence-bar-page__hero {
          padding: 1.5rem 1rem;
        }

        .confidence-bar-page__title {
          font-size: 1.5rem;
        }

        .confidence-bar-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .confidence-bar-page__import-code,
      .confidence-bar-page code,
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

const confidenceBarPropsData: PropDef[] = [
  { name: 'value', type: 'number', description: 'Confidence value between 0 and 1. Determines fill width and color level.' },
  { name: 'label', type: 'ReactNode', description: 'Optional label displayed above the bar on the left side.' },
  { name: 'showValue', type: 'boolean', default: 'true', description: 'Whether to display the percentage value above the bar on the right side.' },
  { name: 'thresholds', type: '{ low: number; medium: number }', default: '{ low: 0.3, medium: 0.7 }', description: 'Threshold values for color transitions. Below low = red, below medium = yellow, above medium = green.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track height: sm = 4px, md = 8px, lg = 12px.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = no transition, 1 = subtle ease, 2-3 = spring bounce.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type MotionLevel = 0 | 1 | 2 | 3

const SIZES: Size[] = ['sm', 'md', 'lg']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ConfidenceBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ConfidenceBar } from '@annondeveloper/ui-kit'",
  premium: "import { ConfidenceBar } from '@annondeveloper/ui-kit/premium'",
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="confidence-bar-page__copy-btn"
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
    <div className="confidence-bar-page__control-group">
      <span className="confidence-bar-page__control-label">{label}</span>
      <div className="confidence-bar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`confidence-bar-page__option-btn${opt === value ? ' confidence-bar-page__option-btn--active' : ''}`}
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
    <label className="confidence-bar-page__toggle-label">
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

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  value: number,
  size: Size,
  motion: MotionLevel,
  labelText: string,
  showValue: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const props: string[] = [`  value={${Math.round(value * 100)}}`]
    if (labelText) props.push(`  label="${labelText}"`)
    if (showValue) props.push('  showValue')
    if (size !== 'md') props.push(`  size="${size}"`)
    return `${importStr}\n\n<ConfidenceBar\n${props.join('\n')}\n/>`
  }

  const props: string[] = [`  value={${value}}`]
  if (labelText) props.push(`  label="${labelText}"`)
  if (!showValue) props.push('  showValue={false}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<ConfidenceBar\n${props.join('\n')}\n/>`
}

function generateHtmlCssCode(tier: Tier, value: number, size: Size, labelText: string): string {
  const percentage = Math.round(value * 100)
  const color = value >= 0.7 ? 'oklch(72% 0.19 155)' : value >= 0.3 ? 'oklch(80% 0.18 85)' : 'oklch(62% 0.22 25)'

  return `<!-- ConfidenceBar — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/confidence-bar.css">

<div class="ui-confidence-bar" data-size="${size}" role="meter"
     aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="1"
     aria-label="${labelText || 'Confidence'}">
  <div class="ui-confidence-bar__header">
    ${labelText ? `<span class="ui-confidence-bar__label">${labelText}</span>` : ''}
    <span class="ui-confidence-bar__value">${percentage}%</span>
  </div>
  <div class="ui-confidence-bar__track">
    <div class="ui-confidence-bar__fill"
         style="inline-size: ${percentage}%; background: ${color};">
    </div>
  </div>
</div>

<style>
.ui-confidence-bar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.ui-confidence-bar__track {
  position: relative;
  height: ${size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px'};
  border-radius: 9999px;
  background: oklch(18% 0.01 270);
  overflow: hidden;
}
.ui-confidence-bar__fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: inherit;
  transition: inline-size 0.3s ease-out;
}
</style>`
}

function generateVueCode(tier: Tier, value: number, size: Size, motion: MotionLevel, labelText: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-confidence-bar" data-size="${size}">
    ${labelText ? `<span class="ui-lite-confidence-bar__label">${labelText}</span>` : ''}
    <div class="ui-lite-progress" role="meter"
         :aria-valuenow="${Math.round(value * 100)}" aria-valuemin="0" aria-valuemax="100">
      <div class="ui-lite-progress__fill"
           :style="{ width: '${Math.round(value * 100)}%' }"></div>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`:value="${value}"`]
  if (labelText) attrs.push(`label="${labelText}"`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (motion !== 3) attrs.push(`:motion="${motion}"`)

  return `<template>
  <ConfidenceBar
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { ConfidenceBar } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, value: number, size: Size, labelText: string): string {
  const percentage = Math.round(value * 100)
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-confidence-bar" data-size="${size}">
  ${labelText ? `<span class="ui-lite-confidence-bar__label">${labelText}</span>` : ''}
  <div class="ui-lite-progress" role="meter"
       [attr.aria-valuenow]="${percentage}" aria-valuemin="0" aria-valuemax="100">
    <div class="ui-lite-progress__fill"
         [ngStyle]="{ width: '${percentage}%' }"></div>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-confidence-bar" data-size="${size}" role="meter"
     [attr.aria-valuenow]="${value}" aria-valuemin="0" aria-valuemax="1"
     aria-label="${labelText || 'Confidence'}">
  <div class="ui-confidence-bar__header">
    ${labelText ? `<span class="ui-confidence-bar__label">${labelText}</span>` : ''}
    <span class="ui-confidence-bar__value">${percentage}%</span>
  </div>
  <div class="ui-confidence-bar__track">
    <div class="ui-confidence-bar__fill"
         [ngStyle]="{ 'inline-size': '${percentage}%' }"></div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/confidence-bar.css';`
}

function generateSvelteCode(tier: Tier, value: number, size: Size, motion: MotionLevel, labelText: string): string {
  if (tier === 'lite') {
    const percentage = Math.round(value * 100)
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-confidence-bar" data-size="${size}">
  ${labelText ? `<span class="ui-lite-confidence-bar__label">${labelText}</span>` : ''}
  <div class="ui-lite-progress" role="meter"
       aria-valuenow={${percentage}} aria-valuemin="0" aria-valuemax="100">
    <div class="ui-lite-progress__fill"
         style="width: ${percentage}%"></div>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`value={${value}}`]
  if (labelText) attrs.push(`label="${labelText}"`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (motion !== 3) attrs.push(`motion={${motion}}`)

  return `<script>
  import { ConfidenceBar } from '${importPath}';
</script>

<ConfidenceBar
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [value, setValue] = useState(0.72)
  const [size, setSize] = useState<Size>('md')
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [labelText, setLabelText] = useState('Model Accuracy')
  const [showValue, setShowValue] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const isLite = tier === 'lite'

  const reactCode = useMemo(
    () => generateReactCode(tier, value, size, motion, labelText, showValue),
    [tier, value, size, motion, labelText, showValue],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, value, size, labelText),
    [tier, value, size, labelText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, value, size, motion, labelText),
    [tier, value, size, motion, labelText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, value, size, labelText),
    [tier, value, size, labelText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, value, size, motion, labelText),
    [tier, value, size, motion, labelText],
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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  return (
    <section className="confidence-bar-page__section" id="playground">
      <h2 className="confidence-bar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="confidence-bar-page__section-desc">
        Drag the value slider and tweak props to see the bar update in real-time.
        The fill color changes automatically based on threshold values.
      </p>

      <div className="confidence-bar-page__playground">
        <div className="confidence-bar-page__playground-preview">
          <div className="confidence-bar-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '400px', position: 'relative', zIndex: 1 }}>
              {isLite ? (
                <LiteConfidenceBar
                  value={Math.round(value * 100)}
                  label={labelText || undefined}
                  showValue={showValue}
                  size={size}
                />
              ) : (
                <ConfidenceBar
                  value={value}
                  label={labelText || undefined}
                  showValue={showValue}
                  size={size}
                  motion={motion}
                />
              )}
            </div>
          </div>

          <div className="confidence-bar-page__code-tabs">
            <div className="confidence-bar-page__export-row">
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
              {copyStatus && <span className="confidence-bar-page__export-status">{copyStatus}</span>}
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

        <div className="confidence-bar-page__playground-controls">
          <div className="confidence-bar-page__control-group">
            <span className="confidence-bar-page__control-label">
              Value: {Math.round(value * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(value * 100)}
              onChange={e => setValue(Number(e.target.value) / 100)}
              className="confidence-bar-page__range-input"
            />
          </div>

          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {!isLite && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as MotionLevel)}
            />
          )}

          <div className="confidence-bar-page__control-group">
            <span className="confidence-bar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show value" checked={showValue} onChange={setShowValue} />
            </div>
          </div>

          <div className="confidence-bar-page__control-group">
            <span className="confidence-bar-page__control-label">Label</span>
            <input
              type="text"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              className="confidence-bar-page__text-input"
              placeholder="Bar label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfidenceBarPage() {
  useStyles('confidence-bar-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

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
    const sections = document.querySelectorAll('.confidence-bar-page__section')
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
    <div className="confidence-bar-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="confidence-bar-page__hero">
        <h1 className="confidence-bar-page__title">ConfidenceBar</h1>
        <p className="confidence-bar-page__desc">
          A semantic meter component that visualizes confidence scores with automatic
          color coding (red/yellow/green) based on configurable thresholds. Uses the
          ARIA meter role with Aurora glow effects and spring-based fill animation.
        </p>
        <div className="confidence-bar-page__import-row">
          <code className="confidence-bar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ─────────────────────────────── */}
      <section className="confidence-bar-page__section" id="sizes">
        <h2 className="confidence-bar-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          Three track heights for different contexts. Small (4px) for compact dashboards,
          medium (8px) for standard use, and large (12px) for prominent displays.
        </p>
        <div className="confidence-bar-page__preview confidence-bar-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '400px', marginInline: 'auto', inlineSize: '100%' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <ConfidenceBar value={0.85} label={`Size: ${s}`} size={s} />
              <span className="confidence-bar-page__item-label" style={{ textAlign: 'end' }}>
                size="{s}"
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Threshold Colors ───────────────────────── */}
      <section className="confidence-bar-page__section" id="thresholds">
        <h2 className="confidence-bar-page__section-title">
          <a href="#thresholds">Threshold Colors</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          The fill color automatically changes based on threshold values. Below 30% shows red (low),
          30-70% shows yellow (medium), and above 70% shows green (high). Customize thresholds via props.
        </p>
        <div className="confidence-bar-page__preview confidence-bar-page__preview--col" style={{ gap: '1.25rem', maxInlineSize: '400px', marginInline: 'auto', inlineSize: '100%' }}>
          <ConfidenceBar value={0.15} label="Low confidence" />
          <ConfidenceBar value={0.45} label="Medium confidence" />
          <ConfidenceBar value={0.92} label="High confidence" />
          <ConfidenceBar
            value={0.5}
            label="Custom thresholds"
            thresholds={{ low: 0.4, medium: 0.6 }}
          />
        </div>
        <CopyBlock
          code={`<ConfidenceBar value={0.15} label="Low confidence" />
<ConfidenceBar value={0.45} label="Medium confidence" />
<ConfidenceBar value={0.92} label="High confidence" />

{/* Custom thresholds */}
<ConfidenceBar
  value={0.5}
  label="Custom thresholds"
  thresholds={{ low: 0.4, medium: 0.6 }}
/>`}
          language="typescript"
        />
      </section>

      {/* ── 5. Motion Levels ──────────────────────────── */}
      <section className="confidence-bar-page__section" id="motion-levels">
        <h2 className="confidence-bar-page__section-title">
          <a href="#motion-levels">Motion Levels</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          The fill animation adapts to motion intensity. Level 0 shows instant fill,
          level 1 uses a subtle ease-out, and levels 2-3 add a spring bounce overshoot
          effect for a more dynamic feel.
        </p>
        <div className="confidence-bar-page__preview confidence-bar-page__preview--col" style={{ gap: '1.25rem', maxInlineSize: '400px', marginInline: 'auto', inlineSize: '100%' }}>
          {([0, 1, 2, 3] as const).map(level => (
            <ConfidenceBar
              key={level}
              value={0.75}
              label={`Motion ${level}`}
              motion={level}
            />
          ))}
        </div>
      </section>

      {/* ── 6. Usage Examples ──────────────────────────── */}
      <section className="confidence-bar-page__section" id="examples">
        <h2 className="confidence-bar-page__section-title">
          <a href="#examples">Usage Examples</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          ConfidenceBar is ideal for ML model accuracy, test coverage, health scores,
          progress indicators, and any metric that maps to a 0-1 range.
        </p>
        <div className="confidence-bar-page__preview confidence-bar-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '450px', marginInline: 'auto', inlineSize: '100%' }}>
          {/* ML Dashboard */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ML Model Performance
              </h4>
              <ConfidenceBar value={0.94} label="Training Accuracy" size="sm" />
              <ConfidenceBar value={0.87} label="Validation Accuracy" size="sm" />
              <ConfidenceBar value={0.23} label="Loss Rate" size="sm" />
              <ConfidenceBar value={0.76} label="F1 Score" size="sm" />
            </div>
          </Card>

          {/* Health Check */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Health
              </h4>
              <ConfidenceBar value={0.98} label="Uptime" />
              <ConfidenceBar value={0.62} label="CPU Usage" />
              <ConfidenceBar value={0.45} label="Memory" />
              <ConfidenceBar value={0.12} label="Error Rate" />
            </div>
          </Card>

          {/* Test Coverage */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Test Coverage
              </h4>
              <ConfidenceBar value={0.91} label="Unit Tests" size="lg" />
              <ConfidenceBar value={0.68} label="Integration Tests" size="lg" />
              <ConfidenceBar value={0.34} label="E2E Tests" size="lg" />
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="confidence-bar-page__section" id="tiers">
        <h2 className="confidence-bar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          Choose the right balance of features and bundle size. The Standard tier includes
          motion levels, Aurora glow, and error boundary. Lite provides CSS-only meter.
        </p>

        <div className="confidence-bar-page__tiers">
          {/* Lite */}
          <div
            className={`confidence-bar-page__tier-card${tier === 'lite' ? ' confidence-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="confidence-bar-page__tier-header">
              <span className="confidence-bar-page__tier-name">Lite</span>
              <span className="confidence-bar-page__tier-size">~0.3 KB</span>
            </div>
            <p className="confidence-bar-page__tier-desc">
              CSS-only progress bar. No motion levels, no thresholds config,
              no Aurora glow. Simple inline color based on value ranges.
            </p>
            <div className="confidence-bar-page__tier-import">
              import {'{'} ConfidenceBar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="confidence-bar-page__tier-preview">
              <LiteConfidenceBar value={85} label="Lite" showValue size="sm" />
            </div>
            <div className="confidence-bar-page__size-breakdown">
              <div className="confidence-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`confidence-bar-page__tier-card${tier === 'standard' ? ' confidence-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="confidence-bar-page__tier-header">
              <span className="confidence-bar-page__tier-name">Standard</span>
              <span className="confidence-bar-page__tier-size">~1.8 KB</span>
            </div>
            <p className="confidence-bar-page__tier-desc">
              Full confidence meter with configurable thresholds, three sizes,
              motion levels, Aurora glow gradient, ARIA meter role, and error boundary.
            </p>
            <div className="confidence-bar-page__tier-import">
              import {'{'} ConfidenceBar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="confidence-bar-page__tier-preview">
              <ConfidenceBar value={0.85} label="Standard" size="sm" />
            </div>
            <div className="confidence-bar-page__size-breakdown">
              <div className="confidence-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`confidence-bar-page__tier-card${tier === 'premium' ? ' confidence-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="confidence-bar-page__tier-header">
              <span className="confidence-bar-page__tier-name">Premium</span>
              <span className="confidence-bar-page__tier-size">~3.5 KB</span>
            </div>
            <p className="confidence-bar-page__tier-desc">
              Everything in Standard plus animated shimmer on the fill, particle burst
              on threshold crossing, spring-based entrance animation, and pulse glow.
            </p>
            <div className="confidence-bar-page__tier-import">
              import {'{'} ConfidenceBar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="confidence-bar-page__tier-preview">
              <ConfidenceBar value={0.85} label="Premium" size="sm" />
            </div>
            <div className="confidence-bar-page__size-breakdown">
              <div className="confidence-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────────── */}
      <section className="confidence-bar-page__section" id="brand-color">
        <h2 className="confidence-bar-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          Pick a brand color to see the page theme update. The confidence bar itself uses
          semantic colors (red/yellow/green) independent of brand, but the Aurora glow
          and page accents update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="confidence-bar-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`confidence-bar-page__color-preset${brandColor === p.hex ? ' confidence-bar-page__color-preset--active' : ''}`}
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
      <section className="confidence-bar-page__section" id="props">
        <h2 className="confidence-bar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          All props accepted by ConfidenceBar. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={confidenceBarPropsData} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─────────────────────────── */}
      <section className="confidence-bar-page__section" id="accessibility">
        <h2 className="confidence-bar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="confidence-bar-page__section-desc">
          ConfidenceBar uses semantic ARIA attributes for full screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="confidence-bar-page__a11y-list">
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA meter:</strong> Uses <code className="confidence-bar-page__a11y-key">role="meter"</code> with <code className="confidence-bar-page__a11y-key">aria-valuenow</code>, <code className="confidence-bar-page__a11y-key">aria-valuemin</code>, and <code className="confidence-bar-page__a11y-key">aria-valuemax</code>.
              </span>
            </li>
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label support:</strong> When a string label is provided, it's used as <code className="confidence-bar-page__a11y-key">aria-label</code>. Falls back to "Confidence".
              </span>
            </li>
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular numbers:</strong> Uses <code className="confidence-bar-page__a11y-key">font-variant-numeric: tabular-nums</code> for stable number width display.
              </span>
            </li>
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="confidence-bar-page__a11y-key">forced-colors: active</code> with system Highlight fill and ButtonText track border.
              </span>
            </li>
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independent:</strong> The fill level (low/medium/high) is communicated through the value percentage, not just color.
              </span>
            </li>
            <li className="confidence-bar-page__a11y-item">
              <span className="confidence-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error boundary:</strong> Wrapped in <code className="confidence-bar-page__a11y-key">ComponentErrorBoundary</code> to prevent render crashes from propagating.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
