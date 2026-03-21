'use client'

import {
  forwardRef,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'
import { DataTable, type DataTableProps, type ColumnDef } from './data-table'

// ─── Types ────────────────────────────────────────────────────────────

/**
 * SmartTable is now a thin convenience wrapper around DataTable.
 * It maps the legacy SmartTable props to DataTable's richer API.
 *
 * For new code, prefer using DataTable directly — it supports all features
 * SmartTable had (search, sort, pagination, column toggle) plus many more.
 */
export interface SmartTableProps<T extends object>
  extends Omit<DataTableProps<T>, 'searchable' | 'paginated' | 'exportable'> {
  /** Enable search bar (maps to DataTable's searchable) */
  searchable?: boolean
  /** Placeholder for the search input */
  searchPlaceholder?: string
  /** Enable filtering (alias for searchable) */
  filterable?: boolean
  /** Enable pagination (maps to DataTable's paginated) */
  paginated?: boolean
  /** Enable column toggle dropdown */
  columnToggle?: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────

const smartTableStyles = css`
  @layer components {
    @scope (.ui-smart-table) {
      :scope {
        display: contents;
      }
    }
  }
`

// ─── Component ────────────────────────────────────────────────────────

function SmartTableInner<T extends object>(
  {
    searchable = false,
    searchPlaceholder: _searchPlaceholder,
    filterable = false,
    paginated = false,
    columnToggle: _columnToggle = false,
    sortable = true,
    className,
    ...rest
  }: SmartTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const cls = useStyles('smart-table', smartTableStyles)

  return (
    <div className={cn(cls('root'), className)}>
      <DataTable
        ref={ref}
        searchable={searchable || filterable}
        paginated={paginated}
        sortable={sortable}
        {...rest}
      />
    </div>
  )
}

export const SmartTable = forwardRef(SmartTableInner) as <T extends object>(
  props: SmartTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

;(SmartTable as unknown as { displayName: string }).displayName = 'SmartTable'
