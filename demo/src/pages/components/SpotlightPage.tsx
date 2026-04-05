'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Spotlight, type SpotlightAction } from '@ui/components/spotlight'
import { Spotlight as LiteSpotlight } from '@ui/lite/spotlight'
import { Spotlight as PremiumSpotlight } from '@ui/premium/spotlight'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'spotlight-page'

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
        gap: 1.5rem;
      }

      .${PAGE}__kbd {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.2em 0.5em;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(0% 0 0 / 0.15);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
      }

      .${PAGE}__last-action {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        min-block-size: 1.5em;
      }

      /* ── Playground ──────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      .${PAGE}__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .${PAGE}__playground-result {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-block-size: 200px;
        position: relative;
      }

      .${PAGE}__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
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
        gap: 0.25rem;
      }

      .${PAGE}__option-btn {
        padding: 0.25rem 0.625rem;
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        font-weight: 500;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.12s;
      }
      .${PAGE}__option-btn:hover {
        background: var(--border-subtle);
        color: var(--text-primary);
      }
      .${PAGE}__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
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
      }

      .${PAGE}__code-tabs {
        margin-block-start: 1rem;
      }

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
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
      }

      .${PAGE}__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .${PAGE}__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .${PAGE}__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .${PAGE}__tier-import {
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

      .${PAGE}__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .${PAGE}__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Accessibility ──────────────────────────────── */

      .${PAGE}__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
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
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .${PAGE}__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .${PAGE}__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .${PAGE}__hero {
          padding: 2rem 1.25rem;
        }

        .${PAGE}__title {
          font-size: 1.75rem;
        }

        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }

        .${PAGE}__tiers {
          grid-template-columns: 1fr;
        }

        .${PAGE}__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .${PAGE}__hero {
          padding: 1.5rem 1rem;
        }

        .${PAGE}__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .${PAGE}__title {
          font-size: 4rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .${PAGE}__import-code,
      .${PAGE} code,
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

// ─── Props Data ──────────────────────────────────────────────────────────────

const ACTION_PROPS: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the action.' },
  { name: 'title', type: 'string', required: true, description: 'Display title for the action.' },
  { name: 'description', type: 'string', description: 'Optional subtitle shown below the title.' },
  { name: 'icon', type: 'ReactNode', description: 'Icon element shown before the title.' },
  { name: 'group', type: 'string', description: 'Group name for categorizing actions.' },
  { name: 'keywords', type: 'string[]', description: 'Additional keywords for search matching.' },
  { name: 'onClick', type: '() => void', required: true, description: 'Callback when the action is selected.' },
]

const SPOTLIGHT_PROPS: PropDef[] = [
  { name: 'actions', type: 'SpotlightAction[]', required: true, description: 'Array of searchable actions to display.' },
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when open state changes.' },
  { name: 'shortcut', type: 'string', description: 'Keyboard shortcut to toggle the spotlight.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text for the search input.' },
  { name: 'nothingFoundMessage', type: 'string', description: 'Message shown when no actions match the query.' },
  { name: 'limit', type: 'number', description: 'Maximum number of results to show.' },
  { name: 'filter', type: '(query: string, actions: SpotlightAction[]) => SpotlightAction[]', description: 'Custom filter function to override built-in fuzzy search.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Spotlight } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Spotlight } from '@annondeveloper/ui-kit'",
  premium: "import { Spotlight } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className={`${PAGE}__copy-btn`}
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

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  placeholder: string,
  nothingFound: string,
  limit: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  actions={actions}')
  props.push('  open={open}')
  props.push('  onOpenChange={setOpen}')
  if (placeholder !== 'Search actions...') props.push(`  placeholder="${placeholder}"`)
  if (nothingFound !== 'No matching actions') props.push(`  nothingFoundMessage="${nothingFound}"`)
  if (limit !== 10) props.push(`  limit={${limit}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}
import type { SpotlightAction } from '@annondeveloper/ui-kit'

const actions: SpotlightAction[] = [
  { id: 'home', title: 'Home', description: 'Go to home page', group: 'Navigation', onClick: () => navigate('/') },
  { id: 'search', title: 'Search', description: 'Search the docs', group: 'Actions', onClick: () => openSearch() },
]

function App() {
  const [open, setOpen] = useState(false)

  return (
    <Spotlight
${props.join('\n')}
    />
  )
}`
}

function generateHtmlCode(
  tier: Tier,
  placeholder: string,
): string {
  const cssPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/spotlight.css'

  return `<!-- Spotlight — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/${cssPath}">

<!-- Spotlight is a React component; for non-React use the CSS classes: -->
<div class="ui-spotlight" role="dialog" aria-modal="true" aria-label="Search actions">
  <div class="ui-spotlight__backdrop"></div>
  <div class="ui-spotlight__overlay">
    <div class="ui-spotlight__search">
      <input
        class="ui-spotlight__input"
        type="text"
        placeholder="${placeholder}"
        role="combobox"
        aria-expanded="true"
        aria-autocomplete="list"
      />
    </div>
    <ul class="ui-spotlight__results" role="listbox">
      <li class="ui-spotlight__action" role="option">
        <span class="ui-spotlight__action-title">Home</span>
        <span class="ui-spotlight__action-desc">Go to home page</span>
      </li>
    </ul>
  </div>
</div>

<style>
  @import '${cssPath}';
</style>`
}

function generateVueCode(
  tier: Tier,
  placeholder: string,
  nothingFound: string,
  limit: number,
): string {
  const importPath = tier === 'premium'
    ? '@annondeveloper/ui-kit/premium'
    : tier === 'lite'
      ? '@annondeveloper/ui-kit/lite'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = [
    '    :actions="actions"',
    '    v-model:open="open"',
  ]
  if (placeholder !== 'Search actions...') attrs.push(`    placeholder="${placeholder}"`)
  if (nothingFound !== 'No matching actions') attrs.push(`    nothing-found-message="${nothingFound}"`)
  if (limit !== 10) attrs.push(`    :limit="${limit}"`)

  return `<template>
  <Spotlight
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { Spotlight } from '${importPath}'

const open = ref(false)
const actions = [
  { id: 'home', title: 'Home', description: 'Go to home page', group: 'Navigation', onClick: () => router.push('/') },
  { id: 'search', title: 'Search', description: 'Search the docs', group: 'Actions', onClick: () => openSearch() },
]
</script>`
}

function generateAngularCode(
  tier: Tier,
  placeholder: string,
): string {
  const cssPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/spotlight.css'

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : tier === 'lite' ? 'Lite' : 'Standard'} tier -->
<!-- Use the CSS-only approach with Angular template -->
<div
  class="ui-spotlight"
  role="dialog"
  aria-modal="true"
  aria-label="Search actions"
  *ngIf="isOpen"
>
  <div class="ui-spotlight__backdrop" (click)="close()"></div>
  <div class="ui-spotlight__overlay">
    <div class="ui-spotlight__search">
      <input
        class="ui-spotlight__input"
        type="text"
        placeholder="${placeholder}"
        [(ngModel)]="query"
        (input)="filterActions()"
        role="combobox"
        aria-expanded="true"
      />
    </div>
    <ul class="ui-spotlight__results" role="listbox">
      <li
        *ngFor="let action of filteredActions"
        class="ui-spotlight__action"
        role="option"
        (click)="selectAction(action)"
      >
        <span class="ui-spotlight__action-title">{{ action.title }}</span>
        <span class="ui-spotlight__action-desc">{{ action.description }}</span>
      </li>
    </ul>
  </div>
</div>

/* In styles.css */
@import '${cssPath}';`
}

function generateSvelteCode(
  tier: Tier,
  placeholder: string,
  nothingFound: string,
  limit: number,
): string {
  const importPath = tier === 'premium'
    ? '@annondeveloper/ui-kit/premium'
    : tier === 'lite'
      ? '@annondeveloper/ui-kit/lite'
      : '@annondeveloper/ui-kit'

  const props: string[] = [
    '  actions={actions}',
    '  bind:open',
  ]
  if (placeholder !== 'Search actions...') props.push(`  placeholder="${placeholder}"`)
  if (nothingFound !== 'No matching actions') props.push(`  nothingFoundMessage="${nothingFound}"`)
  if (limit !== 10) props.push(`  limit={${limit}}`)

  return `<script>
  import { Spotlight } from '${importPath}';

  let open = false;
  const actions = [
    { id: 'home', title: 'Home', description: 'Go to home page', group: 'Navigation', onClick: () => goto('/') },
    { id: 'search', title: 'Search', description: 'Search the docs', group: 'Actions', onClick: () => openSearch() },
  ];
</script>

<Spotlight
${props.join('\n')}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

const CODE_TABS = [
  { id: 'react', label: 'React' },
  { id: 'html', label: 'HTML/CSS' },
  { id: 'vue', label: 'Vue' },
  { id: 'angular', label: 'Angular' },
  { id: 'svelte', label: 'Svelte' },
]

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const effectiveTier = tierProp ?? contextTier

  const [placeholder, setPlaceholder] = useState('Search actions...')
  const [nothingFound, setNothingFound] = useState('No matching actions')
  const [limit, setLimit] = useState(10)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [lastAction, setLastAction] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')

  const makeAction = useCallback((id: string, title: string, desc: string, icon: string, group?: string): SpotlightAction => ({
    id,
    title,
    description: desc,
    icon: <Icon name={icon} size="sm" />,
    group,
    onClick: () => setLastAction(title),
  }), [])

  const actions: SpotlightAction[] = useMemo(() => [
    makeAction('home', 'Home', 'Go to the home page', 'home', 'Navigation'),
    makeAction('docs', 'Documentation', 'Browse component docs', 'book', 'Navigation'),
    makeAction('settings', 'Settings', 'Open application settings', 'settings', 'Navigation'),
    makeAction('new-project', 'New Project', 'Create a new project', 'plus', 'Actions'),
    makeAction('deploy', 'Deploy', 'Deploy to production', 'zap', 'Actions'),
    makeAction('invite', 'Invite Team Member', 'Send an invitation link', 'user', 'Actions'),
    makeAction('theme', 'Toggle Theme', 'Switch between light and dark mode', 'moon', 'Preferences'),
    makeAction('notifications', 'Notifications', 'Manage notification settings', 'bell', 'Preferences'),
  ], [makeAction])

  const SpotlightComponent = effectiveTier === 'lite'
    ? LiteSpotlight
    : effectiveTier === 'premium'
      ? PremiumSpotlight
      : Spotlight

  const reactCode = useMemo(
    () => generateReactCode(effectiveTier, placeholder, nothingFound, limit, motion),
    [effectiveTier, placeholder, nothingFound, limit, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(effectiveTier, placeholder),
    [effectiveTier, placeholder],
  )

  const vueCode = useMemo(
    () => generateVueCode(effectiveTier, placeholder, nothingFound, limit),
    [effectiveTier, placeholder, nothingFound, limit],
  )

  const angularCode = useMemo(
    () => generateAngularCode(effectiveTier, placeholder),
    [effectiveTier, placeholder],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(effectiveTier, placeholder, nothingFound, limit),
    [effectiveTier, placeholder, nothingFound, limit],
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

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak props and see the generated code update in real-time across 5 frameworks.
        Click "Open Spotlight" to test the live preview.
      </p>

      <div className={`${PAGE}__playground`}>
        {/* Preview area */}
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <Button onClick={() => setSpotlightOpen(true)} icon={<Icon name="search" size="sm" />}>
              Open Spotlight
            </Button>
            <p className={`${PAGE}__last-action`}>
              {lastAction ? `Selected: ${lastAction}` : 'Select an action from the spotlight...'}
            </p>
            <SpotlightComponent
              actions={actions}
              open={spotlightOpen}
              onOpenChange={setSpotlightOpen}
              placeholder={placeholder}
              nothingFoundMessage={nothingFound}
              limit={limit}
              motion={effectiveTier === 'lite' ? undefined : motion}
            />
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
                    setCopyStatus(`Copied ${CODE_TABS.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {CODE_TABS.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className={`${PAGE}__export-status`}>{copyStatus}</span>}
            </div>
            <Tabs tabs={CODE_TABS} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
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
          {effectiveTier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <OptionGroup
            label="Result Limit"
            options={['5', '8', '10', '15'] as const}
            value={String(limit)}
            onChange={v => setLimit(Number(v))}
          />

          <div className={`${PAGE}__control-group`}>
            <span className={`${PAGE}__control-label`}>Placeholder</span>
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              className={`${PAGE}__text-input`}
              placeholder="Placeholder text..."
            />
          </div>

          <div className={`${PAGE}__control-group`}>
            <span className={`${PAGE}__control-label`}>Nothing Found</span>
            <input
              type="text"
              value={nothingFound}
              onChange={e => setNothingFound(e.target.value)}
              className={`${PAGE}__text-input`}
              placeholder="No results message..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpotlightPage() {
  useStyles('spotlight-page', pageStyles)
  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll(`.${PAGE}__section`)
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
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

  const SpotlightComponent = tier === 'lite'
    ? LiteSpotlight
    : tier === 'premium'
      ? PremiumSpotlight
      : Spotlight

  const makeAction = useCallback((id: string, title: string, desc: string, icon: string, group?: string, keywords?: string[]): SpotlightAction => ({
    id,
    title,
    description: desc,
    icon: <Icon name={icon} size="sm" />,
    group,
    keywords,
    onClick: () => {},
  }), [])

  const demoActions: SpotlightAction[] = useMemo(() => [
    makeAction('home', 'Home', 'Go to the home page', 'home', 'Navigation'),
    makeAction('docs', 'Documentation', 'Browse component docs', 'book', 'Navigation'),
    makeAction('settings', 'Settings', 'Open application settings', 'settings', 'Navigation', ['preferences', 'config']),
    makeAction('new-project', 'New Project', 'Create a new project', 'plus', 'Actions'),
    makeAction('deploy', 'Deploy', 'Deploy to production', 'zap', 'Actions', ['publish', 'release']),
    makeAction('invite', 'Invite Team Member', 'Send an invitation link', 'user', 'Actions'),
    makeAction('theme', 'Toggle Theme', 'Switch between light and dark mode', 'moon', 'Preferences', ['dark', 'light']),
    makeAction('notifications', 'Notifications', 'Manage notification settings', 'bell', 'Preferences'),
  ], [makeAction])

  const [groupedOpen, setGroupedOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [limitOpen, setLimitOpen] = useState(false)

  return (
    <div className={PAGE} ref={pageRef} style={themeStyle}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Spotlight</h1>
        <p className={`${PAGE}__desc`}>
          Command palette search overlay for quick navigation and actions. Triggered by a keyboard
          shortcut, it provides fuzzy search with grouped results and keyboard navigation.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 1. Live Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 2. Grouped Actions Demo ──────────────────────── */}
      <section className={`${PAGE}__section`} id="grouped">
        <h2 className={`${PAGE}__section-title`}><a href="#grouped">Grouped Actions</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Actions with a <code>group</code> property are automatically clustered under group headers.
          Groups are rendered in the order they first appear in the actions array.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <Button onClick={() => setGroupedOpen(true)} icon={<Icon name="search" size="sm" />}>
            Open Grouped Spotlight
          </Button>
          <SpotlightComponent
            actions={demoActions}
            open={groupedOpen}
            onOpenChange={setGroupedOpen}
            placeholder="Search grouped actions..."
          />
        </div>
        <CopyBlock
          code={`const actions = [
  { id: 'home', title: 'Home', group: 'Navigation', onClick: () => navigate('/') },
  { id: 'settings', title: 'Settings', group: 'Navigation', onClick: () => navigate('/settings') },
  { id: 'deploy', title: 'Deploy', group: 'Actions', onClick: () => deploy() },
]

<Spotlight actions={actions} open={open} onOpenChange={setOpen} />`}
          language="typescript"
        />
      </section>

      {/* ── 3. Custom Placeholder & Nothing Found ────────── */}
      <section className={`${PAGE}__section`} id="custom">
        <h2 className={`${PAGE}__section-title`}><a href="#custom">Custom Messages</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Customize the placeholder text and the message shown when no actions match the search query.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <Button onClick={() => setCustomOpen(true)} icon={<Icon name="search" size="sm" />}>
            Custom Messages Demo
          </Button>
          <SpotlightComponent
            actions={demoActions}
            open={customOpen}
            onOpenChange={setCustomOpen}
            placeholder="Type a command..."
            nothingFoundMessage="Nothing here. Try a different search."
          />
        </div>
        <CopyBlock
          code={`<Spotlight
  actions={actions}
  open={open}
  onOpenChange={setOpen}
  placeholder="Type a command..."
  nothingFoundMessage="Nothing here. Try a different search."
/>`}
          language="typescript"
        />
      </section>

      {/* ── 4. Result Limit ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="limit">
        <h2 className={`${PAGE}__section-title`}><a href="#limit">Result Limit</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Use the <code>limit</code> prop to cap the number of visible results.
          Useful for performance with large action sets.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <Button onClick={() => setLimitOpen(true)} icon={<Icon name="search" size="sm" />}>
            Open (limit=3)
          </Button>
          <SpotlightComponent
            actions={demoActions}
            open={limitOpen}
            onOpenChange={setLimitOpen}
            limit={3}
            placeholder="Only 3 results shown..."
          />
        </div>
        <CopyBlock
          code={`<Spotlight actions={actions} open={open} onOpenChange={setOpen} limit={3} />`}
          language="typescript"
        />
      </section>

      {/* ── 5. Keyboard Shortcut ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="shortcut">
        <h2 className={`${PAGE}__section-title`}><a href="#shortcut">Keyboard Shortcut</a></h2>
        <p className={`${PAGE}__section-desc`}>
          The default shortcut is <kbd className={`${PAGE}__kbd`}>Cmd + K</kbd> (or Ctrl + K on Windows/Linux).
          This is configurable via the shortcut prop. The overlay supports full keyboard navigation.
        </p>
        <div className={`${PAGE}__preview`}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <kbd className={`${PAGE}__kbd`}>Cmd + K</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>open / close</span>
            <kbd className={`${PAGE}__kbd`}>Arrow Up/Down</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>navigate</span>
            <kbd className={`${PAGE}__kbd`}>Enter</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>select</span>
            <kbd className={`${PAGE}__kbd`}>Escape</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>close</span>
          </div>
        </div>
        <CopyBlock
          code={`<Spotlight
  actions={actions}
  shortcut="meta+k"   // default — Cmd+K / Ctrl+K
  open={open}
  onOpenChange={setOpen}
/>`}
          language="typescript"
        />
      </section>

      {/* ── 6. Weight Tiers ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Choose the right balance of features and bundle size. All three tiers share the same
          API surface (Lite disables motion, Premium adds aurora glow and spring animations).
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
              Minimal wrapper. Zero motion, no animations. Same fuzzy search and keyboard navigation.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Spotlight {'}'} from '@annondeveloper/ui-kit/lite'
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
              <span className={`${PAGE}__tier-size`}>~2.8 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Full-featured with motion, theming, focus trap, and accessibility.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Spotlight {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
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
              <span className={`${PAGE}__tier-size`}>~3.2 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Aurora glow on input focus, spring entrance animation, hover lift on actions.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} Spotlight {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Accessibility ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Spotlight follows WAI-ARIA combobox and dialog patterns for full keyboard and screen reader support.
        </p>
        <ul className={`${PAGE}__a11y-list`}>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>
              Opens as a modal dialog with <code className={`${PAGE}__a11y-key`}>role="dialog"</code> and
              <code className={`${PAGE}__a11y-key`}>aria-modal="true"</code>
            </span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>
              Search input uses <code className={`${PAGE}__a11y-key`}>role="combobox"</code> with
              <code className={`${PAGE}__a11y-key`}>aria-autocomplete="list"</code>
            </span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>
              Results use <code className={`${PAGE}__a11y-key`}>role="listbox"</code> with
              <code className={`${PAGE}__a11y-key`}>role="option"</code> on each action
            </span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>
              Focus is trapped within the dialog while open via <code className={`${PAGE}__a11y-key`}>useFocusTrap</code>
            </span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>
              <code className={`${PAGE}__a11y-key`}>Arrow Up/Down</code> navigates results,
              <code className={`${PAGE}__a11y-key`}>Enter</code> selects,
              <code className={`${PAGE}__a11y-key`}>Escape</code> closes
            </span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>Respects <code className={`${PAGE}__a11y-key`}>prefers-reduced-motion</code> at all tiers</span>
          </li>
          <li className={`${PAGE}__a11y-item`}>
            <Icon name="check" size="sm" className={`${PAGE}__a11y-icon`} />
            <span>Active descendant tracking with <code className={`${PAGE}__a11y-key`}>aria-activedescendant</code></span>
          </li>
        </ul>
      </section>

      {/* ── 8. SpotlightAction Props ─────────────────────── */}
      <section className={`${PAGE}__section`} id="action-props">
        <h2 className={`${PAGE}__section-title`}><a href="#action-props">SpotlightAction Interface</a></h2>
        <p className={`${PAGE}__section-desc`}>Shape of each action object in the actions array.</p>
        <Card variant="default" padding="md">
          <PropsTable props={ACTION_PROPS} />
        </Card>
      </section>

      {/* ── 9. Spotlight Props ───────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Spotlight.</p>
        <Card variant="default" padding="md">
          <PropsTable props={SPOTLIGHT_PROPS} />
        </Card>
      </section>

      {/* ── 10. Brand Color ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to preview how the Spotlight adapts to your design system.
          The aurora glow, input focus ring, and action highlights all derive from this color.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <ColorInput value={brandColor} onChange={setBrandColor} />
          <span style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-tertiary)' }}>
            Current: <code style={{ color: 'var(--text-primary)' }}>{brandColor}</code>
          </span>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              Reset
            </Button>
          )}
        </div>
      </section>

      {/* ── 11. Source Code ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source Code</a></h2>
        <p className={`${PAGE}__section-desc`}>
          View the component source on GitHub to understand the implementation details.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            className={`${PAGE}__source-link`}
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/spotlight.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" />
            Source: src/components/spotlight.tsx
          </a>
          <a
            className={`${PAGE}__source-link`}
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/spotlight.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" />
            Source: src/lite/spotlight.tsx
          </a>
          <a
            className={`${PAGE}__source-link`}
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/spotlight.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" />
            Source: src/premium/spotlight.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
