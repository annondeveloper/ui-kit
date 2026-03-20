'use client'

import {
  forwardRef,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'
import { DataTable, type DataTableProps, type ColumnDef } from './data-table'

// ─── Types ────────────────────────────────────────────────────────────

export interface SmartTableProps<T extends object>
  extends Omit<
    DataTableProps<T>,
    'sortBy' | 'sortDirection' | 'onSort' | 'selectedRows' | 'onSelectionChange' | 'pageSize'
  > {
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  paginated?: boolean
  pageSize?: number
  columnToggle?: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────

const smartTableStyles = css`
  @layer components {
    @scope (.ui-smart-table) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      /* Toolbar row */
      .ui-smart-table__controls {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        flex-wrap: wrap;
      }

      /* Search */
      .ui-smart-table__search {
        flex: 1 1 200px;
        min-inline-size: 0;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(20% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s var(--ease-out, ease-out);
      }

      .ui-smart-table__search:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      .ui-smart-table__search::placeholder {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Column toggle */
      .ui-smart-table__col-toggle {
        position: relative;
      }

      .ui-smart-table__col-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s var(--ease-out, ease-out);
      }

      .ui-smart-table__col-btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-smart-table__col-dropdown {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-end: 0;
        margin-block-start: var(--space-xs, 0.25rem);
        min-inline-size: 160px;
        padding: var(--space-xs, 0.25rem);
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        z-index: 10;
      }

      .ui-smart-table__col-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-radius: var(--radius-sm, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        user-select: none;
      }

      .ui-smart-table__col-item:hover {
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-smart-table__col-checkbox {
        accent-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-smart-table__search {
          border: 2px solid ButtonText;
        }
        .ui-smart-table__col-btn {
          border: 2px solid ButtonText;
        }
        .ui-smart-table__col-dropdown {
          border: 2px solid ButtonText;
        }
      }
    }
  }
`

// ─── Component ────────────────────────────────────────────────────────

function SmartTableInner<T extends object>(
  {
    data,
    columns,
    searchable = false,
    searchPlaceholder = 'Search...',
    filterable = false,
    paginated = false,
    pageSize = 10,
    columnToggle = false,
    selectable = false,
    className,
    ...rest
  }: SmartTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const cls = useStyles('smart-table', smartTableStyles)

  // ─── Internal state ────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const [showColDropdown, setShowColDropdown] = useState(false)

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!showColDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowColDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColDropdown])

  // ─── Visible columns ──────────────────────────────────────────────
  const visibleColumns = useMemo(
    () => columns.filter(col => !hiddenColumns.has(col.id)),
    [columns, hiddenColumns]
  )

  // ─── Filtered data ─────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      columns.some(col => {
        const val = typeof col.accessor === 'function'
          ? col.accessor(row)
          : row[col.accessor]
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  // ─── Sorted data ───────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData
    const col = columns.find(c => c.id === sortBy)
    if (!col) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor]
      const bVal = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor]

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // String comparison
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filteredData, sortBy, sortDirection, columns])

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleSort = useCallback((colId: string, dir: 'asc' | 'desc') => {
    setSortBy(colId)
    setSortDirection(dir)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // Reset selection on search change
    setSelectedRows(new Set())
  }, [])

  const toggleColumn = useCallback((colId: string) => {
    setHiddenColumns(prev => {
      const next = new Set(prev)
      if (next.has(colId)) {
        next.delete(colId)
      } else {
        next.add(colId)
      }
      return next
    })
  }, [])

  // ─── Determine whether to show controls bar ───────────────────────
  const showControls = searchable || columnToggle

  return (
    <div ref={ref} className={cn(cls('root'), className)}>
      {showControls && (
        <div className="ui-smart-table__controls">
          {searchable && (
            <input
              type="search"
              role="searchbox"
              className="ui-smart-table__search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              aria-label="Search table"
            />
          )}
          {columnToggle && (
            <div className="ui-smart-table__col-toggle" ref={dropdownRef}>
              <button
                type="button"
                className="ui-smart-table__col-btn"
                onClick={() => setShowColDropdown(v => !v)}
                aria-label="Toggle columns"
                aria-expanded={showColDropdown}
              >
                Columns
              </button>
              {showColDropdown && (
                <div className="ui-smart-table__col-dropdown" role="menu">
                  {columns.map(col => (
                    <label key={col.id} className="ui-smart-table__col-item">
                      <input
                        type="checkbox"
                        className="ui-smart-table__col-checkbox"
                        checked={!hiddenColumns.has(col.id)}
                        onChange={() => toggleColumn(col.id)}
                      />
                      {typeof col.header === 'string'
                        ? col.header
                        : typeof col.header === 'function'
                          ? col.id
                          : col.id}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <DataTable
        data={sortedData}
        columns={visibleColumns}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectable={selectable}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        pageSize={paginated ? pageSize : undefined}
        {...rest}
      />
    </div>
  )
}

export const SmartTable = forwardRef(SmartTableInner) as <T extends object>(
  props: SmartTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

;(SmartTable as unknown as { displayName: string }).displayName = 'SmartTable'
