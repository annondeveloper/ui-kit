'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { SortableList, type SortableItem } from '@ui/domain/sortable-list'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.sortable-list-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: sortable-list-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .sortable-list-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .sortable-list-page__hero::before {
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
        .sortable-list-page__hero::before { animation: none; }
      }

      .sortable-list-page__title {
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

      .sortable-list-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .sortable-list-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .sortable-list-page__import-code {
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

      .sortable-list-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .sortable-list-page__section {
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
        .sortable-list-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .sortable-list-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .sortable-list-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .sortable-list-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .sortable-list-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .sortable-list-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .sortable-list-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .sortable-list-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container sortable-list-page (max-width: 680px) {
        .sortable-list-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .sortable-list-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .sortable-list-page__playground-result {
        min-block-size: 250px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .sortable-list-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .sortable-list-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .sortable-list-page__playground-controls {
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

      .sortable-list-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .sortable-list-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sortable-list-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .sortable-list-page__option-btn {
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
      .sortable-list-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .sortable-list-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .sortable-list-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .sortable-list-page__order-info {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        margin-block-start: 0.75rem;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        word-break: break-all;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .sortable-list-page__code-tabs {
        margin-block-start: 1rem;
      }

      .sortable-list-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .sortable-list-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .sortable-list-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .sortable-list-page__tier-card {
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

      .sortable-list-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sortable-list-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .sortable-list-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sortable-list-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .sortable-list-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .sortable-list-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .sortable-list-page__tier-import {
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

      .sortable-list-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .sortable-list-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .sortable-list-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .sortable-list-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .sortable-list-page__a11y-key {
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
        .sortable-list-page__hero { padding: 2rem 1.25rem; }
        .sortable-list-page__title { font-size: 1.75rem; }
        .sortable-list-page__preview { padding: 1.5rem; }
        .sortable-list-page__playground { grid-template-columns: 1fr; }
        .sortable-list-page__tiers { grid-template-columns: 1fr; }
        .sortable-list-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .sortable-list-page__hero { padding: 1.5rem 1rem; }
        .sortable-list-page__title { font-size: 1.5rem; }
        .sortable-list-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .sortable-list-page__title { font-size: 4rem; }
        .sortable-list-page__preview { padding: 3rem; }
      }

      .sortable-list-page__import-code,
      .sortable-list-page code,
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

const sortableListProps: PropDef[] = [
  { name: 'items', type: 'SortableItem[]', required: true, description: 'Array of items with id and content. Order determines display order.' },
  { name: 'onChange', type: '(items: SortableItem[]) => void', required: true, description: 'Callback with reordered items array after a move.' },
  { name: 'handle', type: 'boolean', default: 'true', description: 'Show a drag handle grip icon on each item.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all reordering interactions.' },
  { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction. Vertical stacks items top-to-bottom.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for grab/drop transitions.' },
  { name: 'aria-label', type: 'string', default: "'Sortable list'", description: 'Accessible label for the listbox container.' },
]

const sortableItemProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the item. Used as React key.' },
  { name: 'content', type: 'ReactNode', required: true, description: 'The content rendered inside the sortable item row.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Orientation = 'vertical' | 'horizontal'

const ORIENTATIONS: Orientation[] = ['vertical', 'horizontal']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SortableList } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SortableList } from '@annondeveloper/ui-kit'",
  premium: "import { SortableList } from '@annondeveloper/ui-kit/premium'",
}

function createInitialItems(): SortableItem[] {
  return [
    { id: 'task-1', content: 'Design system tokens' },
    { id: 'task-2', content: 'Build component API' },
    { id: 'task-3', content: 'Write unit tests' },
    { id: 'task-4', content: 'Create documentation' },
    { id: 'task-5', content: 'Performance audit' },
  ]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="sortable-list-page__copy-btn"
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
    <label className="sortable-list-page__toggle-label">
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
    <div className="sortable-list-page__control-group">
      <span className="sortable-list-page__control-label">{label}</span>
      <div className="sortable-list-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`sortable-list-page__option-btn${opt === value ? ' sortable-list-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  orientation: Orientation,
  handle: boolean,
  disabled: boolean,
  motion: number,
): string {
  if (tier === 'lite') {
    return `import { SortableList } from '@annondeveloper/ui-kit/lite'

const items = [
  { id: '1', content: 'First item' },
  { id: '2', content: 'Second item' },
  { id: '3', content: 'Third item' },
]

<SortableList items={items} />`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  items={items}', '  onChange={setItems}']
  if (!handle) props.push('  handle={false}')
  if (disabled) props.push('  disabled')
  if (orientation !== 'vertical') props.push(`  orientation="${orientation}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

const [items, setItems] = useState([
  { id: '1', content: 'Design system tokens' },
  { id: '2', content: 'Build component API' },
  { id: '3', content: 'Write unit tests' },
  { id: '4', content: 'Create documentation' },
])

<SortableList
${props.join('\n')}
/>`
}

function generateHtmlCode(): string {
  return `<!-- SortableList — Lite tier (static ordered list) -->
<ol class="ui-lite-sortable-list">
  <li class="ui-lite-sortable-list__item">Design system tokens</li>
  <li class="ui-lite-sortable-list__item">Build component API</li>
  <li class="ui-lite-sortable-list__item">Write unit tests</li>
  <li class="ui-lite-sortable-list__item">Create documentation</li>
</ol>`
}

function generateVueCode(tier: Tier, orientation: Orientation, handle: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <ol class="ui-lite-sortable-list">
    <li v-for="item in items" :key="item.id" class="ui-lite-sortable-list__item">
      {{ item.content }}
    </li>
  </ol>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <SortableList
    :items="items"
    @change="items = $event"
    orientation="${orientation}"${!handle ? '\n    :handle="false"' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { SortableList } from '${importPath}'

const items = ref([
  { id: '1', content: 'Design system tokens' },
  { id: '2', content: 'Build component API' },
  { id: '3', content: 'Write unit tests' },
])
</script>`
}

function generateAngularCode(tier: Tier): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (static list) -->
<ol class="ui-lite-sortable-list">
  <li *ngFor="let item of items" class="ui-lite-sortable-list__item">
    {{ item.content }}
  </li>
</ol>

@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-sortable-list" data-orientation="vertical">
  <div role="listbox" aria-label="Sortable list" aria-orientation="vertical">
    <div *ngFor="let item of items"
      class="ui-sortable-list__item"
      role="option"
      aria-roledescription="sortable item">
      <span class="ui-sortable-list__handle" aria-hidden="true">
        <!-- Grip icon SVG -->
      </span>
      <span class="ui-sortable-list__content">{{ item.content }}</span>
    </div>
  </div>
</div>

@import '@annondeveloper/ui-kit/css/components/sortable-list.css';`
}

function generateSvelteCode(tier: Tier, orientation: Orientation, handle: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (static list) -->
<ol class="ui-lite-sortable-list">
  {#each items as item (item.id)}
    <li class="ui-lite-sortable-list__item">{item.content}</li>
  {/each}
</ol>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { SortableList } from '${importPath}';

  let items = [
    { id: '1', content: 'Design system tokens' },
    { id: '2', content: 'Build component API' },
    { id: '3', content: 'Write unit tests' },
  ];
</script>

<SortableList
  {items}
  on:change={(e) => items = e.detail}
  orientation="${orientation}"${!handle ? '\n  handle={false}' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [items, setItems] = useState<SortableItem[]>(createInitialItems)
  const [orientation, setOrientation] = useState<Orientation>('vertical')
  const [handle, setHandle] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, orientation, handle, disabled, motion),
    [tier, orientation, handle, disabled, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(), [])
  const vueCode = useMemo(() => generateVueCode(tier, orientation, handle), [tier, orientation, handle])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, orientation, handle), [tier, orientation, handle])

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
    <section className="sortable-list-page__section" id="playground">
      <h2 className="sortable-list-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="sortable-list-page__section-desc">
        Reorder items using keyboard (Alt+Arrow) or click. Toggle features and see the generated code update.
      </p>

      <div className="sortable-list-page__playground">
        <div className="sortable-list-page__playground-preview">
          <div className="sortable-list-page__playground-result">
            <SortableList
              items={items}
              onChange={setItems}
              handle={handle}
              disabled={disabled}
              orientation={orientation}
              motion={motion}
              aria-label="Task priority list"
            />
            <div className="sortable-list-page__order-info">
              Order: [{items.map(i => i.id).join(', ')}]
            </div>
          </div>

          <div className="sortable-list-page__code-tabs">
            <div className="sortable-list-page__export-row">
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
              {copyStatus && <span className="sortable-list-page__export-status">{copyStatus}</span>}
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

        <div className="sortable-list-page__playground-controls">
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="sortable-list-page__control-group">
            <span className="sortable-list-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show handle" checked={handle} onChange={setHandle} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>

          <div className="sortable-list-page__control-group">
            <span className="sortable-list-page__control-label">Actions</span>
            <div className="sortable-list-page__control-options">
              <button
                type="button"
                className="sortable-list-page__option-btn"
                onClick={() => setItems(createInitialItems())}
              >
                Reset order
              </button>
              <button
                type="button"
                className="sortable-list-page__option-btn"
                onClick={() => setItems([...items].reverse())}
              >
                Reverse
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SortableListPage() {
  useStyles('sortable-list-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.sortable-list-page__section')
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
    <div className="sortable-list-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="sortable-list-page__hero">
        <h1 className="sortable-list-page__title">SortableList</h1>
        <p className="sortable-list-page__desc">
          Keyboard-accessible reorderable list with drag handles, vertical/horizontal orientation,
          grab state management, and smooth transition animations.
        </p>
        <div className="sortable-list-page__import-row">
          <code className="sortable-list-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Keyboard Reordering ───────────────────────── */}
      <section className="sortable-list-page__section" id="keyboard">
        <h2 className="sortable-list-page__section-title">
          <a href="#keyboard">Keyboard Reordering</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Fully keyboard-accessible reordering. Focus an item, press Enter/Space to grab,
          then use Alt+Arrow to move. Press Escape to release.
        </p>
        <div className="sortable-list-page__preview">
          <KeyboardDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`// Keyboard shortcuts:
// Arrow Up/Down    — Navigate between items
// Enter / Space    — Grab / release focused item
// Alt + Arrow Up   — Move grabbed item up
// Alt + Arrow Down — Move grabbed item down
// Escape           — Release without moving
// Home             — Focus first item
// End              — Focus last item`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Horizontal Orientation ────────────────────── */}
      <section className="sortable-list-page__section" id="horizontal">
        <h2 className="sortable-list-page__section-title">
          <a href="#horizontal">Horizontal Orientation</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Switch to horizontal layout for tag reordering, column management, or horizontal priority lists.
          Uses Alt+ArrowLeft/Right for keyboard reordering in horizontal mode.
        </p>
        <div className="sortable-list-page__preview">
          <HorizontalDemo />
        </div>
      </section>

      {/* ── 5. Without Handles ───────────────────────────── */}
      <section className="sortable-list-page__section" id="no-handle">
        <h2 className="sortable-list-page__section-title">
          <a href="#no-handle">Without Handles</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Hide the drag handle grip for a cleaner look. The entire item row becomes the drag target.
        </p>
        <div className="sortable-list-page__preview">
          <NoHandleDemo />
        </div>
      </section>

      {/* ── 6. Disabled State ────────────────────────────── */}
      <section className="sortable-list-page__section" id="disabled">
        <h2 className="sortable-list-page__section-title">
          <a href="#disabled">Disabled State</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Disable all reordering interactions. Items are displayed but cannot be moved or grabbed.
        </p>
        <div className="sortable-list-page__preview">
          <DisabledDemo />
        </div>
      </section>

      {/* ── 7. Rich Content ──────────────────────────────── */}
      <section className="sortable-list-page__section" id="rich-content">
        <h2 className="sortable-list-page__section-title">
          <a href="#rich-content">Rich Content</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Item content accepts any ReactNode, allowing rich layouts with icons, badges, and metadata.
        </p>
        <div className="sortable-list-page__preview">
          <RichContentDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const items = [
  {
    id: 'task-1',
    content: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon name="check-circle" size="sm" />
        <span>Design system tokens</span>
        <Badge variant="success" size="sm">Done</Badge>
      </div>
    )
  },
  // ...
]`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="sortable-list-page__section" id="tiers">
        <h2 className="sortable-list-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Choose the right balance of features and bundle size. Lite is a static ordered list,
          Standard adds keyboard reordering.
        </p>

        <div className="sortable-list-page__tiers">
          <div
            className={`sortable-list-page__tier-card${tier === 'lite' ? ' sortable-list-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="sortable-list-page__tier-header">
              <span className="sortable-list-page__tier-name">Lite</span>
              <span className="sortable-list-page__tier-size">~0.2 KB</span>
            </div>
            <p className="sortable-list-page__tier-desc">
              Static ordered list with CSS styling. No reordering, no keyboard interaction.
              Useful for read-only priority displays.
            </p>
            <div className="sortable-list-page__tier-import">
              import {'{'} SortableList {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="sortable-list-page__tier-preview">
              <Button size="sm" variant="secondary" onClick={() => setTier('lite')}>Select Lite</Button>
            </div>
          </div>

          <div
            className={`sortable-list-page__tier-card${tier === 'standard' ? ' sortable-list-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="sortable-list-page__tier-header">
              <span className="sortable-list-page__tier-name">Standard</span>
              <span className="sortable-list-page__tier-size">~3.0 KB</span>
            </div>
            <p className="sortable-list-page__tier-desc">
              Full sortable list with keyboard reordering, grab state, focus management,
              drag handles, orientation support, and ARIA roledescription.
            </p>
            <div className="sortable-list-page__tier-import">
              import {'{'} SortableList {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sortable-list-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('standard')}>Select Standard</Button>
            </div>
          </div>

          <div
            className={`sortable-list-page__tier-card${tier === 'premium' ? ' sortable-list-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="sortable-list-page__tier-header">
              <span className="sortable-list-page__tier-name">Premium</span>
              <span className="sortable-list-page__tier-size">~5.5 KB</span>
            </div>
            <p className="sortable-list-page__tier-desc">
              Everything in Standard plus pointer drag-and-drop, spring-animated FLIP transitions,
              drop placeholder preview, and touch gesture support with haptic feedback.
            </p>
            <div className="sortable-list-page__tier-import">
              import {'{'} SortableList {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="sortable-list-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('premium')}>Select Premium</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. SortableList Props ────────────────────────── */}
      <section className="sortable-list-page__section" id="props">
        <h2 className="sortable-list-page__section-title">
          <a href="#props">SortableList Props</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          All props accepted by SortableList. It also spreads any native div HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sortableListProps} />
        </Card>
      </section>

      {/* ── 10. SortableItem Definition ──────────────────── */}
      <section className="sortable-list-page__section" id="sortable-item">
        <h2 className="sortable-list-page__section-title">
          <a href="#sortable-item">SortableItem Definition</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Each item in the items array accepts these properties.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sortableItemProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="sortable-list-page__section" id="accessibility">
        <h2 className="sortable-list-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="sortable-list-page__section-desc">
          Implements an accessible sortable list with ARIA roles and keyboard reordering.
        </p>
        <Card variant="default" padding="md">
          <ul className="sortable-list-page__a11y-list">
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA roles:</strong> Uses <code className="sortable-list-page__a11y-key">role="listbox"</code> with <code className="sortable-list-page__a11y-key">role="option"</code> items and <code className="sortable-list-page__a11y-key">aria-roledescription="sortable item"</code>.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Grab state:</strong> Selected (grabbed) items use <code className="sortable-list-page__a11y-key">aria-selected="true"</code> for screen reader announcements.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard reorder:</strong> <code className="sortable-list-page__a11y-key">Alt+Arrow</code> moves items. <code className="sortable-list-page__a11y-key">Enter/Space</code> grabs. <code className="sortable-list-page__a11y-key">Escape</code> releases.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roving tabindex:</strong> Only the focused item receives <code className="sortable-list-page__a11y-key">tabIndex=0</code>. Arrow keys navigate between items.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Focused items show a brand-colored ring via <code className="sortable-list-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Disabled list prevents all interaction with <code className="sortable-list-page__a11y-key">aria-disabled</code>.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Items and handles enforce 44px minimum on touch devices.
              </span>
            </li>
            <li className="sortable-list-page__a11y-item">
              <span className="sortable-list-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="sortable-list-page__a11y-key">forced-colors: active</code> with visible borders and Highlight outlines.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Demo Sub-components ─────────────────────────────────────────────────────

function KeyboardDemo() {
  const [items, setItems] = useState<SortableItem[]>([
    { id: 'kb-1', content: 'Focus me and press Enter to grab' },
    { id: 'kb-2', content: 'Then use Alt+Arrow to reorder' },
    { id: 'kb-3', content: 'Press Escape to release' },
    { id: 'kb-4', content: 'Or Enter to drop in place' },
  ])

  return (
    <div style={{ maxInlineSize: '450px' }}>
      <SortableList
        items={items}
        onChange={setItems}
        aria-label="Keyboard demo list"
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
        Order: [{items.map(i => i.id).join(', ')}]
      </p>
    </div>
  )
}

function HorizontalDemo() {
  const [items, setItems] = useState<SortableItem[]>([
    { id: 'h-1', content: 'Alpha' },
    { id: 'h-2', content: 'Beta' },
    { id: 'h-3', content: 'Gamma' },
    { id: 'h-4', content: 'Delta' },
  ])

  return (
    <div>
      <SortableList
        items={items}
        onChange={setItems}
        orientation="horizontal"
        aria-label="Horizontal demo list"
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
        Uses Alt+ArrowLeft/Right for keyboard reordering in horizontal mode.
      </p>
    </div>
  )
}

function NoHandleDemo() {
  const [items, setItems] = useState<SortableItem[]>([
    { id: 'nh-1', content: 'Clean item without grip icon' },
    { id: 'nh-2', content: 'Entire row is the target' },
    { id: 'nh-3', content: 'Minimalist design' },
  ])

  return (
    <div style={{ maxInlineSize: '450px' }}>
      <SortableList
        items={items}
        onChange={setItems}
        handle={false}
        aria-label="No handle demo list"
      />
    </div>
  )
}

function DisabledDemo() {
  const [items] = useState<SortableItem[]>([
    { id: 'dis-1', content: 'This list is disabled' },
    { id: 'dis-2', content: 'Items cannot be moved' },
    { id: 'dis-3', content: 'Read-only display' },
  ])

  return (
    <div style={{ maxInlineSize: '450px' }}>
      <SortableList
        items={items}
        onChange={() => {}}
        disabled
        aria-label="Disabled demo list"
      />
    </div>
  )
}

function RichContentDemo() {
  const [items, setItems] = useState<SortableItem[]>([
    {
      id: 'rich-1',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <Icon name="check-circle" size="sm" />
          <span style={{ flex: 1 }}>Design system tokens</span>
          <span style={{ fontSize: '0.6875rem', background: 'oklch(72% 0.19 155 / 0.15)', color: 'oklch(72% 0.19 155)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>Done</span>
        </div>
      ),
    },
    {
      id: 'rich-2',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <Icon name="clock" size="sm" />
          <span style={{ flex: 1 }}>Build component API</span>
          <span style={{ fontSize: '0.6875rem', background: 'oklch(80% 0.16 80 / 0.15)', color: 'oklch(80% 0.16 80)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>In Progress</span>
        </div>
      ),
    },
    {
      id: 'rich-3',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <Icon name="circle" size="sm" />
          <span style={{ flex: 1 }}>Write documentation</span>
          <span style={{ fontSize: '0.6875rem', background: 'oklch(70% 0 0 / 0.1)', color: 'oklch(70% 0 0)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>Todo</span>
        </div>
      ),
    },
    {
      id: 'rich-4',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <Icon name="alert-triangle" size="sm" />
          <span style={{ flex: 1 }}>Performance audit</span>
          <span style={{ fontSize: '0.6875rem', background: 'oklch(65% 0.25 25 / 0.15)', color: 'oklch(65% 0.25 25)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>Blocked</span>
        </div>
      ),
    },
  ])

  return (
    <div style={{ maxInlineSize: '500px' }}>
      <SortableList
        items={items}
        onChange={setItems}
        aria-label="Rich content demo list"
      />
    </div>
  )
}
