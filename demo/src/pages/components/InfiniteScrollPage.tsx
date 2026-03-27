'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { InfiniteScroll } from '@ui/domain/infinite-scroll'
import { InfiniteScroll as LiteInfiniteScroll } from '@ui/lite/infinite-scroll'
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
    @scope (.infinite-scroll-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: infinite-scroll-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .infinite-scroll-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .infinite-scroll-page__hero::before {
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
        animation: is-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes is-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .infinite-scroll-page__hero::before { animation: none; }
      }

      .infinite-scroll-page__title {
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

      .infinite-scroll-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .infinite-scroll-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .infinite-scroll-page__import-code {
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

      .infinite-scroll-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .infinite-scroll-page__section {
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
        animation: is-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes is-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .infinite-scroll-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .infinite-scroll-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .infinite-scroll-page__section-title a { color: inherit; text-decoration: none; }
      .infinite-scroll-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .infinite-scroll-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .infinite-scroll-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .infinite-scroll-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Demo list items ─────────────────────────────── */

      .infinite-scroll-page__demo-item {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .infinite-scroll-page__demo-avatar {
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: var(--radius-full, 9999px);
        background: oklch(from var(--brand) l c h / 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 700;
        color: var(--brand);
        flex-shrink: 0;
      }

      .infinite-scroll-page__demo-content {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        min-width: 0;
      }

      .infinite-scroll-page__demo-name {
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
      }

      .infinite-scroll-page__demo-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── Playground ─────────────────────────────────── */

      .infinite-scroll-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container infinite-scroll-page (max-width: 680px) {
        .infinite-scroll-page__playground { grid-template-columns: 1fr; }
      }

      .infinite-scroll-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .infinite-scroll-page__playground-result {
        max-block-size: 400px;
        display: flex;
        flex-direction: column;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
        border: 1px solid var(--border-subtle);
      }

      .infinite-scroll-page__playground-controls {
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

      .infinite-scroll-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }

      .infinite-scroll-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .infinite-scroll-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .infinite-scroll-page__option-btn {
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
      .infinite-scroll-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .infinite-scroll-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .infinite-scroll-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .infinite-scroll-page__code-tabs { margin-block-start: 1rem; }

      .infinite-scroll-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .infinite-scroll-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .infinite-scroll-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .infinite-scroll-page__tier-card {
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

      .infinite-scroll-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .infinite-scroll-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .infinite-scroll-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .infinite-scroll-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .infinite-scroll-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
      .infinite-scroll-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }

      .infinite-scroll-page__tier-import {
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

      .infinite-scroll-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .infinite-scroll-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .infinite-scroll-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── A11y list ──────────────────────────────────── */

      .infinite-scroll-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .infinite-scroll-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .infinite-scroll-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .infinite-scroll-page__a11y-key { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem); background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-primary); }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .infinite-scroll-page__hero { padding: 2rem 1.25rem; }
        .infinite-scroll-page__title { font-size: 1.75rem; }
        .infinite-scroll-page__preview { padding: 1rem; }
        .infinite-scroll-page__playground { grid-template-columns: 1fr; }
        .infinite-scroll-page__tiers { grid-template-columns: 1fr; }
        .infinite-scroll-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .infinite-scroll-page__hero { padding: 1.5rem 1rem; }
        .infinite-scroll-page__title { font-size: 1.5rem; }
        .infinite-scroll-page__preview { padding: 0.75rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .infinite-scroll-page__import-code, .infinite-scroll-page code, pre {
        overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%;
      }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const infiniteScrollProps: PropDef[] = [
  { name: 'onLoadMore', type: '() => void | Promise<void>', required: true, description: 'Callback triggered when the sentinel element enters the viewport.' },
  { name: 'hasMore', type: 'boolean', required: true, description: 'Whether there are more items to load. Disables the observer when false.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows the loading indicator and prevents duplicate onLoadMore calls.' },
  { name: 'threshold', type: 'number', default: '200', description: 'IntersectionObserver rootMargin in pixels. Higher = earlier trigger.' },
  { name: 'loader', type: 'ReactNode', description: 'Custom loading indicator. Defaults to a spinning circle.' },
  { name: 'endMessage', type: 'ReactNode', description: 'Message displayed when hasMore is false and all items are loaded.' },
  { name: 'direction', type: "'down' | 'up'", default: "'down'", description: 'Scroll direction — down loads at bottom, up loads at top (chat style).' },
  { name: 'pullToRefresh', type: 'boolean', default: 'false', description: 'Enable pull-to-refresh indicator at the top (mobile).' },
  { name: 'onRefresh', type: '() => void | Promise<void>', description: 'Callback for pull-to-refresh. Required when pullToRefresh is true.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Scrollable content to render inside the container.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Demo Item Generator ─────────────────────────────────────────────────────

const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack', 'Kate', 'Leo', 'Mia', 'Nate', 'Olive', 'Pete']
const DESCS = ['Completed code review', 'Deployed to staging', 'Fixed responsive layout', 'Updated documentation', 'Resolved merge conflict', 'Added unit tests', 'Refactored auth module', 'Optimized database queries']

function generateItems(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const idx = start + i
    const name = NAMES[idx % NAMES.length]
    const desc = DESCS[idx % DESCS.length]
    return { id: idx, name, initials: name.slice(0, 2).toUpperCase(), desc, time: `${Math.floor(idx / 3) + 1}m ago` }
  })
}

type DemoItem = ReturnType<typeof generateItems>[number]

function DemoListItem({ item }: { item: DemoItem }) {
  return (
    <div className="infinite-scroll-page__demo-item">
      <div className="infinite-scroll-page__demo-avatar">{item.initials}</div>
      <div className="infinite-scroll-page__demo-content">
        <span className="infinite-scroll-page__demo-name">{item.name}</span>
        <span className="infinite-scroll-page__demo-desc">{item.desc} — {item.time}</span>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { InfiniteScroll } from '@annondeveloper/ui-kit/lite'",
  standard: "import { InfiniteScroll } from '@annondeveloper/ui-kit'",
  premium: "import { InfiniteScroll } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="infinite-scroll-page__copy-btn"
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

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="infinite-scroll-page__control-group">
      <span className="infinite-scroll-page__control-label">{label}</span>
      <div className="infinite-scroll-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`infinite-scroll-page__option-btn${opt === value ? ' infinite-scroll-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="infinite-scroll-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, direction: 'down' | 'up', threshold: number, hasEndMessage: boolean): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}\n\nconst [items, setItems] = useState(initialItems)\nconst [loading, setLoading] = useState(false)\nconst hasMore = items.length < 100\n\nconst loadMore = () => {\n  setLoading(true)\n  fetchMore().then(newItems => {\n    setItems(prev => [...prev, ...newItems])\n    setLoading(false)\n  })\n}\n\n<InfiniteScroll\n  onLoadMore={loadMore}\n  hasMore={hasMore}\n  loading={loading}\n>\n  {items.map(item => <ListItem key={item.id} item={item} />)}\n</InfiniteScroll>`
  }

  const props: string[] = ['  onLoadMore={loadMore}', '  hasMore={hasMore}', '  loading={loading}']
  if (direction !== 'down') props.push(`  direction="${direction}"`)
  if (threshold !== 200) props.push(`  threshold={${threshold}}`)
  if (hasEndMessage) props.push('  endMessage="All items loaded"')

  return `${importStr}\n\nconst [items, setItems] = useState(initialItems)\nconst [loading, setLoading] = useState(false)\nconst hasMore = items.length < 100\n\nconst loadMore = () => {\n  setLoading(true)\n  fetchMore().then(newItems => {\n    setItems(prev => [...prev, ...newItems])\n    setLoading(false)\n  })\n}\n\n<InfiniteScroll\n${props.join('\n')}\n>\n  {items.map(item => <ListItem key={item.id} item={item} />)}\n</InfiniteScroll>`
}

function generateHtmlCode(tier: Tier): string {
  const cls = tier === 'lite' ? 'ui-lite-infinite-scroll' : 'ui-infinite-scroll'
  return `<!-- InfiniteScroll — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/infinite-scroll.css">

<div class="${cls}">
  <div class="${cls}__content">
    <!-- Your list items -->
    <div class="list-item">Item 1</div>
    <div class="list-item">Item 2</div>
  </div>
  <!-- Standard: IntersectionObserver sentinel -->
  <div class="${cls}__sentinel"></div>
  <!-- Lite: manual "Load more" button -->
  ${tier === 'lite' ? `<div class="${cls}__trigger">\n    <button class="ui-lite-button" data-variant="ghost">Load more</button>\n  </div>` : `<div class="${cls}__loader">\n    <div class="${cls}__spinner"></div>\n  </div>`}
</div>`
}

function generateVueCode(tier: Tier, direction: 'down' | 'up'): string {
  if (tier === 'lite') {
    return `<template>
  <InfiniteScroll
    :on-load-more="loadMore"
    :has-more="hasMore"
    :loading="loading"
  >
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </InfiniteScroll>
</template>

<script setup>
import { InfiniteScroll } from '@annondeveloper/ui-kit/lite'
import { ref } from 'vue'
const items = ref([])
const loading = ref(false)
const hasMore = ref(true)
const loadMore = () => { /* fetch more */ }
</script>`
  }
  return `<template>
  <InfiniteScroll
    :on-load-more="loadMore"
    :has-more="hasMore"
    :loading="loading"
    direction="${direction}"
  >
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </InfiniteScroll>
</template>

<script setup>
import { InfiniteScroll } from '@annondeveloper/ui-kit'
import { ref } from 'vue'
const items = ref([])
const loading = ref(false)
const hasMore = ref(true)
const loadMore = () => { /* fetch more */ }
</script>`
}

function generateAngularCode(tier: Tier): string {
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : 'Standard'} tier -->
<div class="${tier === 'lite' ? 'ui-lite-infinite-scroll' : 'ui-infinite-scroll'}">
  <div class="${tier === 'lite' ? 'ui-lite-infinite-scroll' : 'ui-infinite-scroll'}__content">
    <div *ngFor="let item of items">{{ item.name }}</div>
  </div>
  ${tier === 'lite'
    ? `<button *ngIf="hasMore" class="ui-lite-button" data-variant="ghost" (click)="loadMore()">Load more</button>`
    : `<!-- Use IntersectionObserver in component -->`}
</div>

@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles' : 'css/components/infinite-scroll'}.css';`
}

function generateSvelteCode(tier: Tier, direction: 'down' | 'up'): string {
  if (tier === 'lite') {
    return `<script>
  import { InfiniteScroll } from '@annondeveloper/ui-kit/lite';
  let items = [];
  let loading = false;
  let hasMore = true;
  const loadMore = () => { /* fetch more */ };
</script>

<InfiniteScroll onLoadMore={loadMore} {hasMore} {loading}>
  {#each items as item (item.id)}
    <div>{item.name}</div>
  {/each}
</InfiniteScroll>`
  }
  return `<script>
  import { InfiniteScroll } from '@annondeveloper/ui-kit';
  let items = [];
  let loading = false;
  let hasMore = true;
  const loadMore = () => { /* fetch more */ };
</script>

<InfiniteScroll onLoadMore={loadMore} {hasMore} {loading} direction="${direction}">
  {#each items as item (item.id)}
    <div>{item.name}</div>
  {/each}
</InfiniteScroll>`
}

// ─── Interactive Demo Hook ──────────────────────────────────────────────────

function useInfiniteList(pageSize: number = 10, maxItems: number = 50) {
  const [items, setItems] = useState<DemoItem[]>(() => generateItems(0, pageSize))
  const [loading, setLoading] = useState(false)
  const hasMore = items.length < maxItems

  const loadMore = useCallback(() => {
    setLoading(true)
    // Simulate async fetch
    setTimeout(() => {
      setItems(prev => [...prev, ...generateItems(prev.length, pageSize)])
      setLoading(false)
    }, 800)
  }, [pageSize])

  const reset = useCallback(() => {
    setItems(generateItems(0, pageSize))
    setLoading(false)
  }, [pageSize])

  return { items, loading, hasMore, loadMore, reset }
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [direction, setDirection] = useState<'down' | 'up'>('down')
  const [threshold, setThreshold] = useState(200)
  const [showEndMessage, setShowEndMessage] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const { items, loading, hasMore, loadMore, reset } = useInfiniteList(8, 40)

  const reactCode = useMemo(() => generateReactCode(tier, direction, threshold, showEndMessage), [tier, direction, threshold, showEndMessage])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, direction), [tier, direction])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, direction), [tier, direction])

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

  const endMsg = showEndMessage ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>All {items.length} items loaded</span> : undefined

  return (
    <section className="infinite-scroll-page__section" id="playground">
      <h2 className="infinite-scroll-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="infinite-scroll-page__section-desc">
        Scroll down in the preview to trigger automatic loading. Tweak controls to change behavior.
      </p>

      <div className="infinite-scroll-page__playground">
        <div className="infinite-scroll-page__playground-preview">
          <div className="infinite-scroll-page__playground-result">
            {tier === 'lite' ? (
              <LiteInfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
                  {items.map(item => <DemoListItem key={item.id} item={item} />)}
                </div>
              </LiteInfiniteScroll>
            ) : (
              <InfiniteScroll
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={loading}
                direction={direction}
                threshold={threshold}
                endMessage={endMsg}
                style={{ maxBlockSize: '380px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
                  {items.map(item => <DemoListItem key={item.id} item={item} />)}
                </div>
              </InfiniteScroll>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button size="xs" variant="ghost" onClick={reset} icon={<Icon name="refresh" size="sm" />}>Reset list</Button>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {items.length} items loaded {hasMore ? `(${40 - items.length} remaining)` : '(all loaded)'}
            </span>
          </div>

          <div className="infinite-scroll-page__code-tabs">
            <div className="infinite-scroll-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="infinite-scroll-page__export-status">{copyStatus}</span>}
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

        <div className="infinite-scroll-page__playground-controls">
          {tier !== 'lite' && (
            <>
              <OptionGroup label="Direction" options={['down', 'up'] as const} value={direction} onChange={setDirection} />
              <OptionGroup label="Threshold (px)" options={['50', '200', '400'] as const} value={String(threshold)} onChange={v => setThreshold(Number(v))} />
              <div className="infinite-scroll-page__control-group">
                <span className="infinite-scroll-page__control-label">Toggles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Toggle label="End message" checked={showEndMessage} onChange={setShowEndMessage} />
                </div>
              </div>
            </>
          )}
          <Button size="sm" variant="secondary" onClick={reset} icon={<Icon name="refresh" size="sm" />}>Reset Demo</Button>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InfiniteScrollPage() {
  useStyles('infinite-scroll-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.infinite-scroll-page__section')
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

  const basicDemo = useInfiniteList(6, 30)
  const endMessageDemo = useInfiniteList(5, 15)

  return (
    <div className="infinite-scroll-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="infinite-scroll-page__hero">
        <h1 className="infinite-scroll-page__title">InfiniteScroll</h1>
        <p className="infinite-scroll-page__desc">
          Virtualized list container with IntersectionObserver-powered auto-loading,
          bidirectional scroll, pull-to-refresh, and accessible loading announcements.
          Ships from 0.3KB lite (manual button) to 1.8KB standard with full observer logic.
        </p>
        <div className="infinite-scroll-page__import-row">
          <code className="infinite-scroll-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Basic Usage ─────────────────────────────── */}
      <section className="infinite-scroll-page__section" id="basic">
        <h2 className="infinite-scroll-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="infinite-scroll-page__section-desc">
          Pass <code>onLoadMore</code>, <code>hasMore</code>, and <code>loading</code> to create an auto-loading list.
          The IntersectionObserver sentinel triggers loading before the user reaches the bottom.
        </p>
        <div className="infinite-scroll-page__preview" style={{ maxBlockSize: '300px', overflow: 'hidden' }}>
          {tier === 'lite' ? (
            <LiteInfiniteScroll onLoadMore={basicDemo.loadMore} hasMore={basicDemo.hasMore} loading={basicDemo.loading}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {basicDemo.items.map(item => <DemoListItem key={item.id} item={item} />)}
              </div>
            </LiteInfiniteScroll>
          ) : (
            <InfiniteScroll onLoadMore={basicDemo.loadMore} hasMore={basicDemo.hasMore} loading={basicDemo.loading} style={{ maxBlockSize: '280px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {basicDemo.items.map(item => <DemoListItem key={item.id} item={item} />)}
              </div>
            </InfiniteScroll>
          )}
        </div>
        <div style={{ marginBlockStart: '0.5rem' }}>
          <Button size="xs" variant="ghost" onClick={basicDemo.reset} icon={<Icon name="refresh" size="sm" />}>Reset</Button>
        </div>
      </section>

      {/* ── 4. End Message ─────────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="infinite-scroll-page__section" id="end-message">
          <h2 className="infinite-scroll-page__section-title"><a href="#end-message">End Message</a></h2>
          <p className="infinite-scroll-page__section-desc">
            When all items are loaded (<code>hasMore=false</code>), an optional end message appears.
            This provides clear feedback that the user has reached the end of the content.
          </p>
          <div className="infinite-scroll-page__preview" style={{ maxBlockSize: '300px', overflow: 'hidden' }}>
            <InfiniteScroll
              onLoadMore={endMessageDemo.loadMore}
              hasMore={endMessageDemo.hasMore}
              loading={endMessageDemo.loading}
              endMessage={<span style={{ fontStyle: 'italic' }}>You have reached the end</span>}
              style={{ maxBlockSize: '280px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {endMessageDemo.items.map(item => <DemoListItem key={item.id} item={item} />)}
              </div>
            </InfiniteScroll>
          </div>
          <div style={{ marginBlockStart: '0.5rem' }}>
            <Button size="xs" variant="ghost" onClick={endMessageDemo.reset} icon={<Icon name="refresh" size="sm" />}>Reset</Button>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<InfiniteScroll\n  onLoadMore={loadMore}\n  hasMore={hasMore}\n  loading={loading}\n  endMessage="All items loaded"\n>\n  {items.map(item => <Item key={item.id} {...item} />)}\n</InfiniteScroll>`} language="typescript" />
          </div>
        </section>
      ) : (
        <section className="infinite-scroll-page__section" id="end-message">
          <h2 className="infinite-scroll-page__section-title"><a href="#end-message">End Message</a></h2>
          <p className="infinite-scroll-page__section-desc">
            Display a message when all items are loaded.
          </p>
          <p className="infinite-scroll-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            End messages, custom loaders, and direction control require Standard tier.
            Lite provides a simple "Load more" button.
          </p>
        </section>
      )}

      {/* ── 5. Custom Loader ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="infinite-scroll-page__section" id="custom-loader">
          <h2 className="infinite-scroll-page__section-title"><a href="#custom-loader">Custom Loader</a></h2>
          <p className="infinite-scroll-page__section-desc">
            Pass a custom <code>loader</code> element to replace the default spinner.
            Useful for branded loading states or skeleton placeholders.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<InfiniteScroll\n  onLoadMore={loadMore}\n  hasMore={hasMore}\n  loading={loading}\n  loader={\n    <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem' }}>\n      <Skeleton width="100%" height={48} />\n      <Skeleton width="100%" height={48} />\n    </div>\n  }\n>\n  {children}\n</InfiniteScroll>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Bidirectional Scroll ────────────────────── */}
      {tier !== 'lite' && (
        <section className="infinite-scroll-page__section" id="direction">
          <h2 className="infinite-scroll-page__section-title"><a href="#direction">Bidirectional Scroll</a></h2>
          <p className="infinite-scroll-page__section-desc">
            Set <code>direction="up"</code> for chat-style interfaces where new content loads
            at the top when scrolling upward. The sentinel and loader position adapt automatically.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<InfiniteScroll\n  onLoadMore={loadOlderMessages}\n  hasMore={hasOlderMessages}\n  loading={loading}\n  direction="up"\n>\n  {messages.map(msg => <Message key={msg.id} {...msg} />)}\n</InfiniteScroll>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7. Pull to Refresh ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="infinite-scroll-page__section" id="pull-refresh">
          <h2 className="infinite-scroll-page__section-title"><a href="#pull-refresh">Pull to Refresh</a></h2>
          <p className="infinite-scroll-page__section-desc">
            Enable <code>pullToRefresh</code> with an <code>onRefresh</code> handler for mobile-friendly
            refresh gestures. A pull indicator appears at the top of the scroll container.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<InfiniteScroll\n  onLoadMore={loadMore}\n  hasMore={hasMore}\n  loading={loading}\n  pullToRefresh\n  onRefresh={async () => {\n    const fresh = await fetchLatest()\n    setItems(fresh)\n  }}\n>\n  {items.map(item => <Item key={item.id} {...item} />)}\n</InfiniteScroll>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="infinite-scroll-page__section" id="tiers">
        <h2 className="infinite-scroll-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="infinite-scroll-page__section-desc">
          Lite renders a simple container with a manual "Load more" button. Standard uses
          IntersectionObserver for automatic loading, bidirectional scroll, custom loaders,
          end messages, pull-to-refresh, and ARIA live regions.
        </p>

        <div className="infinite-scroll-page__tiers">
          {/* Lite */}
          <div
            className={`infinite-scroll-page__tier-card${tier === 'lite' ? ' infinite-scroll-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="infinite-scroll-page__tier-header">
              <span className="infinite-scroll-page__tier-name">Lite</span>
              <span className="infinite-scroll-page__tier-size">~0.3 KB</span>
            </div>
            <p className="infinite-scroll-page__tier-desc">
              Simple container with "Load more" button. No IntersectionObserver,
              no auto-loading, no direction control, no pull-to-refresh.
            </p>
            <div className="infinite-scroll-page__tier-import">
              import {'{'} InfiniteScroll {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="infinite-scroll-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Manual "Load more" button</span>
            </div>
            <div className="infinite-scroll-page__size-breakdown">
              <div className="infinite-scroll-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`infinite-scroll-page__tier-card${tier === 'standard' ? ' infinite-scroll-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="infinite-scroll-page__tier-header">
              <span className="infinite-scroll-page__tier-name">Standard</span>
              <span className="infinite-scroll-page__tier-size">~1.8 KB</span>
            </div>
            <p className="infinite-scroll-page__tier-desc">
              IntersectionObserver auto-loading with configurable threshold,
              bidirectional scroll, custom loader, end message, pull-to-refresh, and ARIA live region.
            </p>
            <div className="infinite-scroll-page__tier-import">
              import {'{'} InfiniteScroll {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="infinite-scroll-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Auto-load with observer</span>
            </div>
            <div className="infinite-scroll-page__size-breakdown">
              <div className="infinite-scroll-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`infinite-scroll-page__tier-card${tier === 'premium' ? ' infinite-scroll-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="infinite-scroll-page__tier-header">
              <span className="infinite-scroll-page__tier-name">Premium</span>
              <span className="infinite-scroll-page__tier-size">~3-5 KB</span>
            </div>
            <p className="infinite-scroll-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="infinite-scroll-page__tier-import">
              import {'{'} InfiniteScroll {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="infinite-scroll-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Premium preview</span>
            </div>
            <div className="infinite-scroll-page__size-breakdown">
              <div className="infinite-scroll-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="infinite-scroll-page__section" id="props">
        <h2 className="infinite-scroll-page__section-title"><a href="#props">Props API</a></h2>
        <p className="infinite-scroll-page__section-desc">
          All props accepted by InfiniteScroll. It also spreads any native div HTML attributes
          onto the underlying wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={infiniteScrollProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="infinite-scroll-page__section" id="accessibility">
        <h2 className="infinite-scroll-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="infinite-scroll-page__section-desc">
          Built with screen reader support and hidden live regions for loading state announcements.
        </p>
        <Card variant="default" padding="md">
          <ul className="infinite-scroll-page__a11y-list">
            <li className="infinite-scroll-page__a11y-item">
              <span className="infinite-scroll-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Loading state announced via <code className="infinite-scroll-page__a11y-key">aria-live="polite"</code> hidden status element.
              </span>
            </li>
            <li className="infinite-scroll-page__a11y-item">
              <span className="infinite-scroll-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden sentinel:</strong> The IntersectionObserver sentinel is <code className="infinite-scroll-page__a11y-key">aria-hidden="true"</code> — invisible to assistive tech.
              </span>
            </li>
            <li className="infinite-scroll-page__a11y-item">
              <span className="infinite-scroll-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print friendly:</strong> Loader, sentinel, and pull indicator hidden in <code className="infinite-scroll-page__a11y-key">@media print</code>.
              </span>
            </li>
            <li className="infinite-scroll-page__a11y-item">
              <span className="infinite-scroll-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard fallback:</strong> Lite tier provides a focusable "Load more" button for keyboard-only users.
              </span>
            </li>
            <li className="infinite-scroll-page__a11y-item">
              <span className="infinite-scroll-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Spinner supports <code className="infinite-scroll-page__a11y-key">forced-colors: active</code> with system colors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
