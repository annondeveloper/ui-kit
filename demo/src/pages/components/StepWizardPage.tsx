'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { StepWizard } from '@ui/domain/step-wizard'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.step-wizard-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: step-wizard-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .step-wizard-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .step-wizard-page__hero::before {
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
        .step-wizard-page__hero::before { animation: none; }
      }

      .step-wizard-page__title {
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

      .step-wizard-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .step-wizard-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .step-wizard-page__import-code {
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

      .step-wizard-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .step-wizard-page__section {
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
        .step-wizard-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .step-wizard-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .step-wizard-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .step-wizard-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .step-wizard-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .step-wizard-page__preview {
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

      .step-wizard-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .step-wizard-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .step-wizard-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container step-wizard-page (max-width: 680px) {
        .step-wizard-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .step-wizard-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .step-wizard-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .step-wizard-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .step-wizard-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .step-wizard-page__playground-controls {
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

      .step-wizard-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .step-wizard-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .step-wizard-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .step-wizard-page__option-btn {
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
      .step-wizard-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .step-wizard-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .step-wizard-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Step content area ──────────────────────────── */

      .step-wizard-page__step-content {
        padding: 1.5rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        position: relative;
      }

      .step-wizard-page__step-content h3 {
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
      }

      .step-wizard-page__step-content p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .step-wizard-page__nav-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        margin-block-start: 1rem;
        position: relative;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .step-wizard-page__code-tabs {
        margin-block-start: 1rem;
      }

      .step-wizard-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .step-wizard-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .step-wizard-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .step-wizard-page__tier-card {
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

      .step-wizard-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .step-wizard-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .step-wizard-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .step-wizard-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .step-wizard-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .step-wizard-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .step-wizard-page__tier-import {
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

      .step-wizard-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .step-wizard-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .step-wizard-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .step-wizard-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .step-wizard-page__a11y-key {
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
        .step-wizard-page__hero {
          padding: 2rem 1.25rem;
        }
        .step-wizard-page__title {
          font-size: 1.75rem;
        }
        .step-wizard-page__preview {
          padding: 1.75rem;
        }
        .step-wizard-page__playground {
          grid-template-columns: 1fr;
        }
        .step-wizard-page__tiers {
          grid-template-columns: 1fr;
        }
        .step-wizard-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .step-wizard-page__hero {
          padding: 1.5rem 1rem;
        }
        .step-wizard-page__title {
          font-size: 1.5rem;
        }
        .step-wizard-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .step-wizard-page__title {
          font-size: 4rem;
        }
        .step-wizard-page__preview {
          padding: 3.5rem;
        }
      }

      .step-wizard-page__import-code,
      .step-wizard-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const stepWizardProps: PropDef[] = [
  { name: 'steps', type: 'Step[]', required: true, description: 'Array of step definitions with id, label, optional description, icon, and validate function.' },
  { name: 'activeStep', type: 'number', description: 'Controlled active step index. When provided, component is fully controlled.' },
  { name: 'defaultStep', type: 'number', default: '0', description: 'Initial step index for uncontrolled mode.' },
  { name: 'onChange', type: '(step: number) => void', description: 'Callback fired when the active step changes.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of step indicators.' },
  { name: 'allowSkip', type: 'boolean', default: 'false', description: 'When true, allows clicking any step regardless of completion status.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Step content panels. Rendered by index matching activeStep.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Content slides in at motion level 2+.' },
]

const stepDefProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the step.' },
  { name: 'label', type: 'string', required: true, description: 'Display label shown next to the step indicator.' },
  { name: 'description', type: 'string', description: 'Optional secondary text below the label.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon for the step indicator. Overrides the default number.' },
  { name: 'validate', type: '() => boolean | Promise<boolean>', description: 'Validation function called before advancing. Blocks navigation if it returns false.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Orientation = 'horizontal' | 'vertical'

const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { StepWizard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { StepWizard } from '@annondeveloper/ui-kit'",
  premium: "import { StepWizard } from '@annondeveloper/ui-kit/premium'",
}

const DEMO_STEPS = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'preferences', label: 'Preferences', description: 'Configure settings' },
  { id: 'review', label: 'Review', description: 'Confirm details' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="step-wizard-page__copy-btn"
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
    <div className="step-wizard-page__control-group">
      <span className="step-wizard-page__control-label">{label}</span>
      <div className="step-wizard-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`step-wizard-page__option-btn${opt === value ? ' step-wizard-page__option-btn--active' : ''}`}
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
    <label className="step-wizard-page__toggle-label">
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
  orientation: Orientation,
  allowSkip: boolean,
  motion: number,
  stepCount: number,
): string {
  if (tier === 'lite') {
    return `import { StepWizard } from '@annondeveloper/ui-kit/lite'

const steps = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'review', label: 'Review' },
]

<StepWizard steps={steps} activeStep={currentStep}>
  {/* Step content rendered by index */}
  <div>Account form...</div>
  <div>Profile form...</div>
  <div>Review summary...</div>
</StepWizard>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  steps={steps}']
  props.push('  activeStep={currentStep}')
  props.push('  onChange={setCurrentStep}')
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (allowSkip) props.push('  allowSkip')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

const steps = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'review', label: 'Review', description: 'Confirm details' },
]

const [currentStep, setCurrentStep] = useState(0)

<StepWizard
${props.join('\n')}
>
  <div>Account form content...</div>
  <div>Profile form content...</div>
  <div>Review summary content...</div>
</StepWizard>`
}

function generateHtmlCode(orientation: Orientation): string {
  return `<!-- StepWizard — CSS-only approach -->
<div class="ui-lite-step-wizard" data-orientation="${orientation}">
  <div class="ui-lite-step-wizard__steps" role="list">
    <div class="ui-lite-step-wizard__step" data-state="complete" role="listitem">
      <span class="ui-lite-step-wizard__number">&#10003;</span>
      <span class="ui-lite-step-wizard__label">Account</span>
    </div>
    <div class="ui-lite-step-wizard__step" data-state="active" role="listitem">
      <span class="ui-lite-step-wizard__number">2</span>
      <span class="ui-lite-step-wizard__label">Profile</span>
    </div>
    <div class="ui-lite-step-wizard__step" data-state="pending" role="listitem">
      <span class="ui-lite-step-wizard__number">3</span>
      <span class="ui-lite-step-wizard__label">Review</span>
    </div>
  </div>
  <div class="ui-lite-step-wizard__content">
    <!-- Active step content here -->
  </div>
</div>`
}

function generateVueCode(tier: Tier, orientation: Orientation, allowSkip: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-step-wizard">
    <div class="ui-lite-step-wizard__steps" role="list">
      <div v-for="(step, i) in steps" :key="step.id"
        class="ui-lite-step-wizard__step"
        :data-state="i < current ? 'complete' : i === current ? 'active' : 'pending'"
        role="listitem">
        <span class="ui-lite-step-wizard__number">{{ i < current ? '\\u2713' : i + 1 }}</span>
        <span class="ui-lite-step-wizard__label">{{ step.label }}</span>
      </div>
    </div>
    <div class="ui-lite-step-wizard__content">
      <slot />
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <StepWizard
    :steps="steps"
    :activeStep="currentStep"
    @change="currentStep = $event"
    orientation="${orientation}"${allowSkip ? '\n    allowSkip' : ''}
  >
    <div>Account form...</div>
    <div>Profile form...</div>
    <div>Review summary...</div>
  </StepWizard>
</template>

<script setup>
import { ref } from 'vue'
import { StepWizard } from '${importPath}'

const currentStep = ref(0)
const steps = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'review', label: 'Review' },
]
</script>`
}

function generateAngularCode(tier: Tier, orientation: Orientation): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-step-wizard">
  <div class="ui-lite-step-wizard__steps" role="list">
    <div *ngFor="let step of steps; let i = index"
      class="ui-lite-step-wizard__step"
      [attr.data-state]="i < current ? 'complete' : i === current ? 'active' : 'pending'"
      role="listitem">
      <span class="ui-lite-step-wizard__number">{{ i < current ? '\\u2713' : i + 1 }}</span>
      <span class="ui-lite-step-wizard__label">{{ step.label }}</span>
    </div>
  </div>
  <div class="ui-lite-step-wizard__content">
    <ng-content></ng-content>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-step-wizard" data-orientation="${orientation}">
  <ol class="ui-step-wizard__steps" role="list">
    <li *ngFor="let step of steps; let i = index"
      class="ui-step-wizard__step"
      [attr.aria-current]="i === current ? 'step' : null"
      role="listitem">
      <button class="ui-step-wizard__step-button">
        <span class="ui-step-wizard__indicator"
          [attr.data-state]="i < current ? 'completed' : i === current ? 'active' : 'upcoming'">
          {{ i < current ? '\\u2713' : i + 1 }}
        </span>
        <span class="ui-step-wizard__label">
          <span class="ui-step-wizard__label-text">{{ step.label }}</span>
        </span>
      </button>
    </li>
  </ol>
</div>

@import '@annondeveloper/ui-kit/css/components/step-wizard.css';`
}

function generateSvelteCode(tier: Tier, orientation: Orientation, allowSkip: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-step-wizard">
  <div class="ui-lite-step-wizard__steps" role="list">
    {#each steps as step, i}
      <div class="ui-lite-step-wizard__step"
        data-state={i < current ? 'complete' : i === current ? 'active' : 'pending'}
        role="listitem">
        <span class="ui-lite-step-wizard__number">{i < current ? '\\u2713' : i + 1}</span>
        <span class="ui-lite-step-wizard__label">{step.label}</span>
      </div>
    {/each}
  </div>
  <div class="ui-lite-step-wizard__content">
    <slot />
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { StepWizard } from '${importPath}';

  let currentStep = 0;
  const steps = [
    { id: 'account', label: 'Account', description: 'Create your account' },
    { id: 'profile', label: 'Profile', description: 'Set up your profile' },
    { id: 'review', label: 'Review', description: 'Confirm details' },
  ];
</script>

<StepWizard
  steps={steps}
  activeStep={currentStep}
  on:change={(e) => currentStep = e.detail}
  orientation="${orientation}"${allowSkip ? '\n  allowSkip' : ''}
>
  <div>Account form...</div>
  <div>Profile form...</div>
  <div>Review summary...</div>
</StepWizard>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [allowSkip, setAllowSkip] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [currentStep, setCurrentStep] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, orientation, allowSkip, motion, DEMO_STEPS.length),
    [tier, orientation, allowSkip, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(orientation), [orientation])
  const vueCode = useMemo(() => generateVueCode(tier, orientation, allowSkip), [tier, orientation, allowSkip])
  const angularCode = useMemo(() => generateAngularCode(tier, orientation), [tier, orientation])
  const svelteCode = useMemo(() => generateSvelteCode(tier, orientation, allowSkip), [tier, orientation, allowSkip])

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

  return (
    <section className="step-wizard-page__section" id="playground">
      <h2 className="step-wizard-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="step-wizard-page__section-desc">
        Interact with the wizard and tweak every prop. The generated code updates as you change settings.
      </p>

      <div className="step-wizard-page__playground">
        <div className="step-wizard-page__playground-preview">
          <div className="step-wizard-page__playground-result">
            <StepWizard
              steps={DEMO_STEPS}
              activeStep={currentStep}
              onChange={setCurrentStep}
              orientation={orientation}
              allowSkip={allowSkip}
              motion={motion}
            >
              <div className="step-wizard-page__step-content">
                <h3>Create Account</h3>
                <p>Enter your email address and choose a password to get started.</p>
              </div>
              <div className="step-wizard-page__step-content">
                <h3>Set Up Profile</h3>
                <p>Add your name, avatar, and bio to personalize your experience.</p>
              </div>
              <div className="step-wizard-page__step-content">
                <h3>Configure Preferences</h3>
                <p>Choose your notification settings, theme, and language preferences.</p>
              </div>
              <div className="step-wizard-page__step-content">
                <h3>Review &amp; Confirm</h3>
                <p>Double-check your details before completing the setup process.</p>
              </div>
            </StepWizard>

            <div className="step-wizard-page__nav-row">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(Math.min(DEMO_STEPS.length - 1, currentStep + 1))}
                disabled={currentStep === DEMO_STEPS.length - 1}
              >
                {currentStep === DEMO_STEPS.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>

          <div className="step-wizard-page__code-tabs">
            <div className="step-wizard-page__export-row">
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
              {copyStatus && <span className="step-wizard-page__export-status">{copyStatus}</span>}
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

        <div className="step-wizard-page__playground-controls">
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="step-wizard-page__control-group">
            <span className="step-wizard-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Allow skip" checked={allowSkip} onChange={setAllowSkip} />
            </div>
          </div>

          <div className="step-wizard-page__control-group">
            <span className="step-wizard-page__control-label">Jump to step</span>
            <div className="step-wizard-page__control-options">
              {DEMO_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`step-wizard-page__option-btn${i === currentStep ? ' step-wizard-page__option-btn--active' : ''}`}
                  onClick={() => setCurrentStep(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StepWizardPage() {
  useStyles('step-wizard-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.step-wizard-page__section')
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
    <div className="step-wizard-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="step-wizard-page__hero">
        <h1 className="step-wizard-page__title">StepWizard</h1>
        <p className="step-wizard-page__desc">
          Multi-step workflow component with numbered indicators, connector lines, horizontal/vertical
          orientation, step validation, and animated content transitions.
        </p>
        <div className="step-wizard-page__import-row">
          <code className="step-wizard-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Orientations ──────────────────────────────── */}
      <section className="step-wizard-page__section" id="orientations">
        <h2 className="step-wizard-page__section-title">
          <a href="#orientations">Orientations</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          The wizard supports horizontal (default) and vertical layouts. Vertical orientation is ideal
          for narrow containers or side panels.
        </p>
        <div className="step-wizard-page__preview step-wizard-page__preview--col">
          <HorizontalDemo />
          <div style={{ marginBlockStart: '1.5rem' }}>
            <VerticalDemo />
          </div>
        </div>
      </section>

      {/* ── 4. Step Validation ───────────────────────────── */}
      <section className="step-wizard-page__section" id="validation">
        <h2 className="step-wizard-page__section-title">
          <a href="#validation">Step Validation</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          Each step can have a validate function that runs before allowing navigation forward.
          Async validation (API calls) is also supported.
        </p>
        <div className="step-wizard-page__preview step-wizard-page__preview--col">
          <ValidationDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const steps = [
  {
    id: 'email',
    label: 'Email',
    validate: () => {
      return emailInput.value.includes('@')
    }
  },
  {
    id: 'verify',
    label: 'Verify',
    validate: async () => {
      const result = await verifyCode(codeInput.value)
      return result.valid
    }
  },
  { id: 'done', label: 'Done' },
]`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Allow Skip ────────────────────────────────── */}
      <section className="step-wizard-page__section" id="allow-skip">
        <h2 className="step-wizard-page__section-title">
          <a href="#allow-skip">Allow Skip</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          When allowSkip is enabled, users can click any step indicator to jump directly to it,
          regardless of completion status.
        </p>
        <div className="step-wizard-page__preview step-wizard-page__preview--col">
          <SkipDemo />
        </div>
      </section>

      {/* ── 6. Custom Icons ──────────────────────────────── */}
      <section className="step-wizard-page__section" id="custom-icons">
        <h2 className="step-wizard-page__section-title">
          <a href="#custom-icons">Custom Step Icons</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          Replace the default step numbers with custom icons for a more visual experience.
        </p>
        <div className="step-wizard-page__preview step-wizard-page__preview--col">
          <IconDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const steps = [
  { id: 'cart', label: 'Cart', icon: <Icon name="shopping-cart" size="sm" /> },
  { id: 'shipping', label: 'Shipping', icon: <Icon name="truck" size="sm" /> },
  { id: 'payment', label: 'Payment', icon: <Icon name="credit-card" size="sm" /> },
  { id: 'confirm', label: 'Confirm', icon: <Icon name="check" size="sm" /> },
]`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="step-wizard-page__section" id="tiers">
        <h2 className="step-wizard-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          Choose the right balance of features and bundle size. Lite is CSS-only with static steps,
          Standard adds validation and motion, Premium adds spring animations.
        </p>

        <div className="step-wizard-page__tiers">
          {/* Lite */}
          <div
            className={`step-wizard-page__tier-card${tier === 'lite' ? ' step-wizard-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="step-wizard-page__tier-header">
              <span className="step-wizard-page__tier-name">Lite</span>
              <span className="step-wizard-page__tier-size">~0.3 KB</span>
            </div>
            <p className="step-wizard-page__tier-desc">
              CSS-only step indicator with static state. No validation, no motion,
              no controlled step management. Ideal for static progress displays.
            </p>
            <div className="step-wizard-page__tier-import">
              import {'{'} StepWizard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="step-wizard-page__tier-preview">
              <Button size="sm" variant="secondary" onClick={() => setTier('lite')}>Select Lite</Button>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`step-wizard-page__tier-card${tier === 'standard' ? ' step-wizard-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="step-wizard-page__tier-header">
              <span className="step-wizard-page__tier-name">Standard</span>
              <span className="step-wizard-page__tier-size">~3.2 KB</span>
            </div>
            <p className="step-wizard-page__tier-desc">
              Full wizard with controlled/uncontrolled modes, async validation, keyboard navigation,
              connector lines, content transitions, and accessibility.
            </p>
            <div className="step-wizard-page__tier-import">
              import {'{'} StepWizard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="step-wizard-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('standard')}>Select Standard</Button>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`step-wizard-page__tier-card${tier === 'premium' ? ' step-wizard-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="step-wizard-page__tier-header">
              <span className="step-wizard-page__tier-name">Premium</span>
              <span className="step-wizard-page__tier-size">~4.5 KB</span>
            </div>
            <p className="step-wizard-page__tier-desc">
              Everything in Standard plus spring-animated step transitions,
              progress indicator glow, completion confetti effect, and stagger animations.
            </p>
            <div className="step-wizard-page__tier-import">
              import {'{'} StepWizard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="step-wizard-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('premium')}>Select Premium</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. StepWizard Props API ──────────────────────── */}
      <section className="step-wizard-page__section" id="props">
        <h2 className="step-wizard-page__section-title">
          <a href="#props">StepWizard Props</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          All props accepted by StepWizard. It also spreads any native div HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={stepWizardProps} />
        </Card>
      </section>

      {/* ── 9. Step Definition ───────────────────────────── */}
      <section className="step-wizard-page__section" id="step-def">
        <h2 className="step-wizard-page__section-title">
          <a href="#step-def">Step Definition</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          Each step in the steps array accepts these properties.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={stepDefProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="step-wizard-page__section" id="accessibility">
        <h2 className="step-wizard-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="step-wizard-page__section-desc">
          Built with semantic HTML and ARIA attributes for full screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="step-wizard-page__a11y-list">
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic list:</strong> Steps are rendered as an <code className="step-wizard-page__a11y-key">{'<ol>'}</code> with <code className="step-wizard-page__a11y-key">role="list"</code> for correct reading order.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Current step:</strong> Active step uses <code className="step-wizard-page__a11y-key">aria-current="step"</code> for screen reader announcements.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Step buttons show a brand-colored focus ring via <code className="step-wizard-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tab management:</strong> Only clickable steps (completed or skip-enabled) receive <code className="step-wizard-page__a11y-key">tabIndex=0</code>.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Step buttons enforce 44px minimum on touch devices.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="step-wizard-page__a11y-key">prefers-reduced-motion</code> and motion level 0 disables all transitions.
              </span>
            </li>
            <li className="step-wizard-page__a11y-item">
              <span className="step-wizard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="step-wizard-page__a11y-key">forced-colors: active</code> with visible Highlight colors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Demo Sub-components ─────────────────────────────────────────────────────

function HorizontalDemo() {
  const [step, setStep] = useState(1)
  return (
    <div>
      <StepWizard
        steps={[
          { id: 'h1', label: 'Details' },
          { id: 'h2', label: 'Payment' },
          { id: 'h3', label: 'Confirm' },
        ]}
        activeStep={step}
        onChange={setStep}
        orientation="horizontal"
      >
        <div className="step-wizard-page__step-content"><p>Enter your details.</p></div>
        <div className="step-wizard-page__step-content"><p>Add payment method.</p></div>
        <div className="step-wizard-page__step-content"><p>Confirm and submit.</p></div>
      </StepWizard>
      <div className="step-wizard-page__nav-row">
        <Button size="xs" variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Horizontal</span>
        <Button size="xs" variant="primary" disabled={step === 2} onClick={() => setStep(step + 1)}>Next</Button>
      </div>
    </div>
  )
}

function VerticalDemo() {
  const [step, setStep] = useState(0)
  return (
    <div>
      <StepWizard
        steps={[
          { id: 'v1', label: 'Upload', description: 'Select files' },
          { id: 'v2', label: 'Configure', description: 'Set options' },
          { id: 'v3', label: 'Process', description: 'Run transformation' },
        ]}
        activeStep={step}
        onChange={setStep}
        orientation="vertical"
      >
        <div className="step-wizard-page__step-content"><p>Drag and drop your files here.</p></div>
        <div className="step-wizard-page__step-content"><p>Choose output format and quality.</p></div>
        <div className="step-wizard-page__step-content"><p>Processing will begin automatically.</p></div>
      </StepWizard>
      <div className="step-wizard-page__nav-row">
        <Button size="xs" variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Vertical</span>
        <Button size="xs" variant="primary" disabled={step === 2} onClick={() => setStep(step + 1)}>Next</Button>
      </div>
    </div>
  )
}

function ValidationDemo() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')

  const steps = useMemo(() => [
    {
      id: 'val-email',
      label: 'Email',
      description: 'Must contain @',
      validate: () => email.includes('@'),
    },
    { id: 'val-confirm', label: 'Confirm' },
  ], [email])

  return (
    <div>
      <StepWizard steps={steps} activeStep={step} onChange={setStep}>
        <div className="step-wizard-page__step-content">
          <h3>Enter Email</h3>
          <p style={{ marginBlockEnd: '0.75rem' }}>Type an email with @ to enable the Next button validation.</p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: 'var(--text-sm)',
              inlineSize: '100%',
              maxInlineSize: '300px',
            }}
          />
        </div>
        <div className="step-wizard-page__step-content">
          <h3>Confirmed!</h3>
          <p>Email validation passed. You entered: {email}</p>
        </div>
      </StepWizard>
      <div className="step-wizard-page__nav-row">
        <Button size="xs" variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button size="xs" variant="primary" disabled={step === 1} onClick={() => {
          if (email.includes('@')) setStep(1)
        }}>Next</Button>
      </div>
    </div>
  )
}

function SkipDemo() {
  const [step, setStep] = useState(0)
  return (
    <div>
      <StepWizard
        steps={[
          { id: 'sk1', label: 'Step 1' },
          { id: 'sk2', label: 'Step 2' },
          { id: 'sk3', label: 'Step 3' },
          { id: 'sk4', label: 'Step 4' },
        ]}
        activeStep={step}
        onChange={setStep}
        allowSkip
      >
        <div className="step-wizard-page__step-content"><p>Click any step indicator above to jump directly to it.</p></div>
        <div className="step-wizard-page__step-content"><p>You jumped to step 2! Skip works in any direction.</p></div>
        <div className="step-wizard-page__step-content"><p>Step 3 content. No validation required with allowSkip.</p></div>
        <div className="step-wizard-page__step-content"><p>Final step. You can navigate freely between all steps.</p></div>
      </StepWizard>
    </div>
  )
}

function IconDemo() {
  const [step, setStep] = useState(0)
  return (
    <div>
      <StepWizard
        steps={[
          { id: 'ic1', label: 'Cart', icon: <Icon name="shopping-cart" size="sm" /> },
          { id: 'ic2', label: 'Shipping', icon: <Icon name="truck" size="sm" /> },
          { id: 'ic3', label: 'Payment', icon: <Icon name="credit-card" size="sm" /> },
        ]}
        activeStep={step}
        onChange={setStep}
        allowSkip
      >
        <div className="step-wizard-page__step-content"><p>Review items in your cart.</p></div>
        <div className="step-wizard-page__step-content"><p>Choose shipping method and address.</p></div>
        <div className="step-wizard-page__step-content"><p>Enter payment details to complete purchase.</p></div>
      </StepWizard>
      <div className="step-wizard-page__nav-row">
        <Button size="xs" variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button size="xs" variant="primary" disabled={step === 2} onClick={() => setStep(step + 1)}>Next</Button>
      </div>
    </div>
  )
}
