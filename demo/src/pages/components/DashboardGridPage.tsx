'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DashboardGrid, type DashboardGroup } from '@ui/domain/dashboard-grid'
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
    @scope (.dashboard-grid-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: dashboard-grid-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .dashboard-grid-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .dashboard-grid-page__hero::before {
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
        animation: dashboard-grid-page-aurora 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dashboard-grid-page-aurora {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dashboard-grid-page__hero::before { animation: none; }
      }

      .dashboard-grid-page__title {
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

      .dashboard-grid-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .dashboard-grid-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dashboard-grid-page__import-code {
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

      .dashboard-grid-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .dashboard-grid-page__section {
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
        animation: dashboard-grid-page-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dashboard-grid-page-reveal {
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
        .dashboard-grid-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .dashboard-grid-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .dashboard-grid-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .dashboard-grid-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .dashboard-grid-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .dashboard-grid-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .dashboard-grid-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .dashboard-grid-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .dashboard-grid-page__playground {
          grid-template-columns: 1fr;
        }
        .dashboard-grid-page__playground-controls {
          position: static !important;
        }
      }

      @container dashboard-grid-page (max-width: 680px) {
        .dashboard-grid-page__playground {
          grid-template-columns: 1fr;
        }
        .dashboard-grid-page__playground-controls {
          position: static !important;
        }
      }

      .dashboard-grid-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dashboard-grid-page__playground-result {
        min-block-size: 200px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .dashboard-grid-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .dashboard-grid-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .dashboard-grid-page__playground-controls {
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

      .dashboard-grid-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dashboard-grid-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dashboard-grid-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .dashboard-grid-page__option-btn {
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
      .dashboard-grid-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .dashboard-grid-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .dashboard-grid-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .dashboard-grid-page__code-tabs {
        margin-block-start: 1rem;
      }

      .dashboard-grid-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .dashboard-grid-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .dashboard-grid-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .dashboard-grid-page__tier-card {
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

      .dashboard-grid-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .dashboard-grid-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .dashboard-grid-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dashboard-grid-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .dashboard-grid-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .dashboard-grid-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .dashboard-grid-page__tier-import {
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

      /* ── Demo card ──────────────────────────────────── */

      .dashboard-grid-page__demo-card {
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .dashboard-grid-page__demo-card-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .dashboard-grid-page__demo-card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--brand);
        font-variant-numeric: tabular-nums;
      }

      .dashboard-grid-page__demo-card-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .dashboard-grid-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .dashboard-grid-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .dashboard-grid-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .dashboard-grid-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .dashboard-grid-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .dashboard-grid-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      .dashboard-grid-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .dashboard-grid-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .dashboard-grid-page__hero {
          padding: 2rem 1.25rem;
        }
        .dashboard-grid-page__title {
          font-size: 1.75rem;
        }
        .dashboard-grid-page__playground {
          grid-template-columns: 1fr;
        }
        .dashboard-grid-page__tiers {
          grid-template-columns: 1fr;
        }
        .dashboard-grid-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .dashboard-grid-page__hero {
          padding: 1.5rem 1rem;
        }
        .dashboard-grid-page__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .dashboard-grid-page__title {
          font-size: 4rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .dashboard-grid-page__import-code,
      .dashboard-grid-page code,
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
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const dashboardGridProps: PropDef[] = [
  { name: 'groups', type: 'DashboardGroup[]', description: 'Array of groups for grouped mode. Each group has a title, optional description/summary, and items.' },
  { name: 'columns', type: "number | 'auto'", default: "'auto'", description: 'Fixed column count (1-6) or auto-fit. Auto uses minmax(280px, 1fr).' },
  { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Spacing between grid items.' },
  { name: 'children', type: 'ReactNode', description: 'Direct children for ungrouped mode. Rendered in a flat grid.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override for collapse/expand transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

const dashboardGroupProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the group.' },
  { name: 'title', type: 'ReactNode', required: true, description: 'Group heading content.' },
  { name: 'description', type: 'string', description: 'Optional description shown below the header.' },
  { name: 'summary', type: 'ReactNode', description: 'Aggregated summary rendered inline with the title (e.g., total count).' },
  { name: 'items', type: 'ReactNode[]', required: true, description: 'Array of child cards/components to render in the group grid.' },
  { name: 'collapsed', type: 'boolean', default: 'false', description: 'Initial collapsed state. Users can toggle via the header button.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Columns = 'auto' | '1' | '2' | '3' | '4'
type Gap = 'sm' | 'md' | 'lg'

const COLUMNS: Columns[] = ['auto', '1', '2', '3', '4']
const GAPS: Gap[] = ['sm', 'md', 'lg']

const IMPORT_STRING = "import { DashboardGrid } from '@annondeveloper/ui-kit'"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="dashboard-grid-page__copy-btn"
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
    <div className="dashboard-grid-page__control-group">
      <span className="dashboard-grid-page__control-label">{label}</span>
      <div className="dashboard-grid-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`dashboard-grid-page__option-btn${opt === value ? ' dashboard-grid-page__option-btn--active' : ''}`}
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
    <label className="dashboard-grid-page__toggle-label">
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

function DemoCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <div className="dashboard-grid-page__demo-card">
      <div className="dashboard-grid-page__demo-card-title">{title}</div>
      <div className="dashboard-grid-page__demo-card-value">{value}</div>
      <div className="dashboard-grid-page__demo-card-desc">{desc}</div>
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  columns: Columns,
  gap: Gap,
  useGroups: boolean,
  motion: number,
): string {
  if (useGroups) {
    const props: string[] = ['  groups={groups}']
    if (columns !== 'auto') props.push(`  columns={${columns}}`)
    if (gap !== 'md') props.push(`  gap="${gap}"`)
    if (motion !== 3) props.push(`  motion={${motion}}`)

    return `${IMPORT_STRING}\nimport type { DashboardGroup } from '@annondeveloper/ui-kit'\n\nconst groups: DashboardGroup[] = [\n  {\n    id: 'traffic',\n    title: 'Traffic',\n    summary: <span>1.2M total</span>,\n    items: [\n      <MetricCard title="Page Views" value="845K" />,\n      <MetricCard title="Visitors" value="312K" />,\n    ],\n  },\n  {\n    id: 'revenue',\n    title: 'Revenue',\n    items: [\n      <MetricCard title="MRR" value="$42.5K" />,\n      <MetricCard title="ARR" value="$510K" />,\n    ],\n  },\n]\n\n<DashboardGrid\n${props.join('\n')}\n/>`
  }

  const props: string[] = []
  if (columns !== 'auto') props.push(`  columns={${columns}}`)
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `${IMPORT_STRING}\n\n<DashboardGrid${propsStr}>\n  <MetricCard title="Users" value="1,234" />\n  <MetricCard title="Revenue" value="$42.5K" />\n  <MetricCard title="Orders" value="567" />\n  <MetricCard title="Conversion" value="3.2%" />\n</DashboardGrid>`
}

function generateHtmlCode(columns: Columns, gap: Gap): string {
  const attrs = [`class="ui-dashboard-grid"`]
  if (columns !== 'auto') attrs.push(`data-columns="${columns}"`)
  attrs.push(`data-gap="${gap}"`)

  return `<!-- DashboardGrid layout -->\n<div ${attrs.join(' ')}>\n  <div class="ui-dashboard-grid__grid">\n    <div class="ui-dashboard-grid__item">\n      <!-- Your card component -->\n    </div>\n    <div class="ui-dashboard-grid__item">\n      <!-- Your card component -->\n    </div>\n  </div>\n</div>\n\n<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/dashboard-grid.css">`
}

function generateVueCode(columns: Columns, gap: Gap): string {
  const props: string[] = []
  if (columns !== 'auto') props.push(`  :columns="${columns}"`)
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<template>\n  <DashboardGrid${propsStr}>\n    <MetricCard title="Users" value="1,234" />\n    <MetricCard title="Revenue" value="$42.5K" />\n  </DashboardGrid>\n</template>\n\n<script setup>\nimport { DashboardGrid } from '@annondeveloper/ui-kit'\n</script>`
}

function generateAngularCode(columns: Columns, gap: Gap): string {
  const attrs = [`class="ui-dashboard-grid"`, `data-gap="${gap}"`]
  if (columns !== 'auto') attrs.push(`data-columns="${columns}"`)
  return `<!-- Angular — CSS class approach -->\n<div ${attrs.join(' ')}>\n  <div class="ui-dashboard-grid__grid">\n    <div class="ui-dashboard-grid__item" *ngFor="let card of cards">\n      <app-metric-card [title]="card.title" [value]="card.value" />\n    </div>\n  </div>\n</div>\n\n@import '@annondeveloper/ui-kit/css/components/dashboard-grid.css';`
}

function generateSvelteCode(columns: Columns, gap: Gap): string {
  const props: string[] = []
  if (columns !== 'auto') props.push(`  columns={${columns}}`)
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>\n  import { DashboardGrid } from '@annondeveloper/ui-kit';\n</script>\n\n<DashboardGrid${propsStr}>\n  <MetricCard title="Users" value="1,234" />\n  <MetricCard title="Revenue" value="$42.5K" />\n</DashboardGrid>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection() {
  const [columns, setColumns] = useState<Columns>('auto')
  const [gap, setGap] = useState<Gap>('md')
  const [useGroups, setUseGroups] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const colValue = columns === 'auto' ? 'auto' as const : Number(columns)

  const groups: DashboardGroup[] = useMemo(() => [
    {
      id: 'traffic',
      title: 'Traffic Metrics',
      summary: <span style={{ color: 'var(--brand)' }}>1.2M total</span>,
      description: 'Overview of website traffic and engagement.',
      items: [
        <DemoCard key="pv" title="Page Views" value="845K" desc="+12% vs last month" />,
        <DemoCard key="vis" title="Visitors" value="312K" desc="+8% vs last month" />,
        <DemoCard key="bounce" title="Bounce Rate" value="34%" desc="-2% improvement" />,
      ],
    },
    {
      id: 'revenue',
      title: 'Revenue',
      summary: <span style={{ color: 'var(--brand)' }}>$510K ARR</span>,
      items: [
        <DemoCard key="mrr" title="MRR" value="$42.5K" desc="Monthly recurring" />,
        <DemoCard key="arr" title="ARR" value="$510K" desc="Annual recurring" />,
      ],
    },
  ], [])

  const reactCode = useMemo(() => generateReactCode(columns, gap, useGroups, motion), [columns, gap, useGroups, motion])
  const htmlCode = useMemo(() => generateHtmlCode(columns, gap), [columns, gap])
  const vueCode = useMemo(() => generateVueCode(columns, gap), [columns, gap])
  const angularCode = useMemo(() => generateAngularCode(columns, gap), [columns, gap])
  const svelteCode = useMemo(() => generateSvelteCode(columns, gap), [columns, gap])

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
    <section className="dashboard-grid-page__section" id="playground">
      <h2 className="dashboard-grid-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="dashboard-grid-page__section-desc">
        Configure columns, gap, and grouping mode to see DashboardGrid adapt in real-time.
      </p>

      <div className="dashboard-grid-page__playground">
        <div className="dashboard-grid-page__playground-preview">
          <div className="dashboard-grid-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1 }}>
              {useGroups ? (
                <DashboardGrid groups={groups} columns={colValue} gap={gap} motion={motion} />
              ) : (
                <DashboardGrid columns={colValue} gap={gap} motion={motion}>
                  <DemoCard title="Users" value="1,234" desc="Active users" />
                  <DemoCard title="Revenue" value="$42.5K" desc="This month" />
                  <DemoCard title="Orders" value="567" desc="Pending" />
                  <DemoCard title="Conversion" value="3.2%" desc="+0.5% vs last week" />
                  <DemoCard title="Sessions" value="8.4K" desc="Average daily" />
                  <DemoCard title="Uptime" value="99.9%" desc="Last 30 days" />
                </DashboardGrid>
              )}
            </div>
          </div>

          <div className="dashboard-grid-page__code-tabs">
            <div className="dashboard-grid-page__export-row">
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
              {copyStatus && <span className="dashboard-grid-page__export-status">{copyStatus}</span>}
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

        <div className="dashboard-grid-page__playground-controls">
          <OptionGroup label="Columns" options={COLUMNS} value={columns} onChange={setColumns} />
          <OptionGroup label="Gap" options={GAPS} value={gap} onChange={setGap} />
          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <div className="dashboard-grid-page__control-group">
            <span className="dashboard-grid-page__control-label">Mode</span>
            <Toggle label="Use groups" checked={useGroups} onChange={setUseGroups} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardGridPage() {
  useStyles('dashboard-grid-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.dashboard-grid-page__section')
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
    <div className="dashboard-grid-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="dashboard-grid-page__hero">
        <h1 className="dashboard-grid-page__title">DashboardGrid</h1>
        <p className="dashboard-grid-page__desc">
          Responsive auto-fit grid for dashboard cards with collapsible group sections, summary
          aggregations, and container-query responsive scaling. Ships as a domain component.
        </p>
        <div className="dashboard-grid-page__import-row">
          <code className="dashboard-grid-page__import-code">{IMPORT_STRING}</code>
          <CopyButton text={IMPORT_STRING} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection />

      {/* ── 3. Column Modes ─────────────────────────────── */}
      <section className="dashboard-grid-page__section" id="columns">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#columns">Column Modes</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          Use <code className="dashboard-grid-page__a11y-key">columns="auto"</code> for responsive auto-fit
          or a fixed number (1-6) for explicit control.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {([['auto', 'Auto-fit (default)'], ['2', '2 columns'], ['3', '3 columns']] as const).map(([col, label]) => (
            <div key={col}>
              <div className="dashboard-grid-page__item-label" style={{ marginBlockEnd: '0.5rem' }}>{label}</div>
              <div className="dashboard-grid-page__preview">
                <DashboardGrid columns={col === 'auto' ? 'auto' : Number(col)} gap="sm">
                  <DemoCard title="Metric A" value="123" desc="Description" />
                  <DemoCard title="Metric B" value="456" desc="Description" />
                  <DemoCard title="Metric C" value="789" desc="Description" />
                  <DemoCard title="Metric D" value="012" desc="Description" />
                </DashboardGrid>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Gap Sizes ───────────────────────────────── */}
      <section className="dashboard-grid-page__section" id="gaps">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#gaps">Gap Sizes</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          Three spacing presets that map to design token values.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(['sm', 'md', 'lg'] as const).map(g => (
            <div key={g}>
              <div className="dashboard-grid-page__item-label" style={{ marginBlockEnd: '0.5rem' }}>gap="{g}"</div>
              <div className="dashboard-grid-page__preview">
                <DashboardGrid columns={3} gap={g}>
                  <DemoCard title="Card 1" value="100" desc="Small gap" />
                  <DemoCard title="Card 2" value="200" desc="Medium gap" />
                  <DemoCard title="Card 3" value="300" desc="Large gap" />
                </DashboardGrid>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Grouped Mode ─────────────────────────────── */}
      <section className="dashboard-grid-page__section" id="groups">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#groups">Grouped Mode</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          Pass an array of <code className="dashboard-grid-page__a11y-key">DashboardGroup</code> objects to organize
          cards into collapsible sections with titles, descriptions, and summary badges.
        </p>
        <div className="dashboard-grid-page__preview">
          <DashboardGrid
            groups={[
              {
                id: 'infra',
                title: 'Infrastructure',
                summary: <span style={{ color: 'oklch(72% 0.19 155)' }}>All healthy</span>,
                description: 'Server and network health metrics.',
                items: [
                  <DemoCard key="cpu" title="CPU Usage" value="42%" desc="Average across cluster" />,
                  <DemoCard key="mem" title="Memory" value="68%" desc="Used of 128GB" />,
                  <DemoCard key="net" title="Network" value="2.4 Gbps" desc="Current throughput" />,
                ],
              },
              {
                id: 'app',
                title: 'Application',
                summary: <span style={{ color: 'oklch(80% 0.18 85)' }}>2 warnings</span>,
                items: [
                  <DemoCard key="p50" title="P50 Latency" value="45ms" desc="API response time" />,
                  <DemoCard key="err" title="Error Rate" value="0.12%" desc="Last hour" />,
                ],
              },
            ]}
            gap="md"
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const groups: DashboardGroup[] = [\n  {\n    id: 'infra',\n    title: 'Infrastructure',\n    summary: <span>All healthy</span>,\n    description: 'Server and network metrics.',\n    items: [\n      <MetricCard title="CPU" value="42%" />,\n      <MetricCard title="Memory" value="68%" />,\n    ],\n  },\n]\n\n<DashboardGrid groups={groups} />`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 6. Collapsed Groups ─────────────────────────── */}
      <section className="dashboard-grid-page__section" id="collapsed">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#collapsed">Collapsible Groups</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          Groups can start collapsed and users can toggle them. Click the group header to expand or collapse.
          The animation respects the current motion level.
        </p>
        <div className="dashboard-grid-page__preview">
          <DashboardGrid
            groups={[
              {
                id: 'expanded',
                title: 'Expanded Group',
                items: [
                  <DemoCard key="a" title="Visible" value="Yes" desc="This group starts expanded" />,
                  <DemoCard key="b" title="Cards" value="2" desc="Visible by default" />,
                ],
              },
              {
                id: 'collapsed-group',
                title: 'Collapsed Group (click to expand)',
                collapsed: true,
                items: [
                  <DemoCard key="c" title="Hidden" value="Initially" desc="Click header to reveal" />,
                ],
              },
            ]}
          />
        </div>
      </section>

      {/* ── 7. Container Queries ─────────────────────────── */}
      <section className="dashboard-grid-page__section" id="container-queries">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#container-queries">Container Queries</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          DashboardGrid uses <code className="dashboard-grid-page__a11y-key">container-type: inline-size</code> for
          responsive column scaling. At narrow widths, it collapses to a single column. At ultra-wide
          (&gt;3000px), it uses larger min widths for cards.
        </p>
        <CopyBlock
          code={`/* Built-in container query breakpoints */\n@container (max-width: 300px) {\n  .ui-dashboard-grid__grid { grid-template-columns: 1fr; }\n}\n\n@container (min-width: 3000px) {\n  .ui-dashboard-grid__grid {\n    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));\n  }\n}`}
          language="css"
          showLineNumbers
        />
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="dashboard-grid-page__section" id="tiers">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          DashboardGrid is a domain component available only at the standard tier.
          No lite or premium variants exist.
        </p>
        <div className="dashboard-grid-page__tiers">
          <div
            className="dashboard-grid-page__tier-card"
            style={{ opacity: 0.5, pointerEvents: 'none' }}
          >
            <div className="dashboard-grid-page__tier-header">
              <span className="dashboard-grid-page__tier-name">Lite</span>
              <span className="dashboard-grid-page__tier-size">N/A</span>
            </div>
            <p className="dashboard-grid-page__tier-desc">
              No lite tier for DashboardGrid. Use CSS Grid directly for a minimal approach.
            </p>
          </div>

          <div
            className={`dashboard-grid-page__tier-card dashboard-grid-page__tier-card--active`}
          >
            <div className="dashboard-grid-page__tier-header">
              <span className="dashboard-grid-page__tier-name">Standard</span>
              <span className="dashboard-grid-page__tier-size">~2.5 KB</span>
            </div>
            <p className="dashboard-grid-page__tier-desc">
              Full-featured grid with groups, collapsible sections, summary aggregation,
              container queries, motion, error boundary, and accessibility.
            </p>
            <div className="dashboard-grid-page__tier-import">
              import {'{'} DashboardGrid {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="dashboard-grid-page__size-breakdown">
              <div className="dashboard-grid-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
              </div>
            </div>
          </div>

          <div
            className="dashboard-grid-page__tier-card"
            style={{ opacity: 0.5, pointerEvents: 'none' }}
          >
            <div className="dashboard-grid-page__tier-header">
              <span className="dashboard-grid-page__tier-name">Premium</span>
              <span className="dashboard-grid-page__tier-size">= Standard</span>
            </div>
            <p className="dashboard-grid-page__tier-desc">
              No separate premium tier. Standard includes all features.
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. DashboardGroup Interface ──────────────────── */}
      <section className="dashboard-grid-page__section" id="group-interface">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#group-interface">DashboardGroup Interface</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          Each group in the groups array follows this interface.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dashboardGroupProps} />
        </Card>
      </section>

      {/* ── 10. Props API ───────────────────────────────── */}
      <section className="dashboard-grid-page__section" id="props">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          All props accepted by DashboardGrid. It also spreads native div attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dashboardGridProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="dashboard-grid-page__section" id="accessibility">
        <h2 className="dashboard-grid-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="dashboard-grid-page__section-desc">
          DashboardGrid uses semantic section elements with accessible expand/collapse controls.
        </p>
        <Card variant="default" padding="md">
          <ul className="dashboard-grid-page__a11y-list">
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Sections:</strong> Each group renders as a <code className="dashboard-grid-page__a11y-key">&lt;section&gt;</code> element
                with an <code className="dashboard-grid-page__a11y-key">&lt;h3&gt;</code> heading.
              </span>
            </li>
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Expand/collapse:</strong> Toggle button has <code className="dashboard-grid-page__a11y-key">aria-expanded</code> reflecting
                current state.
              </span>
            </li>
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Group header buttons show visible focus ring via <code className="dashboard-grid-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced colors:</strong> Group headers get a visible 1px border in forced-colors mode.
              </span>
            </li>
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> All groups expand automatically when printing, ensuring no content is hidden.
              </span>
            </li>
            <li className="dashboard-grid-page__a11y-item">
              <span className="dashboard-grid-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error boundary:</strong> Wrapped in ComponentErrorBoundary to gracefully handle child render errors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
