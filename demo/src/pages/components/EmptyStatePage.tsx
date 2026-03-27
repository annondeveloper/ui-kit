'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { EmptyState } from '@ui/domain/empty-state'
import { EmptyState as LiteEmptyState } from '@ui/lite/empty-state'
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
    @scope (.empty-state-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: empty-state-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .empty-state-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .empty-state-page__hero::before {
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
        animation: es-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes es-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .empty-state-page__hero::before { animation: none; }
      }

      .empty-state-page__title {
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

      .empty-state-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .empty-state-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .empty-state-page__import-code {
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

      .empty-state-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .empty-state-page__section {
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
        animation: es-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes es-section-reveal {
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
        .empty-state-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .empty-state-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .empty-state-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .empty-state-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .empty-state-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .empty-state-page__preview {
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

      .empty-state-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .empty-state-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .empty-state-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container empty-state-page (max-width: 680px) {
        .empty-state-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .empty-state-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .empty-state-page__playground-result {
        overflow-x: auto;
        min-block-size: 280px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .empty-state-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .empty-state-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .empty-state-page__playground-controls {
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

      .empty-state-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .empty-state-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .empty-state-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .empty-state-page__option-btn {
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
      .empty-state-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .empty-state-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .empty-state-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .empty-state-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .empty-state-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled items ──────────────────────────────── */

      .empty-state-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
        justify-content: center;
      }

      .empty-state-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .empty-state-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Use cases grid ────────────────────────────── */

      .empty-state-page__use-cases {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .empty-state-page__use-case {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        overflow: hidden;
      }

      .empty-state-page__use-case-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        padding: 0.5rem 1rem;
        background: var(--bg-surface);
        border-block-end: 1px solid var(--border-subtle);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .empty-state-page__use-case-content {
        padding: 1.5rem;
        min-block-size: 200px;
        display: grid;
        place-items: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .empty-state-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .empty-state-page__tier-card {
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

      .empty-state-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .empty-state-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .empty-state-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .empty-state-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .empty-state-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .empty-state-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .empty-state-page__tier-import {
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

      .empty-state-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .empty-state-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .empty-state-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .empty-state-page__code-tabs {
        margin-block-start: 1rem;
      }

      .empty-state-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .empty-state-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .empty-state-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .empty-state-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .empty-state-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .empty-state-page__a11y-key {
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
        .empty-state-page__hero { padding: 2rem 1.25rem; }
        .empty-state-page__title { font-size: 1.75rem; }
        .empty-state-page__preview { padding: 1.75rem; }
        .empty-state-page__playground { grid-template-columns: 1fr; }
        .empty-state-page__tiers { grid-template-columns: 1fr; }
        .empty-state-page__section { padding: 1.25rem; }
        .empty-state-page__use-cases { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .empty-state-page__hero { padding: 1.5rem 1rem; }
        .empty-state-page__title { font-size: 1.5rem; }
        .empty-state-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .empty-state-page__import-code,
      .empty-state-page code,
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

// ─── Props Data ───────────────────────────────────────────────────────────────

const emptyStateProps: PropDef[] = [
  { name: 'icon', type: 'ReactNode', description: 'Icon element displayed above the title. Wrapped in a container with aurora glow at motion 2+.' },
  { name: 'title', type: 'ReactNode', required: true, description: 'Main heading text. Rendered as an h3 with text-wrap: balance.' },
  { name: 'description', type: 'ReactNode', description: 'Secondary text explaining what to do next. Uses text-wrap: pretty.' },
  { name: 'action', type: 'ReactNode', description: 'Primary action element, typically a Button component.' },
  { name: 'secondaryAction', type: 'ReactNode', description: 'Secondary action element, placed alongside the primary action.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding, icon size, and typography scale. (Standard tier only.)' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 2+ uses scale entrance animation. (Standard tier only.)' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { EmptyState } from '@annondeveloper/ui-kit/lite'",
  standard: "import { EmptyState } from '@annondeveloper/ui-kit'",
  premium: "import { EmptyState } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="empty-state-page__copy-btn"
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
    <div className="empty-state-page__control-group">
      <span className="empty-state-page__control-label">{label}</span>
      <div className="empty-state-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`empty-state-page__option-btn${opt === value ? ' empty-state-page__option-btn--active' : ''}`}
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
    <label className="empty-state-page__toggle-label">
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
  showIcon: boolean,
  showDescription: boolean,
  showAction: boolean,
  showSecondary: boolean,
  motion: number,
  titleText: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = showIcon ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''
  const btnImport = showAction ? "\nimport { Button } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = []
  if (showIcon) props.push(`  icon={<Icon name="inbox" size="lg" />}`)
  props.push(`  title="${titleText}"`)
  if (showDescription) props.push(`  description="Try adjusting your search or filter to find what you're looking for."`)
  if (showAction) props.push(`  action={<Button>Create New</Button>}`)
  if (showSecondary) props.push(`  secondaryAction={<Button variant="ghost">Learn more</Button>}`)
  if (tier !== 'lite' && size !== 'md') props.push(`  size="${size}"`)
  if (tier !== 'lite' && motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}${iconImport}${btnImport}\n\n<EmptyState\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, showIcon: boolean, showDescription: boolean, titleText: string): string {
  const cls = tier === 'lite' ? 'ui-lite-empty-state' : 'ui-empty-state'
  return `<!-- EmptyState — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/empty-state.css">

<div class="${cls}" data-size="md">
  ${showIcon ? `<div class="${cls}__icon" aria-hidden="true">\n    <svg><!-- your icon --></svg>\n  </div>` : ''}
  <h3 class="${tier === 'lite' ? '' : 'ui-empty-state__title'}">${titleText}</h3>
  ${showDescription ? `<p class="${tier === 'lite' ? '' : 'ui-empty-state__description'}">Try adjusting your search.</p>` : ''}
  <div class="${tier === 'lite' ? `${cls}__action` : 'ui-empty-state__actions'}">
    <button class="ui-button" data-variant="primary">Create New</button>
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, showIcon: boolean, showAction: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <EmptyState
    ${showIcon ? ':icon="iconEl"' : ''}
    title="Nothing here yet"
    description="Get started by creating your first item."
    ${showAction ? ':action="actionEl"' : ''}
  />
</template>

<script setup>
import { EmptyState } from '@annondeveloper/ui-kit/lite'
</script>`
  }
  return `<template>
  <EmptyState
    ${showIcon ? ':icon="iconEl"' : ''}
    title="Nothing here yet"
    description="Get started by creating your first item."
    size="${size}"
    ${showAction ? ':action="actionEl"' : ''}
  />
</template>

<script setup>
import { EmptyState } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier): string {
  const cls = tier === 'lite' ? 'ui-lite-empty-state' : 'ui-empty-state'
  return `<!-- Angular — ${tier} tier -->
<div class="${cls}" data-size="md">
  <div class="${cls}__icon" aria-hidden="true">
    <!-- icon svg -->
  </div>
  <h3 ${tier !== 'lite' ? 'class="ui-empty-state__title"' : ''}>Nothing here yet</h3>
  <p ${tier !== 'lite' ? 'class="ui-empty-state__description"' : ''}>Get started by creating your first item.</p>
  <div class="${tier === 'lite' ? `${cls}__action` : 'ui-empty-state__actions'}">
    <button class="ui-button" data-variant="primary">Create New</button>
  </div>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/empty-state.css'}';`
}

function generateSvelteCode(tier: Tier, size: Size): string {
  if (tier === 'lite') {
    return `<script>
  import { EmptyState } from '@annondeveloper/ui-kit/lite';
  import { Button } from '@annondeveloper/ui-kit/lite';
</script>

<EmptyState
  title="Nothing here yet"
  description="Get started by creating your first item."
  action={<Button>Create New</Button>}
/>`
  }
  return `<script>
  import { EmptyState } from '@annondeveloper/ui-kit';
  import { Button } from '@annondeveloper/ui-kit';
  import { Icon } from '@annondeveloper/ui-kit';
</script>

<EmptyState
  icon={<Icon name="inbox" size="lg" />}
  title="Nothing here yet"
  description="Get started by creating your first item."
  size="${size}"
  action={<Button>Create New</Button>}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [size, setSize] = useState<Size>('md')
  const [showIcon, setShowIcon] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [showAction, setShowAction] = useState(true)
  const [showSecondary, setShowSecondary] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [titleText, setTitleText] = useState('No results found')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, size, showIcon, showDescription, showAction, showSecondary, motion, titleText), [tier, size, showIcon, showDescription, showAction, showSecondary, motion, titleText])
  const htmlCode = useMemo(() => generateHtmlCode(tier, showIcon, showDescription, titleText), [tier, showIcon, showDescription, titleText])
  const vueCode = useMemo(() => generateVueCode(tier, size, showIcon, showAction), [tier, size, showIcon, showAction])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size), [tier, size])

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

  const EmptyComponent = tier === 'lite' ? LiteEmptyState : EmptyState

  const emptyProps: Record<string, unknown> = {
    title: titleText,
  }
  if (showIcon) emptyProps.icon = <Icon name="inbox" size="lg" />
  if (showDescription) emptyProps.description = "Try adjusting your search or filter to find what you're looking for."
  if (showAction) emptyProps.action = <Button size="sm">Create New</Button>
  if (showSecondary) emptyProps.secondaryAction = <Button size="sm" variant="ghost">Learn more</Button>
  if (tier !== 'lite') {
    emptyProps.size = size
    emptyProps.motion = motion
  }

  return (
    <section className="empty-state-page__section" id="playground">
      <h2 className="empty-state-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="empty-state-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="empty-state-page__playground">
        <div className="empty-state-page__playground-preview">
          <div className="empty-state-page__playground-result">
            <EmptyComponent {...emptyProps as any} />
          </div>

          <div className="empty-state-page__code-tabs">
            <div className="empty-state-page__export-row">
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
              {copyStatus && <span className="empty-state-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="empty-state-page__playground-controls">
          {tier !== 'lite' && (
            <>
              <OptionGroup label="Size" options={['sm', 'md', 'lg'] as const} value={size} onChange={setSize} />
              <OptionGroup
                label="Motion"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
            </>
          )}
          <div className="empty-state-page__control-group">
            <span className="empty-state-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show icon" checked={showIcon} onChange={setShowIcon} />
              <Toggle label="Show description" checked={showDescription} onChange={setShowDescription} />
              <Toggle label="Primary action" checked={showAction} onChange={setShowAction} />
              <Toggle label="Secondary action" checked={showSecondary} onChange={setShowSecondary} />
            </div>
          </div>
          <div className="empty-state-page__control-group">
            <span className="empty-state-page__control-label">Title Text</span>
            <input
              type="text"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              className="empty-state-page__text-input"
              placeholder="Empty state title..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmptyStatePage() {
  useStyles('empty-state-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.empty-state-page__section')
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

  const EmptyComponent = tier === 'lite' ? LiteEmptyState : EmptyState

  return (
    <div className="empty-state-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="empty-state-page__hero">
        <h1 className="empty-state-page__title">EmptyState</h1>
        <p className="empty-state-page__desc">
          Placeholder component for empty views — search results, empty lists, first-run experiences.
          Includes icon, title, description, and action slots with aurora glow and scale entrance.
        </p>
        <div className="empty-state-page__import-row">
          <code className="empty-state-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Sizes ───────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="empty-state-page__section" id="sizes">
          <h2 className="empty-state-page__section-title">
            <a href="#sizes">Size Scale</a>
          </h2>
          <p className="empty-state-page__section-desc">
            Three sizes for different contexts — small for sidebar panels, medium for main content areas,
            large for full-page empty states.
          </p>
          <div className="empty-state-page__preview" style={{ flexDirection: 'column', gap: '2rem' }}>
            {(['sm', 'md', 'lg'] as const).map(s => (
              <div key={s} style={{ border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', padding: '0.25rem 0.75rem', background: 'var(--bg-surface)', borderBlockEnd: '1px dashed var(--border-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s}
                </div>
                <EmptyState
                  icon={<Icon name="inbox" size={s === 'sm' ? 'md' : 'lg'} />}
                  title={`${s.toUpperCase()} empty state`}
                  description="This is what happens when there's nothing to display."
                  action={<Button size={s === 'lg' ? 'md' : 'sm'}>Take Action</Button>}
                  size={s}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Use Cases ───────────────────────────────── */}
      <section className="empty-state-page__section" id="use-cases">
        <h2 className="empty-state-page__section-title">
          <a href="#use-cases">Common Use Cases</a>
        </h2>
        <p className="empty-state-page__section-desc">
          Real-world examples showing EmptyState in different application contexts.
        </p>
        <div className="empty-state-page__use-cases">
          <div className="empty-state-page__use-case">
            <div className="empty-state-page__use-case-label">Search — No Results</div>
            <div className="empty-state-page__use-case-content">
              <EmptyComponent
                icon={<Icon name="search" size="lg" />}
                title="No results found"
                description='Try a different search term or check your spelling.'
                action={<Button size="sm" variant="secondary">Clear search</Button>}
                {...(tier !== 'lite' ? { size: 'sm' as const } : {})}
              />
            </div>
          </div>
          <div className="empty-state-page__use-case">
            <div className="empty-state-page__use-case-label">Inbox — Empty</div>
            <div className="empty-state-page__use-case-content">
              <EmptyComponent
                icon={<Icon name="mail" size="lg" />}
                title="All caught up!"
                description="You have no unread messages. Check back later for new notifications."
                {...(tier !== 'lite' ? { size: 'sm' as const } : {})}
              />
            </div>
          </div>
          <div className="empty-state-page__use-case">
            <div className="empty-state-page__use-case-label">Project — First Run</div>
            <div className="empty-state-page__use-case-content">
              <EmptyComponent
                icon={<Icon name="folder" size="lg" />}
                title="Create your first project"
                description="Projects help you organize your work into manageable groups."
                action={<Button size="sm">New Project</Button>}
                {...(tier !== 'lite' ? { secondaryAction: <Button size="sm" variant="ghost">Import</Button>, size: 'sm' as const } : {})}
              />
            </div>
          </div>
          <div className="empty-state-page__use-case">
            <div className="empty-state-page__use-case-label">Error — Connection Lost</div>
            <div className="empty-state-page__use-case-content">
              <EmptyComponent
                icon={<Icon name="alert-triangle" size="lg" />}
                title="Connection lost"
                description="We couldn't reach the server. Check your internet connection and try again."
                action={<Button size="sm" variant="secondary">Retry</Button>}
                {...(tier !== 'lite' ? { size: 'sm' as const } : {})}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Icon + Aurora Glow ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="empty-state-page__section" id="aurora-glow">
          <h2 className="empty-state-page__section-title">
            <a href="#aurora-glow">Aurora Icon Glow</a>
          </h2>
          <p className="empty-state-page__section-desc">
            At motion level 2+, the icon container renders a subtle radial aurora glow behind it,
            using your theme's <code>--aurora-1</code> and <code>--aurora-2</code> tokens.
            This is hidden at motion levels 0-1 and in reduced-motion mode.
          </p>
          <div className="empty-state-page__preview">
            <EmptyState
              icon={<Icon name="zap" size="lg" />}
              title="Motion level 2+"
              description="The icon has a subtle aurora glow effect behind it."
              size="lg"
              motion={3}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<EmptyState\n  icon={<Icon name="zap" size="lg" />}\n  title="Aurora Glow"\n  description="Visible at motion level 2+"\n  size="lg"\n  motion={3}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Container Responsive ────────────────────── */}
      {tier !== 'lite' && (
        <section className="empty-state-page__section" id="responsive">
          <h2 className="empty-state-page__section-title">
            <a href="#responsive">Container Responsive</a>
          </h2>
          <p className="empty-state-page__section-desc">
            EmptyState uses <code>container-type: inline-size</code> for container queries.
            When placed in a narrow container (under 280px), it automatically reduces padding and icon sizes.
          </p>
          <div className="empty-state-page__preview" style={{ gap: '1.5rem', flexDirection: 'column' }}>
            <div style={{ width: '250px', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', padding: '0.25rem 0.5rem', background: 'var(--bg-surface)', borderBlockEnd: '1px dashed var(--border-subtle)' }}>250px container</div>
              <EmptyState
                icon={<Icon name="inbox" size="lg" />}
                title="Narrow container"
                description="Adapts automatically."
                action={<Button size="sm">Action</Button>}
                size="lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="empty-state-page__section" id="tiers">
        <h2 className="empty-state-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="empty-state-page__section-desc">
          Choose between a minimal Lite tier and the feature-rich Standard tier.
          Lite omits size, motion, secondaryAction, and aurora glow.
        </p>

        <div className="empty-state-page__tiers">
          {/* Lite */}
          <div
            className={`empty-state-page__tier-card${tier === 'lite' ? ' empty-state-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="empty-state-page__tier-header">
              <span className="empty-state-page__tier-name">Lite</span>
              <span className="empty-state-page__tier-size">~0.2 KB</span>
            </div>
            <p className="empty-state-page__tier-desc">
              Static empty state with icon, title, description, and single action slot.
              No size variants, no motion, no aurora glow.
            </p>
            <div className="empty-state-page__tier-import">
              import {'{'} EmptyState {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="empty-state-page__tier-preview">
              <LiteEmptyState icon={<Icon name="inbox" size="sm" />} title="Empty" description="Nothing here" />
            </div>
            <div className="empty-state-page__size-breakdown">
              <div className="empty-state-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`empty-state-page__tier-card${tier === 'standard' ? ' empty-state-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="empty-state-page__tier-header">
              <span className="empty-state-page__tier-name">Standard</span>
              <span className="empty-state-page__tier-size">~1.5 KB</span>
            </div>
            <p className="empty-state-page__tier-desc">
              Full-featured with 3 sizes, aurora icon glow, scale entrance animation,
              secondary action, container-query responsive, and motion levels.
            </p>
            <div className="empty-state-page__tier-import">
              import {'{'} EmptyState {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="empty-state-page__tier-preview">
              <EmptyState icon={<Icon name="inbox" size="sm" />} title="Empty" description="Nothing here" size="sm" />
            </div>
            <div className="empty-state-page__size-breakdown">
              <div className="empty-state-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`empty-state-page__tier-card${tier === 'premium' ? ' empty-state-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="empty-state-page__tier-header">
              <span className="empty-state-page__tier-name">Premium</span>
              <span className="empty-state-page__tier-size">~3-5 KB</span>
            </div>
            <p className="empty-state-page__tier-desc">
              Spring-bounce icon entrance, aurora glow on CTA button, and floating ambient particle dots.
            </p>
            <div className="empty-state-page__tier-import">
              import {'{'} EmptyState {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="empty-state-page__tier-preview">
              <EmptyState icon={<Icon name="inbox" size="sm" />} title="Empty" description="Nothing here" size="sm" />
            </div>
            <div className="empty-state-page__size-breakdown">
              <div className="empty-state-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="empty-state-page__section" id="props">
        <h2 className="empty-state-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="empty-state-page__section-desc">
          All props accepted by EmptyState. It also spreads any native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={emptyStateProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="empty-state-page__section" id="accessibility">
        <h2 className="empty-state-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="empty-state-page__section-desc">
          EmptyState uses semantic heading markup and handles decorative elements correctly.
        </p>
        <Card variant="default" padding="md">
          <ul className="empty-state-page__a11y-list">
            <li className="empty-state-page__a11y-item">
              <span className="empty-state-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Heading:</strong> Title is rendered as an <code className="empty-state-page__a11y-key">&lt;h3&gt;</code> for proper document structure.
              </span>
            </li>
            <li className="empty-state-page__a11y-item">
              <span className="empty-state-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative icon:</strong> Icon container has <code className="empty-state-page__a11y-key">aria-hidden="true"</code> since the title provides the meaning.
              </span>
            </li>
            <li className="empty-state-page__a11y-item">
              <span className="empty-state-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Text wrap:</strong> Title uses <code className="empty-state-page__a11y-key">text-wrap: balance</code> and description uses <code className="empty-state-page__a11y-key">text-wrap: pretty</code>.
              </span>
            </li>
            <li className="empty-state-page__a11y-item">
              <span className="empty-state-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="empty-state-page__a11y-key">prefers-reduced-motion</code> — aurora glow hidden, entrance animation disabled.
              </span>
            </li>
            <li className="empty-state-page__a11y-item">
              <span className="empty-state-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="empty-state-page__a11y-key">forced-colors: active</code> with proper text colors and hidden aurora effects.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
