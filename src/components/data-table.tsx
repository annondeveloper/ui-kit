'use client'

import type React from 'react'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState,
  type ColumnFiltersState, type VisibilityState,
  type FilterFn, type Table,
} from '@tanstack/react-table'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Download, Filter, X, List, AlignJustify, LayoutList,
  Columns3, Eye, EyeOff, GripVertical,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TruncatedText } from './truncated-text'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton'
import { Select } from './select'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

export type Density = 'compact' | 'comfortable' | 'spacious'

const DENSITY_CLASSES: Record<Density, string> = {
  compact: 'py-1.5 px-3',
  comfortable: 'py-3 px-4',
  spacious: 'py-4 px-5',
}

const DENSITY_ICONS: { key: Density; icon: LucideIcon; label: string }[] = [
  { key: 'compact', icon: List, label: 'Compact' },
  { key: 'comfortable', icon: AlignJustify, label: 'Comfortable' },
  { key: 'spacious', icon: LayoutList, label: 'Spacious' },
]

const PAGE_SIZES = [10, 25, 50, 100]
const STORAGE_KEY = 'ui-kit-table-density'

// ---------------------------------------------------------------------------
// Global filter
// ---------------------------------------------------------------------------

const globalFilterFn: FilterFn<unknown> = (row, _columnId, filterValue) => {
  const search = String(filterValue).toLowerCase()
  return row.getAllCells().some(cell =>
    String(cell.getValue() ?? '').toLowerCase().includes(search)
  )
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function exportToCsv<T>(table: Table<T>, filename: string) {
  const headers = table.getAllColumns().filter(c => c.getIsVisible()).map(c => c.id)
  const rows = table.getFilteredRowModel().rows.map(row =>
    headers.map(h => {
      const val = row.getValue(h)
      const str = String(val ?? '')
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Column filter popover (internal)
// ---------------------------------------------------------------------------

function ColumnFilterPopover<T>({ column, table }: {
  column: ReturnType<Table<T>['getHeaderGroups']>[0]['headers'][0]['column']
  table: Table<T>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentFilter = column.getFilterValue()
  const isActive = currentFilter !== undefined && currentFilter !== '' &&
    !(Array.isArray(currentFilter) && currentFilter.length === 0)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const { kind, uniqueValues } = useMemo(() => {
    const rows = table.getPreFilteredRowModel().rows.slice(0, 100)
    const vals = rows.map(r => r.getValue(column.id)).filter(v => v != null)
    const nums = vals.filter(v => typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v))))
    if (nums.length > vals.length * 0.7 && vals.length > 0) return { kind: 'number' as const, uniqueValues: [] }
    const uniques = [...new Set(vals.map(v => String(v)))]
    if (uniques.length > 0 && uniques.length < 20) return { kind: 'enum' as const, uniqueValues: uniques.sort() }
    return { kind: 'text' as const, uniqueValues: [] }
  }, [table, column.id])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="relative p-0.5 rounded hover:bg-[hsl(var(--bg-elevated)/0.5)] transition-colors"
        aria-label={`Filter ${column.id}`}
      >
        <Filter className="h-3 w-3 text-[hsl(var(--text-tertiary))]" />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-primary))]" />
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1 min-w-[200px]
            bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-default))] rounded-lg shadow-lg p-3"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
              Filter
            </span>
            {isActive && (
              <button
                onClick={() => { column.setFilterValue(undefined); setOpen(false) }}
                className="text-[11px] text-[hsl(var(--brand-primary))] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {kind === 'text' && (
            <input
              type="text"
              value={(currentFilter as string) ?? ''}
              onChange={e => column.setFilterValue(e.target.value || undefined)}
              placeholder="Search\u2026"
              className="w-full rounded-md border border-[hsl(var(--border-subtle))]
                bg-[hsl(var(--bg-surface))] px-2.5 py-1.5 text-small text-[hsl(var(--text-primary))]
                placeholder:text-[hsl(var(--text-tertiary))] outline-none
                focus:border-[hsl(var(--brand-primary))] transition-colors"
              autoFocus
            />
          )}

          {kind === 'number' && (
            <div className="flex gap-2">
              <input
                type="number"
                value={(currentFilter as [number?, number?])?.[0] ?? ''}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Number(e.target.value)
                  column.setFilterValue((old: [number?, number?]) => [val, old?.[1]])
                }}
                placeholder="Min"
                className="w-full rounded-md border border-[hsl(var(--border-subtle))]
                  bg-[hsl(var(--bg-surface))] px-2.5 py-1.5 text-small text-[hsl(var(--text-primary))]
                  placeholder:text-[hsl(var(--text-tertiary))] outline-none
                  focus:border-[hsl(var(--brand-primary))] transition-colors"
              />
              <input
                type="number"
                value={(currentFilter as [number?, number?])?.[1] ?? ''}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Number(e.target.value)
                  column.setFilterValue((old: [number?, number?]) => [old?.[0], val])
                }}
                placeholder="Max"
                className="w-full rounded-md border border-[hsl(var(--border-subtle))]
                  bg-[hsl(var(--bg-surface))] px-2.5 py-1.5 text-small text-[hsl(var(--text-primary))]
                  placeholder:text-[hsl(var(--text-tertiary))] outline-none
                  focus:border-[hsl(var(--brand-primary))] transition-colors"
              />
            </div>
          )}

          {kind === 'enum' && (
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {uniqueValues.map(val => {
                const selected = Array.isArray(currentFilter) ? (currentFilter as string[]).includes(val) : false
                return (
                  <label key={val} className="flex items-center gap-2 rounded px-1.5 py-1
                    hover:bg-[hsl(var(--bg-surface)/0.5)] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const prev = Array.isArray(currentFilter) ? (currentFilter as string[]) : []
                        const next = selected ? prev.filter(v => v !== val) : [...prev, val]
                        column.setFilterValue(next.length > 0 ? next : undefined)
                      }}
                      className="rounded border-[hsl(var(--border-default))] accent-[hsl(var(--brand-primary))]"
                    />
                    <span className="text-small text-[hsl(var(--text-primary))] truncate">{val}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Column picker
// ---------------------------------------------------------------------------

function ColumnPicker<T>({ table, onClose }: { table: Table<T>; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const allColumns = table.getAllLeafColumns()

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const order = table.getState().columnOrder.length > 0
      ? [...table.getState().columnOrder]
      : allColumns.map(c => c.id)
    const [moved] = order.splice(dragIdx, 1)
    if (moved !== undefined) order.splice(idx, 0, moved)
    table.setColumnOrder(order)
    setDragIdx(idx)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      className={cn(
        'absolute right-0 top-full z-50 mt-1 w-56 rounded-xl overflow-hidden',
        'border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] shadow-xl',
      )}
    >
      <div className="px-3 py-2 border-b border-[hsl(var(--border-subtle)/0.5)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
          Columns
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {allColumns.map((col, idx) => {
          if (!col.getCanHide()) return null
          const visible = col.getIsVisible()
          const header = typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
          return (
            <div
              key={col.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => setDragIdx(null)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-small cursor-grab',
                'hover:bg-[hsl(var(--bg-surface)/0.7)] transition-colors',
                dragIdx === idx && 'bg-[hsl(var(--brand-primary)/0.1)]',
              )}
            >
              <GripVertical className="h-3 w-3 text-[hsl(var(--text-disabled))] shrink-0" />
              <button
                onClick={() => col.toggleVisibility()}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {visible
                  ? <Eye className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
                  : <EyeOff className="h-3.5 w-3.5 text-[hsl(var(--text-disabled))]" />}
                <span className={cn(
                  'truncate',
                  visible ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-disabled))]',
                )}>
                  {header}
                </span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="px-3 py-2 border-t border-[hsl(var(--border-subtle)/0.5)]">
        <button
          onClick={() => {
            table.toggleAllColumnsVisible(true)
            table.setColumnOrder([])
          }}
          className="text-[10px] text-[hsl(var(--brand-primary))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// DataTable props
// ---------------------------------------------------------------------------

export interface DataTableProps<T> {
  /** Column definitions from @tanstack/react-table. */
  columns: ColumnDef<T, unknown>[]
  /** Row data array. */
  data: T[]
  /** Show loading skeleton. */
  isLoading?: boolean
  /** Custom empty state configuration. */
  emptyState?: { icon: LucideIcon; title: string; description: string }
  /** Placeholder text for the search input. */
  searchPlaceholder?: string
  /** Callback when a row is clicked. */
  onRowClick?: (row: T) => void
  /** Default sorting configuration. */
  defaultSort?: { id: string; desc: boolean }
  /** Default number of rows per page. */
  defaultPageSize?: number
  /** Filename for CSV export (enables export button when set). */
  exportFilename?: string
  /** Make the first column sticky on horizontal scroll. */
  stickyFirstColumn?: boolean
  /** Override the density setting. */
  density?: Density
}

// ---------------------------------------------------------------------------
// DataTable component
// ---------------------------------------------------------------------------

/**
 * @description A full-featured data table with search, column filters, sorting, pagination,
 * density control, column visibility/reorder, CSV export, and Framer Motion row animations.
 * Built on @tanstack/react-table v8.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyState: emptyStateProps,
  searchPlaceholder = 'Search...',
  onRowClick,
  defaultSort,
  defaultPageSize = 25,
  exportFilename,
  stickyFirstColumn = false,
  density: densityProp,
}: DataTableProps<T>): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()

  const [density, setDensity] = useState<Density>(() => {
    if (densityProp) return densityProp
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && stored in DENSITY_CLASSES) return stored as Density
    }
    return 'comfortable'
  })

  const handleDensity = useCallback((d: Density) => {
    setDensity(d)
    localStorage.setItem(STORAGE_KEY, d)
  }, [])

  const [sorting, setSorting] = useState<SortingState>(
    defaultSort ? [{ id: defaultSort.id, desc: defaultSort.desc }] : []
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [columnPickerOpen, setColumnPickerOpen] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = useReactTable({
    data: data as any[],
    columns: columns as any,
    state: { sorting, columnFilters, globalFilter, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: defaultPageSize } },
  })

  const activeFilterCount = columnFilters.length
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)
  const pageCount = table.getPageCount()

  const rowVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 4 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i, 20) * 0.02,
        duration: 0.15,
      },
    }),
  }), [])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border-subtle)/0.5)]
        bg-[hsl(var(--bg-surface)/0.6)] backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[hsl(var(--border-subtle)/0.3)]">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="divide-y divide-[hsl(var(--border-subtle)/0.3)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn('flex gap-4', DENSITY_CLASSES.comfortable)}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border-subtle)/0.5)]
      bg-[hsl(var(--bg-surface)/0.6)] backdrop-blur-xl overflow-hidden">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3
        border-b border-[hsl(var(--border-subtle)/0.3)]">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4
            text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[hsl(var(--border-subtle))]
              bg-[hsl(var(--bg-surface))] pl-9 pr-3 py-2 text-small
              text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]
              outline-none focus:border-[hsl(var(--brand-primary))] transition-colors"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded
                hover:bg-[hsl(var(--bg-elevated)/0.5)] transition-colors"
            >
              <X className="h-3.5 w-3.5 text-[hsl(var(--text-tertiary))]" />
            </button>
          )}
        </div>

        {/* Active filter count */}
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full
            bg-[hsl(var(--brand-primary)/0.15)] px-2.5 py-1 text-[11px] font-medium
            text-[hsl(var(--brand-primary))]">
            <Filter className="h-3 w-3" />
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </span>
        )}

        <div className="flex-1" />

        {/* Density toggle */}
        <div className="flex items-center rounded-lg border border-[hsl(var(--border-subtle))]
          bg-[hsl(var(--bg-surface))] p-0.5">
          {DENSITY_ICONS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => handleDensity(key)}
              title={label}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                density === key
                  ? 'bg-[hsl(var(--brand-primary)/0.2)] text-[hsl(var(--brand-primary))]'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Column visibility picker */}
        <div className="relative">
          <button
            onClick={() => setColumnPickerOpen(o => !o)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border-subtle))]',
              'bg-[hsl(var(--bg-surface))] px-3 py-1.5 text-small text-[hsl(var(--text-secondary))]',
              'hover:bg-[hsl(var(--bg-elevated)/0.5)] hover:text-[hsl(var(--text-primary))] transition-colors',
            )}
          >
            <Columns3 className="h-3.5 w-3.5" />
            Columns
          </button>
          <AnimatePresence>
            {columnPickerOpen && (
              <ColumnPicker table={table} onClose={() => setColumnPickerOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* CSV export */}
        {exportFilename && (
          <button
            onClick={() => exportToCsv(table, exportFilename)}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border-subtle))]
              bg-[hsl(var(--bg-surface))] px-3 py-1.5 text-small text-[hsl(var(--text-secondary))]
              hover:bg-[hsl(var(--bg-elevated)/0.5)] hover:text-[hsl(var(--text-primary))]
              transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}

        {/* Row count */}
        <span className="text-[11px] text-[hsl(var(--text-tertiary))] tabular-nums">
          {totalRows} row{totalRows !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className={cn('overflow-x-auto', stickyFirstColumn && 'relative')}>
        <table className="w-full border-collapse text-small">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-[hsl(var(--bg-elevated)/0.3)]">
                {headerGroup.headers.map((header, colIdx) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        DENSITY_CLASSES[density],
                        'text-left text-[11px] font-semibold uppercase tracking-wider',
                        'text-[hsl(var(--text-tertiary))] select-none whitespace-nowrap',
                        'border-b border-[hsl(var(--border-subtle)/0.3)]',
                        stickyFirstColumn && colIdx === 0 &&
                          'sticky left-0 z-10 bg-[hsl(var(--bg-elevated)/0.8)] backdrop-blur-sm',
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {canSort ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1 hover:text-[hsl(var(--text-secondary))] transition-colors"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {header.column.getCanFilter() && (
                          <ColumnFilterPopover column={header.column} table={table} />
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {emptyStateProps ? (
                      <EmptyState
                        icon={emptyStateProps.icon}
                        title={emptyStateProps.title}
                        description={emptyStateProps.description}
                        className="border-0 rounded-none"
                      />
                    ) : (
                      <EmptyState
                        icon={Search}
                        title="No results"
                        description="No rows match your search or filter criteria."
                        className="border-0 rounded-none"
                      />
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    custom={i}
                    variants={prefersReducedMotion ? undefined : rowVariants}
                    initial={prefersReducedMotion ? undefined : 'hidden'}
                    animate={prefersReducedMotion ? undefined : 'visible'}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      'border-b border-[hsl(var(--border-subtle)/0.3)]',
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-[hsl(var(--bg-elevated)/0.5)]',
                    )}
                  >
                    {row.getVisibleCells().map((cell, colIdx) => (
                      <td
                        key={cell.id}
                        className={cn(
                          DENSITY_CLASSES[density],
                          'text-[hsl(var(--text-primary))]',
                          stickyFirstColumn && colIdx === 0 &&
                            'sticky left-0 z-10 bg-[hsl(var(--bg-surface)/0.9)] backdrop-blur-sm',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalRows > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3
          border-t border-[hsl(var(--border-subtle)/0.3)]">
          <span className="text-[12px] text-[hsl(var(--text-tertiary))] tabular-nums">
            Showing {startRow}&ndash;{endRow} of {totalRows}
          </span>

          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={v => table.setPageSize(Number(v))}
              options={PAGE_SIZES.map(size => ({ value: String(size), label: `${size} / page` }))}
              className="w-[110px] text-[12px]"
            />

            <div className="flex items-center gap-1">
              <PaginationButton
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                First
              </PaginationButton>
              <PaginationButton
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </PaginationButton>

              {generatePageNumbers(pageIndex, pageCount).map((p, idx) =>
                p === -1 ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-[hsl(var(--text-tertiary))]">
                    ...
                  </span>
                ) : (
                  <PaginationButton
                    key={p}
                    onClick={() => table.setPageIndex(p)}
                    active={p === pageIndex}
                  >
                    {p + 1}
                  </PaginationButton>
                )
              )}

              <PaginationButton
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </PaginationButton>
              <PaginationButton
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                Last
              </PaginationButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagination button
// ---------------------------------------------------------------------------

function PaginationButton({ children, onClick, disabled, active }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-md px-2 py-1 text-[12px] font-medium transition-colors tabular-nums',
        active
          ? 'bg-[hsl(var(--brand-primary)/0.2)] text-[hsl(var(--brand-primary))]'
          : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated)/0.5)] hover:text-[hsl(var(--text-primary))]',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page number generation
// ---------------------------------------------------------------------------

function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: number[] = []
  const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p) }
  addPage(0)
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) addPage(i)
  addPage(total - 1)
  const result: number[] = []
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i]! - pages[i - 1]! > 1) result.push(-1)
    result.push(pages[i]!)
  }
  return result
}

// Re-export TruncatedText for convenience (used often with DataTable)
export { TruncatedText }
