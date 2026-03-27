'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ThresholdGauge } from '@ui/domain/threshold-gauge'
import { ThresholdGauge as LiteThresholdGauge } from '@ui/lite/threshold-gauge'
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
    @scope (.threshold-gauge-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: threshold-gauge-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .threshold-gauge-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .threshold-gauge-page__hero::before {
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
        animation: tg-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes tg-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .threshold-gauge-page__hero::before { animation: none; }
      }

      .threshold-gauge-page__title {
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

      .threshold-gauge-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .threshold-gauge-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .threshold-gauge-page__import-code {
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

      .threshold-gauge-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .threshold-gauge-page__section {
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
        animation: tg-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tg-section-reveal {
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
        .threshold-gauge-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .threshold-gauge-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .threshold-gauge-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .threshold-gauge-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .threshold-gauge-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .threshold-gauge-page__preview {
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

      .threshold-gauge-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .threshold-gauge-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container threshold-gauge-page (max-width: 680px) {
        .threshold-gauge-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .threshold-gauge-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .threshold-gauge-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .threshold-gauge-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .threshold-gauge-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .threshold-gauge-page__playground-controls {
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

      .threshold-gauge-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .threshold-gauge-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .threshold-gauge-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .threshold-gauge-page__option-btn {
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
      .threshold-gauge-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .threshold-gauge-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .threshold-gauge-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .threshold-gauge-page__slider-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .threshold-gauge-page__slider-row input[type="range"] {
        flex: 1;
        accent-color: var(--brand);
      }

      .threshold-gauge-page__slider-value {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
        min-inline-size: 2.5rem;
        text-align: end;
      }

      /* ── Labeled row ────────────────────────────────── */

      .threshold-gauge-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .threshold-gauge-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .threshold-gauge-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .threshold-gauge-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .threshold-gauge-page__tier-card {
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

      .threshold-gauge-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .threshold-gauge-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .threshold-gauge-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .threshold-gauge-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .threshold-gauge-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .threshold-gauge-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .threshold-gauge-page__tier-import {
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

      .threshold-gauge-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .threshold-gauge-page__code-tabs {
        margin-block-start: 1rem;
      }

      .threshold-gauge-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .threshold-gauge-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Size breakdown ────────────────────────────── */

      .threshold-gauge-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .threshold-gauge-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .threshold-gauge-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .threshold-gauge-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .threshold-gauge-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .threshold-gauge-page__a11y-key {
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
        .threshold-gauge-page__hero { padding: 2rem 1.25rem; }
        .threshold-gauge-page__title { font-size: 1.75rem; }
        .threshold-gauge-page__preview { padding: 1.75rem; }
        .threshold-gauge-page__playground { grid-template-columns: 1fr; }
        .threshold-gauge-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .threshold-gauge-page__tiers { grid-template-columns: 1fr; }
        .threshold-gauge-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .threshold-gauge-page__hero { padding: 1.5rem 1rem; }
        .threshold-gauge-page__title { font-size: 1.5rem; }
        .threshold-gauge-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .threshold-gauge-page__import-code,
      .threshold-gauge-page code,
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

const gaugeProps: PropDef[] = [
  { name: 'value', type: 'number', required: true, description: 'Current value (0-100). Clamped internally.' },
  { name: 'thresholds', type: '{ warning: number; critical: number }', description: 'Threshold values that trigger color changes. Value above warning shows amber, above critical shows red.' },
  { name: 'label', type: 'ReactNode', description: 'Text label displayed below the gauge arc.' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the numeric value centered inside the gauge arc.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the gauge diameter (80/120/160px) and stroke width.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables all transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ThresholdGauge } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ThresholdGauge } from '@annondeveloper/ui-kit'",
  premium: "import { ThresholdGauge } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="threshold-gauge-page__copy-btn"
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
    <div className="threshold-gauge-page__control-group">
      <span className="threshold-gauge-page__control-label">{label}</span>
      <div className="threshold-gauge-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`threshold-gauge-page__option-btn${opt === value ? ' threshold-gauge-page__option-btn--active' : ''}`}
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
    <label className="threshold-gauge-page__toggle-label">
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
  showValue: boolean,
  label: string,
  useThresholds: boolean,
  warningThreshold: number,
  criticalThreshold: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push(`  value={${value}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showValue) props.push('  showValue')
  if (label) props.push(`  label="${label}"`)
  if (useThresholds) props.push(`  thresholds={{ warning: ${warningThreshold}, critical: ${criticalThreshold} }}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<ThresholdGauge\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, value: number, size: Size, showValue: boolean, label: string): string {
  return `<!-- ThresholdGauge — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/threshold-gauge.css'}">

<div class="${tier === 'lite' ? 'ui-lite-threshold-gauge' : 'ui-threshold-gauge'}"
  data-size="${size}"
  role="meter"
  aria-valuenow="${value}"
  aria-valuemin="0"
  aria-valuemax="100"
  ${label ? `aria-label="${label}"` : 'aria-label="Gauge"'}
>
  <!-- SVG gauge arc rendered by component -->
  ${showValue ? `<span class="ui-threshold-gauge__value-text">${value}</span>` : ''}
  ${label ? `<div class="ui-threshold-gauge__label">${label}</div>` : ''}
</div>`
}

function generateVueCode(tier: Tier, value: number, size: Size, showValue: boolean, label: string, useThresholds: boolean, warningThreshold: number, criticalThreshold: number): string {
  if (tier === 'lite') {
    return `<template>\n  <ThresholdGauge :value="${value}" size="${size}"${showValue ? ' showValue' : ''}${label ? ` label="${label}"` : ''} />\n</template>\n\n<script setup>\nimport { ThresholdGauge } from '@annondeveloper/ui-kit/lite'\n</script>`
  }
  const thresholdProp = useThresholds ? `\n    :thresholds="{ warning: ${warningThreshold}, critical: ${criticalThreshold} }"` : ''
  return `<template>\n  <ThresholdGauge\n    :value="${value}"\n    size="${size}"${showValue ? '\n    showValue' : ''}${label ? `\n    label="${label}"` : ''}${thresholdProp}\n  />\n</template>\n\n<script setup>\nimport { ThresholdGauge } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'\n</script>`
}

function generateAngularCode(tier: Tier, value: number, size: Size, label: string): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->\n<ui-threshold-gauge\n  [value]="${value}"\n  size="${size}"\n  ${label ? `label="${label}"` : ''}\n></ui-threshold-gauge>\n\n/* Import CSS */\n@import '${importPath}/css/components/threshold-gauge.css';`
}

function generateSvelteCode(tier: Tier, value: number, size: Size, showValue: boolean, label: string, useThresholds: boolean, warningThreshold: number, criticalThreshold: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const thresholdProp = useThresholds ? `\n  thresholds={{ warning: ${warningThreshold}, critical: ${criticalThreshold} }}` : ''
  return `<script>\n  import { ThresholdGauge } from '${importPath}';\n</script>\n\n<ThresholdGauge\n  value={${value}}\n  size="${size}"${showValue ? '\n  showValue' : ''}${label ? `\n  label="${label}"` : ''}${thresholdProp}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [value, setValue] = useState(65)
  const [size, setSize] = useState<Size>('md')
  const [showValue, setShowValue] = useState(true)
  const [label, setLabel] = useState('CPU Usage')
  const [useThresholds, setUseThresholds] = useState(true)
  const [warningThreshold, setWarningThreshold] = useState(60)
  const [criticalThreshold, setCriticalThreshold] = useState(80)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const GaugeComponent = tier === 'lite' ? LiteThresholdGauge : ThresholdGauge

  const reactCode = useMemo(
    () => generateReactCode(tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold, motion),
    [tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, value, size, showValue, label),
    [tier, value, size, showValue, label],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold),
    [tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, value, size, label),
    [tier, value, size, label],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold),
    [tier, value, size, showValue, label, useThresholds, warningThreshold, criticalThreshold],
  )

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

  const previewProps: Record<string, unknown> = { value, size }
  if (showValue) previewProps.showValue = true
  if (label) previewProps.label = label
  if (useThresholds) previewProps.thresholds = { warning: warningThreshold, critical: criticalThreshold }
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="threshold-gauge-page__section" id="playground">
      <h2 className="threshold-gauge-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="threshold-gauge-page__section-desc">
        Adjust value, thresholds, and sizing to see the gauge update in real-time. Generated code updates automatically.
      </p>

      <div className="threshold-gauge-page__playground">
        <div className="threshold-gauge-page__playground-preview">
          <div className="threshold-gauge-page__playground-result">
            <GaugeComponent {...previewProps} />
          </div>

          <div className="threshold-gauge-page__code-tabs">
            <div className="threshold-gauge-page__export-row">
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
              {copyStatus && <span className="threshold-gauge-page__export-status">{copyStatus}</span>}
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

        <div className="threshold-gauge-page__playground-controls">
          <div className="threshold-gauge-page__control-group">
            <span className="threshold-gauge-page__control-label">Value</span>
            <div className="threshold-gauge-page__slider-row">
              <input type="range" min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))} />
              <span className="threshold-gauge-page__slider-value">{value}</span>
            </div>
          </div>

          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="threshold-gauge-page__control-group">
            <span className="threshold-gauge-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show value" checked={showValue} onChange={setShowValue} />
              <Toggle label="Use thresholds" checked={useThresholds} onChange={setUseThresholds} />
            </div>
          </div>

          {useThresholds && (
            <>
              <div className="threshold-gauge-page__control-group">
                <span className="threshold-gauge-page__control-label">Warning threshold</span>
                <div className="threshold-gauge-page__slider-row">
                  <input type="range" min={0} max={100} value={warningThreshold} onChange={e => setWarningThreshold(Number(e.target.value))} />
                  <span className="threshold-gauge-page__slider-value">{warningThreshold}</span>
                </div>
              </div>
              <div className="threshold-gauge-page__control-group">
                <span className="threshold-gauge-page__control-label">Critical threshold</span>
                <div className="threshold-gauge-page__slider-row">
                  <input type="range" min={0} max={100} value={criticalThreshold} onChange={e => setCriticalThreshold(Number(e.target.value))} />
                  <span className="threshold-gauge-page__slider-value">{criticalThreshold}</span>
                </div>
              </div>
            </>
          )}

          <div className="threshold-gauge-page__control-group">
            <span className="threshold-gauge-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="threshold-gauge-page__option-btn"
              style={{ padding: '0.375rem 0.625rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', inlineSize: '100%' }}
              placeholder="Gauge label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ThresholdGaugePage() {
  useStyles('threshold-gauge-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.threshold-gauge-page__section')
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

  const GaugeComponent = tier === 'lite' ? LiteThresholdGauge : ThresholdGauge

  return (
    <div className="threshold-gauge-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="threshold-gauge-page__hero">
        <h1 className="threshold-gauge-page__title">ThresholdGauge</h1>
        <p className="threshold-gauge-page__desc">
          Semicircular gauge with animated arc fill and threshold-based color coding.
          Ideal for CPU, memory, temperature, or any 0-100 metric with warning/critical zones.
        </p>
        <div className="threshold-gauge-page__import-row">
          <code className="threshold-gauge-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Sizes ────────────────────────────────────── */}
      <section className="threshold-gauge-page__section" id="sizes">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          Three sizes controlling the SVG diameter and stroke width. Each adapts its font size for the centered value.
        </p>
        <div className="threshold-gauge-page__preview">
          <div className="threshold-gauge-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="threshold-gauge-page__labeled-item">
                <GaugeComponent value={72} size={s} showValue label={s} />
                <span className="threshold-gauge-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Threshold Status Colors ──────────────────── */}
      <section className="threshold-gauge-page__section" id="thresholds">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#thresholds">Threshold Colors</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          When thresholds are configured, the arc color changes from green (ok) to amber (warning) to red (critical)
          based on the current value relative to the threshold boundaries.
        </p>
        <div className="threshold-gauge-page__preview">
          <div className="threshold-gauge-page__labeled-row">
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={35} thresholds={{ warning: 60, critical: 80 }} showValue label="OK" />
              <span className="threshold-gauge-page__item-label">ok (35%)</span>
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={68} thresholds={{ warning: 60, critical: 80 }} showValue label="Warning" />
              <span className="threshold-gauge-page__item-label">warning (68%)</span>
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={92} thresholds={{ warning: 60, critical: 80 }} showValue label="Critical" />
              <span className="threshold-gauge-page__item-label">critical (92%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Without Thresholds (brand color) ─────────── */}
      <section className="threshold-gauge-page__section" id="default-color">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#default-color">Default Color (No Thresholds)</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          Without thresholds, the gauge uses the brand accent color for all fill levels.
        </p>
        <div className="threshold-gauge-page__preview">
          <div className="threshold-gauge-page__labeled-row">
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={25} showValue label="Low" />
              <span className="threshold-gauge-page__item-label">25%</span>
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={50} showValue label="Mid" />
              <span className="threshold-gauge-page__item-label">50%</span>
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={75} showValue label="High" />
              <span className="threshold-gauge-page__item-label">75%</span>
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={100} showValue label="Max" />
              <span className="threshold-gauge-page__item-label">100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Real-World Examples ─────────────────────── */}
      <section className="threshold-gauge-page__section" id="examples">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          Common monitoring dashboard patterns using ThresholdGauge with relevant labels and thresholds.
        </p>
        <div className="threshold-gauge-page__preview">
          <div className="threshold-gauge-page__labeled-row">
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={45} size="lg" showValue label="CPU" thresholds={{ warning: 70, critical: 90 }} />
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={78} size="lg" showValue label="Memory" thresholds={{ warning: 60, critical: 85 }} />
            </div>
            <div className="threshold-gauge-page__labeled-item">
              <GaugeComponent value={92} size="lg" showValue label="Disk" thresholds={{ warning: 75, critical: 90 }} />
            </div>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<ThresholdGauge value={45} size="lg" showValue label="CPU" thresholds={{ warning: 70, critical: 90 }} />\n<ThresholdGauge value={78} size="lg" showValue label="Memory" thresholds={{ warning: 60, critical: 85 }} />\n<ThresholdGauge value={92} size="lg" showValue label="Disk" thresholds={{ warning: 75, critical: 90 }} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="threshold-gauge-page__section" id="tiers">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple colored progress bar.
          Standard provides the full SVG semicircular arc with smooth transitions.
        </p>

        <div className="threshold-gauge-page__tiers">
          {/* Lite */}
          <div
            className={`threshold-gauge-page__tier-card${tier === 'lite' ? ' threshold-gauge-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="threshold-gauge-page__tier-header">
              <span className="threshold-gauge-page__tier-name">Lite</span>
              <span className="threshold-gauge-page__tier-size">~0.4 KB</span>
            </div>
            <p className="threshold-gauge-page__tier-desc">
              CSS-only progress bar fallback. Colored by threshold status.
              No SVG arc, no animation, minimal JavaScript.
            </p>
            <div className="threshold-gauge-page__tier-import">
              import {'{'} ThresholdGauge {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="threshold-gauge-page__tier-preview">
              <LiteThresholdGauge value={72} thresholds={{ warning: 60, critical: 80 }} label="CPU" showValue />
            </div>
            <div className="threshold-gauge-page__size-breakdown">
              <div className="threshold-gauge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`threshold-gauge-page__tier-card${tier === 'standard' ? ' threshold-gauge-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="threshold-gauge-page__tier-header">
              <span className="threshold-gauge-page__tier-name">Standard</span>
              <span className="threshold-gauge-page__tier-size">~2.1 KB</span>
            </div>
            <p className="threshold-gauge-page__tier-desc">
              Full SVG semicircular arc with smooth stroke-dashoffset transitions,
              threshold-based status colors, and motion-level support.
            </p>
            <div className="threshold-gauge-page__tier-import">
              import {'{'} ThresholdGauge {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="threshold-gauge-page__tier-preview">
              <ThresholdGauge value={72} thresholds={{ warning: 60, critical: 80 }} showValue label="CPU" />
            </div>
            <div className="threshold-gauge-page__size-breakdown">
              <div className="threshold-gauge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`threshold-gauge-page__tier-card${tier === 'premium' ? ' threshold-gauge-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="threshold-gauge-page__tier-header">
              <span className="threshold-gauge-page__tier-name">Premium</span>
              <span className="threshold-gauge-page__tier-size">~3.2 KB</span>
            </div>
            <p className="threshold-gauge-page__tier-desc">
              Everything in Standard plus spring-physics needle animation,
              ambient glow on critical status, and entrance reveal animation.
            </p>
            <div className="threshold-gauge-page__tier-import">
              import {'{'} ThresholdGauge {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="threshold-gauge-page__tier-preview">
              <ThresholdGauge value={72} thresholds={{ warning: 60, critical: 80 }} showValue label="CPU" />
            </div>
            <div className="threshold-gauge-page__size-breakdown">
              <div className="threshold-gauge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="threshold-gauge-page__section" id="props">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          All props accepted by ThresholdGauge. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={gaugeProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="threshold-gauge-page__section" id="accessibility">
        <h2 className="threshold-gauge-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="threshold-gauge-page__section-desc">
          Built with semantic ARIA meter role for proper screen reader announcements.
        </p>
        <Card variant="default" padding="md">
          <ul className="threshold-gauge-page__a11y-list">
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Meter role:</strong> Uses <code className="threshold-gauge-page__a11y-key">role="meter"</code> with <code className="threshold-gauge-page__a11y-key">aria-valuenow</code>, <code className="threshold-gauge-page__a11y-key">aria-valuemin</code>, and <code className="threshold-gauge-page__a11y-key">aria-valuemax</code>.
              </span>
            </li>
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> String labels are automatically used as <code className="threshold-gauge-page__a11y-key">aria-label</code>. Falls back to "Gauge" when no label is provided.
              </span>
            </li>
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative SVG:</strong> The SVG arc is marked <code className="threshold-gauge-page__a11y-key">aria-hidden="true"</code> since the meter role conveys all information.
              </span>
            </li>
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="threshold-gauge-page__a11y-key">prefers-reduced-motion</code> — transitions are disabled at motion level 0.
              </span>
            </li>
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="threshold-gauge-page__a11y-key">forced-colors: active</code> with system color remapping for track and fill.
              </span>
            </li>
            <li className="threshold-gauge-page__a11y-item">
              <span className="threshold-gauge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status semantics:</strong> Threshold colors (green/amber/red) use perceptually distinct OKLCH values that remain differentiable for colorblind users.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
