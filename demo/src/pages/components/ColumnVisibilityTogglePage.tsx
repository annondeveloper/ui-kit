'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ColumnVisibilityToggle } from '@ui/domain/column-visibility-toggle'
import { ColumnVisibilityToggle as LiteColumnVisibilityToggle } from '@ui/lite/column-visibility-toggle'
import { ColumnVisibilityToggle as PremiumColumnVisibilityToggle } from '@ui/premium/column-visibility-toggle'
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
    @scope (.column-visibility-toggle-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: column-visibility-toggle-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .column-visibility-toggle-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .column-visibility-toggle-page__hero::before {
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
        animation: column-visibility-toggle-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes column-visibility-toggle-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .column-visibility-toggle-page__hero::before { animation: none; }
      }

      .column-visibility-toggle-page__title {
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

      .column-visibility-toggle-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .column-visibility-toggle-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .column-visibility-toggle-page__import-code {
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

      .column-visibility-toggle-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .column-visibility-toggle-page__section {
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
        animation: column-visibility-toggle-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes column-visibility-toggle-page__section-reveal {
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
        .column-visibility-toggle-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .column-visibility-toggle-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .column-visibility-toggle-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .column-visibility-toggle-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .column-visibility-toggle-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .column-visibility-toggle-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .column-visibility-toggle-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .column-visibility-toggle-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .column-visibility-toggle-page__playground {
          grid-template-columns: 1fr;
        }
        .column-visibility-toggle-page__playground-controls {
          position: static !important;
        }
      }

      @container column-visibility-toggle-page (max-width: 680px) {
        .column-visibility-toggle-page__playground {
          grid-template-columns: 1fr;
        }
        .column-visibility-toggle-page__playground-controls {
          position: static !important;
        }
      }

      .column-visibility-toggle-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .column-visibility-toggle-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .column-visibility-toggle-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .column-visibility-toggle-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .column-visibility-toggle-page__playground-controls {
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

      .column-visibility-toggle-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .column-visibility-toggle-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .column-visibility-toggle-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .column-visibility-toggle-page__option-btn {
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
      .column-visibility-toggle-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .column-visibility-toggle-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .column-visibility-toggle-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Example table ─────────────────────────────── */

      .column-visibility-toggle-page__table-wrapper {
        inline-size: 100%;
        overflow-x: auto;
        position: relative;
        z-index: 1;
      }

      .column-visibility-toggle-page__table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm, 0.875rem);
      }

      .column-visibility-toggle-page__table th {
        text-align: start;
        padding: 0.5rem 0.75rem;
        font-weight: 600;
        color: var(--text-primary);
        border-block-end: 2px solid var(--border-default);
        white-space: nowrap;
      }

      .column-visibility-toggle-page__table td {
        padding: 0.5rem 0.75rem;
        color: var(--text-secondary);
        border-block-end: 1px solid var(--border-subtle);
        white-space: nowrap;
      }

      .column-visibility-toggle-page__table tr:hover td {
        background: var(--bg-hover, oklch(100% 0 0 / 0.03));
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .column-visibility-toggle-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .column-visibility-toggle-page__tier-card {
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

      .column-visibility-toggle-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .column-visibility-toggle-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .column-visibility-toggle-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .column-visibility-toggle-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .column-visibility-toggle-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .column-visibility-toggle-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .column-visibility-toggle-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .column-visibility-toggle-page__tier-import {
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

      .column-visibility-toggle-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .column-visibility-toggle-page__code-tabs {
        margin-block-start: 1rem;
      }

      .column-visibility-toggle-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .column-visibility-toggle-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .column-visibility-toggle-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .column-visibility-toggle-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .column-visibility-toggle-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .column-visibility-toggle-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .column-visibility-toggle-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .column-visibility-toggle-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .column-visibility-toggle-page__import-code,
      .column-visibility-toggle-page code,
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
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .column-visibility-toggle-page__hero {
          padding: 2rem 1.25rem;
        }

        .column-visibility-toggle-page__title {
          font-size: 1.75rem;
        }

        .column-visibility-toggle-page__preview {
          padding: 1.75rem;
        }

        .column-visibility-toggle-page__playground {
          grid-template-columns: 1fr;
        }

        .column-visibility-toggle-page__playground-result {
          padding: 1.5rem;
          min-block-size: 300px;
        }

        .column-visibility-toggle-page__tiers {
          grid-template-columns: 1fr;
        }

        .column-visibility-toggle-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .column-visibility-toggle-page__hero {
          padding: 1.5rem 1rem;
        }

        .column-visibility-toggle-page__title {
          font-size: 1.5rem;
        }

        .column-visibility-toggle-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .column-visibility-toggle-page__title {
          font-size: 4rem;
        }

        .column-visibility-toggle-page__preview {
          padding: 3.5rem;
        }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const columnVisibilityProps: PropDef[] = [
  { name: 'columns', type: '{ id: string; label: string; visible: boolean }[]', required: true, description: 'Array of column definitions with visibility state.' },
  { name: 'onChange', type: '(columnId: string, visible: boolean) => void', description: 'Callback fired when a column visibility is toggled.' },
  { name: 'onReset', type: '() => void', description: 'Callback for the reset button. When provided, a "Reset to default" button appears in the dropdown.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for dropdown open/close. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root div element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ColumnDef = { id: string; label: string; visible: boolean }

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ColumnVisibilityToggle } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ColumnVisibilityToggle } from '@annondeveloper/ui-kit'",
  premium: "import { ColumnVisibilityToggle } from '@annondeveloper/ui-kit/premium'",
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'role', label: 'Role', visible: true },
  { id: 'department', label: 'Department', visible: true },
  { id: 'status', label: 'Status', visible: false },
  { id: 'lastLogin', label: 'Last Login', visible: false },
]

const SAMPLE_TABLE_DATA = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer', department: 'Platform', status: 'Active', lastLogin: '2026-03-27' },
  { name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer', department: 'Product', status: 'Active', lastLogin: '2026-03-26' },
  { name: 'Carol Singh', email: 'carol@example.com', role: 'PM', department: 'Product', status: 'Away', lastLogin: '2026-03-25' },
  { name: 'Dan Kim', email: 'dan@example.com', role: 'DevOps', department: 'Infra', status: 'Active', lastLogin: '2026-03-27' },
  { name: 'Eve Johnson', email: 'eve@example.com', role: 'QA', department: 'Platform', status: 'Offline', lastLogin: '2026-03-20' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="column-visibility-toggle-page__copy-btn"
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
    <div className="column-visibility-toggle-page__control-group">
      <span className="column-visibility-toggle-page__control-label">{label}</span>
      <div className="column-visibility-toggle-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`column-visibility-toggle-page__option-btn${opt === value ? ' column-visibility-toggle-page__option-btn--active' : ''}`}
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
    <label className="column-visibility-toggle-page__toggle-label">
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

function generateReactCode(tier: Tier, columns: ColumnDef[], showReset: boolean, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]

  const colsStr = columns.map(c => `  { id: '${c.id}', label: '${c.label}', visible: ${c.visible} }`).join(',\n')

  const props: string[] = [
    '  columns={columns}',
    '  onChange={(id, visible) => toggleColumn(id, visible)}',
  ]
  if (showReset) props.push('  onReset={resetColumns}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

const [columns, setColumns] = useState([
${colsStr}
])

function toggleColumn(id, visible) {
  setColumns(cols => cols.map(c => c.id === id ? { ...c, visible } : c))
}

function resetColumns() {
  setColumns(cols => cols.map(c => ({ ...c, visible: true })))
}

<ColumnVisibilityToggle
${props.join('\n')}
/>`
}

function generateHtmlCssCode(tier: Tier): string {
  const className = tier === 'lite' ? 'ui-lite-column-visibility' : 'ui-column-visibility'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  return `<!-- ColumnVisibilityToggle -- @annondeveloper/ui-kit ${tierLabel} tier -->
<div class="${className}">
  <button type="button" class="${className}__trigger" aria-expanded="false" aria-haspopup="listbox">
    Columns (4/6)
  </button>
  <div class="${className}__dropdown" role="listbox" aria-label="Toggle column visibility" data-open="false">
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" checked /> Name
    </label>
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" checked /> Email
    </label>
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" checked /> Role
    </label>
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" checked /> Department
    </label>
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" /> Status
    </label>
    <label class="${className}__item">
      <input type="checkbox" class="${className}__checkbox" /> Last Login
    </label>
    <div class="${className}__divider"></div>
    <button type="button" class="${className}__reset">Reset to default</button>
  </div>
</div>

<style>
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/column-visibility-toggle.css'}';
</style>`
}

function generateVueCode(tier: Tier, columns: ColumnDef[]): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-column-visibility">
    <button type="button" :aria-expanded="open" @click="open = !open"
      class="ui-lite-column-visibility__trigger">
      Columns ({{ columns.filter(c => c.visible).length }}/{{ columns.length }})
    </button>
    <div v-if="open" class="ui-lite-column-visibility__dropdown" role="listbox">
      <label v-for="col in columns" :key="col.id" class="ui-lite-column-visibility__item">
        <input type="checkbox" :checked="col.visible" @change="toggle(col.id)" />
        {{ col.label }}
      </label>
      <button type="button" @click="reset" class="ui-lite-column-visibility__reset">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const columns = ref(${JSON.stringify(columns, null, 2)})

function toggle(id) {
  const col = columns.value.find(c => c.id === id)
  if (col) col.visible = !col.visible
}

function reset() {
  columns.value.forEach(c => c.visible = true)
}
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <ColumnVisibilityToggle
    :columns="columns"
    @change="toggle"
    @reset="reset"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ColumnVisibilityToggle } from '${importPath}'

const columns = ref(${JSON.stringify(columns, null, 2)})

function toggle(id, visible) {
  const col = columns.value.find(c => c.id === id)
  if (col) col.visible = visible
}

function reset() {
  columns.value.forEach(c => c.visible = true)
}
</script>`
}

function generateAngularCode(tier: Tier): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<div class="ui-lite-column-visibility">
  <button type="button" [attr.aria-expanded]="open" (click)="open = !open"
    class="ui-lite-column-visibility__trigger">
    Columns ({{ visibleCount }}/{{ columns.length }})
  </button>
  <div *ngIf="open" class="ui-lite-column-visibility__dropdown" role="listbox">
    <label *ngFor="let col of columns" class="ui-lite-column-visibility__item">
      <input type="checkbox" [checked]="col.visible" (change)="toggle(col.id)" />
      {{ col.label }}
    </label>
    <button type="button" (click)="reset()" class="ui-lite-column-visibility__reset">Reset</button>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only approach) -->
<div class="ui-column-visibility">
  <button type="button" [attr.aria-expanded]="open" (click)="open = !open"
    class="ui-column-visibility__trigger">
    Columns ({{ visibleCount }}/{{ columns.length }})
  </button>
  <div class="ui-column-visibility__dropdown" role="listbox"
    [attr.data-open]="open">
    <label *ngFor="let col of columns" class="ui-column-visibility__item">
      <input type="checkbox" class="ui-column-visibility__checkbox"
        [checked]="col.visible" (change)="toggle(col.id)" />
      {{ col.label }}
    </label>
    <div class="ui-column-visibility__divider"></div>
    <button type="button" (click)="reset()" class="ui-column-visibility__reset">Reset to default</button>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/column-visibility-toggle.css';`
}

function generateSvelteCode(tier: Tier, columns: ColumnDef[]): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<script>
  let open = false
  let columns = ${JSON.stringify(columns)}

  function toggle(id) {
    columns = columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c)
  }
</script>

<div class="ui-lite-column-visibility">
  <button type="button" aria-expanded={open} on:click={() => open = !open}
    class="ui-lite-column-visibility__trigger">
    Columns ({columns.filter(c => c.visible).length}/{columns.length})
  </button>
  {#if open}
    <div class="ui-lite-column-visibility__dropdown" role="listbox">
      {#each columns as col (col.id)}
        <label class="ui-lite-column-visibility__item">
          <input type="checkbox" checked={col.visible} on:change={() => toggle(col.id)} />
          {col.label}
        </label>
      {/each}
    </div>
  {/if}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { ColumnVisibilityToggle } from '${importPath}';

  let columns = ${JSON.stringify(columns)}

  function handleChange(id, visible) {
    columns = columns.map(c => c.id === id ? { ...c, visible } : c)
  }

  function handleReset() {
    columns = columns.map(c => ({ ...c, visible: true }))
  }
</script>

<ColumnVisibilityToggle
  {columns}
  on:change={(e) => handleChange(e.detail.id, e.detail.visible)}
  on:reset={handleReset}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [columns, setColumns] = useState<ColumnDef[]>(() => DEFAULT_COLUMNS.map(c => ({ ...c })))
  const [showReset, setShowReset] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const Component = tier === 'lite' ? LiteColumnVisibilityToggle : tier === 'premium' ? PremiumColumnVisibilityToggle : ColumnVisibilityToggle

  const handleChange = useCallback((columnId: string, visible: boolean) => {
    setColumns(cols => cols.map(c => c.id === columnId ? { ...c, visible } : c))
  }, [])

  const handleReset = useCallback(() => {
    setColumns(DEFAULT_COLUMNS.map(c => ({ ...c, visible: true })))
  }, [])

  const reactCode = useMemo(
    () => generateReactCode(tier, columns, showReset, motion),
    [tier, columns, showReset, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier),
    [tier],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, columns),
    [tier, columns],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier),
    [tier],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, columns),
    [tier, columns],
  )

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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  const visibleColumns = columns.filter(c => c.visible)

  const previewProps: Record<string, unknown> = {
    columns,
    onChange: handleChange,
  }
  if (showReset) previewProps.onReset = handleReset
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="column-visibility-toggle-page__section" id="playground">
      <h2 className="column-visibility-toggle-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="column-visibility-toggle-page__section-desc">
        Toggle column visibility and see both the component and the example table update in real-time.
      </p>

      <div className="column-visibility-toggle-page__playground">
        {/* Preview area */}
        <div className="column-visibility-toggle-page__playground-preview">
          <div className="column-visibility-toggle-page__playground-result">
            <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
              <Component {...previewProps} />
            </div>
            <div className="column-visibility-toggle-page__table-wrapper">
              <table className="column-visibility-toggle-page__table">
                <thead>
                  <tr>
                    {visibleColumns.map(col => (
                      <th key={col.id}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_TABLE_DATA.map((row, i) => (
                    <tr key={i}>
                      {visibleColumns.map(col => (
                        <td key={col.id}>{(row as Record<string, string>)[col.id]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabbed code output */}
          <div className="column-visibility-toggle-page__code-tabs">
            <div className="column-visibility-toggle-page__export-row">
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
              {copyStatus && <span className="column-visibility-toggle-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
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
        <div className="column-visibility-toggle-page__playground-controls">
          <div className="column-visibility-toggle-page__control-group">
            <span className="column-visibility-toggle-page__control-label">Columns</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {columns.map(col => (
                <Toggle
                  key={col.id}
                  label={col.label}
                  checked={col.visible}
                  onChange={(v) => handleChange(col.id, v)}
                />
              ))}
            </div>
          </div>

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="column-visibility-toggle-page__control-group">
            <span className="column-visibility-toggle-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show reset button" checked={showReset} onChange={setShowReset} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ColumnVisibilityTogglePage() {
  useStyles('column-visibility-toggle-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections -- JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.column-visibility-toggle-page__section')
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

  const [demoColumns, setDemoColumns] = useState<ColumnDef[]>(() =>
    DEFAULT_COLUMNS.map(c => ({ ...c }))
  )

  const Component = tier === 'lite' ? LiteColumnVisibilityToggle : tier === 'premium' ? PremiumColumnVisibilityToggle : ColumnVisibilityToggle

  return (
    <div className="column-visibility-toggle-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="column-visibility-toggle-page__hero">
        <h1 className="column-visibility-toggle-page__title">Column Visibility Toggle</h1>
        <p className="column-visibility-toggle-page__desc">
          Dropdown control for toggling table column visibility. Features a trigger button showing visible/total count,
          checkbox list with animated stagger, and optional reset action.
        </p>
        <div className="column-visibility-toggle-page__import-row">
          <code className="column-visibility-toggle-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. With Example Table ──────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="table-example">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#table-example">Table Integration</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          The column visibility toggle is designed to sit alongside data tables. Toggle columns
          and watch the table update in real-time.
        </p>
        <div className="column-visibility-toggle-page__preview" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
            <Component
              columns={demoColumns}
              onChange={(id, visible) => setDemoColumns(cols => cols.map(c => c.id === id ? { ...c, visible } : c))}
              onReset={() => setDemoColumns(DEFAULT_COLUMNS.map(c => ({ ...c, visible: true })))}
            />
          </div>
          <div className="column-visibility-toggle-page__table-wrapper">
            <table className="column-visibility-toggle-page__table">
              <thead>
                <tr>
                  {demoColumns.filter(c => c.visible).map(col => (
                    <th key={col.id}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_TABLE_DATA.map((row, i) => (
                  <tr key={i}>
                    {demoColumns.filter(c => c.visible).map(col => (
                      <td key={col.id}>{(row as Record<string, string>)[col.id]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Dropdown Behavior ─────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="behavior">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#behavior">Dropdown Behavior</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          The dropdown closes automatically on outside click or Escape key press. The trigger shows
          the current visible/total count. Standard and Premium tiers add animated open/close transitions.
        </p>
        <CopyBlock
          code={`// Outside click and Escape key close the dropdown automatically.
// The trigger button displays "Columns (N/M)" format.

<ColumnVisibilityToggle
  columns={columns}
  onChange={(id, visible) => updateColumn(id, visible)}
  onReset={() => resetAllColumns()}
/>`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 5. Motion Levels ────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="column-visibility-toggle-page__section" id="motion">
          <h2 className="column-visibility-toggle-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="column-visibility-toggle-page__section-desc">
            The dropdown open/close animation scales with motion level. Level 0 is instant, level 1 adds opacity fade,
            level 2 adds scale transition with spring overshoot, and level 3 extends the spring timing.
          </p>
          <div className="column-visibility-toggle-page__preview" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="column-visibility-toggle-page__a11y-key" style={{ minInlineSize: '5rem' }}>motion={m}</span>
                <Component
                  columns={DEFAULT_COLUMNS.map(c => ({ ...c }))}
                  onChange={() => {}}
                  motion={m}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="tiers">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite uses conditional rendering instead of CSS transitions).
        </p>

        <div className="column-visibility-toggle-page__tiers">
          {/* Lite */}
          <div
            className={`column-visibility-toggle-page__tier-card${tier === 'lite' ? ' column-visibility-toggle-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="column-visibility-toggle-page__tier-header">
              <span className="column-visibility-toggle-page__tier-name">Lite</span>
              <span className="column-visibility-toggle-page__tier-size">~0.5 KB</span>
            </div>
            <p className="column-visibility-toggle-page__tier-desc">
              Minimal implementation. Conditional render for dropdown, no animations, no styled checkboxes.
            </p>
            <div className="column-visibility-toggle-page__tier-import">
              import {'{'} ColumnVisibilityToggle {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="column-visibility-toggle-page__tier-preview">
              <LiteColumnVisibilityToggle columns={DEFAULT_COLUMNS.map(c => ({ ...c }))} onChange={() => {}} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`column-visibility-toggle-page__tier-card${tier === 'standard' ? ' column-visibility-toggle-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="column-visibility-toggle-page__tier-header">
              <span className="column-visibility-toggle-page__tier-name">Standard</span>
              <span className="column-visibility-toggle-page__tier-size">~2.2 KB</span>
            </div>
            <p className="column-visibility-toggle-page__tier-desc">
              Full-featured with animated dropdown, styled checkboxes with check marks,
              outside click/escape handling, and motion levels.
            </p>
            <div className="column-visibility-toggle-page__tier-import">
              import {'{'} ColumnVisibilityToggle {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="column-visibility-toggle-page__tier-preview">
              <ColumnVisibilityToggle columns={DEFAULT_COLUMNS.map(c => ({ ...c }))} onChange={() => {}} />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`column-visibility-toggle-page__tier-card${tier === 'premium' ? ' column-visibility-toggle-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="column-visibility-toggle-page__tier-header">
              <span className="column-visibility-toggle-page__tier-name">Premium</span>
              <span className="column-visibility-toggle-page__tier-size">~3.0 KB</span>
            </div>
            <p className="column-visibility-toggle-page__tier-desc">
              Everything in Standard plus staggered item entrance animation,
              checkbox toggle flash effect, and fade-up entrance.
            </p>
            <div className="column-visibility-toggle-page__tier-import">
              import {'{'} ColumnVisibilityToggle {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="column-visibility-toggle-page__tier-preview">
              <PremiumColumnVisibilityToggle columns={DEFAULT_COLUMNS.map(c => ({ ...c }))} onChange={() => {}} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="props">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          All props accepted by ColumnVisibilityToggle. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={columnVisibilityProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="accessibility">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          Built with proper ARIA attributes and keyboard interaction patterns.
        </p>
        <Card variant="default" padding="md">
          <ul className="column-visibility-toggle-page__a11y-list">
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Trigger:</strong> Uses <code className="column-visibility-toggle-page__a11y-key">aria-expanded</code> and <code className="column-visibility-toggle-page__a11y-key">aria-haspopup="listbox"</code> on the trigger button.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dropdown:</strong> Uses <code className="column-visibility-toggle-page__a11y-key">role="listbox"</code> with <code className="column-visibility-toggle-page__a11y-key">aria-label</code> for screen reader context.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Closes on <code className="column-visibility-toggle-page__a11y-key">Escape</code>. Checkboxes are navigable via <code className="column-visibility-toggle-page__a11y-key">Tab</code>.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on trigger and checkboxes via <code className="column-visibility-toggle-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="column-visibility-toggle-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="column-visibility-toggle-page__a11y-key">forced-colors: active</code> with visible borders and Highlight checkboxes.
              </span>
            </li>
            <li className="column-visibility-toggle-page__a11y-item">
              <span className="column-visibility-toggle-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="column-visibility-toggle-page__a11y-key">prefers-reduced-motion: reduce</code> by disabling dropdown transitions.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ────────────────────────────────── */}
      <section className="column-visibility-toggle-page__section" id="source">
        <h2 className="column-visibility-toggle-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="column-visibility-toggle-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/column-visibility-toggle.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="column-visibility-toggle-page__source-link"
        >
          <Icon name="external-link" size="sm" />
          src/domain/column-visibility-toggle.tsx
        </a>
      </section>
    </div>
  )
}
