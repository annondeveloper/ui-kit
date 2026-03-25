'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NumberTicker } from '@ui/domain/number-ticker'
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
    @scope (.number-ticker-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: number-ticker-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .number-ticker-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .number-ticker-page__hero::before {
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
        animation: number-ticker-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes number-ticker-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .number-ticker-page__hero::before { animation: none; }
      }

      .number-ticker-page__title {
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

      .number-ticker-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .number-ticker-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .number-ticker-page__import-code {
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

      .number-ticker-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .number-ticker-page__section {
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
        animation: number-ticker-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes number-ticker-section-reveal {
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
        .number-ticker-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .number-ticker-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .number-ticker-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .number-ticker-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .number-ticker-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .number-ticker-page__preview {
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

      .number-ticker-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .number-ticker-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .number-ticker-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container number-ticker-page (max-width: 680px) {
        .number-ticker-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .number-ticker-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .number-ticker-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .number-ticker-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .number-ticker-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .number-ticker-page__playground-controls {
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

      .number-ticker-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .number-ticker-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .number-ticker-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .number-ticker-page__option-btn {
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
      .number-ticker-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .number-ticker-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .number-ticker-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .number-ticker-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .number-ticker-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .number-ticker-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .number-ticker-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .number-ticker-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .number-ticker-page__tier-card {
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

      .number-ticker-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .number-ticker-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .number-ticker-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .number-ticker-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .number-ticker-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .number-ticker-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .number-ticker-page__tier-import {
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

      .number-ticker-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .number-ticker-page__code-tabs {
        margin-block-start: 1rem;
      }

      .number-ticker-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .number-ticker-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .number-ticker-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .number-ticker-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .number-ticker-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .number-ticker-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .number-ticker-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .number-ticker-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color presets ─────────────────────────────── */

      .number-ticker-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .number-ticker-page__color-preset {
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
      .number-ticker-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .number-ticker-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Big value display ─────────────────────────── */

      .number-ticker-page__big-value {
        font-size: clamp(2.5rem, 8vw, 4rem);
        font-weight: 800;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
      }

      .number-ticker-page__medium-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .number-ticker-page__small-value {
        font-size: 1rem;
        color: var(--text-secondary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .number-ticker-page__hero { padding: 2rem 1.25rem; }
        .number-ticker-page__title { font-size: 1.75rem; }
        .number-ticker-page__preview { padding: 1.75rem; }
        .number-ticker-page__playground { grid-template-columns: 1fr; }
        .number-ticker-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .number-ticker-page__tiers { grid-template-columns: 1fr; }
        .number-ticker-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .number-ticker-page__hero { padding: 1.5rem 1rem; }
        .number-ticker-page__title { font-size: 1.5rem; }
        .number-ticker-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .number-ticker-page__import-code,
      .number-ticker-page code,
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

const numberTickerProps: PropDef[] = [
  { name: 'value', type: 'number', description: 'The numeric value to display. Formatted with Intl.NumberFormat (locale-aware commas/periods).' },
  { name: 'direction', type: "'up' | 'down'", default: "'up'", description: 'Direction digits roll when changing. "up" rolls from bottom, "down" from top.' },
  { name: 'delay', type: 'number', default: '0', description: 'Delay in milliseconds before the initial animation starts.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 = instant display, 1-3 = animated digit columns.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Direction = 'up' | 'down'

const DIRECTIONS: Direction[] = ['up', 'down']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { NumberTicker } from '@annondeveloper/ui-kit/lite'",
  standard: "import { NumberTicker } from '@annondeveloper/ui-kit'",
  premium: "import { NumberTicker } from '@annondeveloper/ui-kit/premium'",
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
      className="number-ticker-page__copy-btn"
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
    <div className="number-ticker-page__control-group">
      <span className="number-ticker-page__control-label">{label}</span>
      <div className="number-ticker-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`number-ticker-page__option-btn${opt === value ? ' number-ticker-page__option-btn--active' : ''}`}
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
  value: number,
  direction: Direction,
  delay: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push(`  value={${value}}`)
  if (direction !== 'up') props.push(`  direction="${direction}"`)
  if (delay > 0) props.push(`  delay={${delay}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<NumberTicker\n${props.join('\n')}\n/>`
}

function generateHtmlCode(value: number): string {
  return `<!-- NumberTicker — CSS-only static fallback -->
<span
  class="ui-number-ticker"
  aria-label="${new Intl.NumberFormat().format(value)}"
  role="img"
>
  ${new Intl.NumberFormat().format(value)}
</span>

<!-- For animated version, use the React component -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/number-ticker.css">`
}

function generateVueCode(tier: Tier, value: number, direction: Direction, delay: number): string {
  if (tier === 'lite') {
    return `<template>\n  <span class="ui-lite-number-ticker">{{ formatted }}</span>\n</template>\n\n<script setup>\nimport { computed } from 'vue'\nconst value = ${value}\nconst formatted = computed(() => new Intl.NumberFormat().format(value))\n</script>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`:value="${value}"`]
  if (direction !== 'up') attrs.push(`direction="${direction}"`)
  if (delay > 0) attrs.push(`:delay="${delay}"`)
  return `<template>\n  <NumberTicker\n    ${attrs.join('\n    ')}\n  />\n</template>\n\n<script setup>\nimport { NumberTicker } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, value: number): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<span class="ui-lite-number-ticker">{{ ${value} | number }}</span>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Use the CSS-only approach or React wrapper -->\n<span\n  class="ui-number-ticker"\n  [attr.aria-label]="'${new Intl.NumberFormat().format(value)}'"\n  role="img"\n>\n  {{ ${value} | number }}\n</span>\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/number-ticker.css';`
}

function generateSvelteCode(tier: Tier, value: number, direction: Direction): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<span class="ui-lite-number-ticker">\n  {new Intl.NumberFormat().format(${value})}\n</span>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { NumberTicker } from '${importPath}';\n</script>\n\n<NumberTicker\n  value={${value}}\n  direction="${direction}"\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [value, setValue] = useState(42195)
  const [direction, setDirection] = useState<Direction>('up')
  const [delay, setDelay] = useState(0)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, value, direction, delay, motion),
    [tier, value, direction, delay, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(value), [value])
  const vueCode = useMemo(() => generateVueCode(tier, value, direction, delay), [tier, value, direction, delay])
  const angularCode = useMemo(() => generateAngularCode(tier, value), [tier, value])
  const svelteCode = useMemo(() => generateSvelteCode(tier, value, direction), [tier, value, direction])

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

  const randomize = useCallback(() => {
    setValue(Math.floor(Math.random() * 100000))
  }, [])

  return (
    <section className="number-ticker-page__section" id="playground">
      <h2 className="number-ticker-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="number-ticker-page__section-desc">
        Tweak every prop and see the number animate in real-time. The generated code updates as you change settings.
      </p>

      <div className="number-ticker-page__playground">
        <div className="number-ticker-page__playground-preview">
          <div className="number-ticker-page__playground-result">
            <span className="number-ticker-page__big-value">
              <NumberTicker value={value} direction={direction} delay={delay} motion={motion} />
            </span>
          </div>

          <div className="number-ticker-page__code-tabs">
            <div className="number-ticker-page__export-row">
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
              {copyStatus && <span className="number-ticker-page__export-status">{copyStatus}</span>}
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

        <div className="number-ticker-page__playground-controls">
          <div className="number-ticker-page__control-group">
            <span className="number-ticker-page__control-label">Value</span>
            <input
              type="number"
              value={value}
              onChange={e => setValue(Number(e.target.value) || 0)}
              className="number-ticker-page__text-input"
            />
            <Button size="xs" variant="ghost" onClick={randomize} style={{ marginBlockStart: '0.25rem' }}>
              <Icon name="refresh" size="sm" /> Randomize
            </Button>
          </div>

          <OptionGroup label="Direction" options={DIRECTIONS} value={direction} onChange={setDirection} />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="number-ticker-page__control-group">
            <span className="number-ticker-page__control-label">Delay (ms)</span>
            <input
              type="number"
              value={delay}
              min={0}
              step={100}
              onChange={e => setDelay(Number(e.target.value) || 0)}
              className="number-ticker-page__text-input"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NumberTickerPage() {
  useStyles('number-ticker-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
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
    const sections = document.querySelectorAll('.number-ticker-page__section')
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
    <div className="number-ticker-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="number-ticker-page__hero">
        <h1 className="number-ticker-page__title">NumberTicker</h1>
        <p className="number-ticker-page__desc">
          Animated numeric display with rolling digit columns. Numbers cascade into place with smooth
          transitions, locale-aware formatting, and configurable motion intensity. Perfect for dashboards,
          counters, and real-time metrics.
        </p>
        <div className="number-ticker-page__import-row">
          <code className="number-ticker-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Direction ────────────────────────────────── */}
      <section className="number-ticker-page__section" id="direction">
        <h2 className="number-ticker-page__section-title">
          <a href="#direction">Direction</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Digits can roll upward or downward. Use "down" for countdown-style effects or "up" for incrementing values.
        </p>
        <div className="number-ticker-page__preview">
          <div className="number-ticker-page__labeled-row">
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={12345} direction="up" />
              </span>
              <span className="number-ticker-page__item-label">direction="up"</span>
            </div>
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={12345} direction="down" />
              </span>
              <span className="number-ticker-page__item-label">direction="down"</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ──────────────────────────── */}
      <section className="number-ticker-page__section" id="motion">
        <h2 className="number-ticker-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Control animation intensity from instant (0) to cinematic (3). Respects OS-level
          prefers-reduced-motion automatically.
        </p>
        <div className="number-ticker-page__preview">
          <div className="number-ticker-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="number-ticker-page__labeled-item">
                <span className="number-ticker-page__medium-value">
                  <NumberTicker value={8642} motion={m} />
                </span>
                <span className="number-ticker-page__item-label">motion={m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Delay ───────────────────────────────────── */}
      <section className="number-ticker-page__section" id="delay">
        <h2 className="number-ticker-page__section-title">
          <a href="#delay">Staggered Delay</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Use the delay prop to stagger multiple tickers for a cascading entrance effect.
          The ticker displays "0" until the delay elapses, then animates to the target value.
        </p>
        <div className="number-ticker-page__preview">
          <div className="number-ticker-page__labeled-row">
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={1200} delay={0} />
              </span>
              <span className="number-ticker-page__item-label">delay=0</span>
            </div>
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={3456} delay={300} />
              </span>
              <span className="number-ticker-page__item-label">delay=300</span>
            </div>
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={7890} delay={600} />
              </span>
              <span className="number-ticker-page__item-label">delay=600</span>
            </div>
            <div className="number-ticker-page__labeled-item">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={99999} delay={900} />
              </span>
              <span className="number-ticker-page__item-label">delay=900</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Real-World Examples ──────────────────────── */}
      <section className="number-ticker-page__section" id="examples">
        <h2 className="number-ticker-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Common use cases: dashboard metrics, counters, revenue displays, and live statistics.
        </p>
        <div className="number-ticker-page__preview number-ticker-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Revenue</span>
            <span className="number-ticker-page__big-value" style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ color: 'var(--text-tertiary)', marginInlineEnd: '0.125rem' }}>$</span>
              <NumberTicker value={284930} delay={200} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Users</span>
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={14287} delay={400} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requests / sec</span>
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={3842} delay={600} />
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uptime %</span>
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={99} delay={800} /><span style={{ color: 'var(--text-tertiary)' }}>.98</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="number-ticker-page__section" id="tiers">
        <h2 className="number-ticker-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Choose the right balance of features and bundle size. NumberTicker is a domain component
          focused on animated numeric display.
        </p>

        <div className="number-ticker-page__tiers">
          {/* Lite */}
          <div
            className={`number-ticker-page__tier-card${tier === 'lite' ? ' number-ticker-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="number-ticker-page__tier-header">
              <span className="number-ticker-page__tier-name">Lite</span>
              <span className="number-ticker-page__tier-size">~0.2 KB</span>
            </div>
            <p className="number-ticker-page__tier-desc">
              Static numeric display with locale formatting. No animation, no digit rolling.
              Pure CSS with Intl.NumberFormat output.
            </p>
            <div className="number-ticker-page__tier-import">
              import {'{'} NumberTicker {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="number-ticker-page__tier-preview">
              <span className="number-ticker-page__medium-value">42,195</span>
            </div>
            <div className="number-ticker-page__size-breakdown">
              <div className="number-ticker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`number-ticker-page__tier-card${tier === 'standard' ? ' number-ticker-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="number-ticker-page__tier-header">
              <span className="number-ticker-page__tier-name">Standard</span>
              <span className="number-ticker-page__tier-size">~1.2 KB</span>
            </div>
            <p className="number-ticker-page__tier-desc">
              Full-featured with rolling digit columns, direction control,
              delay, motion levels, and locale-aware formatting.
            </p>
            <div className="number-ticker-page__tier-import">
              import {'{'} NumberTicker {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="number-ticker-page__tier-preview">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={42195} />
              </span>
            </div>
            <div className="number-ticker-page__size-breakdown">
              <div className="number-ticker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`number-ticker-page__tier-card${tier === 'premium' ? ' number-ticker-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="number-ticker-page__tier-header">
              <span className="number-ticker-page__tier-name">Premium</span>
              <span className="number-ticker-page__tier-size">~2.0 KB</span>
            </div>
            <p className="number-ticker-page__tier-desc">
              Everything in Standard plus spring physics, overshoot animation,
              glow effects on value change, and scroll-triggered entrance.
            </p>
            <div className="number-ticker-page__tier-import">
              import {'{'} NumberTicker {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="number-ticker-page__tier-preview">
              <span className="number-ticker-page__medium-value">
                <NumberTicker value={42195} />
              </span>
            </div>
            <div className="number-ticker-page__size-breakdown">
              <div className="number-ticker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="number-ticker-page__section" id="brand-color">
        <h2 className="number-ticker-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          Pick a brand color to see the page theme update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={COLOR_PRESETS.map(p => p.hex)}
          />
          <div className="number-ticker-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`number-ticker-page__color-preset${brandColor === p.hex ? ' number-ticker-page__color-preset--active' : ''}`}
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
      <section className="number-ticker-page__section" id="props">
        <h2 className="number-ticker-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          All props accepted by NumberTicker. It also spreads any native {'<span>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={numberTickerProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="number-ticker-page__section" id="accessibility">
        <h2 className="number-ticker-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="number-ticker-page__section-desc">
          NumberTicker provides accessible numeric display with proper ARIA semantics.
        </p>
        <Card variant="default" padding="md">
          <ul className="number-ticker-page__a11y-list">
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA label:</strong> The full numeric value is exposed via <code className="number-ticker-page__a11y-key">aria-label</code> for screen readers.
              </span>
            </li>
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="number-ticker-page__a11y-key">role="img"</code> since the visual rolling animation is decorative.
              </span>
            </li>
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden digits:</strong> Individual digit columns are marked <code className="number-ticker-page__a11y-key">aria-hidden="true"</code> to prevent redundant announcements.
              </span>
            </li>
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="number-ticker-page__a11y-key">prefers-reduced-motion</code> — disables transitions entirely.
              </span>
            </li>
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Transitions are disabled in print media for a clean static render.
              </span>
            </li>
            <li className="number-ticker-page__a11y-item">
              <span className="number-ticker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular nums:</strong> Uses <code className="number-ticker-page__a11y-key">font-variant-numeric: tabular-nums</code> so digits don't shift layout.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
