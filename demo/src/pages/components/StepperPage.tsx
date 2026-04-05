'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Stepper } from '@ui/components/stepper'
import { Stepper as LiteStepper } from '@ui/lite/stepper'
import { Stepper as PremiumStepper } from '@ui/premium/stepper'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.stepper-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: stepper-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .stepper-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .stepper-page__hero::before {
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
        animation: aurora-spin-sp 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-sp {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .stepper-page__hero::before { animation: none; }
      }

      .stepper-page__title {
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

      .stepper-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .stepper-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .stepper-page__import-code {
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
      }

      .stepper-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-sp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-sp {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .stepper-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .stepper-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .stepper-page__section-title a { color: inherit; text-decoration: none; }
      .stepper-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .stepper-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .stepper-page__preview {
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

      .stepper-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stepper-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .stepper-page__nav-row {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        margin-block-start: 1rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .stepper-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .stepper-page__playground {
          grid-template-columns: 1fr;
        }
        .stepper-page__playground-controls {
          position: static !important;
        }
      }

      @container stepper-page (max-width: 680px) {
        .stepper-page__playground {
          grid-template-columns: 1fr;
        }
        .stepper-page__playground-controls {
          position: static !important;
        }
      }

      .stepper-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .stepper-page__playground-result {
        overflow-x: auto;
        min-block-size: 160px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .stepper-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stepper-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .stepper-page__playground-controls {
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

      .stepper-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .stepper-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stepper-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .stepper-page__option-btn {
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
      .stepper-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .stepper-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .stepper-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .stepper-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .stepper-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .stepper-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: oklch(75% 0.15 150);
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .stepper-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .stepper-page__tier-card {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        background: var(--bg-base);
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .stepper-page__tier-card:hover {
        border-color: var(--border-strong);
      }
      .stepper-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .stepper-page__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-block-end: 0.5rem;
      }

      .stepper-page__tier-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary);
      }

      .stepper-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .stepper-page__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0 0 0.75rem;
      }

      .stepper-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
        padding: 0.375rem 0.5rem;
        margin-block-end: 0.75rem;
        overflow-x: auto;
        white-space: nowrap;
      }

      .stepper-page__tier-preview {
        padding: 1rem;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
        margin-block-end: 0.75rem;
      }

      .stepper-page__size-breakdown {
        border-block-start: 1px solid var(--border-subtle);
        padding-block-start: 0.5rem;
      }

      .stepper-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
      }

      /* ── A11y list ──────────────────────────────────── */

      .stepper-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .stepper-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .stepper-page__a11y-icon {
        color: oklch(75% 0.15 150);
        flex-shrink: 0;
        margin-block-start: 0.15rem;
      }

      .stepper-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        border-radius: 3px;
        padding: 0.1em 0.35em;
      }

      /* ── Source links ───────────────────────────────── */

      .stepper-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
      }
      .stepper-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .stepper-page__import-code,
      .stepper-page code,
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

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'billing', label: 'Billing', description: 'Add payment method' },
  { id: 'review', label: 'Review', description: 'Confirm and finish' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Stepper } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Stepper } from '@annondeveloper/ui-kit'",
  premium: "import { Stepper } from '@annondeveloper/ui-kit/premium'",
}

type Orientation = 'horizontal' | 'vertical'
type StepperVariant = 'default' | 'dots' | 'progress'
type Size = 'sm' | 'md' | 'lg'

const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']
const VARIANTS: StepperVariant[] = ['default', 'dots', 'progress']
const SIZES: Size[] = ['sm', 'md', 'lg']

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

const propsData: PropDef[] = [
  { name: 'steps', type: 'StepperStep[]', required: true, description: 'Array of step definitions to render.' },
  { name: 'activeStep', type: 'number', required: true, description: 'Zero-based index of the current active step.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the stepper.' },
  { name: 'variant', type: "'default' | 'dots' | 'progress'", default: "'default'", description: 'Visual style of the step indicators.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls icon and text size.' },
  { name: 'onStepClick', type: '(step: number) => void', description: 'Callback when a step is clicked. Enables clickable steps.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

const stepperStepProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the step.' },
  { name: 'label', type: 'ReactNode', required: true, description: 'Label text displayed for the step.' },
  { name: 'description', type: 'string', description: 'Optional helper text below the label.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon element rendered in the step indicator.' },
  { name: 'optional', type: 'boolean', description: 'Marks the step as optional.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    <div className="stepper-page__control-group">
      <span className="stepper-page__control-label">{label}</span>
      <div className="stepper-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`stepper-page__option-btn${opt === value ? ' stepper-page__option-btn--active' : ''}`}
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
    <label className="stepper-page__toggle-label">
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

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  activeStep: number,
  orientation: Orientation,
  variant: StepperVariant,
  size: Size,
  clickable: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  steps={steps}',
    `  activeStep={${activeStep}}`,
  ]
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (clickable) props.push('  onStepClick={setActiveStep}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

const steps = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'billing', label: 'Billing', description: 'Add payment method' },
  { id: 'review',  label: 'Review',  description: 'Confirm and finish' },
]

<Stepper
${props.join('\n')}
/>`
}

function generateHtmlCode(
  tier: Tier,
  activeStep: number,
  orientation: Orientation,
  variant: StepperVariant,
  size: Size,
): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssFile = tier === 'lite'
    ? 'lite/styles.css'
    : 'css/components/stepper.css'

  const stepHtml = STEPS.map((step, i) => {
    const status = i < activeStep ? 'completed' : i === activeStep ? 'active' : 'pending'
    return `  <div class="ui-stepper__step" data-status="${status}">
    <div class="ui-stepper__indicator">${i < activeStep ? '&#10003;' : i + 1}</div>
    <div class="ui-stepper__label">${step.label}</div>
  </div>`
  }).join('\n')

  return `<!-- Stepper — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cssFile}">

<div class="ui-stepper"
  data-orientation="${orientation}"
  data-variant="${variant}"
  data-size="${size}">
${stepHtml}
</div>`
}

function generateVueCode(
  tier: Tier,
  activeStep: number,
  orientation: Orientation,
  variant: StepperVariant,
  size: Size,
  clickable: boolean,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = [
    '    :steps="steps"',
    `    :active-step="${activeStep}"`,
  ]
  if (orientation !== 'horizontal') attrs.push(`    orientation="${orientation}"`)
  if (variant !== 'default') attrs.push(`    variant="${variant}"`)
  if (size !== 'md') attrs.push(`    size="${size}"`)
  if (clickable) attrs.push('    @step-click="onStepClick"')

  return `<template>
  <Stepper
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { Stepper } from '${importPath}'

const steps = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'billing', label: 'Billing', description: 'Add payment method' },
  { id: 'review',  label: 'Review',  description: 'Confirm and finish' },
]

const activeStep = ref(${activeStep})
const onStepClick = (step) => { activeStep.value = step }
</script>`
}

function generateAngularCode(
  tier: Tier,
  activeStep: number,
  orientation: Orientation,
  variant: StepperVariant,
  size: Size,
): string {
  const importPath = tier === 'premium'
    ? '@annondeveloper/ui-kit/premium'
    : '@annondeveloper/ui-kit'
  const cssImport = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : `${importPath}/css/components/stepper.css`

  const stepHtml = STEPS.map((step, i) => {
    const status = i < activeStep ? 'completed' : i === activeStep ? 'active' : 'pending'
    return `  <div class="ui-stepper__step" data-status="${status}">
    <div class="ui-stepper__indicator">${i < activeStep ? '&#10003;' : i + 1}</div>
    <span class="ui-stepper__label">${step.label}</span>
  </div>`
  }).join('\n')

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : tier === 'lite' ? 'Lite' : 'Standard'} tier (CSS-only) -->
<div class="ui-stepper"
  data-orientation="${orientation}"
  data-variant="${variant}"
  data-size="${size}">
${stepHtml}
</div>

/* In styles.css */
@import '${cssImport}';`
}

function generateSvelteCode(
  tier: Tier,
  activeStep: number,
  orientation: Orientation,
  variant: StepperVariant,
  size: Size,
  clickable: boolean,
): string {
  if (tier === 'lite') {
    const stepHtml = STEPS.map((step, i) => {
      const status = i < activeStep ? 'completed' : i === activeStep ? 'active' : 'pending'
      return `  <div class="ui-stepper__step" data-status="${status}">
    <div class="ui-stepper__indicator">${i < activeStep ? '&#10003;' : i + 1}</div>
    <span class="ui-stepper__label">${step.label}</span>
  </div>`
    }).join('\n')
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-stepper"
  data-orientation="${orientation}"
  data-variant="${variant}"
  data-size="${size}">
${stepHtml}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium'
    ? '@annondeveloper/ui-kit/premium'
    : '@annondeveloper/ui-kit'

  const attrs: string[] = [
    '  steps={steps}',
    `  activeStep={${activeStep}}`,
  ]
  if (orientation !== 'horizontal') attrs.push(`  orientation="${orientation}"`)
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (clickable) attrs.push('  onStepClick={handleStepClick}')

  return `<script>
  import { Stepper } from '${importPath}';

  let activeStep = ${activeStep};
  const steps = [
    { id: 'account', label: 'Account', description: 'Create your account' },
    { id: 'profile', label: 'Profile', description: 'Set up your profile' },
    { id: 'billing', label: 'Billing', description: 'Add payment method' },
    { id: 'review',  label: 'Review',  description: 'Confirm and finish' },
  ];
  const handleStepClick = (step) => { activeStep = step };
</script>

<Stepper
${attrs.join('\n')}
/>`
}

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [activeStep, setActiveStep] = useState(1)
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [variant, setVariant] = useState<StepperVariant>('default')
  const [size, setSize] = useState<Size>('md')
  const [clickable, setClickable] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const StepperComponent = effectiveTier === 'lite' ? LiteStepper : effectiveTier === 'premium' ? PremiumStepper : Stepper

  const reactCode = useMemo(
    () => generateReactCode(tier, activeStep, orientation, variant, size, clickable, motion),
    [tier, activeStep, orientation, variant, size, clickable, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, activeStep, orientation, variant, size),
    [tier, activeStep, orientation, variant, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, activeStep, orientation, variant, size, clickable),
    [tier, activeStep, orientation, variant, size, clickable],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, activeStep, orientation, variant, size),
    [tier, activeStep, orientation, variant, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, activeStep, orientation, variant, size, clickable),
    [tier, activeStep, orientation, variant, size, clickable],
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
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const previewProps: Record<string, unknown> = {
    steps: STEPS,
    activeStep,
    orientation,
    variant,
    size,
  }
  if (clickable) previewProps.onStepClick = setActiveStep
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="stepper-page__section" id="playground">
      <h2 className="stepper-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="stepper-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="stepper-page__playground">
        {/* Preview area */}
        <div className="stepper-page__playground-preview">
          <div className="stepper-page__playground-result">
            <StepperComponent {...previewProps} />
          </div>

          <div className="stepper-page__nav-row">
            <Button size="sm" variant="secondary" disabled={activeStep === 0} onClick={() => setActiveStep(a => Math.max(0, a - 1))}>
              <Icon name="chevron-left" size="sm" /> Back
            </Button>
            <Button size="sm" disabled={activeStep === STEPS.length - 1} onClick={() => setActiveStep(a => Math.min(STEPS.length - 1, a + 1))}>
              Next <Icon name="chevron-right" size="sm" />
            </Button>
          </div>

          {/* Tabbed code output */}
          <div className="stepper-page__code-tabs">
            <div className="stepper-page__export-row">
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
              {copyStatus && <span className="stepper-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel */}
        <div className="stepper-page__playground-controls">
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="stepper-page__control-group">
            <span className="stepper-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Clickable steps" checked={clickable} onChange={setClickable} />
            </div>
          </div>

          <div className="stepper-page__control-group">
            <span className="stepper-page__control-label">Active Step</span>
            <div className="stepper-page__control-options">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`stepper-page__option-btn${i === activeStep ? ' stepper-page__option-btn--active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StepperPage() {
  useStyles('stepper-page', pageStyles)
  const { tier, setTier } = useTier()

  const [active, setActive] = useState(1)
  const [brandColor, setBrandColor] = useState('#6366f1')

  const isLite = tier === 'lite'
  const effectiveTier = tier

  useEffect(() => {
    const sections = document.querySelectorAll('.stepper-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  const StepperComponent = effectiveTier === 'lite' ? LiteStepper : effectiveTier === 'premium' ? PremiumStepper : Stepper

  return (
    <div className="stepper-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="stepper-page__hero">
        <h1 className="stepper-page__title">Stepper</h1>
        <p className="stepper-page__desc">
          Multi-step progress indicator with numbered, dot, and progress bar variants.
          Supports horizontal and vertical orientation with clickable navigation.
        </p>
        <div className="stepper-page__import-row">
          <code className="stepper-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 1. Interactive Stepper ─────────────────── */}
      <section className="stepper-page__section" id="interactive">
        <h2 className="stepper-page__section-title"><a href="#interactive">Interactive Stepper</a></h2>
        <p className="stepper-page__section-desc">
          Click Next/Back to navigate between steps. Completed steps show a checkmark.
        </p>
        <div className="stepper-page__preview stepper-page__preview--col">
          <StepperComponent steps={STEPS} activeStep={active} onStepClick={setActive} />
          <div className="stepper-page__nav-row">
            <Button size="sm" variant="secondary" disabled={active === 0} onClick={() => setActive(a => Math.max(0, a - 1))}>
              <Icon name="chevron-left" size="sm" /> Back
            </Button>
            <Button size="sm" disabled={active === STEPS.length - 1} onClick={() => setActive(a => Math.min(STEPS.length - 1, a + 1))}>
              Next <Icon name="chevron-right" size="sm" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. Live Playground ─────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Variants ───────────────────────────── */}
      <section className="stepper-page__section" id="variants">
        <h2 className="stepper-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="stepper-page__section-desc">
          Numbered shows step numbers, dots shows minimal indicators, and progress shows a connecting bar.
        </p>
        <div className="stepper-page__preview stepper-page__preview--col" style={{ gap: '2.5rem' }}>
          {(['default', 'dots', 'progress'] as const).map(v => (
            <div key={v}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem', fontFamily: 'monospace' }}>{v}</p>
              <StepperComponent steps={STEPS} activeStep={2} variant={v} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Sizes ──────────────────────────────── */}
      <section className="stepper-page__section" id="sizes">
        <h2 className="stepper-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="stepper-page__section-desc">
          Three sizes to fit different layout contexts.
        </p>
        <div className="stepper-page__preview stepper-page__preview--col" style={{ gap: '2.5rem' }}>
          {(['sm', 'md', 'lg'] as const).map(s => (
            <div key={s}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem', fontFamily: 'monospace' }}>{s}</p>
              <StepperComponent steps={STEPS} activeStep={2} size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Vertical ───────────────────────────── */}
      <section className="stepper-page__section" id="vertical">
        <h2 className="stepper-page__section-title"><a href="#vertical">Vertical Orientation</a></h2>
        <p className="stepper-page__section-desc">
          Use vertical orientation for sidebar layouts or when steps need more description space.
        </p>
        <div className="stepper-page__preview">
          <StepperComponent steps={STEPS} activeStep={2} orientation="vertical" />
        </div>
      </section>

      {/* ── 6. Weight Tiers ───────────────────────── */}
      <section className="stepper-page__section" id="tiers">
        <h2 className="stepper-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="stepper-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion props).
        </p>

        <div className="stepper-page__tiers">
          {/* Lite */}
          <div
            className={`stepper-page__tier-card${tier === 'lite' ? ' stepper-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="stepper-page__tier-header">
              <span className="stepper-page__tier-name">Lite</span>
              <span className="stepper-page__tier-size">~0.3 KB</span>
            </div>
            <p className="stepper-page__tier-desc">
              Zero-motion wrapper. Same API minus motion prop. Minimal footprint.
            </p>
            <div className="stepper-page__tier-import">
              import {'{'} Stepper {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="stepper-page__tier-preview">
              <LiteStepper steps={STEPS.slice(0, 3)} activeStep={1} size="sm" />
            </div>
            <div className="stepper-page__size-breakdown">
              <div className="stepper-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`stepper-page__tier-card${tier === 'standard' ? ' stepper-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="stepper-page__tier-header">
              <span className="stepper-page__tier-name">Standard</span>
              <span className="stepper-page__tier-size">~2 KB</span>
            </div>
            <p className="stepper-page__tier-desc">
              Full-featured stepper with motion levels, clickable steps, and accessibility.
            </p>
            <div className="stepper-page__tier-import">
              import {'{'} Stepper {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="stepper-page__tier-preview">
              <Stepper steps={STEPS.slice(0, 3)} activeStep={1} size="sm" />
            </div>
            <div className="stepper-page__size-breakdown">
              <div className="stepper-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`stepper-page__tier-card${tier === 'premium' ? ' stepper-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="stepper-page__tier-header">
              <span className="stepper-page__tier-name">Premium</span>
              <span className="stepper-page__tier-size">~3 KB</span>
            </div>
            <p className="stepper-page__tier-desc">
              Aurora glow on active indicators, staggered entrance, connector shimmer, and spring hover.
            </p>
            <div className="stepper-page__tier-import">
              import {'{'} Stepper {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="stepper-page__tier-preview">
              <PremiumStepper steps={STEPS.slice(0, 3)} activeStep={1} size="sm" />
            </div>
            <div className="stepper-page__size-breakdown">
              <div className="stepper-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ────────────────────────── */}
      <section className="stepper-page__section" id="brand-color">
        <h2 className="stepper-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="stepper-page__section-desc">
          Pick a brand color to see the stepper update in real-time. The theme generates
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
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 8. Props API ──────────────────────────── */}
      <section className="stepper-page__section" id="props">
        <h2 className="stepper-page__section-title"><a href="#props">Props API</a></h2>
        <p className="stepper-page__section-desc">
          All props accepted by the Stepper component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
        <h3 className="stepper-page__section-title" style={{ fontSize: 'var(--text-base)', marginBlockStart: '1.5rem' }}>StepperStep</h3>
        <p className="stepper-page__section-desc">Shape of each item in the <code>steps</code> array.</p>
        <Card variant="default" padding="md">
          <PropsTable props={stepperStepProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────── */}
      <section className="stepper-page__section" id="accessibility">
        <h2 className="stepper-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="stepper-page__section-desc">
          Built with semantic HTML and comprehensive ARIA support for assistive technologies.
        </p>
        <Card variant="default" padding="md">
          <ul className="stepper-page__a11y-list">
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="stepper-page__a11y-key">role="list"</code> with
                each step as <code className="stepper-page__a11y-key">role="listitem"</code> for proper semantic structure.
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Current step:</strong> Active step is announced with <code className="stepper-page__a11y-key">aria-current="step"</code>.
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Clickable steps are focusable and activate on
                <code className="stepper-page__a11y-key">Enter</code> and <code className="stepper-page__a11y-key">Space</code>.
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="stepper-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All states meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="stepper-page__a11y-key">prefers-reduced-motion</code>; all animations are disabled at motion level 0.
              </span>
            </li>
            <li className="stepper-page__a11y-item">
              <span className="stepper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="stepper-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ─────────────────────────────── */}
      <section className="stepper-page__section" id="source">
        <h2 className="stepper-page__section-title"><a href="#source">Source</a></h2>
        <p className="stepper-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="stepper-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/stepper.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/stepper.tsx (Standard)
          </a>
          <a className="stepper-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/stepper.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/stepper.tsx (Lite)
          </a>
          <a className="stepper-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/stepper.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/stepper.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
