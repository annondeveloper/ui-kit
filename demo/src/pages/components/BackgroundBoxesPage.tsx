'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { BackgroundBoxes } from '@ui/domain/background-boxes'
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
    @scope (.background-boxes-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: background-boxes-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .background-boxes-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .background-boxes-page__hero::before {
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
        animation: bg-boxes-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes bg-boxes-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .background-boxes-page__hero::before { animation: none; }
      }

      .background-boxes-page__title {
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

      .background-boxes-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .background-boxes-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .background-boxes-page__import-code {
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

      .background-boxes-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .background-boxes-page__section {
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
        animation: bg-boxes-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes bg-boxes-section-reveal {
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
        .background-boxes-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .background-boxes-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .background-boxes-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .background-boxes-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .background-boxes-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .background-boxes-page__preview {
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
        min-block-size: 200px;
      }

      .background-boxes-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .background-boxes-page__preview--tall {
        min-block-size: 300px;
      }

      /* ── Playground ─────────────────────────────────── */

      .background-boxes-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .background-boxes-page__playground {
          grid-template-columns: 1fr;
        }
        .background-boxes-page__playground-controls {
          position: static !important;
        }
      }

      @container background-boxes-page (max-width: 680px) {
        .background-boxes-page__playground {
          grid-template-columns: 1fr;
        }
        .background-boxes-page__playground-controls {
          position: static !important;
        }
      }

      .background-boxes-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .background-boxes-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 0;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .background-boxes-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .background-boxes-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .background-boxes-page__playground-controls {
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

      .background-boxes-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .background-boxes-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .background-boxes-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .background-boxes-page__option-btn {
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
      .background-boxes-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .background-boxes-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .background-boxes-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .background-boxes-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .background-boxes-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .background-boxes-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .background-boxes-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .background-boxes-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .background-boxes-page__tier-card {
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

      .background-boxes-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .background-boxes-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .background-boxes-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .background-boxes-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .background-boxes-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .background-boxes-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .background-boxes-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .background-boxes-page__tier-import {
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

      .background-boxes-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 80px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        position: relative;
      }

      /* ── Color picker ──────────────────────────────── */

      .background-boxes-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .background-boxes-page__color-preset {
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
      .background-boxes-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .background-boxes-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .background-boxes-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .background-boxes-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .background-boxes-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .background-boxes-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .background-boxes-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .background-boxes-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .background-boxes-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .background-boxes-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .background-boxes-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .background-boxes-page__hero {
          padding: 2rem 1.25rem;
        }

        .background-boxes-page__title {
          font-size: 1.75rem;
        }

        .background-boxes-page__preview {
          padding: 1.75rem;
        }

        .background-boxes-page__playground {
          grid-template-columns: 1fr;
        }

        .background-boxes-page__playground-result {
          padding: 2rem;
          min-block-size: 200px;
        }

        .background-boxes-page__labeled-row {
          gap: 1rem;
        }

        .background-boxes-page__tiers {
          grid-template-columns: 1fr;
        }

        .background-boxes-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .background-boxes-page__hero {
          padding: 1.5rem 1rem;
        }

        .background-boxes-page__title {
          font-size: 1.5rem;
        }

        .background-boxes-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .background-boxes-page__title {
          font-size: 4rem;
        }

        .background-boxes-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .background-boxes-page__import-code,
      .background-boxes-page code,
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

const backgroundBoxesProps: PropDef[] = [
  { name: 'rows', type: 'number', default: '15', description: 'Number of rows in the grid.' },
  { name: 'cols', type: 'number', default: '15', description: 'Number of columns in the grid.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered above the animated grid.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables animation entirely.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { BackgroundBoxes } from '@annondeveloper/ui-kit/domain'",
  standard: "import { BackgroundBoxes } from '@annondeveloper/ui-kit'",
  premium: "import { BackgroundBoxes } from '@annondeveloper/ui-kit/premium'",
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
      className="background-boxes-page__copy-btn"
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
    <div className="background-boxes-page__control-group">
      <span className="background-boxes-page__control-label">{label}</span>
      <div className="background-boxes-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`background-boxes-page__option-btn${opt === value ? ' background-boxes-page__option-btn--active' : ''}`}
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
  rows: number,
  cols: number,
  motion: number,
  hasChildren: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (rows !== 15) props.push(`  rows={${rows}}`)
  if (cols !== 15) props.push(`  cols={${cols}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = hasChildren
    ? `\n  <div style={{ textAlign: 'center', color: 'white' }}>\n    <h2>Your content here</h2>\n    <p>Overlaid on the animated grid</p>\n  </div>\n`
    : ''

  if (props.length === 0 && !hasChildren) {
    return `${importStr}\n\n<BackgroundBoxes />`
  }

  if (props.length === 0 && hasChildren) {
    return `${importStr}\n\n<BackgroundBoxes>${childContent}</BackgroundBoxes>`
  }

  return `${importStr}\n\n<BackgroundBoxes\n${props.join('\n')}\n>${childContent}</BackgroundBoxes>`
}

function generateHtmlCode(rows: number, cols: number): string {
  return `<!-- BackgroundBoxes — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/background-boxes.css">

<div class="ui-background-boxes" style="--boxes-rows: repeat(${rows}, 1fr); --boxes-cols: repeat(${cols}, 1fr); min-height: 300px;">
  <div class="ui-background-boxes--grid" aria-hidden="true">
    <!-- Grid cells are generated dynamically; for static use, add ${rows * cols} divs -->
  </div>
  <div class="ui-background-boxes--content">
    <h2>Your content here</h2>
  </div>
</div>`
}

function generateVueCode(tier: Tier, rows: number, cols: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (rows !== 15) props.push(`  :rows="${rows}"`)
  if (cols !== 15) props.push(`  :cols="${cols}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<template>
  <BackgroundBoxes${propsStr}>
    <div style="text-align: center; color: white">
      <h2>Your content here</h2>
    </div>
  </BackgroundBoxes>
</template>

<script setup>
import { BackgroundBoxes } from '${importPath}'
</script>`
}

function generateAngularCode(rows: number, cols: number): string {
  return `<!-- Angular — Use CSS-only approach or React wrapper -->
<div
  class="ui-background-boxes"
  style="--boxes-rows: repeat(${rows}, 1fr); --boxes-cols: repeat(${cols}, 1fr); min-height: 300px;"
>
  <div class="ui-background-boxes--grid" aria-hidden="true">
    <div *ngFor="let box of boxes" class="ui-background-boxes--box"
      [style.--box-delay.s]="box.delay"
      [style.--box-duration.s]="box.duration"
      [style.--box-intensity]="box.intensity">
    </div>
  </div>
  <div class="ui-background-boxes--content">
    <h2>Your content here</h2>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/background-boxes.css';`
}

function generateSvelteCode(tier: Tier, rows: number, cols: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (rows !== 15) props.push(`  rows={${rows}}`)
  if (cols !== 15) props.push(`  cols={${cols}}`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>
  import { BackgroundBoxes } from '${importPath}';
</script>

<BackgroundBoxes${propsStr}>
  <div style="text-align: center; color: white">
    <h2>Your content here</h2>
  </div>
</BackgroundBoxes>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [rows, setRows] = useState(15)
  const [cols, setCols] = useState(15)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [hasChildren, setHasChildren] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, rows, cols, motion, hasChildren),
    [tier, rows, cols, motion, hasChildren],
  )

  const htmlCode = useMemo(() => generateHtmlCode(rows, cols), [rows, cols])
  const vueCode = useMemo(() => generateVueCode(tier, rows, cols), [tier, rows, cols])
  const angularCode = useMemo(() => generateAngularCode(rows, cols), [rows, cols])
  const svelteCode = useMemo(() => generateSvelteCode(tier, rows, cols), [tier, rows, cols])

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
    <section className="background-boxes-page__section" id="playground">
      <h2 className="background-boxes-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="background-boxes-page__section-desc">
        Tweak grid dimensions and motion settings to see the animated background in real-time.
      </p>

      <div className="background-boxes-page__playground">
        <div className="background-boxes-page__playground-preview">
          <div className="background-boxes-page__playground-result">
            <BackgroundBoxes
              rows={rows}
              cols={cols}
              motion={motion}
              style={{ width: '100%', height: '100%', minHeight: '300px' }}
            >
              {hasChildren && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                    Content Overlay
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Your content renders above the animated grid
                  </p>
                </div>
              )}
            </BackgroundBoxes>
          </div>

          <div className="background-boxes-page__code-tabs">
            <div className="background-boxes-page__export-row">
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
              {copyStatus && <span className="background-boxes-page__export-status">{copyStatus}</span>}
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

        <div className="background-boxes-page__playground-controls">
          <OptionGroup
            label="Rows"
            options={['5', '10', '15', '20', '25'] as const}
            value={String(rows)}
            onChange={v => setRows(Number(v))}
          />
          <OptionGroup
            label="Columns"
            options={['5', '10', '15', '20', '25'] as const}
            value={String(cols)}
            onChange={v => setCols(Number(v))}
          />
          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <div className="background-boxes-page__control-group">
            <span className="background-boxes-page__control-label">Content</span>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={e => setHasChildren(e.target.checked)}
                style={{ accentColor: 'var(--brand)' }}
              />
              Show overlay content
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BackgroundBoxesPage() {
  useStyles('background-boxes-page', pageStyles)

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

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.background-boxes-page__section')
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
    <div className="background-boxes-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="background-boxes-page__hero">
        <h1 className="background-boxes-page__title">BackgroundBoxes</h1>
        <p className="background-boxes-page__desc">
          An animated grid of pulsing boxes that creates a mesmerizing background effect.
          Each cell animates independently with deterministic pseudo-random timing for
          consistent visual results across renders.
        </p>
        <div className="background-boxes-page__import-row">
          <code className="background-boxes-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Grid Density ─────────────────────────────── */}
      <section className="background-boxes-page__section" id="density">
        <h2 className="background-boxes-page__section-title">
          <a href="#density">Grid Density</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          Control the visual density by adjusting rows and columns. Fewer cells create
          a bold, architectural feel; more cells create a subtle, fabric-like texture.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="background-boxes-page__labeled-row" style={{ justifyContent: 'center' }}>
            <div className="background-boxes-page__labeled-item">
              <div style={{ width: 200, height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <BackgroundBoxes rows={5} cols={5} style={{ width: '100%', height: '100%' }} />
              </div>
              <span className="background-boxes-page__item-label">5 x 5</span>
            </div>
            <div className="background-boxes-page__labeled-item">
              <div style={{ width: 200, height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <BackgroundBoxes rows={10} cols={10} style={{ width: '100%', height: '100%' }} />
              </div>
              <span className="background-boxes-page__item-label">10 x 10</span>
            </div>
            <div className="background-boxes-page__labeled-item">
              <div style={{ width: 200, height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <BackgroundBoxes rows={20} cols={20} style={{ width: '100%', height: '100%' }} />
              </div>
              <span className="background-boxes-page__item-label">20 x 20</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ────────────────────────────── */}
      <section className="background-boxes-page__section" id="motion">
        <h2 className="background-boxes-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          Four motion levels control animation intensity. Level 0 shows a static grid with
          faint background, while level 3 delivers the full cinematic pulsing effect.
          Respects <code className="background-boxes-page__a11y-key">prefers-reduced-motion</code> automatically.
        </p>
        <div className="background-boxes-page__labeled-row" style={{ justifyContent: 'center' }}>
          {([0, 1, 2, 3] as const).map(level => (
            <div key={level} className="background-boxes-page__labeled-item">
              <div style={{ width: 160, height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <BackgroundBoxes rows={8} cols={8} motion={level} style={{ width: '100%', height: '100%' }} />
              </div>
              <span className="background-boxes-page__item-label">motion={level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. With Content Overlay ─────────────────────── */}
      <section className="background-boxes-page__section" id="content-overlay">
        <h2 className="background-boxes-page__section-title">
          <a href="#content-overlay">Content Overlay</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          Use the children prop to render any content above the animated grid. The content
          layer sits at z-index 1 while the grid stays at z-index 0.
        </p>
        <div className="background-boxes-page__preview background-boxes-page__preview--tall" style={{ padding: 0 }}>
          <BackgroundBoxes rows={12} cols={12} style={{ width: '100%', height: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
                Build something amazing
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base, 1rem)', maxWidth: '40ch', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                BackgroundBoxes provides atmospheric depth to hero sections, landing pages, and feature showcases.
              </p>
              <Button variant="primary" icon={<Icon name="zap" size="sm" />}>Get Started</Button>
            </div>
          </BackgroundBoxes>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<BackgroundBoxes rows={12} cols={12}>
  <div style={{ textAlign: 'center' }}>
    <h2>Build something amazing</h2>
    <p>Your content renders above the grid</p>
    <Button>Get Started</Button>
  </div>
</BackgroundBoxes>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="background-boxes-page__section" id="tiers">
        <h2 className="background-boxes-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          BackgroundBoxes ships with the same three-tier architecture. The Lite tier provides
          the CSS-only grid with static styling, Standard adds the full animation engine, and
          Premium includes enhanced glow effects and color cycling.
        </p>

        <div className="background-boxes-page__tiers">
          {/* Lite */}
          <div
            className={`background-boxes-page__tier-card${tier === 'lite' ? ' background-boxes-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="background-boxes-page__tier-header">
              <span className="background-boxes-page__tier-name">Lite</span>
              <span className="background-boxes-page__tier-size">~0.5 KB</span>
            </div>
            <p className="background-boxes-page__tier-desc">
              CSS-only grid with static pulse animation. No JavaScript animation engine.
              Pure CSS keyframes for the box pulse effect.
            </p>
            <div className="background-boxes-page__tier-import">
              import {'{'} BackgroundBoxes {'}'} from '@annondeveloper/ui-kit/domain'
            </div>
            <div className="background-boxes-page__tier-preview">
              <BackgroundBoxes rows={6} cols={6} motion={0} style={{ width: '100%', height: '100%', minHeight: 80 }} />
            </div>
            <div className="background-boxes-page__size-breakdown">
              <div className="background-boxes-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`background-boxes-page__tier-card${tier === 'standard' ? ' background-boxes-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="background-boxes-page__tier-header">
              <span className="background-boxes-page__tier-name">Standard</span>
              <span className="background-boxes-page__tier-size">~1.8 KB</span>
            </div>
            <p className="background-boxes-page__tier-desc">
              Full animation engine with deterministic pseudo-random delays,
              motion level support, and content overlay z-indexing.
            </p>
            <div className="background-boxes-page__tier-import">
              import {'{'} BackgroundBoxes {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="background-boxes-page__tier-preview">
              <BackgroundBoxes rows={6} cols={6} style={{ width: '100%', height: '100%', minHeight: 80 }} />
            </div>
            <div className="background-boxes-page__size-breakdown">
              <div className="background-boxes-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`background-boxes-page__tier-card${tier === 'premium' ? ' background-boxes-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="background-boxes-page__tier-header">
              <span className="background-boxes-page__tier-name">Premium</span>
              <span className="background-boxes-page__tier-size">~3.2 KB</span>
            </div>
            <p className="background-boxes-page__tier-desc">
              Everything in Standard plus enhanced OKLCH color cycling,
              mouse-proximity glow, and intensity variance per cell.
            </p>
            <div className="background-boxes-page__tier-import">
              import {'{'} BackgroundBoxes {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="background-boxes-page__tier-preview">
              <BackgroundBoxes rows={6} cols={6} style={{ width: '100%', height: '100%', minHeight: 80 }} />
            </div>
            <div className="background-boxes-page__size-breakdown">
              <div className="background-boxes-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="background-boxes-page__section" id="brand-color">
        <h2 className="background-boxes-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="background-boxes-page__section-desc">
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
          <div className="background-boxes-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`background-boxes-page__color-preset${brandColor === p.hex ? ' background-boxes-page__color-preset--active' : ''}`}
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
      <section className="background-boxes-page__section" id="props">
        <h2 className="background-boxes-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          All props accepted by BackgroundBoxes. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={backgroundBoxesProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="background-boxes-page__section" id="accessibility">
        <h2 className="background-boxes-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="background-boxes-page__section-desc">
          BackgroundBoxes is a decorative component designed to be invisible to assistive technology.
        </p>
        <Card variant="default" padding="md">
          <ul className="background-boxes-page__a11y-list">
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> Grid is marked with <code className="background-boxes-page__a11y-key">aria-hidden="true"</code> so screen readers skip it entirely.
              </span>
            </li>
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="background-boxes-page__a11y-key">prefers-reduced-motion</code> by disabling all animations and showing a static grid.
              </span>
            </li>
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children render at z-index 1 above the grid, maintaining proper reading order and keyboard navigation.
              </span>
            </li>
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Grid is hidden in <code className="background-boxes-page__a11y-key">forced-colors: active</code> mode to avoid visual noise.
              </span>
            </li>
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Grid is hidden in print media to save ink and avoid rendering artifacts.
              </span>
            </li>
            <li className="background-boxes-page__a11y-item">
              <span className="background-boxes-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pointer events:</strong> Grid cells have <code className="background-boxes-page__a11y-key">pointer-events: none</code> so clicks pass through to content.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
