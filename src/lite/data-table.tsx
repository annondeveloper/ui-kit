import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
