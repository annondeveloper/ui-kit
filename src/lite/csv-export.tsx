import { forwardRef, useState, type ButtonHTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const csvExportStyles = css`
  @layer components {
    @scope (.ui-lite-csv-export) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
        outline: none;
      }
      :scope[data-size="xs"] {
        padding-block: 0.25rem; padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.6875rem); min-block-size: 24px;
      }
      :scope[data-size="sm"] {
        padding-block: 0.375rem; padding-inline: 0.75rem;
        font-size: var(--text-xs, 0.75rem); min-block-size: 32px;
      }
      :scope[data-size="md"] {
        padding-block: 0.5rem; padding-inline: 1rem;
        font-size: var(--text-sm, 0.875rem); min-block-size: 36px;
      }
      :scope[data-size="lg"] {
        padding-block: 0.625rem; padding-inline: 1.25rem;
        font-size: var(--text-base, 1rem); min-block-size: 44px;
      }
      :scope[data-size="xl"] {
        padding-block: 0.75rem; padding-inline: 1.5rem;
        font-size: var(--text-lg, 1.125rem); min-block-size: 52px;
      }
      :scope:hover:not(:disabled) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.14));
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      :scope[data-exported] {
        background: var(--status-healthy, oklch(72% 0.19 145));
        border-color: var(--status-healthy, oklch(72% 0.19 145));
        color: oklch(100% 0 0);
      }
      :scope svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }
      @media (pointer: coarse) {
        :scope { min-block-size: 44px; min-inline-size: 44px; }
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
        :scope:focus-visible { outline: 2px solid Highlight; }
      }
    }
  }
`

export interface LiteCSVExportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  data: Record<string, unknown>[]
  filename?: string
  columns?: { key: string; label: string }[]
  onExport?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

function toCSV(data: Record<string, unknown>[], cols?: { key: string; label: string }[]): string {
  if (!data.length) return ''
  const c = cols ?? Object.keys(data[0]).map((k) => ({ key: k, label: k }))
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s }
  return [c.map((x) => esc(x.label)).join(','), ...data.map((r) => c.map((x) => esc(r[x.key])).join(','))].join('\n')
}

export const CSVExportButton = forwardRef<HTMLButtonElement, LiteCSVExportButtonProps>(
  ({ data, filename = 'export.csv', columns, onExport, size = 'md', className, children, onClick, ...rest }, ref) => {
    useStyles('lite-csv-export', csvExportStyles)
    const [done, setDone] = useState(false)
    const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
      const blob = new Blob([toCSV(data, columns)], { type: 'text/csv' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`; a.click()
      URL.revokeObjectURL(a.href); setDone(true); setTimeout(() => setDone(false), 2000)
      onExport?.(); onClick?.(e)
    }
    return (
      <button ref={ref} type="button" data-size={size} data-exported={done || undefined}
        className={`ui-lite-csv-export${className ? ` ${className}` : ''}`} onClick={handle} {...rest}>
        {children ?? (done ? 'Exported!' : 'Export CSV')}
      </button>
    )
  }
)
CSVExportButton.displayName = 'CSVExportButton'
