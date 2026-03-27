'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Sheet } from '@ui/components/sheet'
import { Sheet as LiteSheet } from '@ui/lite/sheet'
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
    @scope (.sheet-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: sheet-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .sheet-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .sheet-page__hero::before {
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
        animation: sheet-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes sheet-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .sheet-page__hero::before { animation: none; }
      }

      .sheet-page__title {
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

      .sheet-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .sheet-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .sheet-page__import-code {
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

      .sheet-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .sheet-page__section {
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
        animation: sheet-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sheet-section-reveal {
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
        .sheet-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .sheet-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .sheet-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .sheet-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .sheet-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .sheet-page__preview {
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

      .sheet-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .sheet-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .sheet-page__playground {
          grid-template-columns: 1fr;
        }
        .sheet-page__playground-controls {
          position: static !important;
        }
      }

      @container sheet-page (max-width: 680px) {
        .sheet-page__playground {
          grid-template-columns: 1fr;
        }
        .sheet-page__playground-controls {
          position: static !important;
        }
      }

      .sheet-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .sheet-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .sheet-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .sheet-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .sheet-page__playground-controls {
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

      .sheet-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .sheet-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sheet-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .sheet-page__option-btn {
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
      .sheet-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .sheet-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .sheet-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .sheet-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .sheet-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .sheet-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .sheet-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .sheet-page__tier-card {
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

      .sheet-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sheet-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .sheet-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sheet-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .sheet-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .sheet-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .sheet-page__tier-import {
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

      .sheet-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .sheet-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .sheet-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .sheet-page__code-tabs {
        margin-block-start: 1rem;
      }

      .sheet-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .sheet-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .sheet-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .sheet-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .sheet-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .sheet-page__a11y-key {
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
        .sheet-page__hero {
          padding: 2rem 1.25rem;
        }

        .sheet-page__title {
          font-size: 1.75rem;
        }

        .sheet-page__preview {
          padding: 1.75rem;
        }

        .sheet-page__playground {
          grid-template-columns: 1fr;
        }

        .sheet-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .sheet-page__tiers {
          grid-template-columns: 1fr;
        }

        .sheet-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .sheet-page__hero {
          padding: 1.5rem 1rem;
        }

        .sheet-page__title {
          font-size: 1.5rem;
        }

        .sheet-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .sheet-page__title {
          font-size: 4rem;
        }

        .sheet-page__preview {
          padding: 3.5rem;
        }
      }

      .sheet-page__import-code,
      .sheet-page code,
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

const sheetProps: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Controls the open state of the sheet. Must be used with onClose.' },
  { name: 'onClose', type: '() => void', required: true, description: 'Callback fired when the sheet should close (escape, backdrop click, swipe).' },
  { name: 'side', type: "'left' | 'right' | 'bottom'", default: "'right'", description: 'Which edge of the viewport the sheet slides in from.' },
  { name: 'title', type: 'ReactNode', description: 'Title displayed in the sheet header.' },
  { name: 'description', type: 'string', description: 'Description text below the title, announced to screen readers.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls sheet width (left/right) or height (bottom).' },
  { name: 'showClose', type: 'boolean', default: 'true', description: 'Whether to show the close button in the header.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content rendered inside the sheet body.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the sheet root wrapper.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Side = 'left' | 'right' | 'bottom'
type Size = 'sm' | 'md' | 'lg'

const SIDES: Side[] = ['left', 'right', 'bottom']
const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Sheet } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Sheet } from '@annondeveloper/ui-kit'",
  premium: "import { Sheet } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="sheet-page__copy-btn"
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
    <div className="sheet-page__control-group">
      <span className="sheet-page__control-label">{label}</span>
      <div className="sheet-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`sheet-page__option-btn${opt === value ? ' sheet-page__option-btn--active' : ''}`}
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
    <label className="sheet-page__toggle-label">
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

// ─── Sheet Demo Content ───────────────────────────────────────────────────────

function SheetDemoContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm, 0.875rem)', lineHeight: 1.6 }}>
        This is the sheet body content. It scrolls independently when the content
        overflows the available height.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {['Profile Settings', 'Notifications', 'Security', 'Billing', 'Appearance'].map(item => (
          <div
            key={item}
            style={{
              padding: '0.75rem 1rem',
              background: 'oklch(100% 0 0 / 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-sm, 0.875rem)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  side: Side,
  size: Size,
  showTitle: boolean,
  showClose: boolean,
  overlay: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const liteAttrs: string[] = []
    liteAttrs.push('  open={isOpen}')
    liteAttrs.push('  onClose={() => setIsOpen(false)}')
    if (side !== 'right') liteAttrs.push(`  side="${side}"`)
    if (showTitle) liteAttrs.push('  title="Sheet Title"')

    return `${importStr}

const [isOpen, setIsOpen] = useState(false)

<button onClick={() => setIsOpen(true)}>Open Sheet</button>

<Sheet
${liteAttrs.join('\n')}
>
  <p>Sheet content here</p>
</Sheet>`
  }

  const props: string[] = []
  props.push('  open={isOpen}')
  props.push('  onClose={() => setIsOpen(false)}')
  if (side !== 'right') props.push(`  side="${side}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showTitle) {
    props.push('  title="Sheet Title"')
    props.push('  description="A description of the sheet content."')
  }
  if (!showClose) props.push('  showClose={false}')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open Sheet</Button>

<Sheet
${props.join('\n')}
>
  <p>Sheet body content here</p>
</Sheet>`
}

function generateHtmlCode(tier: Tier, side: Side, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Sheet — Lite tier -->
<dialog class="ui-lite-sheet" data-side="${side}">
  <div class="ui-lite-sheet__header">
    <h2>Sheet Title</h2>
    <button class="ui-lite-sheet__close" aria-label="Close">&times;</button>
  </div>
  <div class="ui-lite-sheet__body">
    <p>Sheet content here</p>
  </div>
</dialog>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<!-- Sheet — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/sheet.css">

<div class="ui-sheet">
  <dialog data-side="${side}" data-size="${size}">
    <div class="ui-sheet__header">
      <div class="ui-sheet__header-text">
        <h2 class="ui-sheet__title">Sheet Title</h2>
        <p class="ui-sheet__description">Description text</p>
      </div>
      <button class="ui-sheet__close" aria-label="Close">
        <svg><!-- close icon --></svg>
      </button>
    </div>
    <div class="ui-sheet__body">
      <p>Sheet content here</p>
    </div>
  </dialog>
</div>`
}

function generateVueCode(tier: Tier, side: Side, size: Size): string {
  if (tier === 'lite') {
    return `<template>
  <button @click="isOpen = true">Open Sheet</button>
  <Sheet
    :open="isOpen"
    @close="isOpen = false"
    side="${side}"
    title="Sheet Title"
  >
    <p>Sheet content</p>
  </Sheet>
</template>

<script setup>
import { ref } from 'vue'
import { Sheet } from '@annondeveloper/ui-kit/lite'
const isOpen = ref(false)
</script>`
  }

  const attrs: string[] = []
  attrs.push('    :open="isOpen"')
  attrs.push('    @close="isOpen = false"')
  if (side !== 'right') attrs.push(`    side="${side}"`)
  if (size !== 'md') attrs.push(`    size="${size}"`)
  attrs.push('    title="Sheet Title"')

  return `<template>
  <Button @click="isOpen = true">Open Sheet</Button>
  <Sheet
${attrs.join('\n')}
  >
    <p>Sheet content</p>
  </Sheet>
</template>

<script setup>
import { ref } from 'vue'
import { Sheet } from '@annondeveloper/ui-kit'
import { Button } from '@annondeveloper/ui-kit'
const isOpen = ref(false)
</script>`
}

function generateAngularCode(tier: Tier, side: Side, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<button (click)="isOpen = true">Open Sheet</button>
<dialog
  class="ui-lite-sheet"
  data-side="${side}"
  [open]="isOpen"
>
  <div class="ui-lite-sheet__header">
    <h2>Sheet Title</h2>
    <button class="ui-lite-sheet__close" (click)="isOpen = false">&times;</button>
  </div>
  <div class="ui-lite-sheet__body">
    <p>Sheet content</p>
  </div>
</dialog>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<button (click)="isOpen = true">Open Sheet</button>
<div class="ui-sheet">
  <dialog
    data-side="${side}"
    data-size="${size}"
  >
    <div class="ui-sheet__header">
      <div class="ui-sheet__header-text">
        <h2 class="ui-sheet__title">Sheet Title</h2>
      </div>
      <button class="ui-sheet__close" (click)="isOpen = false" aria-label="Close">X</button>
    </div>
    <div class="ui-sheet__body">
      <p>Sheet content</p>
    </div>
  </dialog>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/sheet.css';`
}

function generateSvelteCode(tier: Tier, side: Side, size: Size): string {
  if (tier === 'lite') {
    return `<script>
  import { Sheet } from '@annondeveloper/ui-kit/lite';
  let isOpen = false;
</script>

<button on:click={() => isOpen = true}>Open Sheet</button>

<Sheet
  open={isOpen}
  onClose={() => isOpen = false}
  side="${side}"
  title="Sheet Title"
>
  <p>Sheet content</p>
</Sheet>`
  }

  return `<script>
  import { Sheet } from '@annondeveloper/ui-kit';
  import { Button } from '@annondeveloper/ui-kit';
  let isOpen = false;
</script>

<Button on:click={() => isOpen = true}>Open Sheet</Button>

<Sheet
  open={isOpen}
  onClose={() => isOpen = false}
  side="${side}"
  size="${size}"
  title="Sheet Title"
  description="Description text"
>
  <p>Sheet content</p>
</Sheet>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [side, setSide] = useState<Side>('right')
  const [size, setSize] = useState<Size>('md')
  const [showTitle, setShowTitle] = useState(true)
  const [showClose, setShowClose] = useState(true)
  const [overlay, setOverlay] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const liteSide = side === 'bottom' ? 'right' : side

  const reactCode = useMemo(
    () => generateReactCode(tier, side, size, showTitle, showClose, overlay, motion),
    [tier, side, size, showTitle, showClose, overlay, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, side, size),
    [tier, side, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, side, size),
    [tier, side, size],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, side, size),
    [tier, side, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, side, size),
    [tier, side, size],
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

  return (
    <section className="sheet-page__section" id="playground">
      <h2 className="sheet-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="sheet-page__section-desc">
        Configure the sheet's side, size, and overlay, then open it to see the result.
        Generated code updates as you change settings.
      </p>

      <div className="sheet-page__playground">
        <div className="sheet-page__playground-preview">
          <div className="sheet-page__playground-result">
            <Button onClick={() => setSheetOpen(true)}>
              Open {side.charAt(0).toUpperCase() + side.slice(1)} Sheet
            </Button>

            {tier === 'lite' ? (
              <LiteSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                side={liteSide as 'left' | 'right'}
                title={showTitle ? 'Sheet Title' : undefined}
              >
                <SheetDemoContent />
              </LiteSheet>
            ) : (
              <Sheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                side={side}
                size={size}
                title={showTitle ? 'Sheet Title' : undefined}
                description={showTitle ? 'Configure your settings below.' : undefined}
                showClose={showClose}
                motion={motion}
              >
                <SheetDemoContent />
              </Sheet>
            )}
          </div>

          <div className="sheet-page__code-tabs">
            <div className="sheet-page__export-row">
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
              {copyStatus && <span className="sheet-page__export-status">{copyStatus}</span>}
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

        <div className="sheet-page__playground-controls">
          <OptionGroup
            label="Side"
            options={tier === 'lite' ? ['left', 'right'] as const : SIDES}
            value={tier === 'lite' ? liteSide : side}
            onChange={v => setSide(v as Side)}
          />

          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="sheet-page__control-group">
            <span className="sheet-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show title" checked={showTitle} onChange={setShowTitle} />
              {tier !== 'lite' && <Toggle label="Show close button" checked={showClose} onChange={setShowClose} />}
              {tier !== 'lite' && <Toggle label="Backdrop overlay" checked={overlay} onChange={setOverlay} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SheetPage() {
  useStyles('sheet-page', pageStyles)

  const { tier, setTier } = useTier()
  const [demoSheetSide, setDemoSheetSide] = useState<Side | null>(null)
  const [demoSheetSize, setDemoSheetSize] = useState<Size | null>(null)

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.sheet-page__section')
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
    <div className="sheet-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="sheet-page__hero">
        <h1 className="sheet-page__title">Sheet</h1>
        <p className="sheet-page__desc">
          Slide-out panel that appears from the left, right, or bottom edge of the viewport.
          Uses the native {'<dialog>'} element with backdrop, swipe-to-dismiss, and focus management.
        </p>
        <div className="sheet-page__import-row">
          <code className="sheet-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Side Directions ─────────────────────────── */}
      <section className="sheet-page__section" id="sides">
        <h2 className="sheet-page__section-title">
          <a href="#sides">Side Directions</a>
        </h2>
        <p className="sheet-page__section-desc">
          Three slide directions: left, right (default), and bottom. Left and right panels
          span the full viewport height. Bottom panels span full width with rounded top corners.
        </p>
        <div className="sheet-page__preview" style={{ gap: '1rem' }}>
          <div className="sheet-page__labeled-row" style={{ gap: '1rem' }}>
            {SIDES.map(s => (
              <div key={s} className="sheet-page__labeled-item">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDemoSheetSide(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
                <span className="sheet-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {demoSheetSide && tier !== 'lite' && (
          <Sheet
            open={!!demoSheetSide}
            onClose={() => setDemoSheetSide(null)}
            side={demoSheetSide}
            title={`${demoSheetSide.charAt(0).toUpperCase() + demoSheetSide.slice(1)} Sheet`}
            description={`This sheet slides in from the ${demoSheetSide}.`}
          >
            <SheetDemoContent />
          </Sheet>
        )}

        {demoSheetSide && tier === 'lite' && (
          <LiteSheet
            open={!!demoSheetSide}
            onClose={() => setDemoSheetSide(null)}
            side={demoSheetSide === 'bottom' ? 'right' : demoSheetSide}
            title={`${demoSheetSide.charAt(0).toUpperCase() + demoSheetSide.slice(1)} Sheet`}
          >
            <SheetDemoContent />
          </LiteSheet>
        )}
      </section>

      {/* ── 4. Sizes ──────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="sheet-page__section" id="sizes">
          <h2 className="sheet-page__section-title">
            <a href="#sizes">Size Scale</a>
          </h2>
          <p className="sheet-page__section-desc">
            Three sizes that control the width (for left/right sheets) or height (for bottom sheets).
            All sizes respect a 90vw/90dvh maximum to stay within the viewport.
          </p>
          <div className="sheet-page__preview" style={{ gap: '1rem' }}>
            <div className="sheet-page__labeled-row" style={{ gap: '1rem' }}>
              {SIZES.map(s => (
                <div key={s} className="sheet-page__labeled-item">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDemoSheetSize(s)}
                  >
                    {s}
                  </Button>
                  <span className="sheet-page__item-label">
                    {s === 'sm' ? '320px' : s === 'md' ? '400px' : '560px'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {demoSheetSize && (
            <Sheet
              open={!!demoSheetSize}
              onClose={() => setDemoSheetSize(null)}
              size={demoSheetSize}
              title={`Size: ${demoSheetSize}`}
              description={`This sheet uses the "${demoSheetSize}" size variant.`}
            >
              <SheetDemoContent />
            </Sheet>
          )}
        </section>
      )}

      {/* ── 5. Swipe to Dismiss ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="sheet-page__section" id="swipe">
          <h2 className="sheet-page__section-title">
            <a href="#swipe">Swipe to Dismiss</a>
          </h2>
          <p className="sheet-page__section-desc">
            On touch devices, users can swipe the sheet toward its origin edge to dismiss it.
            A bottom sheet shows a drag indicator handle. The swipe gesture uses the internal
            gesture engine with no external dependencies.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Swipe-to-dismiss is built-in. No additional props needed.
// Right sheet: swipe right to dismiss
// Left sheet: swipe left to dismiss
// Bottom sheet: swipe down to dismiss

<Sheet open={isOpen} onClose={() => setIsOpen(false)} side="bottom">
  <p>Swipe down to dismiss on touch devices</p>
</Sheet>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Header Variants ─────────────────────────── */}
      <section className="sheet-page__section" id="header">
        <h2 className="sheet-page__section-title">
          <a href="#header">Header Configuration</a>
        </h2>
        <p className="sheet-page__section-desc">
          The sheet header supports a title, description, and optional close button.
          Omit the title to render a headerless sheet for custom layouts.
        </p>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`// Full header
<Sheet open={isOpen} onClose={close} title="Settings" description="Manage preferences">
  <Content />
</Sheet>

// No close button
<Sheet open={isOpen} onClose={close} title="Read Only" showClose={false}>
  <Content />
</Sheet>

// No header
<Sheet open={isOpen} onClose={close}>
  <CustomHeader />
  <Content />
</Sheet>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="sheet-page__section" id="tiers">
        <h2 className="sheet-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="sheet-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses the native dialog
          with minimal JavaScript. Standard adds animation, swipe gestures, and full a11y.
        </p>

        <div className="sheet-page__tiers">
          {/* Lite */}
          <div
            className={`sheet-page__tier-card${tier === 'lite' ? ' sheet-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="sheet-page__tier-header">
              <span className="sheet-page__tier-name">Lite</span>
              <span className="sheet-page__tier-size">~0.4 KB</span>
            </div>
            <p className="sheet-page__tier-desc">
              Native dialog wrapper with left/right side support. No animation,
              no swipe gestures, no bottom sheet variant.
            </p>
            <div className="sheet-page__tier-import">
              import {'{'} Sheet {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="sheet-page__tier-preview">
              <Button variant="secondary" size="sm">Lite Sheet</Button>
            </div>
            <div className="sheet-page__size-breakdown">
              <div className="sheet-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`sheet-page__tier-card${tier === 'standard' ? ' sheet-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="sheet-page__tier-header">
              <span className="sheet-page__tier-name">Standard</span>
              <span className="sheet-page__tier-size">~3 KB</span>
            </div>
            <p className="sheet-page__tier-desc">
              Full-featured sheet with three sides, three sizes, slide animations,
              swipe-to-dismiss, backdrop blur, and ARIA labeling.
            </p>
            <div className="sheet-page__tier-import">
              import {'{'} Sheet {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sheet-page__tier-preview">
              <Button variant="primary" size="sm">Standard Sheet</Button>
            </div>
            <div className="sheet-page__size-breakdown">
              <div className="sheet-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium (maps to standard) */}
          <div
            className={`sheet-page__tier-card${tier === 'premium' ? ' sheet-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="sheet-page__tier-header">
              <span className="sheet-page__tier-name">Premium</span>
              <span className="sheet-page__tier-size">~3 KB</span>
            </div>
            <p className="sheet-page__tier-desc">
              Same as Standard for Sheet. No premium tier exists yet &mdash;
              falls back to the Standard implementation.
            </p>
            <div className="sheet-page__tier-import">
              import {'{'} Sheet {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sheet-page__tier-preview">
              <Button variant="primary" size="sm">Premium Sheet</Button>
            </div>
            <div className="sheet-page__size-breakdown">
              <div className="sheet-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="sheet-page__section" id="props">
        <h2 className="sheet-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="sheet-page__section-desc">
          All props accepted by Sheet. It also spreads native dialog HTML attributes
          onto the underlying {'<dialog>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sheetProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="sheet-page__section" id="accessibility">
        <h2 className="sheet-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="sheet-page__section-desc">
          Built on the native {'<dialog>'} element with showModal() for proper focus management.
        </p>
        <Card variant="default" padding="md">
          <ul className="sheet-page__a11y-list">
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dialog:</strong> Uses native <code className="sheet-page__a11y-key">{'<dialog>'}</code> with <code className="sheet-page__a11y-key">showModal()</code> for proper focus trapping and inert background.
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labeling:</strong> <code className="sheet-page__a11y-key">aria-labelledby</code> and <code className="sheet-page__a11y-key">aria-describedby</code> automatically linked to title and description.
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dismiss:</strong> <code className="sheet-page__a11y-key">Escape</code> key and backdrop click both close the sheet.
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch:</strong> Close button meets 44px minimum target on coarse pointer devices.
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Meets WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="sheet-page__a11y-key">forced-colors: active</code> with visible borders and close button.
              </span>
            </li>
            <li className="sheet-page__a11y-item">
              <span className="sheet-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Slide animations disabled when <code className="sheet-page__a11y-key">motion=0</code> or <code className="sheet-page__a11y-key">prefers-reduced-motion</code> is active.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
