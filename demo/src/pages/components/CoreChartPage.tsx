'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CoreChart } from '@ui/domain/core-chart'
import { CoreChart as LiteCoreChart } from '@ui/lite/core-chart'
import { CoreChart as PremiumCoreChart } from '@ui/premium/core-chart'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.core-chart-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: core-chart-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .core-chart-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .core-chart-page__hero::before {
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
        animation: core-chart-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes core-chart-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .core-chart-page__hero::before { animation: none; }
      }

      .core-chart-page__title {
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

      .core-chart-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .core-chart-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .core-chart-page__import-code {
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

      .core-chart-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .core-chart-page__section {
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
        animation: core-chart-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes core-chart-section-reveal {
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
        .core-chart-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .core-chart-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .core-chart-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .core-chart-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .core-chart-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .core-chart-page__preview {
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

      .core-chart-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .core-chart-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container core-chart-page (max-width: 680px) {
        .core-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .core-chart-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .core-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .core-chart-page__playground-controls {
          position: static !important;
        }
      }

      .core-chart-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .core-chart-page__playground-result {
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

      .core-chart-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .core-chart-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .core-chart-page__playground-controls {
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

      .core-chart-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .core-chart-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .core-chart-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .core-chart-page__option-btn {
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
      .core-chart-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .core-chart-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .core-chart-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .core-chart-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .core-chart-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .core-chart-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .core-chart-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-end;
      }

      .core-chart-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .core-chart-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .core-chart-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .core-chart-page__tier-card {
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

      .core-chart-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .core-chart-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .core-chart-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .core-chart-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .core-chart-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .core-chart-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .core-chart-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .core-chart-page__tier-import {
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

      .core-chart-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .core-chart-page__code-tabs {
        margin-block-start: 1rem;
      }

      .core-chart-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .core-chart-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .core-chart-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .core-chart-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .core-chart-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .core-chart-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .core-chart-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .core-chart-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .core-chart-page__hero { padding: 2rem 1.25rem; }
        .core-chart-page__title { font-size: 1.75rem; }
        .core-chart-page__preview { padding: 1.75rem; }
        .core-chart-page__playground { grid-template-columns: 1fr; }
        .core-chart-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .core-chart-page__labeled-row { gap: 1rem; }
        .core-chart-page__tiers { grid-template-columns: 1fr; }
        .core-chart-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .core-chart-page__hero { padding: 1.5rem 1rem; }
        .core-chart-page__title { font-size: 1.5rem; }
        .core-chart-page__preview { padding: 1rem; }
        .core-chart-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .core-chart-page__import-code,
      .core-chart-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const coreChartProps: PropDef[] = [
  { name: 'cores', type: 'CoreChartCore[]', description: 'Array of core objects with id (number) and usage (0-100 percent).' },
  { name: 'columns', type: 'number', description: 'Number of grid columns. Defaults to Math.ceil(Math.sqrt(cores.length)).' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Cell size: sm (16px), md (24px), lg (32px).' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Display core ID label centered in each cell.' },
  { name: 'colorScale', type: "'green-red' | 'blue-red' | 'brand'", default: "'green-red'", description: 'Color gradient scale for usage visualization.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ColorScale = 'green-red' | 'blue-red' | 'brand'
type Size = 'sm' | 'md' | 'lg'

const COLOR_SCALES: ColorScale[] = ['green-red', 'blue-red', 'brand']
const SIZES: Size[] = ['sm', 'md', 'lg']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CoreChart } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CoreChart } from '@annondeveloper/ui-kit'",
  premium: "import { CoreChart } from '@annondeveloper/ui-kit/premium'",
}

function generateCores(count: number): { id: number; usage: number }[] {
  const cores: { id: number; usage: number }[] = []
  for (let i = 0; i < count; i++) {
    cores.push({ id: i, usage: Math.round(Math.random() * 100) })
  }
  return cores
}

function generateStableCores(count: number, seed: number): { id: number; usage: number }[] {
  const cores: { id: number; usage: number }[] = []
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random based on seed + index
    const hash = ((seed * 31 + i * 17) % 101 + 101) % 101
    cores.push({ id: i, usage: hash })
  }
  return cores
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="core-chart-page__copy-btn"
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
    <div className="core-chart-page__control-group">
      <span className="core-chart-page__control-label">{label}</span>
      <div className="core-chart-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`core-chart-page__option-btn${opt === value ? ' core-chart-page__option-btn--active' : ''}`}
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
    <label className="core-chart-page__toggle-label">
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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  coreCount: number,
  columns: number | undefined,
  colorScale: ColorScale,
  size: Size,
  showLabels: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push(`  cores={cores}`)
  if (columns) props.push(`  columns={${columns}}`)
  if (colorScale !== 'green-red') props.push(`  colorScale="${colorScale}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showLabels) props.push('  showLabels')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

// Generate sample core data
const cores = Array.from({ length: ${coreCount} }, (_, i) => ({
  id: i,
  usage: Math.round(Math.random() * 100),
}))

<CoreChart
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, coreCount: number, colorScale: ColorScale, size: Size): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  return `<!-- CoreChart -- @annondeveloper/ui-kit ${tierLabel} tier -->
<!-- CoreChart is a React component; for HTML-only use, render the grid manually -->
<div class="ui-core-chart" data-size="${size}" role="img" aria-label="CPU core utilization: ${coreCount} cores">
  <div class="ui-core-chart__grid" style="display: grid; grid-template-columns: repeat(${Math.ceil(Math.sqrt(coreCount))}, var(--cell-size, 24px)); gap: 2px;">
    <!-- Repeat for each core -->
    <div class="ui-core-chart__cell" style="background-color: oklch(65% 0.18 155);"></div>
    <!-- ... -->
  </div>
</div>

<style>
@import '@annondeveloper/ui-kit/css/components/core-chart.css';
</style>`
}

function generateVueCode(tier: Tier, coreCount: number, columns: number | undefined, colorScale: ColorScale, size: Size, showLabels: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-core-chart" role="img" :aria-label="\`CPU cores: \${cores.length}\`"
    :style="{ display: 'inline-grid', gridTemplateColumns: \`repeat(\${columns}, 20px)\`, gap: '2px' }">
    <div v-for="core in cores" :key="core.id" :title="\`Core \${core.id}: \${core.usage}%\`"
      :style="{ width: '20px', height: '20px', borderRadius: '3px', background: usageColor(core.usage) }" />
  </div>
</template>

<script setup>
const cores = Array.from({ length: ${coreCount} }, (_, i) => ({ id: i, usage: Math.round(Math.random() * 100) }))
const columns = ${columns ?? Math.ceil(Math.sqrt(coreCount))}
</script>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :cores="cores"']
  if (columns) attrs.push(`  :columns="${columns}"`)
  if (colorScale !== 'green-red') attrs.push(`  color-scale="${colorScale}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showLabels) attrs.push('  show-labels')

  return `<template>
  <CoreChart
${attrs.join('\n')}
  />
</template>

<script setup>
import { CoreChart } from '${importPath}'

const cores = Array.from({ length: ${coreCount} }, (_, i) => ({
  id: i, usage: Math.round(Math.random() * 100)
}))
</script>`
}

function generateAngularCode(tier: Tier, coreCount: number, colorScale: ColorScale, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<div class="ui-lite-core-chart" role="img" [attr.aria-label]="'CPU cores: ' + cores.length"
  [style.display]="'inline-grid'" [style.grid-template-columns]="'repeat(' + columns + ', 20px)'" [style.gap]="'2px'">
  <div *ngFor="let core of cores" [title]="'Core ' + core.id + ': ' + core.usage + '%'"
    [style.width]="'20px'" [style.height]="'20px'" [style.border-radius]="'3px'" [style.background]="usageColor(core.usage)">
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the CSS-only approach for Angular -->
<div class="ui-core-chart" data-size="${size}" role="img"
  [attr.aria-label]="'CPU core utilization: ' + cores.length + ' cores'">
  <div class="ui-core-chart__grid"
    [style.grid-template-columns]="'repeat(' + columns + ', var(--cell-size, 24px))'" style="display: grid; gap: 2px;">
    <div *ngFor="let core of cores" class="ui-core-chart__cell"
      [style.background-color]="usageColor(core.usage, '${colorScale}')">
    </div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/core-chart.css';`
}

function generateSvelteCode(tier: Tier, coreCount: number, columns: number | undefined, colorScale: ColorScale, size: Size, showLabels: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier -->
<script>
  const cores = Array.from({ length: ${coreCount} }, (_, i) => ({ id: i, usage: Math.round(Math.random() * 100) }));
  const columns = ${columns ?? Math.ceil(Math.sqrt(coreCount))};
</script>

<div class="ui-lite-core-chart" role="img" aria-label="CPU cores: {cores.length}"
  style="display: inline-grid; grid-template-columns: repeat({columns}, 20px); gap: 2px;">
  {#each cores as core}
    <div title="Core {core.id}: {core.usage}%"
      style="width: 20px; height: 20px; border-radius: 3px; background: {usageColor(core.usage)};" />
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  cores={cores}']
  if (columns) attrs.push(`  columns={${columns}}`)
  if (colorScale !== 'green-red') attrs.push(`  colorScale="${colorScale}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showLabels) attrs.push('  showLabels')

  return `<script>
  import { CoreChart } from '${importPath}';

  const cores = Array.from({ length: ${coreCount} }, (_, i) => ({
    id: i, usage: Math.round(Math.random() * 100)
  }));
</script>

<CoreChart
${attrs.join('\n')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [coreCount, setCoreCount] = useState(16)
  const [columns, setColumns] = useState<number | undefined>(undefined)
  const [colorScale, setColorScale] = useState<ColorScale>('green-red')
  const [size, setSize] = useState<Size>('md')
  const [showLabels, setShowLabels] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const cores = useMemo(() => generateCores(coreCount), [coreCount])

  const ChartComponent = tier === 'lite' ? LiteCoreChart : tier === 'premium' ? PremiumCoreChart : CoreChart

  const reactCode = useMemo(
    () => generateReactCode(tier, coreCount, columns, colorScale, size, showLabels, motion),
    [tier, coreCount, columns, colorScale, size, showLabels, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, coreCount, colorScale, size), [tier, coreCount, colorScale, size])
  const vueCode = useMemo(() => generateVueCode(tier, coreCount, columns, colorScale, size, showLabels), [tier, coreCount, columns, colorScale, size, showLabels])
  const angularCode = useMemo(() => generateAngularCode(tier, coreCount, colorScale, size), [tier, coreCount, colorScale, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, coreCount, columns, colorScale, size, showLabels), [tier, coreCount, columns, colorScale, size, showLabels])

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

  const chartProps: Record<string, unknown> = {
    cores,
    colorScale,
    size,
    showLabels,
  }
  if (columns) chartProps.columns = columns
  if (tier !== 'lite') chartProps.motion = motion

  return (
    <section className="core-chart-page__section" id="playground">
      <h2 className="core-chart-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="core-chart-page__section-desc">
        Configure core count, grid layout, color scale, and labels. The generated code updates in real-time.
      </p>

      <div className="core-chart-page__playground">
        <div className="core-chart-page__playground-preview">
          <div className="core-chart-page__playground-result">
            <ChartComponent {...chartProps as any} />
          </div>

          <div className="core-chart-page__code-tabs">
            <div className="core-chart-page__export-row">
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
              {copyStatus && <span className="core-chart-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="core-chart-page__playground-controls">
          <OptionGroup
            label="Cores"
            options={['4', '8', '16', '32', '64'] as const}
            value={String(coreCount)}
            onChange={v => setCoreCount(Number(v))}
          />
          <div className="core-chart-page__control-group">
            <span className="core-chart-page__control-label">Columns (optional)</span>
            <input
              type="number"
              min={1}
              max={16}
              value={columns ?? ''}
              placeholder="auto"
              onChange={e => setColumns(e.target.value ? Number(e.target.value) : undefined)}
              className="core-chart-page__text-input"
            />
          </div>
          <OptionGroup label="Color Scale" options={COLOR_SCALES} value={colorScale} onChange={setColorScale} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="core-chart-page__control-group">
            <span className="core-chart-page__control-label">Toggles</span>
            <Toggle label="Show Labels" checked={showLabels} onChange={setShowLabels} />
          </div>

          <Button size="xs" variant="ghost" onClick={() => setCoreCount(prev => prev)}>
            <Icon name="refresh" size="sm" /> Randomize Data
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoreChartPage() {
  useStyles('core-chart-page', pageStyles)

  const { tier, setTier } = useTier()

  const demoData4 = useMemo(() => generateStableCores(4, 42), [])
  const demoData8 = useMemo(() => generateStableCores(8, 73), [])
  const demoData16 = useMemo(() => generateStableCores(16, 99), [])
  const demoData32 = useMemo(() => generateStableCores(32, 137), [])

  const ChartComponent = tier === 'lite' ? LiteCoreChart : tier === 'premium' ? PremiumCoreChart : CoreChart

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.core-chart-page__section')
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
    <div className="core-chart-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="core-chart-page__hero">
        <h1 className="core-chart-page__title">CoreChart</h1>
        <p className="core-chart-page__desc">
          Visualize CPU core utilization as a color-coded heatmap grid. Supports configurable
          core counts, grid columns, three color scales, and interactive tooltips.
        </p>
        <div className="core-chart-page__import-row">
          <code className="core-chart-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Core Counts ─────────────────────────────── */}
      <section className="core-chart-page__section" id="core-counts">
        <h2 className="core-chart-page__section-title">
          <a href="#core-counts">Core Counts</a>
        </h2>
        <p className="core-chart-page__section-desc">
          CoreChart automatically calculates the optimal column count from the number of cores.
          Here are common configurations from 4 to 32 cores.
        </p>
        <div className="core-chart-page__preview">
          <div className="core-chart-page__labeled-row">
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData4} size="md" colorScale="green-red" />
              <span className="core-chart-page__item-label">4 cores</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData8} size="md" colorScale="green-red" />
              <span className="core-chart-page__item-label">8 cores</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData16} size="md" colorScale="green-red" />
              <span className="core-chart-page__item-label">16 cores</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData32} size="sm" colorScale="green-red" />
              <span className="core-chart-page__item-label">32 cores</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Color Scales ────────────────────────────── */}
      <section className="core-chart-page__section" id="color-scales">
        <h2 className="core-chart-page__section-title">
          <a href="#color-scales">Color Scales</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Three built-in color scales map usage values to OKLCH colors.
          Green-red uses a traffic-light gradient, blue-red uses a cool-to-hot spectrum,
          and brand uses your theme's brand hue.
        </p>
        <div className="core-chart-page__preview">
          <div className="core-chart-page__labeled-row">
            {COLOR_SCALES.map(scale => (
              <div key={scale} className="core-chart-page__labeled-item">
                <ChartComponent cores={demoData16} size="md" colorScale={scale} />
                <span className="core-chart-page__item-label">{scale}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Sizes ───────────────────────────────────── */}
      <section className="core-chart-page__section" id="sizes">
        <h2 className="core-chart-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Three sizes control the cell dimensions: sm (16px), md (24px), and lg (32px).
        </p>
        <div className="core-chart-page__preview">
          <div className="core-chart-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="core-chart-page__labeled-item">
                <ChartComponent cores={demoData8} size={s} colorScale="green-red" />
                <span className="core-chart-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Labels ──────────────────────────────────── */}
      <section className="core-chart-page__section" id="labels">
        <h2 className="core-chart-page__section-title">
          <a href="#labels">With Labels</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Enable <code>showLabels</code> to display core IDs inside each cell.
          Works best with md or lg size.
        </p>
        <div className="core-chart-page__preview">
          <div className="core-chart-page__labeled-row">
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData8} size="lg" colorScale="green-red" showLabels />
              <span className="core-chart-page__item-label">labels on</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData8} size="lg" colorScale="green-red" />
              <span className="core-chart-page__item-label">labels off</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Custom Columns ──────────────────────────── */}
      <section className="core-chart-page__section" id="columns">
        <h2 className="core-chart-page__section-title">
          <a href="#columns">Custom Columns</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Override the automatic column layout with a fixed column count.
          Useful for non-square arrangements or matching physical CPU topology.
        </p>
        <div className="core-chart-page__preview">
          <div className="core-chart-page__labeled-row">
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData16} size="md" colorScale="blue-red" columns={4} />
              <span className="core-chart-page__item-label">4 columns</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData16} size="md" colorScale="blue-red" columns={8} />
              <span className="core-chart-page__item-label">8 columns</span>
            </div>
            <div className="core-chart-page__labeled-item">
              <ChartComponent cores={demoData16} size="md" colorScale="blue-red" columns={16} />
              <span className="core-chart-page__item-label">16 columns</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="core-chart-page__section" id="tiers">
        <h2 className="core-chart-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Choose the right balance of features and bundle size. Lite is CSS-only with no tooltips
          or motion. Premium adds staggered fade-in and hover glow effects.
        </p>

        <div className="core-chart-page__tiers">
          {/* Lite */}
          <div
            className={`core-chart-page__tier-card${tier === 'lite' ? ' core-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="core-chart-page__tier-header">
              <span className="core-chart-page__tier-name">Lite</span>
              <span className="core-chart-page__tier-size">~0.4 KB</span>
            </div>
            <p className="core-chart-page__tier-desc">
              CSS-only grid with inline styles. No tooltips, no motion, no labels.
              Minimal footprint for simple visualizations.
            </p>
            <div className="core-chart-page__tier-import">
              import {'{'} CoreChart {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="core-chart-page__tier-preview">
              <LiteCoreChart cores={demoData8} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`core-chart-page__tier-card${tier === 'standard' ? ' core-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="core-chart-page__tier-header">
              <span className="core-chart-page__tier-name">Standard</span>
              <span className="core-chart-page__tier-size">~1.8 KB</span>
            </div>
            <p className="core-chart-page__tier-desc">
              Full-featured with tooltips, labels, color scales, size options,
              motion levels, and scoped CSS injection.
            </p>
            <div className="core-chart-page__tier-import">
              import {'{'} CoreChart {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="core-chart-page__tier-preview">
              <CoreChart cores={demoData8} colorScale="green-red" showLabels size="md" />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`core-chart-page__tier-card${tier === 'premium' ? ' core-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="core-chart-page__tier-header">
              <span className="core-chart-page__tier-name">Premium</span>
              <span className="core-chart-page__tier-size">~2.5 KB</span>
            </div>
            <p className="core-chart-page__tier-desc">
              Everything in Standard plus staggered cell fade-in animation,
              hover glow effects, and reduced-motion respecting transitions.
            </p>
            <div className="core-chart-page__tier-import">
              import {'{'} CoreChart {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="core-chart-page__tier-preview">
              <PremiumCoreChart cores={demoData8} colorScale="brand" showLabels size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="core-chart-page__section" id="props">
        <h2 className="core-chart-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="core-chart-page__section-desc">
          All props accepted by CoreChart. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={coreChartProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="core-chart-page__section" id="accessibility">
        <h2 className="core-chart-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="core-chart-page__section-desc">
          Built with semantic markup and comprehensive ARIA support for screen readers.
        </p>
        <Card variant="default" padding="md">
          <ul className="core-chart-page__a11y-list">
            <li className="core-chart-page__a11y-item">
              <span className="core-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="core-chart-page__a11y-key">role="img"</code> with a descriptive aria-label including core count.
              </span>
            </li>
            <li className="core-chart-page__a11y-item">
              <span className="core-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltips:</strong> Hover tooltips provide per-core usage details for sighted users.
              </span>
            </li>
            <li className="core-chart-page__a11y-item">
              <span className="core-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="core-chart-page__a11y-key">prefers-reduced-motion</code> and motion level settings.
              </span>
            </li>
            <li className="core-chart-page__a11y-item">
              <span className="core-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="core-chart-page__a11y-key">forced-colors: active</code> with visible cell borders.
              </span>
            </li>
            <li className="core-chart-page__a11y-item">
              <span className="core-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color scales:</strong> Multiple scales ensure usability for various forms of color vision deficiency.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ─────────────────────────────────── */}
      <section className="core-chart-page__section" id="source">
        <h2 className="core-chart-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="core-chart-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/core-chart.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="core-chart-page__source-link"
        >
          <Icon name="code" size="sm" /> src/domain/core-chart.tsx
        </a>
      </section>
    </div>
  )
}
