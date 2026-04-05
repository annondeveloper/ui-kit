'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Chip } from '@ui/components/chip'
import { Chip as LiteChip } from '@ui/lite/chip'
import { Chip as PremiumChip } from '@ui/premium/chip'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ───────────────────────────────────────────────────────────────────

type Variant = 'outline' | 'filled' | 'light'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Color = 'default' | 'primary' | 'success' | 'warning' | 'danger'

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE = 'chip-page'
const VARIANTS: readonly Variant[] = ['outline', 'filled', 'light'] as const
const SIZES: readonly Size[] = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const COLORS: readonly Color[] = ['default', 'primary', 'success', 'warning', 'danger'] as const

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Chip } from '@annondeveloper/ui-kit'",
  lite: "import { Chip } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Chip } from '@annondeveloper/ui-kit/premium'",
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.${PAGE}) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ${PAGE};
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .${PAGE}__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .${PAGE}__hero::before {
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
        .${PAGE}__hero::before { animation: none; }
      }

      .${PAGE}__title {
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

      .${PAGE}__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .${PAGE}__import-code {
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

      .${PAGE}__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .${PAGE}__section {
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
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .${PAGE}__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .${PAGE}__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .${PAGE}__section-title a { color: inherit; text-decoration: none; }
      .${PAGE}__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .${PAGE}__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .${PAGE}__preview {
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

      .${PAGE}__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__preview--col {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }

      .${PAGE}__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        min-inline-size: 5rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
      }

      .${PAGE}__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .${PAGE}__playground-result {
        padding: 2.5rem 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-block-size: 140px;
        position: relative;
        flex-wrap: wrap;
      }

      .${PAGE}__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 50% 50%, oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04), transparent 70%);
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .${PAGE}__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .${PAGE}__control-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .${PAGE}__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .${PAGE}__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm, 4px);
        border: 1px solid var(--border-subtle);
        background: var(--bg-base);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
      }

      .${PAGE}__option-btn:hover {
        border-color: var(--border-default);
        color: var(--text-primary);
      }

      .${PAGE}__option-btn--active {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        color: white;
      }

      .${PAGE}__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .${PAGE}__code-tabs {
        display: flex;
        gap: 0;
        border-bottom: 1px solid var(--border-subtle);
        margin-block-end: 0;
      }

      .${PAGE}__code-tab {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.375rem 0.75rem;
        border: none;
        background: none;
        color: var(--text-tertiary);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }

      .${PAGE}__code-tab:hover {
        color: var(--text-secondary);
      }

      .${PAGE}__code-tab--active {
        color: var(--brand, oklch(65% 0.2 270));
        border-bottom-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__code-block {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        line-height: 1.5;
        background: oklch(0% 0 0 / 0.25);
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        color: var(--text-primary);
        margin: 0;
        max-block-size: 240px;
      }

      /* ── Tier Cards ─────────────────────────────────── */

      .${PAGE}__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__tiers {
          grid-template-columns: 1fr;
        }
      }

      .${PAGE}__tier-card {
        padding: 1.25rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        background: var(--bg-base);
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .${PAGE}__tier-card:hover {
        border-color: var(--border-default);
      }

      .${PAGE}__tier-card--active {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 1px var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-block-end: 0.5rem;
      }

      .${PAGE}__tier-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary);
      }

      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', monospace;
      }

      .${PAGE}__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0 0 0.75rem;
      }

      .${PAGE}__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm, 4px);
        padding: 0.375rem 0.5rem;
        margin-block-end: 0.75rem;
        overflow-x: auto;
        white-space: nowrap;
      }

      .${PAGE}__tier-preview {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .${PAGE}__size-breakdown {
        margin-block-start: 0.75rem;
        padding-block-start: 0.75rem;
        border-block-start: 1px solid var(--border-subtle);
      }

      .${PAGE}__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── A11y ───────────────────────────────────────── */

      .${PAGE}__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .${PAGE}__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .${PAGE}__a11y-icon {
        flex-shrink: 0;
        color: oklch(65% 0.18 150);
        margin-block-start: 0.125rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', monospace;
        font-size: 0.75em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm, 4px);
        border: 1px solid var(--border-subtle);
      }

      /* ── Source Links ───────────────────────────────── */

      .${PAGE}__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: none;
        padding: 0.375rem 0;
      }

      .${PAGE}__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Color Presets ──────────────────────────────── */

      .${PAGE}__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        align-items: center;
        margin-block-start: 0.75rem;
      }

      .${PAGE}__color-preset {
        inline-size: 28px;
        block-size: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.15s;
      }

      .${PAGE}__color-preset:hover {
        transform: scale(1.15);
      }

      .${PAGE}__color-preset--active {
        border-color: var(--text-primary);
        transform: scale(1.15);
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
  { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial checked state for uncontrolled usage.' },
  { name: 'onChange', type: '(checked: boolean) => void', description: 'Called when checked state changes.' },
  { name: 'variant', type: "'outline' | 'filled' | 'light'", default: "'outline'", description: 'Visual style variant.' },
  { name: 'color', type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color scheme for the checked state.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the chip.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon displayed when checked instead of the default checkmark.' },
  { name: 'name', type: 'string', description: 'Name attribute for the hidden checkbox input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the chip.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Label text content.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  checked: boolean,
  disabled: boolean,
  showIcon: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = showIcon ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = []
  if (variant !== 'outline') props.push(`  variant="${variant}"`)
  if (color !== 'default') props.push(`  color="${color}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (checked) props.push('  defaultChecked')
  if (disabled) props.push('  disabled')
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="star" size="sm" />}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<Chip>Label</Chip>'
    : `<Chip\n${props.join('\n')}\n>Label</Chip>`

  return `${importStr}${iconImport}\n\n${jsx}`
}

function generateHtmlCode(
  variant: Variant,
  color: Color,
  size: Size,
  checked: boolean,
  disabled: boolean,
): string {
  const attrs = [
    `class="ui-chip"`,
    `data-variant="${variant}"`,
    `data-color="${color}"`,
    `data-size="${size}"`,
  ]
  if (checked) attrs.push('data-checked="true"')
  if (disabled) attrs.push('data-disabled="true"')

  return `<!-- HTML + CSS approach -->
<label ${attrs.join(' ')}>
  <input type="checkbox" class="ui-chip__input"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''} />
  <span class="ui-chip__check">
    <svg viewBox="0 0 12 10"><polyline points="1.5 6 4.5 9 10.5 1" /></svg>
  </span>
  <span class="ui-chip__label">Label</span>
</label>

<style>
@import '@annondeveloper/ui-kit/css/components/chip.css';
</style>`
}

function generateVueCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  checked: boolean,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-chip"`, `data-variant="${variant}"`, `data-color="${color}"`, `data-size="${size}"`]
    if (checked) attrs.push('data-checked="true"')
    if (disabled) attrs.push('data-disabled="true"')
    return `<template>\n  <label ${attrs.join(' ')}>\n    <input type="checkbox" class="ui-chip__input"${checked ? ' checked' : ''} />\n    <span class="ui-chip__label">Label</span>\n  </label>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (variant !== 'outline') attrs.push(`  variant="${variant}"`)
  if (color !== 'default') attrs.push(`  color="${color}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (checked) attrs.push('  :default-checked="true"')
  if (disabled) attrs.push('  disabled')

  const template = attrs.length === 0
    ? '  <Chip>Label</Chip>'
    : `  <Chip\n  ${attrs.join('\n  ')}\n  >Label</Chip>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Chip } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  checked: boolean,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-chip"`, `data-variant="${variant}"`, `data-color="${color}"`, `data-size="${size}"`]
    if (checked) attrs.push('data-checked="true"')
    if (disabled) attrs.push('[attr.data-disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->\n<label ${attrs.join(' ')}>\n  <input type="checkbox" class="ui-chip__input"${checked ? ' checked' : ''} />\n  <span class="ui-chip__label">Label</span>\n</label>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<label\n  class="ui-chip"\n  data-variant="${variant}"\n  data-color="${color}"\n  data-size="${size}"\n  ${checked ? 'data-checked="true"' : ''}\n  ${disabled ? '[attr.data-disabled]="true"' : ''}\n>\n  <input type="checkbox" class="ui-chip__input"${checked ? ' checked' : ''} />\n  <span class="ui-chip__label">Label</span>\n</label>\n\n/* Import component CSS */\n@import '${importPath}/css/components/chip.css';`
}

function generateSvelteCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  checked: boolean,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<label\n  class="ui-chip"\n  data-variant="${variant}"\n  data-color="${color}"\n  data-size="${size}"\n  ${checked ? 'data-checked="true"' : ''}\n  ${disabled ? 'data-disabled="true"' : ''}\n>\n  <input type="checkbox" class="ui-chip__input"${checked ? ' checked' : ''} />\n  <span class="ui-chip__label">Label</span>\n</label>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`variant="${variant}"`]
  if (color !== 'default') attrs.push(`color="${color}"`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (checked) attrs.push('defaultChecked')
  if (disabled) attrs.push('disabled')
  return `<script>\n  import { Chip } from '${importPath}';\n</script>\n\n<Chip\n  ${attrs.join('\n  ')}\n>\n  Label\n</Chip>`
}

// ─── Helper Components ───────────────────────────────────────────────────────

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
    <div className={`${PAGE}__control-group`}>
      <span className={`${PAGE}__control-label`}>{label}</span>
      <div className={`${PAGE}__control-options`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${PAGE}__option-btn${opt === value ? ` ${PAGE}__option-btn--active` : ''}`}
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
    <label className={`${PAGE}__toggle-label`}>
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

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [variant, setVariant] = useState<Variant>('outline')
  const [color, setColor] = useState<Color>('primary')
  const [size, setSize] = useState<Size>('md')
  const [isChecked, setIsChecked] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const ChipComponent = effectiveTier === 'lite' ? LiteChip : effectiveTier === 'premium' ? PremiumChip : Chip

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, color, size, isChecked, disabled, showIcon, motion),
    [tier, variant, color, size, isChecked, disabled, showIcon, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(variant, color, size, isChecked, disabled),
    [variant, color, size, isChecked, disabled],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, color, size, isChecked, disabled),
    [tier, variant, color, size, isChecked, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, color, size, isChecked, disabled),
    [tier, variant, color, size, isChecked, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, color, size, isChecked, disabled),
    [tier, variant, color, size, isChecked, disabled],
  )

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

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const previewProps: Record<string, unknown> = {
    variant,
    color,
    size,
    checked: isChecked,
    onChange: setIsChecked,
  }
  if (disabled) previewProps.disabled = true
  if (showIcon && effectiveTier !== 'lite') previewProps.icon = <Icon name="star" size="sm" />
  if (effectiveTier !== 'lite') previewProps.motion = motion

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${PAGE}__playground`}>
        {/* Preview area */}
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <ChipComponent {...previewProps}>Label</ChipComponent>
          </div>

          {/* Tabbed code output */}
          <div>
            <div className={`${PAGE}__code-tabs`}>
              {codeTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${PAGE}__code-tab${activeCodeTab === tab.id ? ` ${PAGE}__code-tab--active` : ''}`}
                  onClick={() => setActiveCodeTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <pre className={`${PAGE}__code-block`}>{activeCode}</pre>
          </div>
        </div>

        {/* Controls */}
        <div className={`${PAGE}__playground-controls`}>
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Color" options={COLORS} value={color} onChange={setColor} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          {effectiveTier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Toggle label="Checked" checked={isChecked} onChange={setIsChecked} />
            <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            {effectiveTier !== 'lite' && (
              <Toggle label="Custom icon" checked={showIcon} onChange={setShowIcon} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChipPage() {
  useStyles('chip-page', pageStyles)
  const { tier, setTier } = useTier()

  const [copied, setCopied] = useState(false)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [filters, setFilters] = useState<Record<string, boolean>>({
    typescript: true,
    react: false,
    nodejs: true,
    python: false,
  })

  const effectiveTier = tier
  const importStr = IMPORT_STRINGS[tier]

  const copyImport = useCallback(() => {
    navigator.clipboard.writeText(importStr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [importStr])

  const toggleFilter = (key: string) =>
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))

  const ChipComponent = effectiveTier === 'lite' ? LiteChip : effectiveTier === 'premium' ? PremiumChip : Chip

  const COLOR_PRESETS = [
    { hex: '#6366f1', name: 'Indigo' },
    { hex: '#8b5cf6', name: 'Violet' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#ec4899', name: 'Pink' },
  ]

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Chip</h1>
        <p className={`${PAGE}__desc`}>
          Toggle chip for filter interfaces, tag selection, and multi-choice inputs.
          Combines a hidden checkbox with a styled label for accessible toggling.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{importStr}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Variants & Colors ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="variants">
        <h2 className={`${PAGE}__section-title`}><a href="#variants">Variants & Colors</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Three visual variants paired with five color schemes. Chips toggle between checked and
          unchecked states with a checkmark icon.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          {VARIANTS.map(v => (
            <div key={v} className={`${PAGE}__row`}>
              <span className={`${PAGE}__label`}>{v}</span>
              {COLORS.map(c => (
                <ChipComponent key={`${v}-${c}`} variant={v} color={c} defaultChecked>
                  {c}
                </ChipComponent>
              ))}
            </div>
          ))}
          <div className={`${PAGE}__row`}>
            <span className={`${PAGE}__label`}>unchecked</span>
            {VARIANTS.map(v => (
              <ChipComponent key={v} variant={v} defaultChecked={false}>{v}</ChipComponent>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Live Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Filter Group ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="filter-group">
        <h2 className={`${PAGE}__section-title`}><a href="#filter-group">Filter Group</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Chips work well as a multi-select filter group. Each chip manages its own checked state
          and can have a custom icon.
        </p>
        <div className={`${PAGE}__preview`}>
          <ChipComponent checked={filters.typescript} onChange={() => toggleFilter('typescript')}
            color="primary" icon={<Icon name="code" size="sm" />}>TypeScript</ChipComponent>
          <ChipComponent checked={filters.react} onChange={() => toggleFilter('react')}
            color="primary" icon={<Icon name="layout" size="sm" />}>React</ChipComponent>
          <ChipComponent checked={filters.nodejs} onChange={() => toggleFilter('nodejs')}
            color="success" icon={<Icon name="server" size="sm" />}>Node.js</ChipComponent>
          <ChipComponent checked={filters.python} onChange={() => toggleFilter('python')}
            color="warning" icon={<Icon name="terminal" size="sm" />}>Python</ChipComponent>
        </div>
      </section>

      {/* ── 4. Sizes & Disabled ──────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes & Disabled</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five sizes from compact xs to large xl. Disabled chips cannot be toggled.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__row`}>
            {SIZES.map(s => (
              <ChipComponent key={s} size={s} defaultChecked>{s}</ChipComponent>
            ))}
          </div>
          <div className={`${PAGE}__row`}>
            <ChipComponent defaultChecked disabled>Checked disabled</ChipComponent>
            <ChipComponent disabled>Unchecked disabled</ChipComponent>
          </div>
        </div>
      </section>

      {/* ── 5. Weight Tiers ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}><a href="#tiers">Weight Tiers</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Choose the right weight tier for your project. Lite for minimal footprint, Standard for full features, Premium for aurora effects.
        </p>

        <div className={`${PAGE}__tiers`}>
          {/* Lite */}
          <div
            className={`${PAGE}__tier-card${tier === 'lite' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Lite</span>
              <span className={`${PAGE}__tier-size`}>~0.2 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Minimal wrapper with motion disabled. Zero overhead beyond forwardRef.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Chip {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteChip defaultChecked color="primary">Lite</LiteChip>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`${PAGE}__tier-card${tier === 'standard' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Standard</span>
              <span className={`${PAGE}__tier-size`}>~1.5 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Full-featured chip with motion levels, color variants, icon support, and accessibility.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Chip {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <Chip defaultChecked color="primary" icon={<Icon name="star" size="sm" />}>Standard</Chip>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`${PAGE}__tier-card${tier === 'premium' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Premium</span>
              <span className={`${PAGE}__tier-size`}>~2.5 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Everything in Standard plus aurora glow on checked state, spring scale hover, and shimmer effects.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Chip {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumChip defaultChecked color="primary" icon={<Icon name="star" size="sm" />}>Premium</PremiumChip>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to see chips update in real-time. The theme generates
          accessible tints automatically from your chosen hue.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
          />
          <div style={{ '--brand': brandColor } as React.CSSProperties}>
            <div className={`${PAGE}__preview`}>
              <ChipComponent defaultChecked color="primary" variant="filled">Primary</ChipComponent>
              <ChipComponent defaultChecked color="success" variant="filled">Success</ChipComponent>
              <ChipComponent defaultChecked color="warning" variant="outline">Warning</ChipComponent>
              <ChipComponent defaultChecked color="danger" variant="light">Danger</ChipComponent>
            </div>
          </div>
        </div>
        <div className={`${PAGE}__color-presets`}>
          {COLOR_PRESETS.map(p => (
            <button
              key={p.hex}
              className={`${PAGE}__color-preset${brandColor === p.hex ? ` ${PAGE}__color-preset--active` : ''}`}
              style={{ background: p.hex }}
              onClick={() => setBrandColor(p.hex)}
              aria-label={`Set brand color to ${p.name}`}
            />
          ))}
          <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
            Reset
          </Button>
        </div>
      </section>

      {/* ── 7. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Chip.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── 8. Accessibility ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Built on a native {'<label>'} with hidden {'<input type="checkbox">'} for full semantic toggling.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Toggles on <code className={`${PAGE}__a11y-key`}>Space</code> key when focused.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className={`${PAGE}__a11y-key`}>:focus-visible</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses native <code className={`${PAGE}__a11y-key`}>checkbox</code> input — no ARIA role needed.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All color variants meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses <code className={`${PAGE}__a11y-key`}>data-disabled</code> with <code className={`${PAGE}__a11y-key`}>pointer-events: none</code> and reduced opacity.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className={`${PAGE}__a11y-key`}>@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with visible borders.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className={`${PAGE}__a11y-key`}>prefers-reduced-motion</code> — disables all transitions.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/chip.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/chip.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/chip.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/chip.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/chip.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/chip.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
