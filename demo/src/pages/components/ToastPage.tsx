'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { ToastProvider, useToast } from '@ui/domain/toast'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.toast-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: toast-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .toast-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .toast-page__hero::before {
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
        .toast-page__hero::before { animation: none; }
      }

      .toast-page__title {
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

      .toast-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .toast-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .toast-page__import-code {
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

      .toast-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .toast-page__section {
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
        .toast-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .toast-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .toast-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .toast-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .toast-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .toast-page__preview {
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

      .toast-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .toast-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .toast-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container toast-page (max-width: 680px) {
        .toast-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .toast-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .toast-page__playground-result {
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

      .toast-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .toast-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .toast-page__playground-controls {
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

      .toast-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .toast-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .toast-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .toast-page__option-btn {
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
      .toast-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .toast-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .toast-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .toast-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .toast-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .toast-page__code-tabs {
        margin-block-start: 1rem;
      }

      .toast-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .toast-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .toast-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .toast-page__tier-card {
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

      .toast-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .toast-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .toast-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .toast-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .toast-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .toast-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .toast-page__tier-import {
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

      .toast-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .toast-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .toast-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .toast-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .toast-page__a11y-key {
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
        .toast-page__hero {
          padding: 2rem 1.25rem;
        }
        .toast-page__title {
          font-size: 1.75rem;
        }
        .toast-page__preview {
          padding: 1.75rem;
        }
        .toast-page__playground {
          grid-template-columns: 1fr;
        }
        .toast-page__tiers {
          grid-template-columns: 1fr;
        }
        .toast-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .toast-page__hero {
          padding: 1.5rem 1rem;
        }
        .toast-page__title {
          font-size: 1.5rem;
        }
        .toast-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .toast-page__title {
          font-size: 4rem;
        }
        .toast-page__preview {
          padding: 3.5rem;
        }
      }

      .toast-page__import-code,
      .toast-page code,
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

const toastProviderProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Application content that can access the toast API via useToast().' },
  { name: 'position', type: "'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'", default: "'top-right'", description: 'Where toasts appear on screen.' },
  { name: 'maxVisible', type: 'number', default: '5', description: 'Maximum number of toasts visible at once. Additional toasts are queued.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
]

const toastOptionsProps: PropDef[] = [
  { name: 'title', type: 'string', required: true, description: 'The main toast message.' },
  { name: 'description', type: 'string', description: 'Optional secondary descriptive text below the title.' },
  { name: 'variant', type: "'default' | 'success' | 'warning' | 'error' | 'info'", default: "'default'", description: 'Visual style with colored left border and auto-icon.' },
  { name: 'duration', type: 'number', default: '5000', description: 'Auto-dismiss time in ms. Set to 0 for persistent toast.' },
  { name: 'action', type: '{ label: string; onClick: () => void }', description: 'Optional action button rendered inside the toast.' },
  { name: 'dismissible', type: 'boolean', default: 'true', description: 'Whether the close button is shown.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon element. Overrides the default variant icon.' },
  { name: 'id', type: 'string', description: 'Custom ID for deduplication. Toasts with the same ID replace each other.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type Position = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

const VARIANTS: ToastVariant[] = ['default', 'success', 'warning', 'error', 'info']
const POSITIONS: Position[] = ['top-right', 'top-center', 'bottom-right', 'bottom-center']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Toast } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ToastProvider, useToast } from '@annondeveloper/ui-kit'",
  premium: "import { ToastProvider, useToast } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="toast-page__copy-btn"
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
    <div className="toast-page__control-group">
      <span className="toast-page__control-label">{label}</span>
      <div className="toast-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`toast-page__option-btn${opt === value ? ' toast-page__option-btn--active' : ''}`}
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
    <label className="toast-page__toggle-label">
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
  variant: ToastVariant,
  position: Position,
  title: string,
  description: string,
  duration: number,
  dismissible: boolean,
  hasAction: boolean,
): string {
  if (tier === 'lite') {
    return `import { Toast } from '@annondeveloper/ui-kit/lite'

<Toast
  title="${title}"${description ? `\n  description="${description}"` : ''}
  variant="${variant}"${!dismissible ? '' : '\n  onClose={() => setVisible(false)}'}
/>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const opts: string[] = [`    title: '${title}'`]
  if (description) opts.push(`    description: '${description}'`)
  if (variant !== 'default') opts.push(`    variant: '${variant}'`)
  if (duration !== 5000) opts.push(`    duration: ${duration}`)
  if (!dismissible) opts.push(`    dismissible: false`)
  if (hasAction) opts.push(`    action: { label: 'Undo', onClick: () => handleUndo() }`)

  return `${importStr}

// Wrap your app in ToastProvider
<ToastProvider position="${position}">
  <App />
</ToastProvider>

// Then use the hook anywhere
function MyComponent() {
  const { toast } = useToast()

  return (
    <button onClick={() => toast({
${opts.join(',\n')}
    })}>
      Show Toast
    </button>
  )
}`
}

function generateHtmlCode(variant: ToastVariant, title: string, description: string): string {
  return `<!-- Toast — @annondeveloper/ui-kit lite tier (CSS-only) -->
<div class="ui-lite-toast" data-variant="${variant}" role="status" aria-live="polite">
  <div class="ui-lite-toast__content">
    <strong>${title}</strong>${description ? `\n    <p>${description}</p>` : ''}
  </div>
  <button class="ui-lite-toast__close" aria-label="Close">&times;</button>
</div>`
}

function generateVueCode(tier: Tier, variant: ToastVariant, title: string, description: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-toast" data-variant="${variant}" role="status" aria-live="polite">
    <div class="ui-lite-toast__content">
      <strong>${title}</strong>${description ? `\n      <p>${description}</p>` : ''}
    </div>
    <button class="ui-lite-toast__close" @click="visible = false" aria-label="Close">&times;</button>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<template>
  <ToastProvider position="top-right">
    <button @click="showToast">Show Toast</button>
  </ToastProvider>
</template>

<script setup>
import { ToastProvider, useToast } from '@annondeveloper/ui-kit'

const { toast } = useToast()

function showToast() {
  toast({
    title: '${title}',${description ? `\n    description: '${description}',` : ''}
    variant: '${variant}'
  })
}
</script>`
}

function generateAngularCode(tier: Tier, variant: ToastVariant, title: string, description: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-toast" data-variant="${variant}" role="status" aria-live="polite">
  <div class="ui-lite-toast__content">
    <strong>${title}</strong>${description ? `\n    <p>${description}</p>` : ''}
  </div>
  <button class="ui-lite-toast__close" (click)="dismiss()" aria-label="Close">&times;</button>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Use the CSS-only approach or React wrapper -->
<div class="ui-toast-container" data-position="top-right">
  <div class="ui-toast" data-variant="${variant}" role="status" aria-live="polite">
    <div class="ui-toast__content">
      <p class="ui-toast__title">${title}</p>${description ? `\n      <p class="ui-toast__description">${description}</p>` : ''}
    </div>
    <button class="ui-toast__close" (click)="dismiss()" aria-label="Dismiss">&times;</button>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/toast.css';`
}

function generateSvelteCode(tier: Tier, variant: ToastVariant, title: string, description: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-toast" data-variant="${variant}" role="status" aria-live="polite">
  <div class="ui-lite-toast__content">
    <strong>${title}</strong>${description ? `\n    <p>${description}</p>` : ''}
  </div>
  <button class="ui-lite-toast__close" on:click={() => visible = false} aria-label="Close">&times;</button>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<script>
  import { ToastProvider, useToast } from '@annondeveloper/ui-kit';

  const { toast } = useToast();

  function showToast() {
    toast({
      title: '${title}',${description ? `\n      description: '${description}',` : ''}
      variant: '${variant}'
    });
  }
</script>

<ToastProvider position="top-right">
  <button on:click={showToast}>Show Toast</button>
</ToastProvider>`
}

// ─── Toast Trigger Buttons (inside ToastProvider) ─────────────────────────────

function ToastTriggers({ variant }: { variant: ToastVariant }) {
  const { toast } = useToast()
  return (
    <Button
      variant={variant === 'error' ? 'danger' : 'primary'}
      onClick={() => toast({
        title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} notification`,
        description: `This is a ${variant} toast message.`,
        variant,
      })}
    >
      {variant.charAt(0).toUpperCase() + variant.slice(1)}
    </Button>
  )
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<ToastVariant>('success')
  const [position, setPosition] = useState<Position>('top-right')
  const [title, setTitle] = useState('Changes saved')
  const [description, setDescription] = useState('Your file has been saved successfully.')
  const [duration, setDuration] = useState(5000)
  const [dismissible, setDismissible] = useState(true)
  const [hasAction, setHasAction] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const { toast, dismissAll } = useToast()

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, position, title, description, duration, dismissible, hasAction),
    [tier, variant, position, title, description, duration, dismissible, hasAction],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(variant, title, description),
    [variant, title, description],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, title, description),
    [tier, variant, title, description],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, title, description),
    [tier, variant, title, description],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, title, description),
    [tier, variant, title, description],
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

  const handleShowToast = useCallback(() => {
    toast({
      title,
      description: description || undefined,
      variant,
      duration,
      dismissible,
      action: hasAction ? { label: 'Undo', onClick: () => {} } : undefined,
    })
  }, [toast, title, description, variant, duration, dismissible, hasAction])

  return (
    <section className="toast-page__section" id="playground">
      <h2 className="toast-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="toast-page__section-desc">
        Tweak every option and trigger toasts in real-time. The generated code updates as you change settings.
      </p>

      <div className="toast-page__playground">
        <div className="toast-page__playground-preview">
          <div className="toast-page__playground-result">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="primary" onClick={handleShowToast}>
                Show Toast
              </Button>
              <Button variant="secondary" onClick={dismissAll}>
                Dismiss All
              </Button>
            </div>
          </div>

          <div className="toast-page__code-tabs">
            <div className="toast-page__export-row">
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
              {copyStatus && <span className="toast-page__export-status">{copyStatus}</span>}
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

        <div className="toast-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Position" options={POSITIONS} value={position} onChange={setPosition} />

          <div className="toast-page__control-group">
            <span className="toast-page__control-label">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="toast-page__text-input"
              placeholder="Toast title..."
            />
          </div>

          <div className="toast-page__control-group">
            <span className="toast-page__control-label">Description</span>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="toast-page__text-input"
              placeholder="Optional description..."
            />
          </div>

          <OptionGroup
            label="Duration"
            options={['0', '3000', '5000', '8000'] as const}
            value={String(duration) as '0' | '3000' | '5000' | '8000'}
            onChange={v => setDuration(Number(v))}
          />

          <div className="toast-page__control-group">
            <span className="toast-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Dismissible" checked={dismissible} onChange={setDismissible} />
              <Toggle label="Action button" checked={hasAction} onChange={setHasAction} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ToastPage() {
  useStyles('toast-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.toast-page__section')
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
    <ToastProvider position="top-right" maxVisible={5}>
      <div className="toast-page">
        {/* ── 1. Hero Header ──────────────────────────────── */}
        <div className="toast-page__hero">
          <h1 className="toast-page__title">Toast</h1>
          <p className="toast-page__desc">
            Non-intrusive notification system with variant styles, auto-dismiss, pause-on-hover,
            action buttons, and position control. Context-based API via useToast() hook.
          </p>
          <div className="toast-page__import-row">
            <code className="toast-page__import-code">{IMPORT_STRINGS[tier]}</code>
            <CopyButton text={IMPORT_STRINGS[tier]} />
          </div>
        </div>

        {/* ── 2. Live Playground ──────────────────────────── */}
        <PlaygroundSection tier={tier} />

        {/* ── 3. All Variants ────────────────────────────── */}
        <section className="toast-page__section" id="variants">
          <h2 className="toast-page__section-title">
            <a href="#variants">Variants</a>
          </h2>
          <p className="toast-page__section-desc">
            Five built-in variants with automatic icons and colored left borders for semantic meaning.
          </p>
          <div className="toast-page__preview">
            {VARIANTS.map(v => (
              <ToastTriggers key={v} variant={v} />
            ))}
          </div>
        </section>

        {/* ── 4. Positions ───────────────────────────────── */}
        <section className="toast-page__section" id="positions">
          <h2 className="toast-page__section-title">
            <a href="#positions">Positions</a>
          </h2>
          <p className="toast-page__section-desc">
            Four positioning options control where toasts appear on screen. Position is set on the
            ToastProvider and affects all toasts within that provider.
          </p>
          <div className="toast-page__preview">
            {POSITIONS.map(pos => (
              <PositionButton key={pos} position={pos} />
            ))}
          </div>
        </section>

        {/* ── 5. Auto-dismiss & Persistence ──────────────── */}
        <section className="toast-page__section" id="duration">
          <h2 className="toast-page__section-title">
            <a href="#duration">Auto-Dismiss &amp; Persistence</a>
          </h2>
          <p className="toast-page__section-desc">
            Toasts auto-dismiss after a configurable duration (default 5 seconds). Timer pauses on hover.
            Set duration to 0 for persistent toasts that require manual dismissal.
          </p>
          <div className="toast-page__preview">
            <DurationButtons />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Auto-dismiss after 3 seconds
toast({ title: 'Quick note', duration: 3000 })

// Persistent — must be manually dismissed
toast({ title: 'Action required', duration: 0 })

// Timer pauses automatically on mouse hover`}
              language="typescript"
            />
          </div>
        </section>

        {/* ── 6. Action Buttons ──────────────────────────── */}
        <section className="toast-page__section" id="actions">
          <h2 className="toast-page__section-title">
            <a href="#actions">Action Buttons</a>
          </h2>
          <p className="toast-page__section-desc">
            Toasts can include an action button for undo, retry, or other inline operations.
          </p>
          <div className="toast-page__preview">
            <ActionButton />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`toast({
  title: 'Item deleted',
  description: 'The file has been moved to trash.',
  variant: 'warning',
  action: {
    label: 'Undo',
    onClick: () => restoreItem()
  }
})`}
              language="typescript"
            />
          </div>
        </section>

        {/* ── 7. Deduplication ───────────────────────────── */}
        <section className="toast-page__section" id="deduplication">
          <h2 className="toast-page__section-title">
            <a href="#deduplication">Deduplication</a>
          </h2>
          <p className="toast-page__section-desc">
            Pass a custom ID to prevent duplicate toasts. Toasts with the same ID replace each other
            instead of stacking.
          </p>
          <div className="toast-page__preview">
            <DeduplicationButton />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Click multiple times — only one toast appears
toast({
  id: 'save-status',
  title: 'Saving...',
  variant: 'info',
  duration: 0
})`}
              language="typescript"
            />
          </div>
        </section>

        {/* ── 8. Weight Tiers ────────────────────────────── */}
        <section className="toast-page__section" id="tiers">
          <h2 className="toast-page__section-title">
            <a href="#tiers">Weight Tiers</a>
          </h2>
          <p className="toast-page__section-desc">
            Choose the right balance of features and bundle size. Lite is CSS-only, Standard and Premium
            include the full context-based API with auto-dismiss and queueing.
          </p>

          <div className="toast-page__tiers">
            {/* Lite */}
            <div
              className={`toast-page__tier-card${tier === 'lite' ? ' toast-page__tier-card--active' : ''}`}
              onClick={() => setTier('lite')}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
            >
              <div className="toast-page__tier-header">
                <span className="toast-page__tier-name">Lite</span>
                <span className="toast-page__tier-size">~0.2 KB</span>
              </div>
              <p className="toast-page__tier-desc">
                CSS-only static toast. No auto-dismiss, no queueing, no context API.
                Perfect for server-rendered notifications.
              </p>
              <div className="toast-page__tier-import">
                import {'{'} Toast {'}'} from '@annondeveloper/ui-kit/lite'
              </div>
              <div className="toast-page__tier-preview">
                <Button size="sm" variant="secondary" onClick={() => setTier('lite')}>Select Lite</Button>
              </div>
            </div>

            {/* Standard */}
            <div
              className={`toast-page__tier-card${tier === 'standard' ? ' toast-page__tier-card--active' : ''}`}
              onClick={() => setTier('standard')}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
            >
              <div className="toast-page__tier-header">
                <span className="toast-page__tier-name">Standard</span>
                <span className="toast-page__tier-size">~3.5 KB</span>
              </div>
              <p className="toast-page__tier-desc">
                Full toast system with ToastProvider, useToast() hook, auto-dismiss with pause-on-hover,
                deduplication, action buttons, and variant icons.
              </p>
              <div className="toast-page__tier-import">
                import {'{'} ToastProvider, useToast {'}'} from '@annondeveloper/ui-kit'
              </div>
              <div className="toast-page__tier-preview">
                <Button size="sm" variant="primary" onClick={() => setTier('standard')}>Select Standard</Button>
              </div>
            </div>

            {/* Premium */}
            <div
              className={`toast-page__tier-card${tier === 'premium' ? ' toast-page__tier-card--active' : ''}`}
              onClick={() => setTier('premium')}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
            >
              <div className="toast-page__tier-header">
                <span className="toast-page__tier-name">Premium</span>
                <span className="toast-page__tier-size">~4.2 KB</span>
              </div>
              <p className="toast-page__tier-desc">
                Everything in Standard plus spring-based entrance/exit animations,
                progress bar indicator, stacking transitions, and swipe-to-dismiss on touch.
              </p>
              <div className="toast-page__tier-import">
                import {'{'} ToastProvider, useToast {'}'} from '@annondeveloper/ui-kit/premium'
              </div>
              <div className="toast-page__tier-preview">
                <Button size="sm" variant="primary" onClick={() => setTier('premium')}>Select Premium</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. Provider Props API ──────────────────────── */}
        <section className="toast-page__section" id="provider-props">
          <h2 className="toast-page__section-title">
            <a href="#provider-props">ToastProvider Props</a>
          </h2>
          <p className="toast-page__section-desc">
            Props accepted by the ToastProvider wrapper component.
          </p>
          <Card variant="default" padding="md">
            <PropsTable props={toastProviderProps} />
          </Card>
        </section>

        {/* ── 10. Toast Options API ──────────────────────── */}
        <section className="toast-page__section" id="toast-options">
          <h2 className="toast-page__section-title">
            <a href="#toast-options">Toast Options</a>
          </h2>
          <p className="toast-page__section-desc">
            Options passed to the toast() function returned by useToast().
          </p>
          <Card variant="default" padding="md">
            <PropsTable props={toastOptionsProps} />
          </Card>
        </section>

        {/* ── 11. Accessibility ──────────────────────────── */}
        <section className="toast-page__section" id="accessibility">
          <h2 className="toast-page__section-title">
            <a href="#accessibility">Accessibility</a>
          </h2>
          <p className="toast-page__section-desc">
            Built with ARIA live regions for automatic screen reader announcements.
          </p>
          <Card variant="default" padding="md">
            <ul className="toast-page__a11y-list">
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Live regions:</strong> Uses <code className="toast-page__a11y-key">role="status"</code> with <code className="toast-page__a11y-key">aria-live="polite"</code> for non-error toasts.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Assertive errors:</strong> Error variant uses <code className="toast-page__a11y-key">aria-live="assertive"</code> to interrupt current announcements.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Dismiss button:</strong> Close button has <code className="toast-page__a11y-key">aria-label="Dismiss"</code> for screen readers.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Focus management:</strong> Action buttons are keyboard-focusable. Toast container does not trap focus.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Pause on hover:</strong> Auto-dismiss timer pauses when mouse enters the toast, giving users time to read.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Touch targets:</strong> Close and action buttons enforce 44px minimum on touch devices.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>High contrast:</strong> Supports <code className="toast-page__a11y-key">forced-colors: active</code> with visible borders.
                </span>
              </li>
              <li className="toast-page__a11y-item">
                <span className="toast-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
                <span>
                  <strong>Print:</strong> Toast container is hidden in print stylesheets.
                </span>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </ToastProvider>
  )
}

// ─── Sub-components (use toast inside ToastProvider) ──────────────────────────

function PositionButton({ position }: { position: Position }) {
  const { toast } = useToast()
  return (
    <Button
      variant="secondary"
      onClick={() => toast({
        title: `Toast at ${position}`,
        description: `This toast appears at ${position}.`,
        variant: 'info',
      })}
    >
      {position}
    </Button>
  )
}

function DurationButtons() {
  const { toast } = useToast()
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Quick flash', description: 'Gone in 2 seconds.', duration: 2000, variant: 'info' })}
      >
        2s Auto-dismiss
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Standard duration', description: 'Default 5 second timer.', variant: 'success' })}
      >
        5s (default)
      </Button>
      <Button
        variant="primary"
        onClick={() => toast({ title: 'Persistent toast', description: 'Will not auto-dismiss. Click X to close.', duration: 0, variant: 'warning' })}
      >
        Persistent (duration: 0)
      </Button>
    </>
  )
}

function ActionButton() {
  const { toast } = useToast()
  return (
    <Button
      variant="primary"
      onClick={() => toast({
        title: 'Item deleted',
        description: 'The file has been moved to trash.',
        variant: 'warning',
        duration: 8000,
        action: {
          label: 'Undo',
          onClick: () => toast({ title: 'Restored!', variant: 'success', duration: 3000 }),
        },
      })}
    >
      Delete with Undo
    </Button>
  )
}

function DeduplicationButton() {
  const { toast } = useToast()
  return (
    <Button
      variant="secondary"
      onClick={() => toast({
        id: 'save-progress',
        title: 'Saving...',
        description: 'Click multiple times — only one toast appears.',
        variant: 'info',
        duration: 4000,
      })}
    >
      Show Deduplicated Toast
    </Button>
  )
}
