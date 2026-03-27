'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { KanbanColumn, type KanbanCard } from '@ui/domain/kanban-column'
import { KanbanColumn as LiteKanbanColumn } from '@ui/lite/kanban-column'
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
    @scope (.kanban-column-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: kanban-column-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .kanban-column-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .kanban-column-page__hero::before {
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
        animation: kc-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes kc-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .kanban-column-page__hero::before { animation: none; }
      }

      .kanban-column-page__title {
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

      .kanban-column-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .kanban-column-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .kanban-column-page__import-code {
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

      .kanban-column-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .kanban-column-page__section {
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
        animation: kc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes kc-section-reveal {
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
        .kanban-column-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .kanban-column-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .kanban-column-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .kanban-column-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .kanban-column-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .kanban-column-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .kanban-column-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .kanban-column-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .kanban-column-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container kanban-column-page (max-width: 680px) {
        .kanban-column-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .kanban-column-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .kanban-column-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .kanban-column-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .kanban-column-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .kanban-column-page__playground-controls {
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

      .kanban-column-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .kanban-column-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .kanban-column-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .kanban-column-page__option-btn {
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
      .kanban-column-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .kanban-column-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .kanban-column-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .kanban-column-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .kanban-column-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .kanban-column-page__code-tabs {
        margin-block-start: 1rem;
      }

      .kanban-column-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .kanban-column-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Labeled row ────────────────────────────────── */

      .kanban-column-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .kanban-column-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .kanban-column-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .kanban-column-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .kanban-column-page__tier-card {
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

      .kanban-column-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .kanban-column-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .kanban-column-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .kanban-column-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .kanban-column-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .kanban-column-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .kanban-column-page__tier-import {
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

      .kanban-column-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .kanban-column-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .kanban-column-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .kanban-column-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .kanban-column-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .kanban-column-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .kanban-column-page__a11y-key {
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
        .kanban-column-page__hero { padding: 2rem 1.25rem; }
        .kanban-column-page__title { font-size: 1.75rem; }
        .kanban-column-page__preview { padding: 1.75rem; }
        .kanban-column-page__playground { grid-template-columns: 1fr; }
        .kanban-column-page__tiers { grid-template-columns: 1fr; }
        .kanban-column-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .kanban-column-page__hero { padding: 1.5rem 1rem; }
        .kanban-column-page__title { font-size: 1.5rem; }
        .kanban-column-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .kanban-column-page__import-code,
      .kanban-column-page code,
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

const kanbanColumnProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', required: true, description: 'Column header title text or element.' },
  { name: 'cards', type: 'KanbanCard[]', required: true, description: 'Array of card objects to render in the column.' },
  { name: 'columnId', type: 'string', required: true, description: 'Unique identifier for this column used in card move callbacks.' },
  { name: 'onCardClick', type: '(cardId: string) => void', description: 'Handler called when a card is clicked or activated via keyboard.' },
  { name: 'onCardMove', type: '(cardId: string, targetColumnId: string, targetIndex: number) => void', description: 'Handler called when a card is moved to another column.' },
  { name: 'wipLimit', type: 'number', description: 'Work-in-progress limit. Shows warning styling when card count reaches this limit.' },
  { name: 'collapsed', type: 'boolean', default: 'false', description: 'Whether the column is collapsed to a narrow vertical strip.' },
  { name: 'onCollapse', type: '(collapsed: boolean) => void', description: 'Handler for collapse toggle. Renders collapse button when defined.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

const BACKLOG_CARDS: KanbanCard[] = [
  { id: 'b1', title: 'Design new landing page', description: 'Create mockups for the Q3 marketing campaign landing page', tags: ['design', 'marketing'], priority: 'medium' },
  { id: 'b2', title: 'Update API documentation', description: 'Refresh OpenAPI spec and usage examples for v2 endpoints', tags: ['docs'], priority: 'low' },
  { id: 'b3', title: 'Optimize database queries', tags: ['backend', 'perf'], priority: 'high' },
]

const IN_PROGRESS_CARDS: KanbanCard[] = [
  { id: 'p1', title: 'Implement user auth flow', description: 'OAuth2 + PKCE flow with refresh token rotation', tags: ['auth', 'security'], priority: 'critical' },
  { id: 'p2', title: 'Build notification service', tags: ['backend'], priority: 'high' },
]

const DONE_CARDS: KanbanCard[] = [
  { id: 'd1', title: 'Set up CI/CD pipeline', description: 'GitHub Actions workflow for lint, test, build, deploy', tags: ['devops'], priority: 'medium' },
  { id: 'd2', title: 'Create component library', tags: ['frontend', 'ui'], priority: 'high' },
  { id: 'd3', title: 'Write unit tests for auth', tags: ['testing'], priority: 'medium' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { KanbanColumn } from '@annondeveloper/ui-kit/lite'",
  standard: "import { KanbanColumn } from '@annondeveloper/ui-kit'",
  premium: "import { KanbanColumn } from '@annondeveloper/ui-kit/premium'",
}

type Priority = 'low' | 'medium' | 'high' | 'critical'
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="kanban-column-page__copy-btn"
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
    <div className="kanban-column-page__control-group">
      <span className="kanban-column-page__control-label">{label}</span>
      <div className="kanban-column-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`kanban-column-page__option-btn${opt === value ? ' kanban-column-page__option-btn--active' : ''}`}
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
    <label className="kanban-column-page__toggle-label">
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
  title: string,
  cardCount: number,
  wipLimit: number | undefined,
  collapsed: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const cards = `const cards = [\n  { id: '1', title: 'Design landing page', tags: ['design'], priority: 'medium' },\n  { id: '2', title: 'Build auth flow', tags: ['backend'], priority: 'critical' },\n${cardCount > 2 ? "  { id: '3', title: 'Write tests', tags: ['testing'], priority: 'high' },\n" : ''}]`

  if (tier === 'lite') {
    return `${importStr}\n\n${cards}\n\n<KanbanColumn\n  title="${title}"\n  cards={cards}\n  count={cards.length}\n/>`
  }

  const props: string[] = [`  title="${title}"`, '  cards={cards}', '  columnId="col-1"']
  if (wipLimit) props.push(`  wipLimit={${wipLimit}}`)
  if (collapsed) props.push('  collapsed')
  if (motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  onCardClick={(id) => console.log(id)}')

  return `${importStr}\n\n${cards}\n\n<KanbanColumn\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, title: string): string {
  const cls = tier === 'lite' ? 'ui-lite-kanban-column' : 'ui-kanban-column'
  return `<!-- KanbanColumn — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/kanban-column.css">

<div class="${cls}">
  <div class="${cls}__header">
    <h3>${title}</h3>
    <span class="${cls}__count">3</span>
  </div>
  <div class="${cls}__cards">
    <div class="${cls}__card" data-priority="medium">
      <strong>Design landing page</strong>
      <p>Create mockups for Q3 campaign</p>
    </div>
    <div class="${cls}__card" data-priority="critical">
      <strong>Build auth flow</strong>
    </div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, title: string): string {
  if (tier === 'lite') {
    return `<template>
  <KanbanColumn
    title="${title}"
    :cards="cards"
    :count="cards.length"
  />
</template>

<script setup>
import { KanbanColumn } from '@annondeveloper/ui-kit/lite'
const cards = [
  { id: '1', title: 'Design landing page', tags: ['design'], priority: 'medium' },
  { id: '2', title: 'Build auth flow', tags: ['backend'], priority: 'critical' },
]
</script>`
  }
  return `<template>
  <KanbanColumn
    title="${title}"
    :cards="cards"
    column-id="col-1"
    @card-click="handleCardClick"
  />
</template>

<script setup>
import { KanbanColumn } from '@annondeveloper/ui-kit'
const cards = [
  { id: '1', title: 'Design landing page', tags: ['design'], priority: 'medium' },
  { id: '2', title: 'Build auth flow', tags: ['backend'], priority: 'critical' },
]
const handleCardClick = (id) => console.log('clicked', id)
</script>`
}

function generateAngularCode(tier: Tier, title: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<div class="ui-lite-kanban-column">
  <div class="ui-lite-kanban-column__header">
    <h3>${title}</h3>
    <span class="ui-lite-kanban-column__count">{{ cards.length }}</span>
  </div>
  <div class="ui-lite-kanban-column__cards">
    <div *ngFor="let card of cards" class="ui-lite-kanban-column__card">
      <strong>{{ card.title }}</strong>
    </div>
  </div>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-kanban-column" data-column-id="col-1">
  <div class="ui-kanban-column__header">
    <span class="ui-kanban-column__title">${title}</span>
    <span class="ui-kanban-column__count">{{ cards.length }}</span>
  </div>
  <div class="ui-kanban-column__cards">
    <div *ngFor="let card of cards"
         class="ui-kanban-column__card"
         [attr.data-priority]="card.priority"
         (click)="onCardClick(card.id)">
      <span class="ui-kanban-column__card-title">{{ card.title }}</span>
    </div>
  </div>
</div>

@import '@annondeveloper/ui-kit/css/components/kanban-column.css';`
}

function generateSvelteCode(tier: Tier, title: string): string {
  if (tier === 'lite') {
    return `<script>
  import { KanbanColumn } from '@annondeveloper/ui-kit/lite';
  const cards = [
    { id: '1', title: 'Design landing page', tags: ['design'] },
    { id: '2', title: 'Build auth flow', tags: ['backend'] },
  ];
</script>

<KanbanColumn title="${title}" {cards} count={cards.length} />`
  }
  return `<script>
  import { KanbanColumn } from '@annondeveloper/ui-kit';
  const cards = [
    { id: '1', title: 'Design landing page', tags: ['design'], priority: 'medium' },
    { id: '2', title: 'Build auth flow', tags: ['backend'], priority: 'critical' },
  ];
</script>

<KanbanColumn
  title="${title}"
  {cards}
  columnId="col-1"
  on:cardClick={(e) => console.log(e.detail)}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [title, setTitle] = useState('In Progress')
  const [cardCount, setCardCount] = useState<'2' | '3' | '5'>('3')
  const [showWipLimit, setShowWipLimit] = useState(false)
  const [wipLimit, setWipLimit] = useState(4)
  const [collapsed, setCollapsed] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const allCards: KanbanCard[] = [
    { id: 'pg1', title: 'Implement auth flow', description: 'OAuth2 + PKCE', tags: ['auth'], priority: 'critical' },
    { id: 'pg2', title: 'Build notification system', tags: ['backend'], priority: 'high' },
    { id: 'pg3', title: 'Design dashboard UI', description: 'Mockups for analytics', tags: ['design', 'ui'], priority: 'medium' },
    { id: 'pg4', title: 'Write integration tests', tags: ['testing'], priority: 'low' },
    { id: 'pg5', title: 'Optimize API queries', tags: ['perf'], priority: 'high' },
  ]

  const cards = allCards.slice(0, Number(cardCount))
  const effectiveWip = showWipLimit ? wipLimit : undefined

  const reactCode = useMemo(() => generateReactCode(tier, title, Number(cardCount), effectiveWip, collapsed, motion), [tier, title, cardCount, effectiveWip, collapsed, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, title), [tier, title])
  const vueCode = useMemo(() => generateVueCode(tier, title), [tier, title])
  const angularCode = useMemo(() => generateAngularCode(tier, title), [tier, title])
  const svelteCode = useMemo(() => generateSvelteCode(tier, title), [tier, title])

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
    <section className="kanban-column-page__section" id="playground">
      <h2 className="kanban-column-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="kanban-column-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="kanban-column-page__playground">
        <div className="kanban-column-page__playground-preview">
          <div className="kanban-column-page__playground-result">
            {tier === 'lite' ? (
              <LiteKanbanColumn
                title={title}
                cards={cards.map(c => ({ id: c.id, title: c.title, description: c.description, tags: c.tags }))}
                count={cards.length}
              />
            ) : (
              <KanbanColumn
                title={title}
                cards={cards}
                columnId="playground-col"
                wipLimit={effectiveWip}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                motion={motion}
                onCardClick={(id) => setCopyStatus(`Clicked card: ${id}`)}
              />
            )}
          </div>

          <div className="kanban-column-page__code-tabs">
            <div className="kanban-column-page__export-row">
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
              {copyStatus && <span className="kanban-column-page__export-status">{copyStatus}</span>}
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

        <div className="kanban-column-page__playground-controls">
          <div className="kanban-column-page__control-group">
            <span className="kanban-column-page__control-label">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="kanban-column-page__text-input"
              placeholder="Column title..."
            />
          </div>

          <OptionGroup label="Card Count" options={['2', '3', '5'] as const} value={cardCount} onChange={setCardCount} />

          {tier !== 'lite' && (
            <>
              <OptionGroup
                label="Motion"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
              <div className="kanban-column-page__control-group">
                <span className="kanban-column-page__control-label">Toggles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Toggle label="Collapsed" checked={collapsed} onChange={setCollapsed} />
                  <Toggle label="WIP Limit" checked={showWipLimit} onChange={setShowWipLimit} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanColumnPage() {
  useStyles('kanban-column-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.kanban-column-page__section')
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
    <div className="kanban-column-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="kanban-column-page__hero">
        <h1 className="kanban-column-page__title">KanbanColumn</h1>
        <p className="kanban-column-page__desc">
          Project management column with cards, priority borders, WIP limits, collapse
          support, and keyboard-navigable cards. Ships in two weight tiers from 0.4KB lite
          to 2.8KB standard with full drag-and-drop callbacks.
        </p>
        <div className="kanban-column-page__import-row">
          <code className="kanban-column-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Priority Levels ─────────────────────────── */}
      <section className="kanban-column-page__section" id="priorities">
        <h2 className="kanban-column-page__section-title">
          <a href="#priorities">Priority Levels</a>
        </h2>
        <p className="kanban-column-page__section-desc">
          Cards display a colored left border based on their priority level — low (blue-green),
          medium (amber), high (orange), and critical (red). Priority is conveyed visually and
          via data attributes for screen reader extensions.
        </p>
        <div className="kanban-column-page__preview">
          {tier === 'lite' ? (
            <LiteKanbanColumn
              title="Priority Demo"
              cards={PRIORITIES.map((p, i) => ({
                id: `prio-${i}`,
                title: `${p.charAt(0).toUpperCase() + p.slice(1)} priority task`,
                description: `This card has ${p} priority`,
              }))}
              count={PRIORITIES.length}
            />
          ) : (
            <KanbanColumn
              title="Priority Demo"
              columnId="priorities"
              cards={PRIORITIES.map((p, i) => ({
                id: `prio-${i}`,
                title: `${p.charAt(0).toUpperCase() + p.slice(1)} priority task`,
                description: `This card demonstrates ${p} priority styling`,
                priority: p,
                tags: [p],
              }))}
            />
          )}
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<KanbanColumn
  title="Sprint 42"
  columnId="sprint"
  cards={[
    { id: '1', title: 'Fix auth bug', priority: 'critical', tags: ['bug'] },
    { id: '2', title: 'Add caching', priority: 'high', tags: ['perf'] },
    { id: '3', title: 'Update docs', priority: 'low', tags: ['docs'] },
  ]}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. WIP Limits ──────────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="kanban-column-page__section" id="wip">
          <h2 className="kanban-column-page__section-title">
            <a href="#wip">WIP Limits</a>
          </h2>
          <p className="kanban-column-page__section-desc">
            Set a work-in-progress limit to visually warn when a column has too many cards.
            The count badge turns red when the limit is reached, encouraging flow-based work management.
          </p>
          <div className="kanban-column-page__preview">
            <KanbanColumn
              title="In Progress"
              columnId="wip-demo"
              wipLimit={2}
              cards={IN_PROGRESS_CARDS}
              onCardClick={(id) => console.log('clicked', id)}
            />
            <KanbanColumn
              title="Review"
              columnId="wip-ok"
              wipLimit={5}
              cards={[{ id: 'r1', title: 'Code review PR #42', tags: ['review'], priority: 'medium' }]}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<KanbanColumn\n  title="In Progress"\n  columnId="progress"\n  wipLimit={3}\n  cards={cards}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="kanban-column-page__section" id="wip">
          <h2 className="kanban-column-page__section-title">
            <a href="#wip">WIP Limits</a>
          </h2>
          <p className="kanban-column-page__section-desc">
            Work-in-progress limits with visual warning styling.
          </p>
          <p className="kanban-column-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            WIP limits require Standard tier for visual feedback and data attributes.
          </p>
        </section>
      )}

      {/* ── 5. Collapsed State ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="kanban-column-page__section" id="collapsed">
          <h2 className="kanban-column-page__section-title">
            <a href="#collapsed">Collapsed State</a>
          </h2>
          <p className="kanban-column-page__section-desc">
            Columns can collapse to a narrow vertical strip showing only the title rotated 90 degrees.
            Useful for boards with many columns to save horizontal space.
          </p>
          <div className="kanban-column-page__preview">
            <KanbanColumn
              title="Backlog"
              columnId="collapse-demo"
              collapsed
              cards={BACKLOG_CARDS}
              onCollapse={() => {}}
            />
            <KanbanColumn
              title="In Progress"
              columnId="collapse-expanded"
              cards={IN_PROGRESS_CARDS}
              onCollapse={() => {}}
            />
          </div>
        </section>
      )}

      {/* ── 6. Multi-Column Board ──────────────────────── */}
      <section className="kanban-column-page__section" id="board">
        <h2 className="kanban-column-page__section-title">
          <a href="#board">Multi-Column Board</a>
        </h2>
        <p className="kanban-column-page__section-desc">
          Combine multiple columns to create a complete Kanban board. Each column operates
          independently with its own cards, WIP limits, and collapse state.
        </p>
        <div className="kanban-column-page__preview" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'min-content' }}>
            {tier === 'lite' ? (
              <>
                <LiteKanbanColumn title="Backlog" cards={BACKLOG_CARDS.map(c => ({ id: c.id, title: c.title, description: c.description, tags: c.tags }))} count={BACKLOG_CARDS.length} />
                <LiteKanbanColumn title="In Progress" cards={IN_PROGRESS_CARDS.map(c => ({ id: c.id, title: c.title, description: c.description, tags: c.tags }))} count={IN_PROGRESS_CARDS.length} />
                <LiteKanbanColumn title="Done" cards={DONE_CARDS.map(c => ({ id: c.id, title: c.title, description: c.description, tags: c.tags }))} count={DONE_CARDS.length} />
              </>
            ) : (
              <>
                <KanbanColumn title="Backlog" columnId="board-backlog" cards={BACKLOG_CARDS} />
                <KanbanColumn title="In Progress" columnId="board-progress" cards={IN_PROGRESS_CARDS} wipLimit={3} />
                <KanbanColumn title="Done" columnId="board-done" cards={DONE_CARDS} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Tags and Assignees ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="kanban-column-page__section" id="tags">
          <h2 className="kanban-column-page__section-title">
            <a href="#tags">Tags & Assignees</a>
          </h2>
          <p className="kanban-column-page__section-desc">
            Cards support tags displayed as compact pills and an assignee slot rendered in the card footer.
            Tags wrap gracefully when space is limited.
          </p>
          <div className="kanban-column-page__preview">
            <KanbanColumn
              title="Feature Work"
              columnId="tags-demo"
              cards={[
                { id: 't1', title: 'Build dashboard', description: 'Analytics dashboard with charts', tags: ['frontend', 'design', 'charts'], priority: 'high', assignee: 'AM' },
                { id: 't2', title: 'API rate limiting', tags: ['backend', 'security', 'infra'], priority: 'critical', assignee: 'SK' },
                { id: 't3', title: 'Mobile responsiveness', tags: ['css', 'responsive'], priority: 'medium', assignee: 'JD' },
              ]}
            />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="kanban-column-page__section" id="tiers">
        <h2 className="kanban-column-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="kanban-column-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple column with cards,
          Standard adds priority borders, WIP limits, collapse, motion, and keyboard interaction.
        </p>

        <div className="kanban-column-page__tiers">
          {/* Lite */}
          <div
            className={`kanban-column-page__tier-card${tier === 'lite' ? ' kanban-column-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="kanban-column-page__tier-header">
              <span className="kanban-column-page__tier-name">Lite</span>
              <span className="kanban-column-page__tier-size">~0.4 KB</span>
            </div>
            <p className="kanban-column-page__tier-desc">
              Static column with header, card list, and count badge. No priority borders,
              no WIP limits, no collapse, no motion. Pure CSS layout.
            </p>
            <div className="kanban-column-page__tier-import">
              import {'{'} KanbanColumn {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="kanban-column-page__tier-preview">
              <LiteKanbanColumn
                title="Backlog"
                cards={[{ id: 'lt1', title: 'Sample task', tags: ['demo'] }]}
                count={1}
              />
            </div>
            <div className="kanban-column-page__size-breakdown">
              <div className="kanban-column-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`kanban-column-page__tier-card${tier === 'standard' ? ' kanban-column-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="kanban-column-page__tier-header">
              <span className="kanban-column-page__tier-name">Standard</span>
              <span className="kanban-column-page__tier-size">~2.8 KB</span>
            </div>
            <p className="kanban-column-page__tier-desc">
              Full-featured column with priority borders, WIP limit warnings,
              collapsible state, keyboard navigation, motion levels, and card move callbacks.
            </p>
            <div className="kanban-column-page__tier-import">
              import {'{'} KanbanColumn {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="kanban-column-page__tier-preview">
              <KanbanColumn
                title="Active"
                columnId="tier-std"
                cards={[{ id: 'st1', title: 'Build feature', tags: ['dev'], priority: 'high' }]}
              />
            </div>
            <div className="kanban-column-page__size-breakdown">
              <div className="kanban-column-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`kanban-column-page__tier-card${tier === 'premium' ? ' kanban-column-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="kanban-column-page__tier-header">
              <span className="kanban-column-page__tier-name">Premium</span>
              <span className="kanban-column-page__tier-size">~3-5 KB</span>
            </div>
            <p className="kanban-column-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="kanban-column-page__tier-import">
              import {'{'} KanbanColumn {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="kanban-column-page__tier-preview">
              <KanbanColumn
                title="Active"
                columnId="tier-prem"
                cards={[{ id: 'pm1', title: 'Build feature', tags: ['dev'], priority: 'high' }]}
              />
            </div>
            <div className="kanban-column-page__size-breakdown">
              <div className="kanban-column-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="kanban-column-page__section" id="props">
        <h2 className="kanban-column-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="kanban-column-page__section-desc">
          All props accepted by KanbanColumn. It also spreads any native div HTML attributes
          onto the underlying wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={kanbanColumnProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="kanban-column-page__section" id="accessibility">
        <h2 className="kanban-column-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="kanban-column-page__section-desc">
          Built with semantic markup and comprehensive ARIA support for keyboard and screen reader users.
        </p>
        <Card variant="default" padding="md">
          <ul className="kanban-column-page__a11y-list">
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Region:</strong> Column uses <code className="kanban-column-page__a11y-key">role="region"</code> with <code className="kanban-column-page__a11y-key">aria-labelledby</code> pointing to the title.
              </span>
            </li>
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Cards are focusable with <code className="kanban-column-page__a11y-key">tabIndex=0</code> and activate on <code className="kanban-column-page__a11y-key">Enter</code> / <code className="kanban-column-page__a11y-key">Space</code>.
              </span>
            </li>
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow on cards via <code className="kanban-column-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>WIP label:</strong> WIP limit announced via <code className="kanban-column-page__a11y-key">aria-label</code> on the limit indicator.
              </span>
            </li>
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="kanban-column-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="kanban-column-page__a11y-item">
              <span className="kanban-column-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="kanban-column-page__a11y-key">forced-colors: active</code> with visible borders and highlight colors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
