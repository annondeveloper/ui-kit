'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Slider } from '@ui/components/slider'
import { Slider as LiteSlider } from '@ui/lite/slider'
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
    @scope (.slider-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: slider-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .slider-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .slider-page__hero::before {
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
        .slider-page__hero::before { animation: none; }
      }

      .slider-page__title {
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

      .slider-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .slider-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .slider-page__import-code {
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

      .slider-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .slider-page__section {
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
        animation: slider-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes slider-section-reveal {
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
        .slider-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .slider-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .slider-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .slider-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .slider-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .slider-page__preview {
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

      .slider-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .slider-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .slider-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .slider-page__playground {
          grid-template-columns: 1fr;
        }
        .slider-page__playground-controls {
          position: static !important;
        }
      }

      @container slider-page (max-width: 680px) {
        .slider-page__playground {
          grid-template-columns: 1fr;
        }
        .slider-page__playground-controls {
          position: static !important;
        }
      }

      .slider-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .slider-page__playground-result {
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

      .slider-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .slider-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .slider-page__playground-controls {
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

      .slider-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .slider-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .slider-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .slider-page__option-btn {
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
      .slider-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .slider-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .slider-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .slider-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .slider-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .slider-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .slider-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .slider-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 120px;
      }

      .slider-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .slider-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .slider-page__tier-card {
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

      .slider-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .slider-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .slider-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .slider-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .slider-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .slider-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .slider-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .slider-page__tier-import {
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

      .slider-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .slider-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .slider-page__color-preset {
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
      .slider-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .slider-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .slider-page__code-tabs {
        margin-block-start: 1rem;
      }

      .slider-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .slider-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .slider-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .slider-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .slider-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .slider-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .slider-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .slider-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .slider-page__hero {
          padding: 2rem 1.25rem;
        }

        .slider-page__title {
          font-size: 1.75rem;
        }

        .slider-page__preview {
          padding: 1.75rem;
        }

        .slider-page__playground {
          grid-template-columns: 1fr;
        }

        .slider-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .slider-page__labeled-row {
          gap: 1rem;
        }

        .slider-page__tiers {
          grid-template-columns: 1fr;
        }

        .slider-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .slider-page__hero {
          padding: 1.5rem 1rem;
        }

        .slider-page__title {
          font-size: 1.5rem;
        }

        .slider-page__preview {
          padding: 1rem;
        }

        .slider-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .slider-page__title {
          font-size: 4rem;
        }

        .slider-page__preview {
          padding: 3.5rem;
        }

        .slider-page__labeled-row {
          gap: 2.5rem;
        }
      }

      .slider-page__import-code,
      .slider-page code,
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

const sliderProps: PropDef[] = [
  { name: 'min', type: 'number', default: '0', description: 'Minimum value of the slider range.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value of the slider range.' },
  { name: 'step', type: 'number', default: '1', description: 'Step increment between values.' },
  { name: 'value', type: 'number', description: 'Controlled value. When set, the component becomes controlled.' },
  { name: 'defaultValue', type: 'number', description: 'Initial value for uncontrolled mode. Defaults to min.' },
  { name: 'onChange', type: '(value: number) => void', description: 'Callback fired when the slider value changes.' },
  { name: 'label', type: 'string', description: 'Text label displayed above the slider track.' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the current numeric value next to the label.' },
  { name: 'showTicks', type: 'boolean', default: 'false', description: 'Render tick marks along the track at each step.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the slider, reducing opacity and blocking interaction.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Track thickness and visual size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override for thumb transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Slider } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Slider } from '@annondeveloper/ui-kit'",
  premium: "import { Slider } from '@annondeveloper/ui-kit/premium'",
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
      className="slider-page__copy-btn"
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
    <div className="slider-page__control-group">
      <span className="slider-page__control-label">{label}</span>
      <div className="slider-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`slider-page__option-btn${opt === value ? ' slider-page__option-btn--active' : ''}`}
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
    <label className="slider-page__toggle-label">
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
  size: Size,
  min: number,
  max: number,
  step: number,
  sliderLabel: string,
  showValue: boolean,
  showTicks: boolean,
  disabled: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (min !== 0) props.push(`  min={${min}}`)
  if (max !== 100) props.push(`  max={${max}}`)
  if (step !== 1) props.push(`  step={${step}}`)
  if (size !== 'md' && tier !== 'lite') props.push(`  size="${size}"`)
  if (sliderLabel) props.push(`  label="${sliderLabel}"`)
  if (showValue && tier !== 'lite') props.push('  showValue')
  if (showTicks && tier !== 'lite') props.push('  showTicks')
  if (disabled) props.push('  disabled')

  if (tier === 'lite') {
    const liteProps: string[] = []
    if (min !== 0) liteProps.push(`  min={${min}}`)
    if (max !== 100) liteProps.push(`  max={${max}}`)
    if (step !== 1) liteProps.push(`  step={${step}}`)
    if (sliderLabel) liteProps.push(`  label="${sliderLabel}"`)
    if (showValue) liteProps.push('  showValue')
    if (disabled) liteProps.push('  disabled')
    const jsx = liteProps.length === 0
      ? '<Slider />'
      : `<Slider\n${liteProps.join('\n')}\n/>`
    return `${importStr}\n\n${jsx}`
  }

  const jsx = props.length === 0
    ? '<Slider />'
    : `<Slider\n${props.join('\n')}\n/>`
  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size, min: number, max: number, step: number, sliderLabel: string, disabled: boolean): string {
  const className = tier === 'lite' ? 'ui-lite-slider' : 'ui-slider'
  const tierLabel = tier === 'lite' ? 'lite' : 'standard'
  return `<!-- Slider — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/slider.css'}">

<div class="${className}" data-size="${size}">
  ${sliderLabel ? `<label>${sliderLabel}</label>\n  ` : ''}<input type="range" min="${min}" max="${max}" step="${step}"${disabled ? ' disabled' : ''} />
</div>`
}

function generateVueCode(tier: Tier, size: Size, min: number, max: number, step: number, sliderLabel: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-slider">
    ${sliderLabel ? `<label>${sliderLabel}</label>\n    ` : ''}<input type="range" :min="${min}" :max="${max}" :step="${step}" v-model="value"${disabled ? ' disabled' : ''} />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const value = ref(50)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  return `<template>
  <Slider
    v-model="value"
    :min="${min}"
    :max="${max}"
    :step="${step}"
    size="${size}"
    ${sliderLabel ? `label="${sliderLabel}"` : ''}
    ${disabled ? 'disabled' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { Slider } from '${importPath}'
const value = ref(50)
</script>`
}

function generateAngularCode(tier: Tier, size: Size, min: number, max: number, step: number, sliderLabel: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-slider">
  ${sliderLabel ? `<label>${sliderLabel}</label>\n  ` : ''}<input type="range" [min]="${min}" [max]="${max}" [step]="${step}" [(ngModel)]="value"${disabled ? ' [disabled]="true"' : ''} />
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier -->
<div class="ui-slider" data-size="${size}">
  ${sliderLabel ? `<label>${sliderLabel}</label>\n  ` : ''}<input type="range" [min]="${min}" [max]="${max}" [step]="${step}" [(ngModel)]="value"${disabled ? ' [disabled]="true"' : ''} />
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/slider.css';`
}

function generateSvelteCode(tier: Tier, size: Size, min: number, max: number, step: number, sliderLabel: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-slider">
  ${sliderLabel ? `<label>${sliderLabel}</label>\n  ` : ''}<input type="range" min={${min}} max={${max}} step={${step}} bind:value${disabled ? ' disabled' : ''} />
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { Slider } from '@annondeveloper/ui-kit';
  let value = 50;
</script>

<Slider
  bind:value
  min={${min}}
  max={${max}}
  step={${step}}
  size="${size}"
  ${sliderLabel ? `label="${sliderLabel}"` : ''}
  ${disabled ? 'disabled' : ''}
/>`
}

// ─── Interactive Playground ──────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)
  const [step, setStep] = useState(1)
  const [sliderValue, setSliderValue] = useState(50)
  const [sliderLabel, setSliderLabel] = useState('Volume')
  const [showValue, setShowValue] = useState(true)
  const [showTicks, setShowTicks] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, size, min, max, step, sliderLabel, showValue, showTicks, disabled),
    [tier, size, min, max, step, sliderLabel, showValue, showTicks, disabled],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, min, max, step, sliderLabel, disabled), [tier, size, min, max, step, sliderLabel, disabled])
  const vueCode = useMemo(() => generateVueCode(tier, size, min, max, step, sliderLabel, disabled), [tier, size, min, max, step, sliderLabel, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, min, max, step, sliderLabel, disabled), [tier, size, min, max, step, sliderLabel, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, min, max, step, sliderLabel, disabled), [tier, size, min, max, step, sliderLabel, disabled])

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
    <section className="slider-page__section" id="playground">
      <h2 className="slider-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="slider-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="slider-page__playground">
        <div className="slider-page__playground-preview">
          <div className="slider-page__playground-result">
            {tier === 'lite' ? (
              <LiteSlider
                label={sliderLabel || undefined}
                showValue={showValue}
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                disabled={disabled}
                onChange={e => setSliderValue(Number((e.target as HTMLInputElement).value))}
                style={{ inlineSize: '100%' }}
              />
            ) : (
              <Slider
                label={sliderLabel || undefined}
                showValue={showValue}
                showTicks={showTicks}
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={setSliderValue}
                size={size}
                disabled={disabled}
                style={{ inlineSize: '100%' }}
              />
            )}
          </div>

          <div className="slider-page__code-tabs">
            <div className="slider-page__export-row">
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
              {copyStatus && <span className="slider-page__export-status">{copyStatus}</span>}
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

        <div className="slider-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          <div className="slider-page__control-group">
            <span className="slider-page__control-label">Min</span>
            <input
              type="number"
              value={min}
              onChange={e => setMin(Number(e.target.value))}
              className="slider-page__text-input"
            />
          </div>

          <div className="slider-page__control-group">
            <span className="slider-page__control-label">Max</span>
            <input
              type="number"
              value={max}
              onChange={e => setMax(Number(e.target.value))}
              className="slider-page__text-input"
            />
          </div>

          <div className="slider-page__control-group">
            <span className="slider-page__control-label">Step</span>
            <input
              type="number"
              value={step}
              onChange={e => setStep(Number(e.target.value))}
              className="slider-page__text-input"
              min={0.01}
            />
          </div>

          <div className="slider-page__control-group">
            <span className="slider-page__control-label">Label</span>
            <input
              type="text"
              value={sliderLabel}
              onChange={e => setSliderLabel(e.target.value)}
              className="slider-page__text-input"
              placeholder="Slider label..."
            />
          </div>

          <div className="slider-page__control-group">
            <span className="slider-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show value" checked={showValue} onChange={setShowValue} />
              {tier !== 'lite' && <Toggle label="Show ticks" checked={showTicks} onChange={setShowTicks} />}
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SliderPage() {
  useStyles('slider-page', pageStyles)

  const { tier, setTier } = useTier()
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

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.slider-page__section')
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

  const SliderComponent = tier === 'lite' ? LiteSlider : Slider

  return (
    <div className="slider-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="slider-page__hero">
        <h1 className="slider-page__title">Slider</h1>
        <p className="slider-page__desc">
          Range input with customizable track, thumb, tick marks, and label.
          Built on the native {'<input type="range">'} with full keyboard and touch support.
        </p>
        <div className="slider-page__import-row">
          <code className="slider-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="slider-page__section" id="sizes">
        <h2 className="slider-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="slider-page__section-desc">
          Five track thickness levels from hairline (xs) to bold (xl).
          Sizes control the track height and visual weight.
        </p>
        <div className="slider-page__preview slider-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <div style={{ inlineSize: '100%' }}>
              <LiteSlider label="Lite slider" showValue defaultValue={60} />
            </div>
          ) : (
            SIZES.map(s => (
              <div key={s} style={{ inlineSize: '100%' }}>
                <Slider
                  size={s}
                  label={s}
                  showValue
                  defaultValue={40 + SIZES.indexOf(s) * 10}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 4. Variants / Features ─────────────────────── */}
      <section className="slider-page__section" id="features">
        <h2 className="slider-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="slider-page__section-desc">
          Labels, live value display, tick marks, custom ranges, and disabled state.
        </p>

        <div className="slider-page__preview slider-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <>
              <div style={{ inlineSize: '100%' }}>
                <LiteSlider label="With label" defaultValue={50} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <LiteSlider label="With value" showValue defaultValue={75} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <LiteSlider label="Disabled" disabled defaultValue={30} />
              </div>
            </>
          ) : (
            <>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="With label" defaultValue={50} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Show value" showValue defaultValue={75} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="With tick marks" showTicks showValue min={0} max={10} step={1} defaultValue={5} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Custom range" showValue min={-50} max={50} step={5} defaultValue={0} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Fine step (0.1)" showValue min={0} max={1} step={0.1} defaultValue={0.5} />
              </div>
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Disabled" disabled showValue defaultValue={30} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="slider-page__section" id="tiers">
        <h2 className="slider-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="slider-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier uses native HTML only,
          while Standard adds OKLCH theming, tick marks, sizes, and motion.
        </p>

        <div className="slider-page__tiers">
          {/* Lite */}
          <div
            className={`slider-page__tier-card${tier === 'lite' ? ' slider-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="slider-page__tier-header">
              <span className="slider-page__tier-name">Lite</span>
              <span className="slider-page__tier-size">~0.2 KB</span>
            </div>
            <p className="slider-page__tier-desc">
              CSS-only slider. Native range input with minimal wrapper.
              No tick marks, no sizes, no motion.
            </p>
            <div className="slider-page__tier-import">
              import {'{'} Slider {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="slider-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <LiteSlider label="Lite" showValue defaultValue={60} />
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`slider-page__tier-card${tier === 'standard' ? ' slider-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="slider-page__tier-header">
              <span className="slider-page__tier-name">Standard</span>
              <span className="slider-page__tier-size">~1.8 KB</span>
            </div>
            <p className="slider-page__tier-desc">
              Full-featured slider with OKLCH track fill, five sizes,
              tick marks, label, value display, and motion levels.
            </p>
            <div className="slider-page__tier-import">
              import {'{'} Slider {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="slider-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Standard" showValue showTicks min={0} max={10} step={1} defaultValue={7} />
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`slider-page__tier-card${tier === 'premium' ? ' slider-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="slider-page__tier-header">
              <span className="slider-page__tier-name">Premium</span>
              <span className="slider-page__tier-size">~3-5 KB</span>
            </div>
            <p className="slider-page__tier-desc">
              Aurora glow on thumb with hover intensify, spring-bounce on active release, and shimmer track fill overlay.
            </p>
            <div className="slider-page__tier-import">
              import {'{'} Slider {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="slider-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Premium" showValue size="lg" defaultValue={85} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="slider-page__section" id="brand-color">
        <h2 className="slider-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="slider-page__section-desc">
          Pick a brand color to see the slider thumb and track fill update in real-time.
          The theme generates derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="slider-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`slider-page__color-preset${brandColor === p.hex ? ' slider-page__color-preset--active' : ''}`}
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
          <div className="slider-page__preview" style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <div style={{ inlineSize: '100%' }}>
                <LiteSlider label="Branded slider" showValue defaultValue={65} />
              </div>
            ) : (
              <div style={{ inlineSize: '100%' }}>
                <Slider label="Branded slider" showValue size="lg" defaultValue={65} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="slider-page__section" id="props">
        <h2 className="slider-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="slider-page__section-desc">
          All props accepted by Slider. It also spreads any native div HTML attributes
          onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sliderProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="slider-page__section" id="accessibility">
        <h2 className="slider-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="slider-page__section-desc">
          Built on the native {'<input type="range">'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="slider-page__a11y-list">
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="slider-page__a11y-key">Arrow Left/Right</code> adjust value by step, <code className="slider-page__a11y-key">Home/End</code> jump to min/max.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Provides <code className="slider-page__a11y-key">aria-valuenow</code>, <code className="slider-page__a11y-key">aria-valuemin</code>, and <code className="slider-page__a11y-key">aria-valuemax</code>.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow on the thumb via <code className="slider-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Thumb enlarges to 28px on coarse pointer devices for easier touch interaction.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> The <code className="slider-page__a11y-key">label</code> prop provides an accessible name via <code className="slider-page__a11y-key">aria-label</code>.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="slider-page__a11y-key">forced-colors: active</code> with visible track and thumb borders.
              </span>
            </li>
            <li className="slider-page__a11y-item">
              <span className="slider-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="slider-page__a11y-key">prefers-reduced-motion</code> by disabling thumb transitions at motion level 0.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────── */}
      <section className="slider-page__section" id="source">
        <h2 className="slider-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="slider-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            className="slider-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/slider.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="code" size="sm" />
            src/components/slider.tsx — Standard tier
          </a>
          <a
            className="slider-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/slider.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="code" size="sm" />
            src/lite/slider.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
