import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const dataTableStyles = css`
  @layer components {
    @scope (.ui-lite-data-table) {
      :scope {
        overflow-x: auto;
        color: var(--text-primary, oklch(97% 0 0));
      }
      table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm, 0.8125rem);
      }
      th {
        text-align: start;
        padding: 0.5rem 0.75rem;
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      td {
        padding: 0.5rem 0.75rem;
        border-block-end: 1px solid oklch(100% 0 0 / 0.02);
      }
      :scope[data-striped] tbody tr:nth-child(even) {
        background: oklch(100% 0 0 / 0.02);
      }
      :scope[data-compact] th,
      :scope[data-compact] td {
        padding: 0.25rem 0.5rem;
      }
    }
  }
`

export interface LiteColumnDef<T> {
  id: string
  header: ReactNode
  accessor: keyof T | ((row: T) => unknown)
  width?: string
}

export interface LiteDataTableProps<T extends object> extends HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: LiteColumnDef<T>[]
  striped?: boolean
  compact?: boolean
}

function DataTableInner<T extends object>(
  { data, columns, striped, compact, className, ...rest }: LiteDataTableProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  useStyles('lite-data-table', dataTableStyles)
  const getValue = (row: T, col: LiteColumnDef<T>) =>
    typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]

  return (
    <div ref={ref} className={`ui-lite-data-table${className ? ` ${className}` : ''}`} data-striped={striped ? '' : undefined} data-compact={compact ? '' : undefined} {...rest}>
      <table>
        <thead>
          <tr>{columns.map(col => <th key={col.id} style={col.width ? { width: col.width } : undefined}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>{columns.map(col => <td key={col.id}>{String(getValue(row, col) ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const DataTable = forwardRef(DataTableInner) as <T extends object>(
  props: LiteDataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement
