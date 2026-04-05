'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CopyButton } from '@ui/components/copy-button'
import { CopyButton as LiteCopyButton } from '@ui/lite/copy-button'
import { CopyButton as PremiumCopyButton } from '@ui/premium/copy-button'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'copy-button-page'

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
        align-items: center;
        gap: 2rem;
      }

      .${PAGE}__code-block {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.3);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        inline-size: 100%;
        max-inline-size: 480px;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Playground ─────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
        .${PAGE}__playground-controls {
          position: static !important;
        }
      }

      @container ${PAGE} (max-width: 680px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
        .${PAGE}__playground-controls {
          position: static !important;
        }
      }

      .${PAGE}__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .${PAGE}__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
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
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
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

      .${PAGE}__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .${PAGE}__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .${PAGE}__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .${PAGE}__option-btn {
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
      .${PAGE}__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .${PAGE}__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .${PAGE}__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .${PAGE}__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .${PAGE}__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .${PAGE}__code-tabs {
        min-inline-size: 0;
        overflow: hidden;
      }

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-block-end: 0.75rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-success, oklch(72% 0.19 155));
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .${PAGE}__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .${PAGE}__tier-card {
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

      .${PAGE}__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .${PAGE}__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .${PAGE}__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .${PAGE}__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }

      .${PAGE}__tier-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary);
      }

      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--brand);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .${PAGE}__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }

      .${PAGE}__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        padding: 0.375rem 0.5rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: nowrap;
      }

      .${PAGE}__tier-preview {
        display: flex;
        justify-content: center;
        padding: 1rem 0 0.5rem;
      }

      .${PAGE}__size-breakdown {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      .${PAGE}__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      /* ── Source links ───────────────────────────────── */

      .${PAGE}__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        text-decoration: none;
        padding: 0.375rem 0;
        transition: color 0.15s;
      }
      .${PAGE}__source-link:hover {
        color: var(--brand);
      }

      /* ── Accessibility list ─────────────────────────── */

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
        color: var(--status-success, oklch(72% 0.19 155));
        margin-top: 0.125rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
      }

      /* ── Color presets ──────────────────────────────── */

      .${PAGE}__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .${PAGE}__color-preset {
        inline-size: 28px;
        block-size: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .${PAGE}__color-preset:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .${PAGE}__color-preset--active {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--text-primary);
      }

      /* ── Responsive tier cards ──────────────────────── */

      @media (max-width: 768px) {
        .${PAGE}__tiers {
          grid-template-columns: 1fr;
        }
      }

      @container ${PAGE} (max-width: 680px) {
        .${PAGE}__tiers {
          grid-template-columns: 1fr;
        }
      }
    }
  }
`

// ─── Constants ───────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg'
const SIZES: readonly Size[] = ['xs', 'sm', 'md', 'lg'] as const

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CopyButton } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CopyButton } from '@annondeveloper/ui-kit'",
  premium: "import { CopyButton } from '@annondeveloper/ui-kit/premium'",
}

const SAMPLE_CODE = 'npm install @annondeveloper/ui-kit'
const SAMPLE_TOKEN = 'sk-proj-abc123def456ghi789'

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

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'The text to copy to the clipboard.' },
  { name: 'timeout', type: 'number', defaultValue: '2000', description: 'Duration in ms to show the copied state before resetting.' },
  { name: 'children', type: '(payload: { copied: boolean; copy: () => void }) => ReactNode', required: true, description: 'Render prop receiving copied state and copy trigger function.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Component size — affects padding and font size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', defaultValue: '3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root button element.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Additional click handler (fires alongside the copy action).' },
]

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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: Size,
  timeout: number,
  motion: number,
  copyValue: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = "\nimport { Icon } from '@annondeveloper/ui-kit'"
  const btnImport = tier === 'lite'
    ? "\nimport { Button } from '@annondeveloper/ui-kit/lite'"
    : tier === 'premium'
      ? "\nimport { Button } from '@annondeveloper/ui-kit/premium'"
      : "\nimport { Button } from '@annondeveloper/ui-kit'"

  const cbProps: string[] = [`  value="${copyValue}"`]
  if (timeout !== 2000) cbProps.push(`  timeout={${timeout}}`)
  if (motion !== 3 && tier !== 'lite') cbProps.push(`  motion={${motion}}`)
  if (size !== 'md') cbProps.push(`  size="${size}"`)

  return `${importStr}${btnImport}${iconImport}

<CopyButton
${cbProps.join('\n')}
>
  {({ copied, copy }) => (
    <Button
      size="${size}"
      variant={copied ? 'primary' : 'secondary'}
      onClick={copy}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )}
</CopyButton>`
}

function generateHtmlCode(
  tier: Tier,
  size: Size,
  copyValue: string,
  brandColor: string,
): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssPath = tier === 'lite'
    ? 'lite/styles.css'
    : 'css/components/copy-button.css'

  return `<!-- CopyButton — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cssPath}">
${brandColor !== '#6366f1' ? `\n<style>:root { --brand: ${brandColor}; }</style>\n` : ''}
<button
  class="ui-copy-button"
  data-size="${size}"
  onclick="navigator.clipboard.writeText('${copyValue}').then(() => {
    this.dataset.copied = 'true';
    this.querySelector('.label').textContent = 'Copied!';
    setTimeout(() => {
      delete this.dataset.copied;
      this.querySelector('.label').textContent = 'Copy';
    }, 2000);
  })"
>
  <span class="label">Copy</span>
</button>`
}

function generateVueCode(
  tier: Tier,
  size: Size,
  timeout: number,
  copyValue: string,
): string {
  if (tier === 'lite') {
    return `<template>
  <button
    class="ui-copy-button"
    data-size="${size}"
    :data-copied="copied || undefined"
    @click="copy"
  >
    {{ copied ? 'Copied!' : 'Copy' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const copied = ref(false)
let timer

function copy() {
  navigator.clipboard.writeText('${copyValue}').then(() => {
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => copied.value = false, ${timeout})
  })
}
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const sizeAttr = size !== 'md' ? `\n    size="${size}"` : ''
  const timeoutAttr = timeout !== 2000 ? `\n    :timeout="${timeout}"` : ''

  return `<template>
  <CopyButton
    value="${copyValue}"${sizeAttr}${timeoutAttr}
    v-slot="{ copied, copy }"
  >
    <Button
      size="${size}"
      :variant="copied ? 'primary' : 'secondary'"
      @click="copy"
    >
      {{ copied ? 'Copied!' : 'Copy' }}
    </Button>
  </CopyButton>
</template>

<script setup>
import { CopyButton, Button } from '${importPath}'
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: Size,
  timeout: number,
  copyValue: string,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<button
  class="ui-copy-button"
  [attr.data-size]="'${size}'"
  [attr.data-copied]="copied || null"
  (click)="copy()"
>
  {{ copied ? 'Copied!' : 'Copy' }}
</button>

/* In component.ts */
copied = false;
copy() {
  navigator.clipboard.writeText('${copyValue}').then(() => {
    this.copied = true;
    setTimeout(() => this.copied = false, ${timeout});
  });
}

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<button
  class="ui-copy-button"
  [attr.data-size]="'${size}'"
  [attr.data-copied]="copied || null"
  (click)="copy()"
>
  {{ copied ? 'Copied!' : 'Copy' }}
</button>

/* In component.ts */
copied = false;
copy() {
  navigator.clipboard.writeText('${copyValue}').then(() => {
    this.copied = true;
    setTimeout(() => this.copied = false, ${timeout});
  });
}

/* Import CSS */
@import '${importPath}/css/components/copy-button.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: Size,
  timeout: number,
  copyValue: string,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<script>
  let copied = false;
  let timer;

  function copy() {
    navigator.clipboard.writeText('${copyValue}').then(() => {
      copied = true;
      clearTimeout(timer);
      timer = setTimeout(() => copied = false, ${timeout});
    });
  }
</script>

<button
  class="ui-copy-button"
  data-size="${size}"
  data-copied={copied || undefined}
  on:click={copy}
>
  {copied ? 'Copied!' : 'Copy'}
</button>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { CopyButton, Button } from '${importPath}';
</script>

<CopyButton value="${copyValue}" size="${size}" let:copied let:copy>
  <Button
    size="${size}"
    variant={copied ? 'primary' : 'secondary'}
    on:click={copy}
  >
    {copied ? 'Copied!' : 'Copy'}
  </Button>
</CopyButton>`
}

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<Size>('md')
  const [timeout, setTimeoutVal] = useState(2000)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyValue, setCopyValue] = useState(SAMPLE_CODE)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const CopyButtonComponent = tier === 'lite' ? LiteCopyButton : tier === 'premium' ? PremiumCopyButton : CopyButton

  const reactCode = useMemo(
    () => generateReactCode(tier, size, timeout, motion, copyValue),
    [tier, size, timeout, motion, copyValue],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, copyValue, brandColor),
    [tier, size, copyValue, brandColor],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, size, timeout, copyValue),
    [tier, size, timeout, copyValue],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, size, timeout, copyValue),
    [tier, size, timeout, copyValue],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, timeout, copyValue),
    [tier, size, timeout, copyValue],
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
    value: copyValue,
    size,
  }
  if (timeout !== 2000) previewProps.timeout = timeout
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

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
            <div className={`${PAGE}__code-block`}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{copyValue}</span>
              <CopyButtonComponent {...previewProps}>
                {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                  <Button size={size === 'xs' ? 'xs' : 'sm'} variant={copied ? 'primary' : 'secondary'} onClick={copy}
                    icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CopyButtonComponent>
            </div>
          </div>

          {/* Tabbed code output */}
          <div className={`${PAGE}__code-tabs`}>
            <div className={`${PAGE}__export-row`}>
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
              {copyStatus && <span className={`${PAGE}__export-status`}>{copyStatus}</span>}
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
        <div className={`${PAGE}__playground-controls`}>
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className={`${PAGE}__control-group`}>
            <span className={`${PAGE}__control-label`}>Timeout (ms)</span>
            <div className={`${PAGE}__control-options`}>
              {[1000, 2000, 3000, 5000].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`${PAGE}__option-btn${t === timeout ? ` ${PAGE}__option-btn--active` : ''}`}
                  onClick={() => setTimeoutVal(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={`${PAGE}__control-group`}>
            <span className={`${PAGE}__control-label`}>Copy Value</span>
            <input
              type="text"
              value={copyValue}
              onChange={e => setCopyValue(e.target.value)}
              className={`${PAGE}__text-input`}
              placeholder="Text to copy..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CopyButtonPage() {
  useStyles('copy-button-page', pageStyles)
  const { tier, setTier } = useTier()

  const [headerCopied, setHeaderCopied] = useState(false)
  const [brandColor, setBrandColor] = useState('#6366f1')

  const effectiveTier = tier
  const CopyButtonComponent = effectiveTier === 'lite' ? LiteCopyButton : effectiveTier === 'premium' ? PremiumCopyButton : CopyButton

  const importStr = IMPORT_STRINGS[effectiveTier]

  const copyImport = () => {
    navigator.clipboard.writeText(importStr).then(() => {
      setHeaderCopied(true)
      setTimeout(() => setHeaderCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>CopyButton</h1>
        <p className={`${PAGE}__desc`}>
          Clipboard copy button with a render-prop pattern for full control over appearance.
          Handles the clipboard API call and provides feedback state automatically.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{importStr}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={headerCopied ? 'check' : 'copy'} size="sm" />}>
            {headerCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="basic">
        <h2 className={`${PAGE}__section-title`}><a href="#basic">Basic Copy Feedback</a></h2>
        <p className={`${PAGE}__section-desc`}>
          CopyButton uses a render function that receives the copied state and a copy action.
          Click the copy button to see the icon and label swap for visual feedback.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__code-block`}>
            <span>{SAMPLE_CODE}</span>
            <CopyButtonComponent value={SAMPLE_CODE}>
              {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                <Button size="xs" variant={copied ? 'primary' : 'secondary'} onClick={copy}
                  icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </CopyButtonComponent>
          </div>
          <div className={`${PAGE}__code-block`}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{SAMPLE_TOKEN}</span>
            <CopyButtonComponent value={SAMPLE_TOKEN} timeout={2000}>
              {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                <Button size="xs" variant={copied ? 'primary' : 'ghost'} onClick={copy}
                  icon={<Icon name={copied ? 'check-circle' : 'clipboard'} size="sm" />}>
                  {copied ? 'Done' : 'Copy'}
                </Button>
              )}
            </CopyButtonComponent>
          </div>
        </div>
      </section>

      {/* ── 2. Live Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Sizes ─────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Four sizes available via the <code>size</code> prop. Touch targets enforce
          44px minimum on coarse pointer devices regardless of the visual size.
        </p>
        <div className={`${PAGE}__preview`}>
          {SIZES.map(s => (
            <div key={s} className={`${PAGE}__labeled-item`}>
              <CopyButtonComponent value={`Size: ${s}`} size={s}>
                {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                  <Button size={s} variant={copied ? 'primary' : 'secondary'} onClick={copy}
                    icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CopyButtonComponent>
              <span className={`${PAGE}__item-label`}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Custom Render ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="custom">
        <h2 className={`${PAGE}__section-title`}><a href="#custom">Custom Render</a></h2>
        <p className={`${PAGE}__section-desc`}>
          The render-prop pattern lets you use any element as the trigger. Here are examples
          with icon-only buttons and styled text links.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <CopyButtonComponent value="https://ui-kit.dev">
              {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                <button onClick={copy} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: copied ? 'var(--success)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm, 0.875rem)', display: 'flex',
                  alignItems: 'center', gap: '0.375rem', padding: '0.5rem',
                  transition: 'color 0.15s ease',
                }}>
                  <Icon name={copied ? 'check' : 'link'} size="sm" />
                  {copied ? 'Link copied!' : 'Copy link'}
                </button>
              )}
            </CopyButtonComponent>
            <span className={`${PAGE}__item-label`}>text link style</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <CopyButtonComponent value="console.log('hello')">
              {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                <span onClick={copy} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') copy() }}
                  style={{
                    cursor: 'pointer', padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: copied ? 'oklch(55% 0.15 145 / 0.15)' : 'oklch(0% 0 0 / 0.15)',
                    color: copied ? 'var(--success)' : 'var(--text-primary)',
                    fontFamily: 'monospace', fontSize: 'var(--text-sm, 0.875rem)',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}>
                  {copied ? 'Copied!' : "console.log('hello')"}
                </span>
              )}
            </CopyButtonComponent>
            <span className={`${PAGE}__item-label`}>inline code click-to-copy</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <CopyButtonComponent value="user@example.com">
              {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                <Button size="sm" variant={copied ? 'primary' : 'ghost'} onClick={copy}
                  icon={<Icon name={copied ? 'check-circle' : 'mail'} size="sm" />}>
                  {copied ? 'Email copied!' : 'user@example.com'}
                </Button>
              )}
            </CopyButtonComponent>
            <span className={`${PAGE}__item-label`}>email copy button</span>
          </div>
        </div>
      </section>

      {/* ── 5. Weight Tiers ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Choose the right balance of features and bundle size. All three tiers share the same
          render-prop API surface (Lite omits motion prop).
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
              <span className={`${PAGE}__tier-size`}>~0.3 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No motion animations, minimal overhead.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} CopyButton {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteCopyButton value="Lite tier demo">
                {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                  <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </LiteCopyButton>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
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
              <span className={`${PAGE}__tier-size`}>~1.2 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Full-featured with motion levels, size variants,
              copied-state styling, and accessibility.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} CopyButton {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <CopyButton value="Standard tier demo">
                {({ copied, copy }) => (
                  <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}
                    icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CopyButton>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
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
              <span className={`${PAGE}__tier-size`}>~1.5 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Everything in Standard plus aurora glow effects,
              spring animations, and shimmer on copied state.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} CopyButton {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumCopyButton value="Premium tier demo">
                {({ copied, copy }: { copied: boolean; copy: () => void }) => (
                  <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}
                    icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </PremiumCopyButton>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to see the copy button update in real-time. The theme generates
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
          <div className={`${PAGE}__color-presets`}>
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`${PAGE}__color-preset${brandColor === p.hex ? ` ${PAGE}__color-preset--active` : ''}`}
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

      {/* ── 7. Props API ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#props">Props API</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          All props accepted by CopyButton. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Built on the native {'<button>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className={`${PAGE}__a11y-key`}>Enter</code> and <code className={`${PAGE}__a11y-key`}>Space</code> keys.
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
                <strong>ARIA Label:</strong> Announces <code className={`${PAGE}__a11y-key`}>aria-label="Copy to clipboard"</code> and switches to <code className={`${PAGE}__a11y-key`}>"Copied"</code> on success.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All states meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
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
                <strong>High contrast:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className={`${PAGE}__a11y-key`}>prefers-reduced-motion</code> and per-component motion control.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ─────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/copy-button.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/copy-button.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/copy-button.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/copy-button.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/copy-button.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/copy-button.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
