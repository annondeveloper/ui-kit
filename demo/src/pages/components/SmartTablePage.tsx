'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SmartTable } from '@ui/domain/smart-table'
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
    @scope (.smart-table-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: smart-table-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .smart-table-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .smart-table-page__hero::before {
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
        .smart-table-page__hero::before { animation: none; }
      }

      .smart-table-page__title {
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

      .smart-table-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .smart-table-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .smart-table-page__import-code {
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

      .smart-table-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .smart-table-page__section {
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
        .smart-table-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .smart-table-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .smart-table-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .smart-table-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .smart-table-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .smart-table-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .smart-table-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .smart-table-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container smart-table-page (max-width: 680px) {
        .smart-table-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .smart-table-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .smart-table-page__playground-result {
        min-block-size: 200px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .smart-table-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .smart-table-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .smart-table-page__playground-controls {
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

      .smart-table-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .smart-table-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .smart-table-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .smart-table-page__option-btn {
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
      .smart-table-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .smart-table-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .smart-table-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .smart-table-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .smart-table-page__code-tabs {
        margin-block-start: 1rem;
      }

      .smart-table-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .smart-table-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .smart-table-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .smart-table-page__tier-card {
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

      .smart-table-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .smart-table-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .smart-table-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .smart-table-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .smart-table-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .smart-table-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .smart-table-page__tier-import {
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

      .smart-table-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .smart-table-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .smart-table-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .smart-table-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .smart-table-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .smart-table-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .smart-table-page__a11y-key {
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
        .smart-table-page__hero { padding: 2rem 1.25rem; }
        .smart-table-page__title { font-size: 1.75rem; }
        .smart-table-page__preview { padding: 1.25rem; }
        .smart-table-page__playground { grid-template-columns: 1fr; }
        .smart-table-page__tiers { grid-template-columns: 1fr; }
        .smart-table-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .smart-table-page__hero { padding: 1.5rem 1rem; }
        .smart-table-page__title { font-size: 1.5rem; }
        .smart-table-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .smart-table-page__import-code,
      .smart-table-page code,
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

// ─── Sample Data ──────────────────────────────────────────────────────────────

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
}

const SAMPLE_DATA: User[] = [
  { id: 1, name: 'Alice Chen', email: 'alice@acme.io', role: 'Admin', status: 'active', lastLogin: '2026-03-24' },
  { id: 2, name: 'Bob Martinez', email: 'bob@acme.io', role: 'Editor', status: 'active', lastLogin: '2026-03-23' },
  { id: 3, name: 'Carol Kim', email: 'carol@acme.io', role: 'Viewer', status: 'inactive', lastLogin: '2026-02-15' },
  { id: 4, name: 'Dan Okafor', email: 'dan@acme.io', role: 'Editor', status: 'pending', lastLogin: '2026-03-22' },
  { id: 5, name: 'Eve Larsson', email: 'eve@acme.io', role: 'Admin', status: 'active', lastLogin: '2026-03-24' },
  { id: 6, name: 'Frank Wu', email: 'frank@acme.io', role: 'Viewer', status: 'active', lastLogin: '2026-03-20' },
  { id: 7, name: 'Grace Patel', email: 'grace@acme.io', role: 'Editor', status: 'inactive', lastLogin: '2026-01-10' },
  { id: 8, name: 'Henry Dubois', email: 'henry@acme.io', role: 'Viewer', status: 'pending', lastLogin: '2026-03-18' },
]

const COLUMNS = [
  { id: 'name', header: 'Name', accessor: 'name' as const, sortable: true },
  { id: 'email', header: 'Email', accessor: 'email' as const, sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' as const, sortable: true },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status' as const,
    sortable: true,
    cell: (value: unknown) => {
      const v = value as string
      const color = v === 'active' ? 'oklch(72% 0.19 155)' : v === 'pending' ? 'oklch(80% 0.16 80)' : 'oklch(60% 0 0)'
      return (
        <span style={{ color, fontWeight: 500, textTransform: 'capitalize' as const }}>{v}</span>
      )
    },
  },
  { id: 'lastLogin', header: 'Last Login', accessor: 'lastLogin' as const, sortable: true },
]

// ─── Props Data ───────────────────────────────────────────────────────────────

const smartTableProps: PropDef[] = [
  { name: 'data', type: 'T[]', required: true, description: 'Array of row objects to display in the table.' },
  { name: 'columns', type: 'ColumnDef<T>[]', required: true, description: 'Column definitions controlling header, accessor, sorting, and rendering.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable the search bar above the table.' },
  { name: 'searchPlaceholder', type: 'string', description: 'Placeholder text for the search input.' },
  { name: 'filterable', type: 'boolean', default: 'false', description: 'Alias for searchable. Enables the search bar.' },
  { name: 'paginated', type: 'boolean', default: 'false', description: 'Enable pagination controls below the table.' },
  { name: 'pageSize', type: 'number', default: '10', description: 'Number of rows per page when paginated.' },
  { name: 'sortable', type: 'boolean', default: 'true', description: 'Enable column sorting via header clicks.' },
  { name: 'columnToggle', type: 'boolean', default: 'false', description: 'Show a dropdown to toggle column visibility.' },
  { name: 'selectable', type: 'boolean', default: 'false', description: 'Enable row selection with checkboxes.' },
  { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Keep the header row fixed while scrolling.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show a loading overlay on the table.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the root element.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SmartTable } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SmartTable } from '@annondeveloper/ui-kit'",
  premium: "import { SmartTable } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="smart-table-page__copy-btn"
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
    <label className="smart-table-page__toggle-label">
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

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  searchable: boolean,
  paginated: boolean,
  sortable: boolean,
  selectable: boolean,
  stickyHeader: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  data={users}',
    '  columns={columns}',
  ]
  if (searchable) props.push('  searchable')
  if (paginated) props.push('  paginated')
  if (!sortable) props.push('  sortable={false}')
  if (selectable && tier !== 'lite') props.push('  selectable')
  if (stickyHeader && tier !== 'lite') props.push('  stickyHeader')

  return `${importStr}

const columns = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true },
]

<SmartTable
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, searchable: boolean, paginated: boolean): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/smart-table.css';`

  return `<!-- SmartTable — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/smart-table.css">

<div class="ui-smart-table"${searchable ? ' data-searchable' : ''}${paginated ? ' data-paginated' : ''}>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Alice Chen</td><td>alice@acme.io</td><td>Admin</td><td>active</td></tr>
    </tbody>
  </table>
</div>

<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, searchable: boolean, paginated: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-smart-table">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.id">{{ col.header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.id">
          <td v-for="col in columns" :key="col.id">{{ row[col.accessor] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :data="users"', '  :columns="columns"']
  if (searchable) attrs.push('  searchable')
  if (paginated) attrs.push('  paginated')

  return `<template>
  <SmartTable
${attrs.join('\n')}
  />
</template>

<script setup>
import { SmartTable } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, searchable: boolean, paginated: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<div class="ui-data-table"${searchable ? ' data-searchable' : ''}${paginated ? ' data-paginated' : ''}>
  <table>
    <thead>
      <tr>
        <th *ngFor="let col of columns">{{ col.header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let row of data">
        <td *ngFor="let col of columns">{{ row[col.accessor] }}</td>
      </tr>
    </tbody>
  </table>
</div>

/* Import component CSS */
@import '${importPath}/css/components/smart-table.css';`
}

function generateSvelteCode(tier: Tier, searchable: boolean, paginated: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-smart-table">
  <table>
    <thead>
      <tr>
        {#each columns as col}
          <th>{col.header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr>
          {#each columns as col}
            <td>{row[col.accessor]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  data={users}', '  columns={columns}']
  if (searchable) attrs.push('  searchable')
  if (paginated) attrs.push('  paginated')

  return `<script>
  import { SmartTable } from '${importPath}';
</script>

<SmartTable
${attrs.join('\n')}
/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [searchable, setSearchable] = useState(true)
  const [paginated, setPaginated] = useState(true)
  const [sortable, setSortable] = useState(true)
  const [selectable, setSelectable] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, searchable, paginated, sortable, selectable, stickyHeader),
    [tier, searchable, paginated, sortable, selectable, stickyHeader],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, searchable, paginated), [tier, searchable, paginated])
  const vueCode = useMemo(() => generateVueCode(tier, searchable, paginated), [tier, searchable, paginated])
  const angularCode = useMemo(() => generateAngularCode(tier, searchable, paginated), [tier, searchable, paginated])
  const svelteCode = useMemo(() => generateSvelteCode(tier, searchable, paginated), [tier, searchable, paginated])

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
    <section className="smart-table-page__section" id="playground">
      <h2 className="smart-table-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="smart-table-page__section-desc">
        Toggle features and see the table update in real-time. Generated code updates as you change settings.
      </p>

      <div className="smart-table-page__playground">
        <div className="smart-table-page__playground-preview">
          <div className="smart-table-page__playground-result">
            <SmartTable
              data={SAMPLE_DATA}
              columns={COLUMNS}
              searchable={searchable}
              paginated={paginated}
              sortable={sortable}
              selectable={selectable && tier !== 'lite'}
              stickyHeader={stickyHeader && tier !== 'lite'}
              pageSize={5}
            />
          </div>

          <div className="smart-table-page__code-tabs">
            <div className="smart-table-page__export-row">
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
              {copyStatus && <span className="smart-table-page__export-status">{copyStatus}</span>}
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

        <div className="smart-table-page__playground-controls">
          <div className="smart-table-page__control-group">
            <span className="smart-table-page__control-label">Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />
              <Toggle label="Paginated" checked={paginated} onChange={setPaginated} />
              <Toggle label="Sortable" checked={sortable} onChange={setSortable} />
              {tier !== 'lite' && <Toggle label="Selectable rows" checked={selectable} onChange={setSelectable} />}
              {tier !== 'lite' && <Toggle label="Sticky header" checked={stickyHeader} onChange={setStickyHeader} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SmartTablePage() {
  useStyles('smart-table-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.smart-table-page__section')
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
    <div className="smart-table-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="smart-table-page__hero">
        <h1 className="smart-table-page__title">SmartTable</h1>
        <p className="smart-table-page__desc">
          Convenience wrapper around DataTable with search, sort, pagination, and column toggle.
          Ideal for admin dashboards and data-heavy interfaces. Zero external dependencies.
        </p>
        <div className="smart-table-page__import-row">
          <code className="smart-table-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Basic Usage ──────────────────────────────── */}
      <section className="smart-table-page__section" id="basic">
        <h2 className="smart-table-page__section-title">
          <a href="#basic">Basic Usage</a>
        </h2>
        <p className="smart-table-page__section-desc">
          A minimal SmartTable with just data and columns. Sorting is enabled by default.
        </p>
        <div className="smart-table-page__preview">
          <SmartTable data={SAMPLE_DATA.slice(0, 4)} columns={COLUMNS} />
        </div>
      </section>

      {/* ── 4. With Search ─────────────────────────────── */}
      <section className="smart-table-page__section" id="search">
        <h2 className="smart-table-page__section-title">
          <a href="#search">Search & Filter</a>
        </h2>
        <p className="smart-table-page__section-desc">
          Enable the search bar to let users filter rows across all columns. Matches are
          case-insensitive and search across all visible column values.
        </p>
        <div className="smart-table-page__preview">
          <SmartTable
            data={SAMPLE_DATA}
            columns={COLUMNS}
            searchable
            searchPlaceholder="Search users..."
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SmartTable
  data={users}
  columns={columns}
  searchable
  searchPlaceholder="Search users..."
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Paginated ───────────────────────────────── */}
      <section className="smart-table-page__section" id="pagination">
        <h2 className="smart-table-page__section-title">
          <a href="#pagination">Pagination</a>
        </h2>
        <p className="smart-table-page__section-desc">
          Enable pagination for large datasets. Controls page size and navigation automatically.
        </p>
        <div className="smart-table-page__preview">
          <SmartTable
            data={SAMPLE_DATA}
            columns={COLUMNS}
            paginated
            pageSize={3}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SmartTable
  data={users}
  columns={columns}
  paginated
  pageSize={3}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Full Featured ───────────────────────────── */}
      <section className="smart-table-page__section" id="full-featured">
        <h2 className="smart-table-page__section-title">
          <a href="#full-featured">Full Featured</a>
        </h2>
        <p className="smart-table-page__section-desc">
          All features enabled: search, pagination, sorting, and column toggle. This is the
          common configuration for admin dashboards.
        </p>
        <div className="smart-table-page__preview">
          <SmartTable
            data={SAMPLE_DATA}
            columns={COLUMNS}
            searchable
            paginated
            pageSize={4}
            sortable
            columnToggle
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="smart-table-page__section" id="tiers">
        <h2 className="smart-table-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="smart-table-page__section-desc">
          Choose the right balance of features and bundle size. SmartTable wraps DataTable,
          so all tiers share the same underlying engine with different feature sets.
        </p>

        <div className="smart-table-page__tiers">
          {/* Lite */}
          <div
            className={`smart-table-page__tier-card${tier === 'lite' ? ' smart-table-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="smart-table-page__tier-header">
              <span className="smart-table-page__tier-name">Lite</span>
              <span className="smart-table-page__tier-size">~2.5 KB</span>
            </div>
            <p className="smart-table-page__tier-desc">
              CSS-only table with basic sort indicators. No search bar, no pagination controls, no JS interactivity beyond the wrapper.
            </p>
            <div className="smart-table-page__tier-import">
              import {'{'} SmartTable {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="smart-table-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Static table rendering</span>
            </div>
            <div className="smart-table-page__size-breakdown">
              <div className="smart-table-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`smart-table-page__tier-card${tier === 'standard' ? ' smart-table-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="smart-table-page__tier-header">
              <span className="smart-table-page__tier-name">Standard</span>
              <span className="smart-table-page__tier-size">~5.5 KB</span>
            </div>
            <p className="smart-table-page__tier-desc">
              Full-featured table with search, sort, pagination, column toggle, and loading states. Accessible keyboard navigation included.
            </p>
            <div className="smart-table-page__tier-import">
              import {'{'} SmartTable {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="smart-table-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Search + Sort + Paginate</span>
            </div>
            <div className="smart-table-page__size-breakdown">
              <div className="smart-table-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`smart-table-page__tier-card${tier === 'premium' ? ' smart-table-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="smart-table-page__tier-header">
              <span className="smart-table-page__tier-name">Premium</span>
              <span className="smart-table-page__tier-size">~7.5 KB</span>
            </div>
            <p className="smart-table-page__tier-desc">
              Everything in Standard plus row selection, column resizing, column reordering,
              virtual scroll, export to CSV/JSON, and animated row transitions.
            </p>
            <div className="smart-table-page__tier-import">
              import {'{'} SmartTable {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="smart-table-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Resize + Reorder + Export</span>
            </div>
            <div className="smart-table-page__size-breakdown">
              <div className="smart-table-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>7.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>10.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="smart-table-page__section" id="props">
        <h2 className="smart-table-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="smart-table-page__section-desc">
          All props accepted by SmartTable. It wraps DataTable and maps its simplified API to
          the richer DataTable props. For new projects, prefer DataTable directly.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={smartTableProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="smart-table-page__section" id="accessibility">
        <h2 className="smart-table-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="smart-table-page__section-desc">
          Built on native HTML table elements with comprehensive ARIA support for data grids.
        </p>
        <Card variant="default" padding="md">
          <ul className="smart-table-page__a11y-list">
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Navigate cells with <code className="smart-table-page__a11y-key">Arrow</code> keys. Sort columns with <code className="smart-table-page__a11y-key">Enter</code>.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roles:</strong> Uses <code className="smart-table-page__a11y-key">role="grid"</code> with <code className="smart-table-page__a11y-key">aria-sort</code> on sortable headers.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Search:</strong> Live region announces result count as user types in the search field.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pagination:</strong> Uses <code className="smart-table-page__a11y-key">nav</code> landmark with descriptive labels for page navigation.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Announces loading state via <code className="smart-table-page__a11y-key">aria-busy="true"</code> on the table.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Selection:</strong> Checkboxes use proper <code className="smart-table-page__a11y-key">aria-label</code> per row context.
              </span>
            </li>
            <li className="smart-table-page__a11y-item">
              <span className="smart-table-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="smart-table-page__a11y-key">forced-colors: active</code> with visible table borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
