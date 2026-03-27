'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RealtimeValue } from '@ui/domain/realtime-value'
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
    @scope (.realtime-value-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: realtime-value-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .realtime-value-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .realtime-value-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .realtime-value-page__hero::before { animation: none; }
      }

      .realtime-value-page__title {
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

      .realtime-value-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .realtime-value-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .realtime-value-page__import-code {
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

      .realtime-value-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .realtime-value-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        .realtime-value-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .realtime-value-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .realtime-value-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .realtime-value-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .realtime-value-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .realtime-value-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .realtime-value-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .realtime-value-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Labeled items ──────────────────────────────── */

      .realtime-value-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .realtime-value-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Large value display ─────────────────────────── */

      .realtime-value-page__big-value {
        font-size: 3rem;
        font-weight: 700;
      }

      .realtime-value-page__medium-value {
        font-size: 1.5rem;
        font-weight: 600;
      }

      /* ── Playground ─────────────────────────────────── */

      .realtime-value-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container realtime-value-page (max-width: 680px) {
        .realtime-value-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .realtime-value-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .realtime-value-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .realtime-value-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .realtime-value-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .realtime-value-page__playground-controls {
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

      .realtime-value-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .realtime-value-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .realtime-value-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .realtime-value-page__option-btn {
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
      .realtime-value-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .realtime-value-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .realtime-value-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Simulated ticker ──────────────────────────── */

      .realtime-value-page__ticker-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .realtime-value-page__ticker-btn {
        font-size: var(--text-xs, 0.75rem);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .realtime-value-page__code-tabs {
        margin-block-start: 1rem;
      }

      .realtime-value-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .realtime-value-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .realtime-value-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .realtime-value-page__tier-card {
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

      .realtime-value-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .realtime-value-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .realtime-value-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .realtime-value-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .realtime-value-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .realtime-value-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .realtime-value-page__tier-import {
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

      .realtime-value-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .realtime-value-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .realtime-value-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .realtime-value-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .realtime-value-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .realtime-value-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .realtime-value-page__a11y-key {
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
        .realtime-value-page__hero { padding: 2rem 1.25rem; }
        .realtime-value-page__title { font-size: 1.75rem; }
        .realtime-value-page__preview { padding: 1.75rem; }
        .realtime-value-page__playground { grid-template-columns: 1fr; }
        .realtime-value-page__tiers { grid-template-columns: 1fr; }
        .realtime-value-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .realtime-value-page__hero { padding: 1.5rem 1rem; }
        .realtime-value-page__title { font-size: 1.5rem; }
        .realtime-value-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .realtime-value-page__import-code,
      .realtime-value-page code,
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

const realtimeValueProps: PropDef[] = [
  { name: 'value', type: 'number', required: true, description: 'The current numeric value to display.' },
  { name: 'previousValue', type: 'number', description: 'The previous value, used to calculate and display delta.' },
  { name: 'format', type: '(value: number) => string', description: 'Custom formatting function. Defaults to Intl.NumberFormat with 2 decimal places.' },
  { name: 'showDelta', type: 'boolean', default: 'false', description: 'Show the change amount (+/-) next to the value.' },
  { name: 'flashOnChange', type: 'boolean', default: 'true', description: 'Flash green/red background when value changes up/down.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0, flash animations are disabled.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the root span element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { RealtimeValue } from '@annondeveloper/ui-kit/lite'",
  standard: "import { RealtimeValue } from '@annondeveloper/ui-kit'",
  premium: "import { RealtimeValue } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="realtime-value-page__copy-btn"
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
    <label className="realtime-value-page__toggle-label">
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
    <div className="realtime-value-page__control-group">
      <span className="realtime-value-page__control-label">{label}</span>
      <div className="realtime-value-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`realtime-value-page__option-btn${opt === value ? ' realtime-value-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Simulated Ticker Hook ────────────────────────────────────────────────────

function useSimulatedTicker(interval = 2000) {
  const [value, setValue] = useState(1847.32)
  const [prevValue, setPrevValue] = useState(1842.15)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setValue(prev => {
        setPrevValue(prev)
        const delta = (Math.random() - 0.48) * 15
        return Math.round((prev + delta) * 100) / 100
      })
    }, interval)
    return () => clearInterval(timer)
  }, [running, interval])

  return { value, prevValue, running, setRunning }
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  showDelta: boolean,
  flashOnChange: boolean,
  motion: number,
  useCustomFormat: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  value={currentValue}']
  if (showDelta) {
    props.push('  previousValue={prevValue}')
    props.push('  showDelta')
  }
  if (!flashOnChange) props.push('  flashOnChange={false}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  if (useCustomFormat) props.push('  format={(v) => `$${v.toFixed(2)}`}')

  return `${importStr}

<RealtimeValue
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, showDelta: boolean): string {
  return `<!-- RealtimeValue — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/realtime-value.css">

<span class="ui-realtime-value" aria-live="polite">
  <span class="ui-realtime-value__number">1,847.32</span>${showDelta ? `
  <span class="ui-realtime-value__delta" data-direction="positive">+5.17</span>` : ''}
</span>

<!-- To trigger flash: add data-flash="up" or data-flash="down" attribute -->
<!-- @import '@annondeveloper/ui-kit/css/components/realtime-value.css'; -->`
}

function generateVueCode(tier: Tier, showDelta: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <span class="ui-realtime-value" aria-live="polite">
    <span class="ui-realtime-value__number">{{ formattedValue }}</span>${showDelta ? `
    <span
      class="ui-realtime-value__delta"
      :data-direction="deltaDirection"
    >{{ formattedDelta }}</span>` : ''}
  </span>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :value="currentValue"']
  if (showDelta) {
    attrs.push('  :previous-value="prevValue"')
    attrs.push('  show-delta')
  }

  return `<template>
  <RealtimeValue
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { RealtimeValue } from '${importPath}'

const currentValue = ref(1847.32)
const prevValue = ref(1842.15)
</script>`
}

function generateAngularCode(tier: Tier, showDelta: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<span class="ui-realtime-value" aria-live="polite">
  <span class="ui-realtime-value__number">{{ formattedValue }}</span>${showDelta ? `
  <span
    class="ui-realtime-value__delta"
    [attr.data-direction]="deltaDirection"
  >{{ formattedDelta }}</span>` : ''}
</span>

/* Import component CSS */
@import '${importPath}/css/components/realtime-value.css';`
}

function generateSvelteCode(tier: Tier, showDelta: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<span class="ui-realtime-value" aria-live="polite">
  <span class="ui-realtime-value__number">{formattedValue}</span>${showDelta ? `
  <span
    class="ui-realtime-value__delta"
    data-direction={deltaDirection}
  >{formattedDelta}</span>` : ''}
</span>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  value={currentValue}']
  if (showDelta) {
    attrs.push('  previousValue={prevValue}')
    attrs.push('  showDelta')
  }

  return `<script>
  import { RealtimeValue } from '${importPath}';
  let currentValue = 1847.32;
  let prevValue = 1842.15;
</script>

<RealtimeValue
${attrs.join('\n')}
/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const { value, prevValue, running, setRunning } = useSimulatedTicker(1500)
  const [showDelta, setShowDelta] = useState(true)
  const [flashOnChange, setFlashOnChange] = useState(true)
  const [useCustomFormat, setUseCustomFormat] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, showDelta, flashOnChange, motion, useCustomFormat),
    [tier, showDelta, flashOnChange, motion, useCustomFormat],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, showDelta), [tier, showDelta])
  const vueCode = useMemo(() => generateVueCode(tier, showDelta), [tier, showDelta])
  const angularCode = useMemo(() => generateAngularCode(tier, showDelta), [tier, showDelta])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showDelta), [tier, showDelta])

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

  const format = useCustomFormat ? (v: number) => `$${v.toFixed(2)}` : undefined

  return (
    <section className="realtime-value-page__section" id="playground">
      <h2 className="realtime-value-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="realtime-value-page__section-desc">
        Watch the value update in real-time with flash animations and delta indicators.
        Toggle features and see generated code update instantly.
      </p>

      <div className="realtime-value-page__playground">
        <div className="realtime-value-page__playground-preview">
          <div className="realtime-value-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div className="realtime-value-page__big-value">
                <RealtimeValue
                  value={value}
                  previousValue={showDelta ? prevValue : undefined}
                  showDelta={showDelta}
                  flashOnChange={flashOnChange}
                  format={format}
                  motion={tier !== 'lite' ? motion : undefined}
                />
              </div>
              <div className="realtime-value-page__ticker-row">
                <Button
                  size="xs"
                  variant={running ? 'danger' : 'primary'}
                  onClick={() => setRunning(!running)}
                  className="realtime-value-page__ticker-btn"
                >
                  {running ? 'Pause' : 'Resume'} Ticker
                </Button>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  Updates every 1.5s
                </span>
              </div>
            </div>
          </div>

          <div className="realtime-value-page__code-tabs">
            <div className="realtime-value-page__export-row">
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
              {copyStatus && <span className="realtime-value-page__export-status">{copyStatus}</span>}
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

        <div className="realtime-value-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="realtime-value-page__control-group">
            <span className="realtime-value-page__control-label">Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show delta" checked={showDelta} onChange={setShowDelta} />
              <Toggle label="Flash on change" checked={flashOnChange} onChange={setFlashOnChange} />
              <Toggle label="Currency format ($)" checked={useCustomFormat} onChange={setUseCustomFormat} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RealtimeValuePage() {
  useStyles('realtime-value-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.realtime-value-page__section')
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
    <div className="realtime-value-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="realtime-value-page__hero">
        <h1 className="realtime-value-page__title">RealtimeValue</h1>
        <p className="realtime-value-page__desc">
          Live-updating numeric display with flash animations and delta indicators.
          Perfect for stock tickers, monitoring dashboards, and real-time metrics.
          Uses tabular-nums for stable width and aria-live for screen reader announcements.
        </p>
        <div className="realtime-value-page__import-row">
          <code className="realtime-value-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Basic Usage ──────────────────────────────── */}
      <section className="realtime-value-page__section" id="basic">
        <h2 className="realtime-value-page__section-title">
          <a href="#basic">Basic Usage</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          Display a number with default formatting. The component uses Intl.NumberFormat
          with up to 2 decimal places.
        </p>
        <div className="realtime-value-page__preview">
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={42567.89} />
            </div>
            <span className="realtime-value-page__item-label">default format</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={99.5} format={(v) => `${v}%`} />
            </div>
            <span className="realtime-value-page__item-label">percentage</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={1234567} format={(v) => `$${(v / 1000).toFixed(0)}K`} />
            </div>
            <span className="realtime-value-page__item-label">compact currency</span>
          </div>
        </div>
      </section>

      {/* ── 4. Delta Indicator ─────────────────────────── */}
      <section className="realtime-value-page__section" id="delta">
        <h2 className="realtime-value-page__section-title">
          <a href="#delta">Delta Indicator</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          Enable <code>showDelta</code> with a <code>previousValue</code> to display the change amount.
          Positive deltas show in green, negative in red, and zero in muted gray.
        </p>
        <div className="realtime-value-page__preview">
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={150} previousValue={142} showDelta />
            </div>
            <span className="realtime-value-page__item-label">positive (+8)</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={85} previousValue={92} showDelta />
            </div>
            <span className="realtime-value-page__item-label">negative (-7)</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={200} previousValue={200} showDelta />
            </div>
            <span className="realtime-value-page__item-label">zero (0)</span>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<RealtimeValue
  value={150}
  previousValue={142}
  showDelta
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Custom Formatting ───────────────────────── */}
      <section className="realtime-value-page__section" id="formatting">
        <h2 className="realtime-value-page__section-title">
          <a href="#formatting">Custom Formatting</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          Pass a <code>format</code> function to control how values are displayed. Works for
          currencies, percentages, units, compact notation, and any custom format.
        </p>
        <div className="realtime-value-page__preview">
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={2499.99} format={(v) => `$${v.toFixed(2)}`} previousValue={2480.00} showDelta />
            </div>
            <span className="realtime-value-page__item-label">currency</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={73.5} format={(v) => `${v.toFixed(1)}ms`} previousValue={85.2} showDelta />
            </div>
            <span className="realtime-value-page__item-label">latency</span>
          </div>
          <div className="realtime-value-page__labeled-item">
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={99.97} format={(v) => `${v.toFixed(2)}%`} previousValue={99.95} showDelta />
            </div>
            <span className="realtime-value-page__item-label">uptime</span>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<RealtimeValue
  value={2499.99}
  previousValue={2480.00}
  showDelta
  format={(v) => \`$\${v.toFixed(2)}\`}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Flash Animation ─────────────────────────── */}
      <section className="realtime-value-page__section" id="flash">
        <h2 className="realtime-value-page__section-title">
          <a href="#flash">Flash Animation</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          When <code>flashOnChange</code> is enabled (default), the component briefly flashes
          green for increases and red for decreases. Disabled at motion level 0.
        </p>
        <div className="realtime-value-page__preview time-range-selector-page__preview--col" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>flashOnChange=true (default)</span>
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={1234} flashOnChange />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>flashOnChange=false</span>
            <div className="realtime-value-page__medium-value">
              <RealtimeValue value={1234} flashOnChange={false} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="realtime-value-page__section" id="tiers">
        <h2 className="realtime-value-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          Choose the right balance of features and bundle size for your realtime value display.
        </p>

        <div className="realtime-value-page__tiers">
          {/* Lite */}
          <div
            className={`realtime-value-page__tier-card${tier === 'lite' ? ' realtime-value-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="realtime-value-page__tier-header">
              <span className="realtime-value-page__tier-name">Lite</span>
              <span className="realtime-value-page__tier-size">~0.3 KB</span>
            </div>
            <p className="realtime-value-page__tier-desc">
              CSS-only display with static number and delta. No flash animation, no motion levels, no live region announcements.
            </p>
            <div className="realtime-value-page__tier-import">
              import {'{'} RealtimeValue {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="realtime-value-page__tier-preview">
              <RealtimeValue value={1847.32} previousValue={1842.15} showDelta />
            </div>
            <div className="realtime-value-page__size-breakdown">
              <div className="realtime-value-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`realtime-value-page__tier-card${tier === 'standard' ? ' realtime-value-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="realtime-value-page__tier-header">
              <span className="realtime-value-page__tier-name">Standard</span>
              <span className="realtime-value-page__tier-size">~1.2 KB</span>
            </div>
            <p className="realtime-value-page__tier-desc">
              Full-featured with flash animations, delta indicators, custom formatting, motion levels, error boundary, and aria-live.
            </p>
            <div className="realtime-value-page__tier-import">
              import {'{'} RealtimeValue {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="realtime-value-page__tier-preview">
              <RealtimeValue value={1847.32} previousValue={1842.15} showDelta />
            </div>
            <div className="realtime-value-page__size-breakdown">
              <div className="realtime-value-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`realtime-value-page__tier-card${tier === 'premium' ? ' realtime-value-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="realtime-value-page__tier-header">
              <span className="realtime-value-page__tier-name">Premium</span>
              <span className="realtime-value-page__tier-size">~2.0 KB</span>
            </div>
            <p className="realtime-value-page__tier-desc">
              Everything in Standard plus spring-animated number transitions, sparkline trail,
              threshold-based color shifting, and configurable precision.
            </p>
            <div className="realtime-value-page__tier-import">
              import {'{'} RealtimeValue {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="realtime-value-page__tier-preview">
              <RealtimeValue value={1847.32} previousValue={1842.15} showDelta />
            </div>
            <div className="realtime-value-page__size-breakdown">
              <div className="realtime-value-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="realtime-value-page__section" id="props">
        <h2 className="realtime-value-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          All props accepted by RealtimeValue. It also spreads native span HTML attributes
          onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={realtimeValueProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="realtime-value-page__section" id="accessibility">
        <h2 className="realtime-value-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="realtime-value-page__section-desc">
          Designed for live data with proper screen reader support and motion preferences.
        </p>
        <Card variant="default" padding="md">
          <ul className="realtime-value-page__a11y-list">
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Uses <code className="realtime-value-page__a11y-key">aria-live="polite"</code> to announce value changes to screen readers.
              </span>
            </li>
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Delta label:</strong> Change amount uses <code className="realtime-value-page__a11y-key">aria-label</code> like "Change: +5.17" for context.
              </span>
            </li>
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tabular nums:</strong> Uses <code className="realtime-value-page__a11y-key">font-variant-numeric: tabular-nums</code> so digits maintain consistent width.
              </span>
            </li>
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion respect:</strong> Flash animations disabled at <code className="realtime-value-page__a11y-key">motion=0</code> and <code className="realtime-value-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independence:</strong> Delta direction uses both color and +/- sign prefix — never color alone.
              </span>
            </li>
            <li className="realtime-value-page__a11y-item">
              <span className="realtime-value-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="realtime-value-page__a11y-key">forced-colors: active</code> with LinkText for delta colors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
