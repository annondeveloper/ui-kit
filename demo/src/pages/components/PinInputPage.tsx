'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PinInput } from '@ui/components/pin-input'
import { PinInput as LitePinInput } from '@ui/lite/pin-input'
import { PinInput as PremiumPinInput } from '@ui/premium/pin-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ──────────────────────────────────────────────────────────────────

type PinSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type PinType = 'number' | 'alphanumeric'

const SIZES: readonly PinSize[] = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const TYPES: readonly PinType[] = ['number', 'alphanumeric'] as const

// ─── Props ──────────────────────────────────────────────────────────────────

const pinProps: PropDef[] = [
  { name: 'length', type: 'number', default: '4', description: 'Number of input digits.' },
  { name: 'value', type: 'string', description: 'Controlled pin value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called on each digit change.' },
  { name: 'onComplete', type: '(value: string) => void', description: 'Called when all digits are filled.' },
  { name: 'mask', type: 'boolean', default: 'true', description: 'Mask entered digits with dots for security.' },
  { name: 'type', type: "'number' | 'alphanumeric'", default: "'number'", description: 'Restrict input to numbers or allow letters too.' },
  { name: 'placeholder', type: 'string', default: "'○'", description: 'Placeholder character for empty digits.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input cell size scale.' },
  { name: 'error', type: 'boolean', default: 'false', description: 'Show error styling on all digits.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all digit inputs.' },
  { name: 'oneTimeCode', type: 'boolean', default: 'false', description: 'Set autocomplete="one-time-code" for SMS autofill.' },
  { name: 'manageFocus', type: 'boolean', default: 'true', description: 'Auto-advance focus to next digit on input.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Page Styles ────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pin-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pin-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .pin-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pin-page__hero::before {
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
        .pin-page__hero::before { animation: none; }
      }

      .pin-page__title {
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

      .pin-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pin-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pin-page__import-code {
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

      .pin-page__section {
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
        animation: pin-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pin-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .pin-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .pin-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .pin-page__section-title a { color: inherit; text-decoration: none; }
      .pin-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .pin-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .pin-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .pin-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pin-page__preview--col {
        flex-direction: column;
        align-items: center;
      }

      .pin-page__status {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        text-align: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .pin-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        min-block-size: 260px;
      }

      @container pin-page (max-width: 640px) {
        .pin-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .pin-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .pin-page__playground-result {
        padding: 3rem 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        position: relative;
        min-block-size: 120px;
      }

      .pin-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pin-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      .pin-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .pin-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .pin-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .pin-page__option-btn {
        padding: 0.25rem 0.625rem;
        font-size: var(--text-xs, 0.75rem);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        transition: all 0.12s;
      }
      .pin-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .pin-page__option-btn--active {
        background: var(--brand);
        border-color: var(--brand);
        color: oklch(100% 0 0);
      }

      .pin-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .pin-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .pin-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .pin-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-success, oklch(70% 0.17 145));
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .pin-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container pin-page (max-width: 640px) {
        .pin-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      .pin-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
      }

      .pin-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pin-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .pin-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pin-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .pin-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .pin-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .pin-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
      }

      /* ── Accessibility ─────────────────────────────── */

      .pin-page__a11y-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .pin-page__a11y-item {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .pin-page__a11y-icon {
        flex-shrink: 0;
        color: var(--status-success, oklch(70% 0.17 145));
        font-size: 1.125rem;
      }

      .pin-page__a11y-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .pin-page__a11y-text strong {
        color: var(--text-primary);
        display: block;
        margin-block-end: 0.125rem;
      }
    }
  }
`

// ─── Import Strings ─────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { PinInput } from '@annondeveloper/ui-kit'",
  lite: "import { PinInput } from '@annondeveloper/ui-kit/lite'",
  premium: "import { PinInput } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    <div className="pin-page__control-group">
      <span className="pin-page__control-label">{label}</span>
      <div className="pin-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`pin-page__option-btn${opt === value ? ' pin-page__option-btn--active' : ''}`}
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
    <label className="pin-page__toggle-label">
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

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier, length: number, size: PinSize, type: PinType,
  mask: boolean, disabled: boolean, error: boolean, oneTimeCode: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (length !== 4) props.push(`  length={${length}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (type !== 'number') props.push(`  type="${type}"`)
  if (!mask) props.push('  mask={false}')
  if (disabled) props.push('  disabled')
  if (error) props.push('  error')
  if (oneTimeCode) props.push('  oneTimeCode')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<PinInput onChange={setPin} onComplete={handleComplete} />'
    : `<PinInput\n${props.join('\n')}\n  onChange={setPin}\n  onComplete={handleComplete}\n/>`

  return `${importStr}

function MyComponent() {
  const [pin, setPin] = useState('')
  const handleComplete = (value: string) => console.log('PIN:', value)

  return (
    ${jsx}
  )
}`
}

function generateHtmlCode(length: number, size: PinSize, disabled: boolean): string {
  const inputs = Array.from({ length }, (_, i) =>
    `  <input class="ui-pin-input__digit" type="text" inputmode="numeric" maxlength="1" aria-label="PIN digit ${i + 1} of ${length}"${disabled ? ' disabled' : ''} />`
  ).join('\n')

  return `<!-- PinInput — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/pin-input.css">

<div class="ui-pin-input" data-size="${size}" role="group" aria-label="PIN input">
  <div class="ui-pin-input__digits">
${inputs}
  </div>
</div>

<!-- Add JS for auto-advance focus and paste handling -->`
}

function generateVueCode(tier: Tier, length: number, size: PinSize, type: PinType, mask: boolean, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-pin-input" data-size="${size}" role="group" aria-label="PIN input">
    <div class="ui-pin-input__digits">
      <input v-for="i in ${length}" :key="i" class="ui-pin-input__digit"
        type="text" inputmode="numeric" maxlength="1"
        :aria-label="\`PIN digit \${i} of ${length}\`"${disabled ? ' disabled' : ''} />
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/pin-input.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (length !== 4) attrs.push(`  :length="${length}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (type !== 'number') attrs.push(`  type="${type}"`)
  if (!mask) attrs.push('  :mask="false"')
  if (disabled) attrs.push('  disabled')

  return `<template>
  <PinInput${attrs.length > 0 ? '\n' + attrs.join('\n') : ''}
    @change="onPinChange"
    @complete="onComplete"
  />
</template>

<script setup>
import { PinInput } from '${importPath}'

const onPinChange = (value) => console.log(value)
const onComplete = (value) => console.log('Complete:', value)
</script>`
}

function generateAngularCode(tier: Tier, length: number, size: PinSize, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-pin-input" data-size="${size}" role="group" aria-label="PIN input">
  <div class="ui-pin-input__digits">
    <input *ngFor="let i of [${Array.from({ length }, (_, i) => i).join(',')}]"
      class="ui-pin-input__digit" type="text" inputmode="numeric" maxlength="1"
      [attr.aria-label]="'PIN digit ' + (i+1) + ' of ${length}'"
      ${disabled ? '[disabled]="true"' : ''} />
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/pin-input.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-pin-input" data-size="${size}" role="group" aria-label="PIN input">
  <div class="ui-pin-input__digits">
    <input *ngFor="let i of digits"
      class="ui-pin-input__digit" type="text" inputmode="numeric" maxlength="1"
      [attr.aria-label]="'PIN digit ' + (i+1) + ' of ${length}'"
      ${disabled ? '[disabled]="true"' : ''} />
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/pin-input.css';`
}

function generateSvelteCode(tier: Tier, length: number, size: PinSize, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-pin-input" data-size="${size}" role="group" aria-label="PIN input">
  <div class="ui-pin-input__digits">
    {#each Array(${length}) as _, i}
      <input class="ui-pin-input__digit" type="text" inputmode="numeric" maxlength="1"
        aria-label="PIN digit {i+1} of ${length}"
        ${disabled ? 'disabled' : ''} />
    {/each}
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/pin-input.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { PinInput } from '${importPath}';

  let pin = '';
  const handleComplete = (value) => console.log('Complete:', value);
</script>

<PinInput
  length={${length}}
  size="${size}"
  ${disabled ? 'disabled' : ''}
  on:change={(e) => pin = e.detail}
  on:complete={(e) => handleComplete(e.detail)}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [size, setSize] = useState<PinSize>('md')
  const [type, setType] = useState<PinType>('number')
  const [length, setLength] = useState(4)
  const [mask, setMask] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(false)
  const [oneTimeCode, setOneTimeCode] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [playPin, setPlayPin] = useState('')
  const [completedPin, setCompletedPin] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const InputComponent = effectiveTier === 'lite' ? LitePinInput : effectiveTier === 'premium' ? PremiumPinInput : PinInput

  const reactCode = useMemo(
    () => generateReactCode(tier, length, size, type, mask, disabled, error, oneTimeCode, motion),
    [tier, length, size, type, mask, disabled, error, oneTimeCode, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(length, size, disabled),
    [length, size, disabled],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, length, size, type, mask, disabled),
    [tier, length, size, type, mask, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, length, size, disabled),
    [tier, length, size, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, length, size, disabled),
    [tier, length, size, disabled],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML' },
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
    <section className="pin-page__section" id="playground">
      <h2 className="pin-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="pin-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="pin-page__playground">
        <div className="pin-page__playground-preview">
          <div className="pin-page__playground-result">
            <InputComponent
              key={`${length}-${type}-${size}`}
              length={length}
              size={size}
              type={type}
              mask={mask}
              disabled={disabled}
              error={error}
              oneTimeCode={oneTimeCode}
              motion={tier === 'lite' ? undefined : motion}
              value={playPin}
              onChange={setPlayPin}
              onComplete={setCompletedPin}
            />
            {completedPin && (
              <span className="pin-page__status">Completed: {completedPin}</span>
            )}
          </div>

          <div className="pin-page__code-tabs">
            <div className="pin-page__export-row">
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
              {copyStatus && <span className="pin-page__export-status">{copyStatus}</span>}
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

        <div className="pin-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Type" options={TYPES} value={type} onChange={setType} />

          <OptionGroup
            label="Length"
            options={['4', '6', '8'] as const}
            value={String(length) as '4' | '6' | '8'}
            onChange={v => { setLength(Number(v)); setPlayPin(''); setCompletedPin('') }}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="pin-page__control-group">
            <span className="pin-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Mask digits" checked={mask} onChange={setMask} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              <Toggle label="Error state" checked={error} onChange={setError} />
              <Toggle label="One-time code" checked={oneTimeCode} onChange={setOneTimeCode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PinInputPage() {
  useStyles('pin-page', pageStyles)
  const { tier, setTier } = useTier()
  const effectiveTier = tier
  const [brandColor, setBrandColor] = useState('#6366f1')

  const InputComponent = effectiveTier === 'lite' ? LitePinInput : effectiveTier === 'premium' ? PremiumPinInput : PinInput

  const [pin, setPin] = useState('')
  const [completed, setCompleted] = useState('')

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.pin-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="pin-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="pin-page__hero">
        <h1 className="pin-page__title">PinInput</h1>
        <p className="pin-page__desc">
          One-time code and PIN entry with auto-advancing focus, paste support, masked input,
          and configurable length. Supports SMS autofill with oneTimeCode.
        </p>
        <div className="pin-page__import-row">
          <code className="pin-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyBlock code={IMPORT_STRINGS[tier]} language="typescript" />
        </div>
      </div>

      {/* ── 1. Basic & Masked ────────────────────────── */}
      <section className="pin-page__section" id="basic">
        <h2 className="pin-page__section-title"><a href="#basic">Basic & Masked</a></h2>
        <p className="pin-page__section-desc">
          Default 4-digit pin with auto-focus advance. Enable mask to hide entered digits.
          {completed ? ` Completed: ${completed}` : ''}
        </p>
        <div className="pin-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent
              value={pin}
              onChange={setPin}
              onComplete={setCompleted}
            />
            <span className="pin-page__status">Visible digits</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent mask length={4} />
            <span className="pin-page__status">Masked</span>
          </div>
        </div>
      </section>

      {/* ── 2. Length & Type ──────────────────────────── */}
      <section className="pin-page__section" id="length">
        <h2 className="pin-page__section-title"><a href="#length">Length & Alphanumeric</a></h2>
        <p className="pin-page__section-desc">
          Configure length from 4 to 8 digits. Use type="alphanumeric" to accept letters alongside numbers.
        </p>
        <div className="pin-page__preview pin-page__preview--col">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent length={6} oneTimeCode />
            <span className="pin-page__status">6-digit OTP (SMS autofill)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent length={8} type="alphanumeric" placeholder="-" />
            <span className="pin-page__status">8-character alphanumeric</span>
          </div>
        </div>
      </section>

      {/* ── 3. Sizes ─────────────────────────────────── */}
      <section className="pin-page__section" id="sizes">
        <h2 className="pin-page__section-title"><a href="#sizes">All Sizes</a></h2>
        <p className="pin-page__section-desc">
          Five size options from extra-small to extra-large. Touch targets are enforced at 44px minimum on coarse pointer devices.
        </p>
        <div className="pin-page__preview pin-page__preview--col">
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <InputComponent size={s} length={4} />
              <span className="pin-page__status">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Error & Disabled ──────────────────────── */}
      <section className="pin-page__section" id="states">
        <h2 className="pin-page__section-title"><a href="#states">Error & Disabled</a></h2>
        <p className="pin-page__section-desc">
          Error state highlights all digit cells in red with a shake animation. Disabled prevents any input.
        </p>
        <div className="pin-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent error value="12" length={4} />
            <span className="pin-page__status">Error state</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <InputComponent disabled value="1234" length={4} />
            <span className="pin-page__status">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 5. Live Playground ────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 6. Weight Tiers ──────────────────────────── */}
      <section className="pin-page__section" id="tiers">
        <h2 className="pin-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="pin-page__section-desc">
          Choose the tier that fits your performance budget. Lite strips motion for minimal footprint,
          Premium adds aurora glow and spring entrance animations.
        </p>
        <div className="pin-page__tiers">
          <div
            className={`pin-page__tier-card${tier === 'lite' ? ' pin-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
          >
            <div className="pin-page__tier-header">
              <span className="pin-page__tier-name">Lite</span>
              <span className="pin-page__tier-size">~1.5 KB gzip</span>
            </div>
            <p className="pin-page__tier-desc">
              Minimal footprint, no motion or advanced theming. Wraps standard with motion=0.
            </p>
            <code className="pin-page__tier-import">
              {IMPORT_STRINGS.lite}
            </code>
          </div>
          <div
            className={`pin-page__tier-card${tier === 'standard' ? ' pin-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
          >
            <div className="pin-page__tier-header">
              <span className="pin-page__tier-name">Standard</span>
              <span className="pin-page__tier-size">~2.2 KB gzip</span>
            </div>
            <p className="pin-page__tier-desc">
              Full-featured with motion, focus glow, error shake, and theming.
            </p>
            <code className="pin-page__tier-import">
              {IMPORT_STRINGS.standard}
            </code>
          </div>
          <div
            className={`pin-page__tier-card${tier === 'premium' ? ' pin-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
          >
            <div className="pin-page__tier-header">
              <span className="pin-page__tier-name">Premium</span>
              <span className="pin-page__tier-size">~2.8 KB gzip</span>
            </div>
            <p className="pin-page__tier-desc">
              Aurora glow on focus, spring entrance stagger, and shimmer effects.
            </p>
            <code className="pin-page__tier-import">
              {IMPORT_STRINGS.premium}
            </code>
          </div>
        </div>
      </section>

      {/* ── 7. Accessibility ─────────────────────────── */}
      <section className="pin-page__section" id="accessibility">
        <h2 className="pin-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="pin-page__section-desc">
          PinInput follows WAI-ARIA best practices for one-time code entry fields.
        </p>
        <div className="pin-page__a11y-grid">
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>ARIA labels</strong>
              Each digit input has an aria-label like "PIN digit 1 of 4" for screen reader context.
            </div>
          </div>
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>Keyboard navigation</strong>
              Arrow keys move between digits. Backspace clears and moves back. Paste fills all digits.
            </div>
          </div>
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>Focus management</strong>
              Auto-advance on input with manageFocus prop. Focus ring visible on keyboard navigation.
            </div>
          </div>
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>Touch targets</strong>
              44px minimum on coarse pointer devices. Error state uses aria-invalid for screen readers.
            </div>
          </div>
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>Forced colors</strong>
              Full support for Windows High Contrast mode with proper border and focus styles.
            </div>
          </div>
          <div className="pin-page__a11y-item">
            <span className="pin-page__a11y-icon">&#x2705;</span>
            <div className="pin-page__a11y-text">
              <strong>Reduced motion</strong>
              Error shake animation respects prefers-reduced-motion. Lite tier has zero motion.
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────── */}
      <section className="pin-page__section" id="branding">
        <h2 className="pin-page__section-title"><a href="#branding">Brand Color</a></h2>
        <p className="pin-page__section-desc">
          PinInput inherits the brand color from your theme via <code>--brand</code> CSS custom property.
          The focus glow, error states, and premium aurora effects all adapt to your brand color automatically.
          Use the UIProvider or <code>generateTheme()</code> to set your brand color globally.
        </p>
      </section>

      {/* ── 9. Source ────────────────────────────────── */}
      <section className="pin-page__section" id="source">
        <h2 className="pin-page__section-title"><a href="#source">Source</a></h2>
        <p className="pin-page__section-desc">
          View the component source on GitHub.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="github" size="sm" />}
            onClick={() => window.open('https://github.com/annondeveloper/ui-kit/blob/main/src/components/pin-input.tsx', '_blank')}
          >
            Source on GitHub
          </Button>
        </div>
      </section>

      {/* ── 10. Props ────────────────────────────────── */}
      <section className="pin-page__section" id="props">
        <h2 className="pin-page__section-title"><a href="#props">Props</a></h2>
        <p className="pin-page__section-desc">
          All props accepted by PinInput. Also accepts native div attributes via rest spread.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pinProps} />
        </Card>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="pin-page__section" id="brand-color">
        <h2 className="pin-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="pin-page__section-desc">Pick a brand color to preview the component with your brand identity.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
        </div>
      </section>
    </div>
  )
}
