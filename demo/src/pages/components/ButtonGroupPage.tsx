'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ButtonGroup } from '@ui/components/button-group'
import { ButtonGroup as LiteButtonGroup } from '@ui/lite/button-group'
import { ButtonGroup as PremiumButtonGroup } from '@ui/premium/button-group'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.button-group-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: button-group-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .button-group-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .button-group-page__hero::before {
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
        animation: aurora-spin-bg 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-bg {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .button-group-page__hero::before { animation: none; }
      }

      .button-group-page__title {
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

      .button-group-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .button-group-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .button-group-page__import-code {
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

      .button-group-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .button-group-page__section {
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
        animation: section-reveal-bg 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-bg {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .button-group-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .button-group-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .button-group-page__section-title a { color: inherit; text-decoration: none; }
      .button-group-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .button-group-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .button-group-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .button-group-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .button-group-page__preview--col {
        flex-direction: column;
        align-items: center;
      }

      .button-group-page__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      /* ── Playground ─────────────────────────────────── */

      .button-group-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container button-group-page (max-width: 680px) {
        .button-group-page__playground {
          grid-template-columns: 1fr;
        }
        .button-group-page__playground-controls {
          position: static !important;
        }
      }

      .button-group-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .button-group-page__playground-result {
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

      .button-group-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .button-group-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .button-group-page__playground-controls {
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

      .button-group-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .button-group-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .button-group-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .button-group-page__option-btn {
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
      .button-group-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .button-group-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .button-group-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .button-group-page__code-tabs {
        margin-block-start: 1rem;
      }

      .button-group-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .button-group-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .button-group-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .button-group-page__tier-card {
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

      .button-group-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .button-group-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .button-group-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .button-group-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .button-group-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .button-group-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .button-group-page__tier-import {
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

      .button-group-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .button-group-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .button-group-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .button-group-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .button-group-page__color-preset {
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
      .button-group-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .button-group-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .button-group-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .button-group-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .button-group-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .button-group-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .button-group-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .button-group-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .button-group-page__hero {
          padding: 2rem 1.25rem;
        }

        .button-group-page__title {
          font-size: 1.75rem;
        }

        .button-group-page__preview {
          padding: 1.75rem;
        }

        .button-group-page__playground {
          grid-template-columns: 1fr;
        }

        .button-group-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .button-group-page__tiers {
          grid-template-columns: 1fr;
        }

        .button-group-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .button-group-page__hero {
          padding: 1.5rem 1rem;
        }

        .button-group-page__title {
          font-size: 1.5rem;
        }

        .button-group-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .button-group-page__title {
          font-size: 4rem;
        }

        .button-group-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .button-group-page__import-code,
      .button-group-page code,
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

const propsData: PropDef[] = [
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of grouped buttons.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size propagated to child buttons via CSS custom properties.' },
  { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", default: "'primary'", description: 'Variant propagated to child buttons via CSS custom properties.' },
  { name: 'attached', type: 'boolean', default: 'false', description: 'Buttons visually connected (no gap, shared border-radius).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Child content.' },
]

// ─── Types & Constants ────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Orientation = 'horizontal' | 'vertical'

const VARIANTS: Variant[] = ['primary', 'secondary', 'ghost']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ButtonGroup } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ButtonGroup } from '@annondeveloper/ui-kit'",
  premium: "import { ButtonGroup } from '@annondeveloper/ui-kit/premium'",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="button-group-page__copy-btn"
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
    <div className="button-group-page__control-group">
      <span className="button-group-page__control-label">{label}</span>
      <div className="button-group-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`button-group-page__option-btn${opt === value ? ' button-group-page__option-btn--active' : ''}`}
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
    <label className="button-group-page__toggle-label">
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

// ─── Code Generators ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  orientation: Orientation,
  attached: boolean,
  motion: number,
  buttonCount: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const buttonImport = tier === 'lite'
    ? "import { Button } from '@annondeveloper/ui-kit/lite'"
    : tier === 'premium'
    ? "import { Button } from '@annondeveloper/ui-kit/premium'"
    : "import { Button } from '@annondeveloper/ui-kit'"

  const props: string[] = []
  if (variant !== 'primary') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (attached) props.push('  attached')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const buttons = Array.from({ length: buttonCount }, (_, i) =>
    `  <Button variant="${variant}">Option ${i + 1}</Button>`
  ).join('\n')

  const jsx = props.length === 0
    ? `<ButtonGroup>\n${buttons}\n</ButtonGroup>`
    : `<ButtonGroup\n${props.join('\n')}\n>\n${buttons}\n</ButtonGroup>`

  return `${importStr}\n${buttonImport}\n\n${jsx}`
}

function generateHtmlExport(
  tier: Tier,
  variant: Variant,
  size: Size,
  orientation: Orientation,
  attached: boolean,
  buttonCount: number,
): string {
  const cssFile = tier === 'lite' ? 'lite/styles.css' : 'css/components/button-group.css'
  const className = 'ui-button-group'
  const btnClass = tier === 'lite' ? 'ui-lite-button' : 'ui-button'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  const attrs = [
    `class="${className}"`,
    `data-orientation="${orientation}"`,
    `data-size="${size}"`,
    `data-variant="${variant}"`,
  ]
  if (attached) attrs.push('data-attached="true"')

  const buttons = Array.from({ length: buttonCount }, (_, i) =>
    `  <button class="${btnClass}" data-variant="${variant}" data-size="${size}">Option ${i + 1}</button>`
  ).join('\n')

  return `<!-- ButtonGroup — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cssFile}">

<div ${attrs.join(' ')} role="group">
${buttons}
</div>`
}

function generateVueCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  orientation: Orientation,
  attached: boolean,
  buttonCount: number,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-button-group"`, `data-orientation="${orientation}"`, `data-size="${size}"`, `data-variant="${variant}"`]
    if (attached) attrs.push('data-attached="true"')
    const buttons = Array.from({ length: buttonCount }, (_, i) =>
      `    <button class="ui-lite-button" data-variant="${variant}" data-size="${size}">Option ${i + 1}</button>`
    ).join('\n')
    return `<template>\n  <div ${attrs.join(' ')} role="group">\n${buttons}\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (variant !== 'primary') props.push(`    variant="${variant}"`)
  if (size !== 'md') props.push(`    size="${size}"`)
  if (orientation !== 'horizontal') props.push(`    orientation="${orientation}"`)
  if (attached) props.push('    attached')

  const buttons = Array.from({ length: buttonCount }, (_, i) =>
    `    <Button variant="${variant}">Option ${i + 1}</Button>`
  ).join('\n')

  const groupTag = props.length === 0
    ? `  <ButtonGroup>\n${buttons}\n  </ButtonGroup>`
    : `  <ButtonGroup\n${props.join('\n')}\n  >\n${buttons}\n  </ButtonGroup>`

  return `<template>\n${groupTag}\n</template>\n\n<script setup>\nimport { ButtonGroup, Button } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  orientation: Orientation,
  attached: boolean,
  buttonCount: number,
): string {
  const tierLabel = tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const btnClass = tier === 'lite' ? 'ui-lite-button' : 'ui-button'

  const attrs = [
    `class="ui-button-group"`,
    `data-orientation="${orientation}"`,
    `data-size="${size}"`,
    `data-variant="${variant}"`,
    `role="group"`,
  ]
  if (attached) attrs.push('data-attached="true"')

  const buttons = Array.from({ length: buttonCount }, (_, i) =>
    `  <button class="${btnClass}" data-variant="${variant}" data-size="${size}">Option ${i + 1}</button>`
  ).join('\n')

  return `<!-- Angular — ${tierLabel} tier (CSS-only approach) -->
<div ${attrs.join(' ')}>
${buttons}
</div>

/* Import in styles.css */
@import '${importPath}/css/components/button-group.css';`
}

function generateSvelteCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  orientation: Orientation,
  attached: boolean,
  buttonCount: number,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-button-group"`, `data-orientation="${orientation}"`, `data-size="${size}"`, `data-variant="${variant}"`, `role="group"`]
    if (attached) attrs.push('data-attached="true"')
    const buttons = Array.from({ length: buttonCount }, (_, i) =>
      `    <button class="ui-lite-button" data-variant="${variant}" data-size="${size}">Option ${i + 1}</button>`
    ).join('\n')
    return `<div ${attrs.join(' ')}>\n${buttons}\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (variant !== 'primary') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (attached) props.push('  attached')

  const buttons = Array.from({ length: buttonCount }, (_, i) =>
    `  <Button variant="${variant}">Option ${i + 1}</Button>`
  ).join('\n')

  const groupTag = props.length === 0
    ? `<ButtonGroup>\n${buttons}\n</ButtonGroup>`
    : `<ButtonGroup\n${props.join('\n')}\n>\n${buttons}\n</ButtonGroup>`

  return `<script>\n  import { ButtonGroup, Button } from '${importPath}';\n</script>\n\n${groupTag}`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [variant, setVariant] = useState<Variant>('secondary')
  const [size, setSize] = useState<Size>('md')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [attached, setAttached] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [buttonCount, setButtonCount] = useState(3)
  const [copyStatus, setCopyStatus] = useState('')

  const GroupComponent = tier === 'lite' ? LiteButtonGroup : tier === 'premium' ? PremiumButtonGroup : ButtonGroup

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, size, orientation, attached, motion, buttonCount),
    [tier, variant, size, orientation, attached, motion, buttonCount],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(tier, variant, size, orientation, attached, buttonCount),
    [tier, variant, size, orientation, attached, buttonCount],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, size, orientation, attached, buttonCount),
    [tier, variant, size, orientation, attached, buttonCount],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, size, orientation, attached, buttonCount),
    [tier, variant, size, orientation, attached, buttonCount],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, size, orientation, attached, buttonCount),
    [tier, variant, size, orientation, attached, buttonCount],
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

  const groupProps: Record<string, unknown> = {
    variant,
    size,
    orientation,
    attached: attached || undefined,
  }
  if (tier !== 'lite') {
    groupProps.motion = motion
  }

  const buttons = Array.from({ length: buttonCount }, (_, i) => (
    <Button key={i} variant={variant}>Option {i + 1}</Button>
  ))

  return (
    <section className="button-group-page__section" id="playground">
      <h2 className="button-group-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="button-group-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="button-group-page__playground">
        <div className="button-group-page__playground-preview">
          <div className="button-group-page__playground-result">
            <GroupComponent {...groupProps}>{buttons}</GroupComponent>
          </div>

          <div className="button-group-page__code-tabs">
            <div className="button-group-page__export-row">
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
              {copyStatus && <span className="button-group-page__export-status">{copyStatus}</span>}
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

        <div className="button-group-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="button-group-page__control-group">
            <span className="button-group-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Attached" checked={attached} onChange={setAttached} />
            </div>
          </div>

          <div className="button-group-page__control-group">
            <span className="button-group-page__control-label">Button Count</span>
            <div className="button-group-page__control-options">
              {[2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`button-group-page__option-btn${n === buttonCount ? ' button-group-page__option-btn--active' : ''}`}
                  onClick={() => setButtonCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ButtonGroupPage() {
  useStyles('button-group-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [selected, setSelected] = useState('week')
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

  // Scroll reveal fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.button-group-page__section')
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

  const GroupComponent = tier === 'lite' ? LiteButtonGroup : tier === 'premium' ? PremiumButtonGroup : ButtonGroup

  return (
    <div className="button-group-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="button-group-page__hero">
        <h1 className="button-group-page__title">ButtonGroup</h1>
        <p className="button-group-page__desc">
          Group related buttons together with shared sizing, attached borders,
          and horizontal or vertical orientation. Ships in three weight tiers
          from a minimal lite wrapper to premium with aurora glow and stagger animations.
        </p>
        <div className="button-group-page__import-row">
          <code className="button-group-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Orientation & Attached ─────────────────── */}
      <section className="button-group-page__section" id="orientation">
        <h2 className="button-group-page__section-title"><a href="#orientation">Orientation &amp; Attached</a></h2>
        <p className="button-group-page__section-desc">
          Horizontal and vertical layouts, with attached mode merging borders between buttons.
        </p>
        <div className="button-group-page__preview button-group-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">horizontal</span>
            <GroupComponent>
              <Button variant="secondary">Left</Button>
              <Button variant="secondary">Center</Button>
              <Button variant="secondary">Right</Button>
            </GroupComponent>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">horizontal attached</span>
            <GroupComponent attached>
              <Button variant="secondary"><Icon name="align-left" size="sm" /></Button>
              <Button variant="secondary"><Icon name="align-center" size="sm" /></Button>
              <Button variant="secondary"><Icon name="align-right" size="sm" /></Button>
            </GroupComponent>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">vertical attached</span>
            <GroupComponent orientation="vertical" attached>
              <Button variant="secondary"><Icon name="chevron-up" size="sm" /></Button>
              <Button variant="secondary"><Icon name="minus" size="sm" /></Button>
              <Button variant="secondary"><Icon name="chevron-down" size="sm" /></Button>
            </GroupComponent>
          </div>
        </div>
      </section>

      {/* ── 4. Sizes ─────────────────────────────────── */}
      <section className="button-group-page__section" id="sizes">
        <h2 className="button-group-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="button-group-page__section-desc">
          Five sizes from xs to xl, applied uniformly to all child buttons via CSS custom properties.
        </p>
        <div className="button-group-page__preview button-group-page__preview--col" style={{ gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <span className="button-group-page__label">{s}</span>
              <GroupComponent size={s} attached>
                <Button variant="secondary">Day</Button>
                <Button variant="secondary">Week</Button>
                <Button variant="secondary">Month</Button>
              </GroupComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Variants ──────────────────────────────── */}
      <section className="button-group-page__section" id="variants">
        <h2 className="button-group-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="button-group-page__section-desc">
          Three built-in variants for different levels of emphasis.
        </p>
        <div className="button-group-page__preview button-group-page__preview--col" style={{ gap: '1.5rem' }}>
          {VARIANTS.map(v => (
            <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <span className="button-group-page__label">{v}</span>
              <GroupComponent variant={v} attached>
                <Button variant={v}>Alpha</Button>
                <Button variant={v}>Beta</Button>
                <Button variant={v}>Gamma</Button>
              </GroupComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Toggle Pattern ────────────────────────── */}
      <section className="button-group-page__section" id="toggle">
        <h2 className="button-group-page__section-title"><a href="#toggle">Toggle Pattern</a></h2>
        <p className="button-group-page__section-desc">
          Use ButtonGroup to build segmented controls by managing active state on child buttons.
        </p>
        <div className="button-group-page__preview">
          <GroupComponent attached>
            {['day', 'week', 'month', 'year'].map(period => (
              <Button key={period} variant={selected === period ? 'primary' : 'secondary'} onClick={() => setSelected(period)}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </GroupComponent>
        </div>
        <CopyBlock
          code={`const [selected, setSelected] = useState('week')\n\n<ButtonGroup attached>\n  {['day', 'week', 'month', 'year'].map(period => (\n    <Button\n      key={period}\n      variant={selected === period ? 'primary' : 'secondary'}\n      onClick={() => setSelected(period)}\n    >\n      {period}\n    </Button>\n  ))}\n</ButtonGroup>`}
          language="typescript"
        />
      </section>

      {/* ── 7. Weight Tiers ───────────────────────────── */}
      <section className="button-group-page__section" id="tiers">
        <h2 className="button-group-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="button-group-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion prop).
        </p>

        <div className="button-group-page__tiers">
          {/* Lite */}
          <div
            className={`button-group-page__tier-card${tier === 'lite' ? ' button-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="button-group-page__tier-header">
              <span className="button-group-page__tier-name">Lite</span>
              <span className="button-group-page__tier-size">~0.2 KB</span>
            </div>
            <p className="button-group-page__tier-desc">
              Minimal wrapper. No motion, no aurora glow. Forwards all props
              to the standard component with motion=0.
            </p>
            <div className="button-group-page__tier-import">
              import {'{'} ButtonGroup {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="button-group-page__tier-preview">
              <LiteButtonGroup attached>
                <Button variant="secondary" size="sm">A</Button>
                <Button variant="secondary" size="sm">B</Button>
                <Button variant="secondary" size="sm">C</Button>
              </LiteButtonGroup>
            </div>
            <div className="button-group-page__size-breakdown">
              <div className="button-group-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`button-group-page__tier-card${tier === 'standard' ? ' button-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="button-group-page__tier-header">
              <span className="button-group-page__tier-name">Standard</span>
              <span className="button-group-page__tier-size">~1.2 KB</span>
            </div>
            <p className="button-group-page__tier-desc">
              Full-featured with motion levels, variant propagation, size
              propagation, and forced-colors support.
            </p>
            <div className="button-group-page__tier-import">
              import {'{'} ButtonGroup {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="button-group-page__tier-preview">
              <ButtonGroup attached>
                <Button variant="secondary" size="sm">A</Button>
                <Button variant="secondary" size="sm">B</Button>
                <Button variant="secondary" size="sm">C</Button>
              </ButtonGroup>
            </div>
            <div className="button-group-page__size-breakdown">
              <div className="button-group-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`button-group-page__tier-card${tier === 'premium' ? ' button-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="button-group-page__tier-header">
              <span className="button-group-page__tier-name">Premium</span>
              <span className="button-group-page__tier-size">~1.8 KB</span>
            </div>
            <p className="button-group-page__tier-desc">
              Everything in Standard plus aurora glow on attached groups,
              stagger entrance animations, and hover glow effects.
            </p>
            <div className="button-group-page__tier-import">
              import {'{'} ButtonGroup {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="button-group-page__tier-preview">
              <PremiumButtonGroup attached>
                <Button variant="secondary" size="sm">A</Button>
                <Button variant="secondary" size="sm">B</Button>
                <Button variant="secondary" size="sm">C</Button>
              </PremiumButtonGroup>
            </div>
            <div className="button-group-page__size-breakdown">
              <div className="button-group-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ────────────────────────────── */}
      <section className="button-group-page__section" id="brand-color">
        <h2 className="button-group-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="button-group-page__section-desc">
          Pick a brand color to see all button groups update in real-time. The theme generates
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
          <div className="button-group-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`button-group-page__color-preset${brandColor === p.hex ? ' button-group-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ──────────────────────────────── */}
      <section className="button-group-page__section" id="props">
        <h2 className="button-group-page__section-title"><a href="#props">Props API</a></h2>
        <p className="button-group-page__section-desc">
          All props accepted by ButtonGroup. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─────────────────────────── */}
      <section className="button-group-page__section" id="accessibility">
        <h2 className="button-group-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="button-group-page__section-desc">
          Built with semantic grouping and comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="button-group-page__a11y-list">
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="button-group-page__a11y-key">role="group"</code> by default to semantically group related buttons.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> All child buttons remain focusable via <code className="button-group-page__a11y-key">Tab</code> key navigation.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Attached buttons lift above siblings on <code className="button-group-page__a11y-key">:focus-visible</code> for clear visual feedback.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="button-group-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="button-group-page__a11y-key">forced-colors: active</code> with visible 1px borders on attached buttons.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Buttons render with plain borders and no box-shadow for clean printout.
              </span>
            </li>
            <li className="button-group-page__a11y-item">
              <span className="button-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="button-group-page__a11y-key">prefers-reduced-motion</code> — all animations disabled at motion level 0.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ─────────────────────────────────── */}
      <section className="button-group-page__section" id="source">
        <h2 className="button-group-page__section-title"><a href="#source">Source</a></h2>
        <p className="button-group-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="button-group-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/button-group.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/button-group.tsx (Standard)
          </a>
          <a className="button-group-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/button-group.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/button-group.tsx (Lite)
          </a>
          <a className="button-group-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/button-group.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/button-group.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
