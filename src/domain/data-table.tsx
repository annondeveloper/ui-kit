'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  id: string
  header: ReactNode | (() => ReactNode)
  accessor: keyof T | ((row: T) => unknown)
  cell?: (value: unknown, row: T) => ReactNode
  sortable?: boolean
  resizable?: boolean
  width?: number | string
  minWidth?: number
  pinned?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T extends object> extends HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: ColumnDef<T>[]
  // Sorting
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void
  // Selection
  selectable?: boolean
  selectedRows?: Set<number>
  onSelectionChange?: (selected: Set<number>) => void
  // Pagination
  pageSize?: number
  // State
  loading?: boolean
  empty?: ReactNode
  error?: ReactNode
  // Features
  stickyHeader?: boolean
  striped?: boolean
  compact?: boolean
  // Export
  onExport?: (format: 'csv' | 'json') => void
  // Responsive
  responsiveMode?: 'scroll' | 'card'
  // Motion
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ───────────────────────────────────────────────────────────

const dataTableStyles = css`
  @layer components {
    @scope (.ui-data-table) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        container-type: inline-size;
        container-name: data-table;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
      }

      /* Scroll wrapper */
      .ui-data-table__scroll {
        overflow-x: auto;
        overflow-y: visible;
        border-radius: var(--radius-lg, 0.75rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        background: var(--bg-elevated, oklch(20% 0.02 270));
      }

      /* Table */
      .ui-data-table__table {
        inline-size: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        font-size: var(--text-sm, 0.875rem);
      }

      /* Header */
      .ui-data-table__thead {
        background: var(--bg-surface, oklch(22% 0.02 270));
      }

      :scope[data-sticky-header] .ui-data-table__thead {
        position: sticky;
        inset-block-start: 0;
        z-index: 2;
      }

      :scope[data-sticky-header] .ui-data-table__thead::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        block-size: 4px;
        inset-block-end: -4px;
        background: linear-gradient(to bottom, oklch(0% 0 0 / 0.15), transparent);
        pointer-events: none;
      }

      /* Header cells */
      .ui-data-table__th {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        text-align: start;
        font-weight: 600;
        font-size: var(--text-xs, 0.75rem);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
        position: relative;
        user-select: none;
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
      }

      :scope[data-compact] .ui-data-table__th {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        font-size: 0.6875rem;
      }

      .ui-data-table__th[data-sortable] {
        cursor: pointer;
        transition: color 0.15s var(--ease-out, ease-out);
      }

      .ui-data-table__th[data-sortable]:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-data-table__th[data-align="center"] { text-align: center; }
      .ui-data-table__th[data-align="right"] { text-align: end; }

      /* Pinned columns */
      .ui-data-table__th[data-pinned="left"],
      .ui-data-table__td[data-pinned="left"] {
        position: sticky;
        inset-inline-start: 0;
        z-index: 1;
        background: inherit;
      }

      .ui-data-table__th[data-pinned="right"],
      .ui-data-table__td[data-pinned="right"] {
        position: sticky;
        inset-inline-end: 0;
        z-index: 1;
        background: inherit;
      }

      /* Sort indicator */
      .ui-data-table__sort-icon {
        display: inline-flex;
        margin-inline-start: var(--space-xs, 0.25rem);
        opacity: 0.4;
        vertical-align: middle;
        transition: opacity 0.15s, transform 0.2s var(--ease-out, ease-out);
      }

      .ui-data-table__th[aria-sort="ascending"] .ui-data-table__sort-icon,
      .ui-data-table__th[aria-sort="descending"] .ui-data-table__sort-icon {
        opacity: 1;
      }

      .ui-data-table__th[aria-sort="descending"] .ui-data-table__sort-icon {
        transform: rotate(180deg);
      }

      /* Header content wrapper */
      .ui-data-table__header-content {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      /* Resize handle */
      .ui-data-table__resize-handle {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        inline-size: 4px;
        cursor: col-resize;
        user-select: none;
        touch-action: none;
        background: transparent;
        transition: background 0.15s;
        z-index: 1;
      }

      .ui-data-table__resize-handle:hover,
      .ui-data-table__resize-handle[data-resizing] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* Data rows */
      .ui-data-table__tr {
        transition: background 0.1s var(--ease-out, ease-out);
      }

      .ui-data-table__tr:hover {
        background: oklch(100% 0 0 / 0.03);
      }

      :scope[data-striped] .ui-data-table__tr:nth-child(even) {
        background: oklch(100% 0 0 / 0.02);
      }

      :scope[data-striped] .ui-data-table__tr:nth-child(even):hover {
        background: oklch(100% 0 0 / 0.05);
      }

      .ui-data-table__tr[data-selected] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      /* Data cells */
      .ui-data-table__td {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.05));
        vertical-align: middle;
      }

      :scope[data-compact] .ui-data-table__td {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
      }

      .ui-data-table__td[data-align="center"] { text-align: center; }
      .ui-data-table__td[data-align="right"] { text-align: end; }

      /* Checkbox cell */
      .ui-data-table__checkbox-cell {
        inline-size: 44px;
        text-align: center;
      }

      .ui-data-table__checkbox {
        cursor: pointer;
        accent-color: var(--brand, oklch(65% 0.2 270));
        inline-size: 16px;
        block-size: 16px;
      }

      /* Empty state */
      .ui-data-table__empty {
        padding: var(--space-2xl, 3rem);
        text-align: center;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* Error state */
      .ui-data-table__error {
        padding: var(--space-xl, 1.5rem);
        text-align: center;
        color: var(--status-critical, oklch(65% 0.25 25));
        font-size: var(--text-sm, 0.875rem);
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.05);
        border-radius: var(--radius-md, 0.5rem);
      }

      /* Skeleton rows */
      .ui-data-table__skeleton-row {
        display: table-row;
      }

      .ui-data-table__skeleton-cell {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.05));
      }

      .ui-data-table__skeleton-bar {
        display: block;
        block-size: 0.875rem;
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(25% 0.02 270));
        animation: ui-data-table-shimmer 1.8s var(--ease-in-out, ease-in-out) infinite;
      }

      /* Export toolbar */
      .ui-data-table__toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-data-table__export-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s var(--ease-out, ease-out);
      }

      .ui-data-table__export-btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Pagination */
      .ui-data-table__pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-data-table__page-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 32px;
        min-block-size: 32px;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s var(--ease-out, ease-out);
      }

      .ui-data-table__page-btn:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-data-table__page-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      /* Card mode (responsive) */
      @container data-table (max-width: 480px) {
        :scope[data-responsive="card"] .ui-data-table__table {
          display: block;
        }

        :scope[data-responsive="card"] .ui-data-table__thead {
          display: none;
        }

        :scope[data-responsive="card"] .ui-data-table__tbody {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm, 0.5rem);
        }

        :scope[data-responsive="card"] .ui-data-table__tr {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
          border-radius: var(--radius-md, 0.5rem);
          padding: var(--space-sm, 0.5rem);
        }

        :scope[data-responsive="card"] .ui-data-table__td {
          display: flex;
          justify-content: space-between;
          border: none;
          padding-block: var(--space-xs, 0.25rem);
        }

        :scope[data-responsive="card"] .ui-data-table__td::before {
          content: attr(data-label);
          font-weight: 600;
          color: var(--text-secondary, oklch(70% 0 0));
          margin-inline-end: var(--space-md, 0.75rem);
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-data-table__scroll {
          border: 2px solid ButtonText;
        }
        .ui-data-table__th {
          border-block-end: 2px solid ButtonText;
        }
        .ui-data-table__td {
          border-block-end: 1px solid ButtonText;
        }
        .ui-data-table__tr[data-selected] {
          outline: 2px solid Highlight;
        }
        .ui-data-table__resize-handle:hover,
        .ui-data-table__resize-handle[data-resizing] {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-data-table__toolbar,
        .ui-data-table__pagination,
        .ui-data-table__resize-handle,
        .ui-data-table__checkbox-cell {
          display: none;
        }
        .ui-data-table__scroll {
          overflow: visible;
        }
      }
    }

    @keyframes ui-data-table-shimmer {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────

function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => unknown)): unknown {
  return typeof accessor === 'function' ? accessor(row) : row[accessor]
}

function renderHeader<T>(header: ReactNode | (() => ReactNode)): ReactNode {
  return typeof header === 'function' ? header() : header
}

// ─── Component ────────────────────────────────────────────────────────

function DataTableInner<T extends object>(
  {
    data,
    columns,
    sortBy,
    sortDirection,
    onSort,
    selectable = false,
    selectedRows,
    onSelectionChange,
    pageSize,
    loading = false,
    empty,
    error,
    stickyHeader = false,
    striped = false,
    compact = false,
    onExport,
    responsiveMode = 'scroll',
    motion: motionProp,
    className,
    ...rest
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const cls = useStyles('data-table', dataTableStyles)
  const motionLevel = useMotionLevel(motionProp)

  // ─── Internal pagination state ─────────────────────────────────────
  const [page, setPage] = useState(0)
  const totalPages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1

  // Reset page if data changes
  useEffect(() => {
    setPage(0)
  }, [data.length])

  const paginatedData = pageSize
    ? data.slice(page * pageSize, (page + 1) * pageSize)
    : data

  // ─── Column widths for resize ──────────────────────────────────────
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    for (const col of columns) {
      if (typeof col.width === 'number') {
        widths[col.id] = col.width
      }
    }
    return widths
  })

  const resizeRef = useRef<{
    colId: string
    startX: number
    startWidth: number
  } | null>(null)

  const handleResizeStart = useCallback(
    (colId: string, e: React.PointerEvent) => {
      e.preventDefault()
      const th = (e.target as HTMLElement).parentElement!
      const startWidth = columnWidths[colId] ?? th.getBoundingClientRect().width
      resizeRef.current = { colId, startX: e.clientX, startWidth }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      ;(e.target as HTMLElement).setAttribute('data-resizing', '')
    },
    [columnWidths]
  )

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current) return
      const { colId, startX, startWidth } = resizeRef.current
      const col = columns.find(c => c.id === colId)
      const minW = col?.minWidth ?? 50
      const newWidth = Math.max(minW, startWidth + (e.clientX - startX))
      setColumnWidths(prev => ({ ...prev, [colId]: newWidth }))
    },
    [columns]
  )

  const handleResizeEnd = useCallback(
    (e: React.PointerEvent) => {
      resizeRef.current = null
      ;(e.target as HTMLElement).removeAttribute('data-resizing')
    },
    []
  )

  // ─── Sort handler ──────────────────────────────────────────────────
  const handleSort = useCallback(
    (colId: string) => {
      if (!onSort) return
      const col = columns.find(c => c.id === colId)
      if (!col?.sortable) return

      const newDir: 'asc' | 'desc' =
        sortBy === colId && sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(colId, newDir)
    },
    [onSort, columns, sortBy, sortDirection]
  )

  // ─── Selection handlers ────────────────────────────────────────────
  const handleRowSelect = useCallback(
    (rowIndex: number) => {
      if (!onSelectionChange) return
      const current = selectedRows ?? new Set<number>()
      const next = new Set(current)
      if (next.has(rowIndex)) {
        next.delete(rowIndex)
      } else {
        next.add(rowIndex)
      }
      onSelectionChange(next)
    },
    [selectedRows, onSelectionChange]
  )

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return
    const current = selectedRows ?? new Set<number>()
    if (current.size === data.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(data.map((_, i) => i)))
    }
  }, [selectedRows, data, onSelectionChange])

  const allSelected = selectedRows?.size === data.length && data.length > 0
  const someSelected = (selectedRows?.size ?? 0) > 0 && !allSelected

  // Set indeterminate on select-all checkbox
  const selectAllRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  // ─── Keyboard navigation ───────────────────────────────────────────
  const gridRef = useRef<HTMLTableElement | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const grid = gridRef.current
      if (!grid) return

      const active = document.activeElement as HTMLElement
      if (!active) return

      // Find current cell position
      const allRows = Array.from(grid.querySelectorAll('tr'))
      let rowIdx = -1
      let colIdx = -1

      for (let r = 0; r < allRows.length; r++) {
        const cells = Array.from(
          allRows[r].querySelectorAll('[role="columnheader"], [role="gridcell"]')
        )
        const idx = cells.indexOf(active)
        if (idx !== -1) {
          rowIdx = r
          colIdx = idx
          break
        }
      }

      if (rowIdx === -1 || colIdx === -1) return

      let nextRow = rowIdx
      let nextCol = colIdx

      switch (e.key) {
        case 'ArrowDown':
          nextRow = Math.min(rowIdx + 1, allRows.length - 1)
          e.preventDefault()
          break
        case 'ArrowUp':
          nextRow = Math.max(rowIdx - 1, 0)
          e.preventDefault()
          break
        case 'ArrowRight':
          {
            const cells = allRows[rowIdx].querySelectorAll(
              '[role="columnheader"], [role="gridcell"]'
            )
            nextCol = Math.min(colIdx + 1, cells.length - 1)
          }
          e.preventDefault()
          break
        case 'ArrowLeft':
          nextCol = Math.max(colIdx - 1, 0)
          e.preventDefault()
          break
        case 'Enter': {
          // Activate sort if on sortable header
          if (rowIdx === 0) {
            const col = getVisibleColumns()[colIdx]
            if (col?.sortable) {
              handleSort(col.id)
            }
          }
          return
        }
        default:
          return
      }

      const targetRow = allRows[nextRow]
      if (!targetRow) return
      const targetCells = Array.from(
        targetRow.querySelectorAll('[role="columnheader"], [role="gridcell"]')
      )
      const targetCell = targetCells[nextCol] as HTMLElement | undefined
      targetCell?.focus()
    },
    [handleSort]
  )

  // ─── Visible columns helper ────────────────────────────────────────
  const getVisibleColumns = useCallback(() => columns, [columns])

  // ─── Compute aria-sort ─────────────────────────────────────────────
  function getAriaSort(col: ColumnDef<T>): string | undefined {
    if (!col.sortable) return undefined
    if (sortBy !== col.id) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  // ─── Column style ──────────────────────────────────────────────────
  function getColStyle(col: ColumnDef<T>): CSSProperties | undefined {
    const w = columnWidths[col.id] ?? col.width
    if (!w) return undefined
    return { inlineSize: typeof w === 'number' ? `${w}px` : w }
  }

  // ─── Render ─────────────────────────────────────────────────────────

  const visibleColumns = getVisibleColumns()

  return (
    <div
      ref={ref}
      className={cn(cls('root'), className)}
      data-motion={motionLevel}
      data-responsive={responsiveMode}
      {...(stickyHeader ? { 'data-sticky-header': '' } : {})}
      {...(striped ? { 'data-striped': '' } : {})}
      {...(compact ? { 'data-compact': '' } : {})}
      {...rest}
    >
      {/* Toolbar */}
      {onExport && (
        <div className="ui-data-table__toolbar">
          <button
            type="button"
            className="ui-data-table__export-btn"
            onClick={() => onExport('csv')}
            aria-label="Export CSV"
          >
            CSV
          </button>
          <button
            type="button"
            className="ui-data-table__export-btn"
            onClick={() => onExport('json')}
            aria-label="Export JSON"
          >
            JSON
          </button>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="ui-data-table__error" role="alert">
          {error}
        </div>
      ) : (
        <div className="ui-data-table__scroll">
          <table
            ref={gridRef}
            className="ui-data-table__table"
            role="grid"
            aria-rowcount={data.length + 1}
            aria-colcount={visibleColumns.length + (selectable ? 1 : 0)}
            onKeyDown={handleKeyDown}
          >
            <thead className="ui-data-table__thead" role="rowgroup">
              <tr role="row">
                {selectable && (
                  <th
                    className="ui-data-table__th ui-data-table__checkbox-cell"
                    role="columnheader"
                    scope="col"
                    tabIndex={-1}
                  >
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="ui-data-table__checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {visibleColumns.map(col => (
                  <th
                    key={col.id}
                    className="ui-data-table__th"
                    role="columnheader"
                    scope="col"
                    tabIndex={-1}
                    style={getColStyle(col)}
                    aria-sort={getAriaSort(col) as React.AriaAttributes['aria-sort']}
                    data-sortable={col.sortable ? '' : undefined}
                    data-align={col.align || undefined}
                    data-pinned={col.pinned || undefined}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <span className="ui-data-table__header-content">
                      {renderHeader(col.header)}
                      {col.sortable && (
                        <span className="ui-data-table__sort-icon" aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                          </svg>
                        </span>
                      )}
                    </span>
                    {col.resizable && (
                      <span
                        className="ui-data-table__resize-handle"
                        onPointerDown={e => handleResizeStart(col.id, e)}
                        onPointerMove={handleResizeMove}
                        onPointerUp={handleResizeEnd}
                        role="separator"
                        aria-orientation="vertical"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="ui-data-table__tbody" role="rowgroup">
              {loading ? (
                // Skeleton rows
                Array.from({ length: pageSize ?? 5 }, (_, ri) => (
                  <tr key={`skel-${ri}`} className="ui-data-table__skeleton-row" role="row">
                    {selectable && (
                      <td className="ui-data-table__skeleton-cell ui-data-table__checkbox-cell" role="gridcell">
                        <span className="ui-data-table__skeleton-bar" style={{ inlineSize: '16px', margin: '0 auto' }} />
                      </td>
                    )}
                    {visibleColumns.map(col => (
                      <td key={col.id} className="ui-data-table__skeleton-cell" role="gridcell">
                        <span
                          className="ui-data-table__skeleton-bar"
                          style={{ inlineSize: `${50 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr role="row">
                  <td
                    className="ui-data-table__empty"
                    role="gridcell"
                    colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  >
                    {empty ?? 'No data'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => {
                  const globalIdx = pageSize ? page * pageSize + rowIdx : rowIdx
                  const isSelected = selectedRows?.has(globalIdx) ?? false

                  return (
                    <tr
                      key={rowIdx}
                      className="ui-data-table__tr"
                      role="row"
                      aria-selected={selectable ? isSelected : undefined}
                      data-selected={isSelected ? '' : undefined}
                    >
                      {selectable && (
                        <td
                          className="ui-data-table__td ui-data-table__checkbox-cell"
                          role="gridcell"
                          tabIndex={-1}
                        >
                          <input
                            type="checkbox"
                            className="ui-data-table__checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(globalIdx)}
                            aria-label={`Select row ${globalIdx + 1}`}
                          />
                        </td>
                      )}
                      {visibleColumns.map(col => {
                        const value = getCellValue(row, col.accessor)
                        return (
                          <td
                            key={col.id}
                            className="ui-data-table__td"
                            role="gridcell"
                            tabIndex={-1}
                            data-align={col.align || undefined}
                            data-pinned={col.pinned || undefined}
                            data-label={typeof col.header === 'string' ? col.header : col.id}
                          >
                            {col.cell
                              ? col.cell(value, row)
                              : String(value ?? '')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pageSize && !error && !loading && (
        <nav className="ui-data-table__pagination" aria-label="Table pagination">
          <button
            type="button"
            className="ui-data-table__page-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            aria-label="Previous page"
          >
            &#x276E;
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="ui-data-table__page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            aria-label="Next page"
          >
            &#x276F;
          </button>
        </nav>
      )}
    </div>
  )
}

export const DataTable = forwardRef(DataTableInner) as <T extends object>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

;(DataTable as unknown as { displayName: string }).displayName = 'DataTable'
