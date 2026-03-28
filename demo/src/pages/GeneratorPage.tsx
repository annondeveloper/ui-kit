'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { SearchInput } from '@ui/components/search-input'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { MetricCard } from '@ui/domain/metric-card'
import { DataTable, type ColumnDef } from '@ui/domain/data-table'
import { useTier } from '../App'
import { getComponentDatabase, searchComponents, type ComponentInfo } from '../utils/component-database'
import {
  generateFromTemplate,
  generateFromComponents,
  type LayoutTemplate,
  type GeneratedCode,
} from '../utils/code-generator'

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .gen-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────────────── */
    .gen-hero {
      margin-block-end: 2.5rem;
    }

    .gen-hero__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
      background: linear-gradient(135deg, oklch(75% 0.2 270), oklch(70% 0.25 300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gen-hero__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 600px;
    }

    /* ── Section Headers ──────────────────────────────────────────────── */
    .gen-section {
      margin-block-end: 2.5rem;
    }

    .gen-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .gen-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .gen-section__badge {
      font-size: 0.75rem;
    }

    /* ── Template Gallery ─────────────────────────────────────────────── */
    .gen-templates {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1rem;
    }

    .gen-template-card {
      position: relative;
      padding: 1.25rem;
      border-radius: 12px;
      background: var(--bg-elevated);
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &[data-active='true'] {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px oklch(from var(--brand) l c h / 0.15);
      }
    }

    .gen-template-card__icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: oklch(from var(--brand) l c h / 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-block-end: 0.75rem;
      color: var(--brand-light);
    }

    .gen-template-card__title {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-block-end: 0.25rem;
    }

    .gen-template-card__desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .gen-template-card__components {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-block-start: 0.75rem;
    }

    /* ── Custom Builder ───────────────────────────────────────────────── */
    .gen-builder {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .gen-builder__panel {
      min-height: 300px;
    }

    .gen-builder__panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: 0.75rem;
    }

    .gen-builder__panel-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-component-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      max-height: 400px;
      overflow-y: auto;
      padding-inline-end: 0.25rem;
    }

    .gen-component-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      background: var(--bg-elevated);
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s, transform 0.15s;
      user-select: none;

      &:hover {
        background: var(--bg-hover);
      }

      &[draggable='true'] {
        cursor: grab;
      }

      &[draggable='true']:active {
        cursor: grabbing;
      }

      &.gen-dragging {
        opacity: 0.4;
        transform: scale(0.97);
      }
    }

    .gen-drag-handle {
      display: flex;
      align-items: center;
      color: var(--text-tertiary);
      flex-shrink: 0;
      cursor: grab;
      touch-action: none;

      &:active {
        cursor: grabbing;
      }
    }

    .gen-drag-handle__icon {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 12px;
      align-items: center;
    }

    .gen-drag-handle__dots {
      display: flex;
      gap: 2px;
    }

    .gen-drag-handle__dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }

    .gen-component-item__name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .gen-component-item__desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gen-component-item__add {
      margin-inline-start: auto;
      flex-shrink: 0;
    }

    .gen-selected-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      min-height: 60px;
    }

    .gen-selected-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      background: oklch(from var(--brand) l c h / 0.1);
      border: 1px solid oklch(from var(--brand) l c h / 0.2);
      transition: opacity 0.15s, transform 0.15s;

      &[draggable='true'] {
        cursor: grab;
      }

      &[draggable='true']:active {
        cursor: grabbing;
      }

      &.gen-dragging {
        opacity: 0.4;
        transform: scale(0.97);
      }
    }

    .gen-selected-item__name {
      font-size: 0.875rem;
      font-weight: 600;
      flex: 1;
    }

    .gen-composition-drop-zone {
      min-height: 200px;
      border-radius: 12px;
      border: 2px dashed var(--border-default);
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      padding: 0.5rem;
    }

    .gen-composition-drop-zone[data-drag-over='true'] {
      border-color: var(--brand);
      background: oklch(from var(--brand) l c h / 0.05);
      box-shadow: 0 0 0 3px oklch(from var(--brand) l c h / 0.1);
    }

    .gen-selected-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      gap: 0.5rem;
    }

    .gen-selected-empty__icon {
      color: var(--text-tertiary);
      opacity: 0.5;
    }

    .gen-drag-indicator {
      height: 2px;
      background: var(--brand);
      border-radius: 1px;
      margin: -1px 0;
      transition: opacity 0.1s;
      box-shadow: 0 0 4px oklch(from var(--brand) l c h / 0.4);
    }

    .gen-item-enter {
      animation: gen-item-slide-in 0.2s ease-out;
    }

    @keyframes gen-item-slide-in {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .gen-item-remove {
      animation: gen-item-slide-out 0.15s ease-in forwards;
    }

    @keyframes gen-item-slide-out {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(20px) scale(0.95);
      }
    }

    /* ── Layout Selector ──────────────────────────────────────────────── */
    .gen-layout-selector {
      display: flex;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .gen-layout-btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.15);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    /* ── Tier Selector ────────────────────────────────────────────────── */
    .gen-tier-selector {
      display: flex;
      gap: 0.5rem;
      margin-block-end: 1.5rem;
    }

    .gen-tier-btn {
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.15);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    /* ── Code Output ──────────────────────────────────────────────────── */
    .gen-code-output {
      position: relative;
    }

    .gen-code-block {
      background: var(--bg-base);
      border-radius: 12px;
      border: 1px solid var(--border-default);
      overflow: hidden;
    }

    .gen-code-block__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: var(--bg-surface);
      border-block-end: 1px solid var(--border-default);
    }

    .gen-code-block__lang {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-code-block__copy {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      &[data-copied='true'] {
        color: oklch(75% 0.2 150);
        border-color: oklch(75% 0.2 150 / 0.3);
      }
    }

    .gen-code-block__content {
      padding: 1rem;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    .gen-code-block__pre {
      margin: 0;
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      line-height: 1.6;
      white-space: pre;
      color: var(--text-primary);
      tab-size: 2;
    }

    /* ── Preview ──────────────────────────────────────────────────────── */
    .gen-preview {
      border-radius: 12px;
      border: 1px solid var(--border-default);
      overflow: hidden;
      margin-block-end: 1.5rem;
    }

    .gen-preview__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: var(--bg-surface);
      border-block-end: 1px solid var(--border-default);
    }

    .gen-preview__title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-preview__dots {
      display: flex;
      gap: 6px;
    }

    .gen-preview__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .gen-preview__content {
      padding: 1.5rem;
      min-height: 200px;
      background: var(--bg-base);
    }

    .gen-preview__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
      text-align: center;
      gap: 0.5rem;
    }

    .gen-preview__placeholder-icon {
      color: var(--text-tertiary);
    }

    /* ── Inline Preview Components ────────────────────────────────────── */
    .gen-inline-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .gen-inline-metric {
      padding: 1rem;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
    }

    .gen-inline-metric__label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-block-end: 0.25rem;
    }

    .gen-inline-metric__value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .gen-inline-metric__change {
      font-size: 0.75rem;
      margin-block-start: 0.25rem;
    }

    .gen-inline-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
      margin-block-start: 1rem;
    }

    .gen-inline-table th {
      text-align: start;
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--border-default);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-inline-table td {
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--border-subtle);
    }

    .gen-inline-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .gen-inline-input {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .gen-inline-input label {
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .gen-inline-input input,
    .gen-inline-input select {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: inherit;
      font-size: 0.875rem;
    }

    .gen-inline-hero {
      text-align: center;
      padding: 2rem 1rem;
    }

    .gen-inline-hero h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-block-end: 0.5rem;
    }

    .gen-inline-hero p {
      color: var(--text-secondary);
      margin-block-end: 1rem;
      font-size: 0.875rem;
    }

    .gen-inline-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      margin-block-start: 1.5rem;
      text-align: start;
    }

    .gen-inline-feature {
      padding: 1rem;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
    }

    .gen-inline-feature h4 {
      font-size: 0.875rem;
      margin-block-end: 0.25rem;
    }

    .gen-inline-feature p {
      font-size: 0.75rem;
      margin: 0;
    }

    .gen-inline-btn {
      display: inline-flex;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .gen-inline-btn--primary {
      background: var(--brand);
      color: white;
    }

    .gen-inline-btn--outline {
      background: transparent;
      border: 1px solid var(--border-strong);
      color: var(--text-primary);
      margin-inline-start: 0.5rem;
    }

    /* ── Tab Override ─────────────────────────────────────────────────── */
    .gen-tabs {
      margin-block-end: 0;
    }
  }
`

// ─── Template Metadata ──────────────────────────────────────────────────────

interface TemplateInfo {
  id: LayoutTemplate
  title: string
  description: string
  icon: 'grid' | 'edit' | 'zap' | 'table'
  components: string[]
}

const templates: TemplateInfo[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'KPI cards, charts, and data tables for admin panels.',
    icon: 'grid',
    components: ['MetricCard', 'DataTable', 'Card', 'Badge'],
  },
  {
    id: 'form',
    title: 'Form',
    description: 'Contact or settings form with validation and submit.',
    icon: 'edit',
    components: ['FormInput', 'Select', 'Checkbox', 'Button', 'Card'],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Hero section with CTA, features grid, and badges.',
    icon: 'zap',
    components: ['ShimmerButton', 'Badge', 'Card', 'Typography'],
  },
  {
    id: 'data-table',
    title: 'Data Table',
    description: 'Searchable table with filters, badges, and actions.',
    icon: 'table',
    components: ['DataTable', 'SearchInput', 'Badge', 'Button'],
  },
]

// ─── Framework Tab Configs ──────────────────────────────────────────────────

type Framework = 'react' | 'vue' | 'angular' | 'svelte' | 'html'

interface FrameworkTab {
  value: Framework
  label: string
  lang: string
}

const frameworkTabs: FrameworkTab[] = [
  { value: 'react', label: 'React', lang: 'TSX' },
  { value: 'vue', label: 'Vue', lang: 'VUE' },
  { value: 'angular', label: 'Angular', lang: 'TS' },
  { value: 'svelte', label: 'Svelte', lang: 'SVELTE' },
  { value: 'html', label: 'HTML', lang: 'HTML' },
]

// ─── Copy Button ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button className="gen-code-block__copy" onClick={handleCopy} data-copied={copied}>
      <Icon name={copied ? 'check' : 'clipboard'} size="sm" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── Inline Preview Components ──────────────────────────────────────────────

function DashboardPreview() {
  const metrics = [
    { title: 'Revenue', value: '$48,230', change: { value: 12.5 }, trend: 'up' as const },
    { title: 'Users', value: '2,847', change: { value: 8.2 }, trend: 'up' as const },
    { title: 'Conversion', value: '3.24%', change: { value: -1.8 }, trend: 'down' as const },
    { title: 'Response', value: '142ms', change: { value: -5.3 }, trend: 'up' as const },
  ]

  type DashRow = { name: string; status: string; revenue: string; date: string }
  const dashColumns: ColumnDef<DashRow>[] = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status' },
    { id: 'revenue', header: 'Revenue', accessor: 'revenue', sortable: true },
    { id: 'date', header: 'Date', accessor: 'date' },
  ]
  const dashData: DashRow[] = [
    { name: 'Widget Pro', status: 'Active', revenue: '$12,400', date: '2026-03-15' },
    { name: 'Dashboard X', status: 'Active', revenue: '$8,200', date: '2026-03-14' },
    { name: 'Analytics+', status: 'Paused', revenue: '$4,100', date: '2026-03-13' },
  ]

  return (
    <>
      <div className="gen-inline-grid">
        {metrics.map(m => (
          <MetricCard key={m.title} title={m.title} value={m.value} change={m.change} trend={m.trend} />
        ))}
      </div>
      <div style={{ marginBlockStart: '1rem' }}>
        <DataTable columns={dashColumns} data={dashData} sortable pageSize={5} />
      </div>
    </>
  )
}

function FormPreview() {
  return (
    <div className="gen-inline-form">
      <FormInput label="Full Name" placeholder="Jane Doe" name="name" />
      <FormInput label="Email" placeholder="jane@example.com" name="email" type="email" />
      <Select
        name="category"
        label="Category"
        placeholder="Select a category"
        options={[
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support' },
          { value: 'feedback', label: 'Feedback' },
        ]}
      />
      <Button variant="primary">Send Message</Button>
    </div>
  )
}

function MarketingPreview() {
  return (
    <div className="gen-inline-hero">
      <Badge variant="primary" size="sm">New in v2.3</Badge>
      <h2 style={{ marginBlockStart: '0.75rem' }}>Build beautiful interfaces</h2>
      <p>A revolutionary component library with physics-based animations.</p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Button variant="primary">Get Started</Button>
        <Button variant="outline">Documentation</Button>
      </div>
      <div className="gen-inline-cards">
        {['Zero Dependencies', 'Physics Animations', 'OKLCH Colors', 'Three Tiers'].map(f => (
          <Card key={f} style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', marginBlockEnd: '0.25rem' }}>{f}</h4>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)' }}>Feature description goes here.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DataTablePreview() {
  type TeamRow = { name: string; role: string; status: string; email: string }
  const columns: ColumnDef<TeamRow>[] = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'role', header: 'Role', accessor: 'role', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', cell: (val) => (
      <Badge variant={val === 'Active' ? 'success' : 'warning'} size="sm">{val as string}</Badge>
    )},
    { id: 'email', header: 'Email', accessor: 'email' },
  ]
  const data: TeamRow[] = [
    { name: 'Alice Johnson', role: 'Engineer', status: 'Active', email: 'alice@example.com' },
    { name: 'Bob Smith', role: 'Designer', status: 'Active', email: 'bob@example.com' },
    { name: 'Carol Williams', role: 'PM', status: 'Away', email: 'carol@example.com' },
    { name: 'Dave Brown', role: 'Engineer', status: 'Active', email: 'dave@example.com' },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchable
      sortable
      pageSize={10}
    />
  )
}

function CustomComponentPreview({ component }: { component: ComponentInfo }) {
  const name = component.name
  switch (name) {
    case 'Button':
      return <Button variant="primary">Sample Button</Button>
    case 'Badge':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      )
    case 'Card':
      return (
        <Card style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBlockEnd: '0.25rem' }}>Sample Card</h4>
          <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>Card content goes here.</p>
        </Card>
      )
    case 'MetricCard':
      return <MetricCard title="Revenue" value="$48,230" change={{ value: 12.5 }} trend="up" />
    case 'Select':
      return (
        <Select
          name="preview-select"
          placeholder="Choose an option"
          options={[
            { value: '1', label: 'Option A' },
            { value: '2', label: 'Option B' },
            { value: '3', label: 'Option C' },
          ]}
        />
      )
    case 'FormInput':
      return <FormInput label="Sample Input" placeholder="Type something..." name="preview-input" />
    case 'DataTable': {
      type SampleRow = { name: string; status: string; updated: string }
      const cols: ColumnDef<SampleRow>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'status', header: 'Status', accessor: 'status' },
        { id: 'updated', header: 'Updated', accessor: 'updated' },
      ]
      const rows: SampleRow[] = [
        { name: 'Item A', status: 'Active', updated: '2026-03-25' },
        { name: 'Item B', status: 'Pending', updated: '2026-03-24' },
      ]
      return <DataTable columns={cols} data={rows} sortable pageSize={5} />
    }
    case 'SearchInput':
      return <SearchInput placeholder="Search..." value="" onChange={() => {}} />
    default:
      return (
        <Card style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBlockEnd: '0.25rem' }}>{name}</div>
          <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>&lt;{name} /&gt;</code>
        </Card>
      )
  }
}

function CustomPreview({ components }: { components: ComponentInfo[] }) {
  if (components.length === 0) {
    return (
      <div className="gen-preview__placeholder">
        <Icon name="plus" size={32} className="gen-preview__placeholder-icon" />
        <span>Add components to see a preview</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {components.map((c, i) => (
        <div key={`${c.name}-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <CustomComponentPreview component={c} />
        </div>
      ))}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function GeneratorPage() {
  useStyles('gen-page', styles)
  const { tier } = useTier()

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>('dashboard')
  const [customComponents, setCustomComponents] = useState<ComponentInfo[]>([])
  const [customLayout, setCustomLayout] = useState<'stack' | 'grid' | 'sidebar'>('stack')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFramework, setActiveFramework] = useState<Framework>('react')
  const [activeTier, setActiveTier] = useState<string>(tier)
  const [mode, setMode] = useState<'template' | 'custom'>('template')

  // Drag-and-drop state
  const [dragSource, setDragSource] = useState<{ type: 'available' | 'composition'; index: number; name: string } | null>(null)
  const [dragOverComposition, setDragOverComposition] = useState(false)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null)
  const compositionRef = useRef<HTMLDivElement>(null)
  const touchStateRef = useRef<{
    active: boolean
    identifier: number
    startX: number
    startY: number
    element: HTMLElement | null
    ghost: HTMLElement | null
    source: { type: 'available' | 'composition'; index: number; name: string } | null
  }>({ active: false, identifier: -1, startX: 0, startY: 0, element: null, ghost: null, source: null })

  // Database
  const allComponents = useMemo(() => getComponentDatabase(), [])
  const filteredComponents = useMemo(() => searchComponents(searchQuery), [searchQuery])

  // Code generation
  const generatedCode: GeneratedCode = useMemo(() => {
    if (mode === 'template' && selectedTemplate) {
      return generateFromTemplate(selectedTemplate, activeTier)
    }
    return generateFromComponents(customComponents, customLayout, activeTier)
  }, [mode, selectedTemplate, customComponents, customLayout, activeTier])

  const currentCode = generatedCode[activeFramework]

  // Handlers
  const selectTemplate = useCallback((t: LayoutTemplate) => {
    setSelectedTemplate(t)
    setMode('template')
  }, [])

  const addComponent = useCallback((c: ComponentInfo, atIndex?: number) => {
    setCustomComponents(prev => {
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= prev.length) {
        const next = [...prev]
        next.splice(atIndex, 0, c)
        return next
      }
      return [...prev, c]
    })
    setMode('custom')
    setSelectedTemplate(null)
    setRecentlyAdded(atIndex ?? null)
    setTimeout(() => setRecentlyAdded(null), 250)
  }, [])

  const removeComponent = useCallback((index: number) => {
    setCustomComponents(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearComponents = useCallback(() => {
    setCustomComponents([])
  }, [])

  const moveComponent = useCallback((fromIndex: number, toIndex: number) => {
    setCustomComponents(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex
      next.splice(adjustedTo, 0, moved)
      return next
    })
  }, [])

  // ── Drag handlers for Available items ──
  const handleAvailableDragStart = useCallback((e: React.DragEvent, c: ComponentInfo, index: number) => {
    setDragSource({ type: 'available', index, name: c.name })
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'available', name: c.name, index }))
    e.dataTransfer.effectAllowed = 'copyMove'
    const target = e.currentTarget as HTMLElement
    target.classList.add('gen-dragging')
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('gen-dragging')
    setDragSource(null)
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [])

  // ── Drag handlers for Composition items (reorder) ──
  const handleCompositionDragStart = useCallback((e: React.DragEvent, index: number, name: string) => {
    setDragSource({ type: 'composition', index, name })
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'composition', name, index }))
    e.dataTransfer.effectAllowed = 'move'
    const target = e.currentTarget as HTMLElement
    target.classList.add('gen-dragging')
  }, [])

  // ── Drop zone handlers ──
  const handleCompositionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = dragSource?.type === 'available' ? 'copy' : 'move'
    setDragOverComposition(true)

    // Calculate insertion index based on mouse Y position
    const zone = compositionRef.current
    if (!zone) return
    const items = zone.querySelectorAll('.gen-selected-item')
    let insertIdx = items.length
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        insertIdx = i
        break
      }
    }
    setDropIndicatorIndex(insertIdx)
  }, [dragSource])

  const handleCompositionDragLeave = useCallback((e: React.DragEvent) => {
    // Only handle if leaving the zone itself, not entering a child
    const related = e.relatedTarget as Node | null
    const zone = compositionRef.current
    if (zone && related && zone.contains(related)) return
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [])

  const handleCompositionDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverComposition(false)
    setDropIndicatorIndex(null)

    let data: { type: string; name: string; index: number }
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      return
    }

    // Calculate drop index
    const zone = compositionRef.current
    let insertIdx = customComponents.length
    if (zone) {
      const items = zone.querySelectorAll('.gen-selected-item')
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        const midY = rect.top + rect.height / 2
        if (e.clientY < midY) {
          insertIdx = i
          break
        }
      }
    }

    if (data.type === 'available') {
      // Add from available list
      const comp = allComponents.find(c => c.name === data.name)
      if (comp) addComponent(comp, insertIdx)
    } else if (data.type === 'composition') {
      // Reorder within composition
      moveComponent(data.index, insertIdx)
    }

    setDragSource(null)
  }, [customComponents, allComponents, addComponent, moveComponent])

  // ── Touch drag support ──
  const createTouchGhost = useCallback((el: HTMLElement, x: number, y: number) => {
    const ghost = el.cloneNode(true) as HTMLElement
    ghost.style.position = 'fixed'
    ghost.style.left = `${x - el.offsetWidth / 2}px`
    ghost.style.top = `${y - el.offsetHeight / 2}px`
    ghost.style.width = `${el.offsetWidth}px`
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '9999'
    ghost.style.opacity = '0.85'
    ghost.style.transform = 'scale(1.05)'
    ghost.style.boxShadow = '0 8px 24px oklch(0% 0 0 / 0.25)'
    ghost.style.borderRadius = '8px'
    ghost.style.transition = 'transform 0.1s'
    document.body.appendChild(ghost)
    return ghost
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent, source: { type: 'available' | 'composition'; index: number; name: string }) => {
    const touch = e.touches[0]
    const ts = touchStateRef.current
    ts.active = false // Don't activate until move threshold
    ts.identifier = touch.identifier
    ts.startX = touch.clientX
    ts.startY = touch.clientY
    ts.element = e.currentTarget as HTMLElement
    ts.source = source
    ts.ghost = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchStateRef.current
    const touch = Array.from(e.touches).find(t => t.identifier === ts.identifier)
    if (!touch || !ts.element) return

    const dx = touch.clientX - ts.startX
    const dy = touch.clientY - ts.startY

    // Activate drag after threshold
    if (!ts.active) {
      if (Math.abs(dx) + Math.abs(dy) < 10) return
      ts.active = true
      ts.ghost = createTouchGhost(ts.element, touch.clientX, touch.clientY)
      ts.element.classList.add('gen-dragging')
      e.preventDefault()
    }

    if (!ts.active) return
    e.preventDefault()

    // Move ghost
    if (ts.ghost) {
      ts.ghost.style.left = `${touch.clientX - ts.element.offsetWidth / 2}px`
      ts.ghost.style.top = `${touch.clientY - ts.element.offsetHeight / 2}px`
    }

    // Check if over composition zone
    const zone = compositionRef.current
    if (!zone) return
    const zoneRect = zone.getBoundingClientRect()
    const overZone = touch.clientX >= zoneRect.left && touch.clientX <= zoneRect.right &&
                     touch.clientY >= zoneRect.top && touch.clientY <= zoneRect.bottom

    setDragOverComposition(overZone)

    if (overZone) {
      const items = zone.querySelectorAll('.gen-selected-item')
      let idx = items.length
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        if (touch.clientY < rect.top + rect.height / 2) {
          idx = i
          break
        }
      }
      setDropIndicatorIndex(idx)
    } else {
      setDropIndicatorIndex(null)
    }
  }, [createTouchGhost])

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    const ts = touchStateRef.current
    if (ts.ghost) {
      ts.ghost.remove()
      ts.ghost = null
    }
    if (ts.element) {
      ts.element.classList.remove('gen-dragging')
    }

    if (ts.active && ts.source) {
      const zone = compositionRef.current
      if (dragOverComposition && zone) {
        // Determine drop index from indicator
        const insertIdx = dropIndicatorIndex ?? customComponents.length

        if (ts.source.type === 'available') {
          const comp = allComponents.find(c => c.name === ts.source!.name)
          if (comp) addComponent(comp, insertIdx)
        } else if (ts.source.type === 'composition') {
          moveComponent(ts.source.index, insertIdx)
        }
      } else if (ts.source.type === 'composition') {
        // Dragged out of composition zone — remove
        removeComponent(ts.source.index)
      }
    }

    ts.active = false
    ts.source = null
    ts.element = null
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [dragOverComposition, dropIndicatorIndex, customComponents, allComponents, addComponent, moveComponent, removeComponent])

  return (
    <div className="gen-page">
      {/* Hero */}
      <div className="gen-hero">
        <h1 className="gen-hero__title">Code Generator</h1>
        <p className="gen-hero__subtitle">
          Generate production-ready code from templates or by composing components.
          Outputs code for React, Vue, Angular, Svelte, and plain HTML.
        </p>
      </div>

      {/* Tier Selector */}
      <div className="gen-tier-selector">
        {(['lite', 'standard', 'premium'] as const).map((t) => (
          <button
            key={t}
            className="gen-tier-btn"
            data-active={activeTier === t}
            onClick={() => setActiveTier(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Template Gallery */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="grid" size="sm" />
          <span className="gen-section__title">Templates</span>
          <Badge variant="info" size="sm" className="gen-section__badge">Quick Start</Badge>
        </div>

        <div className="gen-templates">
          {templates.map((t) => (
            <div
              key={t.id}
              className="gen-template-card"
              data-active={mode === 'template' && selectedTemplate === t.id}
              onClick={() => selectTemplate(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectTemplate(t.id)}
            >
              <div className="gen-template-card__icon">
                <Icon name={t.icon} size="sm" />
              </div>
              <div className="gen-template-card__title">{t.title}</div>
              <div className="gen-template-card__desc">{t.description}</div>
              <div className="gen-template-card__components">
                {t.components.map(c => (
                  <Badge key={c} variant="info" size="sm">{c}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Builder */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="plus" size="sm" />
          <span className="gen-section__title">Custom Builder</span>
          <Badge variant="info" size="sm" className="gen-section__badge">
            {customComponents.length} selected
          </Badge>
        </div>

        {/* Layout selector */}
        <div className="gen-layout-selector">
          {(['stack', 'grid', 'sidebar'] as const).map((l) => (
            <button
              key={l}
              className="gen-layout-btn"
              data-active={customLayout === l}
              onClick={() => { setCustomLayout(l); if (customComponents.length > 0) setMode('custom') }}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <div className="gen-builder">
          {/* Available Components */}
          <div className="gen-builder__panel">
            <div className="gen-builder__panel-header">
              <span className="gen-builder__panel-title">Available</span>
            </div>
            <SearchInput
              placeholder="Search components..."
              value={searchQuery}
              onChange={setSearchQuery}
              style={{ marginBlockEnd: '0.75rem' }}
            />
            <div className="gen-component-list">
              {filteredComponents.map((c, idx) => (
                <div
                  key={c.name}
                  className="gen-component-item"
                  draggable
                  onDragStart={(e) => handleAvailableDragStart(e, c, idx)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, { type: 'available', index: idx, name: c.name })}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => addComponent(c)}
                >
                  <span className="gen-drag-handle" aria-hidden="true">
                    <span className="gen-drag-handle__icon">
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                    </span>
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="gen-component-item__name">{c.name}</div>
                    <div className="gen-component-item__desc">{c.description}</div>
                  </div>
                  <Badge variant="info" size="sm">{c.category}</Badge>
                  <button className="gen-component-item__add" onClick={(e) => { e.stopPropagation(); addComponent(c) }}>
                    <Icon name="plus" size="sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Components */}
          <div className="gen-builder__panel">
            <div className="gen-builder__panel-header">
              <span className="gen-builder__panel-title">Composition</span>
              {customComponents.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearComponents}>Clear All</Button>
              )}
            </div>
            <div
              ref={compositionRef}
              className="gen-composition-drop-zone"
              data-drag-over={dragOverComposition}
              onDragOver={handleCompositionDragOver}
              onDragLeave={handleCompositionDragLeave}
              onDrop={handleCompositionDrop}
            >
              {customComponents.length === 0 ? (
                <div className="gen-selected-empty">
                  <span className="gen-selected-empty__icon" aria-hidden="true">
                    <Icon name="plus" size={28} />
                  </span>
                  <span>Drop components here</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    or click items on the left to add
                  </span>
                </div>
              ) : (
                <div className="gen-selected-list">
                  {customComponents.map((c, i) => (
                    <div key={`${c.name}-${i}`}>
                      {dropIndicatorIndex === i && dragOverComposition && (
                        <div className="gen-drag-indicator" />
                      )}
                      <div
                        className={`gen-selected-item${recentlyAdded === i ? ' gen-item-enter' : ''}`}
                        draggable
                        onDragStart={(e) => handleCompositionDragStart(e, i, c.name)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, { type: 'composition', index: i, name: c.name })}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <span className="gen-drag-handle" aria-hidden="true">
                          <span className="gen-drag-handle__icon">
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                          </span>
                        </span>
                        <span className="gen-selected-item__name">{c.name}</span>
                        <button onClick={() => removeComponent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
                          <Icon name="x" size="sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {dropIndicatorIndex === customComponents.length && dragOverComposition && (
                    <div className="gen-drag-indicator" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="eye" size="sm" />
          <span className="gen-section__title">Preview</span>
        </div>

        <div className="gen-preview">
          <div className="gen-preview__header">
            <div className="gen-preview__dots">
              <div className="gen-preview__dot" style={{ background: 'oklch(65% 0.2 25)' }} />
              <div className="gen-preview__dot" style={{ background: 'oklch(80% 0.2 90)' }} />
              <div className="gen-preview__dot" style={{ background: 'oklch(75% 0.2 150)' }} />
            </div>
            <span className="gen-preview__title">
              {mode === 'template' && selectedTemplate
                ? `${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template`
                : 'Custom Layout'}
            </span>
          </div>
          <div className="gen-preview__content">
            {mode === 'template' && selectedTemplate === 'dashboard' && <DashboardPreview />}
            {mode === 'template' && selectedTemplate === 'form' && <FormPreview />}
            {mode === 'template' && selectedTemplate === 'marketing' && <MarketingPreview />}
            {mode === 'template' && selectedTemplate === 'data-table' && <DataTablePreview />}
            {mode === 'custom' && <CustomPreview components={customComponents} />}
            {!selectedTemplate && mode === 'template' && (
              <div className="gen-preview__placeholder">
                <Icon name="eye" size={32} className="gen-preview__placeholder-icon" />
                <span>Select a template to see a preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Output */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="code" size="sm" />
          <span className="gen-section__title">Generated Code</span>
        </div>

        {/* Framework Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBlockEnd: '0.75rem' }}>
          {frameworkTabs.map((tab) => (
            <button
              key={tab.value}
              className="gen-layout-btn"
              data-active={activeFramework === tab.value}
              onClick={() => setActiveFramework(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="gen-code-block">
          <div className="gen-code-block__header">
            <span className="gen-code-block__lang">
              {frameworkTabs.find(t => t.value === activeFramework)?.lang}
            </span>
            <CopyButton text={currentCode} />
          </div>
          <div className="gen-code-block__content">
            <pre className="gen-code-block__pre">{currentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
