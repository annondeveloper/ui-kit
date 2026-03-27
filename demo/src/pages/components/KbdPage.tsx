'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Kbd } from '@ui/components/kbd'
import { Kbd as LiteKbd } from '@ui/lite/kbd'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.kbd-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: kbd-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .kbd-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .kbd-page__hero::before {
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
        animation: kbd-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes kbd-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .kbd-page__hero::before { animation: none; }
      }

      .kbd-page__title {
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

      .kbd-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .kbd-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .kbd-page__import-code {
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

      .kbd-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .kbd-page__section {
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
        animation: kbd-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes kbd-section-reveal {
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
        .kbd-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .kbd-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .kbd-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .kbd-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .kbd-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .kbd-page__preview {
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

      .kbd-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .kbd-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .kbd-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .kbd-page__playground {
          grid-template-columns: 1fr;
        }
        .kbd-page__playground-controls {
          position: static !important;
        }
      }

      @container kbd-page (max-width: 680px) {
        .kbd-page__playground {
          grid-template-columns: 1fr;
        }
        .kbd-page__playground-controls {
          position: static !important;
        }
      }

      .kbd-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .kbd-page__playground-result {
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

      .kbd-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .kbd-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .kbd-page__playground-controls {
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

      .kbd-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .kbd-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .kbd-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .kbd-page__option-btn {
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
      .kbd-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .kbd-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .kbd-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .kbd-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .kbd-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .kbd-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .kbd-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Shortcut combos ─────────────────────────────── */

      .kbd-page__shortcut-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .kbd-page__shortcut-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .kbd-page__shortcut-keys {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .kbd-page__shortcut-plus {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .kbd-page__shortcut-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .kbd-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .kbd-page__tier-card {
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

      .kbd-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .kbd-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .kbd-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .kbd-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .kbd-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .kbd-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .kbd-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .kbd-page__tier-import {
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

      .kbd-page__tier-preview {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .kbd-page__code-tabs {
        margin-block-start: 1rem;
      }

      .kbd-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .kbd-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .kbd-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .kbd-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .kbd-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .kbd-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ────────────────────────────── */

      .kbd-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .kbd-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .kbd-page__hero {
          padding: 2rem 1.25rem;
        }

        .kbd-page__title {
          font-size: 1.75rem;
        }

        .kbd-page__preview {
          padding: 1.75rem;
        }

        .kbd-page__playground {
          grid-template-columns: 1fr;
        }

        .kbd-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .kbd-page__tiers {
          grid-template-columns: 1fr;
        }

        .kbd-page__section {
          padding: 1.25rem;
        }

        .kbd-page__shortcut-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .kbd-page__hero {
          padding: 1.5rem 1rem;
        }

        .kbd-page__title {
          font-size: 1.5rem;
        }

        .kbd-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .kbd-page__title {
          font-size: 4rem;
        }

        .kbd-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .kbd-page__import-code,
      .kbd-page code,
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

const kbdProps: PropDef[] = [
  { name: 'size', type: "'xs' | 'sm' | 'md'", default: "'sm'", description: 'Size controlling font-size, padding, and minimum dimensions.' },
  { name: 'variant', type: "'default' | 'ghost'", default: "'default'", description: 'Visual variant. Default has border and shadow, ghost is transparent.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. Level 2+ enables hover lift effect.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Key label content (single key or symbol).' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying <kbd> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md'
type Variant = 'default' | 'ghost'

const SIZES: Size[] = ['xs', 'sm', 'md']
const VARIANTS: Variant[] = ['default', 'ghost']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Kbd } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Kbd } from '@annondeveloper/ui-kit'",
  premium: "import { Kbd } from '@annondeveloper/ui-kit/premium'",
}

interface ShortcutCombo {
  keys: string[]
  description: string
}

const SHORTCUT_COMBOS: ShortcutCombo[] = [
  { keys: ['Cmd', 'K'], description: 'Command palette' },
  { keys: ['Ctrl', 'C'], description: 'Copy selection' },
  { keys: ['Ctrl', 'V'], description: 'Paste clipboard' },
  { keys: ['Ctrl', 'Z'], description: 'Undo action' },
  { keys: ['Ctrl', 'Shift', 'P'], description: 'Command prompt' },
  { keys: ['Alt', 'Tab'], description: 'Switch window' },
  { keys: ['Ctrl', 'S'], description: 'Save file' },
  { keys: ['Esc'], description: 'Close / Cancel' },
  { keys: ['Enter'], description: 'Confirm / Submit' },
  { keys: ['Tab'], description: 'Next focus' },
  { keys: ['Shift', 'Tab'], description: 'Previous focus' },
  { keys: ['Ctrl', 'F'], description: 'Find in page' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="kbd-page__copy-btn"
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
    <div className="kbd-page__control-group">
      <span className="kbd-page__control-label">{label}</span>
      <div className="kbd-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`kbd-page__option-btn${opt === value ? ' kbd-page__option-btn--active' : ''}`}
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

function generateReactCode(tier: Tier, size: Size, variant: Variant, content: string): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'sm') props.push(`  size="${size}"`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)

  const jsx = props.length === 0
    ? `<Kbd>${content}</Kbd>`
    : `<Kbd\n${props.join('\n')}\n>${content}</Kbd>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size, variant: Variant, content: string): string {
  const className = tier === 'lite' ? 'ui-lite-kbd' : 'ui-kbd'
  const attrs = [`class="${className}"`, `data-size="${size}"`, `data-variant="${variant}"`]
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/kbd.css';`

  return `<!-- Kbd -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/kbd.css'}">

<kbd ${attrs.join(' ')}>
  ${content}
</kbd>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, size: Size, variant: Variant, content: string): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-kbd"`, `data-size="${size}"`, `data-variant="${variant}"`]
    return `<template>\n  <kbd ${attrs.join(' ')}>${content}</kbd>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'sm') attrs.push(`  size="${size}"`)
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)

  const template = attrs.length === 0
    ? `  <Kbd>${content}</Kbd>`
    : `  <Kbd\n  ${attrs.join('\n  ')}\n  >${content}</Kbd>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Kbd } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, size: Size, variant: Variant, content: string): string {
  const className = tier === 'lite' ? 'ui-lite-kbd' : 'ui-kbd'
  const attrs = [`class="${className}"`, `data-size="${size}"`, `data-variant="${variant}"`]
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite/styles.css' : '@annondeveloper/ui-kit/css/components/kbd.css'

  return `<!-- Angular -- ${tier} tier -->\n<kbd ${attrs.join(' ')}>${content}</kbd>\n\n/* In styles.css */\n@import '${importPath}';`
}

function generateSvelteCode(tier: Tier, size: Size, variant: Variant, content: string): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-kbd"`, `data-size="${size}"`, `data-variant="${variant}"`]
    return `<kbd ${attrs.join(' ')}>${content}</kbd>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  return `<script>\n  import { Kbd } from '@annondeveloper/ui-kit';\n</script>\n\n<Kbd\n  size="${size}"\n  variant="${variant}"\n>\n  ${content}\n</Kbd>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('sm')
  const [variant, setVariant] = useState<Variant>('default')
  const [content, setContent] = useState('K')
  const [copyStatus, setCopyStatus] = useState('')

  const KbdComponent = tier === 'lite' ? LiteKbd : Kbd

  const reactCode = useMemo(
    () => generateReactCode(tier, size, variant, content),
    [tier, size, variant, content],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, variant, content),
    [tier, size, variant, content],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, size, variant, content),
    [tier, size, variant, content],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, size, variant, content),
    [tier, size, variant, content],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, variant, content),
    [tier, size, variant, content],
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
    <section className="kbd-page__section" id="playground">
      <h2 className="kbd-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="kbd-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="kbd-page__playground">
        <div className="kbd-page__playground-preview">
          <div className="kbd-page__playground-result">
            <KbdComponent size={size} variant={variant}>{content}</KbdComponent>
          </div>

          <div className="kbd-page__code-tabs">
            <div className="kbd-page__export-row">
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
              {copyStatus && <span className="kbd-page__export-status">{copyStatus}</span>}
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

        <div className="kbd-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />

          <div className="kbd-page__control-group">
            <span className="kbd-page__control-label">Content</span>
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="kbd-page__text-input"
              placeholder="Key label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KbdPage() {
  useStyles('kbd-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  const KbdComponent = tier === 'lite' ? LiteKbd : Kbd

  // Scroll reveal for sections -- JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.kbd-page__section')
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
    <div className="kbd-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="kbd-page__hero">
        <h1 className="kbd-page__title">Kbd</h1>
        <p className="kbd-page__desc">
          Inline keyboard key indicator with realistic key-cap styling, hover lift animation,
          and ghost variant. Perfect for documenting shortcuts and keyboard interactions.
        </p>
        <div className="kbd-page__import-row">
          <code className="kbd-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ────────────────────────────────── */}
      <section className="kbd-page__section" id="sizes">
        <h2 className="kbd-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="kbd-page__section-desc">
          Three sizes for different contexts: xs for compact inline use, sm for standard body text,
          and md for prominent standalone keys.
        </p>
        <div className="kbd-page__preview">
          <div className="kbd-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="kbd-page__labeled-item">
                <KbdComponent size={s}>Esc</KbdComponent>
                <span className="kbd-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Variants ────────────────────────────────── */}
      <section className="kbd-page__section" id="variants">
        <h2 className="kbd-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="kbd-page__section-desc">
          Default variant shows a raised key-cap with border and shadow. Ghost variant is transparent
          for inline text use without visual emphasis.
        </p>
        <div className="kbd-page__preview">
          <div className="kbd-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="kbd-page__labeled-item">
                <KbdComponent variant={v}>Enter</KbdComponent>
                <span className="kbd-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Shortcut Combinations ──────────────────── */}
      <section className="kbd-page__section" id="shortcuts">
        <h2 className="kbd-page__section-title">
          <a href="#shortcuts">Shortcut Combinations</a>
        </h2>
        <p className="kbd-page__section-desc">
          Common keyboard shortcut patterns. Combine multiple Kbd elements with a plus separator
          to show multi-key shortcuts.
        </p>
        <div className="kbd-page__shortcut-grid">
          {SHORTCUT_COMBOS.map((combo, i) => (
            <div key={i} className="kbd-page__shortcut-cell">
              <div className="kbd-page__shortcut-keys">
                {combo.keys.map((key, ki) => (
                  <span key={ki} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {ki > 0 && <span className="kbd-page__shortcut-plus">+</span>}
                    <KbdComponent size="sm">{key}</KbdComponent>
                  </span>
                ))}
              </div>
              <span className="kbd-page__shortcut-desc">{combo.description}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Kbd>Cmd</Kbd> + <Kbd>K</Kbd>  {/* Command palette */}\n<Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>  {/* Copy */}\n<Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd>  {/* Command prompt */}`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Inline Usage ────────────────────────────── */}
      <section className="kbd-page__section" id="inline">
        <h2 className="kbd-page__section-title">
          <a href="#inline">Inline Usage</a>
        </h2>
        <p className="kbd-page__section-desc">
          Kbd renders as an inline element that flows naturally within text content.
        </p>
        <div className="kbd-page__preview kbd-page__preview--col" style={{ gap: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            Press <KbdComponent size="xs">Esc</KbdComponent> to close the dialog, or <KbdComponent size="xs">Enter</KbdComponent> to confirm.
            Use <KbdComponent size="xs">Tab</KbdComponent> and <KbdComponent size="xs">Shift</KbdComponent>+<KbdComponent size="xs">Tab</KbdComponent> to navigate between fields.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            Open the command palette with <KbdComponent size="xs">Cmd</KbdComponent>+<KbdComponent size="xs">K</KbdComponent> on macOS
            or <KbdComponent size="xs">Ctrl</KbdComponent>+<KbdComponent size="xs">K</KbdComponent> on Windows/Linux.
          </p>
        </div>
      </section>

      {/* ── 7. Ghost Variant in Context ───────────────── */}
      <section className="kbd-page__section" id="ghost-context">
        <h2 className="kbd-page__section-title">
          <a href="#ghost-context">Ghost Variant in Context</a>
        </h2>
        <p className="kbd-page__section-desc">
          The ghost variant blends subtly into surrounding text, ideal for documentation
          where key indicators should not dominate the visual hierarchy.
        </p>
        <div className="kbd-page__preview kbd-page__preview--col" style={{ gap: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            Navigate items with <KbdComponent variant="ghost" size="xs">Arrow Up</KbdComponent> and <KbdComponent variant="ghost" size="xs">Arrow Down</KbdComponent>.
            Select with <KbdComponent variant="ghost" size="xs">Space</KbdComponent> or <KbdComponent variant="ghost" size="xs">Enter</KbdComponent>.
            Press <KbdComponent variant="ghost" size="xs">Home</KbdComponent> to jump to first item
            and <KbdComponent variant="ghost" size="xs">End</KbdComponent> to jump to last.
          </p>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="kbd-page__section" id="tiers">
        <h2 className="kbd-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="kbd-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides CSS-only rendering.
          Standard adds motion and embedded scoped CSS. Premium adds aurora glow effects and spring animations.
        </p>

        <div className="kbd-page__tiers">
          {/* Lite */}
          <div
            className={`kbd-page__tier-card${tier === 'lite' ? ' kbd-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="kbd-page__tier-header">
              <span className="kbd-page__tier-name">Lite</span>
              <span className="kbd-page__tier-size">~0.15 KB</span>
            </div>
            <p className="kbd-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No motion or hover lift effect.
            </p>
            <div className="kbd-page__tier-import">
              import {'{'} Kbd {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="kbd-page__tier-preview">
              <LiteKbd>Ctrl</LiteKbd>
              <LiteKbd>C</LiteKbd>
            </div>
            <div className="kbd-page__size-breakdown">
              <div className="kbd-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.15 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.85 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`kbd-page__tier-card${tier === 'standard' ? ' kbd-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="kbd-page__tier-header">
              <span className="kbd-page__tier-name">Standard</span>
              <span className="kbd-page__tier-size">~0.5 KB</span>
            </div>
            <p className="kbd-page__tier-desc">
              Full-featured Kbd with motion levels, hover lift effect,
              and embedded scoped CSS via adoptedStyleSheets.
            </p>
            <div className="kbd-page__tier-import">
              import {'{'} Kbd {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="kbd-page__tier-preview">
              <Kbd>Ctrl</Kbd>
              <Kbd>C</Kbd>
            </div>
            <div className="kbd-page__size-breakdown">
              <div className="kbd-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`kbd-page__tier-card${tier === 'premium' ? ' kbd-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="kbd-page__tier-header">
              <span className="kbd-page__tier-name">Premium</span>
              <span className="kbd-page__tier-size">~3-5 KB</span>
            </div>
            <p className="kbd-page__tier-desc">
              Spring-scale hover lift, subtle aurora glow shadow, shimmer on keypress, and press depression effect.
            </p>
            <div className="kbd-page__tier-import">
              import {'{'} Kbd {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="kbd-page__tier-preview">
              <Kbd>Ctrl</Kbd>
              <Kbd>C</Kbd>
            </div>
            <div className="kbd-page__size-breakdown">
              <div className="kbd-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="kbd-page__section" id="props">
        <h2 className="kbd-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="kbd-page__section-desc">
          All props accepted by Kbd. It also spreads any native HTML attributes
          onto the underlying {'<kbd>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={kbdProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="kbd-page__section" id="accessibility">
        <h2 className="kbd-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="kbd-page__section-desc">
          Built on the native {'<kbd>'} element for maximum semantic correctness.
        </p>
        <Card variant="default" padding="md">
          <ul className="kbd-page__a11y-list">
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses the native <code className="kbd-page__a11y-key">{'<kbd>'}</code> element which screen readers announce as keyboard input.
              </span>
            </li>
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Monospace font:</strong> Uses a monospace font stack for clear visual distinction from surrounding text.
              </span>
            </li>
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Border and shadow provide sufficient contrast in both light and dark modes.
              </span>
            </li>
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="kbd-page__a11y-key">forced-colors: active</code> with a visible 1px ButtonText border.
              </span>
            </li>
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Hover lift animation is disabled when <code className="kbd-page__a11y-key">prefers-reduced-motion: reduce</code> is active.
              </span>
            </li>
            <li className="kbd-page__a11y-item">
              <span className="kbd-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Renders with a simple border and no box-shadow for clean print output.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
