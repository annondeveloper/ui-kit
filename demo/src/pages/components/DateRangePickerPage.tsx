'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DateRangePicker } from '@ui/components/date-range-picker'
import { DateRangePicker as LiteDateRangePicker } from '@ui/lite/date-range-picker'
import { DateRangePicker as PremiumDateRangePicker } from '@ui/premium/date-range-picker'
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

// ─── Types ───────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.drp-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: drp-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .drp-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .drp-page__hero::before {
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
        .drp-page__hero::before { animation: none; }
      }

      .drp-page__title {
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

      .drp-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .drp-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .drp-page__import-code {
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

      .drp-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .drp-page__section {
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
        animation: drp-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes drp-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .drp-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .drp-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }
      .drp-page__section-title a { color: inherit; text-decoration: none; }
      .drp-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .drp-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .drp-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .drp-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .drp-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .drp-page__playground {
          grid-template-columns: 1fr;
        }
        .drp-page__playground-controls {
          position: static !important;
        }
      }

      @container drp-page (max-width: 680px) {
        .drp-page__playground {
          grid-template-columns: 1fr;
        }
        .drp-page__playground-controls {
          position: static !important;
        }
      }

      .drp-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .drp-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .drp-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .drp-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .drp-page__playground-controls {
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

      .drp-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .drp-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .drp-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .drp-page__option-btn {
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
      .drp-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .drp-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .drp-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        user-select: none;
      }
      .drp-page__toggle-label:hover { color: var(--text-primary); }

      /* ── Code tabs ──────────────────────────────────── */

      .drp-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .drp-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .drp-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-success, oklch(72% 0.19 155));
        font-weight: 500;
      }

      /* ── Tier cards ─────────────────────────────────── */

      .drp-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .drp-page__tier-card {
        padding: 1.25rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .drp-page__tier-card:hover {
        border-color: var(--border-strong);
      }
      .drp-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .drp-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .drp-page__tier-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary);
      }
      .drp-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }
      .drp-page__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }
      .drp-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        white-space: nowrap;
        overflow-x: auto;
      }
      .drp-page__tier-preview {
        padding: 1rem;
        border-radius: var(--radius-sm);
        background: oklch(from var(--bg-base) calc(l - 0.02) c h);
        display: flex;
        justify-content: center;
      }

      .drp-page__size-breakdown {
        border-block-start: 1px solid var(--border-subtle);
        padding-block-start: 0.75rem;
      }
      .drp-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
      }

      /* ── Color presets ──────────────────────────────── */

      .drp-page__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .drp-page__color-preset {
        inline-size: 28px;
        block-size: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.15s;
      }
      .drp-page__color-preset:hover {
        transform: scale(1.15);
      }
      .drp-page__color-preset--active {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--text-primary);
      }

      /* ── A11y list ──────────────────────────────────── */

      .drp-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .drp-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary);
      }
      .drp-page__a11y-icon {
        color: var(--status-success, oklch(72% 0.19 155));
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }
      .drp-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.35em;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ───────────────────────────────── */

      .drp-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        padding: 0.375rem 0;
      }
      .drp-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const drpProps: PropDef[] = [
  { name: 'value', type: '[Date | null, Date | null]', description: 'Controlled range value as [start, end] tuple.' },
  { name: 'onChange', type: '(range: [Date | null, Date | null]) => void', description: 'Called when range selection changes.' },
  { name: 'presets', type: 'DateRangePreset[]', description: 'Quick-select preset ranges displayed as buttons.' },
  { name: 'minDate', type: 'Date', description: 'Earliest selectable date.' },
  { name: 'maxDate', type: 'Date', description: 'Latest selectable date.' },
  { name: 'label', type: 'string', description: 'Label displayed above the input trigger.' },
  { name: 'placeholder', type: 'string', default: "'Select range'", description: 'Placeholder text when no range selected.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input trigger size.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the trigger.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the picker.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'name', type: 'string', description: 'Form field name for hidden input serialization.' },
]

const drpPresetProps: PropDef[] = [
  { name: 'label', type: 'string', required: true, description: 'Display label for the preset button.' },
  { name: 'range', type: '[Date, Date]', required: true, description: 'Start and end dates for the preset range.' },
]

// ─── Constants ─────────────────────────────────────────────────────────────

const SIZES: readonly Size[] = ['sm', 'md', 'lg'] as const

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { DateRangePicker } from '@annondeveloper/ui-kit'",
  lite: "import { DateRangePicker } from '@annondeveloper/ui-kit/lite'",
  premium: "import { DateRangePicker } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="drp-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
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
    <div className="drp-page__control-group">
      <span className="drp-page__control-label">{label}</span>
      <div className="drp-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`drp-page__option-btn${opt === value ? ' drp-page__option-btn--active' : ''}`}
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
    <label className="drp-page__toggle-label">
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

// ─── Presets helper ────────────────────────────────────────────────────────

function makePresets() {
  const today = new Date()
  return [
    { label: 'Last 7 days', range: [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), today] as [Date, Date] },
    { label: 'Last 30 days', range: [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30), today] as [Date, Date] },
    { label: 'This month', range: [new Date(today.getFullYear(), today.getMonth(), 1), today] as [Date, Date] },
    { label: 'This quarter', range: [new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), today] as [Date, Date] },
  ]
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: Size,
  label: string,
  placeholder: string,
  disabled: boolean,
  showPresets: boolean,
  showError: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (label) props.push(`  label="${label}"`)
  if (placeholder !== 'Select date range') props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (showError) props.push('  error="End date is required"')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  if (showPresets) props.push('  presets={presets}')

  const presetCode = showPresets
    ? `\n\nconst presets = [\n  { label: 'Last 7 days', range: [subDays(new Date(), 7), new Date()] },\n  { label: 'Last 30 days', range: [subDays(new Date(), 30), new Date()] },\n]`
    : ''

  const jsx = props.length === 0
    ? '<DateRangePicker\n  value={range}\n  onChange={setRange}\n/>'
    : `<DateRangePicker\n  value={range}\n  onChange={setRange}\n${props.join('\n')}\n/>`

  return `${importStr}\nimport { useState } from 'react'${presetCode}\n\nconst [range, setRange] = useState<[Date | null, Date | null]>([null, null])\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size, label: string): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssFile = tier === 'lite'
    ? 'lite/styles.css'
    : 'css/components/date-range-picker.css'

  return `<!-- DateRangePicker -- @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cssFile}">

<div class="ui-date-range-picker" data-size="${size}">
  <label class="ui-date-range-picker__label">${label}</label>
  <button class="ui-date-range-picker__trigger" aria-haspopup="dialog">
    <span class="ui-date-range-picker__placeholder">Select date range</span>
  </button>
</div>

<!-- Note: Full calendar popover requires JavaScript.
     For a CSS-only approach, use a native <input type="date"> pair. -->
<style>
  @import '@annondeveloper/ui-kit/${cssFile}';
</style>`
}

function generateVueCode(tier: Tier, size: Size, label: string, disabled: boolean, showPresets: boolean): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-date-range-picker"`, `data-size="${size}"`]
    return `<template>
  <div ${attrs.join(' ')}>
    <label class="ui-date-range-picker__label">${label}</label>
    <button class="ui-date-range-picker__trigger" aria-haspopup="dialog">
      <span>{{ displayText }}</span>
    </button>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  v-model="range"`, `  label="${label}"`]
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')
  if (showPresets) attrs.push('  :presets="presets"')

  return `<template>
  <DateRangePicker
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { DateRangePicker } from '${importPath}'

const range = ref([null, null])${showPresets ? `\nconst presets = [\n  { label: 'Last 7 days', range: [subDays(new Date(), 7), new Date()] },\n]` : ''}
</script>`
}

function generateAngularCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  const cssImport = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium/css/components/date-range-picker.css'
      : '@annondeveloper/ui-kit/css/components/date-range-picker.css'

  return `<!-- Angular -- ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier (CSS-only approach) -->
<div
  class="ui-date-range-picker"
  data-size="${size}"
  ${disabled ? '[attr.data-disabled]="true"' : ''}
>
  <label class="ui-date-range-picker__label">${label}</label>
  <button
    class="ui-date-range-picker__trigger"
    aria-haspopup="dialog"
    (click)="toggleCalendar()"
  >
    <span>{{ displayText }}</span>
  </button>
</div>

/* In styles.css */
@import '${cssImport}';`
}

function generateSvelteCode(tier: Tier, size: Size, label: string, disabled: boolean, showPresets: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<div class="ui-date-range-picker" data-size="${size}">
  <label class="ui-date-range-picker__label">${label}</label>
  <button
    class="ui-date-range-picker__trigger"
    aria-haspopup="dialog"
    ${disabled ? 'disabled' : ''}
    on:click={toggleCalendar}
  >
    <span>{displayText}</span>
  </button>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  label="${label}"`]
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')
  if (showPresets) attrs.push('  presets={presets}')

  return `<script>
  import { DateRangePicker } from '${importPath}';

  let range = [null, null];${showPresets ? `\n  const presets = [\n    { label: 'Last 7 days', range: [subDays(new Date(), 7), new Date()] },\n  ];` : ''}
</script>

<DateRangePicker
  bind:value={range}
${attrs.join('\n')}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [label, setLabel] = useState('Date range')
  const [placeholder, setPlaceholder] = useState('Select date range')
  const [disabled, setDisabled] = useState(false)
  const [showPresets, setShowPresets] = useState(true)
  const [showError, setShowError] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  const effectiveTier = tier
  const isLite = effectiveTier === 'lite'

  const PickerComponent = isLite
    ? LiteDateRangePicker
    : effectiveTier === 'premium'
      ? PremiumDateRangePicker
      : DateRangePicker

  const presets = useMemo(() => makePresets(), [])

  const reactCode = useMemo(
    () => generateReactCode(tier, size, label, placeholder, disabled, showPresets, showError, motion),
    [tier, size, label, placeholder, disabled, showPresets, showError, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(tier, size, label),
    [tier, size, label],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, label, disabled, showPresets),
    [tier, size, label, disabled, showPresets],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, label, disabled),
    [tier, size, label, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, label, disabled, showPresets),
    [tier, size, label, disabled, showPresets],
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

  const pickerProps: Record<string, unknown> = {
    value: range,
    onChange: setRange,
    label,
    placeholder,
    size,
    disabled,
  }
  if (showPresets) pickerProps.presets = presets
  if (showError) pickerProps.error = 'End date is required'
  if (!isLite) pickerProps.motion = motion

  return (
    <section className="drp-page__section" id="playground">
      <h2 className="drp-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="drp-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="drp-page__playground">
        <div className="drp-page__playground-preview">
          <div className="drp-page__playground-result">
            <PickerComponent {...pickerProps as any} />
          </div>

          <div className="drp-page__code-tabs">
            <div className="drp-page__export-row">
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
              {copyStatus && <span className="drp-page__export-status">{copyStatus}</span>}
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

        <div className="drp-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {!isLite && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="drp-page__control-group">
            <span className="drp-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              <Toggle label="Show presets" checked={showPresets} onChange={setShowPresets} />
              <Toggle label="Show error" checked={showError} onChange={setShowError} />
            </div>
          </div>

          <div className="drp-page__control-group">
            <span className="drp-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              style={{
                padding: '0.375rem 0.5rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'inherit',
              }}
              placeholder="Label text..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DateRangePickerPage() {
  useStyles('drp-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const [basicRange, setBasicRange] = useState<[Date | null, Date | null]>([null, null])
  const presets = useMemo(() => makePresets(), [])
  const today = new Date()

  const effectiveTier = tier
  const isLite = effectiveTier === 'lite'

  const PickerComponent = isLite
    ? LiteDateRangePicker
    : effectiveTier === 'premium'
      ? PremiumDateRangePicker
      : DateRangePicker

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

  // Scroll reveal — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.drp-page__section')
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
    <div className="drp-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="drp-page__hero">
        <h1 className="drp-page__title">DateRangePicker</h1>
        <p className="drp-page__desc">
          Select a date range with a dropdown calendar, preset shortcuts, and full keyboard navigation.
          Built on Calendar with range highlighting, available in three weight tiers.
        </p>
        <div className="drp-page__import-row">
          <code className="drp-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Basic Range Selection ───────────────────── */}
      <section className="drp-page__section" id="basic">
        <h2 className="drp-page__section-title"><a href="#basic">Basic Range Selection</a></h2>
        <p className="drp-page__section-desc">
          Click two dates to select a range. The calendar highlights the start, end, and days in between.
        </p>
        <div className="drp-page__preview">
          <PickerComponent
            label="Date range"
            value={basicRange}
            onChange={setBasicRange}
          />
        </div>
      </section>

      {/* ── 4. Presets ─────────────────────────────────── */}
      <section className="drp-page__section" id="presets">
        <h2 className="drp-page__section-title"><a href="#presets">With Presets</a></h2>
        <p className="drp-page__section-desc">
          Preset ranges appear as quick-select buttons alongside the calendar for common time windows.
        </p>
        <div className="drp-page__preview">
          <PickerComponent
            label="Report period"
            presets={presets}
            placeholder="Choose period"
          />
        </div>
        <CopyBlock
          code={`<DateRangePicker\n  label="Report period"\n  presets={[\n    { label: 'Last 7 days', range: [subDays(new Date(), 7), new Date()] },\n    { label: 'Last 30 days', range: [subDays(new Date(), 30), new Date()] },\n    { label: 'This month', range: [startOfMonth(new Date()), new Date()] },\n  ]}\n/>`}
          language="typescript"
        />
      </section>

      {/* ── 5. Sizes & Validation ──────────────────────── */}
      <section className="drp-page__section" id="sizes">
        <h2 className="drp-page__section-title"><a href="#sizes">Sizes & Validation</a></h2>
        <p className="drp-page__section-desc">
          Available in sm, md, and lg sizes. Pass an error string to display validation feedback.
        </p>
        <div className="drp-page__preview" style={{ flexDirection: 'column', alignItems: 'stretch', maxInlineSize: 360 }}>
          <PickerComponent label="Small" size="sm" placeholder="Select dates" />
          <PickerComponent label="Medium (default)" size="md" placeholder="Select dates" />
          <PickerComponent label="Large" size="lg" placeholder="Select dates" />
          <PickerComponent label="With error" size="md" error="End date is required" />
        </div>
      </section>

      {/* ── 6. Min/Max Date ────────────────────────────── */}
      <section className="drp-page__section" id="minmax">
        <h2 className="drp-page__section-title"><a href="#minmax">Min & Max Dates</a></h2>
        <p className="drp-page__section-desc">
          Constrain the selectable date range with <code>minDate</code> and <code>maxDate</code> props.
          Dates outside the range are visually disabled and cannot be selected.
        </p>
        <div className="drp-page__preview">
          <PickerComponent
            label="Booking window"
            minDate={today}
            maxDate={new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())}
            placeholder="Next 3 months only"
          />
        </div>
        <CopyBlock
          code={`<DateRangePicker\n  label="Booking window"\n  minDate={new Date()}\n  maxDate={addMonths(new Date(), 3)}\n  placeholder="Next 3 months only"\n/>`}
          language="typescript"
        />
      </section>

      {/* ── 7. Disabled ────────────────────────────────── */}
      <section className="drp-page__section" id="disabled">
        <h2 className="drp-page__section-title"><a href="#disabled">Disabled State</a></h2>
        <p className="drp-page__section-desc">
          The disabled state reduces opacity and prevents all interaction.
        </p>
        <div className="drp-page__preview">
          <PickerComponent label="Unavailable" disabled placeholder="Cannot select" />
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="drp-page__section" id="tiers">
        <h2 className="drp-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="drp-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion props).
        </p>

        <div className="drp-page__tiers">
          {/* Lite */}
          <div
            className={`drp-page__tier-card${tier === 'lite' ? ' drp-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="drp-page__tier-header">
              <span className="drp-page__tier-name">Lite</span>
              <span className="drp-page__tier-size">~0.5 KB</span>
            </div>
            <p className="drp-page__tier-desc">
              Minimal wrapper with motion forced to 0. No spring animations.
            </p>
            <div className="drp-page__tier-import">
              import {'{'} DateRangePicker {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="drp-page__tier-preview">
              <LiteDateRangePicker label="Lite" placeholder="Pick range" />
            </div>
            <div className="drp-page__size-breakdown">
              <div className="drp-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`drp-page__tier-card${tier === 'standard' ? ' drp-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="drp-page__tier-header">
              <span className="drp-page__tier-name">Standard</span>
              <span className="drp-page__tier-size">~3 KB</span>
            </div>
            <p className="drp-page__tier-desc">
              Full-featured with popover animation, anchor positioning,
              motion levels, and form integration.
            </p>
            <div className="drp-page__tier-import">
              import {'{'} DateRangePicker {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="drp-page__tier-preview">
              <DateRangePicker label="Standard" placeholder="Pick range" />
            </div>
            <div className="drp-page__size-breakdown">
              <div className="drp-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`drp-page__tier-card${tier === 'premium' ? ' drp-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="drp-page__tier-header">
              <span className="drp-page__tier-name">Premium</span>
              <span className="drp-page__tier-size">~4 KB</span>
            </div>
            <p className="drp-page__tier-desc">
              Everything in Standard plus aurora glow on focus,
              spring popover entrance, and shimmer effects.
            </p>
            <div className="drp-page__tier-import">
              import {'{'} DateRangePicker {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="drp-page__tier-preview">
              <PremiumDateRangePicker label="Premium" placeholder="Pick range" />
            </div>
            <div className="drp-page__size-breakdown">
              <div className="drp-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="drp-page__section" id="brand-color">
        <h2 className="drp-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="drp-page__section-desc">
          Pick a brand color to see the picker update in real-time. The theme generates
          derived colors (light, dark, subtle, glow) automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b']}
          />
          <div className="drp-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`drp-page__color-preset${brandColor === p.hex ? ' drp-page__color-preset--active' : ''}`}
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

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="drp-page__section" id="props">
        <h2 className="drp-page__section-title"><a href="#props">Props API</a></h2>
        <p className="drp-page__section-desc">
          All props accepted by DateRangePicker. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={drpProps} />
        </Card>
        <h3 className="drp-page__section-title" style={{ fontSize: 'var(--text-base)', marginBlockStart: '1rem' }}>DateRangePreset</h3>
        <p className="drp-page__section-desc">Shape of each entry in the <code>presets</code> array.</p>
        <Card variant="default" padding="md">
          <PropsTable props={drpPresetProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="drp-page__section" id="accessibility">
        <h2 className="drp-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="drp-page__section-desc">
          Built with comprehensive ARIA support for screen readers and keyboard users.
        </p>
        <Card variant="default" padding="md">
          <ul className="drp-page__a11y-list">
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dialog role:</strong> Calendar popover uses <code className="drp-page__a11y-key">role="dialog"</code> with descriptive <code className="drp-page__a11y-key">aria-label</code>.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Escape closes popover and returns focus to trigger. Arrow keys navigate calendar days.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="drp-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Trigger linked to label via <code className="drp-page__a11y-key">aria-labelledby</code>. Error linked via <code className="drp-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Validation:</strong> Error state announced via <code className="drp-page__a11y-key">aria-invalid</code> and <code className="drp-page__a11y-key">role="alert"</code>.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="drp-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="drp-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className="drp-page__a11y-item">
              <span className="drp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="drp-page__a11y-key">prefers-reduced-motion</code> and per-component <code className="drp-page__a11y-key">motion</code> prop.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 12. Source ─────────────────────────────────── */}
      <section className="drp-page__section" id="source">
        <h2 className="drp-page__section-title"><a href="#source">Source</a></h2>
        <p className="drp-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="drp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/date-range-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/date-range-picker.tsx (Standard)
          </a>
          <a className="drp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/date-range-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/date-range-picker.tsx (Lite)
          </a>
          <a className="drp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/date-range-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/date-range-picker.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
