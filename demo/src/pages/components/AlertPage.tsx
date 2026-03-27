'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Alert } from '@ui/components/alert'
import { Alert as LiteAlert } from '@ui/lite/alert'
import { Alert as PremiumAlert } from '@ui/premium/alert'
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
    @scope (.alert-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: alert-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .alert-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .alert-page__hero::before {
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
        .alert-page__hero::before { animation: none; }
      }

      .alert-page__title {
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

      .alert-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .alert-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .alert-page__import-code {
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

      .alert-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .alert-page__section {
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
        .alert-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .alert-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .alert-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .alert-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .alert-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .alert-page__preview {
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
      .alert-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .alert-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .alert-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .alert-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .alert-page__playground {
          grid-template-columns: 1fr;
        }
        .alert-page__playground-controls {
          position: static !important;
        }
      }

      @container alert-page (max-width: 680px) {
        .alert-page__playground {
          grid-template-columns: 1fr;
        }
        .alert-page__playground-controls {
          position: static !important;
        }
      }

      .alert-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .alert-page__playground-result {
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
      .alert-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .alert-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .alert-page__playground-controls {
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

      .alert-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .alert-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .alert-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .alert-page__option-btn {
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
      .alert-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .alert-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .alert-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .alert-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .alert-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .alert-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .alert-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .alert-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .alert-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .alert-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .alert-page__tier-card {
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

      .alert-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .alert-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .alert-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .alert-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .alert-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .alert-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .alert-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .alert-page__tier-import {
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

      .alert-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .alert-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .alert-page__color-preset {
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
      .alert-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .alert-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .alert-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .alert-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .alert-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .alert-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .alert-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .alert-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .alert-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .alert-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .alert-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .alert-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .alert-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .alert-page__hero {
          padding: 2rem 1.25rem;
        }

        .alert-page__title {
          font-size: 1.75rem;
        }

        .alert-page__preview {
          padding: 1.75rem;
        }

        .alert-page__playground {
          grid-template-columns: 1fr;
        }

        .alert-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .alert-page__labeled-row {
          gap: 1rem;
        }

        .alert-page__tiers {
          grid-template-columns: 1fr;
        }

        .alert-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .alert-page__hero {
          padding: 1.5rem 1rem;
        }

        .alert-page__title {
          font-size: 1.5rem;
        }

        .alert-page__preview {
          padding: 1rem;
        }

        .alert-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .alert-page__title {
          font-size: 4rem;
        }

        .alert-page__preview {
          padding: 3.5rem;
        }

        .alert-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .alert-page__import-code,
      .alert-page code,
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

const alertProps: PropDef[] = [
  { name: 'variant', type: "'info' | 'success' | 'warning' | 'error'", description: 'Semantic variant controlling color and default icon.' },
  { name: 'title', type: 'ReactNode', description: 'Optional bold heading rendered above the body content.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon override. Default icons are provided per variant.' },
  { name: 'dismissible', type: 'boolean', default: 'false', description: 'Shows a dismiss button in the top-right corner.' },
  { name: 'onDismiss', type: '() => void', description: 'Callback fired when the dismiss button is clicked.' },
  { name: 'action', type: '{ label: string; onClick: () => void }', description: 'Action link rendered below the body text.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and border width.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'children', type: 'ReactNode', description: 'Alert body content.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the underlying <div> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'info' | 'success' | 'warning' | 'error'

const VARIANTS: Variant[] = ['info', 'success', 'warning', 'error']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Alert } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Alert } from '@annondeveloper/ui-kit'",
  premium: "import { Alert } from '@annondeveloper/ui-kit/premium'",
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
      className="alert-page__copy-btn"
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
    <div className="alert-page__control-group">
      <span className="alert-page__control-label">{label}</span>
      <div className="alert-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`alert-page__option-btn${opt === value ? ' alert-page__option-btn--active' : ''}`}
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
    <label className="alert-page__toggle-label">
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

function generateHtmlExport(tier: Tier, variant: Variant, message: string, showTitle: boolean, title: string): string {
  const className = tier === 'lite' ? 'ui-lite-alert' : 'ui-alert'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : tier === 'premium'
    ? `@import '@annondeveloper/ui-kit/css/components/alert.css';\n@import '@annondeveloper/ui-kit/css/premium/alert.css';`
    : `@import '@annondeveloper/ui-kit/css/components/alert.css';`

  const titleHtml = showTitle ? `\n  <div class="${className}__title">${title}</div>` : ''

  return `<!-- Alert — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/alert.css'}">

<div class="${className}" data-variant="${variant}" role="${variant === 'warning' || variant === 'error' ? 'alert' : 'status'}">
  <div class="${className}__content">${titleHtml}
    <div class="${className}__body">${message}</div>
  </div>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateReactCode(
  tier: Tier,
  variant: Variant,
  message: string,
  dismissible: boolean,
  showIcon: boolean,
  showTitle: boolean,
  title: string,
  showAction: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}

<Alert variant="${variant}">
  ${message}
</Alert>`
  }

  const props: string[] = [`  variant="${variant}"`]
  if (showTitle) props.push(`  title="${title}"`)
  if (dismissible) props.push('  dismissible\n  onDismiss={() => setVisible(false)}')
  if (!showIcon) props.push('  icon={null}')
  if (showAction) props.push(`  action={{ label: 'Learn more', onClick: handleAction }}`)

  return `${importStr}

<Alert
${props.join('\n')}
>
  ${message}
</Alert>`
}

function generateVueCode(tier: Tier, variant: Variant, message: string, showTitle: boolean, title: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-alert" data-variant="${variant}" role="${variant === 'warning' || variant === 'error' ? 'alert' : 'status'}">
    ${message}
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = [`  variant="${variant}"`]
  if (showTitle) attrs.push(`  title="${title}"`)

  return `<template>
  <Alert
  ${attrs.join('\n  ')}
  >
    ${message}
  </Alert>
</template>

<script setup>
import { Alert } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'
</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, message: string, showTitle: boolean, title: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-alert" data-variant="${variant}" role="${variant === 'warning' || variant === 'error' ? 'alert' : 'status'}">
  ${message}
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const titleAttr = showTitle ? `\n  data-title="${title}"` : ''
  return `<!-- Angular — Standard tier -->
<div
  class="ui-alert"
  data-variant="${variant}"${titleAttr}
  role="${variant === 'warning' || variant === 'error' ? 'alert' : 'status'}"
>
  <div class="ui-alert__content">
    ${showTitle ? `<div class="ui-alert__title">${title}</div>\n    ` : ''}<div class="ui-alert__body">${message}</div>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/alert.css';${tier === 'premium' ? `\n@import '@annondeveloper/ui-kit/css/premium/alert.css';` : ''}`
}

function generateSvelteCode(tier: Tier, variant: Variant, message: string, showTitle: boolean, title: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div
  class="ui-lite-alert"
  data-variant="${variant}"
  role="${variant === 'warning' || variant === 'error' ? 'alert' : 'status'}"
>
  ${message}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = [`  variant="${variant}"`]
  if (showTitle) attrs.push(`  title="${title}"`)

  return `<script>
  import { Alert } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}';
</script>

<Alert
${attrs.join('\n')}
>
  ${message}
</Alert>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('info')
  const [dismissible, setDismissible] = useState(false)
  const [showIcon, setShowIcon] = useState(true)
  const [showTitle, setShowTitle] = useState(false)
  const [showAction, setShowAction] = useState(false)
  const [title, setTitle] = useState('Heads up')
  const [message, setMessage] = useState('This is an informational alert message.')
  const [copyStatus, setCopyStatus] = useState('')
  const [dismissed, setDismissed] = useState(false)

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, message, dismissible, showIcon, showTitle, title, showAction),
    [tier, variant, message, dismissible, showIcon, showTitle, title, showAction],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(tier, variant, message, showTitle, title),
    [tier, variant, message, showTitle, title],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, message, showTitle, title),
    [tier, variant, message, showTitle, title],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, message, showTitle, title),
    [tier, variant, message, showTitle, title],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, message, showTitle, title),
    [tier, variant, message, showTitle, title],
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

  const handleReset = useCallback(() => {
    setDismissed(false)
  }, [])

  return (
    <section className="alert-page__section" id="playground">
      <h2 className="alert-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="alert-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="alert-page__playground">
        {/* Preview area */}
        <div className="alert-page__playground-preview">
          <div className="alert-page__playground-result">
            {dismissed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Alert dismissed</span>
                <Button size="sm" variant="secondary" onClick={handleReset}>Show again</Button>
              </div>
            ) : tier === 'lite' ? (
              <LiteAlert variant={variant} style={{ inlineSize: '100%', position: 'relative', zIndex: 1 }}>
                {message}
              </LiteAlert>
            ) : tier === 'premium' ? (
              <PremiumAlert
                variant={variant}
                title={showTitle ? title : undefined}
                dismissible={dismissible}
                onDismiss={() => setDismissed(true)}
                icon={showIcon ? undefined : null as unknown as undefined}
                action={showAction ? { label: 'Learn more', onClick: () => {} } : undefined}
                style={{ inlineSize: '100%', position: 'relative', zIndex: 1 }}
              >
                {message}
              </PremiumAlert>
            ) : (
              <Alert
                variant={variant}
                title={showTitle ? title : undefined}
                dismissible={dismissible}
                onDismiss={() => setDismissed(true)}
                icon={showIcon ? undefined : null as unknown as undefined}
                action={showAction ? { label: 'Learn more', onClick: () => {} } : undefined}
                style={{ inlineSize: '100%', position: 'relative', zIndex: 1 }}
              >
                {message}
              </Alert>
            )}
          </div>

          {/* Tabbed code output */}
          <div className="alert-page__code-tabs">
            <div className="alert-page__export-row">
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
              {copyStatus && <span className="alert-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel */}
        <div className="alert-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />

          <div className="alert-page__control-group">
            <span className="alert-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Dismissible" checked={dismissible} onChange={setDismissible} />}
              {tier !== 'lite' && <Toggle label="Show icon" checked={showIcon} onChange={setShowIcon} />}
              {tier !== 'lite' && <Toggle label="Show title" checked={showTitle} onChange={setShowTitle} />}
              {tier !== 'lite' && <Toggle label="Show action" checked={showAction} onChange={setShowAction} />}
            </div>
          </div>

          {showTitle && tier !== 'lite' && (
            <div className="alert-page__control-group">
              <span className="alert-page__control-label">Title</span>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="alert-page__text-input"
                placeholder="Alert title..."
              />
            </div>
          )}

          <div className="alert-page__control-group">
            <span className="alert-page__control-label">Message</span>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="alert-page__text-input"
              placeholder="Alert message..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AlertPage() {
  useStyles('alert-page', pageStyles)

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

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.alert-page__section')
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
    <div className="alert-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="alert-page__hero">
        <h1 className="alert-page__title">Alert</h1>
        <p className="alert-page__desc">
          Contextual feedback messages for user actions. Supports four semantic variants,
          dismissible state, custom icons, action links, and entry animation.
          Ships in three weight tiers from 0.2KB lite to premium with spring entrance and ambient glow.
        </p>
        <div className="alert-page__import-row">
          <code className="alert-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ──────────────────────────────────── */}
      <section className="alert-page__section" id="variants">
        <h2 className="alert-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="alert-page__section-desc">
          Four semantic variants for different types of feedback: informational, success confirmation,
          warning, and error/danger.
        </p>
        <div className="alert-page__preview alert-page__preview--col">
          {tier === 'lite' ? (
            <>
              <LiteAlert variant="info">This is an informational message.</LiteAlert>
              <LiteAlert variant="success">Operation completed successfully!</LiteAlert>
              <LiteAlert variant="warning">Please review before continuing.</LiteAlert>
              <LiteAlert variant="error">Something went wrong. Please try again.</LiteAlert>
            </>
          ) : tier === 'premium' ? (
            <>
              <PremiumAlert variant="info">This is an informational message.</PremiumAlert>
              <PremiumAlert variant="success">Operation completed successfully!</PremiumAlert>
              <PremiumAlert variant="warning">Please review before continuing.</PremiumAlert>
              <PremiumAlert variant="error">Something went wrong. Please try again.</PremiumAlert>
            </>
          ) : (
            <>
              <Alert variant="info">This is an informational message.</Alert>
              <Alert variant="success">Operation completed successfully!</Alert>
              <Alert variant="warning">Please review before continuing.</Alert>
              <Alert variant="error">Something went wrong. Please try again.</Alert>
            </>
          )}
        </div>
      </section>

      {/* ── 4. Features ──────────────────────────────────── */}
      <section className="alert-page__section" id="features">
        <h2 className="alert-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="alert-page__section-desc">
          Standard tier alerts support dismissible state, custom icons, titles, and inline action links.
          {tier === 'lite' && ' Switch to Standard tier to see these features.'}
        </p>

        {tier !== 'lite' ? (
          <div className="alert-page__preview alert-page__preview--col" style={{ gap: '1rem' }}>
            {/* Dismissible */}
            <DismissibleDemo />

            {/* With icon */}
            <Alert variant="info" icon={<Icon name="info" size="sm" />}>
              Alert with a custom icon override.
            </Alert>

            {/* With title */}
            <Alert variant="success" title="Deployment complete">
              Your application has been deployed to production. All health checks passed.
            </Alert>

            {/* With action */}
            <Alert variant="warning" title="Storage limit approaching" action={{ label: 'Upgrade plan', onClick: () => {} }}>
              You have used 90% of your storage quota.
            </Alert>
          </div>
        ) : (
          <div className="alert-page__preview alert-page__preview--col">
            <LiteAlert variant="info">Lite alerts are CSS-only. Switch to Standard tier for dismissible, icons, titles, and actions.</LiteAlert>
          </div>
        )}

        {tier !== 'lite' && (
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`{/* Dismissible */}
<Alert variant="info" dismissible onDismiss={() => setVisible(false)}>
  This alert can be dismissed.
</Alert>

{/* With title */}
<Alert variant="success" title="Deployment complete">
  Your application has been deployed.
</Alert>

{/* With action */}
<Alert variant="warning" action={{ label: 'Upgrade plan', onClick: handleUpgrade }}>
  Storage limit approaching.
</Alert>`}
              language="typescript"
            />
          </div>
        )}
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="alert-page__section" id="tiers">
        <h2 className="alert-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="alert-page__section-desc">
          Choose the right balance of features and bundle size. Alert ships in three tiers
          from CSS-only lite to premium with spring animations and ambient glow effects.
        </p>

        <div className="alert-page__tiers">
          {/* Lite */}
          <div
            className={`alert-page__tier-card${tier === 'lite' ? ' alert-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="alert-page__tier-header">
              <span className="alert-page__tier-name">Lite</span>
              <span className="alert-page__tier-size">~0.2 KB</span>
            </div>
            <p className="alert-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No dismissible, no title, no icon slots, no actions.
            </p>
            <div className="alert-page__tier-import">
              import {'{'} Alert {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="alert-page__tier-preview">
              <LiteAlert variant="info" style={{ fontSize: '0.75rem' }}>Lite Alert</LiteAlert>
            </div>
            <div className="alert-page__size-breakdown">
              <div className="alert-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`alert-page__tier-card${tier === 'standard' ? ' alert-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="alert-page__tier-header">
              <span className="alert-page__tier-name">Standard</span>
              <span className="alert-page__tier-size">~2 KB</span>
            </div>
            <p className="alert-page__tier-desc">
              Full-featured alert with variant icons, title, dismissible state,
              action links, size scale, motion levels, and ARIA roles.
            </p>
            <div className="alert-page__tier-import">
              import {'{'} Alert {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="alert-page__tier-preview">
              <Alert variant="success" title="Saved" style={{ fontSize: '0.75rem' }}>Changes saved.</Alert>
            </div>
            <div className="alert-page__size-breakdown">
              <div className="alert-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`alert-page__tier-card${tier === 'premium' ? ' alert-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="alert-page__tier-header">
              <span className="alert-page__tier-name">Premium</span>
              <span className="alert-page__tier-size">~2.5 KB</span>
            </div>
            <p className="alert-page__tier-desc">
              Spring-scale entrance with blur-in, animated aurora shimmer line,
              per-variant ambient glow, and smooth dismiss animation. Four motion levels.
            </p>
            <div className="alert-page__tier-import">
              import {'{'} Alert {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="alert-page__tier-preview">
              <PremiumAlert variant="info" title="Premium" style={{ fontSize: '0.75rem' }}>Spring entrance + ambient glow</PremiumAlert>
            </div>
            <div className="alert-page__size-breakdown">
              <div className="alert-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="alert-page__section" id="brand-color">
        <h2 className="alert-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="alert-page__section-desc">
          Pick a brand color to see the page theme update in real-time. Alert variant colors
          are semantic (info, success, warning, error) and independent of the brand color,
          but the page chrome adapts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="alert-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`alert-page__color-preset${brandColor === p.hex ? ' alert-page__color-preset--active' : ''}`}
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

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="alert-page__section" id="props">
        <h2 className="alert-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="alert-page__section-desc">
          All props accepted by Alert (Standard tier). It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element. The Lite tier only accepts <code className="alert-page__a11y-key">variant</code> and
          native HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={alertProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="alert-page__section" id="accessibility">
        <h2 className="alert-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="alert-page__section-desc">
          Built with semantic ARIA roles and keyboard support for dismiss actions.
        </p>
        <Card variant="default" padding="md">
          <ul className="alert-page__a11y-list">
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA roles:</strong> Uses <code className="alert-page__a11y-key">role="alert"</code> for warning/error and <code className="alert-page__a11y-key">role="status"</code> for info/success.
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dismiss button:</strong> Labeled with <code className="alert-page__a11y-key">aria-label="Dismiss"</code> and focusable via keyboard.
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Icons:</strong> Decorative icons are hidden from screen readers with <code className="alert-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variant colors meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Dismiss and action buttons show a visible focus ring via <code className="alert-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="alert-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className="alert-page__a11y-item">
              <span className="alert-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Entry animation respects <code className="alert-page__a11y-key">prefers-reduced-motion</code> and the motion prop.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────── */}
      <section className="alert-page__section" id="source">
        <h2 className="alert-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="alert-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/alert.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/alert.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/alert.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/alert.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/alert.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/alert.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DismissibleDemo() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Dismissed!</span>
        <Button size="xs" variant="secondary" onClick={() => setVisible(true)}>Show again</Button>
      </div>
    )
  }

  return (
    <Alert variant="info" dismissible onDismiss={() => setVisible(false)}>
      This alert can be dismissed. Click the X button.
    </Alert>
  )
}
