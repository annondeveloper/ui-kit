import { forwardRef, useState, type ButtonHTMLAttributes } from 'react'

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
