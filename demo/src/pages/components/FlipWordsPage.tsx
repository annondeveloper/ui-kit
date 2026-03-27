'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { FlipWords } from '@ui/domain/flip-words'
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
    @scope (.flip-words-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: flip-words-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .flip-words-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .flip-words-page__hero::before {
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
        animation: flip-words-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes flip-words-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .flip-words-page__hero::before { animation: none; }
      }

      .flip-words-page__title {
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

      .flip-words-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .flip-words-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .flip-words-page__import-code {
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

      .flip-words-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .flip-words-page__section {
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
        animation: flip-words-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes flip-words-section-reveal {
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
        .flip-words-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .flip-words-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .flip-words-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .flip-words-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .flip-words-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .flip-words-page__preview {
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

      .flip-words-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .flip-words-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .flip-words-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .flip-words-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .flip-words-page__playground {
          grid-template-columns: 1fr;
        }
        .flip-words-page__playground-controls {
          position: static !important;
        }
      }

      @container flip-words-page (max-width: 680px) {
        .flip-words-page__playground {
          grid-template-columns: 1fr;
        }
        .flip-words-page__playground-controls {
          position: static !important;
        }
      }

      .flip-words-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .flip-words-page__playground-result {
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

      .flip-words-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .flip-words-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .flip-words-page__playground-controls {
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

      .flip-words-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .flip-words-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .flip-words-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .flip-words-page__option-btn {
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
      .flip-words-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .flip-words-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .flip-words-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .flip-words-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .flip-words-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .flip-words-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .flip-words-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .flip-words-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .flip-words-page__tier-card {
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

      .flip-words-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .flip-words-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .flip-words-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .flip-words-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .flip-words-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .flip-words-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .flip-words-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .flip-words-page__tier-import {
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

      .flip-words-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .flip-words-page__code-tabs {
        margin-block-start: 1rem;
      }

      .flip-words-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .flip-words-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .flip-words-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .flip-words-page__color-preset {
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
      .flip-words-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .flip-words-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .flip-words-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .flip-words-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .flip-words-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .flip-words-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .flip-words-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .flip-words-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .flip-words-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .flip-words-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .flip-words-page__hero {
          padding: 2rem 1.25rem;
        }

        .flip-words-page__title {
          font-size: 1.75rem;
        }

        .flip-words-page__preview {
          padding: 1.75rem;
        }

        .flip-words-page__playground {
          grid-template-columns: 1fr;
        }

        .flip-words-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .flip-words-page__labeled-row {
          gap: 1rem;
        }

        .flip-words-page__tiers {
          grid-template-columns: 1fr;
        }

        .flip-words-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .flip-words-page__hero {
          padding: 1.5rem 1rem;
        }

        .flip-words-page__title {
          font-size: 1.5rem;
        }

        .flip-words-page__preview {
          padding: 1rem;
        }

        .flip-words-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .flip-words-page__title {
          font-size: 4rem;
        }

        .flip-words-page__preview {
          padding: 3.5rem;
        }

        .flip-words-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .flip-words-page__import-code,
      .flip-words-page code,
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

const flipWordsProps: PropDef[] = [
  { name: 'words', type: 'string[]', description: 'Array of words to cycle through with the flip animation.' },
  { name: 'interval', type: 'number', default: '3000', description: 'Time in milliseconds between word transitions.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 = static (shows first word), 3 = full 3D flip.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { FlipWords } from '@annondeveloper/ui-kit/lite'",
  standard: "import { FlipWords } from '@annondeveloper/ui-kit'",
  premium: "import { FlipWords } from '@annondeveloper/ui-kit/premium'",
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

const WORD_PRESETS = {
  actions: ['build', 'deploy', 'scale', 'ship'],
  adjectives: ['beautiful', 'powerful', 'elegant', 'blazing'],
  tech: ['React', 'Vue', 'Svelte', 'Angular'],
  emotions: ['inspired', 'motivated', 'focused', 'creative'],
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="flip-words-page__copy-btn"
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
    <div className="flip-words-page__control-group">
      <span className="flip-words-page__control-label">{label}</span>
      <div className="flip-words-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`flip-words-page__option-btn${opt === value ? ' flip-words-page__option-btn--active' : ''}`}
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
  words: string[],
  interval: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const wordsStr = `[${words.map(w => `'${w}'`).join(', ')}]`
  const props: string[] = []
  props.push(`  words={${wordsStr}}`)
  if (interval !== 3000) props.push(`  interval={${interval}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = `<FlipWords\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(words: string[]): string {
  return `<!-- FlipWords uses 3D CSS transforms + JS cycling -->
<!-- For non-React frameworks, use CSS-only approach: -->
<span class="ui-flip-words" aria-live="polite" aria-atomic="true">
  <span class="ui-flip-words--word" data-state="visible">
    ${words[0] || 'word'}
  </span>
</span>

<!-- Import component CSS -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/flip-words.css">

<!-- Word cycling requires JavaScript -->`
}

function generateVueCode(tier: Tier, words: string[], interval: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const wordsStr = `[${words.map(w => `'${w}'`).join(', ')}]`
  const attrs: string[] = [`  :words="${wordsStr}"`]
  if (interval !== 3000) attrs.push(`  :interval="${interval}"`)

  return `<template>\n  <FlipWords\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { FlipWords } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, words: string[], interval: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — FlipWords component -->
<span
  class="ui-flip-words"
  aria-live="polite"
  aria-atomic="true"
>
  <span class="ui-flip-words--word" [attr.data-state]="state">
    {{ currentWord }}
  </span>
</span>

/* Import component CSS */
@import '${importPath}/css/components/flip-words.css';`
}

function generateSvelteCode(tier: Tier, words: string[], interval: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const wordsStr = `[${words.map(w => `'${w}'`).join(', ')}]`
  const attrs: string[] = [`  words={${wordsStr}}`]
  if (interval !== 3000) attrs.push(`  interval={${interval}}`)

  return `<script>\n  import { FlipWords } from '${importPath}';\n</script>\n\n<FlipWords\n${attrs.join('\n')}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [words, setWords] = useState<string[]>(['build', 'deploy', 'scale', 'ship'])
  const [interval, setInterval_] = useState(3000)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [wordPreset, setWordPreset] = useState<keyof typeof WORD_PRESETS>('actions')

  const reactCode = useMemo(
    () => generateReactCode(tier, words, interval, motion),
    [tier, words, interval, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(words),
    [words],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, words, interval),
    [tier, words, interval],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, words, interval),
    [tier, words, interval],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, words, interval),
    [tier, words, interval],
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
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="flip-words-page__section" id="playground">
      <h2 className="flip-words-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="flip-words-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="flip-words-page__playground">
        <div className="flip-words-page__playground-preview">
          <div className="flip-words-page__playground-result">
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, position: 'relative' }}>
              We{' '}
              <FlipWords
                words={words}
                interval={interval}
                motion={motion}
              />
              {' '}software
            </span>
          </div>

          <div className="flip-words-page__code-tabs">
            <div className="flip-words-page__export-row">
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
              {copyStatus && <span className="flip-words-page__export-status">{copyStatus}</span>}
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

        <div className="flip-words-page__playground-controls">
          <div className="flip-words-page__control-group">
            <span className="flip-words-page__control-label">Word Preset</span>
            <div className="flip-words-page__control-options">
              {(Object.keys(WORD_PRESETS) as (keyof typeof WORD_PRESETS)[]).map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={`flip-words-page__option-btn${wordPreset === preset ? ' flip-words-page__option-btn--active' : ''}`}
                  onClick={() => {
                    setWordPreset(preset)
                    setWords(WORD_PRESETS[preset])
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <OptionGroup
            label="Interval (ms)"
            options={['1500', '2000', '3000', '5000'] as const}
            value={String(interval) as '1500' | '2000' | '3000' | '5000'}
            onChange={v => setInterval_(Number(v))}
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

export default function FlipWordsPage() {
  useStyles('flip-words-page', pageStyles)

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
    const sections = document.querySelectorAll('.flip-words-page__section')
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
    <div className="flip-words-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="flip-words-page__hero">
        <h1 className="flip-words-page__title">FlipWords</h1>
        <p className="flip-words-page__desc">
          Rotating word carousel with 3D perspective flip transitions. Cycles through an array of
          words at a configurable interval with smooth rotateX animations and aria-live announcements.
        </p>
        <div className="flip-words-page__import-row">
          <code className="flip-words-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Interval Variations ─────────────────────── */}
      <section className="flip-words-page__section" id="intervals">
        <h2 className="flip-words-page__section-title">
          <a href="#intervals">Interval Speeds</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Control the pace of word rotation with the interval prop. Faster intervals create urgency
          and energy, while slower ones feel more contemplative and readable.
        </p>
        <div className="flip-words-page__preview flip-words-page__preview--col" style={{ gap: '2rem' }}>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Fast: We <FlipWords words={['build', 'deploy', 'scale']} interval={1500} /> apps
            </span>
            <span className="flip-words-page__item-label">interval={'{1500}'}</span>
          </div>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Default: We <FlipWords words={['build', 'deploy', 'scale']} interval={3000} /> apps
            </span>
            <span className="flip-words-page__item-label">interval={'{3000}'} (default)</span>
          </div>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Slow: We <FlipWords words={['build', 'deploy', 'scale']} interval={5000} /> apps
            </span>
            <span className="flip-words-page__item-label">interval={'{5000}'}</span>
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ───────────────────────────── */}
      <section className="flip-words-page__section" id="motion">
        <h2 className="flip-words-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Motion intensity cascades from OS preference through component prop. Level 0 shows only
          the first word with no animation. Levels 1-3 enable the 3D flip transition.
        </p>
        <div className="flip-words-page__preview flip-words-page__preview--col" style={{ gap: '1.5rem' }}>
          {([0, 1, 2, 3] as const).map(m => (
            <div key={m} className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                <FlipWords words={['beautiful', 'powerful', 'elegant']} motion={m} interval={2500} />
              </span>
              <span className="flip-words-page__item-label">motion={m} {m === 0 ? '(static)' : m === 3 ? '(full 3D flip)' : ''}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Inline Usage ───────────────────────────── */}
      <section className="flip-words-page__section" id="inline">
        <h2 className="flip-words-page__section-title">
          <a href="#inline">Inline Usage</a>
        </h2>
        <p className="flip-words-page__section-desc">
          FlipWords renders as an inline-block span so it flows naturally within sentences.
          Use it in headings, paragraphs, or any inline text context.
        </p>
        <div className="flip-words-page__preview flip-words-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Hero headline</span>
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              The <FlipWords words={['fastest', 'smartest', 'safest']} interval={2500} /> way to ship
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Paragraph text</span>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxInlineSize: '50ch' }}>
              Our platform helps teams <FlipWords words={['collaborate', 'innovate', 'iterate']} interval={3000} /> with
              confidence. Built for modern development workflows.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Badge-style</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-surface)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              Status: <FlipWords words={['Active', 'Running', 'Healthy']} interval={2000} />
            </span>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<h1>The <FlipWords words={['fastest', 'smartest']} /> way to ship</h1>\n\n<p>Our team helps you <FlipWords words={['build', 'deploy']} interval={2000} /> better.</p>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Word Count Variations ──────────────────── */}
      <section className="flip-words-page__section" id="word-count">
        <h2 className="flip-words-page__section-title">
          <a href="#word-count">Word Count Variations</a>
        </h2>
        <p className="flip-words-page__section-desc">
          FlipWords works with any number of words. A single word displays statically, two words
          creates a toggle effect, and larger arrays create a rotating carousel.
        </p>
        <div className="flip-words-page__preview flip-words-page__preview--col" style={{ gap: '1.5rem' }}>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              <FlipWords words={['Single']} interval={3000} />
            </span>
            <span className="flip-words-page__item-label">1 word (static)</span>
          </div>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              <FlipWords words={['Yes', 'No']} interval={2000} />
            </span>
            <span className="flip-words-page__item-label">2 words (toggle)</span>
          </div>
          <div className="flip-words-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              <FlipWords words={['React', 'Vue', 'Svelte', 'Angular', 'Solid']} interval={2000} />
            </span>
            <span className="flip-words-page__item-label">5 words (carousel)</span>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="flip-words-page__section" id="tiers">
        <h2 className="flip-words-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier provides a static
          display showing only the first word, Standard adds the full flip animation, and Premium
          adds enhanced transitions with blur effects and color-shifting text.
        </p>

        <div className="flip-words-page__tiers">
          {/* Lite */}
          <div
            className={`flip-words-page__tier-card${tier === 'lite' ? ' flip-words-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="flip-words-page__tier-header">
              <span className="flip-words-page__tier-name">Lite</span>
              <span className="flip-words-page__tier-size">~0.2 KB</span>
            </div>
            <p className="flip-words-page__tier-desc">
              Static display showing only the first word. No animation, no interval cycling.
              Useful for SSR scenarios where the first word is the most important.
            </p>
            <div className="flip-words-page__tier-import">
              import {'{'} FlipWords {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="flip-words-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                build
              </span>
            </div>
            <div className="flip-words-page__size-breakdown">
              <div className="flip-words-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`flip-words-page__tier-card${tier === 'standard' ? ' flip-words-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="flip-words-page__tier-header">
              <span className="flip-words-page__tier-name">Standard</span>
              <span className="flip-words-page__tier-size">~1.5 KB</span>
            </div>
            <p className="flip-words-page__tier-desc">
              Full 3D perspective flip animation with configurable interval and motion levels.
              Uses CSS rotateX transitions with proper entering/exiting states.
            </p>
            <div className="flip-words-page__tier-import">
              import {'{'} FlipWords {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="flip-words-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                <FlipWords words={['build', 'deploy', 'scale']} interval={2500} />
              </span>
            </div>
            <div className="flip-words-page__size-breakdown">
              <div className="flip-words-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`flip-words-page__tier-card${tier === 'premium' ? ' flip-words-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="flip-words-page__tier-header">
              <span className="flip-words-page__tier-name">Premium</span>
              <span className="flip-words-page__tier-size">~2.5 KB</span>
            </div>
            <p className="flip-words-page__tier-desc">
              Everything in Standard plus blur-out effect during transitions, character-level
              stagger animation, and OKLCH color shifting between words for a cinematic feel.
            </p>
            <div className="flip-words-page__tier-import">
              import {'{'} FlipWords {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="flip-words-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                <FlipWords words={['build', 'deploy', 'scale']} interval={2500} />
              </span>
            </div>
            <div className="flip-words-page__size-breakdown">
              <div className="flip-words-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ────────────────────────────── */}
      <section className="flip-words-page__section" id="brand-color">
        <h2 className="flip-words-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Pick a brand color to see FlipWords update in real-time. The OKLCH-based theme system
          generates derived aurora and glow colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="flip-words-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`flip-words-page__color-preset${brandColor === p.hex ? ' flip-words-page__color-preset--active' : ''}`}
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

      {/* ── 9. Use Cases ──────────────────────────────── */}
      <section className="flip-words-page__section" id="use-cases">
        <h2 className="flip-words-page__section-title">
          <a href="#use-cases">Use Cases</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Real-world scenarios where FlipWords enhances user engagement and communication.
        </p>
        <div className="flip-words-page__preview flip-words-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Landing page hero</span>
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Build <FlipWords words={['beautiful', 'accessible', 'performant']} interval={2500} /> interfaces
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Feature highlight</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Supports <FlipWords words={['React', 'Vue', 'Svelte', 'Angular', 'vanilla JS']} interval={2000} /> out of the box
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Dynamic greeting</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Good <FlipWords words={['morning', 'afternoon', 'evening']} interval={3000} />, developer
            </span>
          </div>
        </div>
      </section>

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="flip-words-page__section" id="props">
        <h2 className="flip-words-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="flip-words-page__section-desc">
          All props accepted by FlipWords. It also spreads any native span HTML attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={flipWordsProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="flip-words-page__section" id="accessibility">
        <h2 className="flip-words-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="flip-words-page__section-desc">
          Designed with screen reader support and motion sensitivity in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="flip-words-page__a11y-list">
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Uses <code className="flip-words-page__a11y-key">aria-live="polite"</code> to announce word changes to screen readers without interrupting current speech.
              </span>
            </li>
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Atomic:</strong> <code className="flip-words-page__a11y-key">aria-atomic="true"</code> ensures the entire word is announced as a unit, not character-by-character.
              </span>
            </li>
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="flip-words-page__a11y-key">prefers-reduced-motion</code> by removing transforms and transitions. Word still changes but without animation.
              </span>
            </li>
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion 0:</strong> When motion is set to 0, cycling stops entirely and only the first word is displayed statically.
              </span>
            </li>
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Backface hidden:</strong> Uses <code className="flip-words-page__a11y-key">backface-visibility: hidden</code> to prevent rendering artifacts during 3D rotation.
              </span>
            </li>
            <li className="flip-words-page__a11y-item">
              <span className="flip-words-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Animation is disabled in print media, showing the current word without transforms.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 12. Source ──────────────────────────────────── */}
      <section className="flip-words-page__section" id="source">
        <h2 className="flip-words-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="flip-words-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          className="flip-words-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/flip-words.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="github" size="sm" />
          src/domain/flip-words.tsx
        </a>
      </section>
    </div>
  )
}
