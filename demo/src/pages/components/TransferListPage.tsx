'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TransferList, type TransferListItem } from '@ui/components/transfer-list'
import { TransferList as LiteTransferList } from '@ui/lite/transfer-list'
import { TransferList as PremiumTransferList } from '@ui/premium/transfer-list'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'transfer-list-page'

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
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
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

      .${PAGE}__state-display {
        margin-block-start: 1rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', monospace;
        white-space: pre-wrap;
        max-block-size: 120px;
        overflow-y: auto;
        padding: 0.75rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
      }

      /* ── Tiers ───────────────────────────────── */

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
        min-width: 0;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .${PAGE}__tier-card:hover { border-color: var(--border-default); }
      .${PAGE}__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

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
        line-height: 1.4;
      }

      .${PAGE}__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      /* ── Playground ───────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__playground { grid-template-columns: 1fr; }
        .${PAGE}__tiers { grid-template-columns: 1fr; }
      }

      .${PAGE}__playground-preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        min-block-size: 280px;
      }

      .${PAGE}__playground-preview::before {
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
        gap: 0.75rem;
      }

      .${PAGE}__playground-control {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .${PAGE}__playground-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .${PAGE}__playground-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .${PAGE}__playground-option {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        background: var(--bg-surface);
        color: var(--text-secondary);
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }

      .${PAGE}__playground-option:hover { border-color: var(--border-default); }
      .${PAGE}__playground-option--active {
        border-color: var(--brand);
        background: oklch(from var(--brand) l c h / 0.1);
        color: var(--text-primary);
      }

      .${PAGE}__playground-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__playground-toggle input[type="checkbox"] {
        accent-color: var(--brand);
      }

      .${PAGE}__playground-toggle label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
      }

      .${PAGE}__playground-code {
        margin-block-start: 1rem;
        position: relative;
      }

      .${PAGE}__playground-code-tabs {
        display: flex;
        gap: 0;
        border-block-end: 1px solid var(--border-subtle);
        margin-block-end: 0;
      }

      .${PAGE}__playground-code-tab {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.375rem 0.75rem;
        border: none;
        background: none;
        color: var(--text-tertiary);
        cursor: pointer;
        border-block-end: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }

      .${PAGE}__playground-code-tab:hover { color: var(--text-secondary); }
      .${PAGE}__playground-code-tab--active {
        color: var(--text-primary);
        border-block-end-color: var(--brand);
      }

      .${PAGE}__playground-code-block {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        line-height: 1.6;
        background: oklch(0% 0 0 / 0.2);
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        padding: 0.75rem;
        overflow-x: auto;
        white-space: pre;
        color: var(--text-primary);
        max-block-size: 200px;
      }

      .${PAGE}__playground-copy {
        position: absolute;
        inset-block-start: 0.375rem;
        inset-inline-end: 0.375rem;
      }

      /* ── Accessibility ─────────────────────── */

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
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .${PAGE}__a11y-icon {
        color: oklch(72% 0.19 155);
        flex-shrink: 0;
        margin-block-start: 0.15rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.4em;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const FRAMEWORKS: TransferListItem[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'express', label: 'Express', group: 'Backend' },
  { value: 'fastify', label: 'Fastify', group: 'Backend' },
  { value: 'nestjs', label: 'NestJS', group: 'Backend' },
  { value: 'django', label: 'Django', group: 'Backend' },
]

const TEAM_MEMBERS: TransferListItem[] = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Martinez' },
  { value: 'carol', label: 'Carol Kim' },
  { value: 'dave', label: 'Dave Johnson' },
  { value: 'eve', label: 'Eve Williams' },
  { value: 'frank', label: 'Frank Lee' },
]

// ─── Props Data ──────────────────────────────────────────────────────────────

const ITEM_PROPS: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'Unique identifier for the item.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the item.' },
  { name: 'group', type: 'string', description: 'Group name for organizing items within a panel.' },
]

const PROPS: PropDef[] = [
  { name: 'value', type: '[TransferListItem[], TransferListItem[]]', required: true, description: 'Tuple of items in the left and right panels.' },
  { name: 'onChange', type: '(value: [TransferListItem[], TransferListItem[]]) => void', required: true, description: 'Called when items are transferred between panels.' },
  { name: 'titles', type: '[string, string]', description: 'Heading labels for the left and right panels.' },
  { name: 'searchable', type: 'boolean', description: 'Shows a search input in each panel for filtering items.' },
  { name: 'showTransferAll', type: 'boolean', description: 'Shows buttons to transfer all items at once.' },
  { name: 'listHeight', type: 'number | string', description: 'Fixed height for the item lists (enables scrolling).' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Component size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

const IMPORT = "import { TransferList } from '@ui/components/transfer-list'"

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TransferList } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TransferList } from '@annondeveloper/ui-kit'",
  premium: "import { TransferList } from '@annondeveloper/ui-kit/premium'",
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: 'sm' | 'md' | 'lg',
  searchable: boolean,
  showTransferAll: boolean,
  motion: number,
): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  value={value}',
    '  onChange={setValue}',
    '  titles={[\'Available\', \'Selected\']}',
  ]
  if (size !== 'md') props.push(`  size="${size}"`)
  if (searchable) props.push('  searchable')
  if (showTransferAll) props.push('  showTransferAll')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${imp}

const [value, setValue] = useState([
  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
  [{ value: 'c', label: 'Gamma' }],
])

<TransferList
${props.join('\n')}
/>`
}

function generateHtmlExport(
  tier: Tier,
  size: 'sm' | 'md' | 'lg',
): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/transfer-list.css';`

  return `<!-- TransferList — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/transfer-list.css'}">

<div class="ui-transfer-list" data-size="${size}">
  <div class="ui-transfer-list__panel">
    <h3 class="ui-transfer-list__title">Available</h3>
    <ul class="ui-transfer-list__items">
      <li class="ui-transfer-list__item">
        <label><input type="checkbox"> Alpha</label>
      </li>
      <li class="ui-transfer-list__item">
        <label><input type="checkbox"> Beta</label>
      </li>
    </ul>
  </div>
  <div class="ui-transfer-list__controls">
    <button class="ui-transfer-list__btn">&rarr;</button>
    <button class="ui-transfer-list__btn">&larr;</button>
  </div>
  <div class="ui-transfer-list__panel">
    <h3 class="ui-transfer-list__title">Selected</h3>
    <ul class="ui-transfer-list__items">
      <li class="ui-transfer-list__item">
        <label><input type="checkbox"> Gamma</label>
      </li>
    </ul>
  </div>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(
  tier: Tier,
  size: 'sm' | 'md' | 'lg',
  searchable: boolean,
  showTransferAll: boolean,
): string {
  if (tier === 'lite') {
    return `<template>
  <TransferList
    :value="value"
    @change="value = $event"
    :titles="['Available', 'Selected']"
    size="${size}"${searchable ? '\n    searchable' : ''}${showTransferAll ? '\n    showTransferAll' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TransferList } from '@annondeveloper/ui-kit/lite'

const value = ref([
  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
  [{ value: 'c', label: 'Gamma' }],
])
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <TransferList
    :value="value"
    @change="value = $event"
    :titles="['Available', 'Selected']"
    size="${size}"${searchable ? '\n    searchable' : ''}${showTransferAll ? '\n    showTransferAll' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TransferList } from '${importPath}'

const value = ref([
  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
  [{ value: 'c', label: 'Gamma' }],
])
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: 'sm' | 'md' | 'lg',
  searchable: boolean,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '${importPath}/css/components/transfer-list.css';`

  return `<!-- Angular — ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier -->
<div class="ui-transfer-list" data-size="${size}">
  <div class="ui-transfer-list__panel">
    <h3>Available</h3>
    <ul>
      <li *ngFor="let item of available">
        <label><input type="checkbox" [(ngModel)]="item.checked"> {{ item.label }}</label>
      </li>
    </ul>${searchable ? '\n    <input type="search" placeholder="Search..." [(ngModel)]="searchLeft">' : ''}
  </div>
  <div class="ui-transfer-list__controls">
    <button (click)="transferRight()">&rarr;</button>
    <button (click)="transferLeft()">&larr;</button>
  </div>
  <div class="ui-transfer-list__panel">
    <h3>Selected</h3>
    <ul>
      <li *ngFor="let item of selected">
        <label><input type="checkbox" [(ngModel)]="item.checked"> {{ item.label }}</label>
      </li>
    </ul>
  </div>
</div>

/* In styles.css */
${cssImport}`
}

function generateSvelteCode(
  tier: Tier,
  size: 'sm' | 'md' | 'lg',
  searchable: boolean,
  showTransferAll: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier -->
<script>
  import { TransferList } from '@annondeveloper/ui-kit/lite';

  let value = [
    [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
    [{ value: 'c', label: 'Gamma' }],
  ];
</script>

<TransferList
  {value}
  on:change={(e) => value = e.detail}
  titles={['Available', 'Selected']}
  size="${size}"${searchable ? '\n  searchable' : ''}${showTransferAll ? '\n  showTransferAll' : ''}
/>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { TransferList } from '${importPath}';

  let value = [
    [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
    [{ value: 'c', label: 'Gamma' }],
  ];
</script>

<TransferList
  {value}
  on:change={(e) => value = e.detail}
  titles={['Available', 'Selected']}
  size="${size}"${searchable ? '\n  searchable' : ''}${showTransferAll ? '\n  showTransferAll' : ''}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [searchable, setSearchable] = useState(true)
  const [showTransferAll, setShowTransferAll] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')

  const [playgroundData, setPlaygroundData] = useState<[TransferListItem[], TransferListItem[]]>([
    [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
      { value: 'gamma', label: 'Gamma' },
    ],
    [
      { value: 'delta', label: 'Delta' },
    ],
  ])

  const ActiveComponent = tier === 'lite' ? LiteTransferList : tier === 'premium' ? PremiumTransferList : TransferList

  const reactCode = useMemo(
    () => generateReactCode(tier, size, searchable, showTransferAll, motion),
    [tier, size, searchable, showTransferAll, motion],
  )
  const htmlCode = useMemo(
    () => generateHtmlExport(tier, size),
    [tier, size],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, size, searchable, showTransferAll),
    [tier, size, searchable, showTransferAll],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, size, searchable),
    [tier, size, searchable],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, searchable, showTransferAll),
    [tier, size, searchable, showTransferAll],
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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopyStatus('Copied!')
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}><a href="#playground">Playground</a></h2>
      <p className={`${PAGE}__section-desc`}>
        Configure the TransferList interactively and copy the generated code for any framework.
      </p>
      <div className={`${PAGE}__playground`}>
        <div className={`${PAGE}__playground-preview`}>
          <ActiveComponent
            value={playgroundData}
            onChange={setPlaygroundData}
            titles={['Available', 'Selected']}
            size={size}
            searchable={searchable}
            showTransferAll={showTransferAll}
            motion={motion}
          />
        </div>
        <div className={`${PAGE}__playground-controls`}>
          {/* Size */}
          <div className={`${PAGE}__playground-control`}>
            <span className={`${PAGE}__playground-label`}>Size</span>
            <div className={`${PAGE}__playground-options`}>
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button
                  key={s}
                  className={`${PAGE}__playground-option${size === s ? ` ${PAGE}__playground-option--active` : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Level */}
          <div className={`${PAGE}__playground-control`}>
            <span className={`${PAGE}__playground-label`}>Motion Level</span>
            <div className={`${PAGE}__playground-options`}>
              {([0, 1, 2, 3] as const).map(m => (
                <button
                  key={m}
                  className={`${PAGE}__playground-option${motion === m ? ` ${PAGE}__playground-option--active` : ''}`}
                  onClick={() => setMotion(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className={`${PAGE}__playground-control`}>
            <span className={`${PAGE}__playground-label`}>Options</span>
            <div className={`${PAGE}__playground-toggle`}>
              <input type="checkbox" id="pg-searchable" checked={searchable} onChange={e => setSearchable(e.target.checked)} />
              <label htmlFor="pg-searchable">Searchable</label>
            </div>
            <div className={`${PAGE}__playground-toggle`}>
              <input type="checkbox" id="pg-transfer-all" checked={showTransferAll} onChange={e => setShowTransferAll(e.target.checked)} />
              <label htmlFor="pg-transfer-all">Transfer All</label>
            </div>
          </div>
        </div>
      </div>

      {/* Code output */}
      <div className={`${PAGE}__playground-code`}>
        <div className={`${PAGE}__playground-code-tabs`}>
          {codeTabs.map(tab => (
            <button
              key={tab.id}
              className={`${PAGE}__playground-code-tab${activeCodeTab === tab.id ? ` ${PAGE}__playground-code-tab--active` : ''}`}
              onClick={() => setActiveCodeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <pre className={`${PAGE}__playground-code-block`}>{activeCode}</pre>
        <Button
          size="sm"
          variant="secondary"
          className={`${PAGE}__playground-copy`}
          onClick={handleCopy}
          icon={<Icon name={copyStatus ? 'check' : 'copy'} size="sm" />}
        >
          {copyStatus || 'Copy'}
        </Button>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransferListPage() {
  useStyles('transfer-list-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveTransferList = tier === 'lite' ? LiteTransferList : tier === 'premium' ? PremiumTransferList : TransferList

  const [copied, setCopied] = useState(false)
  const [basic, setBasic] = useState<[TransferListItem[], TransferListItem[]]>([
    TEAM_MEMBERS.slice(0, 4),
    TEAM_MEMBERS.slice(4),
  ])
  const [grouped, setGrouped] = useState<[TransferListItem[], TransferListItem[]]>([
    FRAMEWORKS,
    [],
  ])

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>TransferList</h1>
        <p className={`${PAGE}__desc`}>
          Dual-panel list for moving items between two collections. Supports search filtering,
          grouped items, transfer-all buttons, and keyboard-driven selection. Adapts to your
          brand color via the OKLCH theme system.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {/* Source href to GitHub */}
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/transfer-list" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" icon={<Icon name="external-link" size="sm" />}>Source</Button>
          </a>
        </div>
      </div>

      {/* ── 1. Basic Transfer ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="basic">
        <h2 className={`${PAGE}__section-title`}><a href="#basic">Basic Transfer</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Select items in either panel and use the transfer buttons to move them. The component
          manages checkbox selection internally and calls onChange with the updated tuple.
        </p>
        <div className={`${PAGE}__preview`}>
          <ActiveTransferList
            value={basic}
            onChange={setBasic}
            titles={['Team Pool', 'Project Team']}
            searchable
          />
          <div className={`${PAGE}__state-display`}>
            Left: [{basic[0].map(i => i.label).join(', ')}]{'\n'}
            Right: [{basic[1].map(i => i.label).join(', ')}]
          </div>
        </div>
      </section>

      {/* ── 2. Grouped & Transfer All ────────────────────── */}
      <section className={`${PAGE}__section`} id="grouped">
        <h2 className={`${PAGE}__section-title`}><a href="#grouped">Grouped Items & Transfer All</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Items with a group property are visually categorized within their panel.
          Enable showTransferAll for bulk-move buttons.
        </p>
        <div className={`${PAGE}__preview`}>
          <ActiveTransferList
            value={grouped}
            onChange={setGrouped}
            titles={['Available Frameworks', 'Selected Stack']}
            searchable
            showTransferAll
            listHeight={280}
          />
        </div>
      </section>

      {/* ── 3. Playground ──────────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 4. Accessibility ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}><a href="#accessibility">Accessibility</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Built with semantic HTML and comprehensive keyboard support for dual-panel list interaction.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard navigation:</strong> Use <code className={`${PAGE}__a11y-key`}>Tab</code> to move between panels and controls. Items are selectable via <code className={`${PAGE}__a11y-key`}>Space</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus management:</strong> Visible focus ring with brand-colored glow via <code className={`${PAGE}__a11y-key`}>:focus-visible</code> on all interactive elements.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA labels:</strong> Transfer buttons use <code className={`${PAGE}__a11y-key`}>aria-label</code> to describe the transfer direction for screen readers.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All text and interactive elements meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Search:</strong> Search input has associated <code className={`${PAGE}__a11y-key`}>aria-label</code> and filters items in real time with live region updates.
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
                <strong>High contrast:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with visible borders and system colors.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className={`${PAGE}__a11y-key`}>prefers-reduced-motion</code> — all animations disabled when preference is set.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 5. Weight Tiers ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}><a href="#tiers">Weight Tiers</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Three tiers balance animation richness against bundle size. Lite locks motion to 0
          for zero runtime animation overhead; Standard includes all features with configurable
          motion levels; Premium wraps Standard with spring-physics item transfer animation,
          aurora glow on focused control buttons, and a hover-lift effect on list items.
        </p>
        <div className={`${PAGE}__tiers`}>
          {/* Lite */}
          <div className={`${PAGE}__tier-card${tier === 'lite' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Lite</span>
              <span className={`${PAGE}__tier-size`}>~1.2 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Wraps Standard with motion locked to 0. No animations, no spring physics.
              Full transfer functionality: search, groups, transfer-all, and keyboard support.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} TransferList {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteTransferList
                value={[
                  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
                  [{ value: 'c', label: 'Gamma' }],
                ]}
                onChange={() => {}}
                titles={['Available', 'Selected']}
                listHeight={160}
              />
            </div>
          </div>

          {/* Standard */}
          <div className={`${PAGE}__tier-card${tier === 'standard' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Standard</span>
              <span className={`${PAGE}__tier-size`}>~2.8 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Full-featured dual-panel list with search, grouping, transfer-all buttons,
              keyboard-driven selection, configurable sizes, and 4 motion levels.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} TransferList {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <TransferList
                value={[
                  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
                  [{ value: 'c', label: 'Gamma' }],
                ]}
                onChange={() => {}}
                titles={['Available', 'Selected']}
                listHeight={160}
              />
            </div>
          </div>

          {/* Premium */}
          <div className={`${PAGE}__tier-card${tier === 'premium' ? ` ${PAGE}__tier-card--active` : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Premium</span>
              <span className={`${PAGE}__tier-size`}>~3.2 KB gzip</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Wraps Standard with spring-physics item transfer animation, aurora glow on
              focused control buttons, hover-lift on list items, and spring-scale on button hover.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} TransferList {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumTransferList
                value={[
                  [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
                  [{ value: 'c', label: 'Gamma' }],
                ]}
                onChange={() => {}}
                titles={['Available', 'Selected']}
                listHeight={160}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. TransferListItem Props ────────────────────── */}
      <section className={`${PAGE}__section`} id="item-props">
        <h2 className={`${PAGE}__section-title`}><a href="#item-props">TransferListItem Interface</a></h2>
        <p className={`${PAGE}__section-desc`}>Shape of each item in the transfer list arrays.</p>
        <Card variant="default" padding="md">
          <PropsTable props={ITEM_PROPS} />
        </Card>
      </section>

      {/* ── 6. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for TransferList.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
