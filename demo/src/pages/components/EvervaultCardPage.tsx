'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { EvervaultCard } from '@ui/domain/evervault-card'
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
    @scope (.evervault-card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: evervault-card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .evervault-card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .evervault-card-page__hero::before {
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
        animation: evervault-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes evervault-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .evervault-card-page__hero::before { animation: none; }
      }

      .evervault-card-page__title {
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

      .evervault-card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .evervault-card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .evervault-card-page__import-code {
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

      .evervault-card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .evervault-card-page__section {
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
        animation: evervault-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes evervault-section-reveal {
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
        .evervault-card-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .evervault-card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .evervault-card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .evervault-card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .evervault-card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .evervault-card-page__preview {
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
      .evervault-card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .evervault-card-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .evervault-card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .evervault-card-page__playground {
          grid-template-columns: 1fr;
        }
        .evervault-card-page__playground-controls {
          position: static !important;
        }
      }

      @container evervault-card-page (max-width: 680px) {
        .evervault-card-page__playground {
          grid-template-columns: 1fr;
        }
        .evervault-card-page__playground-controls {
          position: static !important;
        }
      }

      .evervault-card-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .evervault-card-page__playground-result {
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
      .evervault-card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .evervault-card-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .evervault-card-page__playground-controls {
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

      .evervault-card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .evervault-card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .evervault-card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .evervault-card-page__option-btn {
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
      .evervault-card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .evervault-card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .evervault-card-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .evervault-card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .evervault-card-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .evervault-card-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .evervault-card-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .evervault-card-page__tier-card {
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

      .evervault-card-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .evervault-card-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .evervault-card-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .evervault-card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .evervault-card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .evervault-card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .evervault-card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .evervault-card-page__tier-import {
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

      .evervault-card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .evervault-card-page__code-tabs {
        margin-block-start: 1rem;
      }

      .evervault-card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .evervault-card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .evervault-card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .evervault-card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .evervault-card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .evervault-card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color picker ──────────────────────────────── */

      .evervault-card-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .evervault-card-page__color-preset {
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
      .evervault-card-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .evervault-card-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .evervault-card-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .evervault-card-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .evervault-card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .evervault-card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .evervault-card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .evervault-card-page__hero {
          padding: 2rem 1.25rem;
        }

        .evervault-card-page__title {
          font-size: 1.75rem;
        }

        .evervault-card-page__preview {
          padding: 1.75rem;
        }

        .evervault-card-page__playground {
          grid-template-columns: 1fr;
        }

        .evervault-card-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .evervault-card-page__tiers {
          grid-template-columns: 1fr;
        }

        .evervault-card-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .evervault-card-page__hero {
          padding: 1.5rem 1rem;
        }

        .evervault-card-page__title {
          font-size: 1.5rem;
        }

        .evervault-card-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .evervault-card-page__import-code,
      .evervault-card-page code,
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

const evervaultCardProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the card, above the matrix effect layer.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables the matrix entirely. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'onMouseMove', type: '(e: MouseEvent) => void', description: 'Native mouse move handler, called before the internal tracking logic.' },
  { name: 'onMouseEnter', type: '(e: MouseEvent) => void', description: 'Native mouse enter handler, called before hover state is set.' },
  { name: 'onMouseLeave', type: '(e: MouseEvent) => void', description: 'Native mouse leave handler, called before hover state is cleared.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { EvervaultCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { EvervaultCard } from '@annondeveloper/ui-kit'",
  premium: "import { EvervaultCard } from '@annondeveloper/ui-kit/premium'",
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
      className="evervault-card-page__copy-btn"
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
    <div className="evervault-card-page__control-group">
      <span className="evervault-card-page__control-label">{label}</span>
      <div className="evervault-card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`evervault-card-page__option-btn${opt === value ? ' evervault-card-page__option-btn--active' : ''}`}
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
    <label className="evervault-card-page__toggle-label">
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
  motion: MotionLevel,
  contentText: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `  <div style={{ padding: '2rem', textAlign: 'center' }}>\n    <h3>${contentText}</h3>\n    <p>Hover to see the matrix scramble effect</p>\n  </div>`

  if (tier === 'lite') {
    return `${importStr}\n\n<EvervaultCard>\n${childContent}\n</EvervaultCard>`
  }

  const jsx = props.length === 0
    ? `<EvervaultCard>\n${childContent}\n</EvervaultCard>`
    : `<EvervaultCard\n${props.join('\n')}\n>\n${childContent}\n</EvervaultCard>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCssCode(tier: Tier, contentText: string): string {
  return `<!-- EvervaultCard — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/evervault-card.css">

<div class="ui-evervault-card">
  <div class="ui-evervault-card--matrix" aria-hidden="true">
    <!-- Matrix characters are generated via JS -->
  </div>
  <div class="ui-evervault-card--content">
    <h3>${contentText}</h3>
    <p>Hover to see the matrix scramble effect</p>
  </div>
</div>

<style>
.ui-evervault-card {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  background: oklch(22% 0.02 270);
  border: 1px solid oklch(100% 0 0 / 0.08);
  isolation: isolate;
}
.ui-evervault-card--content {
  position: relative;
  z-index: 1;
  padding: 1rem;
}
</style>`
}

function generateVueCode(tier: Tier, motion: MotionLevel, contentText: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-evervault-card">
    <div class="ui-evervault-card--content">
      <h3>${contentText}</h3>
      <p>Hover to see the matrix scramble effect</p>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/evervault-card.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (motion !== 3) attrs.push(`  :motion="${motion}"`)

  const template = attrs.length === 0
    ? `  <EvervaultCard>\n    <h3>${contentText}</h3>\n    <p>Hover to see the matrix scramble effect</p>\n  </EvervaultCard>`
    : `  <EvervaultCard\n  ${attrs.join('\n  ')}\n  >\n    <h3>${contentText}</h3>\n    <p>Hover to see the matrix scramble effect</p>\n  </EvervaultCard>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { EvervaultCard } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, contentText: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-evervault-card">
  <div class="ui-evervault-card--content">
    <h3>${contentText}</h3>
    <p>Hover to see the matrix scramble effect</p>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/evervault-card.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div class="ui-evervault-card">
  <div class="ui-evervault-card--content">
    <h3>${contentText}</h3>
    <p>Hover to see the matrix scramble effect</p>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/evervault-card.css';`
}

function generateSvelteCode(tier: Tier, motion: MotionLevel, contentText: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-evervault-card">
  <div class="ui-evervault-card--content">
    <h3>${contentText}</h3>
    <p>Hover to see the matrix scramble effect</p>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/evervault-card.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const motionAttr = motion !== 3 ? `\n  motion={${motion}}` : ''
  return `<script>
  import { EvervaultCard } from '${importPath}';
</script>

<EvervaultCard${motionAttr}>
  <h3>${contentText}</h3>
  <p>Hover to see the matrix scramble effect</p>
</EvervaultCard>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [contentText, setContentText] = useState('Evervault Encryption')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, motion, contentText),
    [tier, motion, contentText],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, contentText),
    [tier, contentText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, motion, contentText),
    [tier, motion, contentText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, contentText),
    [tier, contentText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, motion, contentText),
    [tier, motion, contentText],
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
    <section className="evervault-card-page__section" id="playground">
      <h2 className="evervault-card-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="evervault-card-page__section-desc">
        Tweak every prop and see the result in real-time. Hover over the card to trigger the matrix scramble effect.
      </p>

      <div className="evervault-card-page__playground">
        <div className="evervault-card-page__playground-preview">
          <div className="evervault-card-page__playground-result">
            <EvervaultCard motion={motion} style={{ maxInlineSize: '360px', inlineSize: '100%' }}>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                  {contentText}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Hover to see the matrix scramble effect
                </p>
              </div>
            </EvervaultCard>
          </div>

          <div className="evervault-card-page__code-tabs">
            <div className="evervault-card-page__export-row">
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
              {copyStatus && <span className="evervault-card-page__export-status">{copyStatus}</span>}
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

        <div className="evervault-card-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as MotionLevel)}
            />
          )}

          <div className="evervault-card-page__control-group">
            <span className="evervault-card-page__control-label">Card Title</span>
            <input
              type="text"
              value={contentText}
              onChange={e => setContentText(e.target.value)}
              className="evervault-card-page__text-input"
              placeholder="Card title text..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EvervaultCardPage() {
  useStyles('evervault-card-page', pageStyles)

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
    const sections = document.querySelectorAll('.evervault-card-page__section')
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
    <div className="evervault-card-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="evervault-card-page__hero">
        <h1 className="evervault-card-page__title">EvervaultCard</h1>
        <p className="evervault-card-page__desc">
          A card component with an animated matrix character scramble effect that follows
          the cursor. Hover to reveal scrambling monospace characters masked by a radial gradient,
          creating a cryptographic data visualization aesthetic.
        </p>
        <div className="evervault-card-page__import-row">
          <code className="evervault-card-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Motion Levels ───────────────────────────── */}
      <section className="evervault-card-page__section" id="motion-levels">
        <h2 className="evervault-card-page__section-title">
          <a href="#motion-levels">Motion Levels</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          The matrix effect adapts to four motion intensity levels. Level 0 completely hides
          the matrix, while levels 1-3 progressively increase the scramble animation speed.
        </p>
        <div className="evervault-card-page__preview" style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <div className="evervault-card-page__labeled-row" style={{ justifyContent: 'center' }}>
            {([0, 1, 2, 3] as const).map(level => (
              <div key={level} className="evervault-card-page__labeled-item">
                <EvervaultCard motion={level} style={{ inlineSize: '180px', minBlockSize: '100px' }}>
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                    Motion {level}
                  </div>
                </EvervaultCard>
                <span className="evervault-card-page__item-label">motion={level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Usage Examples ──────────────────────────── */}
      <section className="evervault-card-page__section" id="examples">
        <h2 className="evervault-card-page__section-title">
          <a href="#examples">Usage Examples</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          EvervaultCard works with any content. Use it for encryption displays, API key cards,
          security dashboards, or any context where a data-scramble aesthetic fits.
        </p>
        <div className="evervault-card-page__preview" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
          <EvervaultCard style={{ inlineSize: '280px' }}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBlockEnd: '0.75rem' }}>
                <Icon name="lock" size="md" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>API Key</span>
              </div>
              <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                sk_live_4eC39HqLyjWDarjtT1zdp7dc
              </code>
            </div>
          </EvervaultCard>
          <EvervaultCard style={{ inlineSize: '280px' }}>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBlockEnd: '0.25rem' }}>256-bit</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>AES Encryption</div>
              <div style={{ marginBlockStart: '0.75rem', fontSize: '0.75rem', color: 'var(--brand)' }}>
                End-to-end encrypted
              </div>
            </div>
          </EvervaultCard>
          <EvervaultCard style={{ inlineSize: '280px' }}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>Security Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Firewall</span>
                  <span style={{ color: 'oklch(72% 0.19 155)' }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>SSL/TLS</span>
                  <span style={{ color: 'oklch(72% 0.19 155)' }}>Valid</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>2FA</span>
                  <span style={{ color: 'oklch(72% 0.19 155)' }}>Enabled</span>
                </div>
              </div>
            </div>
          </EvervaultCard>
        </div>
      </section>

      {/* ── 5. Custom Content ──────────────────────────── */}
      <section className="evervault-card-page__section" id="custom-content">
        <h2 className="evervault-card-page__section-title">
          <a href="#custom-content">Custom Content</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          The card accepts any ReactNode as children. The content renders above the matrix layer
          with proper z-index stacking. The matrix characters are aria-hidden for screen readers.
        </p>
        <div className="evervault-card-page__preview">
          <EvervaultCard style={{ inlineSize: '100%', maxInlineSize: '500px' }}>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>
                <Icon name="shield" size="lg" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Enterprise Grade Security
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', maxInlineSize: '40ch' }}>
                Your data is encrypted at rest and in transit using industry-standard
                AES-256 encryption with automatic key rotation.
              </p>
              <Button variant="primary" size="sm" icon={<Icon name="arrow-right" size="sm" />}>
                Learn More
              </Button>
            </div>
          </EvervaultCard>
        </div>
        <CopyBlock
          code={`<EvervaultCard>
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h3>Enterprise Grade Security</h3>
    <p>Your data is encrypted at rest and in transit.</p>
    <Button variant="primary" size="sm">Learn More</Button>
  </div>
</EvervaultCard>`}
          language="typescript"
        />
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="evervault-card-page__section" id="tiers">
        <h2 className="evervault-card-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          Choose the right balance of features and bundle size. The Standard tier includes the
          full matrix scramble effect with motion support. Lite provides CSS-only structure.
          Premium adds enhanced glow trails, animated aurora gradient border, and spring-hover scale.
        </p>

        <div className="evervault-card-page__tiers">
          {/* Lite */}
          <div
            className={`evervault-card-page__tier-card${tier === 'lite' ? ' evervault-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="evervault-card-page__tier-header">
              <span className="evervault-card-page__tier-name">Lite</span>
              <span className="evervault-card-page__tier-size">~0.5 KB</span>
            </div>
            <p className="evervault-card-page__tier-desc">
              CSS-only card structure. No matrix scramble animation, no mouse tracking.
              Just the card container with Aurora styling.
            </p>
            <div className="evervault-card-page__tier-import">
              import {'{'} EvervaultCard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="evervault-card-page__tier-preview">
              <div style={{ inlineSize: '160px', padding: '1rem', borderRadius: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Lite Card
              </div>
            </div>
            <div className="evervault-card-page__size-breakdown">
              <div className="evervault-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`evervault-card-page__tier-card${tier === 'standard' ? ' evervault-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="evervault-card-page__tier-header">
              <span className="evervault-card-page__tier-name">Standard</span>
              <span className="evervault-card-page__tier-size">~2.8 KB</span>
            </div>
            <p className="evervault-card-page__tier-desc">
              Full matrix scramble effect with cursor tracking, hover-activated character
              animation, radial mask, and motion level support.
            </p>
            <div className="evervault-card-page__tier-import">
              import {'{'} EvervaultCard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="evervault-card-page__tier-preview">
              <EvervaultCard style={{ inlineSize: '160px' }}>
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  Standard
                </div>
              </EvervaultCard>
            </div>
            <div className="evervault-card-page__size-breakdown">
              <div className="evervault-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`evervault-card-page__tier-card${tier === 'premium' ? ' evervault-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="evervault-card-page__tier-header">
              <span className="evervault-card-page__tier-name">Premium</span>
              <span className="evervault-card-page__tier-size">~4.2 KB</span>
            </div>
            <p className="evervault-card-page__tier-desc">
              Everything in Standard plus glowing cursor trail, enhanced color transitions,
              particle burst on hover enter, and cinematic entrance animation.
            </p>
            <div className="evervault-card-page__tier-import">
              import {'{'} EvervaultCard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="evervault-card-page__tier-preview">
              <EvervaultCard style={{ inlineSize: '160px' }}>
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  Premium
                </div>
              </EvervaultCard>
            </div>
            <div className="evervault-card-page__size-breakdown">
              <div className="evervault-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>7.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ─────────────────────────────── */}
      <section className="evervault-card-page__section" id="brand-color">
        <h2 className="evervault-card-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          Pick a brand color to see the card's Aurora glow and matrix character
          tint update in real-time. The theme generates derived colors automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="evervault-card-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`evervault-card-page__color-preset${brandColor === p.hex ? ' evervault-card-page__color-preset--active' : ''}`}
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
      <section className="evervault-card-page__section" id="props">
        <h2 className="evervault-card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          All props accepted by EvervaultCard. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={evervaultCardProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="evervault-card-page__section" id="accessibility">
        <h2 className="evervault-card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="evervault-card-page__section-desc">
          The EvervaultCard is designed with accessibility as a first-class concern.
        </p>
        <Card variant="default" padding="md">
          <ul className="evervault-card-page__a11y-list">
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Matrix hidden:</strong> The scrambling character overlay uses <code className="evervault-card-page__a11y-key">aria-hidden="true"</code> so screen readers skip the visual noise entirely.
              </span>
            </li>
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content accessible:</strong> The content layer has <code className="evervault-card-page__a11y-key">z-index: 1</code> ensuring it remains clickable and readable above the effect.
              </span>
            </li>
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="evervault-card-page__a11y-key">prefers-reduced-motion</code> and <code className="evervault-card-page__a11y-key">motion=0</code> — hides the matrix completely.
              </span>
            </li>
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="evervault-card-page__a11y-key">forced-colors: active</code> with solid border fallback and matrix disabled.
              </span>
            </li>
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print friendly:</strong> Matrix overlay is hidden in print stylesheets to save ink and maintain readability.
              </span>
            </li>
            <li className="evervault-card-page__a11y-item">
              <span className="evervault-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard navigable:</strong> All interactive content inside the card remains fully keyboard accessible.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
