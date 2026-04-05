'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NumberInput } from '@ui/components/number-input'
import { NumberInput as LiteNumberInput } from '@ui/lite/number-input'
import { NumberInput as PremiumNumberInput } from '@ui/premium/number-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { CopyBlock } from '@ui/domain/copy-block'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Constants ─────────────────────────────────────────────────────────────────

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
type Size = (typeof SIZES)[number]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { NumberInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { NumberInput } from '@annondeveloper/ui-kit'",
  premium: "import { NumberInput } from '@annondeveloper/ui-kit/premium'",
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

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ni-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ni-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ni-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ni-page__hero::before {
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
        .ni-page__hero::before { animation: none; }
      }

      .ni-page__title {
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

      .ni-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ni-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ni-page__import-code {
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

      .ni-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ────────────────────────────────────── */

      .ni-page__section {
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
        animation: ni-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ni-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .ni-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .ni-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .ni-page__section-title a { color: inherit; text-decoration: none; }
      .ni-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .ni-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .ni-page__preview {
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
        min-block-size: 80px;
      }

      .ni-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .ni-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      @container ni-page (max-width: 640px) {
        .ni-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .ni-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .ni-page__playground-result {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        min-block-size: 120px;
        position: relative;
      }

      .ni-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
        border-radius: inherit;
      }

      .ni-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ni-page__control-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ni-page__control-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        min-inline-size: 5.5rem;
        font-weight: 500;
      }

      .ni-page__control-select {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-primary);
        min-inline-size: 6rem;
      }

      .ni-page__control-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-primary);
        inline-size: 5rem;
      }

      .ni-page__control-check {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .ni-page__control-check input { accent-color: var(--brand); }

      /* ── Tier Cards ─────────────────────────────────── */

      .ni-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container ni-page (max-width: 640px) {
        .ni-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      .ni-page__tier-card {
        padding: 1.25rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .ni-page__tier-card:hover {
        border-color: var(--border-strong);
      }

      .ni-page__tier-card--active {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 1px var(--brand, oklch(65% 0.2 270)), 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      .ni-page__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-block-end: 0.5rem;
      }

      .ni-page__tier-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary);
      }

      .ni-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--brand, oklch(65% 0.2 270));
        font-weight: 600;
      }

      .ni-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0 0 0.75rem;
      }

      .ni-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        padding: 0.375rem 0.5rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
        margin-block-end: 0.75rem;
        overflow-x: auto;
        white-space: nowrap;
      }

      .ni-page__tier-preview {
        padding: 1rem;
        background: var(--bg-elevated);
        border-radius: var(--radius-sm);
        display: flex;
        justify-content: center;
        margin-block-end: 0.75rem;
      }

      .ni-page__size-breakdown {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      .ni-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: space-between;
      }

      /* ── Color Presets ──────────────────────────────── */

      .ni-page__color-presets {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .ni-page__color-preset {
        inline-size: 1.75rem;
        block-size: 1.75rem;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.15s;
      }

      .ni-page__color-preset:hover { transform: scale(1.15); }
      .ni-page__color-preset--active { border-color: var(--text-primary); transform: scale(1.15); }

      /* ── A11y List ──────────────────────────────────── */

      .ni-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ni-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary);
      }

      .ni-page__a11y-icon {
        color: oklch(65% 0.18 150);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ni-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
      }

      /* ── Source Links ───────────────────────────────── */

      .ni-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: none;
        padding: 0.375rem 0;
        transition: color 0.15s;
      }

      .ni-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Labeled Items ──────────────────────────────── */

      .ni-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        align-items: flex-end;
      }

      .ni-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .ni-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      @media (max-width: 640px) {
        .ni-page__playground {
          grid-template-columns: 1fr;
        }
        .ni-page__tiers {
          grid-template-columns: 1fr;
        }
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const niProps: PropDef[] = [
  { name: 'value', type: 'number | null', description: 'Controlled value.' },
  { name: 'defaultValue', type: 'number', description: 'Initial uncontrolled value.' },
  { name: 'onChange', type: '(value: number | null) => void', description: 'Callback on value change.' },
  { name: 'min', type: 'number', description: 'Minimum allowed value.' },
  { name: 'max', type: 'number', description: 'Maximum allowed value.' },
  { name: 'step', type: 'number', description: 'Increment/decrement step for stepper buttons and arrow keys.' },
  { name: 'precision', type: 'number', description: 'Number of decimal places to display.' },
  { name: 'label', type: 'string', description: 'Label text above input.' },
  { name: 'description', type: 'string', description: 'Helper text below input.' },
  { name: 'error', type: 'string', description: 'Error message below input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", description: 'Component size.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'readOnly', type: 'boolean', description: 'Makes read-only.' },
  { name: 'hideControls', type: 'boolean', description: 'Hide increment/decrement stepper buttons.' },
  { name: 'clampBehavior', type: "'strict' | 'blur'", description: "When to clamp: 'strict' clamps on every change, 'blur' only on blur." },
  { name: 'prefix', type: 'string', description: 'Prefix text (e.g., "$").' },
  { name: 'suffix', type: 'string', description: 'Suffix text (e.g., "kg").' },
  { name: 'thousandSeparator', type: 'boolean', description: 'Enable thousand separator formatting.' },
  { name: 'allowNegative', type: 'boolean', description: 'Allow negative values.' },
  { name: 'allowDecimal', type: 'boolean', description: 'Allow decimal values.' },
  { name: 'required', type: 'boolean', description: 'Marks field as required.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="ni-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: Size,
  min: string,
  max: string,
  step: string,
  disabled: boolean,
  hideControls: boolean,
  prefix: string,
  suffix: string,
  thousandSeparator: boolean,
  motion: number,
  label: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (label) props.push(`  label="${label}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (min) props.push(`  min={${min}}`)
  if (max) props.push(`  max={${max}}`)
  if (step && step !== '1') props.push(`  step={${step}}`)
  if (disabled) props.push('  disabled')
  if (hideControls) props.push('  hideControls')
  if (prefix) props.push(`  prefix="${prefix}"`)
  if (suffix) props.push(`  suffix="${suffix}"`)
  if (thousandSeparator) props.push('  thousandSeparator')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<NumberInput />'
    : `<NumberInput\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  tier: Tier,
  size: Size,
  min: string,
  max: string,
  step: string,
  disabled: boolean,
  prefix: string,
  suffix: string,
  label: string,
  brandColor: string,
): string {
  const attrs: string[] = [`type="number"`]
  if (min) attrs.push(`min="${min}"`)
  if (max) attrs.push(`max="${max}"`)
  if (step && step !== '1') attrs.push(`step="${step}"`)
  if (disabled) attrs.push('disabled')

  const labelHtml = label ? `<label class="ui-number-input__label">${label}</label>\n  ` : ''
  const prefixHtml = prefix ? `<span class="ui-number-input__prefix">${prefix}</span>\n    ` : ''
  const suffixHtml = suffix ? `\n    <span class="ui-number-input__suffix">${suffix}</span>` : ''

  return `<!-- HTML+CSS — ${tier} tier -->
<div class="ui-number-input" data-size="${size}">
  ${labelHtml}<div class="ui-number-input__wrapper">
    ${prefixHtml}<input ${attrs.join(' ')} class="ui-number-input__input" />${suffixHtml}
  </div>
</div>

<style>
@import '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}/css/components/number-input.css';
:root { --brand: ${brandColor}; }
</style>`
}

function generateVueCode(
  tier: Tier,
  size: Size,
  min: string,
  max: string,
  step: string,
  disabled: boolean,
  prefix: string,
  suffix: string,
  label: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = ['  v-model="value"']
  if (label) attrs.push(`  label="${label}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (min) attrs.push(`  :min="${min}"`)
  if (max) attrs.push(`  :max="${max}"`)
  if (step && step !== '1') attrs.push(`  :step="${step}"`)
  if (disabled) attrs.push('  disabled')
  if (prefix) attrs.push(`  prefix="${prefix}"`)
  if (suffix) attrs.push(`  suffix="${suffix}"`)

  return `<template>
  <NumberInput
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { NumberInput } from '${importPath}'

const value = ref(0)
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: Size,
  min: string,
  max: string,
  step: string,
  disabled: boolean,
  prefix: string,
  suffix: string,
  label: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = [`class="ui-number-input"`, `data-size="${size}"`]
  if (min) attrs.push(`min="${min}"`)
  if (max) attrs.push(`max="${max}"`)
  if (step && step !== '1') attrs.push(`step="${step}"`)
  if (disabled) attrs.push('[disabled]="true"')

  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only approach) -->
${label ? `<label>${label}</label>\n` : ''}<div class="ui-number-input" data-size="${size}">
  ${prefix ? `<span class="ui-number-input__prefix">${prefix}</span>\n  ` : ''}<input
    type="number"
    ${attrs.join('\n    ')}
    [(ngModel)]="value"
  />${suffix ? `\n  <span class="ui-number-input__suffix">${suffix}</span>` : ''}
</div>

/* In styles.css */
@import '${importPath}/css/components/number-input.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: Size,
  min: string,
  max: string,
  step: string,
  disabled: boolean,
  prefix: string,
  suffix: string,
  label: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = ['  bind:value']
  if (label) attrs.push(`  label="${label}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (min) attrs.push(`  min={${min}}`)
  if (max) attrs.push(`  max={${max}}`)
  if (step && step !== '1') attrs.push(`  step={${step}}`)
  if (disabled) attrs.push('  disabled')
  if (prefix) attrs.push(`  prefix="${prefix}"`)
  if (suffix) attrs.push(`  suffix="${suffix}"`)

  return `<script>
  import { NumberInput } from '${importPath}';

  let value = 0;
</script>

<NumberInput
${attrs.join('\n')}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier, brandColor }: { tier: Tier; brandColor: string }) {
  const [size, setSize] = useState<Size>('md')
  const [min, setMin] = useState('0')
  const [max, setMax] = useState('100')
  const [step, setStep] = useState('1')
  const [disabled, setDisabled] = useState(false)
  const [hideControls, setHideControls] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [thousandSeparator, setThousandSeparator] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [label, setLabel] = useState('Amount')
  const [playgroundValue, setPlaygroundValue] = useState<number | null>(42)

  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const NumberInputComponent = tier === 'lite' ? LiteNumberInput : tier === 'premium' ? PremiumNumberInput : NumberInput

  const reactCode = useMemo(
    () => generateReactCode(tier, size, min, max, step, disabled, hideControls, prefix, suffix, thousandSeparator, motion, label),
    [tier, size, min, max, step, disabled, hideControls, prefix, suffix, thousandSeparator, motion, label],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, min, max, step, disabled, prefix, suffix, label, brandColor),
    [tier, size, min, max, step, disabled, prefix, suffix, label, brandColor],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, min, max, step, disabled, prefix, suffix, label),
    [tier, size, min, max, step, disabled, prefix, suffix, label],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, min, max, step, disabled, prefix, suffix, label),
    [tier, size, min, max, step, disabled, prefix, suffix, label],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, min, max, step, disabled, prefix, suffix, label),
    [tier, size, min, max, step, disabled, prefix, suffix, label],
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

  const previewProps: Record<string, unknown> = {
    size,
    value: playgroundValue,
    onChange: setPlaygroundValue,
    disabled,
    hideControls,
    label,
  }
  if (min) previewProps.min = Number(min)
  if (max) previewProps.max = Number(max)
  if (step) previewProps.step = Number(step)
  if (prefix) previewProps.prefix = prefix
  if (suffix) previewProps.suffix = suffix
  if (thousandSeparator) previewProps.thousandSeparator = true
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="ni-page__section" id="playground">
      <h2 className="ni-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ni-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="ni-page__playground">
        <div className="ni-page__playground-preview">
          <div className="ni-page__playground-result">
            <NumberInputComponent {...previewProps} />
          </div>

          {/* Tabbed code output */}
          <Tabs
            value={activeCodeTab}
            onChange={setActiveCodeTab}
            items={codeTabs}
            size="sm"
          >
            {codeTabs.map(tab => (
              <TabPanel key={tab.id} id={tab.id}>
                <CopyBlock code={activeCode} language="typescript" />
              </TabPanel>
            ))}
          </Tabs>
        </div>

        <div className="ni-page__playground-controls">
          {/* Label */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Label</span>
            <input
              type="text"
              className="ni-page__control-input"
              style={{ inlineSize: '10rem' }}
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          {/* Size */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Size</span>
            <select className="ni-page__control-select" value={size} onChange={e => setSize(e.target.value as Size)}>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Min */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Min</span>
            <input type="text" className="ni-page__control-input" value={min} onChange={e => setMin(e.target.value)} />
          </div>

          {/* Max */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Max</span>
            <input type="text" className="ni-page__control-input" value={max} onChange={e => setMax(e.target.value)} />
          </div>

          {/* Step */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Step</span>
            <input type="text" className="ni-page__control-input" value={step} onChange={e => setStep(e.target.value)} />
          </div>

          {/* Prefix */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Prefix</span>
            <input type="text" className="ni-page__control-input" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g. $" />
          </div>

          {/* Suffix */}
          <div className="ni-page__control-row">
            <span className="ni-page__control-label">Suffix</span>
            <input type="text" className="ni-page__control-input" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="e.g. kg" />
          </div>

          {/* Motion Level */}
          {tier !== 'lite' && (
            <div className="ni-page__control-row">
              <span className="ni-page__control-label">Motion Level</span>
              <select className="ni-page__control-select" value={motion} onChange={e => setMotion(Number(e.target.value) as 0 | 1 | 2 | 3)}>
                <option value={0}>0 - none</option>
                <option value={1}>1 - subtle</option>
                <option value={2}>2 - expressive</option>
                <option value={3}>3 - cinematic</option>
              </select>
            </div>
          )}

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBlockStart: '0.25rem' }}>
            <label className="ni-page__control-check">
              <input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />
              Disabled
            </label>
            <label className="ni-page__control-check">
              <input type="checkbox" checked={hideControls} onChange={e => setHideControls(e.target.checked)} />
              Hide Controls
            </label>
            <label className="ni-page__control-check">
              <input type="checkbox" checked={thousandSeparator} onChange={e => setThousandSeparator(e.target.checked)} />
              Thousands
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NumberInputPage() {
  useStyles('ni-page', pageStyles)
  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  const [brandColor, setBrandColor] = useState('#6366f1')
  const [qty, setQty] = useState<number | null>(1)
  const [price, setPrice] = useState<number | null>(1250.5)

  // Theme from brand color
  const themeStyle = useMemo(() => {
    if (brandColor === '#6366f1') return undefined
    try {
      const tokens = generateTheme(brandColor)
      const vars: Record<string, string> = {}
      for (const [token, value] of Object.entries(tokens)) {
        const cssVar = TOKEN_TO_CSS[token as keyof ThemeTokens]
        if (cssVar) vars[cssVar] = value as string
      }
      return vars as React.CSSProperties
    } catch { return undefined }
  }, [brandColor])

  // IntersectionObserver fallback for scroll reveal
  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const sections = el.querySelectorAll('.ni-page__section')
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

  const NumberInputComponent = tier === 'lite' ? LiteNumberInput : tier === 'premium' ? PremiumNumberInput : NumberInput

  return (
    <div className="ni-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ni-page__hero">
        <h1 className="ni-page__title">NumberInput</h1>
        <p className="ni-page__desc">
          Numeric input with stepper buttons, min/max clamping, prefix/suffix decorations,
          and thousand separators. Supports keyboard arrows and mouse wheel.
        </p>
        <div className="ni-page__import-row">
          <code className="ni-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="ni-page__section" id="sizes">
        <h2 className="ni-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="ni-page__section-desc">
          Five sizes from compact inline actions (xs) to large form fields (xl).
          Sizes control padding, font-size, and minimum block-size.
        </p>
        <div className="ni-page__preview">
          <div className="ni-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="ni-page__labeled-item">
                <NumberInputComponent size={s} defaultValue={42} label={s.toUpperCase()} />
                <span className="ni-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Steppers & Min/Max ─────────────────────── */}
      <section className="ni-page__section" id="steppers">
        <h2 className="ni-page__section-title"><a href="#steppers">Steppers & Min/Max</a></h2>
        <p className="ni-page__section-desc">
          Built-in increment/decrement buttons with configurable step and clamped to min/max bounds.
          Current value: {qty ?? 'null'}.
        </p>
        <div className="ni-page__preview">
          <NumberInputComponent
            label="Quantity"
            value={qty}
            onChange={setQty}
            min={0}
            max={100}
            step={1}
            placeholder="0-100"
          />
          <NumberInputComponent
            label="Step of 5"
            defaultValue={25}
            min={0}
            max={100}
            step={5}
          />
          <NumberInputComponent
            label="No controls"
            defaultValue={42}
            hideControls
          />
        </div>
      </section>

      {/* ── 5. Prefix, Suffix & Thousands ─────────────── */}
      <section className="ni-page__section" id="formatting">
        <h2 className="ni-page__section-title"><a href="#formatting">Prefix, Suffix & Formatting</a></h2>
        <p className="ni-page__section-desc">
          Decorate values with prefix/suffix strings and enable thousand separators for large numbers.
        </p>
        <div className="ni-page__preview">
          <NumberInputComponent
            label="Price"
            prefix="$"
            value={price}
            onChange={setPrice}
            precision={2}
            thousandSeparator
            min={0}
          />
          <NumberInputComponent
            label="Weight"
            suffix="kg"
            defaultValue={75}
            step={0.5}
            precision={1}
          />
          <NumberInputComponent
            label="Percentage"
            suffix="%"
            min={0}
            max={100}
            defaultValue={50}
          />
        </div>
      </section>

      {/* ── 6. Validation & States ────────────────────── */}
      <section className="ni-page__section" id="validation">
        <h2 className="ni-page__section-title"><a href="#validation">Validation & States</a></h2>
        <p className="ni-page__section-desc">
          Error messages, disabled state, read-only mode, and strict clamping behavior.
        </p>
        <div className="ni-page__preview">
          <NumberInputComponent label="With error" error="Value must be positive" defaultValue={-5} />
          <NumberInputComponent label="Disabled" disabled defaultValue={10} />
          <NumberInputComponent label="Read only" readOnly defaultValue={99} />
          <NumberInputComponent label="Required" required defaultValue={0} />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="ni-page__section" id="tiers">
        <h2 className="ni-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="ni-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion props).
        </p>

        <div className="ni-page__tiers">
          {/* Lite */}
          <div
            className={`ni-page__tier-card${tier === 'lite' ? ' ni-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="ni-page__tier-header">
              <span className="ni-page__tier-name">Lite</span>
              <span className="ni-page__tier-size">~0.3 KB</span>
            </div>
            <p className="ni-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No motion or animations.
            </p>
            <div className="ni-page__tier-import">
              import {'{'} NumberInput {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="ni-page__tier-preview">
              <LiteNumberInput label="Lite" defaultValue={42} />
            </div>
            <div className="ni-page__size-breakdown">
              <div className="ni-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`ni-page__tier-card${tier === 'standard' ? ' ni-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="ni-page__tier-header">
              <span className="ni-page__tier-name">Standard</span>
              <span className="ni-page__tier-size">~2 KB</span>
            </div>
            <p className="ni-page__tier-desc">
              Full-featured with motion, theming, accessibility,
              and stepper buttons.
            </p>
            <div className="ni-page__tier-import">
              import {'{'} NumberInput {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="ni-page__tier-preview">
              <NumberInput label="Standard" defaultValue={42} />
            </div>
            <div className="ni-page__size-breakdown">
              <div className="ni-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`ni-page__tier-card${tier === 'premium' ? ' ni-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="ni-page__tier-header">
              <span className="ni-page__tier-name">Premium</span>
              <span className="ni-page__tier-size">~3 KB</span>
            </div>
            <p className="ni-page__tier-desc">
              Everything in Standard plus aurora glow,
              spring animations, and shimmer effects.
            </p>
            <div className="ni-page__tier-import">
              import {'{'} NumberInput {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="ni-page__tier-preview">
              <PremiumNumberInput label="Premium" defaultValue={42} />
            </div>
            <div className="ni-page__size-breakdown">
              <div className="ni-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────────── */}
      <section className="ni-page__section" id="brand-color">
        <h2 className="ni-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="ni-page__section-desc">
          Pick a brand color to see all number inputs update in real-time. The theme generates
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
          <div className="ni-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`ni-page__color-preset${brandColor === p.hex ? ' ni-page__color-preset--active' : ''}`}
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
          <div className="ni-page__preview">
            <NumberInputComponent label="Preview with brand" defaultValue={42} prefix="$" thousandSeparator />
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="ni-page__section" id="props">
        <h2 className="ni-page__section-title"><a href="#props">Props API</a></h2>
        <p className="ni-page__section-desc">
          All props accepted by NumberInput. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={niProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="ni-page__section" id="accessibility">
        <h2 className="ni-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ni-page__section-desc">
          Built on native input elements with comprehensive ARIA support and keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="ni-page__a11y-list">
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Use <code className="ni-page__a11y-key">ArrowUp</code> / <code className="ni-page__a11y-key">ArrowDown</code> to increment/decrement by step.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="ni-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Associated <code className="ni-page__a11y-key">{'<label>'}</code> element links to input via <code className="ni-page__a11y-key">htmlFor</code> / <code className="ni-page__a11y-key">id</code>.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages linked via <code className="ni-page__a11y-key">aria-describedby</code> and <code className="ni-page__a11y-key">aria-invalid</code>.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All states meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses both <code className="ni-page__a11y-key">disabled</code> attribute and <code className="ni-page__a11y-key">aria-disabled</code> for maximum compatibility.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Stepper buttons enforce 44px minimum on coarse pointer devices via <code className="ni-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="ni-page__a11y-item">
              <span className="ni-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="ni-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ──────────────────────────────────── */}
      <section className="ni-page__section" id="source">
        <h2 className="ni-page__section-title"><a href="#source">Source</a></h2>
        <p className="ni-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="ni-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/number-input.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/number-input.tsx (Standard)
          </a>
          <a className="ni-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/number-input.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/number-input.tsx (Lite)
          </a>
          <a className="ni-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/number-input.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/number-input.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
