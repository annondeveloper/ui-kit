'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Popover } from '@ui/components/popover'
import { Popover as LitePopover } from '@ui/lite/popover'
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
    @scope (.popover-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: popover-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .popover-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .popover-page__hero::before {
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
        animation: popover-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes popover-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .popover-page__hero::before { animation: none; }
      }

      .popover-page__title {
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

      .popover-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .popover-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .popover-page__import-code {
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

      .popover-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .popover-page__section {
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
        animation: popover-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes popover-section-reveal {
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
        .popover-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .popover-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .popover-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .popover-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .popover-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .popover-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .popover-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .popover-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .popover-page__playground {
          grid-template-columns: 1fr;
        }
        .popover-page__playground-controls {
          position: static !important;
        }
      }

      @container popover-page (max-width: 680px) {
        .popover-page__playground {
          grid-template-columns: 1fr;
        }
        .popover-page__playground-controls {
          position: static !important;
        }
      }

      .popover-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .popover-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .popover-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .popover-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .popover-page__playground-controls {
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

      .popover-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .popover-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .popover-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .popover-page__option-btn {
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
      .popover-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .popover-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .popover-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .popover-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .popover-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .popover-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .popover-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .popover-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .popover-page__tier-card {
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

      .popover-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .popover-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .popover-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .popover-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .popover-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .popover-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .popover-page__tier-import {
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

      .popover-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .popover-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .popover-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .popover-page__code-tabs {
        margin-block-start: 1rem;
      }

      .popover-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .popover-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .popover-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .popover-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .popover-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .popover-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .popover-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .popover-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Popover demo content ───────────────────────── */

      .popover-page__popover-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-inline-size: 200px;
      }

      .popover-page__popover-content h4 {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .popover-page__popover-content p {
        margin: 0;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .popover-page__hero {
          padding: 2rem 1.25rem;
        }

        .popover-page__title {
          font-size: 1.75rem;
        }

        .popover-page__preview {
          padding: 1.75rem;
        }

        .popover-page__playground {
          grid-template-columns: 1fr;
        }

        .popover-page__playground-result {
          padding: 2rem;
          min-block-size: 300px;
        }

        .popover-page__tiers {
          grid-template-columns: 1fr;
        }

        .popover-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .popover-page__hero {
          padding: 1.5rem 1rem;
        }

        .popover-page__title {
          font-size: 1.5rem;
        }

        .popover-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .popover-page__title {
          font-size: 4rem;
        }

        .popover-page__preview {
          padding: 3.5rem;
        }
      }

      .popover-page__import-code,
      .popover-page code,
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

const popoverProps: PropDef[] = [
  { name: 'content', type: 'ReactNode', required: true, description: 'The content to display inside the popover panel.' },
  { name: 'children', type: 'ReactElement', required: true, description: 'The trigger element that opens the popover on click.' },
  { name: 'open', type: 'boolean', description: 'Controlled open state. Use with onOpenChange for controlled mode.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state for uncontrolled mode.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback fired when the popover opens or closes.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Preferred placement direction relative to the trigger.' },
  { name: 'offset', type: 'number', default: '8', description: 'Distance in pixels between the trigger and popover.' },
  { name: 'arrow', type: 'boolean', default: 'true', description: 'Whether to show a directional arrow pointing to the trigger.' },
  { name: 'modal', type: 'boolean', default: 'false', description: 'When true, traps focus inside the popover panel.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the popover root.' },
  { name: 'aria-label', type: 'string', description: 'Accessible label for the popover dialog.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Placement = 'top' | 'bottom' | 'left' | 'right'

const PLACEMENTS: Placement[] = ['top', 'bottom', 'left', 'right']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Popover } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Popover } from '@annondeveloper/ui-kit'",
  premium: "import { Popover } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="popover-page__copy-btn"
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
    <div className="popover-page__control-group">
      <span className="popover-page__control-label">{label}</span>
      <div className="popover-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`popover-page__option-btn${opt === value ? ' popover-page__option-btn--active' : ''}`}
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
    <label className="popover-page__toggle-label">
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

// ─── Demo Content ─────────────────────────────────────────────────────────────

function PopoverDemoContent() {
  return (
    <div className="popover-page__popover-content">
      <h4>Popover Title</h4>
      <p>This is a popover panel with content. It can contain any React nodes.</p>
      <Button size="xs" variant="secondary">Action</Button>
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  placement: Placement,
  arrow: boolean,
  modal: boolean,
  offset: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}

<Popover
  open={isOpen}
  content={<div>Popover content here</div>}
>
  <button onClick={() => setIsOpen(!isOpen)}>
    Open Popover
  </button>
</Popover>`
  }

  const props: string[] = []
  if (placement !== 'bottom') props.push(`  placement="${placement}"`)
  if (!arrow) props.push('  arrow={false}')
  if (modal) props.push('  modal')
  if (offset !== 8) props.push(`  offset={${offset}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const contentJsx = `{
    <div>
      <h4>Popover Title</h4>
      <p>Content inside the popover.</p>
    </div>
  }`

  return `${importStr}

<Popover
  content=${contentJsx}
${props.length > 0 ? props.join('\n') + '\n' : ''}>
  <Button>Open Popover</Button>
</Popover>`
}

function generateHtmlCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- Popover — Lite tier (CSS-only) -->
<div class="ui-lite-popover">
  <button>Open Popover</button>
  <div class="ui-lite-popover__content">
    Popover content here
  </div>
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<!-- Popover — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/popover.css">

<div class="ui-popover" data-placement="${placement}">
  <div class="ui-popover__panel" role="dialog" aria-label="Popover">
    <h4>Popover Title</h4>
    <p>Content inside the popover.</p>
  </div>
  <div class="ui-popover__arrow"></div>
</div>`
}

function generateVueCode(tier: Tier, placement: Placement, arrow: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-popover">
    <button @click="isOpen = !isOpen">Open Popover</button>
    <div v-if="isOpen" class="ui-lite-popover__content">
      Popover content
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(false)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (placement !== 'bottom') attrs.push(`    placement="${placement}"`)
  if (!arrow) attrs.push('    :arrow="false"')

  return `<template>
  <Popover
    :content="popoverContent"
${attrs.length > 0 ? attrs.join('\n') + '\n' : ''}  >
    <Button>Open Popover</Button>
  </Popover>
</template>

<script setup>
import { Popover } from '${importPath}'
import { Button } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-popover">
  <button (click)="isOpen = !isOpen">Open Popover</button>
  <div *ngIf="isOpen" class="ui-lite-popover__content">
    Popover content
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<div
  class="ui-popover"
  data-placement="${placement}"
  *ngIf="isOpen"
>
  <div class="ui-popover__panel" role="dialog" aria-label="Popover">
    <h4>Popover Title</h4>
    <p>Content here</p>
  </div>
  <div class="ui-popover__arrow"></div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/popover.css';`
}

function generateSvelteCode(tier: Tier, placement: Placement, arrow: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-popover">
  <button on:click={() => isOpen = !isOpen}>Open Popover</button>
  {#if isOpen}
    <div class="ui-lite-popover__content">
      Popover content
    </div>
  {/if}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = []
  if (placement !== 'bottom') attrs.push(`  placement="${placement}"`)
  if (!arrow) attrs.push('  arrow={false}')

  return `<script>
  import { Popover } from '@annondeveloper/ui-kit';
  import { Button } from '@annondeveloper/ui-kit';
</script>

<Popover
  content={popoverContent}
${attrs.length > 0 ? attrs.join('\n') + '\n' : ''}>
  <Button>Open Popover</Button>
</Popover>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [placement, setPlacement] = useState<Placement>('bottom')
  const [arrow, setArrow] = useState(true)
  const [modal, setModal] = useState(false)
  const [offset, setOffset] = useState(8)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, placement, arrow, modal, offset, motion),
    [tier, placement, arrow, modal, offset, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, placement),
    [tier, placement],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, placement, arrow),
    [tier, placement, arrow],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, placement),
    [tier, placement],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, placement, arrow),
    [tier, placement, arrow],
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
    <section className="popover-page__section" id="playground">
      <h2 className="popover-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="popover-page__section-desc">
        Tweak placement, arrow, offset, and modal settings in real-time. The generated code updates as you change settings.
      </p>

      <div className="popover-page__playground">
        <div className="popover-page__playground-preview">
          <div className="popover-page__playground-result">
            {tier === 'lite' ? (
              <LitePopover open content={<PopoverDemoContent />}>
                <Button>Lite Popover Trigger</Button>
              </LitePopover>
            ) : (
              <Popover
                placement={placement}
                arrow={arrow}
                modal={modal}
                offset={offset}
                motion={motion}
                content={<PopoverDemoContent />}
              >
                <Button>Open Popover</Button>
              </Popover>
            )}
          </div>

          <div className="popover-page__code-tabs">
            <div className="popover-page__export-row">
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
              {copyStatus && <span className="popover-page__export-status">{copyStatus}</span>}
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

        <div className="popover-page__playground-controls">
          {tier !== 'lite' && (
            <>
              <OptionGroup label="Placement" options={PLACEMENTS} value={placement} onChange={setPlacement} />
              <OptionGroup
                label="Motion"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
              <div className="popover-page__control-group">
                <span className="popover-page__control-label">Offset (px)</span>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={offset}
                  onChange={e => setOffset(Number(e.target.value))}
                  style={{ accentColor: 'var(--brand)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{offset}px</span>
              </div>
            </>
          )}

          <div className="popover-page__control-group">
            <span className="popover-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Show arrow" checked={arrow} onChange={setArrow} />}
              {tier !== 'lite' && <Toggle label="Modal (focus trap)" checked={modal} onChange={setModal} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PopoverPage() {
  useStyles('popover-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.popover-page__section')
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
    <div className="popover-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="popover-page__hero">
        <h1 className="popover-page__title">Popover</h1>
        <p className="popover-page__desc">
          Floating panel triggered by click, with directional placement, arrow indicator,
          focus management, and click-outside dismissal. Ships in two weight tiers.
        </p>
        <div className="popover-page__import-row">
          <code className="popover-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Placement Directions ────────────────────── */}
      <section className="popover-page__section" id="placements">
        <h2 className="popover-page__section-title">
          <a href="#placements">Placement Directions</a>
        </h2>
        <p className="popover-page__section-desc">
          Four placement options position the popover relative to the trigger element.
          The popover auto-adjusts if it would overflow the viewport.
        </p>
        <div className="popover-page__preview" style={{ gap: '2rem', minBlockSize: '160px' }}>
          {tier === 'lite' ? (
            <div className="popover-page__labeled-row">
              <div className="popover-page__labeled-item">
                <Button variant="secondary" size="sm">Lite (no placement)</Button>
                <span className="popover-page__item-label">lite tier</span>
              </div>
            </div>
          ) : (
            <div className="popover-page__labeled-row" style={{ gap: '2rem' }}>
              {PLACEMENTS.map(p => (
                <div key={p} className="popover-page__labeled-item">
                  <Popover placement={p} content={<PopoverDemoContent />}>
                    <Button variant="secondary" size="sm">{p}</Button>
                  </Popover>
                  <span className="popover-page__item-label">{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Arrow Variants ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="popover-page__section" id="arrow">
          <h2 className="popover-page__section-title">
            <a href="#arrow">Arrow Control</a>
          </h2>
          <p className="popover-page__section-desc">
            Toggle the directional arrow that points from the popover toward its trigger.
            The arrow rotates to match the active placement direction.
          </p>
          <div className="popover-page__preview" style={{ gap: '2rem', minBlockSize: '140px' }}>
            <div className="popover-page__labeled-row" style={{ gap: '2rem' }}>
              <div className="popover-page__labeled-item">
                <Popover content={<PopoverDemoContent />} arrow>
                  <Button variant="secondary" size="sm">With Arrow</Button>
                </Popover>
                <span className="popover-page__item-label">arrow=true</span>
              </div>
              <div className="popover-page__labeled-item">
                <Popover content={<PopoverDemoContent />} arrow={false}>
                  <Button variant="secondary" size="sm">No Arrow</Button>
                </Popover>
                <span className="popover-page__item-label">arrow=false</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Modal Mode ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="popover-page__section" id="modal">
          <h2 className="popover-page__section-title">
            <a href="#modal">Modal Mode</a>
          </h2>
          <p className="popover-page__section-desc">
            When modal is enabled, focus is trapped inside the popover panel.
            Users must close the popover before interacting with the rest of the page.
          </p>
          <div className="popover-page__preview" style={{ minBlockSize: '140px' }}>
            <Popover content={<PopoverDemoContent />} modal>
              <Button>Modal Popover</Button>
            </Popover>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Popover content={<Content />} modal>\n  <Button>Open Modal Popover</Button>\n</Popover>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Controlled State ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="popover-page__section" id="controlled">
          <h2 className="popover-page__section-title">
            <a href="#controlled">Controlled Mode</a>
          </h2>
          <p className="popover-page__section-desc">
            Control the popover externally with the <code>open</code> and <code>onOpenChange</code> props.
            Useful when you need to close the popover from inside its content.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`const [isOpen, setIsOpen] = useState(false)

<Popover
  open={isOpen}
  onOpenChange={setIsOpen}
  content={
    <div>
      <p>Controlled popover content</p>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </div>
  }
>
  <Button>Toggle Popover</Button>
</Popover>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="popover-page__section" id="tiers">
        <h2 className="popover-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="popover-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier is CSS-only,
          while Standard includes anchor positioning, focus trap, and motion.
        </p>

        <div className="popover-page__tiers">
          {/* Lite */}
          <div
            className={`popover-page__tier-card${tier === 'lite' ? ' popover-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="popover-page__tier-header">
              <span className="popover-page__tier-name">Lite</span>
              <span className="popover-page__tier-size">~0.2 KB</span>
            </div>
            <p className="popover-page__tier-desc">
              CSS-only popover. Simple show/hide without positioning,
              focus management, or animation support.
            </p>
            <div className="popover-page__tier-import">
              import {'{'} Popover {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="popover-page__tier-preview">
              <Button variant="secondary" size="sm">Lite Trigger</Button>
            </div>
            <div className="popover-page__size-breakdown">
              <div className="popover-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`popover-page__tier-card${tier === 'standard' ? ' popover-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="popover-page__tier-header">
              <span className="popover-page__tier-name">Standard</span>
              <span className="popover-page__tier-size">~2.5 KB</span>
            </div>
            <p className="popover-page__tier-desc">
              Full-featured popover with anchor positioning, arrow, focus trap,
              click-outside, escape key, and motion levels.
            </p>
            <div className="popover-page__tier-import">
              import {'{'} Popover {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="popover-page__tier-preview">
              <Popover content={<span style={{ fontSize: '0.75rem' }}>Preview content</span>}>
                <Button variant="primary" size="sm">Standard</Button>
              </Popover>
            </div>
            <div className="popover-page__size-breakdown">
              <div className="popover-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`popover-page__tier-card${tier === 'premium' ? ' popover-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="popover-page__tier-header">
              <span className="popover-page__tier-name">Premium</span>
              <span className="popover-page__tier-size">~3-5 KB</span>
            </div>
            <p className="popover-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="popover-page__tier-import">
              import {'{'} Popover {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="popover-page__tier-preview">
              <Popover content={<span style={{ fontSize: '0.75rem' }}>Preview content</span>}>
                <Button variant="primary" size="sm">Premium</Button>
              </Popover>
            </div>
            <div className="popover-page__size-breakdown">
              <div className="popover-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="popover-page__section" id="props">
        <h2 className="popover-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="popover-page__section-desc">
          All props accepted by Popover. The trigger element receives aria-expanded, aria-haspopup,
          and aria-controls automatically.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={popoverProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="popover-page__section" id="accessibility">
        <h2 className="popover-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="popover-page__section-desc">
          Built with WAI-ARIA dialog pattern and comprehensive keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="popover-page__a11y-list">
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Trigger:</strong> Automatically receives <code className="popover-page__a11y-key">aria-expanded</code>, <code className="popover-page__a11y-key">aria-haspopup="dialog"</code>, and <code className="popover-page__a11y-key">aria-controls</code>.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dismiss:</strong> <code className="popover-page__a11y-key">Escape</code> key and click-outside both close the popover.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus trap:</strong> When <code className="popover-page__a11y-key">modal</code> is enabled, focus is trapped inside the panel and restored on close.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Panel uses <code className="popover-page__a11y-key">role="dialog"</code> with an accessible label.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Meets WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="popover-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="popover-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
            <li className="popover-page__a11y-item">
              <span className="popover-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="popover-page__a11y-key">prefers-reduced-motion</code> and <code className="popover-page__a11y-key">prefers-reduced-data</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
