'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TimeRangeSelector } from '@ui/domain/time-range-selector'
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
    @scope (.time-range-selector-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: time-range-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .time-range-selector-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .time-range-selector-page__hero::before {
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
        .time-range-selector-page__hero::before { animation: none; }
      }

      .time-range-selector-page__title {
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

      .time-range-selector-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .time-range-selector-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .time-range-selector-page__import-code {
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

      .time-range-selector-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .time-range-selector-page__section {
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
        .time-range-selector-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .time-range-selector-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .time-range-selector-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .time-range-selector-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .time-range-selector-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .time-range-selector-page__preview {
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

      .time-range-selector-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .time-range-selector-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .time-range-selector-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container time-range-page (max-width: 680px) {
        .time-range-selector-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .time-range-selector-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .time-range-selector-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .time-range-selector-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .time-range-selector-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .time-range-selector-page__playground-controls {
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

      .time-range-selector-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .time-range-selector-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .time-range-selector-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .time-range-selector-page__option-btn {
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
      .time-range-selector-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .time-range-selector-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .time-range-selector-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .time-range-selector-page__code-tabs {
        margin-block-start: 1rem;
      }

      .time-range-selector-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .time-range-selector-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .time-range-selector-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .time-range-selector-page__tier-card {
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

      .time-range-selector-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .time-range-selector-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .time-range-selector-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .time-range-selector-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .time-range-selector-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .time-range-selector-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .time-range-selector-page__tier-import {
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

      .time-range-selector-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .time-range-selector-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .time-range-selector-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Selected range display ─────────────────────── */

      .time-range-selector-page__selected-display {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        padding: 0.5rem 0.75rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
        margin-block-start: 0.75rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .time-range-selector-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .time-range-selector-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .time-range-selector-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .time-range-selector-page__a11y-key {
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
        .time-range-selector-page__hero { padding: 2rem 1.25rem; }
        .time-range-selector-page__title { font-size: 1.75rem; }
        .time-range-selector-page__preview { padding: 1.75rem; }
        .time-range-selector-page__playground { grid-template-columns: 1fr; }
        .time-range-selector-page__tiers { grid-template-columns: 1fr; }
        .time-range-selector-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .time-range-selector-page__hero { padding: 1.5rem 1rem; }
        .time-range-selector-page__title { font-size: 1.5rem; }
        .time-range-selector-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .time-range-selector-page__import-code,
      .time-range-selector-page code,
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

const timeRangeProps: PropDef[] = [
  { name: 'presets', type: 'TimeRangePreset[]', description: 'Array of preset time ranges. Each preset has label, value, and range [start, end] in ms.' },
  { name: 'value', type: '[number, number]', description: 'Controlled value as a tuple of [startMs, endMs] timestamps.' },
  { name: 'onChange', type: '(range: [number, number]) => void', description: 'Callback fired when the selected range changes.' },
  { name: 'showCustom', type: 'boolean', default: 'false', description: 'Show custom datetime-local inputs for manual range entry.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TimeRangeSelector } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TimeRangeSelector } from '@annondeveloper/ui-kit'",
  premium: "import { TimeRangeSelector } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="time-range-selector-page__copy-btn"
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
    <label className="time-range-selector-page__toggle-label">
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
    <div className="time-range-selector-page__control-group">
      <span className="time-range-selector-page__control-label">{label}</span>
      <div className="time-range-selector-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`time-range-selector-page__option-btn${opt === value ? ' time-range-selector-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function formatRange(range: [number, number] | null): string {
  if (!range) return 'No range selected'
  const fmt = (ts: number) => new Date(ts).toLocaleString()
  return `${fmt(range[0])} — ${fmt(range[1])}`
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, showCustom: boolean, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  value={range}',
    '  onChange={setRange}',
  ]
  if (showCustom) props.push('  showCustom')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}
import { useState } from 'react'

function App() {
  const [range, setRange] = useState<[number, number]>([
    Date.now() - 86400000, Date.now()
  ])

  return (
    <TimeRangeSelector
${props.join('\n')}
    />
  )
}`
}

function generateHtmlCode(tier: Tier, showCustom: boolean): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/time-range-selector.css';`

  return `<!-- TimeRangeSelector — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/time-range-selector.css">

<div class="ui-time-range-selector" role="group" aria-label="Time range">
  <div class="ui-time-range-selector__presets" role="group" aria-label="Preset ranges">
    <button class="ui-time-range-selector__preset" aria-pressed="false">1h</button>
    <button class="ui-time-range-selector__preset" data-active="true" aria-pressed="true">24h</button>
    <button class="ui-time-range-selector__preset" aria-pressed="false">7d</button>
    <button class="ui-time-range-selector__preset" aria-pressed="false">30d</button>
  </div>${showCustom ? `
  <div class="ui-time-range-selector__custom">
    <input type="datetime-local" class="ui-time-range-selector__input" aria-label="Start time">
    <span aria-hidden="true">—</span>
    <input type="datetime-local" class="ui-time-range-selector__input" aria-label="End time">
  </div>` : ''}
</div>

<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, showCustom: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-time-range-selector" role="group" aria-label="Time range">
    <div class="ui-time-range-selector__presets">
      <button
        v-for="preset in presets"
        :key="preset.value"
        class="ui-time-range-selector__preset"
        :data-active="isActive(preset) ? 'true' : undefined"
        @click="selectPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  v-model="range"', '  @change="onRangeChange"']
  if (showCustom) attrs.push('  show-custom')

  return `<template>
  <TimeRangeSelector
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TimeRangeSelector } from '${importPath}'

const range = ref([Date.now() - 86400000, Date.now()])
const onRangeChange = (newRange) => { range.value = newRange }
</script>`
}

function generateAngularCode(tier: Tier, showCustom: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<div class="ui-time-range-selector" role="group" aria-label="Time range">
  <div class="ui-time-range-selector__presets">
    <button
      *ngFor="let preset of presets"
      class="ui-time-range-selector__preset"
      [attr.data-active]="isActive(preset) ? 'true' : null"
      [attr.aria-pressed]="isActive(preset)"
      (click)="selectPreset(preset)"
    >
      {{ preset.label }}
    </button>
  </div>${showCustom ? `
  <div class="ui-time-range-selector__custom">
    <input type="datetime-local" class="ui-time-range-selector__input" aria-label="Start time"
           [value]="startTime" (change)="onStartChange($event)">
    <span aria-hidden="true">—</span>
    <input type="datetime-local" class="ui-time-range-selector__input" aria-label="End time"
           [value]="endTime" (change)="onEndChange($event)">
  </div>` : ''}
</div>

/* Import component CSS */
@import '${importPath}/css/components/time-range-selector.css';`
}

function generateSvelteCode(tier: Tier, showCustom: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-time-range-selector" role="group" aria-label="Time range">
  <div class="ui-time-range-selector__presets">
    {#each presets as preset}
      <button
        class="ui-time-range-selector__preset"
        data-active={isActive(preset) ? 'true' : undefined}
        on:click={() => selectPreset(preset)}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  value={range}', '  onChange={handleChange}']
  if (showCustom) attrs.push('  showCustom')

  return `<script>
  import { TimeRangeSelector } from '${importPath}';
  let range = [Date.now() - 86400000, Date.now()];
  const handleChange = (newRange) => { range = newRange; };
</script>

<TimeRangeSelector
${attrs.join('\n')}
/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const now = Date.now()
  const [range, setRange] = useState<[number, number]>([now - 86400000, now])
  const [showCustom, setShowCustom] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, showCustom, motion), [tier, showCustom, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, showCustom), [tier, showCustom])
  const vueCode = useMemo(() => generateVueCode(tier, showCustom), [tier, showCustom])
  const angularCode = useMemo(() => generateAngularCode(tier, showCustom), [tier, showCustom])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showCustom), [tier, showCustom])

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
    <section className="time-range-selector-page__section" id="playground">
      <h2 className="time-range-selector-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="time-range-selector-page__section-desc">
        Toggle features and see the selector update in real-time. Generated code updates as you change settings.
      </p>

      <div className="time-range-selector-page__playground">
        <div className="time-range-selector-page__playground-preview">
          <div className="time-range-selector-page__playground-result">
            <TimeRangeSelector
              value={range}
              onChange={setRange}
              showCustom={showCustom}
              motion={tier !== 'lite' ? motion : undefined}
            />
            <div className="time-range-selector-page__selected-display">
              {formatRange(range)}
            </div>
          </div>

          <div className="time-range-selector-page__code-tabs">
            <div className="time-range-selector-page__export-row">
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
              {copyStatus && <span className="time-range-selector-page__export-status">{copyStatus}</span>}
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

        <div className="time-range-selector-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="time-range-selector-page__control-group">
            <span className="time-range-selector-page__control-label">Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Custom date inputs" checked={showCustom} onChange={setShowCustom} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimeRangeSelectorPage() {
  useStyles('time-range-selector-page', pageStyles)

  const { tier, setTier } = useTier()
  const now = Date.now()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.time-range-selector-page__section')
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

  // Custom presets for the custom presets demo
  const customPresets = [
    { label: '15m', value: '15m', range: [now - 900000, now] as [number, number] },
    { label: '1h', value: '1h', range: [now - 3600000, now] as [number, number] },
    { label: '6h', value: '6h', range: [now - 21600000, now] as [number, number] },
    { label: '12h', value: '12h', range: [now - 43200000, now] as [number, number] },
    { label: '24h', value: '24h', range: [now - 86400000, now] as [number, number] },
  ]

  return (
    <div className="time-range-selector-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="time-range-selector-page__hero">
        <h1 className="time-range-selector-page__title">TimeRangeSelector</h1>
        <p className="time-range-selector-page__desc">
          Quick time range picker with preset buttons and optional custom datetime inputs.
          Perfect for dashboards, monitoring, and log viewers. Uses native datetime-local inputs.
        </p>
        <div className="time-range-selector-page__import-row">
          <code className="time-range-selector-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Default Presets ─────────────────────────── */}
      <section className="time-range-selector-page__section" id="default">
        <h2 className="time-range-selector-page__section-title">
          <a href="#default">Default Presets</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          Without passing presets, the component shows four built-in time ranges:
          1 hour, 24 hours, 7 days, and 30 days from now.
        </p>
        <div className="time-range-selector-page__preview">
          <TimeRangeSelector />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<TimeRangeSelector
  value={range}
  onChange={setRange}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Custom Presets ──────────────────────────── */}
      <section className="time-range-selector-page__section" id="custom-presets">
        <h2 className="time-range-selector-page__section-title">
          <a href="#custom-presets">Custom Presets</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          Pass your own preset array with label, value, and range. Useful for domain-specific
          time windows like shift durations or SLA periods.
        </p>
        <div className="time-range-selector-page__preview">
          <TimeRangeSelector presets={customPresets} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const presets = [
  { label: '15m', value: '15m', range: [now - 900000, now] },
  { label: '1h', value: '1h', range: [now - 3600000, now] },
  { label: '6h', value: '6h', range: [now - 21600000, now] },
  { label: '12h', value: '12h', range: [now - 43200000, now] },
  { label: '24h', value: '24h', range: [now - 86400000, now] },
]

<TimeRangeSelector presets={presets} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. With Custom Inputs ─────────────────────── */}
      <section className="time-range-selector-page__section" id="custom-inputs">
        <h2 className="time-range-selector-page__section-title">
          <a href="#custom-inputs">Custom Date Inputs</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          Enable <code>showCustom</code> to display datetime-local inputs for precise manual range selection.
          Users can combine preset buttons with manual input for fine-grained control.
        </p>
        <div className="time-range-selector-page__preview time-range-selector-page__preview--col">
          <TimeRangeSelector showCustom value={[now - 86400000, now]} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<TimeRangeSelector
  showCustom
  value={[Date.now() - 86400000, Date.now()]}
  onChange={setRange}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Motion Levels ──────────────────────────── */}
      <section className="time-range-selector-page__section" id="motion">
        <h2 className="time-range-selector-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          The component responds to motion intensity settings. At level 0, transitions are instant.
          Higher levels add smooth hover and active state transitions.
        </p>
        <div className="time-range-selector-page__preview time-range-selector-page__preview--col" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>motion=0 (instant)</span>
            <TimeRangeSelector motion={0} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>motion=3 (cinematic)</span>
            <TimeRangeSelector motion={3} />
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="time-range-selector-page__section" id="tiers">
        <h2 className="time-range-selector-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          Choose the right balance of features and bundle size for your time range selector.
        </p>

        <div className="time-range-selector-page__tiers">
          {/* Lite */}
          <div
            className={`time-range-selector-page__tier-card${tier === 'lite' ? ' time-range-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="time-range-selector-page__tier-header">
              <span className="time-range-selector-page__tier-name">Lite</span>
              <span className="time-range-selector-page__tier-size">~0.8 KB</span>
            </div>
            <p className="time-range-selector-page__tier-desc">
              CSS-only preset buttons. No motion transitions, no custom date inputs, no JavaScript interactivity beyond click handlers.
            </p>
            <div className="time-range-selector-page__tier-import">
              import {'{'} TimeRangeSelector {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="time-range-selector-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Static preset buttons</span>
            </div>
            <div className="time-range-selector-page__size-breakdown">
              <div className="time-range-selector-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`time-range-selector-page__tier-card${tier === 'standard' ? ' time-range-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="time-range-selector-page__tier-header">
              <span className="time-range-selector-page__tier-name">Standard</span>
              <span className="time-range-selector-page__tier-size">~1.5 KB</span>
            </div>
            <p className="time-range-selector-page__tier-desc">
              Full-featured selector with presets, custom datetime inputs, motion levels, error boundary wrapping, and full ARIA support.
            </p>
            <div className="time-range-selector-page__tier-import">
              import {'{'} TimeRangeSelector {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="time-range-selector-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Presets + Custom inputs</span>
            </div>
            <div className="time-range-selector-page__size-breakdown">
              <div className="time-range-selector-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`time-range-selector-page__tier-card${tier === 'premium' ? ' time-range-selector-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="time-range-selector-page__tier-header">
              <span className="time-range-selector-page__tier-name">Premium</span>
              <span className="time-range-selector-page__tier-size">~2.5 KB</span>
            </div>
            <p className="time-range-selector-page__tier-desc">
              Everything in Standard plus smooth sliding indicator animation, auto-refresh countdown,
              relative time labels, and spring-based hover effects.
            </p>
            <div className="time-range-selector-page__tier-import">
              import {'{'} TimeRangeSelector {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="time-range-selector-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Sliding indicator + auto-refresh</span>
            </div>
            <div className="time-range-selector-page__size-breakdown">
              <div className="time-range-selector-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="time-range-selector-page__section" id="props">
        <h2 className="time-range-selector-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          All props accepted by TimeRangeSelector. It also spreads any native div HTML attributes
          onto the root element (excluding onChange which is typed for the range tuple).
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={timeRangeProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="time-range-selector-page__section" id="accessibility">
        <h2 className="time-range-selector-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="time-range-selector-page__section-desc">
          Built with proper ARIA roles and keyboard interaction patterns for time selection.
        </p>
        <Card variant="default" padding="md">
          <ul className="time-range-selector-page__a11y-list">
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> Root uses <code className="time-range-selector-page__a11y-key">role="group"</code> with <code className="time-range-selector-page__a11y-key">aria-label="Time range"</code>.
              </span>
            </li>
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pressed state:</strong> Preset buttons use <code className="time-range-selector-page__a11y-key">aria-pressed</code> to indicate active selection.
              </span>
            </li>
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> All preset buttons and inputs are focusable via <code className="time-range-selector-page__a11y-key">Tab</code> key.
              </span>
            </li>
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus ring:</strong> Visible 2px brand-colored outline on <code className="time-range-selector-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Custom inputs use <code className="time-range-selector-page__a11y-key">aria-label</code> for Start/End time context.
              </span>
            </li>
            <li className="time-range-selector-page__a11y-item">
              <span className="time-range-selector-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="time-range-selector-page__a11y-key">forced-colors: active</code> with visible Highlight borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
