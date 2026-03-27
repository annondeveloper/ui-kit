'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ShimmerButton } from '@ui/domain/shimmer-button'
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
    @scope (.shimmer-button-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: shimmer-button-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .shimmer-button-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .shimmer-button-page__hero::before {
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
        animation: shimmer-btn-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes shimmer-btn-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .shimmer-button-page__hero::before { animation: none; }
      }

      .shimmer-button-page__title {
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

      .shimmer-button-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .shimmer-button-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .shimmer-button-page__import-code {
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

      .shimmer-button-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .shimmer-button-page__section {
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
        animation: sb-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sb-section-reveal {
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
        .shimmer-button-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .shimmer-button-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .shimmer-button-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .shimmer-button-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .shimmer-button-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .shimmer-button-page__preview {
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

      .shimmer-button-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .shimmer-button-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .shimmer-button-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container shimmer-button-page (max-width: 680px) {
        .shimmer-button-page__playground {
          grid-template-columns: 1fr;
        }
        .shimmer-button-page__playground-controls {
          position: static !important;
        }
      }

      .shimmer-button-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .shimmer-button-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .shimmer-button-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .shimmer-button-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .shimmer-button-page__playground-controls {
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

      .shimmer-button-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .shimmer-button-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .shimmer-button-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .shimmer-button-page__option-btn {
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
      .shimmer-button-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .shimmer-button-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .shimmer-button-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .shimmer-button-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .shimmer-button-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled items ──────────────────────────────── */

      .shimmer-button-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .shimmer-button-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .shimmer-button-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .shimmer-button-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .shimmer-button-page__state-cell {
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
      .shimmer-button-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .shimmer-button-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .shimmer-button-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .shimmer-button-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .shimmer-button-page__tier-card {
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

      .shimmer-button-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .shimmer-button-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .shimmer-button-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .shimmer-button-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .shimmer-button-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .shimmer-button-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .shimmer-button-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .shimmer-button-page__tier-import {
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

      .shimmer-button-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .shimmer-button-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .shimmer-button-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .shimmer-button-page__code-tabs {
        margin-block-start: 1rem;
      }

      .shimmer-button-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .shimmer-button-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color presets ──────────────────────────────── */

      .shimmer-button-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .shimmer-button-page__color-preset {
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
      .shimmer-button-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .shimmer-button-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .shimmer-button-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .shimmer-button-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .shimmer-button-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .shimmer-button-page__a11y-key {
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
        .shimmer-button-page__hero {
          padding: 2rem 1.25rem;
        }

        .shimmer-button-page__title {
          font-size: 1.75rem;
        }

        .shimmer-button-page__preview {
          padding: 1.75rem;
        }

        .shimmer-button-page__playground {
          grid-template-columns: 1fr;
        }

        .shimmer-button-page__playground-controls {
          position: static !important;
        }

        .shimmer-button-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .shimmer-button-page__tiers {
          grid-template-columns: 1fr;
        }

        .shimmer-button-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .shimmer-button-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .shimmer-button-page__hero {
          padding: 1.5rem 1rem;
        }

        .shimmer-button-page__title {
          font-size: 1.5rem;
        }

        .shimmer-button-page__preview {
          padding: 1rem;
        }

        .shimmer-button-page__states-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .shimmer-button-page__title {
          font-size: 4rem;
        }

        .shimmer-button-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .shimmer-button-page__import-code,
      .shimmer-button-page code,
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

const shimmerButtonProps: PropDef[] = [
  { name: 'shimmerColor', type: 'string', description: 'Custom OKLCH or CSS color for the rotating shimmer border effect. Defaults to brand purple.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding, font-size, and min-height of the button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 shows static shimmer glow. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button with reduced opacity and pointer-events: none.' },
  { name: 'children', type: 'ReactNode', description: 'Button label content.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root button element.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler on the underlying button element.' },
  { name: 'type', type: "'button' | 'submit' | 'reset'", description: 'HTML button type attribute.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ShimmerButton } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ShimmerButton } from '@annondeveloper/ui-kit'",
  premium: "import { ShimmerButton } from '@annondeveloper/ui-kit/premium'",
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

const SHIMMER_COLORS = [
  { value: 'oklch(75% 0.15 270)', label: 'Purple (default)' },
  { value: 'oklch(75% 0.18 150)', label: 'Emerald' },
  { value: 'oklch(70% 0.2 25)', label: 'Rose' },
  { value: 'oklch(80% 0.15 200)', label: 'Cyan' },
  { value: 'oklch(80% 0.18 85)', label: 'Amber' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="shimmer-button-page__copy-btn"
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
    <div className="shimmer-button-page__control-group">
      <span className="shimmer-button-page__control-label">{label}</span>
      <div className="shimmer-button-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`shimmer-button-page__option-btn${opt === value ? ' shimmer-button-page__option-btn--active' : ''}`}
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
    <label className="shimmer-button-page__toggle-label">
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
  shimmerColor: string,
  size: Size,
  disabled: boolean,
  motion: number,
  label: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (shimmerColor !== SHIMMER_COLORS[0].value) props.push(`  shimmerColor="${shimmerColor}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  if (props.length === 0) {
    return `${importStr}\n\n<ShimmerButton>${label}</ShimmerButton>`
  }
  return `${importStr}\n\n<ShimmerButton\n${props.join('\n')}\n>${label}</ShimmerButton>`
}

function generateHtmlCode(tier: Tier, shimmerColor: string, size: Size, label: string): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/shimmer-button.css';`
  const colorStyle = shimmerColor !== SHIMMER_COLORS[0].value ? ` style="--shimmer-button-color: ${shimmerColor}"` : ''

  return `<!-- ShimmerButton — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/shimmer-button.css">

<button class="ui-shimmer-button" data-size="${size}"${colorStyle}>
  ${label}
</button>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, shimmerColor: string, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-shimmer-button"`, `data-size="${size}"`]
    if (disabled) attrs.push(':disabled="true"')
    return `<template>\n  <button ${attrs.join(' ')}>\n    ${label}\n  </button>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (shimmerColor !== SHIMMER_COLORS[0].value) attrs.push(`  shimmer-color="${shimmerColor}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')

  const template = attrs.length === 0
    ? `  <ShimmerButton>${label}</ShimmerButton>`
    : `  <ShimmerButton\n  ${attrs.join('\n  ')}\n  >${label}</ShimmerButton>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { ShimmerButton } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, shimmerColor: string, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-shimmer-button"`, `data-size="${size}"`]
    if (disabled) attrs.push('[disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->\n<button ${attrs.join(' ')}>\n  ${label}\n</button>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const colorAttr = shimmerColor !== SHIMMER_COLORS[0].value ? `\n  [style]="'--shimmer-button-color: ${shimmerColor}'"` : ''
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<button
  class="ui-shimmer-button"
  data-size="${size}"${colorAttr}
  ${disabled ? '[disabled]="true"' : ''}
>
  ${label}
</button>

/* Import component CSS */
@import '${importPath}/css/components/shimmer-button.css';`
}

function generateSvelteCode(tier: Tier, shimmerColor: string, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<button\n  class="ui-shimmer-button"\n  data-size="${size}"\n  ${disabled ? 'disabled' : ''}\n>\n  ${label}\n</button>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (shimmerColor !== SHIMMER_COLORS[0].value) attrs.push(`shimmerColor="${shimmerColor}"`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (disabled) attrs.push('disabled')
  const attrStr = attrs.length > 0 ? `\n  ${attrs.join('\n  ')}` : ''
  return `<script>\n  import { ShimmerButton } from '${importPath}';\n</script>\n\n<ShimmerButton${attrStr}>\n  ${label}\n</ShimmerButton>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [shimmerColor, setShimmerColor] = useState(SHIMMER_COLORS[0].value)
  const [size, setSize] = useState<Size>('md')
  const [disabled, setDisabled] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [label, setLabel] = useState('Get Started')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, shimmerColor, size, disabled, motion, label), [tier, shimmerColor, size, disabled, motion, label])
  const htmlCode = useMemo(() => generateHtmlCode(tier, shimmerColor, size, label), [tier, shimmerColor, size, label])
  const vueCode = useMemo(() => generateVueCode(tier, shimmerColor, size, label, disabled), [tier, shimmerColor, size, label, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, shimmerColor, size, label, disabled), [tier, shimmerColor, size, label, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, shimmerColor, size, label, disabled), [tier, shimmerColor, size, label, disabled])

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

  return (
    <section className="shimmer-button-page__section" id="playground">
      <h2 className="shimmer-button-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="shimmer-button-page__section-desc">
        Tweak every prop and see the result in real-time. The conic-gradient shimmer continuously rotates around the button border.
      </p>

      <div className="shimmer-button-page__playground">
        <div className="shimmer-button-page__playground-preview">
          <div className="shimmer-button-page__playground-result">
            <ShimmerButton
              shimmerColor={shimmerColor}
              size={size}
              disabled={disabled}
              motion={motion}
            >
              {label}
            </ShimmerButton>
          </div>

          <div className="shimmer-button-page__code-tabs">
            <div className="shimmer-button-page__export-row">
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
              {copyStatus && <span className="shimmer-button-page__export-status">{copyStatus}</span>}
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

        <div className="shimmer-button-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          <OptionGroup
            label="Shimmer Color"
            options={SHIMMER_COLORS.map(c => c.label) as unknown as readonly string[]}
            value={SHIMMER_COLORS.find(c => c.value === shimmerColor)?.label ?? SHIMMER_COLORS[0].label}
            onChange={v => {
              const found = SHIMMER_COLORS.find(c => c.label === v)
              if (found) setShimmerColor(found.value)
            }}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="shimmer-button-page__control-group">
            <span className="shimmer-button-page__control-label">Toggles</span>
            <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
          </div>

          <div className="shimmer-button-page__control-group">
            <span className="shimmer-button-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="shimmer-button-page__text-input"
              placeholder="Button label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShimmerButtonPage() {
  useStyles('shimmer-button-page', pageStyles)

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.shimmer-button-page__section')
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
    <div className="shimmer-button-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="shimmer-button-page__hero">
        <h1 className="shimmer-button-page__title">ShimmerButton</h1>
        <p className="shimmer-button-page__desc">
          A call-to-action button with a continuously rotating conic-gradient shimmer border effect.
          The shimmer creates an eye-catching animated border that draws attention without being distracting.
        </p>
        <div className="shimmer-button-page__import-row">
          <code className="shimmer-button-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="shimmer-button-page__section" id="sizes">
        <h2 className="shimmer-button-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Three sizes from compact (sm) to prominent (lg). Sizes control padding, font-size, and minimum block-size.
        </p>
        <div className="shimmer-button-page__preview">
          <div className="shimmer-button-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="shimmer-button-page__labeled-item">
                <ShimmerButton size={s}>Shimmer</ShimmerButton>
                <span className="shimmer-button-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Shimmer Colors ──────────────────────────── */}
      <section className="shimmer-button-page__section" id="shimmer-colors">
        <h2 className="shimmer-button-page__section-title">
          <a href="#shimmer-colors">Shimmer Colors</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Customize the shimmer color via the <code>shimmerColor</code> prop. Uses OKLCH for perceptually uniform color rendering.
          The conic-gradient fades from transparent to your color and back, creating the rotating shimmer effect.
        </p>
        <div className="shimmer-button-page__preview" style={{ gap: '1.25rem' }}>
          {SHIMMER_COLORS.map(c => (
            <div key={c.label} className="shimmer-button-page__labeled-item">
              <ShimmerButton shimmerColor={c.value}>{c.label.split(' ')[0]}</ShimmerButton>
              <span className="shimmer-button-page__item-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="shimmer-button-page__section" id="states">
        <h2 className="shimmer-button-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          ShimmerButton handles all interaction states with clear visual feedback. The shimmer continues rotating in all states except disabled.
        </p>
        <div className="shimmer-button-page__states-grid">
          <div className="shimmer-button-page__state-cell">
            <ShimmerButton>Default</ShimmerButton>
            <span className="shimmer-button-page__state-label">Default</span>
          </div>
          <div className="shimmer-button-page__state-cell">
            <ShimmerButton>Hover me</ShimmerButton>
            <span className="shimmer-button-page__state-label">Hover</span>
            <span className="shimmer-button-page__state-hint">lifts with shadow</span>
          </div>
          <div className="shimmer-button-page__state-cell">
            <ShimmerButton>Focus me</ShimmerButton>
            <span className="shimmer-button-page__state-label">Focus</span>
            <span className="shimmer-button-page__state-hint">press Tab key</span>
          </div>
          <div className="shimmer-button-page__state-cell">
            <ShimmerButton>Press me</ShimmerButton>
            <span className="shimmer-button-page__state-label">Active</span>
            <span className="shimmer-button-page__state-hint">click and hold</span>
          </div>
          <div className="shimmer-button-page__state-cell">
            <ShimmerButton disabled>Disabled</ShimmerButton>
            <span className="shimmer-button-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 6. Motion Levels ────────────────────────────── */}
      <section className="shimmer-button-page__section" id="motion">
        <h2 className="shimmer-button-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Motion level 0 stops the rotation animation and shows a static shimmer glow instead.
          The component also respects <code>prefers-reduced-motion</code>.
        </p>
        <div className="shimmer-button-page__preview" style={{ gap: '1.5rem' }}>
          {([0, 1, 2, 3] as const).map(m => (
            <div key={m} className="shimmer-button-page__labeled-item">
              <ShimmerButton motion={m}>Motion {m}</ShimmerButton>
              <span className="shimmer-button-page__item-label">motion={m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Use Cases ───────────────────────────────── */}
      <section className="shimmer-button-page__section" id="examples">
        <h2 className="shimmer-button-page__section-title">
          <a href="#examples">Use Cases</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          ShimmerButton is ideal for call-to-action buttons, onboarding flows, and feature highlights
          where you want to draw the user's attention.
        </p>
        <div className="shimmer-button-page__preview shimmer-button-page__preview--col" style={{ gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxInlineSize: '360px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>
              Ready to get started?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBlockEnd: '1.25rem', lineHeight: 1.6 }}>
              Join thousands of developers building beautiful interfaces with our component library.
            </p>
            <ShimmerButton size="lg">Start Free Trial</ShimmerButton>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <ShimmerButton shimmerColor="oklch(75% 0.18 150)" size="sm">Upgrade Plan</ShimmerButton>
            <ShimmerButton shimmerColor="oklch(70% 0.2 25)" size="sm">Limited Offer</ShimmerButton>
            <ShimmerButton shimmerColor="oklch(80% 0.15 200)" size="sm">Explore Features</ShimmerButton>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="shimmer-button-page__section" id="tiers">
        <h2 className="shimmer-button-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides CSS-only shimmer border.
          Standard adds motion levels and custom colors. Premium adds magnetic hover, click ripple, and particle burst.
        </p>

        <div className="shimmer-button-page__tiers">
          {/* Lite */}
          <div
            className={`shimmer-button-page__tier-card${tier === 'lite' ? ' shimmer-button-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="shimmer-button-page__tier-header">
              <span className="shimmer-button-page__tier-name">Lite</span>
              <span className="shimmer-button-page__tier-size">~0.5 KB</span>
            </div>
            <p className="shimmer-button-page__tier-desc">
              CSS-only shimmer with rotating conic-gradient border animation.
              No JavaScript. Fixed shimmer color via CSS custom property.
            </p>
            <div className="shimmer-button-page__tier-import">
              import {'{'} ShimmerButton {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="shimmer-button-page__tier-preview">
              <ShimmerButton motion={0} size="sm">Lite</ShimmerButton>
            </div>
            <div className="shimmer-button-page__size-breakdown">
              <div className="shimmer-button-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`shimmer-button-page__tier-card${tier === 'standard' ? ' shimmer-button-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="shimmer-button-page__tier-header">
              <span className="shimmer-button-page__tier-name">Standard</span>
              <span className="shimmer-button-page__tier-size">~1.3 KB</span>
            </div>
            <p className="shimmer-button-page__tier-desc">
              Full-featured shimmer button with customizable shimmer color,
              three size variants, motion level support, and disabled states.
            </p>
            <div className="shimmer-button-page__tier-import">
              import {'{'} ShimmerButton {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="shimmer-button-page__tier-preview">
              <ShimmerButton size="sm">Standard</ShimmerButton>
            </div>
            <div className="shimmer-button-page__size-breakdown">
              <div className="shimmer-button-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`shimmer-button-page__tier-card${tier === 'premium' ? ' shimmer-button-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="shimmer-button-page__tier-header">
              <span className="shimmer-button-page__tier-name">Premium</span>
              <span className="shimmer-button-page__tier-size">~2.4 KB</span>
            </div>
            <p className="shimmer-button-page__tier-desc">
              Everything in Standard plus magnetic cursor attraction on hover,
              click ripple effect, particle burst on press, and spring-based hover lift animation.
            </p>
            <div className="shimmer-button-page__tier-import">
              import {'{'} ShimmerButton {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="shimmer-button-page__tier-preview">
              <ShimmerButton shimmerColor="oklch(75% 0.18 270)" size="sm">Premium</ShimmerButton>
            </div>
            <div className="shimmer-button-page__size-breakdown">
              <div className="shimmer-button-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="shimmer-button-page__section" id="brand-color">
        <h2 className="shimmer-button-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Pick a brand color to see the shimmer button update in real-time. The theme generates
          derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="shimmer-button-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`shimmer-button-page__color-preset${brandColor === p.hex ? ' shimmer-button-page__color-preset--active' : ''}`}
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

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="shimmer-button-page__section" id="props">
        <h2 className="shimmer-button-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          All props accepted by ShimmerButton. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={shimmerButtonProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ─────────────────────────── */}
      <section className="shimmer-button-page__section" id="accessibility">
        <h2 className="shimmer-button-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="shimmer-button-page__section-desc">
          Built on the native {'<button>'} element with full keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="shimmer-button-page__a11y-list">
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="shimmer-button-page__a11y-key">Enter</code> and <code className="shimmer-button-page__a11y-key">Space</code> keys via native button behavior.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="shimmer-button-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Shimmer rotation stops and shows a static glow border when <code className="shimmer-button-page__a11y-key">prefers-reduced-motion: reduce</code> is active.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses the native <code className="shimmer-button-page__a11y-key">disabled</code> attribute with reduced opacity and no hover/shadow effects.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum height via <code className="shimmer-button-page__a11y-key">min-block-size: 2.75rem</code>.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="shimmer-button-page__a11y-key">forced-colors: active</code> with visible 2px borders and no shimmer pseudo-elements.
              </span>
            </li>
            <li className="shimmer-button-page__a11y-item">
              <span className="shimmer-button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Shimmer pseudo-elements are hidden in print stylesheets.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
