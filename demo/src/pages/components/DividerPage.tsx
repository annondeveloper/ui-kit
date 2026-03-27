'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Divider } from '@ui/components/divider'
import { Divider as LiteDivider } from '@ui/lite/divider'
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
    @scope (.divider-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: divider-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .divider-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .divider-page__hero::before {
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
        animation: divider-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes divider-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .divider-page__hero::before { animation: none; }
      }

      .divider-page__title {
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

      .divider-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .divider-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .divider-page__import-code {
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

      .divider-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .divider-page__section {
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
        animation: divider-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes divider-section-reveal {
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
        .divider-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .divider-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .divider-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .divider-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .divider-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .divider-page__preview {
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

      .divider-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .divider-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .divider-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .divider-page__playground {
          grid-template-columns: 1fr;
        }
        .divider-page__playground-controls {
          position: static !important;
        }
      }

      @container divider-page (max-width: 680px) {
        .divider-page__playground {
          grid-template-columns: 1fr;
        }
        .divider-page__playground-controls {
          position: static !important;
        }
      }

      .divider-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .divider-page__playground-result {
        min-block-size: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .divider-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .divider-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .divider-page__playground-controls {
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

      .divider-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .divider-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .divider-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .divider-page__option-btn {
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
      .divider-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .divider-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .divider-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .divider-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .divider-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .divider-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .divider-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .divider-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Vertical demo ──────────────────────────────── */

      .divider-page__vertical-demo {
        display: flex;
        align-items: center;
        gap: 1rem;
        block-size: 60px;
        padding: 0 1rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .divider-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .divider-page__tier-card {
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

      .divider-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .divider-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .divider-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .divider-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .divider-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .divider-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .divider-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .divider-page__tier-import {
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

      .divider-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .divider-page__code-tabs {
        margin-block-start: 1rem;
      }

      .divider-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .divider-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .divider-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .divider-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .divider-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .divider-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ──────────────────────────────── */

      .divider-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .divider-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .divider-page__hero {
          padding: 2rem 1.25rem;
        }

        .divider-page__title {
          font-size: 1.75rem;
        }

        .divider-page__preview {
          padding: 1.75rem;
        }

        .divider-page__playground {
          grid-template-columns: 1fr;
        }

        .divider-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .divider-page__labeled-row {
          gap: 1rem;
        }

        .divider-page__tiers {
          grid-template-columns: 1fr;
        }

        .divider-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .divider-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .divider-page__hero {
          padding: 1.5rem 1rem;
        }

        .divider-page__title {
          font-size: 1.5rem;
        }

        .divider-page__preview {
          padding: 1rem;
        }

        .divider-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .divider-page__title {
          font-size: 4rem;
        }

        .divider-page__preview {
          padding: 3.5rem;
        }

        .divider-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .divider-page__import-code,
      .divider-page code,
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

const dividerProps: PropDef[] = [
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the divider line.' },
  { name: 'variant', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Line style variant.' },
  { name: 'label', type: 'ReactNode', description: 'Optional text label rendered centered on the divider. Renders a div with role="separator" instead of hr.' },
  { name: 'spacing', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Margin spacing above and below (or left/right for vertical).' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLHRElement>', description: 'Forwarded ref to the underlying <hr> or <div> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Orientation = 'horizontal' | 'vertical'
type DivVariant = 'solid' | 'dashed' | 'dotted'
type Spacing = 'sm' | 'md' | 'lg'

const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']
const DIV_VARIANTS: DivVariant[] = ['solid', 'dashed', 'dotted']
const SPACINGS: Spacing[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Divider } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Divider } from '@annondeveloper/ui-kit'",
  premium: "import { Divider } from '@annondeveloper/ui-kit'",
}

const P = 'divider-page__'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className={`${P}copy-btn`}
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
    <div className={`${P}control-group`}>
      <span className={`${P}control-label`}>{label}</span>
      <div className={`${P}control-options`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${P}option-btn${opt === value ? ` ${P}option-btn--active` : ''}`}
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
    <label className={`${P}toggle-label`}>
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
  variant: DivVariant,
  spacing: Spacing,
  labelText: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}\n\n<Divider />`
  }

  const props: string[] = []
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (variant !== 'solid') props.push(`  variant="${variant}"`)
  if (spacing !== 'md') props.push(`  spacing="${spacing}"`)
  if (labelText) props.push(`  label="${labelText}"`)

  const jsx = props.length === 0
    ? '<Divider />'
    : `<Divider\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, orientation: Orientation, variant: DivVariant, labelText: string): string {
  if (tier === 'lite') {
    return `<!-- Divider — @annondeveloper/ui-kit lite tier -->
<hr class="ui-lite-divider" />`
  }

  if (labelText) {
    return `<!-- Divider with label — @annondeveloper/ui-kit ${tier} tier -->
<div
  class="ui-divider"
  role="separator"
  data-orientation="${orientation}"
  data-variant="${variant}"
  data-has-label="true"
>
  <span class="ui-divider__label">${labelText}</span>
</div>`
  }

  return `<!-- Divider — @annondeveloper/ui-kit ${tier} tier -->
<hr
  class="ui-divider"
  role="separator"
  data-orientation="${orientation}"
  data-variant="${variant}"
/>`
}

function generateVueCode(tier: Tier, orientation: Orientation, variant: DivVariant, spacing: Spacing, labelText: string): string {
  if (tier === 'lite') {
    return `<template>
  <hr class="ui-lite-divider" />
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (variant !== 'solid') props.push(`  variant="${variant}"`)
  if (spacing !== 'md') props.push(`  spacing="${spacing}"`)
  if (labelText) props.push(`  label="${labelText}"`)

  return `<template>
  <Divider${props.length ? '\n' + props.join('\n') + '\n  ' : ' '}/>
</template>

<script setup>
import { Divider } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, orientation: Orientation, variant: DivVariant, labelText: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<hr class="ui-lite-divider" />

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  if (labelText) {
    return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-divider"
  role="separator"
  data-orientation="${orientation}"
  data-variant="${variant}"
  data-has-label="true"
>
  <span class="ui-divider__label">${labelText}</span>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/divider.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<hr
  class="ui-divider"
  role="separator"
  data-orientation="${orientation}"
  data-variant="${variant}"
/>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/divider.css';`
}

function generateSvelteCode(tier: Tier, orientation: Orientation, variant: DivVariant, spacing: Spacing, labelText: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<hr class="ui-lite-divider" />

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (variant !== 'solid') props.push(`  variant="${variant}"`)
  if (spacing !== 'md') props.push(`  spacing="${spacing}"`)
  if (labelText) props.push(`  label="${labelText}"`)

  return `<script>
  import { Divider } from '@annondeveloper/ui-kit'
</script>

<Divider${props.length ? '\n' + props.join('\n') + '\n' : ' '}/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [variant, setVariant] = useState<DivVariant>('solid')
  const [spacing, setSpacing] = useState<Spacing>('md')
  const [labelText, setLabelText] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, orientation, variant, spacing, labelText),
    [tier, orientation, variant, spacing, labelText],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, orientation, variant, labelText),
    [tier, orientation, variant, labelText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, orientation, variant, spacing, labelText),
    [tier, orientation, variant, spacing, labelText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, orientation, variant, labelText),
    [tier, orientation, variant, labelText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, orientation, variant, spacing, labelText),
    [tier, orientation, variant, spacing, labelText],
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

  return (
    <section className={`${P}section`} id="playground">
      <h2 className={`${P}section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${P}section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${P}playground`}>
        <div className={`${P}playground-preview`}>
          <div className={`${P}playground-result`} style={orientation === 'vertical' ? { flexDirection: 'row' } : { flexDirection: 'column', width: '100%' }}>
            {tier === 'lite' ? (
              <LiteDivider />
            ) : (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>Content above</span>
                <Divider
                  orientation={orientation}
                  variant={variant}
                  spacing={spacing}
                  label={labelText || undefined}
                  style={orientation === 'vertical' ? { minBlockSize: '60px' } : undefined}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>Content below</span>
              </>
            )}
          </div>

          <div className={`${P}code-tabs`}>
            <div className={`${P}export-row`}>
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
              {copyStatus && <span className={`${P}export-status`}>{copyStatus}</span>}
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

        <div className={`${P}playground-controls`}>
          {tier !== 'lite' && (
            <>
              <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
              <OptionGroup label="Variant" options={DIV_VARIANTS} value={variant} onChange={setVariant} />
              <OptionGroup label="Spacing" options={SPACINGS} value={spacing} onChange={setSpacing} />

              <div className={`${P}control-group`}>
                <span className={`${P}control-label`}>Label (optional)</span>
                <input
                  type="text"
                  value={labelText}
                  onChange={e => setLabelText(e.target.value)}
                  className={`${P}text-input`}
                  placeholder="e.g. OR, Section"
                />
              </div>
            </>
          )}

          {tier === 'lite' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Lite tier renders a simple {'<hr>'} element. Switch to Standard tier for orientation, variant, label, and spacing controls.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DividerPage() {
  useStyles('divider-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.divider-page__section')
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
    <div className="divider-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className={`${P}hero`}>
        <h1 className={`${P}title`}>Divider</h1>
        <p className={`${P}desc`}>
          Visual separator with horizontal/vertical orientation, three line styles, optional centered label, and configurable spacing.
          Ships in two weight tiers from a minimal CSS-only lite to a full-featured standard.
        </p>
        <div className={`${P}import-row`}>
          <code className={`${P}import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Orientations ────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="orientations">
          <h2 className={`${P}section-title`}>
            <a href="#orientations">Orientations</a>
          </h2>
          <p className={`${P}section-desc`}>
            Horizontal dividers span full width between stacked content. Vertical dividers work inline between side-by-side items.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '2rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBlockEnd: '0.5rem' }}>Horizontal (default)</p>
              <Divider />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBlockStart: '0.5rem' }}>Content continues here</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBlockEnd: '0.75rem' }}>Vertical</p>
              <div className={`${P}vertical-demo`}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Left</span>
                <Divider orientation="vertical" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Center</span>
                <Divider orientation="vertical" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Right</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Variants ────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="variants">
          <h2 className={`${P}section-title`}>
            <a href="#variants">Line Variants</a>
          </h2>
          <p className={`${P}section-desc`}>
            Three line styles for different visual weights and contexts.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '2rem' }}>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider variant="solid" />
              <span className={`${P}item-label`}>solid</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider variant="dashed" />
              <span className={`${P}item-label`}>dashed</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider variant="dotted" />
              <span className={`${P}item-label`}>dotted</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. With Labels ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="labels">
          <h2 className={`${P}section-title`}>
            <a href="#labels">With Labels</a>
          </h2>
          <p className={`${P}section-desc`}>
            Add a centered text label on the divider. Commonly used for "or", section titles, or inline separators in forms.
            When a label is present, the component renders a div instead of hr.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '2rem' }}>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider label="OR" />
              <span className={`${P}item-label`}>label="OR"</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider label="Section 2" />
              <span className={`${P}item-label`}>label="Section 2"</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Divider label="Continue" />
              <span className={`${P}item-label`}>label="Continue"</span>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Divider label="OR" />
<Divider label="Section 2" />
<Divider label="Continue" />`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Spacing ──────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="spacing">
          <h2 className={`${P}section-title`}>
            <a href="#spacing">Spacing</a>
          </h2>
          <p className={`${P}section-desc`}>
            Three spacing presets control the margin around the divider. Uses logical properties for proper RTL support.
          </p>
          <div className={`${P}preview ${P}preview--col`}>
            {SPACINGS.map(sp => (
              <div key={sp} style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>spacing="{sp}"</p>
                <Divider spacing={sp} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>Content after divider</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Composition Examples ──────────────────── */}
      <section className={`${P}section`} id="composition">
        <h2 className={`${P}section-title`}>
          <a href="#composition">Composition Examples</a>
        </h2>
        <p className={`${P}section-desc`}>
          Common patterns showing dividers in real layouts: form sections, navigation toolbars, and content separators.
        </p>
        <div className={`${P}preview ${P}preview--col`} style={{ gap: '2rem' }}>
          {/* Form separator */}
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', width: '100%' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.5rem' }}>Sign up with email</p>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', marginBlockEnd: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>email@example.com</span>
            </div>
            {tier === 'lite' ? <LiteDivider /> : <Divider label="OR" />}
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', margin: '0.5rem 0' }}>Continue with social</p>
          </div>

          {/* Toolbar with vertical dividers */}
          {tier !== 'lite' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Button size="xs" variant="ghost" icon={<Icon name="edit" size="sm" />}>Edit</Button>
              <Divider orientation="vertical" style={{ minBlockSize: '24px' }} />
              <Button size="xs" variant="ghost" icon={<Icon name="copy" size="sm" />}>Copy</Button>
              <Button size="xs" variant="ghost" icon={<Icon name="trash" size="sm" />}>Delete</Button>
              <Divider orientation="vertical" style={{ minBlockSize: '24px' }} />
              <Button size="xs" variant="ghost" icon={<Icon name="settings" size="sm" />}>Settings</Button>
            </div>
          )}
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className={`${P}section`} id="tiers">
        <h2 className={`${P}section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${P}section-desc`}>
          Choose the right balance of features and bundle size. Divider ships as Lite (plain hr) and Standard (full-featured).
          Premium maps to Standard for this component.
        </p>

        <div className={`${P}tiers`}>
          {/* Lite */}
          <div
            className={`${P}tier-card${tier === 'lite' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Lite</span>
              <span className={`${P}tier-size`}>~0.1 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              CSS-only horizontal rule. A simple styled hr element. No orientation, variant, label, or spacing props.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Divider {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${P}tier-preview`} style={{ width: '100%' }}>
              <LiteDivider />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`${P}tier-card${tier === 'standard' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Standard</span>
              <span className={`${P}tier-size`}>~1.0 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Full-featured divider with horizontal/vertical orientation, three line variants, centered label, spacing presets, and full ARIA support.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Divider {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${P}tier-preview`} style={{ width: '100%' }}>
              <Divider label="OR" />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium (maps to Standard) */}
          <div
            className={`${P}tier-card${tier === 'premium' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Premium</span>
              <span className={`${P}tier-size`}>~1.0 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Maps to Standard for Divider. No additional premium features for this component — Standard already includes all functionality.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Divider {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${P}tier-preview`} style={{ width: '100%' }}>
              <Divider label="OR" />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className={`${P}section`} id="props">
        <h2 className={`${P}section-title`}>
          <a href="#props">Props API</a>
        </h2>
        <p className={`${P}section-desc`}>
          All props accepted by Divider. It also spreads any native hr/div HTML attributes
          onto the underlying element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dividerProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className={`${P}section`} id="accessibility">
        <h2 className={`${P}section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${P}section-desc`}>
          Uses native {'<hr>'} element and ARIA separator role for proper semantic meaning.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${P}a11y-list`}>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic element:</strong> Uses native <code className={`${P}a11y-key`}>{'<hr>'}</code> element for horizontal rules, automatically conveying separator semantics.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Separator role:</strong> Explicit <code className={`${P}a11y-key`}>role="separator"</code> on both hr and labeled div variants.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Orientation:</strong> Vertical dividers include <code className={`${P}a11y-key`}>aria-orientation="vertical"</code> for proper screen reader announcement.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Visible in <code className={`${P}a11y-key`}>forced-colors: active</code> mode using system ButtonText color.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Renders as a solid 1px black line for clean print output.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Logical properties:</strong> Uses <code className={`${P}a11y-key`}>margin-block</code> and <code className={`${P}a11y-key`}>margin-inline</code> for proper RTL layout support.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
