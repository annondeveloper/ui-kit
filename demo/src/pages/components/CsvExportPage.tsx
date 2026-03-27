'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CSVExportButton } from '@ui/domain/csv-export'
import { CSVExportButton as LiteCSVExportButton } from '@ui/lite/csv-export'
import { CSVExportButton as PremiumCSVExportButton } from '@ui/premium/csv-export'
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
    @scope (.csv-export-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: csv-export-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .csv-export-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .csv-export-page__hero::before {
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
        animation: csv-export-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes csv-export-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .csv-export-page__hero::before { animation: none; }
      }

      .csv-export-page__title {
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

      .csv-export-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .csv-export-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .csv-export-page__import-code {
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

      .csv-export-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .csv-export-page__section {
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
        animation: csv-export-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes csv-export-page__section-reveal {
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
        .csv-export-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .csv-export-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .csv-export-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .csv-export-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .csv-export-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .csv-export-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .csv-export-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .csv-export-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .csv-export-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .csv-export-page__playground {
          grid-template-columns: 1fr;
        }
        .csv-export-page__playground-controls {
          position: static !important;
        }
      }

      @container csv-export-page (max-width: 680px) {
        .csv-export-page__playground {
          grid-template-columns: 1fr;
        }
        .csv-export-page__playground-controls {
          position: static !important;
        }
      }

      .csv-export-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .csv-export-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .csv-export-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .csv-export-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .csv-export-page__playground-controls {
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

      .csv-export-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .csv-export-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .csv-export-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .csv-export-page__option-btn {
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
      .csv-export-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .csv-export-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .csv-export-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .csv-export-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .csv-export-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .csv-export-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .csv-export-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .csv-export-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Data preview table ────────────────────────── */

      .csv-export-page__data-table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-xs, 0.75rem);
        margin-block-start: 1rem;
      }

      .csv-export-page__data-table th {
        text-align: start;
        padding: 0.375rem 0.5rem;
        font-weight: 600;
        color: var(--text-primary);
        border-block-end: 2px solid var(--border-default);
        white-space: nowrap;
      }

      .csv-export-page__data-table td {
        padding: 0.375rem 0.5rem;
        color: var(--text-secondary);
        border-block-end: 1px solid var(--border-subtle);
        white-space: nowrap;
      }

      .csv-export-page__data-table tr:hover td {
        background: var(--bg-hover, oklch(100% 0 0 / 0.03));
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .csv-export-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .csv-export-page__tier-card {
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

      .csv-export-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .csv-export-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .csv-export-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .csv-export-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .csv-export-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .csv-export-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .csv-export-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .csv-export-page__tier-import {
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

      .csv-export-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .csv-export-page__code-tabs {
        margin-block-start: 1rem;
      }

      .csv-export-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .csv-export-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .csv-export-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .csv-export-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .csv-export-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .csv-export-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .csv-export-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .csv-export-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .csv-export-page__import-code,
      .csv-export-page code,
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
        .csv-export-page__hero {
          padding: 2rem 1.25rem;
        }

        .csv-export-page__title {
          font-size: 1.75rem;
        }

        .csv-export-page__preview {
          padding: 1.75rem;
        }

        .csv-export-page__playground {
          grid-template-columns: 1fr;
        }

        .csv-export-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .csv-export-page__labeled-row {
          gap: 1rem;
        }

        .csv-export-page__tiers {
          grid-template-columns: 1fr;
        }

        .csv-export-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .csv-export-page__hero {
          padding: 1.5rem 1rem;
        }

        .csv-export-page__title {
          font-size: 1.5rem;
        }

        .csv-export-page__preview {
          padding: 1rem;
        }

        .csv-export-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .csv-export-page__title {
          font-size: 4rem;
        }

        .csv-export-page__preview {
          padding: 3.5rem;
        }

        .csv-export-page__labeled-row {
          gap: 2.5rem;
        }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const csvExportProps: PropDef[] = [
  { name: 'data', type: 'Record<string, unknown>[]', required: true, description: 'Array of data objects to export. Each object represents a row.' },
  { name: 'filename', type: 'string', default: "'export.csv'", description: 'Output filename. Auto-appends .csv extension if missing.' },
  { name: 'columns', type: '{ key: string; label: string }[]', description: 'Column configuration for export. Defines key mapping and header labels. Defaults to all keys from first row.' },
  { name: 'onExport', type: '() => void', description: 'Callback fired after successful CSV export/download.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and min-height of the export button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for press and success feedback. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the export button with reduced opacity and pointer-events: none.' },
  { name: 'children', type: 'ReactNode', description: "Button label content. Defaults to 'Export CSV' with success state showing 'Exported!'." },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLButtonElement>', description: 'Forwarded ref to the underlying <button> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CSVExportButton } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CSVExportButton } from '@annondeveloper/ui-kit'",
  premium: "import { CSVExportButton } from '@annondeveloper/ui-kit/premium'",
}

const SAMPLE_DATA: Record<string, unknown>[] = [
  { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer', salary: 125000 },
  { id: 2, name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer', salary: 110000 },
  { id: 3, name: 'Carol Singh', email: 'carol@example.com', role: 'PM', salary: 130000 },
  { id: 4, name: 'Dan Kim', email: 'dan@example.com', role: 'DevOps', salary: 120000 },
  { id: 5, name: 'Eve Johnson', email: 'eve@example.com', role: 'QA', salary: 105000 },
]

const SAMPLE_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'role', label: 'Role' },
  { key: 'salary', label: 'Salary' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="csv-export-page__copy-btn"
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
    <div className="csv-export-page__control-group">
      <span className="csv-export-page__control-label">{label}</span>
      <div className="csv-export-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`csv-export-page__option-btn${opt === value ? ' csv-export-page__option-btn--active' : ''}`}
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
    <label className="csv-export-page__toggle-label">
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
  filename: string,
  size: Size,
  useColumns: boolean,
  disabled: boolean,
  customLabel: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const dataStr = `const data = [
  { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer', salary: 125000 },
  { id: 2, name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer', salary: 110000 },
  { id: 3, name: 'Carol Singh', email: 'carol@example.com', role: 'PM', salary: 130000 },
]`

  const colsStr = useColumns ? `\nconst columns = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'role', label: 'Role' },
]` : ''

  const props: string[] = ['  data={data}']
  if (filename !== 'export.csv') props.push(`  filename="${filename}"`)
  if (useColumns) props.push('  columns={columns}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  onExport={() => console.log("Exported!")}')

  const childrenPart = customLabel && customLabel !== 'Export CSV'
    ? `>${customLabel}</CSVExportButton>`
    : ' />'

  const jsx = props.length <= 2
    ? `<CSVExportButton ${props.map(p => p.trim()).join(' ')}${childrenPart}`
    : `<CSVExportButton\n${props.join('\n')}\n${childrenPart}`

  return `${importStr}\n\n${dataStr}${colsStr}\n\n${jsx}`
}

function generateHtmlCssCode(tier: Tier, size: Size): string {
  const className = tier === 'lite' ? 'ui-lite-csv-export' : 'ui-csv-export'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  return `<!-- CSVExportButton -- @annondeveloper/ui-kit ${tierLabel} tier -->
<!-- Note: CSV generation requires JavaScript. The button styling is CSS-only. -->
<button class="${className}" data-size="${size}">
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  Export CSV
</button>

<style>
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/csv-export.css'}';
</style>

<script>
  // CSV generation logic
  function exportCSV(data, filename) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }
</script>`
}

function generateVueCode(tier: Tier, filename: string, size: Size, useColumns: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <button class="ui-lite-csv-export" data-size="${size}" @click="handleExport">
    {{ exported ? 'Exported!' : 'Export CSV' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const exported = ref(false)
const data = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer' },
  { name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer' },
]

function handleExport() {
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(r => Object.values(r).join(','))
  const csv = [headers, ...rows].join('\\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '${filename}'
  a.click()
  exported.value = true
  setTimeout(() => exported.value = false, 2000)
}
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':data="data"']
  if (filename !== 'export.csv') attrs.push(`filename="${filename}"`)
  if (useColumns) attrs.push(':columns="columns"')
  if (size !== 'md') attrs.push(`size="${size}"`)

  return `<template>
  <CSVExportButton
    ${attrs.join('\n    ')}
    @export="onExport"
  />
</template>

<script setup>
import { CSVExportButton } from '${importPath}'

const data = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer' },
  { name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer' },
]
${useColumns ? `\nconst columns = [\n  { key: 'name', label: 'Full Name' },\n  { key: 'email', label: 'Email' },\n]` : ''}

function onExport() {
  console.log('CSV exported!')
}
</script>`
}

function generateAngularCode(tier: Tier, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only with JS export logic) -->
<button class="ui-lite-csv-export" data-size="${size}" (click)="exportCSV()">
  {{ exported ? 'Exported!' : 'Export CSV' }}
</button>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS approach) -->
<button class="ui-csv-export" data-size="${size}" (click)="exportCSV()">
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  {{ exported ? 'Exported!' : 'Export CSV' }}
</button>

/* Import component CSS */
@import '${importPath}/css/components/csv-export.css';`
}

function generateSvelteCode(tier: Tier, filename: string, size: Size, useColumns: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<script>
  let exported = false

  const data = [
    { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer' },
    { name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer' },
  ]

  function handleExport() {
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(r => Object.values(r).join(','))
    const csv = [headers, ...rows].join('\\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '${filename}'
    a.click()
    exported = true
    setTimeout(() => exported = false, 2000)
  }
</script>

<button class="ui-lite-csv-export" data-size="${size}" on:click={handleExport}>
  {exported ? 'Exported!' : 'Export CSV'}
</button>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { CSVExportButton } from '${importPath}';

  const data = [
    { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer' },
    { name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer' },
  ]
  ${useColumns ? `\n  const columns = [\n    { key: 'name', label: 'Full Name' },\n    { key: 'email', label: 'Email' },\n  ]` : ''}
</script>

<CSVExportButton
  {data}
  ${useColumns ? '{columns}' : ''}
  filename="${filename}"
  size="${size}"
  on:export={() => console.log('Exported!')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [filename, setFilename] = useState('export.csv')
  const [useColumns, setUseColumns] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [customLabel, setCustomLabel] = useState('Export CSV')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [exportCount, setExportCount] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')

  const Component = tier === 'lite' ? LiteCSVExportButton : tier === 'premium' ? PremiumCSVExportButton : CSVExportButton

  const reactCode = useMemo(
    () => generateReactCode(tier, filename, size, useColumns, disabled, customLabel, motion),
    [tier, filename, size, useColumns, disabled, customLabel, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, size),
    [tier, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, filename, size, useColumns),
    [tier, filename, size, useColumns],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size),
    [tier, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, filename, size, useColumns),
    [tier, filename, size, useColumns],
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

  const previewProps: Record<string, unknown> = {
    data: SAMPLE_DATA,
    filename,
    size,
    disabled,
    onExport: () => setExportCount(c => c + 1),
  }
  if (useColumns) previewProps.columns = SAMPLE_COLUMNS
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="csv-export-page__section" id="playground">
      <h2 className="csv-export-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="csv-export-page__section-desc">
        Tweak every prop and see the result in real-time. Click the button to trigger a real CSV download.
      </p>

      <div className="csv-export-page__playground">
        {/* Preview area */}
        <div className="csv-export-page__playground-preview">
          <div className="csv-export-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <Component {...previewProps}>
                {customLabel !== 'Export CSV' ? customLabel : undefined}
              </Component>
              {exportCount > 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  Exported {exportCount} time{exportCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Data preview */}
          <table className="csv-export-page__data-table">
            <thead>
              <tr>
                {(useColumns ? SAMPLE_COLUMNS : SAMPLE_COLUMNS).map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {(useColumns ? SAMPLE_COLUMNS : SAMPLE_COLUMNS).map(col => (
                    <td key={col.key}>{String(row[col.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabbed code output */}
          <div className="csv-export-page__code-tabs">
            <div className="csv-export-page__export-row">
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
              {copyStatus && <span className="csv-export-page__export-status">{copyStatus}</span>}
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
        <div className="csv-export-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="csv-export-page__control-group">
            <span className="csv-export-page__control-label">Filename</span>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="csv-export-page__text-input"
              placeholder="export.csv"
            />
          </div>

          <div className="csv-export-page__control-group">
            <span className="csv-export-page__control-label">Label</span>
            <input
              type="text"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              className="csv-export-page__text-input"
              placeholder="Export CSV"
            />
          </div>

          <div className="csv-export-page__control-group">
            <span className="csv-export-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Custom columns" checked={useColumns} onChange={setUseColumns} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CsvExportPage() {
  useStyles('csv-export-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections -- JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.csv-export-page__section')
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

  const Component = tier === 'lite' ? LiteCSVExportButton : tier === 'premium' ? PremiumCSVExportButton : CSVExportButton

  return (
    <div className="csv-export-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="csv-export-page__hero">
        <h1 className="csv-export-page__title">CSV Export</h1>
        <p className="csv-export-page__desc">
          One-click CSV export button with built-in data serialization, file download, success feedback,
          and five size variants. Ships in three weight tiers with premium effects including ripple and particle burst.
        </p>
        <div className="csv-export-page__import-row">
          <code className="csv-export-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      <section className="csv-export-page__section" id="sizes">
        <h2 className="csv-export-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="csv-export-page__section-desc">
          Five sizes from compact inline actions (xs) to large call-to-action buttons (xl).
          Sizes control padding, font-size, and minimum block-size.
        </p>
        <div className="csv-export-page__preview">
          <div className="csv-export-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="csv-export-page__labeled-item">
                <Component data={SAMPLE_DATA} size={s} />
                <span className="csv-export-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Success State ──────────────────────────── */}
      <section className="csv-export-page__section" id="success">
        <h2 className="csv-export-page__section-title">
          <a href="#success">Success Feedback</a>
        </h2>
        <p className="csv-export-page__section-desc">
          After export, the button transitions to a green success state with a checkmark icon
          for 2 seconds before returning to its default state. Click the button below to see it in action.
        </p>
        <div className="csv-export-page__preview">
          <Component data={SAMPLE_DATA} filename="demo-export.csv" />
        </div>
        <CopyBlock
          code={`// The success state is automatic after export.
// The button shows a checkmark and "Exported!" text for 2 seconds.

<CSVExportButton
  data={tableData}
  filename="report.csv"
  onExport={() => toast.success('CSV downloaded!')}
/>`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 5. Custom Columns ─────────────────────────── */}
      <section className="csv-export-page__section" id="columns">
        <h2 className="csv-export-page__section-title">
          <a href="#columns">Custom Column Mapping</a>
        </h2>
        <p className="csv-export-page__section-desc">
          By default, all keys from the first data object become columns. Use the <code className="csv-export-page__a11y-key">columns</code> prop
          to control which fields are exported and customize header labels.
        </p>
        <div className="csv-export-page__preview" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Component
              data={SAMPLE_DATA}
              filename="all-columns.csv"
            >
              All Columns
            </Component>
            <Component
              data={SAMPLE_DATA}
              filename="selected-columns.csv"
              columns={[
                { key: 'name', label: 'Full Name' },
                { key: 'role', label: 'Position' },
              ]}
            >
              Name + Role Only
            </Component>
          </div>
        </div>
        <CopyBlock
          code={`// Export only specific columns with custom headers
<CSVExportButton
  data={data}
  columns={[
    { key: 'name', label: 'Full Name' },
    { key: 'role', label: 'Position' },
  ]}
  filename="employees.csv"
/>`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 6. Disabled + Empty ────────────────────────── */}
      <section className="csv-export-page__section" id="states">
        <h2 className="csv-export-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="csv-export-page__section-desc">
          The button can be explicitly disabled. It also gracefully handles empty data arrays by preventing download.
        </p>
        <div className="csv-export-page__preview">
          <div className="csv-export-page__labeled-row">
            <div className="csv-export-page__labeled-item">
              <Component data={SAMPLE_DATA}>Default</Component>
              <span className="csv-export-page__item-label">default</span>
            </div>
            <div className="csv-export-page__labeled-item">
              <Component data={SAMPLE_DATA} disabled>Disabled</Component>
              <span className="csv-export-page__item-label">disabled</span>
            </div>
            <div className="csv-export-page__labeled-item">
              <Component data={[]}>Empty Data</Component>
              <span className="csv-export-page__item-label">empty data</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CSV Escaping ───────────────────────────── */}
      <section className="csv-export-page__section" id="escaping">
        <h2 className="csv-export-page__section-title">
          <a href="#escaping">CSV Escaping</a>
        </h2>
        <p className="csv-export-page__section-desc">
          The built-in CSV generator properly handles special characters: commas, quotes, and newlines
          are escaped according to RFC 4180.
        </p>
        <div className="csv-export-page__preview">
          <Component
            data={[
              { name: 'O\'Brien, James', notes: 'Contains "quotes" and, commas' },
              { name: 'Multi\nLine', notes: 'Newlines\nare handled' },
            ]}
            filename="escaped-data.csv"
          >
            Export Special Characters
          </Component>
        </div>
        <CopyBlock
          code={`// Values with commas, quotes, or newlines are automatically escaped.
// Commas: wrapped in double quotes -> "O'Brien, James"
// Quotes: doubled inside quotes -> "Contains ""quotes"""
// Newlines: wrapped in double quotes -> "Multi\\nLine"

<CSVExportButton
  data={[
    { name: "O'Brien, James", notes: 'Contains "quotes"' },
  ]}
/>`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="csv-export-page__section" id="tiers">
        <h2 className="csv-export-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="csv-export-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API and CSV generation logic.
        </p>

        <div className="csv-export-page__tiers">
          {/* Lite */}
          <div
            className={`csv-export-page__tier-card${tier === 'lite' ? ' csv-export-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="csv-export-page__tier-header">
              <span className="csv-export-page__tier-name">Lite</span>
              <span className="csv-export-page__tier-size">~0.5 KB</span>
            </div>
            <p className="csv-export-page__tier-desc">
              Minimal export button with built-in CSV generation. No icons, no animations, no success state styling.
            </p>
            <div className="csv-export-page__tier-import">
              import {'{'} CSVExportButton {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="csv-export-page__tier-preview">
              <LiteCSVExportButton data={SAMPLE_DATA} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`csv-export-page__tier-card${tier === 'standard' ? ' csv-export-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="csv-export-page__tier-header">
              <span className="csv-export-page__tier-name">Standard</span>
              <span className="csv-export-page__tier-size">~1.8 KB</span>
            </div>
            <p className="csv-export-page__tier-desc">
              Full-featured with download/checkmark icons, green success state,
              press animation, motion levels, and 5 sizes.
            </p>
            <div className="csv-export-page__tier-import">
              import {'{'} CSVExportButton {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="csv-export-page__tier-preview">
              <CSVExportButton data={SAMPLE_DATA} />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`csv-export-page__tier-card${tier === 'premium' ? ' csv-export-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="csv-export-page__tier-header">
              <span className="csv-export-page__tier-name">Premium</span>
              <span className="csv-export-page__tier-size">~2.8 KB</span>
            </div>
            <p className="csv-export-page__tier-desc">
              Everything in Standard plus click ripple effect, success glow pulse,
              particle burst at motion level 3, and fade-up entrance.
            </p>
            <div className="csv-export-page__tier-import">
              import {'{'} CSVExportButton {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="csv-export-page__tier-preview">
              <PremiumCSVExportButton data={SAMPLE_DATA} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="csv-export-page__section" id="props">
        <h2 className="csv-export-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="csv-export-page__section-desc">
          All props accepted by CSVExportButton. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={csvExportProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="csv-export-page__section" id="accessibility">
        <h2 className="csv-export-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="csv-export-page__section-desc">
          Built on the native {'<button>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="csv-export-page__a11y-list">
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="csv-export-page__a11y-key">Enter</code> and <code className="csv-export-page__a11y-key">Space</code> keys.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored outline via <code className="csv-export-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses <code className="csv-export-page__a11y-key">disabled</code> attribute with 50% opacity and <code className="csv-export-page__a11y-key">pointer-events: none</code>.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Icons:</strong> Download and checkmark SVGs use <code className="csv-export-page__a11y-key">aria-hidden="true"</code> as the button text provides meaning.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="csv-export-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="csv-export-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className="csv-export-page__a11y-item">
              <span className="csv-export-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="csv-export-page__a11y-key">prefers-reduced-motion: reduce</code> by disabling all transitions.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ────────────────────────────────── */}
      <section className="csv-export-page__section" id="source">
        <h2 className="csv-export-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="csv-export-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/csv-export.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="csv-export-page__source-link"
        >
          <Icon name="external-link" size="sm" />
          src/domain/csv-export.tsx
        </a>
      </section>
    </div>
  )
}
