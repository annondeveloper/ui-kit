'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RingChart } from '@ui/domain/ring-chart'
import { RingChart as LiteRingChart } from '@ui/lite/ring-chart'
import { RingChart as PremiumRingChart } from '@ui/premium/ring-chart'
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
    @scope (.ring-chart-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ring-chart-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .ring-chart-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ring-chart-page__hero::before {
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
        animation: ring-chart-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ring-chart-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ring-chart-page__hero::before { animation: none; }
      }

      .ring-chart-page__title {
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

      .ring-chart-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ring-chart-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ring-chart-page__import-code {
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

      .ring-chart-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .ring-chart-page__section {
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
        animation: ring-chart-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ring-chart-section-reveal {
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
        .ring-chart-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .ring-chart-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .ring-chart-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .ring-chart-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ring-chart-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .ring-chart-page__preview {
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

      .ring-chart-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .ring-chart-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container ring-chart-page (max-width: 680px) {
        .ring-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .ring-chart-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .ring-chart-page__playground {
          grid-template-columns: 1fr;
        }
        .ring-chart-page__playground-controls {
          position: static !important;
        }
      }

      .ring-chart-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .ring-chart-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .ring-chart-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ring-chart-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .ring-chart-page__playground-controls {
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

      .ring-chart-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ring-chart-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ring-chart-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ring-chart-page__option-btn {
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
      .ring-chart-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ring-chart-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ring-chart-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ring-chart-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ring-chart-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .ring-chart-page__slider-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ring-chart-page__slider {
        flex: 1;
        accent-color: var(--brand);
      }

      .ring-chart-page__slider-value {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
        min-inline-size: 2.5rem;
        text-align: end;
        font-weight: 600;
      }

      /* ── Labeled row ────────────────────────────────── */

      .ring-chart-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-end;
      }

      .ring-chart-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .ring-chart-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .ring-chart-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .ring-chart-page__tier-card {
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

      .ring-chart-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ring-chart-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .ring-chart-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ring-chart-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ring-chart-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .ring-chart-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .ring-chart-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .ring-chart-page__tier-import {
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

      .ring-chart-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .ring-chart-page__code-tabs {
        margin-block-start: 1rem;
      }

      .ring-chart-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .ring-chart-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .ring-chart-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .ring-chart-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .ring-chart-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ring-chart-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .ring-chart-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .ring-chart-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .ring-chart-page__hero { padding: 2rem 1.25rem; }
        .ring-chart-page__title { font-size: 1.75rem; }
        .ring-chart-page__preview { padding: 1.75rem; }
        .ring-chart-page__playground { grid-template-columns: 1fr; }
        .ring-chart-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .ring-chart-page__labeled-row { gap: 1rem; }
        .ring-chart-page__tiers { grid-template-columns: 1fr; }
        .ring-chart-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .ring-chart-page__hero { padding: 1.5rem 1rem; }
        .ring-chart-page__title { font-size: 1.5rem; }
        .ring-chart-page__preview { padding: 1rem; }
        .ring-chart-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .ring-chart-page__import-code,
      .ring-chart-page code,
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

const ringChartProps: PropDef[] = [
  { name: 'value', type: 'number', description: 'Current value (clamped between 0 and max).' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value for the ring.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Ring size: sm (48px), md (64px), lg (96px).' },
  { name: 'thickness', type: 'number', description: 'Stroke width in pixels. Defaults per size: sm=4, md=6, lg=8.' },
  { name: 'color', type: 'string', default: "'oklch(65% 0.2 270)'", description: 'Fill stroke color. Accepts any CSS color value.' },
  { name: 'label', type: 'ReactNode', description: 'Custom center label. Overrides the default percentage display.' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the percentage value in the center of the ring.' },
  { name: 'animated', type: 'boolean', default: 'true', description: 'Enable stroke transition animation.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']

const COLOR_OPTIONS = [
  { value: 'oklch(65% 0.2 270)', label: 'Brand (Indigo)' },
  { value: 'oklch(72% 0.19 155)', label: 'Green' },
  { value: 'oklch(62% 0.22 25)', label: 'Red' },
  { value: 'oklch(78% 0.17 85)', label: 'Yellow' },
  { value: 'oklch(70% 0.16 200)', label: 'Cyan' },
  { value: 'oklch(68% 0.18 320)', label: 'Pink' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { RingChart } from '@annondeveloper/ui-kit/lite'",
  standard: "import { RingChart } from '@annondeveloper/ui-kit'",
  premium: "import { RingChart } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="ring-chart-page__copy-btn"
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
    <div className="ring-chart-page__control-group">
      <span className="ring-chart-page__control-label">{label}</span>
      <div className="ring-chart-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`ring-chart-page__option-btn${opt === value ? ' ring-chart-page__option-btn--active' : ''}`}
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
    <label className="ring-chart-page__toggle-label">
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
  value: number,
  size: Size,
  thickness: number | undefined,
  color: string,
  showValue: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push(`  value={${value}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (thickness) props.push(`  thickness={${thickness}}`)
  if (color !== 'oklch(65% 0.2 270)') props.push(`  color="${color}"`)
  if (showValue) props.push('  showValue')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

<RingChart
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, value: number, size: Size, color: string): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const svgSize = size === 'sm' ? 48 : size === 'lg' ? 96 : 64
  const stroke = size === 'sm' ? 4 : size === 'lg' ? 8 : 6
  const r = (svgSize - stroke) / 2
  const circ = (2 * Math.PI * r).toFixed(1)
  const offset = (2 * Math.PI * r * (1 - value / 100)).toFixed(1)

  return `<!-- RingChart -- @annondeveloper/ui-kit ${tierLabel} tier -->
<div class="ui-ring-chart" data-size="${size}" role="meter"
  aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"
  style="position: relative; display: inline-flex; align-items: center; justify-content: center; width: ${svgSize}px; height: ${svgSize}px;">
  <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="transform: rotate(-90deg);">
    <circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${r}" fill="none"
      stroke="oklch(100% 0 0 / 0.06)" stroke-width="${stroke}" />
    <circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${r}" fill="none"
      stroke="${color}" stroke-width="${stroke}"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" />
  </svg>
  <span style="position: absolute; font-size: 0.75rem; font-weight: 700;">${value}%</span>
</div>

<style>
@import '@annondeveloper/ui-kit/css/components/ring-chart.css';
</style>`
}

function generateVueCode(tier: Tier, value: number, size: Size, color: string, showValue: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <RingChart :value="${value}" ${size !== 'md' ? `size="${size === 'sm' ? '48' : '96'}" ` : ''}${color !== 'oklch(65% 0.2 270)' ? `color="${color}" ` : ''}${showValue ? 'show-value ' : ''}/>
</template>

<script setup>
// Lite tier uses inline SVG -- see HTML+CSS tab for details
import { RingChart } from '@annondeveloper/ui-kit/lite'
</script>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`:value="${value}"`]
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (color !== 'oklch(65% 0.2 270)') attrs.push(`color="${color}"`)
  if (showValue) attrs.push('show-value')

  return `<template>
  <RingChart
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { RingChart } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, value: number, size: Size, color: string): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (SVG-based) -->
<!-- RingChart renders an SVG donut; use the CSS import for styling -->
<div class="ui-lite-ring-chart" role="meter"
  [attr.aria-valuenow]="${value}" aria-valuemin="0" aria-valuemax="100">
  <!-- See HTML+CSS tab for the full SVG markup -->
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-ring-chart" data-size="${size}" role="meter"
  [attr.aria-valuenow]="${value}" aria-valuemin="0" aria-valuemax="100">
  <!-- See HTML+CSS tab for the full SVG markup -->
</div>

/* Import component CSS */
@import '${importPath}/css/components/ring-chart.css';`
}

function generateSvelteCode(tier: Tier, value: number, size: Size, color: string, showValue: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier -->
<script>
  import { RingChart } from '@annondeveloper/ui-kit/lite';
</script>

<RingChart value={${value}} ${size !== 'md' ? `size={${size === 'sm' ? 48 : 96}} ` : ''}${color !== 'oklch(65% 0.2 270)' ? `color="${color}" ` : ''}${showValue ? 'showValue ' : ''}/>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`value={${value}}`]
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (color !== 'oklch(65% 0.2 270)') attrs.push(`color="${color}"`)
  if (showValue) attrs.push('showValue')

  return `<script>
  import { RingChart } from '${importPath}';
</script>

<RingChart
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [value, setValue] = useState(72)
  const [size, setSize] = useState<Size>('md')
  const [thickness, setThickness] = useState<number | undefined>(undefined)
  const [colorIdx, setColorIdx] = useState(0)
  const [showValue, setShowValue] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const color = COLOR_OPTIONS[colorIdx].value

  const ChartComponent = tier === 'lite' ? LiteRingChart : tier === 'premium' ? PremiumRingChart : RingChart

  const reactCode = useMemo(
    () => generateReactCode(tier, value, size, thickness, color, showValue, motion),
    [tier, value, size, thickness, color, showValue, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, value, size, color), [tier, value, size, color])
  const vueCode = useMemo(() => generateVueCode(tier, value, size, color, showValue), [tier, value, size, color, showValue])
  const angularCode = useMemo(() => generateAngularCode(tier, value, size, color), [tier, value, size, color])
  const svelteCode = useMemo(() => generateSvelteCode(tier, value, size, color, showValue), [tier, value, size, color, showValue])

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
    value,
    size: tier === 'lite' ? (size === 'sm' ? 48 : size === 'lg' ? 96 : 64) : size,
    color,
    showValue,
  }
  if (thickness) chartProps.thickness = thickness
  if (tier !== 'lite') chartProps.motion = motion

  return (
    <section className="ring-chart-page__section" id="playground">
      <h2 className="ring-chart-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ring-chart-page__section-desc">
        Adjust the value, size, thickness, and color to see the ring chart update in real-time.
      </p>

      <div className="ring-chart-page__playground">
        <div className="ring-chart-page__playground-preview">
          <div className="ring-chart-page__playground-result">
            <ChartComponent {...chartProps as any} />
          </div>

          <div className="ring-chart-page__code-tabs">
            <div className="ring-chart-page__export-row">
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
              {copyStatus && <span className="ring-chart-page__export-status">{copyStatus}</span>}
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

        <div className="ring-chart-page__playground-controls">
          {/* Value slider */}
          <div className="ring-chart-page__control-group">
            <span className="ring-chart-page__control-label">Value</span>
            <div className="ring-chart-page__slider-row">
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                className="ring-chart-page__slider"
              />
              <span className="ring-chart-page__slider-value">{value}%</span>
            </div>
          </div>

          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {/* Thickness */}
          <div className="ring-chart-page__control-group">
            <span className="ring-chart-page__control-label">Thickness (optional)</span>
            <input
              type="number"
              min={1}
              max={20}
              value={thickness ?? ''}
              placeholder="auto"
              onChange={e => setThickness(e.target.value ? Number(e.target.value) : undefined)}
              className="ring-chart-page__text-input"
            />
          </div>

          {/* Color */}
          <OptionGroup
            label="Color"
            options={COLOR_OPTIONS.map(c => c.label) as unknown as readonly string[]}
            value={COLOR_OPTIONS[colorIdx].label}
            onChange={v => setColorIdx(COLOR_OPTIONS.findIndex(c => c.label === v))}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="ring-chart-page__control-group">
            <span className="ring-chart-page__control-label">Toggles</span>
            <Toggle label="Show Value" checked={showValue} onChange={setShowValue} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RingChartPage() {
  useStyles('ring-chart-page', pageStyles)

  const { tier, setTier } = useTier()
  const ChartComponent = tier === 'lite' ? LiteRingChart : tier === 'premium' ? PremiumRingChart : RingChart

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.ring-chart-page__section')
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
    <div className="ring-chart-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ring-chart-page__hero">
        <h1 className="ring-chart-page__title">RingChart</h1>
        <p className="ring-chart-page__desc">
          Circular progress/gauge visualization with animated SVG stroke. Supports three sizes,
          custom colors, center labels, and smooth stroke-draw animation.
        </p>
        <div className="ring-chart-page__import-row">
          <code className="ring-chart-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Multiple Values ─────────────────────────── */}
      <section className="ring-chart-page__section" id="values">
        <h2 className="ring-chart-page__section-title">
          <a href="#values">Different Values</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Ring charts at different fill levels, from empty to full.
          The stroke animates smoothly when values change.
        </p>
        <div className="ring-chart-page__preview">
          <div className="ring-chart-page__labeled-row">
            {[0, 25, 50, 75, 100].map(v => (
              <div key={v} className="ring-chart-page__labeled-item">
                <ChartComponent
                  value={v}
                  showValue
                  {...(tier === 'lite' ? { size: 64 } : { size: 'md' as const })}
                />
                <span className="ring-chart-page__item-label">{v}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Sizes ───────────────────────────────────── */}
      <section className="ring-chart-page__section" id="sizes">
        <h2 className="ring-chart-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Three sizes: sm (48px), md (64px), and lg (96px). Each size adjusts the stroke
          thickness proportionally.
        </p>
        <div className="ring-chart-page__preview">
          <div className="ring-chart-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="ring-chart-page__labeled-item">
                <ChartComponent
                  value={72}
                  showValue
                  {...(tier === 'lite'
                    ? { size: s === 'sm' ? 48 : s === 'lg' ? 96 : 64 }
                    : { size: s }
                  )}
                />
                <span className="ring-chart-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Colors ──────────────────────────────────── */}
      <section className="ring-chart-page__section" id="colors">
        <h2 className="ring-chart-page__section-title">
          <a href="#colors">Color Options</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Pass any CSS color to the <code>color</code> prop. OKLCH values work best
          for perceptual uniformity across the UI.
        </p>
        <div className="ring-chart-page__preview">
          <div className="ring-chart-page__labeled-row">
            {COLOR_OPTIONS.map(c => (
              <div key={c.label} className="ring-chart-page__labeled-item">
                <ChartComponent
                  value={65}
                  color={c.value}
                  showValue
                  {...(tier === 'lite' ? { size: 64 } : { size: 'md' as const })}
                />
                <span className="ring-chart-page__item-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Custom Thickness ────────────────────────── */}
      <section className="ring-chart-page__section" id="thickness">
        <h2 className="ring-chart-page__section-title">
          <a href="#thickness">Custom Thickness</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Override the default stroke thickness for thin progress indicators or bold gauges.
        </p>
        <div className="ring-chart-page__preview">
          <div className="ring-chart-page__labeled-row">
            {[2, 4, 8, 12].map(t => (
              <div key={t} className="ring-chart-page__labeled-item">
                <ChartComponent
                  value={60}
                  thickness={t}
                  showValue
                  {...(tier === 'lite' ? { size: 64 } : { size: 'md' as const })}
                />
                <span className="ring-chart-page__item-label">{t}px</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. With Labels ─────────────────────────────── */}
      <section className="ring-chart-page__section" id="labels">
        <h2 className="ring-chart-page__section-title">
          <a href="#labels">Center Labels</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Use <code>showValue</code> for automatic percentage display, or pass a custom
          <code> label</code> prop for any ReactNode content.
        </p>
        <div className="ring-chart-page__preview">
          <div className="ring-chart-page__labeled-row">
            <div className="ring-chart-page__labeled-item">
              <ChartComponent
                value={85}
                showValue
                {...(tier === 'lite' ? { size: 96 } : { size: 'lg' as const })}
              />
              <span className="ring-chart-page__item-label">showValue</span>
            </div>
            <div className="ring-chart-page__labeled-item">
              <ChartComponent
                value={85}
                label="CPU"
                {...(tier === 'lite' ? { size: 96 } : { size: 'lg' as const })}
              />
              <span className="ring-chart-page__item-label">custom label</span>
            </div>
            <div className="ring-chart-page__labeled-item">
              <ChartComponent
                value={85}
                {...(tier === 'lite' ? { size: 96 } : { size: 'lg' as const })}
              />
              <span className="ring-chart-page__item-label">no label</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="ring-chart-page__section" id="tiers">
        <h2 className="ring-chart-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple SVG inline.
          Premium adds aurora glow, animated stroke draw-in, and a shimmer sweep.
        </p>

        <div className="ring-chart-page__tiers">
          {/* Lite */}
          <div
            className={`ring-chart-page__tier-card${tier === 'lite' ? ' ring-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="ring-chart-page__tier-header">
              <span className="ring-chart-page__tier-name">Lite</span>
              <span className="ring-chart-page__tier-size">~0.5 KB</span>
            </div>
            <p className="ring-chart-page__tier-desc">
              Simple SVG donut with inline styles. No animation, no scoped CSS.
              Pure render with forwardRef.
            </p>
            <div className="ring-chart-page__tier-import">
              import {'{'} RingChart {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="ring-chart-page__tier-preview">
              <LiteRingChart value={72} showValue />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`ring-chart-page__tier-card${tier === 'standard' ? ' ring-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="ring-chart-page__tier-header">
              <span className="ring-chart-page__tier-name">Standard</span>
              <span className="ring-chart-page__tier-size">~1.5 KB</span>
            </div>
            <p className="ring-chart-page__tier-desc">
              Full-featured with scoped CSS, stroke transition animation,
              ARIA meter role, motion levels, and error boundary.
            </p>
            <div className="ring-chart-page__tier-import">
              import {'{'} RingChart {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="ring-chart-page__tier-preview">
              <RingChart value={72} showValue size="md" />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`ring-chart-page__tier-card${tier === 'premium' ? ' ring-chart-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="ring-chart-page__tier-header">
              <span className="ring-chart-page__tier-name">Premium</span>
              <span className="ring-chart-page__tier-size">~2.2 KB</span>
            </div>
            <p className="ring-chart-page__tier-desc">
              Everything in Standard plus aurora glow filter, spring-eased
              stroke draw-in animation, and periodic shimmer sweep.
            </p>
            <div className="ring-chart-page__tier-import">
              import {'{'} RingChart {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="ring-chart-page__tier-preview">
              <PremiumRingChart value={72} showValue size="md" color="oklch(65% 0.2 270)" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="ring-chart-page__section" id="props">
        <h2 className="ring-chart-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          All props accepted by RingChart. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={ringChartProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="ring-chart-page__section" id="accessibility">
        <h2 className="ring-chart-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          Built with semantic markup and comprehensive ARIA support for assistive technologies.
        </p>
        <Card variant="default" padding="md">
          <ul className="ring-chart-page__a11y-list">
            <li className="ring-chart-page__a11y-item">
              <span className="ring-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="ring-chart-page__a11y-key">role="meter"</code> with aria-valuenow, aria-valuemin, and aria-valuemax.
              </span>
            </li>
            <li className="ring-chart-page__a11y-item">
              <span className="ring-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> String labels are used as <code className="ring-chart-page__a11y-key">aria-label</code>; defaults to "Ring chart".
              </span>
            </li>
            <li className="ring-chart-page__a11y-item">
              <span className="ring-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>SVG hidden:</strong> The decorative SVG uses <code className="ring-chart-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="ring-chart-page__a11y-item">
              <span className="ring-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="ring-chart-page__a11y-key">prefers-reduced-motion</code> and motion level settings.
              </span>
            </li>
            <li className="ring-chart-page__a11y-item">
              <span className="ring-chart-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="ring-chart-page__a11y-key">forced-colors: active</code> with GrayText track and Highlight fill.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ─────────────────────────────────── */}
      <section className="ring-chart-page__section" id="source">
        <h2 className="ring-chart-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="ring-chart-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/ring-chart.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="ring-chart-page__source-link"
        >
          <Icon name="code" size="sm" /> src/domain/ring-chart.tsx
        </a>
      </section>
    </div>
  )
}
