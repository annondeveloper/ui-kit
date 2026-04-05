'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TimePicker } from '@ui/components/time-picker'
import { TimePicker as LiteTimePicker } from '@ui/lite/time-picker'
import { TimePicker as PremiumTimePicker } from '@ui/premium/time-picker'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tp-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tp-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .tp-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tp-page__hero::before {
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
        .tp-page__hero::before { animation: none; }
      }

      .tp-page__title {
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

      .tp-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tp-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tp-page__import-code {
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

      .tp-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .tp-page__section {
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
        animation: tp-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tp-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .tp-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .tp-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }
      .tp-page__section-title a { color: inherit; text-decoration: none; }
      .tp-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .tp-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .tp-page__preview {
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

      .tp-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .tp-page__playground {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .tp-page__playground {
          grid-template-columns: 1fr;
        }
        .tp-page__playground-controls {
          position: static !important;
        }
      }

      @container tp-page (max-width: 680px) {
        .tp-page__playground {
          grid-template-columns: 1fr;
        }
        .tp-page__playground-controls {
          position: static !important;
        }
      }

      .tp-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tp-page__playground-result {
        overflow: visible;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .tp-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tp-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tp-page__playground-controls {
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

      .tp-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tp-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tp-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tp-page__option-btn {
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
      .tp-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .tp-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tp-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .tp-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .tp-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tp-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .tp-page__tier-card {
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

      .tp-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tp-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .tp-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tp-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .tp-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .tp-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }

      .tp-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: var(--text-tertiary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tp-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block: 0.5rem;
      }

      .tp-page__size-row {
        display: flex;
        gap: 0.75rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        flex-wrap: wrap;
      }

      /* ── Code tabs ──────────────────────────────────── */

      .tp-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .tp-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .tp-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--brand);
        font-weight: 500;
      }

      /* ── A11y list ──────────────────────────────────── */

      .tp-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .tp-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary);
      }

      .tp-page__a11y-icon {
        color: var(--brand, oklch(65% 0.2 270));
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .tp-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
      }

      /* ── Source links ───────────────────────────────── */

      .tp-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        text-decoration: none;
        font-family: 'SF Mono', 'Fira Code', monospace;
        transition: color 0.15s;
      }
      .tp-page__source-link:hover {
        color: var(--brand);
        text-decoration: underline;
      }

      /* ── Color presets ──────────────────────────────── */

      .tp-page__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tp-page__color-preset {
        inline-size: 28px;
        block-size: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.15s;
      }
      .tp-page__color-preset:hover { transform: scale(1.15); }
      .tp-page__color-preset--active {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px var(--bg-base);
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const tpProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled time value (e.g., "14:30" or "2:30 PM").' },
  { name: 'onChange', type: '(time: string) => void', description: 'Called when the selected time changes.' },
  { name: 'format', type: "'12h' | '24h'", description: 'Display format: 12-hour with AM/PM or 24-hour.' },
  { name: 'minuteStep', type: 'number', description: 'Minute increment step in the dropdown list.' },
  { name: 'minTime', type: 'string', description: 'Earliest selectable time (e.g., "09:00").' },
  { name: 'maxTime', type: 'string', description: 'Latest selectable time (e.g., "17:00").' },
  { name: 'label', type: 'string', description: 'Label displayed above the input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Input size scale.' },
  { name: 'error', type: 'string', description: 'Error message below the input.' },
  { name: 'disabled', type: 'boolean', description: 'Disables the picker.' },
  { name: 'clearable', type: 'boolean', description: 'Show a clear button when a value is set.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'name', type: 'string', description: 'Form field name for hidden input serialization.' },
]

// ─── Constants ─────────────────────────────────────────────────────────────

const FORMATS = ['12h', '24h'] as const
const SIZES = ['sm', 'md', 'lg'] as const
const STEPS = [1, 5, 15, 30] as const
const MOTIONS = [0, 1, 2, 3] as const

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { TimePicker } from '@annondeveloper/ui-kit'",
  lite: "import { TimePicker } from '@annondeveloper/ui-kit/lite'",
  premium: "import { TimePicker } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Amber', hex: '#f59e0b' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="tp-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string | number>({
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
    <div className="tp-page__control-group">
      <span className="tp-page__control-label">{label}</span>
      <div className="tp-page__control-options">
        {options.map(opt => (
          <button
            key={String(opt)}
            type="button"
            className={`tp-page__option-btn${opt === value ? ' tp-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {String(opt)}
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
    <label className="tp-page__toggle-label">
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

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  format: '12h' | '24h',
  size: 'sm' | 'md' | 'lg',
  minuteStep: number,
  disabled: boolean,
  clearable: boolean,
  hasMinMax: boolean,
  motion: number,
  labelText: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (labelText) props.push(`  label="${labelText}"`)
  if (format !== '12h') props.push(`  format="${format}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (minuteStep !== 1) props.push(`  minuteStep={${minuteStep}}`)
  if (disabled) props.push('  disabled')
  if (clearable) props.push('  clearable')
  if (hasMinMax) {
    props.push('  minTime="09:00"')
    props.push('  maxTime="17:00"')
  }
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  placeholder="Select time"')
  props.push('  onChange={(time) => console.log(time)}')

  return `${importStr}\n\n<TimePicker\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier,
  format: '12h' | '24h',
  size: 'sm' | 'md' | 'lg',
  labelText: string,
): string {
  const cssImport = tier === 'lite'
    ? "@import '@annondeveloper/ui-kit/lite/styles.css';"
    : "@import '@annondeveloper/ui-kit/css/components/time-picker.css';"

  return `<!-- TimePicker - @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/time-picker.css'}">

<div class="ui-time-picker" data-size="${size}">
  ${labelText ? `<label class="ui-time-picker__label">${labelText}</label>` : ''}
  <button class="ui-time-picker__trigger" aria-haspopup="listbox">
    <span class="ui-time-picker__placeholder">Select time</span>
  </button>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(
  tier: Tier,
  format: '12h' | '24h',
  size: 'sm' | 'md' | 'lg',
  minuteStep: number,
  disabled: boolean,
  clearable: boolean,
  labelText: string,
): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-time-picker" data-size="${size}">
    ${labelText ? `<label class="ui-time-picker__label">${labelText}</label>` : ''}
    <button class="ui-time-picker__trigger" aria-haspopup="listbox">
      <span class="ui-time-picker__placeholder">Select time</span>
    </button>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  v-model="time"']
  if (labelText) attrs.push(`  label="${labelText}"`)
  if (format !== '12h') attrs.push(`  format="${format}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (minuteStep !== 1) attrs.push(`  :minute-step="${minuteStep}"`)
  if (disabled) attrs.push('  disabled')
  if (clearable) attrs.push('  clearable')

  return `<template>
  <TimePicker
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TimePicker } from '${importPath}'

const time = ref('')
</script>`
}

function generateAngularCode(
  tier: Tier,
  format: '12h' | '24h',
  size: 'sm' | 'md' | 'lg',
  minuteStep: number,
  disabled: boolean,
  labelText: string,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [`data-size="${size}"`]
  if (disabled) attrs.push('[disabled]="true"')

  return `<!-- Angular - ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use CSS-only approach -->
<div
  class="ui-time-picker"
  ${attrs.join('\n  ')}
>
  ${labelText ? `<label class="ui-time-picker__label">${labelText}</label>` : ''}
  <button class="ui-time-picker__trigger" aria-haspopup="listbox">
    <span class="ui-time-picker__placeholder">Select time</span>
  </button>
</div>

/* Import component CSS */
@import '${importPath}/css/components/time-picker.css';`
}

function generateSvelteCode(
  tier: Tier,
  format: '12h' | '24h',
  size: 'sm' | 'md' | 'lg',
  minuteStep: number,
  disabled: boolean,
  clearable: boolean,
  labelText: string,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte - Lite tier (CSS-only) -->
<div
  class="ui-time-picker"
  data-size="${size}"
>
  ${labelText ? `<label class="ui-time-picker__label">${labelText}</label>` : ''}
  <button class="ui-time-picker__trigger" aria-haspopup="listbox" ${disabled ? 'disabled' : ''}>
    <span class="ui-time-picker__placeholder">Select time</span>
  </button>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (labelText) attrs.push(`  label="${labelText}"`)
  if (format !== '12h') attrs.push(`  format="${format}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (minuteStep !== 1) attrs.push(`  minuteStep={${minuteStep}}`)
  if (disabled) attrs.push('  disabled')
  if (clearable) attrs.push('  clearable')
  attrs.push('  on:change={(e) => time = e.detail}')

  return `<script>
  import { TimePicker } from '${importPath}';
  let time = '';
</script>

<TimePicker
${attrs.join('\n')}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [format, setFormat] = useState<'12h' | '24h'>('12h')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [minuteStep, setMinuteStep] = useState<number>(1)
  const [disabled, setDisabled] = useState(false)
  const [clearable, setClearable] = useState(true)
  const [hasMinMax, setHasMinMax] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [labelText, setLabelText] = useState('Pick a time')
  const [timeValue, setTimeValue] = useState<string | undefined>(undefined)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const PickerComponent = effectiveTier === 'lite' ? LiteTimePicker : effectiveTier === 'premium' ? PremiumTimePicker : TimePicker
  const isLite = effectiveTier === 'lite'

  const reactCode = useMemo(
    () => generateReactCode(tier, format, size, minuteStep, disabled, clearable, hasMinMax, motion, labelText),
    [tier, format, size, minuteStep, disabled, clearable, hasMinMax, motion, labelText],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, format, size, labelText),
    [tier, format, size, labelText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, format, size, minuteStep, disabled, clearable, labelText),
    [tier, format, size, minuteStep, disabled, clearable, labelText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, format, size, minuteStep, disabled, labelText),
    [tier, format, size, minuteStep, disabled, labelText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, format, size, minuteStep, disabled, clearable, labelText),
    [tier, format, size, minuteStep, disabled, clearable, labelText],
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

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  const pickerProps: Record<string, unknown> = {
    format,
    size,
    clearable,
    disabled,
    placeholder: 'Select time',
    value: timeValue,
    onChange: setTimeValue,
  }
  if (labelText) pickerProps.label = labelText
  if (minuteStep !== 1) pickerProps.minuteStep = minuteStep
  if (hasMinMax) {
    pickerProps.minTime = '09:00'
    pickerProps.maxTime = '17:00'
  }
  if (!isLite) pickerProps.motion = motion

  return (
    <section className="tp-page__section" id="playground">
      <h2 className="tp-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tp-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="tp-page__playground">
        <div className="tp-page__playground-preview">
          <div className="tp-page__playground-result">
            <PickerComponent {...pickerProps} />
          </div>

          <div className="tp-page__code-tabs">
            <div className="tp-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="tp-page__export-status">{copyStatus}</span>}
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

        <div className="tp-page__playground-controls">
          <OptionGroup label="Format" options={FORMATS} value={format} onChange={setFormat as (v: string | number) => void} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize as (v: string | number) => void} />
          <OptionGroup label="Minute Step" options={STEPS} value={minuteStep} onChange={setMinuteStep as (v: string | number) => void} />
          {!isLite && (
            <OptionGroup label="Motion Level" options={MOTIONS} value={motion} onChange={setMotion as (v: string | number) => void} />
          )}
          <div className="tp-page__control-group">
            <span className="tp-page__control-label">Label</span>
            <input
              type="text"
              className="tp-page__text-input"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              placeholder="Label text"
            />
          </div>
          <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
          <Toggle label="Clearable" checked={clearable} onChange={setClearable} />
          <Toggle label="Min/Max (9AM-5PM)" checked={hasMinMax} onChange={setHasMinMax} />
        </div>
      </div>
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TimePickerPage() {
  useStyles('tp-page', pageStyles)
  const { tier, setTier } = useTier()

  const [time12, setTime12] = useState<string | undefined>(undefined)
  const [time24, setTime24] = useState<string | undefined>(undefined)
  const [brandColor, setBrandColor] = useState('#6366f1')

  const effectiveTier = tier
  const isLite = effectiveTier === 'lite'
  const PickerComponent = isLite ? LiteTimePicker : effectiveTier === 'premium' ? PremiumTimePicker : TimePicker

  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="tp-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="tp-page__hero">
        <h1 className="tp-page__title">TimePicker</h1>
        <p className="tp-page__desc">
          Time selection input with dropdown, supporting 12-hour and 24-hour formats,
          minute stepping, and time range constraints. Three weight tiers to match your bundle budget.
        </p>
        <div className="tp-page__import-row">
          <code className="tp-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* ── 1. 12h vs 24h ──────────────────────────────── */}
      <section className="tp-page__section" id="formats">
        <h2 className="tp-page__section-title"><a href="#formats">12-Hour & 24-Hour Format</a></h2>
        <p className="tp-page__section-desc">
          Toggle between 12-hour (AM/PM) and 24-hour display. The value is always emitted in the configured format.
        </p>
        <div className="tp-page__preview">
          <PickerComponent
            label="12-hour"
            format="12h"
            value={time12}
            onChange={setTime12}
            placeholder="Pick time"
            clearable
          />
          <PickerComponent
            label="24-hour"
            format="24h"
            value={time24}
            onChange={setTime24}
            placeholder="HH:MM"
            clearable
          />
        </div>
      </section>

      {/* ── 2. Minute Steps ────────────────────────────── */}
      <section className="tp-page__section" id="steps">
        <h2 className="tp-page__section-title"><a href="#steps">Minute Steps</a></h2>
        <p className="tp-page__section-desc">
          Control granularity with minuteStep. Steps of 15 show :00, :15, :30, :45 in the dropdown.
        </p>
        <div className="tp-page__preview">
          <PickerComponent label="5-min steps" minuteStep={5} format="24h" placeholder="Select" />
          <PickerComponent label="15-min steps" minuteStep={15} format="12h" placeholder="Select" />
          <PickerComponent label="30-min steps" minuteStep={30} format="12h" placeholder="Select" />
        </div>
      </section>

      {/* ── 3. Constrained Range ──────────────────────── */}
      <section className="tp-page__section" id="range">
        <h2 className="tp-page__section-title"><a href="#range">Time Range Constraints</a></h2>
        <p className="tp-page__section-desc">
          Restrict selectable times with minTime and maxTime. Times outside the range are disabled.
        </p>
        <div className="tp-page__preview">
          <PickerComponent
            label="Business hours only"
            format="12h"
            minTime="09:00"
            maxTime="17:00"
            minuteStep={15}
            placeholder="9 AM - 5 PM"
          />
          <PickerComponent
            label="With error"
            error="Time is required"
            placeholder="Required"
          />
        </div>
      </section>

      {/* ── 4. Sizes ─────────────────────────────────── */}
      <section className="tp-page__section" id="sizes">
        <h2 className="tp-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="tp-page__section-desc">
          Three sizes to fit different layouts. All respect the 44px minimum touch target on coarse pointer devices.
        </p>
        <div className="tp-page__preview">
          <PickerComponent label="Small" size="sm" format="12h" placeholder="sm" />
          <PickerComponent label="Medium" size="md" format="12h" placeholder="md" />
          <PickerComponent label="Large" size="lg" format="12h" placeholder="lg" />
        </div>
      </section>

      {/* ── 5. Disabled & Clearable ──────────────────── */}
      <section className="tp-page__section" id="states">
        <h2 className="tp-page__section-title"><a href="#states">States</a></h2>
        <p className="tp-page__section-desc">
          Disabled state prevents interaction. Clearable adds a clear button when a value is set.
        </p>
        <div className="tp-page__preview">
          <PickerComponent label="Disabled" disabled placeholder="Unavailable" />
          <PickerComponent label="Clearable" clearable format="12h" placeholder="Pick and clear" />
        </div>
      </section>

      {/* ── 6. Live Playground ────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 7. Weight Tiers ──────────────────────────── */}
      <section className="tp-page__section" id="tiers">
        <h2 className="tp-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="tp-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion props).
        </p>

        <div className="tp-page__tiers">
          {/* Lite */}
          <div
            className={`tp-page__tier-card${tier === 'lite' ? ' tp-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="tp-page__tier-header">
              <span className="tp-page__tier-name">Lite</span>
              <span className="tp-page__tier-size">~0.3 KB</span>
            </div>
            <p className="tp-page__tier-desc">
              Minimal wrapper. Zero motion, no animation. Forwards all props to the standard component with motion=0.
            </p>
            <div className="tp-page__tier-import">
              import {'{'} TimePicker {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="tp-page__tier-preview">
              <LiteTimePicker format="12h" placeholder="Lite" size="sm" />
            </div>
            <div className="tp-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
              <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>4.1 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`tp-page__tier-card${tier === 'standard' ? ' tp-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="tp-page__tier-header">
              <span className="tp-page__tier-name">Standard</span>
              <span className="tp-page__tier-size">~2.8 KB</span>
            </div>
            <p className="tp-page__tier-desc">
              Full-featured with dropdown animation, anchor positioning, keyboard navigation, and form integration.
            </p>
            <div className="tp-page__tier-import">
              import {'{'} TimePicker {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="tp-page__tier-preview">
              <TimePicker format="12h" placeholder="Standard" size="sm" />
            </div>
            <div className="tp-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
              <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`tp-page__tier-card${tier === 'premium' ? ' tp-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="tp-page__tier-header">
              <span className="tp-page__tier-name">Premium</span>
              <span className="tp-page__tier-size">~3.5 KB</span>
            </div>
            <p className="tp-page__tier-desc">
              Everything in Standard plus aurora glow on focus, spring dropdown animation, and shimmer effects.
            </p>
            <div className="tp-page__tier-import">
              import {'{'} TimePicker {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="tp-page__tier-preview">
              <PremiumTimePicker format="12h" placeholder="Premium" size="sm" />
            </div>
            <div className="tp-page__size-row">
              <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
              <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.8 KB</strong></span>
              <span>= <strong style={{ color: 'var(--brand)' }}>5.0 KB</strong> gzip</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ────────────────────────────── */}
      <section className="tp-page__section" id="brand-color">
        <h2 className="tp-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="tp-page__section-desc">
          Pick a brand color to see the TimePicker update in real-time. The theme generates
          derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="tp-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`tp-page__color-preset${brandColor === p.hex ? ' tp-page__color-preset--active' : ''}`}
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
      <section className="tp-page__section" id="props">
        <h2 className="tp-page__section-title"><a href="#props">Props API</a></h2>
        <p className="tp-page__section-desc">
          All props accepted by TimePicker. Also accepts native div attributes via spread.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tpProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─────────────────────────── */}
      <section className="tp-page__section" id="accessibility">
        <h2 className="tp-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="tp-page__section-desc">
          Built with comprehensive ARIA support for screen readers and keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="tp-page__a11y-list">
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Opens on <code className="tp-page__a11y-key">Enter</code>,{' '}
                <code className="tp-page__a11y-key">Space</code>, and <code className="tp-page__a11y-key">ArrowDown</code>.
                Closes on <code className="tp-page__a11y-key">Escape</code>.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="tp-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Trigger uses <code className="tp-page__a11y-key">aria-expanded</code>,{' '}
                <code className="tp-page__a11y-key">aria-haspopup="listbox"</code>, and{' '}
                <code className="tp-page__a11y-key">aria-labelledby</code>.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages use <code className="tp-page__a11y-key">role="alert"</code> and are
                linked via <code className="tp-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variants meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via{' '}
                <code className="tp-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="tp-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className="tp-page__a11y-item">
              <span className="tp-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="tp-page__a11y-key">prefers-reduced-motion</code> and motion=0.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ────────────────────────────────── */}
      <section className="tp-page__section" id="source">
        <h2 className="tp-page__section-title"><a href="#source">Source</a></h2>
        <p className="tp-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="tp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/time-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/time-picker.tsx (Standard)
          </a>
          <a className="tp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/time-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/time-picker.tsx (Lite)
          </a>
          <a className="tp-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/time-picker.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/time-picker.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
