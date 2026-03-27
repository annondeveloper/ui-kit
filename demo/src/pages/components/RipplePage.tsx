'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Ripple } from '@ui/domain/ripple'
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
    @scope (.ripple-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ripple-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .ripple-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ripple-page__hero::before {
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
        animation: ripple-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ripple-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ripple-page__hero::before { animation: none; }
      }

      .ripple-page__title {
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

      .ripple-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ripple-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ripple-page__import-code {
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

      .ripple-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .ripple-page__section {
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
        animation: ripple-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ripple-section-reveal {
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
        .ripple-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .ripple-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .ripple-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .ripple-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ripple-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .ripple-page__preview {
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
        min-block-size: 120px;
      }

      .ripple-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Ripple demo targets ──────────────────────────── */

      .ripple-page__target {
        padding: 1.5rem 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        text-align: center;
        color: var(--text-primary);
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
        user-select: none;
      }

      .ripple-page__target--large {
        padding: 3rem 4rem;
        font-size: var(--text-base, 1rem);
        border-radius: var(--radius-lg);
      }

      .ripple-page__target--card {
        padding: 2rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
        text-align: start;
        max-inline-size: 280px;
      }

      .ripple-page__target--card h3 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
      }

      .ripple-page__target--card p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
        font-weight: 400;
      }

      /* ── Playground ─────────────────────────────────── */

      .ripple-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .ripple-page__playground {
          grid-template-columns: 1fr;
        }
        .ripple-page__playground-controls {
          position: static !important;
        }
      }

      @container ripple-page (max-width: 680px) {
        .ripple-page__playground {
          grid-template-columns: 1fr;
        }
        .ripple-page__playground-controls {
          position: static !important;
        }
      }

      .ripple-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .ripple-page__playground-result {
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

      .ripple-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ripple-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .ripple-page__playground-controls {
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

      .ripple-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ripple-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ripple-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ripple-page__option-btn {
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
      .ripple-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ripple-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ripple-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ripple-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .ripple-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
        justify-content: center;
      }

      .ripple-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .ripple-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .ripple-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .ripple-page__tier-card {
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

      .ripple-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ripple-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .ripple-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ripple-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ripple-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .ripple-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .ripple-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .ripple-page__tier-import {
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

      .ripple-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .ripple-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .ripple-page__color-preset {
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
      .ripple-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .ripple-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .ripple-page__code-tabs {
        margin-block-start: 1rem;
      }

      .ripple-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .ripple-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .ripple-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .ripple-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .ripple-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ripple-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .ripple-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .ripple-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .ripple-page__hero {
          padding: 2rem 1.25rem;
        }
        .ripple-page__title {
          font-size: 1.75rem;
        }
        .ripple-page__preview {
          padding: 1.75rem;
        }
        .ripple-page__playground {
          grid-template-columns: 1fr;
        }
        .ripple-page__playground-result {
          padding: 2rem;
          min-block-size: 150px;
        }
        .ripple-page__tiers {
          grid-template-columns: 1fr;
        }
        .ripple-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .ripple-page__hero {
          padding: 1.5rem 1rem;
        }
        .ripple-page__title {
          font-size: 1.5rem;
        }
        .ripple-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .ripple-page__title {
          font-size: 4rem;
        }
        .ripple-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .ripple-page__import-code,
      .ripple-page code,
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

const rippleProps: PropDef[] = [
  { name: 'color', type: 'string', description: 'Ripple color override. Accepts any CSS color value. Defaults to semi-transparent white.' },
  { name: 'duration', type: 'number', default: '600', description: 'Ripple animation duration in milliseconds.' },
  { name: 'children', type: 'ReactNode', description: 'Content wrapped by the ripple container. Click anywhere to trigger.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables ripple entirely.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler. Called before the ripple animation begins.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Ripple } from '@annondeveloper/ui-kit/domain'",
  standard: "import { Ripple } from '@annondeveloper/ui-kit'",
  premium: "import { Ripple } from '@annondeveloper/ui-kit/premium'",
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

const RIPPLE_COLORS = [
  { value: '', label: 'Default (white)' },
  { value: 'oklch(65% 0.2 270 / 0.3)', label: 'Brand' },
  { value: 'oklch(75% 0.15 150 / 0.3)', label: 'Green' },
  { value: 'oklch(70% 0.2 25 / 0.3)', label: 'Red' },
  { value: 'oklch(80% 0.15 85 / 0.3)', label: 'Yellow' },
  { value: 'oklch(70% 0.2 200 / 0.3)', label: 'Cyan' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="ripple-page__copy-btn"
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
    <div className="ripple-page__control-group">
      <span className="ripple-page__control-label">{label}</span>
      <div className="ripple-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`ripple-page__option-btn${opt === value ? ' ripple-page__option-btn--active' : ''}`}
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
  color: string,
  duration: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (color) props.push(`  color="${color}"`)
  if (duration !== 600) props.push(`  duration={${duration}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `\n  <div style={{ padding: '2rem', textAlign: 'center' }}>\n    Click anywhere for ripple\n  </div>\n`

  if (props.length === 0) {
    return `${importStr}\n\n<Ripple>${childContent}</Ripple>`
  }

  return `${importStr}\n\n<Ripple\n${props.join('\n')}\n>${childContent}</Ripple>`
}

function generateHtmlCode(color: string, duration: number): string {
  const colorCss = color ? `\n  --ripple-effect-color: ${color};` : ''
  return `<!-- Ripple — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/ripple.css">

<div class="ui-ripple" style="--ripple-effect-duration: ${duration}ms;${colorCss}">
  <div class="ui-ripple--content">
    <div style="padding: 2rem; text-align: center;">
      Click anywhere for ripple
    </div>
  </div>
</div>

<script>
// Ripple requires minimal JS to create the circle element on click
document.querySelector('.ui-ripple').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const circle = document.createElement('span');
  circle.className = 'ui-ripple--circle';
  circle.style.width = circle.style.height = size + 'px';
  circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
  circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
  e.currentTarget.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
});
</script>`
}

function generateVueCode(tier: Tier, color: string, duration: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (color) props.push(`  color="${color}"`)
  if (duration !== 600) props.push(`  :duration="${duration}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<template>
  <Ripple${propsStr}>
    <div style="padding: 2rem; text-align: center;">
      Click anywhere for ripple
    </div>
  </Ripple>
</template>

<script setup>
import { Ripple } from '${importPath}'
</script>`
}

function generateAngularCode(color: string, duration: number): string {
  const colorCss = color ? `\n  --ripple-effect-color: ${color};` : ''
  return `<!-- Angular — Use CSS + JS approach -->
<div class="ui-ripple"
  style="--ripple-effect-duration: ${duration}ms;${colorCss}"
  (click)="onRipple($event)">
  <div class="ui-ripple--content">
    <div style="padding: 2rem; text-align: center;">
      Click anywhere for ripple
    </div>
  </div>
</div>

/* In your component: */
onRipple(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const circle = document.createElement('span');
  circle.className = 'ui-ripple--circle';
  Object.assign(circle.style, {
    width: size + 'px', height: size + 'px',
    left: (e.clientX - rect.left - size / 2) + 'px',
    top: (e.clientY - rect.top - size / 2) + 'px',
  });
  el.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/ripple.css';`
}

function generateSvelteCode(tier: Tier, color: string, duration: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (color) props.push(`  color="${color}"`)
  if (duration !== 600) props.push(`  duration={${duration}}`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>
  import { Ripple } from '${importPath}';
</script>

<Ripple${propsStr}>
  <div style="padding: 2rem; text-align: center;">
    Click anywhere for ripple
  </div>
</Ripple>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [rippleColor, setRippleColor] = useState('')
  const [duration, setDuration] = useState(600)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, rippleColor, duration, motion),
    [tier, rippleColor, duration, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(rippleColor, duration), [rippleColor, duration])
  const vueCode = useMemo(() => generateVueCode(tier, rippleColor, duration), [tier, rippleColor, duration])
  const angularCode = useMemo(() => generateAngularCode(rippleColor, duration), [rippleColor, duration])
  const svelteCode = useMemo(() => generateSvelteCode(tier, rippleColor, duration), [tier, rippleColor, duration])

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
    <section className="ripple-page__section" id="playground">
      <h2 className="ripple-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ripple-page__section-desc">
        Click the target area to see the ripple effect. Adjust color, duration, and motion to customize.
      </p>

      <div className="ripple-page__playground">
        <div className="ripple-page__playground-preview">
          <div className="ripple-page__playground-result">
            <Ripple
              color={rippleColor || undefined}
              duration={duration}
              motion={motion}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <div className="ripple-page__target ripple-page__target--large">
                Click anywhere in this area
              </div>
            </Ripple>
          </div>

          <div className="ripple-page__code-tabs">
            <div className="ripple-page__export-row">
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
              {copyStatus && <span className="ripple-page__export-status">{copyStatus}</span>}
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

        <div className="ripple-page__playground-controls">
          <div className="ripple-page__control-group">
            <span className="ripple-page__control-label">Ripple Color</span>
            <div className="ripple-page__control-options">
              {RIPPLE_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`ripple-page__option-btn${rippleColor === c.value ? ' ripple-page__option-btn--active' : ''}`}
                  onClick={() => setRippleColor(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <OptionGroup
            label="Duration (ms)"
            options={['200', '400', '600', '800', '1200'] as const}
            value={String(duration)}
            onChange={v => setDuration(Number(v))}
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

export default function RipplePage() {
  useStyles('ripple-page', pageStyles)

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.ripple-page__section')
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
    <div className="ripple-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ripple-page__hero">
        <h1 className="ripple-page__title">Ripple</h1>
        <p className="ripple-page__desc">
          Material-inspired click ripple effect that wraps any content. The ripple expands
          from the click point with customizable color and duration. Perfect for adding
          tactile feedback to cards, buttons, and interactive surfaces.
        </p>
        <div className="ripple-page__import-row">
          <code className="ripple-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Ripple Colors ───────────────────────────── */}
      <section className="ripple-page__section" id="colors">
        <h2 className="ripple-page__section-title">
          <a href="#colors">Ripple Colors</a>
        </h2>
        <p className="ripple-page__section-desc">
          Customize the ripple color to match your design. The default is semi-transparent white,
          but any CSS color works. Use OKLCH colors for perceptual consistency.
        </p>
        <div className="ripple-page__labeled-row">
          <div className="ripple-page__labeled-item">
            <Ripple style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Default</div>
            </Ripple>
            <span className="ripple-page__item-label">default</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple color="oklch(65% 0.2 270 / 0.3)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Brand</div>
            </Ripple>
            <span className="ripple-page__item-label">brand</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple color="oklch(75% 0.15 150 / 0.3)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Green</div>
            </Ripple>
            <span className="ripple-page__item-label">green</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple color="oklch(70% 0.2 25 / 0.3)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Red</div>
            </Ripple>
            <span className="ripple-page__item-label">red</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple color="oklch(70% 0.2 200 / 0.3)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Cyan</div>
            </Ripple>
            <span className="ripple-page__item-label">cyan</span>
          </div>
        </div>
      </section>

      {/* ── 4. Duration Variations ──────────────────────── */}
      <section className="ripple-page__section" id="duration">
        <h2 className="ripple-page__section-title">
          <a href="#duration">Duration</a>
        </h2>
        <p className="ripple-page__section-desc">
          The duration prop controls how long the ripple animation takes in milliseconds.
          Shorter durations feel snappy and responsive; longer durations feel smooth and luxurious.
        </p>
        <div className="ripple-page__labeled-row">
          <div className="ripple-page__labeled-item">
            <Ripple duration={200} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Fast</div>
            </Ripple>
            <span className="ripple-page__item-label">200ms</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple duration={600} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Default</div>
            </Ripple>
            <span className="ripple-page__item-label">600ms</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple duration={1200} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Slow</div>
            </Ripple>
            <span className="ripple-page__item-label">1200ms</span>
          </div>
        </div>
      </section>

      {/* ── 5. Motion Levels ────────────────────────────── */}
      <section className="ripple-page__section" id="motion">
        <h2 className="ripple-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="ripple-page__section-desc">
          Motion level 0 disables the ripple entirely for users who prefer reduced motion.
          All other levels display the full ripple effect. Respects <code className="ripple-page__a11y-key">prefers-reduced-motion</code>.
        </p>
        <div className="ripple-page__labeled-row">
          <div className="ripple-page__labeled-item">
            <Ripple motion={0} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">No Ripple</div>
            </Ripple>
            <span className="ripple-page__item-label">motion=0</span>
          </div>
          <div className="ripple-page__labeled-item">
            <Ripple motion={3} style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="ripple-page__target">Full Ripple</div>
            </Ripple>
            <span className="ripple-page__item-label">motion=3</span>
          </div>
        </div>
      </section>

      {/* ── 6. Use Cases ───────────────────────────────── */}
      <section className="ripple-page__section" id="use-cases">
        <h2 className="ripple-page__section-title">
          <a href="#use-cases">Use Cases</a>
        </h2>
        <p className="ripple-page__section-desc">
          Ripple wraps any content to add click feedback. Use it on cards, list items,
          navigation links, or any interactive surface that benefits from tactile response.
        </p>
        <div className="ripple-page__preview" style={{ gap: '2rem', flexDirection: 'column', alignItems: 'center' }}>
          <Ripple color="oklch(65% 0.2 270 / 0.2)" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="ripple-page__target--card">
              <h3>Interactive Card</h3>
              <p>Click this card to see the ripple effect emanate from your click point. Great for dashboard widgets and list items.</p>
            </div>
          </Ripple>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Ripple style={{ borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Navigation Item
              </div>
            </Ripple>
            <Ripple color="oklch(75% 0.15 150 / 0.25)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'oklch(75% 0.15 150 / 0.1)', border: '1px solid oklch(75% 0.15 150 / 0.2)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Success Action
              </div>
            </Ripple>
            <Ripple color="oklch(70% 0.2 25 / 0.25)" style={{ borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '0.75rem 1.5rem', background: 'oklch(70% 0.2 25 / 0.1)', border: '1px solid oklch(70% 0.2 25 / 0.2)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Danger Action
              </div>
            </Ripple>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Ripple color="oklch(65% 0.2 270 / 0.2)">
  <Card>
    <h3>Interactive Card</h3>
    <p>Click for ripple feedback</p>
  </Card>
</Ripple>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="ripple-page__section" id="tiers">
        <h2 className="ripple-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="ripple-page__section-desc">
          Ripple ships with three weight tiers. The Lite tier provides CSS-only ripple via
          keyframes. Standard adds click-position tracking and cleanup. Premium adds
          multi-ripple stacking and glow trails.
        </p>

        <div className="ripple-page__tiers">
          {/* Lite */}
          <div
            className={`ripple-page__tier-card${tier === 'lite' ? ' ripple-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="ripple-page__tier-header">
              <span className="ripple-page__tier-name">Lite</span>
              <span className="ripple-page__tier-size">~0.3 KB</span>
            </div>
            <p className="ripple-page__tier-desc">
              CSS-only ripple with center-origin animation. No JavaScript click tracking.
              Ripple always originates from the element center.
            </p>
            <div className="ripple-page__tier-import">
              import {'{'} Ripple {'}'} from '@annondeveloper/ui-kit/domain'
            </div>
            <div className="ripple-page__tier-preview">
              <Ripple motion={0} style={{ borderRadius: 'var(--radius-sm)' }}>
                <div style={{ padding: '0.75rem 1.25rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Click me</div>
              </Ripple>
            </div>
            <div className="ripple-page__size-breakdown">
              <div className="ripple-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`ripple-page__tier-card${tier === 'standard' ? ' ripple-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="ripple-page__tier-header">
              <span className="ripple-page__tier-name">Standard</span>
              <span className="ripple-page__tier-size">~1.4 KB</span>
            </div>
            <p className="ripple-page__tier-desc">
              Full ripple engine with click-position tracking, automatic cleanup,
              motion level support, and configurable color and duration.
            </p>
            <div className="ripple-page__tier-import">
              import {'{'} Ripple {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="ripple-page__tier-preview">
              <Ripple style={{ borderRadius: 'var(--radius-sm)' }}>
                <div style={{ padding: '0.75rem 1.25rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Click me</div>
              </Ripple>
            </div>
            <div className="ripple-page__size-breakdown">
              <div className="ripple-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`ripple-page__tier-card${tier === 'premium' ? ' ripple-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="ripple-page__tier-header">
              <span className="ripple-page__tier-name">Premium</span>
              <span className="ripple-page__tier-size">~2.6 KB</span>
            </div>
            <p className="ripple-page__tier-desc">
              Everything in Standard plus multi-ripple stacking, glow trail
              effects, and physics-based ease curves for natural motion.
            </p>
            <div className="ripple-page__tier-import">
              import {'{'} Ripple {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="ripple-page__tier-preview">
              <Ripple style={{ borderRadius: 'var(--radius-sm)' }}>
                <div style={{ padding: '0.75rem 1.25rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Click me</div>
              </Ripple>
            </div>
            <div className="ripple-page__size-breakdown">
              <div className="ripple-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="ripple-page__section" id="brand-color">
        <h2 className="ripple-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="ripple-page__section-desc">
          Pick a brand color to see the page theme update in real-time. The aurora
          gradients and accent colors derive automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="ripple-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`ripple-page__color-preset${brandColor === p.hex ? ' ripple-page__color-preset--active' : ''}`}
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
      <section className="ripple-page__section" id="props">
        <h2 className="ripple-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="ripple-page__section-desc">
          All props accepted by Ripple. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={rippleProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="ripple-page__section" id="accessibility">
        <h2 className="ripple-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ripple-page__section-desc">
          Ripple adds visual feedback without affecting content accessibility or keyboard interaction.
        </p>
        <Card variant="default" padding="md">
          <ul className="ripple-page__a11y-list">
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> Ripple circles are decorative and do not affect the DOM reading order or screen reader announcements.
              </span>
            </li>
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="ripple-page__a11y-key">prefers-reduced-motion</code> by hiding ripple circles entirely via <code className="ripple-page__a11y-key">display: none</code>.
              </span>
            </li>
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children render at z-index 1 above the ripple layer, maintaining full interactivity and readability.
              </span>
            </li>
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Click passthrough:</strong> The <code className="ripple-page__a11y-key">onClick</code> handler fires before the ripple, ensuring your click logic is never blocked.
              </span>
            </li>
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pointer events:</strong> Ripple circles have <code className="ripple-page__a11y-key">pointer-events: none</code> so they never interfere with interactive children.
              </span>
            </li>
            <li className="ripple-page__a11y-item">
              <span className="ripple-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Ripple circles are hidden in print media to keep printed output clean.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
