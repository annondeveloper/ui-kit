'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { HeroHighlight, Highlight } from '@ui/domain/hero-highlight'
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
    @scope (.hero-highlight-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: hero-highlight-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .hero-highlight-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .hero-highlight-page__hero::before {
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
        animation: hero-hl-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes hero-hl-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-highlight-page__hero::before { animation: none; }
      }

      .hero-highlight-page__title {
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

      .hero-highlight-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .hero-highlight-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .hero-highlight-page__import-code {
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

      .hero-highlight-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .hero-highlight-page__section {
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
        animation: hero-hl-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes hero-hl-section-reveal {
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
        .hero-highlight-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .hero-highlight-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .hero-highlight-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .hero-highlight-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .hero-highlight-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .hero-highlight-page__preview {
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
      .hero-highlight-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .hero-highlight-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .hero-highlight-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .hero-highlight-page__playground {
          grid-template-columns: 1fr;
        }
        .hero-highlight-page__playground-controls {
          position: static !important;
        }
      }

      @container hero-highlight-page (max-width: 680px) {
        .hero-highlight-page__playground {
          grid-template-columns: 1fr;
        }
        .hero-highlight-page__playground-controls {
          position: static !important;
        }
      }

      .hero-highlight-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .hero-highlight-page__playground-result {
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
      .hero-highlight-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .hero-highlight-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .hero-highlight-page__playground-controls {
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

      .hero-highlight-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .hero-highlight-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hero-highlight-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .hero-highlight-page__option-btn {
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
      .hero-highlight-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .hero-highlight-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .hero-highlight-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .hero-highlight-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .hero-highlight-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .hero-highlight-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .hero-highlight-page__tier-card {
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

      .hero-highlight-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .hero-highlight-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .hero-highlight-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .hero-highlight-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .hero-highlight-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .hero-highlight-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .hero-highlight-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .hero-highlight-page__tier-import {
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

      .hero-highlight-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .hero-highlight-page__code-tabs {
        margin-block-start: 1rem;
      }

      .hero-highlight-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .hero-highlight-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .hero-highlight-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .hero-highlight-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .hero-highlight-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .hero-highlight-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color picker ──────────────────────────────── */

      .hero-highlight-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .hero-highlight-page__color-preset {
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
      .hero-highlight-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .hero-highlight-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .hero-highlight-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .hero-highlight-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .hero-highlight-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .hero-highlight-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .hero-highlight-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .hero-highlight-page__hero {
          padding: 2rem 1.25rem;
        }

        .hero-highlight-page__title {
          font-size: 1.75rem;
        }

        .hero-highlight-page__preview {
          padding: 1.75rem;
        }

        .hero-highlight-page__playground {
          grid-template-columns: 1fr;
        }

        .hero-highlight-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .hero-highlight-page__tiers {
          grid-template-columns: 1fr;
        }

        .hero-highlight-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .hero-highlight-page__hero {
          padding: 1.5rem 1rem;
        }

        .hero-highlight-page__title {
          font-size: 1.5rem;
        }

        .hero-highlight-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .hero-highlight-page__import-code,
      .hero-highlight-page code,
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

const heroHighlightProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the hero highlight container.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override for the container. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

const highlightProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', description: 'Text content to be highlighted with the animated underline effect.' },
  { name: 'color', type: 'string', description: 'Custom highlight color (OKLCH or any CSS color). Defaults to brand color.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = instant highlight, 1+ = scroll-triggered animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the highlight span.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { HeroHighlight, Highlight } from '@annondeveloper/ui-kit/lite'",
  standard: "import { HeroHighlight, Highlight } from '@annondeveloper/ui-kit'",
  premium: "import { HeroHighlight, Highlight } from '@annondeveloper/ui-kit/premium'",
}

const HIGHLIGHT_COLORS = [
  { value: '', name: 'Brand (default)' },
  { value: 'oklch(75% 0.2 150)', name: 'Green' },
  { value: 'oklch(75% 0.15 60)', name: 'Amber' },
  { value: 'oklch(70% 0.2 25)', name: 'Red' },
  { value: 'oklch(70% 0.2 200)', name: 'Cyan' },
  { value: 'oklch(70% 0.2 330)', name: 'Pink' },
]

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
      className="hero-highlight-page__copy-btn"
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
    <div className="hero-highlight-page__control-group">
      <span className="hero-highlight-page__control-label">{label}</span>
      <div className="hero-highlight-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`hero-highlight-page__option-btn${opt === value ? ' hero-highlight-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  motion: MotionLevel,
  highlightText: string,
  highlightColor: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const highlightProps: string[] = []
  if (motion !== 3 && tier !== 'lite') highlightProps.push(`  motion={${motion}}`)
  if (highlightColor) highlightProps.push(`  color="${highlightColor}"`)

  const highlightJsx = highlightProps.length === 0
    ? `<Highlight>${highlightText}</Highlight>`
    : `<Highlight\n${highlightProps.join('\n')}\n>${highlightText}</Highlight>`

  return `${importStr}

<HeroHighlight>
  <h1>
    Build something {${highlightJsx}} today
  </h1>
</HeroHighlight>`
}

function generateHtmlCssCode(tier: Tier, highlightColor: string): string {
  const colorVar = highlightColor ? `\n  --highlight-brand-color: ${highlightColor};` : ''
  return `<!-- HeroHighlight — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/hero-highlight.css">

<div class="ui-hero-highlight">
  <h1>
    Build something
    <span class="ui-highlight" data-active="true"${colorVar ? ` style="${colorVar}"` : ''}>
      amazing
    </span>
    today
  </h1>
</div>

<style>
.ui-hero-highlight {
  display: block;
}
.ui-highlight {
  position: relative;
  display: inline;
  padding-inline: 0.15em;
}
.ui-highlight::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 40%;
  width: 100%;
  background: linear-gradient(90deg,
    var(--highlight-brand-color, oklch(75% 0.15 270 / 0.25)),
    oklch(from var(--highlight-brand-color, oklch(75% 0.15 270 / 0.25)) l c calc(h + 30))
  );
  border-radius: 2px;
  z-index: -1;
}
</style>`
}

function generateVueCode(tier: Tier, motion: MotionLevel, highlightText: string, highlightColor: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-hero-highlight">
    <h1>
      Build something
      <span class="ui-highlight" data-active="true">${highlightText}</span>
      today
    </h1>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/hero-highlight.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const highlightAttrs: string[] = []
  if (motion !== 3) highlightAttrs.push(`:motion="${motion}"`)
  if (highlightColor) highlightAttrs.push(`color="${highlightColor}"`)

  const attrs = highlightAttrs.length > 0 ? ` ${highlightAttrs.join(' ')}` : ''

  return `<template>
  <HeroHighlight>
    <h1>
      Build something
      <Highlight${attrs}>${highlightText}</Highlight>
      today
    </h1>
  </HeroHighlight>
</template>

<script setup>
import { HeroHighlight, Highlight } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, highlightText: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-hero-highlight">
  <h1>
    Build something
    <span class="ui-highlight" data-active="true">${highlightText}</span>
    today
  </h1>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/hero-highlight.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-hero-highlight">
  <h1>
    Build something
    <span class="ui-highlight" data-active="true">${highlightText}</span>
    today
  </h1>
</div>

/* Import component CSS */
@import '${importPath}/css/components/hero-highlight.css';`
}

function generateSvelteCode(tier: Tier, motion: MotionLevel, highlightText: string, highlightColor: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-hero-highlight">
  <h1>
    Build something
    <span class="ui-highlight" data-active="true">${highlightText}</span>
    today
  </h1>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/hero-highlight.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const highlightAttrs: string[] = []
  if (motion !== 3) highlightAttrs.push(`motion={${motion}}`)
  if (highlightColor) highlightAttrs.push(`color="${highlightColor}"`)
  const attrs = highlightAttrs.length > 0 ? `\n  ${highlightAttrs.join('\n  ')}` : ''

  return `<script>
  import { HeroHighlight, Highlight } from '${importPath}';
</script>

<HeroHighlight>
  <h1>
    Build something
    <Highlight${attrs}>${highlightText}</Highlight>
    today
  </h1>
</HeroHighlight>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [highlightText, setHighlightText] = useState('amazing')
  const [highlightColor, setHighlightColor] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, motion, highlightText, highlightColor),
    [tier, motion, highlightText, highlightColor],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, highlightColor),
    [tier, highlightColor],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, motion, highlightText, highlightColor),
    [tier, motion, highlightText, highlightColor],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, highlightText),
    [tier, highlightText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, motion, highlightText, highlightColor),
    [tier, motion, highlightText, highlightColor],
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
    <section className="hero-highlight-page__section" id="playground">
      <h2 className="hero-highlight-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="hero-highlight-page__section-desc">
        Tweak props and see the highlight animate in real-time. The Highlight component uses
        IntersectionObserver to trigger its underline animation when it scrolls into view.
      </p>

      <div className="hero-highlight-page__playground">
        <div className="hero-highlight-page__playground-preview">
          <div className="hero-highlight-page__playground-result">
            <HeroHighlight>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, textAlign: 'center' }}>
                Build something{' '}
                <Highlight
                  motion={motion}
                  color={highlightColor || undefined}
                >
                  {highlightText}
                </Highlight>{' '}
                today
              </h1>
            </HeroHighlight>
          </div>

          <div className="hero-highlight-page__code-tabs">
            <div className="hero-highlight-page__export-row">
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
              {copyStatus && <span className="hero-highlight-page__export-status">{copyStatus}</span>}
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

        <div className="hero-highlight-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as MotionLevel)}
            />
          )}

          <div className="hero-highlight-page__control-group">
            <span className="hero-highlight-page__control-label">Highlight Color</span>
            <div className="hero-highlight-page__control-options">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className={`hero-highlight-page__option-btn${highlightColor === c.value ? ' hero-highlight-page__option-btn--active' : ''}`}
                  onClick={() => setHighlightColor(c.value)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-highlight-page__control-group">
            <span className="hero-highlight-page__control-label">Highlight Text</span>
            <input
              type="text"
              value={highlightText}
              onChange={e => setHighlightText(e.target.value)}
              className="hero-highlight-page__text-input"
              placeholder="Text to highlight..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HeroHighlightPage() {
  useStyles('hero-highlight-page', pageStyles)

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
    const sections = document.querySelectorAll('.hero-highlight-page__section')
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
    <div className="hero-highlight-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="hero-highlight-page__hero">
        <h1 className="hero-highlight-page__title">HeroHighlight</h1>
        <p className="hero-highlight-page__desc">
          A two-part component system for hero sections: HeroHighlight provides the container,
          and Highlight wraps text with an animated gradient underline that triggers on scroll
          via IntersectionObserver.
        </p>
        <div className="hero-highlight-page__import-row">
          <code className="hero-highlight-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Motion Levels ───────────────────────────── */}
      <section className="hero-highlight-page__section" id="motion-levels">
        <h2 className="hero-highlight-page__section-title">
          <a href="#motion-levels">Motion Levels</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          The Highlight underline animation adapts to motion intensity. Level 0 shows
          the highlight instantly with no animation. Levels 1-3 use IntersectionObserver
          to trigger the underline sweep when visible.
        </p>
        <div className="hero-highlight-page__preview" style={{ flexDirection: 'column', gap: '2rem' }}>
          {([0, 1, 2, 3] as const).map(level => (
            <div key={level} style={{ textAlign: 'center' }}>
              <HeroHighlight>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Motion {level}:{' '}
                  <Highlight motion={level}>highlighted text</Highlight>
                </p>
              </HeroHighlight>
              <span className="hero-highlight-page__item-label" style={{ marginBlockStart: '0.5rem', display: 'block' }}>
                motion={level}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Custom Colors ──────────────────────────── */}
      <section className="hero-highlight-page__section" id="colors">
        <h2 className="hero-highlight-page__section-title">
          <a href="#colors">Custom Colors</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Override the highlight color with any OKLCH or CSS color value. The gradient
          automatically generates a +30 degree hue shift for a flowing color transition.
        </p>
        <div className="hero-highlight-page__preview" style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <HeroHighlight>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              Default <Highlight>brand color</Highlight> highlight
            </p>
          </HeroHighlight>
          <HeroHighlight>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              Custom <Highlight color="oklch(75% 0.2 150)">green highlight</Highlight> with OKLCH
            </p>
          </HeroHighlight>
          <HeroHighlight>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              Warm <Highlight color="oklch(75% 0.15 60)">amber tones</Highlight> for emphasis
            </p>
          </HeroHighlight>
          <HeroHighlight>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              Cool <Highlight color="oklch(70% 0.2 200)">cyan accent</Highlight> highlight
            </p>
          </HeroHighlight>
        </div>
        <CopyBlock
          code={`<Highlight color="oklch(75% 0.2 150)">green highlight</Highlight>
<Highlight color="oklch(75% 0.15 60)">amber tones</Highlight>
<Highlight color="oklch(70% 0.2 200)">cyan accent</Highlight>`}
          language="typescript"
        />
      </section>

      {/* ── 5. Usage Examples ──────────────────────────── */}
      <section className="hero-highlight-page__section" id="examples">
        <h2 className="hero-highlight-page__section-title">
          <a href="#examples">Usage Examples</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Use HeroHighlight and Highlight to create impactful hero sections,
          feature callouts, and marketing copy with animated text emphasis.
        </p>
        <div className="hero-highlight-page__preview hero-highlight-page__preview--col" style={{ gap: '2rem' }}>
          <HeroHighlight>
            <div style={{ textAlign: 'center', maxInlineSize: '600px' }}>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Ship <Highlight>production-ready</Highlight> components in minutes
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                Zero-dependency UI kit with physics-based animations and OKLCH color system.
              </p>
            </div>
          </HeroHighlight>

          <HeroHighlight>
            <div style={{ textAlign: 'center', maxInlineSize: '600px' }}>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Built for <Highlight color="oklch(72% 0.19 155)">performance</Highlight>,
                designed for <Highlight color="oklch(70% 0.2 330)">beauty</Highlight>
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                Multiple highlights in a single sentence with different colors.
              </p>
            </div>
          </HeroHighlight>

          <HeroHighlight>
            <div style={{ maxInlineSize: '500px' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Why developers choose us
              </h3>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
                <li><Highlight color="oklch(75% 0.2 150)">Zero dependencies</Highlight> — just React</li>
                <li><Highlight color="oklch(75% 0.15 60)">62 components</Highlight> — all you need</li>
                <li><Highlight color="oklch(70% 0.2 200)">Physics animations</Highlight> — real spring solver</li>
              </ul>
            </div>
          </HeroHighlight>
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="hero-highlight-page__section" id="tiers">
        <h2 className="hero-highlight-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Choose the right balance of features and bundle size. The Standard tier includes
          IntersectionObserver-based animation. Lite provides CSS-only instant highlights.
          Premium adds enhanced glow trails and multi-step color transitions.
        </p>

        <div className="hero-highlight-page__tiers">
          {/* Lite */}
          <div
            className={`hero-highlight-page__tier-card${tier === 'lite' ? ' hero-highlight-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="hero-highlight-page__tier-header">
              <span className="hero-highlight-page__tier-name">Lite</span>
              <span className="hero-highlight-page__tier-size">~0.3 KB</span>
            </div>
            <p className="hero-highlight-page__tier-desc">
              CSS-only highlight. No IntersectionObserver, no JavaScript animation.
              The underline is always visible with no scroll trigger.
            </p>
            <div className="hero-highlight-page__tier-import">
              import {'{'} HeroHighlight, Highlight {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="hero-highlight-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', position: 'relative', paddingInline: '0.15em' }}>
                <span style={{ position: 'absolute', bottom: 0, left: 0, height: '40%', width: '100%', background: 'oklch(75% 0.15 270 / 0.25)', borderRadius: '2px', zIndex: -1 }} />
                Lite Highlight
              </span>
            </div>
            <div className="hero-highlight-page__size-breakdown">
              <div className="hero-highlight-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`hero-highlight-page__tier-card${tier === 'standard' ? ' hero-highlight-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="hero-highlight-page__tier-header">
              <span className="hero-highlight-page__tier-name">Standard</span>
              <span className="hero-highlight-page__tier-size">~1.8 KB</span>
            </div>
            <p className="hero-highlight-page__tier-desc">
              Scroll-triggered animation via IntersectionObserver. Custom color support,
              motion levels, and smooth CSS transitions for the underline sweep.
            </p>
            <div className="hero-highlight-page__tier-import">
              import {'{'} HeroHighlight, Highlight {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="hero-highlight-page__tier-preview">
              <Highlight>Standard Highlight</Highlight>
            </div>
            <div className="hero-highlight-page__size-breakdown">
              <div className="hero-highlight-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`hero-highlight-page__tier-card${tier === 'premium' ? ' hero-highlight-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="hero-highlight-page__tier-header">
              <span className="hero-highlight-page__tier-name">Premium</span>
              <span className="hero-highlight-page__tier-size">~3.2 KB</span>
            </div>
            <p className="hero-highlight-page__tier-desc">
              Everything in Standard plus glow trail on the underline sweep,
              multi-step color transitions, and spring-based entrance animation.
            </p>
            <div className="hero-highlight-page__tier-import">
              import {'{'} HeroHighlight, Highlight {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="hero-highlight-page__tier-preview">
              <Highlight>Premium Highlight</Highlight>
            </div>
            <div className="hero-highlight-page__size-breakdown">
              <div className="hero-highlight-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ─────────────────────────────── */}
      <section className="hero-highlight-page__section" id="brand-color">
        <h2 className="hero-highlight-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Pick a brand color to see the highlight gradient update in real-time.
          The default highlight color derives from the brand color with automatic hue shifting.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="hero-highlight-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`hero-highlight-page__color-preset${brandColor === p.hex ? ' hero-highlight-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API — HeroHighlight ───────────────── */}
      <section className="hero-highlight-page__section" id="props-hero">
        <h2 className="hero-highlight-page__section-title">
          <a href="#props-hero">Props API — HeroHighlight</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Props for the HeroHighlight container component. Spreads native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={heroHighlightProps} />
        </Card>
      </section>

      {/* ── 9. Props API — Highlight ───────────────────── */}
      <section className="hero-highlight-page__section" id="props-highlight">
        <h2 className="hero-highlight-page__section-title">
          <a href="#props-highlight">Props API — Highlight</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          Props for the Highlight inline component. Spreads native span attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={highlightProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─────────────────────────── */}
      <section className="hero-highlight-page__section" id="accessibility">
        <h2 className="hero-highlight-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="hero-highlight-page__section-desc">
          HeroHighlight and Highlight are designed with accessibility as a first-class concern.
        </p>
        <Card variant="default" padding="md">
          <ul className="hero-highlight-page__a11y-list">
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses <code className="hero-highlight-page__a11y-key">{'<span>'}</code> for inline highlights, preserving text flow and screen reader reading order.
              </span>
            </li>
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative only:</strong> The highlight underline is a <code className="hero-highlight-page__a11y-key">::before</code> pseudo-element, purely visual with no impact on content.
              </span>
            </li>
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="hero-highlight-page__a11y-key">prefers-reduced-motion</code> — shows highlight instantly with no animation.
              </span>
            </li>
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="hero-highlight-page__a11y-key">forced-colors: active</code> with system Highlight color fallback.
              </span>
            </li>
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print friendly:</strong> Highlight underline renders at full width in print stylesheets.
              </span>
            </li>
            <li className="hero-highlight-page__a11y-item">
              <span className="hero-highlight-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast safe:</strong> Highlight background uses 25% opacity to maintain WCAG AA text contrast.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
