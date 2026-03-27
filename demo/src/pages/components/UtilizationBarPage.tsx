'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { UtilizationBar } from '@ui/domain/utilization-bar'
import { UtilizationBar as LiteUtilizationBar } from '@ui/lite/utilization-bar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const CPU_SEGMENTS = [
  { value: 45, label: 'User', color: 'oklch(65% 0.2 270)' },
  { value: 12, label: 'System', color: 'oklch(72% 0.19 155)' },
  { value: 8, label: 'I/O Wait', color: 'oklch(80% 0.18 85)' },
]

const MEMORY_SEGMENTS = [
  { value: 32, label: 'Used', color: 'oklch(65% 0.2 270)' },
  { value: 24, label: 'Cached', color: 'oklch(72% 0.19 155)' },
  { value: 8, label: 'Buffers', color: 'oklch(80% 0.18 85)' },
]

const DISK_SEGMENTS = [
  { value: 78, label: 'Data', color: 'oklch(62% 0.22 25)' },
  { value: 12, label: 'System', color: 'oklch(80% 0.18 85)' },
]

const SIMPLE_SEGMENT = [
  { value: 67, label: 'Used' },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.utilization-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: utilization-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .utilization-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .utilization-bar-page__hero::before {
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
        animation: ub-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ub-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .utilization-bar-page__hero::before { animation: none; }
      }

      .utilization-bar-page__title {
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

      .utilization-bar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .utilization-bar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .utilization-bar-page__import-code {
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

      .utilization-bar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .utilization-bar-page__section {
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
        animation: ub-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ub-section-reveal {
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
        .utilization-bar-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .utilization-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .utilization-bar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .utilization-bar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .utilization-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .utilization-bar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .utilization-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .utilization-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container utilization-bar-page (max-width: 680px) {
        .utilization-bar-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .utilization-bar-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .utilization-bar-page__playground-result {
        min-block-size: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        padding: 3rem 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .utilization-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .utilization-bar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .utilization-bar-page__playground-controls {
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

      .utilization-bar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .utilization-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .utilization-bar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .utilization-bar-page__option-btn {
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
      .utilization-bar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .utilization-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .utilization-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .utilization-bar-page__slider-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .utilization-bar-page__slider-row input[type="range"] {
        flex: 1;
        accent-color: var(--brand);
      }

      .utilization-bar-page__slider-value {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
        min-inline-size: 2.5rem;
        text-align: end;
      }

      /* ── Labeled items ──────────────────────────────── */

      .utilization-bar-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .utilization-bar-page__labeled-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 200px;
      }

      .utilization-bar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .utilization-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .utilization-bar-page__tier-card {
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

      .utilization-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .utilization-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .utilization-bar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .utilization-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .utilization-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .utilization-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .utilization-bar-page__tier-import {
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

      .utilization-bar-page__tier-preview {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs & exports ────────────────────────── */

      .utilization-bar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .utilization-bar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .utilization-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      .utilization-bar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .utilization-bar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .utilization-bar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .utilization-bar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .utilization-bar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .utilization-bar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .utilization-bar-page__hero { padding: 2rem 1.25rem; }
        .utilization-bar-page__title { font-size: 1.75rem; }
        .utilization-bar-page__preview { padding: 1.75rem; }
        .utilization-bar-page__playground { grid-template-columns: 1fr; }
        .utilization-bar-page__tiers { grid-template-columns: 1fr; }
        .utilization-bar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .utilization-bar-page__hero { padding: 1.5rem 1rem; }
        .utilization-bar-page__title { font-size: 1.5rem; }
        .utilization-bar-page__preview { padding: 1rem; }
      }

      .utilization-bar-page__import-code,
      .utilization-bar-page code,
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

const barProps: PropDef[] = [
  { name: 'segments', type: 'UtilizationSegment[]', required: true, description: 'Array of segments with value (number), optional color (CSS color string), and optional label.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value representing full bar width. Segment widths are calculated as (value/max * 100)%.' },
  { name: 'thresholds', type: '{ warning: number; critical: number }', description: 'Overlay threshold marker lines at the specified percentages.' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show a legend row below the bar with colored dots and segment labels.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls bar track height (6/8/12px).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables segment width transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { UtilizationBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { UtilizationBar } from '@annondeveloper/ui-kit'",
  premium: "import { UtilizationBar } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="utilization-bar-page__copy-btn"
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
    <div className="utilization-bar-page__control-group">
      <span className="utilization-bar-page__control-label">{label}</span>
      <div className="utilization-bar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`utilization-bar-page__option-btn${opt === value ? ' utilization-bar-page__option-btn--active' : ''}`}
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
    <label className="utilization-bar-page__toggle-label">
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

function generateReactCode(tier: Tier, size: Size, showLabels: boolean, useThresholds: boolean, segmentCount: number, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  segments={segments}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showLabels) props.push('  showLabels')
  if (useThresholds) props.push('  thresholds={{ warning: 70, critical: 90 }}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\nimport type { UtilizationSegment } from '@annondeveloper/ui-kit'\n\nconst segments: UtilizationSegment[] = [\n  { value: 45, label: 'User', color: 'oklch(65% 0.2 270)' },\n  { value: 12, label: 'System', color: 'oklch(72% 0.19 155)' },${segmentCount > 2 ? "\n  { value: 8, label: 'I/O Wait', color: 'oklch(80% 0.18 85)' }," : ''}\n]\n\n<UtilizationBar\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, size: Size): string {
  const cls = tier === 'lite' ? 'ui-lite-utilization-bar' : 'ui-utilization-bar'
  return `<!-- UtilizationBar — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/utilization-bar.css'}">

<div class="${cls}" data-size="${size}" role="group" aria-label="Utilization">
  <div class="${cls}__track">
    <div class="${cls}__segment" style="width: 45%; background: oklch(65% 0.2 270)"></div>
    <div class="${cls}__segment" style="width: 12%; background: oklch(72% 0.19 155)"></div>
    <div class="${cls}__segment" style="width: 8%; background: oklch(80% 0.18 85)"></div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, showLabels: boolean, useThresholds: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const extraProps = [
    showLabels ? '\n    showLabels' : '',
    useThresholds ? '\n    :thresholds="{ warning: 70, critical: 90 }"' : '',
  ].join('')
  return `<template>\n  <UtilizationBar\n    :segments="segments"\n    size="${size}"${extraProps}\n  />\n</template>\n\n<script setup>\nimport { UtilizationBar } from '${importPath}'\nimport { ref } from 'vue'\n\nconst segments = ref([\n  { value: 45, label: 'User', color: 'oklch(65% 0.2 270)' },\n  { value: 12, label: 'System', color: 'oklch(72% 0.19 155)' },\n])\n</script>`
}

function generateAngularCode(tier: Tier, size: Size): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->\n<ui-utilization-bar\n  [segments]="segments"\n  size="${size}"\n></ui-utilization-bar>\n\n/* Import CSS */\n@import '${importPath}/css/components/utilization-bar.css';`
}

function generateSvelteCode(tier: Tier, size: Size, showLabels: boolean, useThresholds: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const extraProps = [
    showLabels ? '\n  showLabels' : '',
    useThresholds ? '\n  thresholds={{ warning: 70, critical: 90 }}' : '',
  ].join('')
  return `<script>\n  import { UtilizationBar } from '${importPath}';\n\n  const segments = [\n    { value: 45, label: 'User', color: 'oklch(65% 0.2 270)' },\n    { value: 12, label: 'System', color: 'oklch(72% 0.19 155)' },\n  ];\n</script>\n\n<UtilizationBar\n  {segments}\n  size="${size}"${extraProps}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [showLabels, setShowLabels] = useState(true)
  const [useThresholds, setUseThresholds] = useState(true)
  const [dataset, setDataset] = useState<'cpu' | 'memory' | 'simple'>('cpu')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const BarComponent = tier === 'lite' ? LiteUtilizationBar : UtilizationBar

  const segments = dataset === 'cpu' ? CPU_SEGMENTS : dataset === 'memory' ? MEMORY_SEGMENTS : SIMPLE_SEGMENT

  const reactCode = useMemo(() => generateReactCode(tier, size, showLabels, useThresholds, segments.length, motion), [tier, size, showLabels, useThresholds, segments.length, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, size), [tier, size])
  const vueCode = useMemo(() => generateVueCode(tier, size, showLabels, useThresholds), [tier, size, showLabels, useThresholds])
  const angularCode = useMemo(() => generateAngularCode(tier, size), [tier, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, showLabels, useThresholds), [tier, size, showLabels, useThresholds])

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

  const previewProps: Record<string, unknown> = { segments, size }
  if (showLabels) previewProps.showLabels = true
  if (useThresholds) previewProps.thresholds = { warning: 70, critical: 90 }
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="utilization-bar-page__section" id="playground">
      <h2 className="utilization-bar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="utilization-bar-page__section-desc">
        Switch datasets, toggle labels and threshold markers, and adjust the bar size to see changes in real-time.
      </p>

      <div className="utilization-bar-page__playground">
        <div className="utilization-bar-page__playground-preview">
          <div className="utilization-bar-page__playground-result">
            <BarComponent {...previewProps} />
          </div>

          <div className="utilization-bar-page__code-tabs">
            <div className="utilization-bar-page__export-row">
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
              {copyStatus && <span className="utilization-bar-page__export-status">{copyStatus}</span>}
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

        <div className="utilization-bar-page__playground-controls">
          <OptionGroup label="Dataset" options={['cpu', 'memory', 'simple'] as const} value={dataset} onChange={setDataset} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="utilization-bar-page__control-group">
            <span className="utilization-bar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show labels" checked={showLabels} onChange={setShowLabels} />
              <Toggle label="Threshold markers" checked={useThresholds} onChange={setUseThresholds} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UtilizationBarPage() {
  useStyles('utilization-bar-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.utilization-bar-page__section')
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

  const BarComponent = tier === 'lite' ? LiteUtilizationBar : UtilizationBar

  return (
    <div className="utilization-bar-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="utilization-bar-page__hero">
        <h1 className="utilization-bar-page__title">UtilizationBar</h1>
        <p className="utilization-bar-page__desc">
          Multi-segment stacked bar chart for resource utilization. Supports tooltips on hover,
          threshold marker lines, labeled legends, and three track sizes.
        </p>
        <div className="utilization-bar-page__import-row">
          <code className="utilization-bar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Sizes ────────────────────────────────────── */}
      <section className="utilization-bar-page__section" id="sizes">
        <h2 className="utilization-bar-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Three track heights for different density contexts. Small for inline metrics, medium for dashboards, large for hero displays.
        </p>
        <div className="utilization-bar-page__preview">
          {SIZES.map(s => (
            <div key={s} className="utilization-bar-page__labeled-item">
              <span className="utilization-bar-page__item-label">{s}</span>
              <BarComponent segments={CPU_SEGMENTS} size={s} showLabels />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Threshold Markers ───────────────────────── */}
      <section className="utilization-bar-page__section" id="thresholds">
        <h2 className="utilization-bar-page__section-title">
          <a href="#thresholds">Threshold Markers</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Overlay warning and critical threshold lines on the track to visually indicate capacity limits.
          The markers are absolute-positioned at the specified percentage.
        </p>
        <div className="utilization-bar-page__preview">
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <BarComponent
              segments={[{ value: 85, label: 'Disk Usage', color: 'oklch(62% 0.22 25)' }]}
              size="lg"
              showLabels
              thresholds={{ warning: 70, critical: 90 }}
            />
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<UtilizationBar\n  segments={[{ value: 85, label: 'Disk Usage' }]}\n  size="lg"\n  showLabels\n  thresholds={{ warning: 70, critical: 90 }}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Multi-Segment Stacking ──────────────────── */}
      <section className="utilization-bar-page__section" id="segments">
        <h2 className="utilization-bar-page__section-title">
          <a href="#segments">Multi-Segment Stacking</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Stack multiple segments to break down resource usage into categories. Each segment
          has an independent color and optional label. Segments with no custom color use the
          built-in OKLCH palette.
        </p>
        <div className="utilization-bar-page__preview">
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <span className="utilization-bar-page__item-label">CPU breakdown</span>
            <BarComponent segments={CPU_SEGMENTS} size="lg" showLabels />
          </div>
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <span className="utilization-bar-page__item-label">Memory breakdown</span>
            <BarComponent segments={MEMORY_SEGMENTS} size="lg" showLabels />
          </div>
        </div>
      </section>

      {/* ── 6. Real-World Examples ─────────────────────── */}
      <section className="utilization-bar-page__section" id="examples">
        <h2 className="utilization-bar-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Server monitoring dashboard layout with multiple utilization bars and threshold markers.
        </p>
        <div className="utilization-bar-page__preview">
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', inlineSize: '100%', marginBlockEnd: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>CPU</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>65 / 100</span>
            </div>
            <BarComponent segments={CPU_SEGMENTS} size="md" showLabels thresholds={{ warning: 70, critical: 90 }} />
          </div>
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', inlineSize: '100%', marginBlockEnd: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Memory</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>64 / 100 GB</span>
            </div>
            <BarComponent segments={MEMORY_SEGMENTS} size="md" showLabels thresholds={{ warning: 80, critical: 95 }} />
          </div>
          <div className="utilization-bar-page__labeled-item" style={{ inlineSize: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', inlineSize: '100%', marginBlockEnd: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Disk</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>90 / 100 GB</span>
            </div>
            <BarComponent segments={DISK_SEGMENTS} size="md" showLabels thresholds={{ warning: 80, critical: 95 }} />
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="utilization-bar-page__section" id="tiers">
        <h2 className="utilization-bar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple stacked bar with title tooltips.
          Standard adds hover tooltips, threshold markers, labels, and animated width transitions.
        </p>

        <div className="utilization-bar-page__tiers">
          {/* Lite */}
          <div
            className={`utilization-bar-page__tier-card${tier === 'lite' ? ' utilization-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="utilization-bar-page__tier-header">
              <span className="utilization-bar-page__tier-name">Lite</span>
              <span className="utilization-bar-page__tier-size">~0.3 KB</span>
            </div>
            <p className="utilization-bar-page__tier-desc">
              CSS-only stacked bar with native title tooltips.
              No hover popover, no threshold markers, no label legend.
            </p>
            <div className="utilization-bar-page__tier-import">
              import {'{'} UtilizationBar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="utilization-bar-page__tier-preview">
              <LiteUtilizationBar segments={CPU_SEGMENTS} />
            </div>
            <div className="utilization-bar-page__size-breakdown">
              <div className="utilization-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`utilization-bar-page__tier-card${tier === 'standard' ? ' utilization-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="utilization-bar-page__tier-header">
              <span className="utilization-bar-page__tier-name">Standard</span>
              <span className="utilization-bar-page__tier-size">~2.0 KB</span>
            </div>
            <p className="utilization-bar-page__tier-desc">
              Full-featured bar with hover tooltips, threshold markers,
              label legend, animated width transitions, and motion-level support.
            </p>
            <div className="utilization-bar-page__tier-import">
              import {'{'} UtilizationBar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="utilization-bar-page__tier-preview">
              <UtilizationBar segments={CPU_SEGMENTS} showLabels size="md" />
            </div>
            <div className="utilization-bar-page__size-breakdown">
              <div className="utilization-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`utilization-bar-page__tier-card${tier === 'premium' ? ' utilization-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="utilization-bar-page__tier-header">
              <span className="utilization-bar-page__tier-name">Premium</span>
              <span className="utilization-bar-page__tier-size">~3.2 KB</span>
            </div>
            <p className="utilization-bar-page__tier-desc">
              Everything in Standard plus spring-physics width animation,
              gradient shimmer on hover, and entrance reveal animation.
            </p>
            <div className="utilization-bar-page__tier-import">
              import {'{'} UtilizationBar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="utilization-bar-page__tier-preview">
              <UtilizationBar segments={CPU_SEGMENTS} showLabels size="md" />
            </div>
            <div className="utilization-bar-page__size-breakdown">
              <div className="utilization-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="utilization-bar-page__section" id="props">
        <h2 className="utilization-bar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          All props accepted by UtilizationBar. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={barProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="utilization-bar-page__section" id="accessibility">
        <h2 className="utilization-bar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="utilization-bar-page__section-desc">
          Designed for screen readers and keyboard users with proper ARIA roles.
        </p>
        <Card variant="default" padding="md">
          <ul className="utilization-bar-page__a11y-list">
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> Container uses <code className="utilization-bar-page__a11y-key">role="group"</code> with <code className="utilization-bar-page__a11y-key">aria-label="Utilization"</code>.
              </span>
            </li>
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Segment tooltips:</strong> Hover tooltips show exact values in "label: value / max" format, accessible without clicking.
              </span>
            </li>
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color contrast:</strong> All OKLCH segment colors are chosen for minimum 3:1 contrast against the track background.
              </span>
            </li>
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label legend:</strong> Optional label dots provide text labels alongside colors for non-visual identification.
              </span>
            </li>
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Width transitions respect <code className="utilization-bar-page__a11y-key">prefers-reduced-motion</code> and disable at motion level 0.
              </span>
            </li>
            <li className="utilization-bar-page__a11y-item">
              <span className="utilization-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="utilization-bar-page__a11y-key">forced-colors: active</code> with visible borders on the track and Highlight-colored threshold markers.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
