'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { SearchInput } from '@ui/components/search-input'
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
        box-shadow: 0 8px 24px oklch(0% 0 0 / 0.3);
      }

      &[data-active='true'] {
        border-color: oklch(65% 0.25 270);
        box-shadow: 0 0 0 3px oklch(65% 0.25 270 / 0.15);
      }
    }

    .gen-template-card__icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: oklch(65% 0.2 270 / 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-block-end: 0.75rem;
      color: oklch(70% 0.2 270);
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
      transition: background 0.15s;
      user-select: none;

      &:hover {
        background: var(--surface-tertiary, oklch(25% 0.02 270));
      }
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
    }

    .gen-selected-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      background: oklch(65% 0.2 270 / 0.1);
      border: 1px solid oklch(65% 0.2 270 / 0.2);
    }

    .gen-selected-item__name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .gen-selected-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      border-radius: 12px;
      border: 2px dashed var(--border-default);
      color: var(--text-secondary);
      font-size: 0.875rem;
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
        background: oklch(25% 0.02 270);
      }

      &[data-active='true'] {
        background: oklch(65% 0.2 270 / 0.15);
        border-color: oklch(65% 0.25 270);
        color: oklch(80% 0.15 270);
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
        background: oklch(25% 0.02 270);
      }

      &[data-active='true'] {
        background: oklch(65% 0.2 270 / 0.15);
        border-color: oklch(65% 0.25 270);
        color: oklch(80% 0.15 270);
      }
    }

    /* ── Code Output ──────────────────────────────────────────────────── */
    .gen-code-output {
      position: relative;
    }

    .gen-code-block {
      background: oklch(12% 0.02 270);
      border-radius: 12px;
      border: 1px solid oklch(25% 0.02 270);
      overflow: hidden;
    }

    .gen-code-block__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: oklch(15% 0.02 270);
      border-block-end: 1px solid oklch(25% 0.02 270);
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
        background: oklch(25% 0.02 270);
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
      color: oklch(80% 0.02 270);
      tab-size: 2;
    }

    /* ── Preview ──────────────────────────────────────────────────────── */
    .gen-preview {
      border-radius: 12px;
      border: 1px solid oklch(25% 0.02 270);
      overflow: hidden;
      margin-block-end: 1.5rem;
    }

    .gen-preview__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: oklch(15% 0.02 270);
      border-block-end: 1px solid oklch(25% 0.02 270);
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
      background: oklch(13% 0.015 270);
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
      color: oklch(50% 0.1 270);
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
      background: oklch(18% 0.02 270);
      border: 1px solid oklch(25% 0.02 270);
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
      border-block-end: 1px solid oklch(25% 0.02 270);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-inline-table td {
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid oklch(20% 0.02 270);
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
      background: oklch(18% 0.02 270);
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
      background: oklch(18% 0.02 270);
      border: 1px solid oklch(25% 0.02 270);
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
      background: oklch(65% 0.25 270);
      color: white;
    }

    .gen-inline-btn--outline {
      background: transparent;
      border: 1px solid oklch(40% 0.02 270);
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
    { label: 'Revenue', value: '$48,230', change: '+12.5%', up: true },
    { label: 'Users', value: '2,847', change: '+8.2%', up: true },
    { label: 'Conversion', value: '3.24%', change: '-1.8%', up: false },
    { label: 'Response', value: '142ms', change: '-5.3%', up: true },
  ]
  const rows = [
    ['Widget Pro', 'Active', '$12,400', '2026-03-15'],
    ['Dashboard X', 'Active', '$8,200', '2026-03-14'],
    ['Analytics+', 'Paused', '$4,100', '2026-03-13'],
  ]

  return (
    <>
      <div className="gen-inline-grid">
        {metrics.map(m => (
          <div key={m.label} className="gen-inline-metric">
            <div className="gen-inline-metric__label">{m.label}</div>
            <div className="gen-inline-metric__value">{m.value}</div>
            <div className="gen-inline-metric__change" style={{ color: m.up ? 'oklch(75% 0.2 150)' : 'oklch(70% 0.2 25)' }}>
              {m.change}
            </div>
          </div>
        ))}
      </div>
      <table className="gen-inline-table">
        <thead>
          <tr><th>Name</th><th>Status</th><th>Revenue</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function FormPreview() {
  return (
    <div className="gen-inline-form">
      <div className="gen-inline-input">
        <label>Full Name</label>
        <input placeholder="Jane Doe" readOnly />
      </div>
      <div className="gen-inline-input">
        <label>Email</label>
        <input placeholder="jane@example.com" readOnly />
      </div>
      <div className="gen-inline-input">
        <label>Category</label>
        <select disabled>
          <option>General Inquiry</option>
        </select>
      </div>
      <button className="gen-inline-btn gen-inline-btn--primary">Send Message</button>
    </div>
  )
}

function MarketingPreview() {
  return (
    <div className="gen-inline-hero">
      <Badge variant="primary" size="sm">New in v2.3</Badge>
      <h2 style={{ marginBlockStart: '0.75rem' }}>Build beautiful interfaces</h2>
      <p>A revolutionary component library with physics-based animations.</p>
      <div>
        <button className="gen-inline-btn gen-inline-btn--primary">Get Started</button>
        <button className="gen-inline-btn gen-inline-btn--outline">Documentation</button>
      </div>
      <div className="gen-inline-cards">
        {['Zero Dependencies', 'Physics Animations', 'OKLCH Colors', 'Three Tiers'].map(f => (
          <div key={f} className="gen-inline-feature">
            <h4>{f}</h4>
            <p>Feature description goes here.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataTablePreview() {
  const rows = [
    ['Alice Johnson', 'Engineer', 'Active', 'alice@example.com'],
    ['Bob Smith', 'Designer', 'Active', 'bob@example.com'],
    ['Carol Williams', 'PM', 'Away', 'carol@example.com'],
    ['Dave Brown', 'Engineer', 'Active', 'dave@example.com'],
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: '1rem' }}>
        <span style={{ fontWeight: 600 }}>Team Members</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input placeholder="Search..." readOnly style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid oklch(30% 0.02 270)',
            background: 'oklch(18% 0.02 270)',
            color: 'inherit',
            fontSize: '0.8125rem',
          }} />
          <button className="gen-inline-btn gen-inline-btn--primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            Add
          </button>
        </div>
      </div>
      <table className="gen-inline-table">
        <thead>
          <tr><th>Name</th><th>Role</th><th>Status</th><th>Email</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  )
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
        <div key={`${c.name}-${i}`} style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'oklch(18% 0.02 270)',
          border: '1px solid oklch(25% 0.02 270)',
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBlockEnd: '0.25rem' }}>{c.name}</div>
          <code style={{ fontSize: '0.75rem', color: 'oklch(70% 0.15 270)' }}>{c.example.split('\n')[0]}</code>
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

  const addComponent = useCallback((c: ComponentInfo) => {
    setCustomComponents(prev => [...prev, c])
    setMode('custom')
    setSelectedTemplate(null)
  }, [])

  const removeComponent = useCallback((index: number) => {
    setCustomComponents(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearComponents = useCallback(() => {
    setCustomComponents([])
  }, [])

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
              {filteredComponents.map((c) => (
                <div key={c.name} className="gen-component-item" onClick={() => addComponent(c)}>
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
            {customComponents.length === 0 ? (
              <div className="gen-selected-empty">
                Click components on the left to add them
              </div>
            ) : (
              <div className="gen-selected-list">
                {customComponents.map((c, i) => (
                  <div key={`${c.name}-${i}`} className="gen-selected-item">
                    <span className="gen-selected-item__name">{c.name}</span>
                    <button onClick={() => removeComponent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Icon name="x" size="sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
