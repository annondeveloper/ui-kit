'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { GlowCard } from '@ui/domain/glow-card'
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
    @scope (.glow-card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: glow-card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .glow-card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .glow-card-page__hero::before {
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
        animation: glow-card-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes glow-card-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .glow-card-page__hero::before { animation: none; }
      }

      .glow-card-page__title {
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

      .glow-card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .glow-card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .glow-card-page__import-code {
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

      .glow-card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .glow-card-page__section {
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
        animation: gc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes gc-section-reveal {
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
        .glow-card-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .glow-card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .glow-card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .glow-card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .glow-card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .glow-card-page__preview {
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

      .glow-card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .glow-card-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .glow-card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container glow-card-page (max-width: 680px) {
        .glow-card-page__playground {
          grid-template-columns: 1fr;
        }
        .glow-card-page__playground-controls {
          position: static !important;
        }
      }

      .glow-card-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .glow-card-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .glow-card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .glow-card-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .glow-card-page__playground-controls {
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

      .glow-card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .glow-card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .glow-card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .glow-card-page__option-btn {
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
      .glow-card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .glow-card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .glow-card-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .glow-card-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .glow-card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .glow-card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .glow-card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .glow-card-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .glow-card-page__tier-card {
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

      .glow-card-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .glow-card-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .glow-card-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .glow-card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .glow-card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .glow-card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .glow-card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .glow-card-page__tier-import {
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

      .glow-card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .glow-card-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .glow-card-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .glow-card-page__code-tabs {
        margin-block-start: 1rem;
      }

      .glow-card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .glow-card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color presets ──────────────────────────────── */

      .glow-card-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .glow-card-page__color-preset {
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
      .glow-card-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .glow-card-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .glow-card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .glow-card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .glow-card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .glow-card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Demo card content ──────────────────────────── */

      .glow-card-page__demo-content {
        padding: 0.5rem;
      }

      .glow-card-page__demo-content h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
      }

      .glow-card-page__demo-content p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .glow-card-page__hero {
          padding: 2rem 1.25rem;
        }

        .glow-card-page__title {
          font-size: 1.75rem;
        }

        .glow-card-page__preview {
          padding: 1.75rem;
        }

        .glow-card-page__playground {
          grid-template-columns: 1fr;
        }

        .glow-card-page__playground-controls {
          position: static !important;
        }

        .glow-card-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .glow-card-page__tiers {
          grid-template-columns: 1fr;
        }

        .glow-card-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .glow-card-page__hero {
          padding: 1.5rem 1rem;
        }

        .glow-card-page__title {
          font-size: 1.5rem;
        }

        .glow-card-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .glow-card-page__title {
          font-size: 4rem;
        }

        .glow-card-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .glow-card-page__import-code,
      .glow-card-page code,
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

const glowCardProps: PropDef[] = [
  { name: 'glowColor', type: 'string', description: 'Custom OKLCH or CSS color for the glow effect. Defaults to brand purple.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables glow entirely. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the card.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
  { name: 'onMouseMove', type: '(e: MouseEvent) => void', description: 'Mouse move handler. Called alongside internal glow tracking.' },
  { name: 'onMouseEnter', type: '(e: MouseEvent) => void', description: 'Mouse enter handler. Called alongside internal hover state.' },
  { name: 'onMouseLeave', type: '(e: MouseEvent) => void', description: 'Mouse leave handler. Called alongside internal hover state reset.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { GlowCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { GlowCard } from '@annondeveloper/ui-kit'",
  premium: "import { GlowCard } from '@annondeveloper/ui-kit/premium'",
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

const GLOW_COLORS = [
  { value: 'oklch(75% 0.15 270 / 0.25)', label: 'Purple (default)' },
  { value: 'oklch(75% 0.18 150 / 0.25)', label: 'Emerald' },
  { value: 'oklch(70% 0.2 25 / 0.25)', label: 'Rose' },
  { value: 'oklch(80% 0.15 200 / 0.25)', label: 'Cyan' },
  { value: 'oklch(80% 0.18 85 / 0.25)', label: 'Amber' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="glow-card-page__copy-btn"
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
    <div className="glow-card-page__control-group">
      <span className="glow-card-page__control-label">{label}</span>
      <div className="glow-card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`glow-card-page__option-btn${opt === value ? ' glow-card-page__option-btn--active' : ''}`}
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

function generateReactCode(
  tier: Tier,
  glowColor: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (glowColor !== GLOW_COLORS[0].value) props.push(`  glowColor="${glowColor}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const inner = `  <h3>Card Title</h3>\n  <p>Hover to see the glow effect follow your cursor.</p>`

  if (props.length === 0) {
    return `${importStr}\n\n<GlowCard>\n${inner}\n</GlowCard>`
  }
  return `${importStr}\n\n<GlowCard\n${props.join('\n')}\n>\n${inner}\n</GlowCard>`
}

function generateHtmlCode(tier: Tier, glowColor: string): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/glow-card.css';`
  const colorStyle = glowColor !== GLOW_COLORS[0].value ? ` style="--glow-card-color: ${glowColor}"` : ''

  return `<!-- GlowCard — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/glow-card.css">

<div class="ui-glow-card"${colorStyle}>
  <div class="ui-glow-card--content">
    <h3>Card Title</h3>
    <p>Hover to see the glow effect.</p>
  </div>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->

<!-- Note: JS required for cursor-tracking glow effect -->`
}

function generateVueCode(tier: Tier, glowColor: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-glow-card">
    <div class="ui-glow-card--content">
      <h3>Card Title</h3>
      <p>Hover to see the glow effect.</p>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (glowColor !== GLOW_COLORS[0].value) attrs.push(`  glow-color="${glowColor}"`)

  const template = attrs.length === 0
    ? `  <GlowCard>\n    <h3>Card Title</h3>\n    <p>Hover to see the glow effect.</p>\n  </GlowCard>`
    : `  <GlowCard\n  ${attrs.join('\n  ')}\n  >\n    <h3>Card Title</h3>\n    <p>Hover to see the glow effect.</p>\n  </GlowCard>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { GlowCard } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, glowColor: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-glow-card">
  <div class="ui-glow-card--content">
    <h3>Card Title</h3>
    <p>Hover to see the glow effect.</p>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const colorAttr = glowColor !== GLOW_COLORS[0].value ? `\n  [style]="'--glow-card-color: ${glowColor}'"` : ''
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-glow-card"${colorAttr}
>
  <div class="ui-glow-card--content">
    <h3>Card Title</h3>
    <p>Hover to see the glow effect.</p>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/glow-card.css';`
}

function generateSvelteCode(tier: Tier, glowColor: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-glow-card">
  <div class="ui-glow-card--content">
    <h3>Card Title</h3>
    <p>Hover to see the glow effect.</p>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = glowColor !== GLOW_COLORS[0].value ? `\n  glowColor="${glowColor}"` : ''
  return `<script>
  import { GlowCard } from '${importPath}';
</script>

<GlowCard${attrs}>
  <h3>Card Title</h3>
  <p>Hover to see the glow effect.</p>
</GlowCard>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [glowColor, setGlowColor] = useState(GLOW_COLORS[0].value)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, glowColor, motion), [tier, glowColor, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, glowColor), [tier, glowColor])
  const vueCode = useMemo(() => generateVueCode(tier, glowColor), [tier, glowColor])
  const angularCode = useMemo(() => generateAngularCode(tier, glowColor), [tier, glowColor])
  const svelteCode = useMemo(() => generateSvelteCode(tier, glowColor), [tier, glowColor])

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
    <section className="glow-card-page__section" id="playground">
      <h2 className="glow-card-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="glow-card-page__section-desc">
        Tweak every prop and see the result in real-time. Hover over the card to see the glow track your cursor.
      </p>

      <div className="glow-card-page__playground">
        <div className="glow-card-page__playground-preview">
          <div className="glow-card-page__playground-result">
            <GlowCard
              glowColor={glowColor}
              motion={motion}
              style={{ maxInlineSize: '340px', inlineSize: '100%' }}
            >
              <div className="glow-card-page__demo-content">
                <h3>Interactive Card</h3>
                <p>Move your cursor over this card to see the glow effect follow your pointer position in real-time.</p>
              </div>
            </GlowCard>
          </div>

          <div className="glow-card-page__code-tabs">
            <div className="glow-card-page__export-row">
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
              {copyStatus && <span className="glow-card-page__export-status">{copyStatus}</span>}
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

        <div className="glow-card-page__playground-controls">
          <OptionGroup
            label="Glow Color"
            options={GLOW_COLORS.map(c => c.label) as unknown as readonly string[]}
            value={GLOW_COLORS.find(c => c.value === glowColor)?.label ?? GLOW_COLORS[0].label}
            onChange={v => {
              const found = GLOW_COLORS.find(c => c.label === v)
              if (found) setGlowColor(found.value)
            }}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GlowCardPage() {
  useStyles('glow-card-page', pageStyles)

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
    const sections = document.querySelectorAll('.glow-card-page__section')
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
    <div className="glow-card-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="glow-card-page__hero">
        <h1 className="glow-card-page__title">GlowCard</h1>
        <p className="glow-card-page__desc">
          A card component with a cursor-tracking glow effect that follows the user's mouse.
          The glow creates an ambient, ethereal lighting effect using radial gradients and CSS custom properties.
        </p>
        <div className="glow-card-page__import-row">
          <code className="glow-card-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Glow Colors ─────────────────────────────── */}
      <section className="glow-card-page__section" id="glow-colors">
        <h2 className="glow-card-page__section-title">
          <a href="#glow-colors">Glow Colors</a>
        </h2>
        <p className="glow-card-page__section-desc">
          Customize the glow color via the <code>glowColor</code> prop. Uses OKLCH for perceptually uniform color blending.
        </p>
        <div className="glow-card-page__preview" style={{ gap: '1.5rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            {GLOW_COLORS.map(c => (
              <div key={c.label} className="glow-card-page__labeled-item">
                <GlowCard glowColor={c.value} style={{ inlineSize: '160px' }}>
                  <div className="glow-card-page__demo-content">
                    <h3 style={{ fontSize: '0.875rem' }}>{c.label}</h3>
                    <p style={{ fontSize: '0.75rem' }}>Hover me</p>
                  </div>
                </GlowCard>
                <span className="glow-card-page__item-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ────────────────────────────── */}
      <section className="glow-card-page__section" id="motion">
        <h2 className="glow-card-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="glow-card-page__section-desc">
          The glow effect respects the motion intensity cascade. Level 0 disables the glow entirely.
          Levels 1-3 enable cursor tracking with increasing visual intensity.
        </p>
        <div className="glow-card-page__preview" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="glow-card-page__labeled-item">
                <GlowCard motion={m} style={{ inlineSize: '160px' }}>
                  <div className="glow-card-page__demo-content">
                    <h3 style={{ fontSize: '0.875rem' }}>Motion {m}</h3>
                    <p style={{ fontSize: '0.75rem' }}>{m === 0 ? 'No glow' : `Level ${m}`}</p>
                  </div>
                </GlowCard>
                <span className="glow-card-page__item-label">motion={m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Content Examples ─────────────────────────── */}
      <section className="glow-card-page__section" id="examples">
        <h2 className="glow-card-page__section-title">
          <a href="#examples">Content Examples</a>
        </h2>
        <p className="glow-card-page__section-desc">
          GlowCard works with any content. The glow effect sits behind the content layer via z-index stacking.
        </p>
        <div className="glow-card-page__preview glow-card-page__preview--col" style={{ gap: '1.5rem' }}>
          <GlowCard style={{ inlineSize: '100%', maxInlineSize: '400px' }}>
            <div className="glow-card-page__demo-content">
              <h3>Feature Highlight</h3>
              <p>GlowCard uses a radial gradient pseudo-element that tracks cursor position via CSS custom properties updated in JavaScript.</p>
            </div>
          </GlowCard>

          <GlowCard glowColor="oklch(75% 0.18 150 / 0.25)" style={{ inlineSize: '100%', maxInlineSize: '400px' }}>
            <div className="glow-card-page__demo-content" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                inlineSize: '48px',
                blockSize: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'oklch(75% 0.18 150 / 0.15)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}>
                <Icon name="zap" size="md" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem' }}>With Icon Layout</h3>
                <p style={{ fontSize: '0.8125rem' }}>Cards can contain any layout including icons, images, and complex compositions.</p>
              </div>
            </div>
          </GlowCard>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <GlowCard glowColor="oklch(70% 0.2 25 / 0.25)" style={{ flex: '1 1 180px' }}>
              <div className="glow-card-page__demo-content" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBlockEnd: '0.25rem' }}>1.2K</div>
                <p style={{ fontSize: '0.75rem' }}>Active Users</p>
              </div>
            </GlowCard>
            <GlowCard glowColor="oklch(80% 0.15 200 / 0.25)" style={{ flex: '1 1 180px' }}>
              <div className="glow-card-page__demo-content" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBlockEnd: '0.25rem' }}>99.9%</div>
                <p style={{ fontSize: '0.75rem' }}>Uptime</p>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="glow-card-page__section" id="tiers">
        <h2 className="glow-card-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="glow-card-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides the card structure with CSS-only hover
          border glow. Standard adds JavaScript cursor tracking. Premium adds multi-layer glow and ambient particles.
        </p>

        <div className="glow-card-page__tiers">
          {/* Lite */}
          <div
            className={`glow-card-page__tier-card${tier === 'lite' ? ' glow-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="glow-card-page__tier-header">
              <span className="glow-card-page__tier-name">Lite</span>
              <span className="glow-card-page__tier-size">~0.4 KB</span>
            </div>
            <p className="glow-card-page__tier-desc">
              CSS-only variant with static border glow on hover. No JavaScript cursor tracking.
              Simple hover transition with no radial gradient follow.
            </p>
            <div className="glow-card-page__tier-import">
              import {'{'} GlowCard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="glow-card-page__tier-preview">
              <GlowCard motion={0} style={{ inlineSize: '140px' }}>
                <div className="glow-card-page__demo-content">
                  <h3 style={{ fontSize: '0.75rem' }}>Lite</h3>
                  <p style={{ fontSize: '0.625rem' }}>Static hover</p>
                </div>
              </GlowCard>
            </div>
            <div className="glow-card-page__size-breakdown">
              <div className="glow-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`glow-card-page__tier-card${tier === 'standard' ? ' glow-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="glow-card-page__tier-header">
              <span className="glow-card-page__tier-name">Standard</span>
              <span className="glow-card-page__tier-size">~1.2 KB</span>
            </div>
            <p className="glow-card-page__tier-desc">
              Full cursor-tracking radial glow via CSS custom properties.
              Smooth opacity transitions on enter/leave. Motion level support.
            </p>
            <div className="glow-card-page__tier-import">
              import {'{'} GlowCard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="glow-card-page__tier-preview">
              <GlowCard style={{ inlineSize: '140px' }}>
                <div className="glow-card-page__demo-content">
                  <h3 style={{ fontSize: '0.75rem' }}>Standard</h3>
                  <p style={{ fontSize: '0.625rem' }}>Cursor glow</p>
                </div>
              </GlowCard>
            </div>
            <div className="glow-card-page__size-breakdown">
              <div className="glow-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`glow-card-page__tier-card${tier === 'premium' ? ' glow-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="glow-card-page__tier-header">
              <span className="glow-card-page__tier-name">Premium</span>
              <span className="glow-card-page__tier-size">~2.1 KB</span>
            </div>
            <p className="glow-card-page__tier-desc">
              Everything in Standard plus multi-layer glow with inner + outer radiance,
              ambient floating particles, and spring-based entrance animation.
            </p>
            <div className="glow-card-page__tier-import">
              import {'{'} GlowCard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="glow-card-page__tier-preview">
              <GlowCard glowColor="oklch(75% 0.18 270 / 0.35)" style={{ inlineSize: '140px' }}>
                <div className="glow-card-page__demo-content">
                  <h3 style={{ fontSize: '0.75rem' }}>Premium</h3>
                  <p style={{ fontSize: '0.625rem' }}>Multi-layer glow</p>
                </div>
              </GlowCard>
            </div>
            <div className="glow-card-page__size-breakdown">
              <div className="glow-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ─────────────────────────────── */}
      <section className="glow-card-page__section" id="brand-color">
        <h2 className="glow-card-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="glow-card-page__section-desc">
          Pick a brand color to see the glow card update in real-time. The theme generates
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
          <div className="glow-card-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`glow-card-page__color-preset${brandColor === p.hex ? ' glow-card-page__color-preset--active' : ''}`}
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
      <section className="glow-card-page__section" id="props">
        <h2 className="glow-card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="glow-card-page__section-desc">
          All props accepted by GlowCard. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={glowCardProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="glow-card-page__section" id="accessibility">
        <h2 className="glow-card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="glow-card-page__section-desc">
          GlowCard is a presentational container with comprehensive motion and accessibility support.
        </p>
        <Card variant="default" padding="md">
          <ul className="glow-card-page__a11y-list">
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Glow transitions are disabled when <code className="glow-card-page__a11y-key">prefers-reduced-motion: reduce</code> is active.
              </span>
            </li>
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion levels:</strong> Setting <code className="glow-card-page__a11y-key">motion={'{0}'}</code> completely disables the glow pseudo-element.
              </span>
            </li>
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="glow-card-page__a11y-key">forced-colors: active</code> with visible 2px borders and no glow overlay.
              </span>
            </li>
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Glow pseudo-element is hidden in print stylesheets to save ink and avoid visual artifacts.
              </span>
            </li>
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content z-index:</strong> Content sits above the glow layer via <code className="glow-card-page__a11y-key">z-index: 1</code>, ensuring text remains readable.
              </span>
            </li>
            <li className="glow-card-page__a11y-item">
              <span className="glow-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Uses a plain <code className="glow-card-page__a11y-key">{'<div>'}</code> element. Add <code className="glow-card-page__a11y-key">role</code> and <code className="glow-card-page__a11y-key">tabIndex</code> if the card is interactive.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
