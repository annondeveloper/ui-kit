'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DensitySelector } from '@ui/domain/density-selector'
import { DensitySelector as LiteDensitySelector } from '@ui/lite/density-selector'
import { DensitySelector as PremiumDensitySelector } from '@ui/premium/density-selector'
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
    @scope (.density-selector-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: density-selector-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .density-selector-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .density-selector-page__hero::before {
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
        animation: density-selector-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes density-selector-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .density-selector-page__hero::before { animation: none; }
      }

      .density-selector-page__title {
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

      .density-selector-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .density-selector-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .density-selector-page__import-code {
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

      .density-selector-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .density-selector-page__section {
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
        animation: density-selector-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes density-selector-page__section-reveal {
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
        .density-selector-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .density-selector-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .density-selector-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .density-selector-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .density-selector-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .density-selector-page__preview {
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

      .density-selector-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .density-selector-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .density-selector-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .density-selector-page__playground {
          grid-template-columns: 1fr;
        }
        .density-selector-page__playground-controls {
          position: static !important;
        }
      }

      @container density-selector-page (max-width: 680px) {
        .density-selector-page__playground {
          grid-template-columns: 1fr;
        }
        .density-selector-page__playground-controls {
          position: static !important;
        }
      }

      .density-selector-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .density-selector-page__playground-result {
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

      .density-selector-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .density-selector-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .density-selector-page__playground-controls {
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

      .density-selector-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .density-selector-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .density-selector-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .density-selector-page__option-btn {
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
      .density-selector-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .density-selector-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Density demo content ──────────────────────── */

      .density-selector-page__demo-content {
        inline-size: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-block-start: 1.5rem;
      }

      .density-selector-page__demo-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        transition: padding 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    gap 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    font-size 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .density-selector-page__demo-row[data-density="compact"] {
        padding: 0.375rem 0.625rem;
        font-size: var(--text-xs, 0.75rem);
        gap: 0.5rem;
      }
      .density-selector-page__demo-row[data-density="comfortable"] {
        padding: 0.625rem 0.875rem;
        font-size: var(--text-sm, 0.875rem);
        gap: 0.75rem;
      }
      .density-selector-page__demo-row[data-density="spacious"] {
        padding: 1rem 1.25rem;
        font-size: var(--text-base, 1rem);
        gap: 1rem;
      }

      .density-selector-page__demo-avatar {
        inline-size: 1.5em;
        block-size: 1.5em;
        border-radius: 50%;
        background: var(--brand, oklch(65% 0.2 270));
        flex-shrink: 0;
      }

      .density-selector-page__demo-name {
        color: var(--text-primary);
        font-weight: 500;
        flex: 1;
      }

      .density-selector-page__demo-role {
        color: var(--text-tertiary);
      }

      /* ── Labeled row ────────────────────────────────── */

      .density-selector-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .density-selector-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .density-selector-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .density-selector-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .density-selector-page__tier-card {
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

      .density-selector-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .density-selector-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .density-selector-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .density-selector-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .density-selector-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .density-selector-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .density-selector-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .density-selector-page__tier-import {
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

      .density-selector-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .density-selector-page__code-tabs {
        margin-block-start: 1rem;
      }

      .density-selector-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .density-selector-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .density-selector-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .density-selector-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .density-selector-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .density-selector-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .density-selector-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .density-selector-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .density-selector-page__import-code,
      .density-selector-page code,
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

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .density-selector-page__hero {
          padding: 2rem 1.25rem;
        }

        .density-selector-page__title {
          font-size: 1.75rem;
        }

        .density-selector-page__preview {
          padding: 1.75rem;
        }

        .density-selector-page__playground {
          grid-template-columns: 1fr;
        }

        .density-selector-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .density-selector-page__labeled-row {
          gap: 1rem;
        }

        .density-selector-page__tiers {
          grid-template-columns: 1fr;
        }

        .density-selector-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .density-selector-page__hero {
          padding: 1.5rem 1rem;
        }

        .density-selector-page__title {
          font-size: 1.5rem;
        }

        .density-selector-page__preview {
          padding: 1rem;
        }

        .density-selector-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .density-selector-page__title {
          font-size: 4rem;
        }

        .density-selector-page__preview {
          padding: 3.5rem;
        }

        .density-selector-page__labeled-row {
          gap: 2.5rem;
        }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const densitySelectorProps: PropDef[] = [
  { name: 'value', type: "'compact' | 'comfortable' | 'spacious'", description: 'Controlled density value. When set, component becomes controlled.' },
  { name: 'defaultValue', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", description: 'Initial density value for uncontrolled usage.' },
  { name: 'onChange', type: '(value: DensityValue) => void', description: 'Callback fired when the selected density changes.' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Controls the overall size of the selector. sm hides text labels.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for the sliding indicator pill. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root div element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DensityValue = 'compact' | 'comfortable' | 'spacious'
type Size = 'sm' | 'md'

const DENSITY_VALUES: DensityValue[] = ['compact', 'comfortable', 'spacious']
const SIZES: Size[] = ['sm', 'md']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DensitySelector } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DensitySelector } from '@annondeveloper/ui-kit'",
  premium: "import { DensitySelector } from '@annondeveloper/ui-kit/premium'",
}

const DEMO_USERS = [
  { name: 'Alice Chen', role: 'Engineer' },
  { name: 'Bob Martinez', role: 'Designer' },
  { name: 'Carol Singh', role: 'Product Manager' },
  { name: 'Dan Kim', role: 'DevOps' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="density-selector-page__copy-btn"
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
    <div className="density-selector-page__control-group">
      <span className="density-selector-page__control-label">{label}</span>
      <div className="density-selector-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`density-selector-page__option-btn${opt === value ? ' density-selector-page__option-btn--active' : ''}`}
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
  densityValue: DensityValue,
  size: Size,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (densityValue !== 'comfortable') props.push(`  defaultValue="${densityValue}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  onChange={(value) => console.log(value)}')

  const jsx = `<DensitySelector\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCssCode(tier: Tier, densityValue: DensityValue, size: Size): string {
  const className = tier === 'lite' ? 'ui-lite-density-selector' : 'ui-density-selector'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  return `<!-- DensitySelector -- @annondeveloper/ui-kit ${tierLabel} tier -->
<div class="${className}" role="radiogroup" aria-label="UI density" data-size="${size}">
  <button type="button" role="radio" aria-checked="${densityValue === 'compact'}"
    class="${className}__option" ${densityValue === 'compact' ? 'data-active' : ''}>compact</button>
  <button type="button" role="radio" aria-checked="${densityValue === 'comfortable'}"
    class="${className}__option" ${densityValue === 'comfortable' ? 'data-active' : ''}>comfortable</button>
  <button type="button" role="radio" aria-checked="${densityValue === 'spacious'}"
    class="${className}__option" ${densityValue === 'spacious' ? 'data-active' : ''}>spacious</button>
</div>

<style>
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/density-selector.css'}';
</style>`
}

function generateVueCode(tier: Tier, densityValue: DensityValue, size: Size): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-density-selector" role="radiogroup" aria-label="UI density" data-size="${size}">
    <button type="button" role="radio" :aria-checked="density === 'compact'"
      :data-active="density === 'compact' || undefined"
      class="ui-lite-density-selector__option"
      @click="density = 'compact'">compact</button>
    <button type="button" role="radio" :aria-checked="density === 'comfortable'"
      :data-active="density === 'comfortable' || undefined"
      class="ui-lite-density-selector__option"
      @click="density = 'comfortable'">comfortable</button>
    <button type="button" role="radio" :aria-checked="density === 'spacious'"
      :data-active="density === 'spacious' || undefined"
      class="ui-lite-density-selector__option"
      @click="density = 'spacious'">spacious</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const density = ref('${densityValue}')
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (densityValue !== 'comfortable') attrs.push(`  default-value="${densityValue}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  attrs.push('  @change="onDensityChange"')

  return `<template>
  <DensitySelector
  ${attrs.join('\n  ')}
  />
</template>

<script setup>
import { DensitySelector } from '${importPath}'

function onDensityChange(value) {
  console.log('Density changed:', value)
}
</script>`
}

function generateAngularCode(tier: Tier, densityValue: DensityValue, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<div class="ui-lite-density-selector" role="radiogroup" aria-label="UI density" data-size="${size}">
  <button type="button" role="radio" [attr.aria-checked]="density === 'compact'"
    [attr.data-active]="density === 'compact' ? true : null"
    class="ui-lite-density-selector__option"
    (click)="density = 'compact'">compact</button>
  <button type="button" role="radio" [attr.aria-checked]="density === 'comfortable'"
    [attr.data-active]="density === 'comfortable' ? true : null"
    class="ui-lite-density-selector__option"
    (click)="density = 'comfortable'">comfortable</button>
  <button type="button" role="radio" [attr.aria-checked]="density === 'spacious'"
    [attr.data-active]="density === 'spacious' ? true : null"
    class="ui-lite-density-selector__option"
    (click)="density = 'spacious'">spacious</button>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use CSS-only approach with data attributes -->
<div class="ui-density-selector" role="radiogroup" aria-label="UI density" data-size="${size}">
  <button type="button" role="radio" *ngFor="let opt of densityOptions"
    [attr.aria-checked]="density === opt"
    [attr.data-active]="density === opt ? true : null"
    class="ui-density-selector__option"
    (click)="density = opt">{{opt}}</button>
</div>

/* Import component CSS */
@import '${importPath}/css/components/density-selector.css';`
}

function generateSvelteCode(tier: Tier, densityValue: DensityValue, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<script>
  let density = '${densityValue}'
</script>

<div class="ui-lite-density-selector" role="radiogroup" aria-label="UI density" data-size="${size}">
  {#each ['compact', 'comfortable', 'spacious'] as opt}
    <button type="button" role="radio" aria-checked={density === opt}
      data-active={density === opt || undefined}
      class="ui-lite-density-selector__option"
      on:click={() => density = opt}>{opt}</button>
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { DensitySelector } from '${importPath}';

  let density = '${densityValue}';
</script>

<DensitySelector
  defaultValue="${densityValue}"
  ${size !== 'md' ? `size="${size}"` : ''}
  on:change={(e) => density = e.detail}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [densityValue, setDensityValue] = useState<DensityValue>('comfortable')
  const [size, setSize] = useState<Size>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const Component = tier === 'lite' ? LiteDensitySelector : tier === 'premium' ? PremiumDensitySelector : DensitySelector

  const reactCode = useMemo(
    () => generateReactCode(tier, densityValue, size, motion),
    [tier, densityValue, size, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, densityValue, size),
    [tier, densityValue, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, densityValue, size),
    [tier, densityValue, size],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, densityValue, size),
    [tier, densityValue, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, densityValue, size),
    [tier, densityValue, size],
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

  const previewProps: Record<string, unknown> = {
    value: densityValue,
    onChange: setDensityValue,
    size,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="density-selector-page__section" id="playground">
      <h2 className="density-selector-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="density-selector-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="density-selector-page__playground">
        {/* Preview area */}
        <div className="density-selector-page__playground-preview">
          <div className="density-selector-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              <Component {...previewProps} />
              <div className="density-selector-page__demo-content">
                {DEMO_USERS.map((user) => (
                  <div key={user.name} className="density-selector-page__demo-row" data-density={densityValue}>
                    <div className="density-selector-page__demo-avatar" />
                    <span className="density-selector-page__demo-name">{user.name}</span>
                    <span className="density-selector-page__demo-role">{user.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabbed code output */}
          <div className="density-selector-page__code-tabs">
            <div className="density-selector-page__export-row">
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
              {copyStatus && <span className="density-selector-page__export-status">{copyStatus}</span>}
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
        <div className="density-selector-page__playground-controls">
          <OptionGroup label="Value" options={DENSITY_VALUES} value={densityValue} onChange={setDensityValue} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DensitySelectorPage() {
  useStyles('density-selector-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections -- JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.density-selector-page__section')
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

  const Component = tier === 'lite' ? LiteDensitySelector : tier === 'premium' ? PremiumDensitySelector : DensitySelector

  return (
    <div className="density-selector-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="density-selector-page__hero">
        <h1 className="density-selector-page__title">Density Selector</h1>
        <p className="density-selector-page__desc">
          Segmented radio group for switching between compact, comfortable, and spacious UI density modes.
          Features a sliding indicator pill with physics-based animation across three weight tiers.
        </p>
        <div className="density-selector-page__import-row">
          <code className="density-selector-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Density Modes ────────────────────────── */}
      <section className="density-selector-page__section" id="density-modes">
        <h2 className="density-selector-page__section-title">
          <a href="#density-modes">Density Modes</a>
        </h2>
        <p className="density-selector-page__section-desc">
          Three density modes control the spacing, font-size, and padding of your UI.
          Each mode renders with a representative icon showing line spacing.
        </p>
        <div className="density-selector-page__preview density-selector-page__preview--col" style={{ gap: '2rem' }}>
          {DENSITY_VALUES.map(val => (
            <div key={val} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start', inlineSize: '100%' }}>
              <span className="density-selector-page__item-label">{val}</span>
              <Component defaultValue={val} />
              <div className="density-selector-page__demo-content">
                {DEMO_USERS.slice(0, 3).map((user) => (
                  <div key={user.name} className="density-selector-page__demo-row" data-density={val}>
                    <div className="density-selector-page__demo-avatar" />
                    <span className="density-selector-page__demo-name">{user.name}</span>
                    <span className="density-selector-page__demo-role">{user.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Size Scale ───────────────────────────────── */}
      <section className="density-selector-page__section" id="sizes">
        <h2 className="density-selector-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="density-selector-page__section-desc">
          Two sizes available: md (default) shows text labels alongside icons, while sm shows icons only
          for compact toolbars.
        </p>
        <div className="density-selector-page__preview">
          <div className="density-selector-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="density-selector-page__labeled-item">
                <Component size={s} />
                <span className="density-selector-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Motion Levels ────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="density-selector-page__section" id="motion">
          <h2 className="density-selector-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="density-selector-page__section-desc">
            The sliding indicator pill supports four motion levels. Level 0 is instant, level 1 is a subtle
            ease-out, level 2 adds spring-like overshoot, and level 3 is full cinematic physics.
          </p>
          <div className="density-selector-page__preview density-selector-page__preview--col" style={{ gap: '1.25rem' }}>
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="density-selector-page__labeled-item" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                <span className="density-selector-page__item-label" style={{ minInlineSize: '3rem' }}>motion={m}</span>
                <Component motion={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Controlled vs Uncontrolled ───────────────── */}
      <section className="density-selector-page__section" id="controlled">
        <h2 className="density-selector-page__section-title">
          <a href="#controlled">Controlled vs Uncontrolled</a>
        </h2>
        <p className="density-selector-page__section-desc">
          Use <code className="density-selector-page__a11y-key">value</code> + <code className="density-selector-page__a11y-key">onChange</code> for
          controlled mode, or <code className="density-selector-page__a11y-key">defaultValue</code> for uncontrolled.
        </p>
        <CopyBlock
          code={`// Controlled
const [density, setDensity] = useState('comfortable')
<DensitySelector value={density} onChange={setDensity} />

// Uncontrolled
<DensitySelector defaultValue="compact" onChange={(v) => console.log(v)} />`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="density-selector-page__section" id="tiers">
        <h2 className="density-selector-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="density-selector-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion and icon rendering).
        </p>

        <div className="density-selector-page__tiers">
          {/* Lite */}
          <div
            className={`density-selector-page__tier-card${tier === 'lite' ? ' density-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="density-selector-page__tier-header">
              <span className="density-selector-page__tier-name">Lite</span>
              <span className="density-selector-page__tier-size">~0.4 KB</span>
            </div>
            <p className="density-selector-page__tier-desc">
              CSS-only variant. Plain text buttons without icons or sliding indicator. No motion, no animations.
            </p>
            <div className="density-selector-page__tier-import">
              import {'{'} DensitySelector {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="density-selector-page__tier-preview">
              <LiteDensitySelector defaultValue="comfortable" />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`density-selector-page__tier-card${tier === 'standard' ? ' density-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="density-selector-page__tier-header">
              <span className="density-selector-page__tier-name">Standard</span>
              <span className="density-selector-page__tier-size">~1.8 KB</span>
            </div>
            <p className="density-selector-page__tier-desc">
              Full-featured with sliding indicator pill, density icons, motion levels,
              and forced-colors support.
            </p>
            <div className="density-selector-page__tier-import">
              import {'{'} DensitySelector {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="density-selector-page__tier-preview">
              <DensitySelector defaultValue="comfortable" />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`density-selector-page__tier-card${tier === 'premium' ? ' density-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="density-selector-page__tier-header">
              <span className="density-selector-page__tier-name">Premium</span>
              <span className="density-selector-page__tier-size">~2.5 KB</span>
            </div>
            <p className="density-selector-page__tier-desc">
              Everything in Standard plus glow pulse on segment change, hover shimmer on options,
              and fade-up entrance animation.
            </p>
            <div className="density-selector-page__tier-import">
              import {'{'} DensitySelector {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="density-selector-page__tier-preview">
              <PremiumDensitySelector defaultValue="comfortable" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="density-selector-page__section" id="props">
        <h2 className="density-selector-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="density-selector-page__section-desc">
          All props accepted by DensitySelector. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={densitySelectorProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="density-selector-page__section" id="accessibility">
        <h2 className="density-selector-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="density-selector-page__section-desc">
          Built as a native radio group with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="density-selector-page__a11y-list">
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="density-selector-page__a11y-key">role="radiogroup"</code> with <code className="density-selector-page__a11y-key">role="radio"</code> children and <code className="density-selector-page__a11y-key">aria-checked</code>.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> Provides <code className="density-selector-page__a11y-key">aria-label="UI density"</code> on the radio group container.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Options are focusable and activatable via <code className="density-selector-page__a11y-key">Enter</code> and <code className="density-selector-page__a11y-key">Space</code> keys.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored outline via <code className="density-selector-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="density-selector-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="density-selector-page__a11y-key">forced-colors: active</code> with visible borders and Highlight indicator.
              </span>
            </li>
            <li className="density-selector-page__a11y-item">
              <span className="density-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="density-selector-page__a11y-key">prefers-reduced-motion: reduce</code> by disabling indicator transitions.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ────────────────────────────────── */}
      <section className="density-selector-page__section" id="source">
        <h2 className="density-selector-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="density-selector-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/density-selector.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="density-selector-page__source-link"
        >
          <Icon name="external-link" size="sm" />
          src/domain/density-selector.tsx
        </a>
      </section>
    </div>
  )
}
