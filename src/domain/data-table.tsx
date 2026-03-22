'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
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
  cell?: (value: unknown, row: T, rowIndex: number) => ReactNode
  sortable?: boolean
  resizable?: boolean
  width?: number | string
  minWidth?: number
  pinned?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  searchable?: boolean
  // Per-column filter
  filterable?: boolean
  filterType?: 'text' | 'number' | 'select' | 'date'
  filterOptions?: string[]
  // Cell editing
  editable?: boolean
  onCellEdit?: (rowIndex: number, value: unknown) => void
  // Auto-size
  autoSize?: boolean
}

export interface DataTableProps<T extends object>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  data: T[]
  columns: ColumnDef<T>[]

  // Feature flags
  searchable?: boolean
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  pageSizes?: number[]
  selectable?: boolean
  resizable?: boolean
  reorderable?: boolean
  exportable?: boolean
  virtualScroll?: boolean
  stickyHeader?: boolean

  // Sort (controlled)
  sortBy?: { column: string; direction: 'asc' | 'desc' }[]
  onSort?: (sort: { column: string; direction: 'asc' | 'desc' }[]) => void

  // Selection (controlled)
  selectedRows?: Set<number>
  onSelectionChange?: (selected: Set<number>) => void

  // Callbacks
  onExport?: (format: 'csv' | 'json', data: T[]) => void
  onPageChange?: (page: number) => void
  onSearchChange?: (query: string) => void

  // States
  loading?: boolean
  empty?: ReactNode
  error?: ReactNode
  onRetry?: () => void

  // Appearance
  striped?: boolean
  compact?: boolean
  bordered?: boolean
  responsiveMode?: 'scroll' | 'card'

  // Toolbar customization
  toolbar?: ReactNode

  // Motion
  motion?: 0 | 1 | 2 | 3

  // Virtual scroll
  rowHeight?: number

  // Per-column filters
  filterable?: boolean
  filters?: Record<string, { value: string; operator: string }>
  onFilterChange?: (filters: Record<string, { value: string; operator: string }>) => void

  // Row grouping
  groupBy?: string
  aggregations?: Record<string, 'sum' | 'avg' | 'count' | 'min' | 'max'>
  expandedGroups?: Set<string>
  onGroupToggle?: (groupKey: string) => void

  // Cell editing
  editable?: boolean
  onCellEdit?: (rowIndex: number, columnId: string, value: unknown) => void

  // Server-side
  serverSide?: boolean
  totalRows?: number
  onFetchData?: (params: {
    page: number
    pageSize: number
    sortBy: { column: string; direction: 'asc' | 'desc' }[]
    filters: Record<string, { value: string; operator: string }>
    search: string
  }) => void

  // Auto-size
  autoSizeColumns?: boolean
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

      /* ── Toolbar ─────────────────────────────────────── */
      .ui-data-table__toolbar {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        flex-wrap: wrap;
        padding: var(--space-sm, 0.5rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
      }

      /* ── Search ──────────────────────────────────────── */
      .ui-data-table__search-wrapper {
        position: relative;
        flex: 1 1 200px;
        min-inline-size: 0;
      }

      .ui-data-table__search {
        inline-size: 100%;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        padding-inline-end: 2.25rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(20% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      .ui-data-table__search:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
                    0 0 20px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-data-table__search::placeholder {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-data-table__search-clear {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-end: var(--space-xs, 0.25rem);
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 24px;
        block-size: 24px;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 1rem;
        cursor: pointer;
        transition: color 0.15s, background 0.15s;
      }

      .ui-data-table__search-clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-data-table__result-count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
        padding-inline: var(--space-xs, 0.25rem);
      }

      .ui-data-table__search-highlight {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
        border-radius: 2px;
        color: inherit;
      }

      /* ── Toolbar buttons (shared) ────────────────────── */
      .ui-data-table__toolbar-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s var(--ease-out, ease-out);
        white-space: nowrap;
      }

      .ui-data-table__toolbar-btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* ── Column selector dropdown ────────────────────── */
      .ui-data-table__col-toggle {
        position: relative;
      }

      .ui-data-table__col-dropdown {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-end: 0;
        margin-block-start: var(--space-xs, 0.25rem);
        min-inline-size: 180px;
        max-block-size: 300px;
        overflow-y: auto;
        padding: var(--space-xs, 0.25rem);
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        z-index: 20;
      }

      .ui-data-table__col-dropdown-actions {
        display: flex;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-xs, 0.25rem);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        margin-block-end: var(--space-xs, 0.25rem);
      }

      .ui-data-table__col-dropdown-actions button {
        flex: 1;
        padding-block: 2px;
        padding-inline: var(--space-xs, 0.25rem);
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
      }

      .ui-data-table__col-dropdown-actions button:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-data-table__col-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-radius: var(--radius-sm, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        user-select: none;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-data-table__col-item:hover {
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-data-table__col-checkbox {
        accent-color: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Export dropdown ─────────────────────────────── */
      .ui-data-table__export-wrapper {
        position: relative;
      }

      .ui-data-table__export-dropdown {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-end: 0;
        margin-block-start: var(--space-xs, 0.25rem);
        min-inline-size: 120px;
        padding: var(--space-xs, 0.25rem);
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        z-index: 20;
      }

      .ui-data-table__export-item {
        display: block;
        inline-size: 100%;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        cursor: pointer;
        text-align: start;
      }

      .ui-data-table__export-item:hover {
        background: oklch(100% 0 0 / 0.06);
      }

      /* ── Scroll wrapper ──────────────────────────────── */
      .ui-data-table__scroll {
        overflow-x: auto;
        overflow-y: visible;
        border-radius: var(--radius-lg, 0.75rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        background: var(--bg-elevated, oklch(20% 0.02 270));
      }

      :scope[data-bordered] .ui-data-table__scroll {
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.15));
      }

      /* Virtual scroll container */
      .ui-data-table__virtual-scroll {
        overflow-y: auto;
        position: relative;
        border-radius: var(--radius-lg, 0.75rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        background: var(--bg-elevated, oklch(20% 0.02 270));
      }

      .ui-data-table__virtual-spacer {
        position: relative;
      }

      /* ── Table ───────────────────────────────────────── */
      .ui-data-table__table {
        inline-size: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        font-size: var(--text-sm, 0.875rem);
        table-layout: fixed;
      }

      /* ── Header ──────────────────────────────────────── */
      .ui-data-table__thead {
        background: var(--bg-surface, oklch(22% 0.02 270));
      }

      :scope[data-sticky-header] .ui-data-table__thead {
        position: sticky;
        inset-block-start: 0;
        z-index: 3;
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

      /* ── Header cells ────────────────────────────────── */
      .ui-data-table__th {
        position: relative;
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
        overflow: hidden;
        text-overflow: ellipsis;
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

      .ui-data-table__th[data-reorderable] {
        cursor: grab;
      }

      .ui-data-table__th[data-reorderable]:active {
        cursor: grabbing;
      }

      .ui-data-table__th[data-dragging] {
        opacity: 0.5;
      }

      .ui-data-table__th[data-drag-over="left"]::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: -1px;
        inline-size: 3px;
        background: var(--brand, oklch(65% 0.2 270));
        z-index: 2;
      }

      .ui-data-table__th[data-drag-over="right"]::after {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-end: -1px;
        inline-size: 3px;
        background: var(--brand, oklch(65% 0.2 270));
        z-index: 2;
      }

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

      /* ── Sort indicator ──────────────────────────────── */
      .ui-data-table__sort-icon {
        display: inline-flex;
        margin-inline-start: var(--space-xs, 0.25rem);
        opacity: 0.3;
        vertical-align: middle;
        transition: opacity 0.15s, transform 0.2s var(--ease-out, ease-out),
                    color 0.15s;
      }

      .ui-data-table__th[aria-sort="ascending"] .ui-data-table__sort-icon,
      .ui-data-table__th[aria-sort="descending"] .ui-data-table__sort-icon {
        opacity: 1;
        color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-data-table__th[aria-sort="descending"] .ui-data-table__sort-icon {
        transform: rotate(180deg);
      }

      .ui-data-table__sort-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 14px;
        block-size: 14px;
        border-radius: 7px;
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--bg-base, oklch(15% 0 0));
        font-size: 0.5625rem;
        font-weight: 700;
        margin-inline-start: 2px;
      }

      /* ── Header content wrapper ──────────────────────── */
      .ui-data-table__header-content {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      /* ── Resize handle ───────────────────────────────── */
      .ui-data-table__resize-handle {
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        inline-size: 6px;
        cursor: col-resize;
        user-select: none;
        touch-action: none;
        background: transparent;
        transition: background 0.15s;
        z-index: 2;
      }

      .ui-data-table__resize-handle:hover,
      .ui-data-table__resize-handle[data-resizing] {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Data rows ───────────────────────────────────── */
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

      .ui-data-table__tr[data-selected]:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* ── Data cells ──────────────────────────────────── */
      .ui-data-table__td {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.05));
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :scope[data-compact] .ui-data-table__td {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
      }

      .ui-data-table__td[data-align="center"] { text-align: center; }
      .ui-data-table__td[data-align="right"] { text-align: end; }

      /* ── Checkbox cell ───────────────────────────────── */
      .ui-data-table__checkbox-cell {
        inline-size: 44px;
        min-inline-size: 44px;
        max-inline-size: 44px;
        text-align: center;
      }

      .ui-data-table__checkbox {
        cursor: pointer;
        accent-color: var(--brand, oklch(65% 0.2 270));
        inline-size: 16px;
        block-size: 16px;
      }

      /* ── Empty state ─────────────────────────────────── */
      .ui-data-table__empty {
        padding: var(--space-2xl, 3rem);
        text-align: center;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* ── Error state ─────────────────────────────────── */
      .ui-data-table__error {
        padding: var(--space-xl, 1.5rem);
        text-align: center;
        color: var(--status-critical, oklch(65% 0.25 25));
        font-size: var(--text-sm, 0.875rem);
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.05);
        border-radius: var(--radius-md, 0.5rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-data-table__retry-btn {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        border: 1px solid var(--status-critical, oklch(65% 0.25 25));
        border-radius: var(--radius-md, 0.5rem);
        background: transparent;
        color: var(--status-critical, oklch(65% 0.25 25));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s;
      }

      .ui-data-table__retry-btn:hover {
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.1);
      }

      /* ── Skeleton rows ───────────────────────────────── */
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

      /* ── Pagination ──────────────────────────────────── */
      .ui-data-table__pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        flex-wrap: wrap;
      }

      .ui-data-table__page-info {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
      }

      .ui-data-table__page-controls {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
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

      .ui-data-table__page-btn[data-active] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--bg-base, oklch(15% 0 0));
        border-color: var(--brand, oklch(65% 0.2 270));
        font-weight: 600;
      }

      .ui-data-table__page-size-select {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-elevated, oklch(20% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
      }

      /* ── Card mode (responsive) ──────────────────────── */
      @container data-table (max-width: 600px) {
        :scope[data-responsive="card"] .ui-data-table__scroll {
          overflow-x: visible;
          border: none;
          background: none;
        }

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
          padding: var(--space-md, 0.75rem);
          background: var(--bg-surface, oklch(22% 0.02 270));
        }

        :scope[data-responsive="card"] .ui-data-table__td {
          display: flex;
          justify-content: space-between;
          border: none;
          padding-block: var(--space-xs, 0.25rem);
          padding-inline: 0;
        }

        :scope[data-responsive="card"] .ui-data-table__td::before {
          content: attr(data-label);
          font-weight: 600;
          color: var(--text-secondary, oklch(70% 0 0));
          margin-inline-end: var(--space-md, 0.75rem);
          flex-shrink: 0;
        }

        :scope[data-responsive="card"] .ui-data-table__checkbox-cell {
          display: none;
        }
      }

      /* ── Filter popover ──────────────────────────────── */
      .ui-data-table__filter-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 24px;
        block-size: 24px;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-tertiary, oklch(55% 0 0));
        cursor: pointer;
        padding: 0;
        margin-inline-start: 2px;
        transition: color 0.15s, background 0.15s;
        -webkit-tap-highlight-color: transparent;
        position: relative;
      }

      /* Expanded touch target on mobile */
      @media (pointer: coarse) {
        .ui-data-table__filter-btn::before {
          content: '';
          position: absolute;
          inset: -8px;
        }
      }

      .ui-data-table__filter-btn:hover,
      .ui-data-table__filter-btn[data-active] {
        color: var(--brand, oklch(65% 0.2 270));
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      .ui-data-table__filter-popover {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-start: 0;
        margin-block-start: var(--space-xs, 0.25rem);
        min-inline-size: 220px;
        max-inline-size: 300px;
        padding: var(--space-sm, 0.5rem);
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      /* When filter popover is open, prevent table from clipping it */
      :scope[data-filter-open] .ui-data-table__table-wrapper {
        overflow: visible;
      }

      /* Mobile: filter popover becomes a bottom sheet */
      @media (max-width: 640px) {
        .ui-data-table__filter-popover {
          position: fixed;
          inset-block-end: 0;
          inset-block-start: auto;
          inset-inline: 0;
          margin: 0;
          min-inline-size: auto;
          max-inline-size: 100%;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: 1rem;
          z-index: 200;
          box-shadow: 0 -4px 24px oklch(0% 0 0 / 0.3);
        }
      }

      .ui-data-table__filter-popover select,
      .ui-data-table__filter-popover input {
        inline-size: 100%;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(20% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
      }

      .ui-data-table__filter-actions {
        display: flex;
        gap: var(--space-xs, 0.25rem);
        justify-content: flex-end;
      }

      .ui-data-table__filter-actions button {
        padding-block: 2px;
        padding-inline: var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
      }

      .ui-data-table__filter-actions button:hover {
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-data-table__filter-select-list {
        max-block-size: 150px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ui-data-table__filter-select-item {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding: 2px var(--space-xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
        cursor: pointer;
        border-radius: 2px;
      }

      .ui-data-table__filter-select-item:hover {
        background: oklch(100% 0 0 / 0.06);
      }

      /* ── Cell editing ──────────────────────────────────── */
      .ui-data-table__td[data-editing] {
        padding: 0;
      }

      .ui-data-table__edit-input {
        inline-size: 100%;
        block-size: 100%;
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border: 2px solid var(--brand, oklch(65% 0.2 270));
        border-radius: 0;
        background: var(--bg-elevated, oklch(20% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: inherit;
        font-family: inherit;
        outline: none;
      }

      @keyframes ui-data-table-cell-flash {
        0% { background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2); }
        100% { background: transparent; }
      }

      .ui-data-table__td[data-just-edited] {
        animation: ui-data-table-cell-flash 0.6s var(--ease-out, ease-out);
      }

      /* ── Group rows ────────────────────────────────────── */
      .ui-data-table__group-row {
        background: var(--bg-surface, oklch(22% 0.02 270));
        font-weight: 600;
        cursor: pointer;
      }

      .ui-data-table__group-row:hover {
        background: oklch(100% 0 0 / 0.05);
      }

      .ui-data-table__group-cell {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-data-table__group-chevron {
        display: inline-flex;
        transition: transform 0.15s var(--ease-out, ease-out);
      }

      .ui-data-table__group-chevron[data-expanded] {
        transform: rotate(90deg);
      }

      .ui-data-table__group-count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 400;
      }

      .ui-data-table__group-agg {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 400;
        margin-inline-start: var(--space-sm, 0.5rem);
      }

      /* ── Improved pinned columns ───────────────────────── */
      .ui-data-table__th[data-pinned="left"],
      .ui-data-table__td[data-pinned="left"] {
        background: var(--bg-elevated, oklch(20% 0.02 270));
      }

      .ui-data-table__th[data-pinned="right"],
      .ui-data-table__td[data-pinned="right"] {
        background: var(--bg-elevated, oklch(20% 0.02 270));
      }

      .ui-data-table__th[data-pinned-shadow="left"],
      .ui-data-table__td[data-pinned-shadow="left"] {
        box-shadow: 4px 0 8px oklch(0% 0 0 / 0.15);
      }

      .ui-data-table__th[data-pinned-shadow="right"],
      .ui-data-table__td[data-pinned-shadow="right"] {
        box-shadow: -4px 0 8px oklch(0% 0 0 / 0.15);
      }

      /* ── Forced colors ───────────────────────────────── */
      @media (forced-colors: active) {
        .ui-data-table__scroll,
        .ui-data-table__virtual-scroll {
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
        .ui-data-table__search {
          border: 2px solid ButtonText;
        }
        .ui-data-table__toolbar {
          border: 2px solid ButtonText;
        }
      }

      /* ── Print ───────────────────────────────────────── */
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

function renderHeader(header: ReactNode | (() => ReactNode)): ReactNode {
  return typeof header === 'function' ? header() : header
}

function getHeaderText(header: ReactNode | (() => ReactNode), id: string): string {
  if (typeof header === 'string') return header
  if (typeof header === 'function') return id
  return id
}

/** Highlight search text in a string value */
function highlightText(text: string, query: string): ReactNode {
  if (!query) return text
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="ui-data-table__search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

/** Export data as CSV string */
function toCSV<T extends object>(
  data: T[],
  columns: ColumnDef<T>[]
): string {
  const headers = columns.map(col => getHeaderText(col.header, col.id))
  const escape = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`
    }
    return v
  }
  const rows = data.map(row =>
    columns.map(col => escape(String(getCellValue(row, col.accessor) ?? ''))).join(',')
  )
  return [headers.map(escape).join(','), ...rows].join('\n')
}

/** Export data as JSON string */
function toJSON<T extends object>(
  data: T[],
  columns: ColumnDef<T>[]
): string {
  const mapped = data.map(row => {
    const obj: Record<string, unknown> = {}
    for (const col of columns) {
      obj[col.id] = getCellValue(row, col.accessor)
    }
    return obj
  })
  return JSON.stringify(mapped, null, 2)
}

/** Download a string as a file */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Debounce hook */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/** Compare for sorting */
function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  if (a == null && b == null) return 0
  if (a == null) return direction === 'asc' ? -1 : 1
  if (b == null) return direction === 'asc' ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a
  }
  const aStr = String(a)
  const bStr = String(b)
  const cmp = aStr.localeCompare(bStr)
  return direction === 'asc' ? cmp : -cmp
}

// ─── Virtual Scroll Hook ──────────────────────────────────────────────

const DEFAULT_ROW_HEIGHT = 40
const BUFFER_ROWS = 10

function useVirtualScroll(
  enabled: boolean,
  totalCount: number,
  containerRef: React.RefObject<HTMLDivElement | null>,
  rowHeight: number = DEFAULT_ROW_HEIGHT
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setScrollTop(container.scrollTop)
      })
    }
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    container.addEventListener('scroll', onScroll, { passive: true })
    observer.observe(container)

    return () => {
      container.removeEventListener('scroll', onScroll)
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, containerRef])

  if (!enabled) {
    return {
      virtualRows: null,
      totalHeight: 0,
      offsetY: 0,
      startIndex: 0,
      endIndex: totalCount,
    }
  }

  const totalHeight = totalCount * rowHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS)
  const visibleCount = Math.ceil(containerHeight / rowHeight) + BUFFER_ROWS * 2
  const endIndex = Math.min(totalCount, startIndex + visibleCount)
  const offsetY = startIndex * rowHeight

  return { virtualRows: true, totalHeight, offsetY, startIndex, endIndex }
}

// ─── Filter Helpers ──────────────────────────────────────────────────

type FilterOperator = 'contains' | 'equals' | 'gt' | 'lt' | 'startsWith' | 'endsWith' | 'notContains' | 'isEmpty' | 'isNotEmpty' | 'gte' | 'lte' | 'between' | 'before' | 'after' | 'isOneOf' | 'isNotOneOf'

function applyFilter(value: unknown, filter: { value: string; operator: string }): boolean {
  const strVal = String(value ?? '').toLowerCase()
  const filterVal = filter.value.toLowerCase()
  const op = filter.operator as FilterOperator

  switch (op) {
    case 'contains': return strVal.includes(filterVal)
    case 'equals': return strVal === filterVal
    case 'startsWith': return strVal.startsWith(filterVal)
    case 'endsWith': return strVal.endsWith(filterVal)
    case 'notContains': return !strVal.includes(filterVal)
    case 'isEmpty': return strVal === ''
    case 'isNotEmpty': return strVal !== ''
    case 'gt': {
      const n = Number(value); const f = Number(filter.value)
      return !isNaN(n) && !isNaN(f) && n > f
    }
    case 'lt': {
      const n = Number(value); const f = Number(filter.value)
      return !isNaN(n) && !isNaN(f) && n < f
    }
    case 'gte': {
      const n = Number(value); const f = Number(filter.value)
      return !isNaN(n) && !isNaN(f) && n >= f
    }
    case 'lte': {
      const n = Number(value); const f = Number(filter.value)
      return !isNaN(n) && !isNaN(f) && n <= f
    }
    case 'between': {
      const [lo, hi] = filter.value.split(',').map(Number)
      const n = Number(value)
      return !isNaN(n) && !isNaN(lo) && !isNaN(hi) && n >= lo && n <= hi
    }
    case 'before': {
      const d = new Date(String(value)); const f = new Date(filter.value)
      return !isNaN(d.getTime()) && !isNaN(f.getTime()) && d < f
    }
    case 'after': {
      const d = new Date(String(value)); const f = new Date(filter.value)
      return !isNaN(d.getTime()) && !isNaN(f.getTime()) && d > f
    }
    case 'isOneOf': {
      const vals = filter.value.split(',').map(v => v.trim().toLowerCase())
      return vals.includes(strVal)
    }
    case 'isNotOneOf': {
      const vals = filter.value.split(',').map(v => v.trim().toLowerCase())
      return !vals.includes(strVal)
    }
    default: return strVal.includes(filterVal)
  }
}

function getOperatorsForType(type?: 'text' | 'number' | 'select' | 'date'): { value: string; label: string }[] {
  switch (type) {
    case 'number':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'gt', label: 'Greater than' },
        { value: 'lt', label: 'Less than' },
        { value: 'gte', label: 'Greater or equal' },
        { value: 'lte', label: 'Less or equal' },
        { value: 'between', label: 'Between' },
      ]
    case 'date':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'before', label: 'Before' },
        { value: 'after', label: 'After' },
        { value: 'between', label: 'Between' },
      ]
    case 'select':
      return [
        { value: 'isOneOf', label: 'Is one of' },
        { value: 'isNotOneOf', label: 'Is not one of' },
      ]
    default: // text
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equals' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'notContains', label: 'Not contains' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
      ]
  }
}

// ─── Aggregation Helper ──────────────────────────────────────────────

function computeAggregation(values: unknown[], aggType: 'sum' | 'avg' | 'count' | 'min' | 'max'): string {
  const nums = values.map(Number).filter(n => !isNaN(n))
  switch (aggType) {
    case 'count': return String(values.length)
    case 'sum': return String(nums.reduce((a, b) => a + b, 0))
    case 'avg': return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '0'
    case 'min': return nums.length ? String(Math.min(...nums)) : ''
    case 'max': return nums.length ? String(Math.max(...nums)) : ''
  }
}

// ─── Component ────────────────────────────────────────────────────────

function DataTableInner<T extends object>(
  {
    data,
    columns: columnsProp,
    // Feature flags
    searchable = false,
    sortable = true,
    paginated = false,
    pageSize: pageSizeProp = 10,
    pageSizes = [10, 25, 50, 100],
    selectable = false,
    resizable = false,
    reorderable = false,
    exportable = false,
    virtualScroll = false,
    stickyHeader = true,
    // Sort
    sortBy: sortByControlled,
    onSort: onSortControlled,
    // Selection
    selectedRows: selectedRowsControlled,
    onSelectionChange: onSelectionChangeControlled,
    // Callbacks
    onExport,
    onPageChange,
    onSearchChange,
    // States
    loading = false,
    empty,
    error,
    onRetry,
    // Appearance
    striped = false,
    compact = false,
    bordered = false,
    responsiveMode = 'scroll',
    toolbar,
    motion: motionProp,
    // Virtual scroll
    rowHeight: rowHeightProp,
    // Per-column filters
    filterable = false,
    filters: filtersControlled,
    onFilterChange: onFilterChangeControlled,
    // Row grouping
    groupBy,
    aggregations,
    expandedGroups: expandedGroupsControlled,
    onGroupToggle: onGroupToggleControlled,
    // Cell editing
    editable = false,
    onCellEdit,
    // Server-side
    serverSide = false,
    totalRows: totalRowsProp,
    onFetchData,
    // Auto-size
    autoSizeColumns = false,
    className,
    ...rest
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const cls = useStyles('data-table', dataTableStyles)
  const motionLevel = useMotionLevel(motionProp)

  // ─── Search state ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
      onSearchChange?.(e.target.value)
    },
    [onSearchChange]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    onSearchChange?.('')
  }, [onSearchChange])

  // ─── Column visibility ─────────────────────────────────────────────
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    const hidden = new Set<string>()
    for (const col of columnsProp) {
      if (col.hidden) hidden.add(col.id)
    }
    return hidden
  })
  const [showColDropdown, setShowColDropdown] = useState(false)
  const colDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showColDropdown) return
    const handler = (e: MouseEvent) => {
      if (colDropdownRef.current && !colDropdownRef.current.contains(e.target as Node)) {
        setShowColDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColDropdown])

  const toggleColumn = useCallback((colId: string) => {
    setHiddenColumns(prev => {
      const next = new Set(prev)
      if (next.has(colId)) next.delete(colId)
      else next.add(colId)
      return next
    })
  }, [])

  const showAllColumns = useCallback(() => setHiddenColumns(new Set()), [])
  const hideAllColumns = useCallback(
    () => setHiddenColumns(new Set(columnsProp.map(c => c.id))),
    [columnsProp]
  )

  // ─── Column order (reorder) ─────────────────────────────────────────
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columnsProp.map(c => c.id)
  )

  // Sync column order when columns prop changes
  useEffect(() => {
    setColumnOrder(prev => {
      const propIds = new Set(columnsProp.map(c => c.id))
      // Keep existing order for known columns, append new ones
      const kept = prev.filter(id => propIds.has(id))
      const newIds = columnsProp.filter(c => !kept.includes(c.id)).map(c => c.id)
      return [...kept, ...newIds]
    })
  }, [columnsProp])

  const [dragColId, setDragColId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)
  const [dragOverSide, setDragOverSide] = useState<'left' | 'right' | null>(null)

  const handleDragStart = useCallback(
    (colId: string, e: React.DragEvent) => {
      if (!reorderable) return
      setDragColId(colId)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', colId)
    },
    [reorderable]
  )

  const handleDragOver = useCallback(
    (colId: string, e: React.DragEvent) => {
      if (!reorderable || !dragColId || dragColId === colId) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const midX = rect.left + rect.width / 2
      setDragOverColId(colId)
      setDragOverSide(e.clientX < midX ? 'left' : 'right')
    },
    [reorderable, dragColId]
  )

  const handleDrop = useCallback(
    (targetColId: string, e: React.DragEvent) => {
      e.preventDefault()
      if (!dragColId || dragColId === targetColId) return

      setColumnOrder(prev => {
        const next = prev.filter(id => id !== dragColId)
        let targetIdx = next.indexOf(targetColId)
        if (dragOverSide === 'right') targetIdx++
        next.splice(targetIdx, 0, dragColId)
        return next
      })

      setDragColId(null)
      setDragOverColId(null)
      setDragOverSide(null)
    },
    [dragColId, dragOverSide]
  )

  const handleDragEnd = useCallback(() => {
    setDragColId(null)
    setDragOverColId(null)
    setDragOverSide(null)
  }, [])

  // ─── Visible, ordered columns ──────────────────────────────────────
  const visibleColumns = useMemo(() => {
    const colMap = new Map(columnsProp.map(c => [c.id, c]))
    return columnOrder
      .filter(id => !hiddenColumns.has(id) && colMap.has(id))
      .map(id => colMap.get(id)!)
  }, [columnsProp, columnOrder, hiddenColumns])

  // ─── Sort state (internal or controlled) ───────────────────────────
  const [sortByInternal, setSortByInternal] = useState<
    { column: string; direction: 'asc' | 'desc' }[]
  >([])

  const sortBy = sortByControlled ?? sortByInternal
  const setSortBy = onSortControlled ?? setSortByInternal

  const handleSort = useCallback(
    (colId: string, shiftKey: boolean) => {
      const col = columnsProp.find(c => c.id === colId)
      if (!col) return
      // Column-level sortable defaults to table-level sortable
      const isColSortable = col.sortable ?? sortable
      if (!isColSortable) return

      const prev = sortBy
      const existing = prev.find(s => s.column === colId)
      let next: { column: string; direction: 'asc' | 'desc' }[]

      if (shiftKey) {
        // Multi-sort
        if (existing) {
          if (existing.direction === 'asc') {
            next = prev.map(s =>
              s.column === colId ? { ...s, direction: 'desc' as const } : s
            )
          } else {
            // Remove from sort (was desc, cycle to none)
            next = prev.filter(s => s.column !== colId)
          }
        } else {
          next = [...prev, { column: colId, direction: 'asc' as const }]
        }
      } else {
        // Single sort
        if (existing) {
          if (existing.direction === 'asc') {
            next = [{ column: colId, direction: 'desc' as const }]
          } else {
            // was desc -> remove (none)
            next = []
          }
        } else {
          next = [{ column: colId, direction: 'asc' as const }]
        }
      }

      setSortBy(next)
    },
    [columnsProp, sortable, setSortBy, sortBy]
  )

  // ─── Selection state (internal or controlled) ─────────────────────
  const [selectedRowsInternal, setSelectedRowsInternal] = useState<Set<number>>(
    new Set()
  )

  const selectedRows = selectedRowsControlled ?? selectedRowsInternal
  const setSelectedRows = onSelectionChangeControlled ?? setSelectedRowsInternal

  // ─── Per-column filter state ─────────────────────────────────────
  const [filtersInternal, setFiltersInternal] = useState<Record<string, { value: string; operator: string }>>({})
  const activeFilters = filtersControlled ?? filtersInternal
  const setActiveFilters = onFilterChangeControlled ?? setFiltersInternal
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null)
  const filterPopoverRef = useRef<HTMLDivElement | null>(null)

  // Close filter popover on click outside — works on both desktop and mobile
  useEffect(() => {
    if (!openFilterCol) return

    const handler = (e: Event) => {
      const target = e.target as Node
      // Don't close if clicking inside the popover
      if (filterPopoverRef.current && filterPopoverRef.current.contains(target)) return
      // Don't close if clicking the filter button itself (it handles toggle)
      if ((target as HTMLElement).closest?.('.ui-data-table__filter-btn')) return
      setOpenFilterCol(null)
    }

    // Delay listener attachment so the opening touch/click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handler, true)
    }, 50)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handler, true)
    }
  }, [openFilterCol])

  // ─── Cell editing state ────────────────────────────────────────────
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [justEditedCell, setJustEditedCell] = useState<{ row: number; col: string } | null>(null)

  const startEditing = useCallback((rowIndex: number, colId: string, currentValue: unknown) => {
    if (!editable) return
    const col = columnsProp.find(c => c.id === colId)
    if (col && col.editable === false) return
    setEditingCell({ row: rowIndex, col: colId })
    setEditValue(String(currentValue ?? ''))
  }, [editable, columnsProp])

  const commitEdit = useCallback(() => {
    if (!editingCell) return
    onCellEdit?.(editingCell.row, editingCell.col, editValue)
    const col = columnsProp.find(c => c.id === editingCell.col)
    col?.onCellEdit?.(editingCell.row, editValue)
    setJustEditedCell({ ...editingCell })
    setEditingCell(null)
    setTimeout(() => setJustEditedCell(null), 600)
  }, [editingCell, editValue, onCellEdit, columnsProp])

  const cancelEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  // ─── Row grouping state ──────────────────────────────────────────
  const [expandedGroupsInternal, setExpandedGroupsInternal] = useState<Set<string>>(new Set())
  const expandedGroups = expandedGroupsControlled ?? expandedGroupsInternal
  const toggleGroup = useCallback((groupKey: string) => {
    if (onGroupToggleControlled) {
      onGroupToggleControlled(groupKey)
    } else {
      setExpandedGroupsInternal(prev => {
        const next = new Set(prev)
        if (next.has(groupKey)) next.delete(groupKey)
        else next.add(groupKey)
        return next
      })
    }
  }, [onGroupToggleControlled])

  // ─── Auto-size columns ──────────────────────────────────────────
  const autoSizeRef = useRef(false)
  useEffect(() => {
    if (!autoSizeColumns || autoSizeRef.current) return
    autoSizeRef.current = true
    // Measure widths using an off-screen element
    const measure = document.createElement('span')
    measure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;'
    document.body.appendChild(measure)
    const widths: Record<string, number> = {}
    for (const col of columnsProp) {
      if (col.autoSize === false) continue
      // Measure header
      const headerText = getHeaderText(col.header, col.id)
      measure.textContent = headerText
      let maxW = measure.offsetWidth
      // Measure data cells (sample first 100 rows)
      const sample = data.slice(0, 100)
      for (const row of sample) {
        const val = String(getCellValue(row, col.accessor) ?? '')
        measure.textContent = val
        maxW = Math.max(maxW, measure.offsetWidth)
      }
      widths[col.id] = maxW + 32 // padding
    }
    document.body.removeChild(measure)
    setColumnWidths(prev => ({ ...prev, ...widths }))
  }, [autoSizeColumns, columnsProp, data])

  // ─── Data pipeline: filter → column-filter → sort → group → paginate → virtualSlice

  // ─── Filter data by search ────────────────────────────────────────
  const searchFilteredData = useMemo(() => {
    if (serverSide) return data
    if (!searchable || !debouncedSearch) return data
    const q = debouncedSearch.toLowerCase()
    return data.filter(row =>
      columnsProp.some(col => {
        if (col.searchable === false) return false
        const val = getCellValue(row, col.accessor)
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, searchable, debouncedSearch, columnsProp, serverSide])

  // ─── Apply per-column filters ──────────────────────────────────────
  const filteredData = useMemo(() => {
    if (serverSide) return searchFilteredData
    const filterKeys = Object.keys(activeFilters)
    if (filterKeys.length === 0) return searchFilteredData
    return searchFilteredData.filter(row => {
      return filterKeys.every(colId => {
        const col = columnsProp.find(c => c.id === colId)
        if (!col) return true
        const filter = activeFilters[colId]
        if (!filter || (!filter.value && filter.operator !== 'isEmpty' && filter.operator !== 'isNotEmpty')) return true
        const value = getCellValue(row, col.accessor)
        return applyFilter(value, filter)
      })
    })
  }, [searchFilteredData, activeFilters, columnsProp, serverSide])

  // ─── Sort data ────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (serverSide) return filteredData
    if (sortBy.length === 0) return filteredData
    return [...filteredData].sort((a, b) => {
      for (const { column, direction } of sortBy) {
        const col = columnsProp.find(c => c.id === column)
        if (!col) continue
        const aVal = getCellValue(a, col.accessor)
        const bVal = getCellValue(b, col.accessor)
        const cmp = compareValues(aVal, bVal, direction)
        if (cmp !== 0) return cmp
      }
      return 0
    })
  }, [filteredData, sortBy, columnsProp, serverSide])

  // ─── Group data ────────────────────────────────────────────────────
  const groupedData = useMemo(() => {
    if (!groupBy || serverSide) return null
    const groupCol = columnsProp.find(c => c.id === groupBy)
    if (!groupCol) return null
    const groups = new Map<string, { rows: T[]; key: string }>()
    for (const row of sortedData) {
      const val = String(getCellValue(row, groupCol.accessor) ?? '')
      if (!groups.has(val)) groups.set(val, { rows: [], key: val })
      groups.get(val)!.rows.push(row)
    }
    return groups
  }, [groupBy, sortedData, columnsProp, serverSide])

  // ─── Pagination state ─────────────────────────────────────────────
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(pageSizeProp)
  const [showAllPages, setShowAllPages] = useState(false)

  // Reset page on data/search changes
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, data.length])

  // Sync pageSize prop
  useEffect(() => {
    setPageSize(pageSizeProp)
  }, [pageSizeProp])

  const dataCount = serverSide ? (totalRowsProp ?? data.length) : sortedData.length
  const effectivePageSize = showAllPages ? dataCount : pageSize
  const totalPages = paginated
    ? Math.max(1, Math.ceil(dataCount / effectivePageSize))
    : 1

  const paginatedData = paginated && !showAllPages && !serverSide
    ? sortedData.slice(page * pageSize, (page + 1) * pageSize)
    : sortedData

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      onPageChange?.(newPage)
    },
    [onPageChange]
  )

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value
      if (val === 'all') {
        setShowAllPages(true)
        setPage(0)
      } else {
        setShowAllPages(false)
        setPageSize(Number(val))
        setPage(0)
      }
    },
    []
  )

  // ─── Column widths for resize ──────────────────────────────────────
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    for (const col of columnsProp) {
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
      e.stopPropagation()
      const th = (e.target as HTMLElement).parentElement!
      const startWidth = columnWidths[colId] ?? th.getBoundingClientRect().width
      resizeRef.current = { colId, startX: e.clientX, startWidth }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      ;(e.target as HTMLElement).setAttribute('data-resizing', '')
    },
    [columnWidths]
  )

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current) return
      const { colId, startX, startWidth } = resizeRef.current
      const col = columnsProp.find(c => c.id === colId)
      const minW = col?.minWidth ?? 80
      const newWidth = Math.max(minW, startWidth + (e.clientX - startX))
      setColumnWidths(prev => ({ ...prev, [colId]: newWidth }))
    },
    [columnsProp]
  )

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    resizeRef.current = null
    ;(e.target as HTMLElement).removeAttribute('data-resizing')
  }, [])

  const handleResizeDoubleClick = useCallback(
    (colId: string) => {
      // Auto-fit: remove explicit width so table layout auto-sizes
      setColumnWidths(prev => {
        const next = { ...prev }
        delete next[colId]
        return next
      })
    },
    []
  )

  // ─── Selection handlers ──────────────────────────────────────────
  const handleRowSelect = useCallback(
    (globalIdx: number) => {
      const next = new Set(selectedRows)
      if (next.has(globalIdx)) {
        next.delete(globalIdx)
      } else {
        next.add(globalIdx)
      }
      setSelectedRows(next)
    },
    [selectedRows, setSelectedRows]
  )

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set())
    } else {
      // Select all currently visible rows (using their global index in sortedData)
      const base = paginated && !showAllPages ? page * pageSize : 0
      setSelectedRows(new Set(paginatedData.map((_, i) => base + i)))
    }
  }, [selectedRows, paginatedData, setSelectedRows, paginated, showAllPages, page, pageSize])

  const allSelected = selectedRows.size === paginatedData.length && paginatedData.length > 0
  const someSelected = selectedRows.size > 0 && !allSelected

  const selectAllRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  // ─── Export handlers ────────────────────────────────────────────────
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showExportDropdown) return
    const handler = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExportDropdown])

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      setShowExportDropdown(false)
      const exportData = sortedData
      if (onExport) {
        onExport(format, exportData)
        return
      }
      // Default: download file
      if (format === 'csv') {
        downloadFile(toCSV(exportData, visibleColumns), 'export.csv', 'text/csv')
      } else {
        downloadFile(toJSON(exportData, visibleColumns), 'export.json', 'application/json')
      }
    },
    [sortedData, visibleColumns, onExport]
  )

  // ─── Server-side fetch trigger ───────────────────────────────────
  useEffect(() => {
    if (!serverSide || !onFetchData) return
    onFetchData({
      page,
      pageSize,
      sortBy,
      filters: activeFilters,
      search: debouncedSearch,
    })
  }, [serverSide, onFetchData, page, pageSize, sortBy, activeFilters, debouncedSearch])

  // ─── Virtual scroll ────────────────────────────────────────────────
  const virtualContainerRef = useRef<HTMLDivElement | null>(null)
  const rowHeight = rowHeightProp ?? DEFAULT_ROW_HEIGHT
  const { totalHeight, offsetY, startIndex, endIndex } = useVirtualScroll(
    virtualScroll && !paginated,
    paginatedData.length,
    virtualContainerRef,
    rowHeight
  )

  const displayData = virtualScroll && !paginated
    ? paginatedData.slice(startIndex, endIndex)
    : paginatedData

  // ─── Keyboard navigation ─────────────────────────────────────────
  const gridRef = useRef<HTMLTableElement | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const grid = gridRef.current
      if (!grid) return

      const active = document.activeElement as HTMLElement
      if (!active) return

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
        case 'ArrowRight': {
          const cells = allRows[rowIdx].querySelectorAll(
            '[role="columnheader"], [role="gridcell"]'
          )
          nextCol = Math.min(colIdx + 1, cells.length - 1)
          e.preventDefault()
          break
        }
        case 'ArrowLeft':
          nextCol = Math.max(colIdx - 1, 0)
          e.preventDefault()
          break
        case 'Enter': {
          if (rowIdx === 0) {
            const adjustedIdx = selectable ? colIdx - 1 : colIdx
            const col = visibleColumns[adjustedIdx]
            if (col) {
              const isColSortable = col.sortable ?? sortable
              if (isColSortable) {
                handleSort(col.id, e.shiftKey)
              }
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
    [handleSort, visibleColumns, selectable, sortable]
  )

  // ─── Compute aria-sort ───────────────────────────────────────────
  function getAriaSort(col: ColumnDef<T>): string | undefined {
    const isColSortable = col.sortable ?? sortable
    if (!isColSortable) return undefined
    const sortEntry = sortBy.find(s => s.column === col.id)
    if (!sortEntry) return 'none'
    return sortEntry.direction === 'asc' ? 'ascending' : 'descending'
  }

  function getSortIndex(col: ColumnDef<T>): number {
    return sortBy.findIndex(s => s.column === col.id)
  }

  // ─── Pinned column offsets ────────────────────────────────────────
  const pinnedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {}
    // Left pinned
    let leftOffset = 0
    for (const col of visibleColumns) {
      if (col.pinned === 'left') {
        offsets[col.id] = leftOffset
        const w = columnWidths[col.id] ?? (typeof col.width === 'number' ? col.width : 150)
        leftOffset += w
      }
    }
    // Right pinned (from right edge)
    let rightOffset = 0
    const rightCols = [...visibleColumns].reverse()
    for (const col of rightCols) {
      if (col.pinned === 'right') {
        offsets[col.id] = rightOffset
        const w = columnWidths[col.id] ?? (typeof col.width === 'number' ? col.width : 150)
        rightOffset += w
      }
    }
    return offsets
  }, [visibleColumns, columnWidths])

  // Is the last left-pinned or first right-pinned? (for shadow)
  const lastLeftPinned = useMemo(() => {
    let last = ''
    for (const col of visibleColumns) {
      if (col.pinned === 'left') last = col.id
    }
    return last
  }, [visibleColumns])

  const firstRightPinned = useMemo(() => {
    for (const col of visibleColumns) {
      if (col.pinned === 'right') return col.id
    }
    return ''
  }, [visibleColumns])

  // ─── Column style ──────────────────────────────────────────────────
  function getColStyle(col: ColumnDef<T>): CSSProperties | undefined {
    const w = columnWidths[col.id] ?? col.width
    const style: CSSProperties = {}
    if (w) style.inlineSize = typeof w === 'number' ? `${w}px` : w
    if (col.pinned === 'left' && pinnedOffsets[col.id] !== undefined) {
      style.left = `${pinnedOffsets[col.id]}px`
    }
    if (col.pinned === 'right' && pinnedOffsets[col.id] !== undefined) {
      style.right = `${pinnedOffsets[col.id]}px`
    }
    return Object.keys(style).length ? style : undefined
  }

  // ─── Should we show the toolbar? ──────────────────────────────────
  const showToolbar = searchable || exportable || toolbar || true // Always show for column selector

  // ─── Pagination range ──────────────────────────────────────────────
  const paginationRange = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages: (number | 'ellipsis')[] = [0]
    if (page > 2) pages.push('ellipsis')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 3) pages.push('ellipsis')
    pages.push(totalPages - 1)
    return pages
  }, [page, totalPages])

  // ─── Render cell with optional search highlight ───────────────────
  const renderCellContent = useCallback(
    (col: ColumnDef<T>, value: unknown, row: T, rowIndex: number): ReactNode => {
      if (col.cell) return col.cell(value, row, rowIndex)
      const text = String(value ?? '')
      if (searchable && debouncedSearch && col.searchable !== false) {
        return highlightText(text, debouncedSearch)
      }
      return text
    },
    [searchable, debouncedSearch]
  )

  // ─── Page info text ───────────────────────────────────────────────
  const pageInfoText = useMemo(() => {
    if (!paginated) return null
    const total = dataCount
    if (total === 0) return 'No results'
    if (showAllPages) return `Showing all ${total} results`
    const start = page * pageSize + 1
    const end = Math.min((page + 1) * pageSize, total)
    return `Showing ${start}\u2013${end} of ${total} results`
  }, [paginated, dataCount, page, pageSize, showAllPages])

  // ─── Render helpers ──────────────────────────────────────────────────

  function renderDataRow(row: T, globalIdx: number, isSelected: boolean, _idx: number) {
    return (
      <tr
        key={globalIdx}
        className="ui-data-table__tr"
        role="row"
        aria-selected={selectable ? isSelected : undefined}
        data-selected={isSelected ? '' : undefined}
        style={
          virtualScroll && !paginated
            ? { height: `${rowHeight}px` }
            : undefined
        }
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
          const isEditing = editingCell?.row === globalIdx && editingCell?.col === col.id
          const wasJustEdited = justEditedCell?.row === globalIdx && justEditedCell?.col === col.id
          const isColEditable = editable && col.editable !== false
          const pinnedShadow = col.id === lastLeftPinned ? 'left' : col.id === firstRightPinned ? 'right' : undefined

          return (
            <td
              key={col.id}
              className="ui-data-table__td"
              role="gridcell"
              tabIndex={-1}
              data-align={col.align || undefined}
              data-pinned={col.pinned || undefined}
              data-pinned-shadow={pinnedShadow || undefined}
              data-label={getHeaderText(col.header, col.id)}
              data-editing={isEditing ? '' : undefined}
              data-just-edited={wasJustEdited ? '' : undefined}
              style={getColStyle(col)}
              onDoubleClick={isColEditable ? () => startEditing(globalIdx, col.id, value) : undefined}
            >
              {isEditing ? (
                <input
                  className="ui-data-table__edit-input"
                  data-testid={`edit-input-${col.id}`}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  onBlur={commitEdit}
                  autoFocus
                />
              ) : (
                renderCellContent(col, value, row, globalIdx)
              )}
            </td>
          )
        })}
      </tr>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────

  const tableContent = (
    <table
      ref={gridRef}
      className="ui-data-table__table"
      role="grid"
      aria-rowcount={sortedData.length + 1}
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
          {visibleColumns.map(col => {
            const isColSortable = col.sortable ?? sortable
            const isColResizable = col.resizable ?? resizable
            const isColFilterable = (filterable || col.filterable) && col.filterable !== false
            const sortIndex = getSortIndex(col)
            const hasActiveFilter = activeFilters[col.id] && (activeFilters[col.id].value || activeFilters[col.id].operator === 'isEmpty' || activeFilters[col.id].operator === 'isNotEmpty')
            const pinnedShadow = col.id === lastLeftPinned ? 'left' : col.id === firstRightPinned ? 'right' : undefined

            return (
              <th
                key={col.id}
                className="ui-data-table__th"
                role="columnheader"
                scope="col"
                tabIndex={-1}
                style={getColStyle(col)}
                aria-sort={getAriaSort(col) as React.AriaAttributes['aria-sort']}
                data-sortable={isColSortable ? '' : undefined}
                data-align={col.align || undefined}
                data-pinned={col.pinned || undefined}
                data-pinned-shadow={pinnedShadow || undefined}
                data-reorderable={reorderable ? '' : undefined}
                data-dragging={dragColId === col.id ? '' : undefined}
                data-drag-over={
                  dragOverColId === col.id && dragOverSide ? dragOverSide : undefined
                }
                draggable={reorderable}
                onClick={e => {
                  // Don't sort if clicking on filter button
                  if ((e.target as HTMLElement).closest('.ui-data-table__filter-btn') ||
                      (e.target as HTMLElement).closest('.ui-data-table__filter-popover')) return
                  if (isColSortable) handleSort(col.id, e.shiftKey)
                }}
                onDragStart={e => handleDragStart(col.id, e)}
                onDragOver={e => handleDragOver(col.id, e)}
                onDrop={e => handleDrop(col.id, e)}
                onDragEnd={handleDragEnd}
                onDragLeave={() => {
                  if (dragOverColId === col.id) {
                    setDragOverColId(null)
                    setDragOverSide(null)
                  }
                }}
              >
                <span className="ui-data-table__header-content">
                  {renderHeader(col.header)}
                  {isColSortable && (
                    <span className="ui-data-table__sort-icon" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                  {sortBy.length > 1 && sortIndex >= 0 && (
                    <span className="ui-data-table__sort-badge" aria-hidden="true">
                      {sortIndex + 1}
                    </span>
                  )}
                  {isColFilterable && (
                    <button
                      type="button"
                      className="ui-data-table__filter-btn"
                      data-active={hasActiveFilter ? '' : undefined}
                      onClick={e => {
                        e.stopPropagation()
                        setOpenFilterCol(prev => prev === col.id ? null : col.id)
                      }}
                      aria-label={`Filter ${getHeaderText(col.header, col.id)}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M1 2h10L7 6.5V10L5 9V6.5L1 2Z" fill="currentColor" />
                      </svg>
                    </button>
                  )}
                </span>
                {isColFilterable && openFilterCol === col.id && (
                  <div
                    ref={filterPopoverRef}
                    className="ui-data-table__filter-popover"
                    data-testid={`filter-popover-${col.id}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {col.filterType === 'select' ? (
                      <>
                        <div className="ui-data-table__filter-select-list">
                          {(col.filterOptions ?? [...new Set(data.map(r => String(getCellValue(r, col.accessor) ?? '')))]).map(opt => {
                            const selected = (activeFilters[col.id]?.value ?? '').split(',').map(v => v.trim().toLowerCase())
                            const isChecked = selected.includes(opt.toLowerCase())
                            return (
                              <label key={opt} className="ui-data-table__filter-select-item">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    let vals = selected.filter(v => v !== '')
                                    if (isChecked) vals = vals.filter(v => v !== opt.toLowerCase())
                                    else vals.push(opt.toLowerCase())
                                    setActiveFilters({
                                      ...activeFilters,
                                      [col.id]: { value: vals.join(','), operator: 'isOneOf' },
                                    })
                                  }}
                                />
                                {opt}
                              </label>
                            )
                          })}
                        </div>
                        <div className="ui-data-table__filter-actions">
                          <button type="button" onClick={() => {
                            const next = { ...activeFilters }
                            delete next[col.id]
                            setActiveFilters(next)
                            setOpenFilterCol(null)
                          }}>Clear</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <select
                          value={activeFilters[col.id]?.operator ?? getOperatorsForType(col.filterType)[0].value}
                          onChange={e => {
                            setActiveFilters({
                              ...activeFilters,
                              [col.id]: {
                                value: activeFilters[col.id]?.value ?? '',
                                operator: e.target.value,
                              },
                            })
                          }}
                          data-testid={`filter-operator-${col.id}`}
                        >
                          {getOperatorsForType(col.filterType).map(op => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        <input
                          type={col.filterType === 'number' ? 'number' : col.filterType === 'date' ? 'date' : 'text'}
                          placeholder="Filter value..."
                          value={activeFilters[col.id]?.value ?? ''}
                          onChange={e => {
                            setActiveFilters({
                              ...activeFilters,
                              [col.id]: {
                                value: e.target.value,
                                operator: activeFilters[col.id]?.operator ?? getOperatorsForType(col.filterType)[0].value,
                              },
                            })
                          }}
                          data-testid={`filter-input-${col.id}`}
                        />
                        <div className="ui-data-table__filter-actions">
                          <button type="button" onClick={() => {
                            const next = { ...activeFilters }
                            delete next[col.id]
                            setActiveFilters(next)
                            setOpenFilterCol(null)
                          }}>Clear</button>
                          <button type="button" onClick={() => setOpenFilterCol(null)}>Apply</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {isColResizable && (
                  <span
                    className="ui-data-table__resize-handle"
                    onPointerDown={e => handleResizeStart(col.id, e)}
                    onPointerMove={handleResizeMove}
                    onPointerUp={handleResizeEnd}
                    onDoubleClick={() => handleResizeDoubleClick(col.id)}
                    role="separator"
                    aria-orientation="vertical"
                  />
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody className="ui-data-table__tbody" role="rowgroup">
        {loading ? (
          Array.from({ length: paginated ? pageSize : 5 }, (_, ri) => (
            <tr key={`skel-${ri}`} className="ui-data-table__skeleton-row" role="row">
              {selectable && (
                <td
                  className="ui-data-table__skeleton-cell ui-data-table__checkbox-cell"
                  role="gridcell"
                >
                  <span
                    className="ui-data-table__skeleton-bar"
                    style={{ inlineSize: '16px', margin: '0 auto' }}
                  />
                </td>
              )}
              {visibleColumns.map(col => (
                <td key={col.id} className="ui-data-table__skeleton-cell" role="gridcell">
                  <span
                    className="ui-data-table__skeleton-bar"
                    style={{ inlineSize: `${50 + ((ri * 17 + col.id.length * 13) % 40)}%` }}
                  />
                </td>
              ))}
            </tr>
          ))
        ) : displayData.length === 0 ? (
          <tr role="row">
            <td
              className="ui-data-table__empty"
              role="gridcell"
              colSpan={visibleColumns.length + (selectable ? 1 : 0)}
            >
              {empty ?? 'No data'}
            </td>
          </tr>
        ) : groupedData && groupBy ? (
          // ─── Grouped rendering ───────────────────────────
          Array.from(groupedData.entries()).flatMap(([groupKey, group]) => {
            const isExpanded = expandedGroups.has(groupKey)
            const groupHeader = (
              <tr
                key={`group-${groupKey}`}
                className="ui-data-table__group-row"
                role="row"
                onClick={() => toggleGroup(groupKey)}
                data-testid={`group-row-${groupKey}`}
              >
                <td
                  className="ui-data-table__group-cell"
                  role="gridcell"
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                >
                  <span
                    className="ui-data-table__group-chevron"
                    data-expanded={isExpanded ? '' : undefined}
                    aria-hidden="true"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  {groupKey}
                  <span className="ui-data-table__group-count">({group.rows.length})</span>
                  {aggregations && visibleColumns.map(col => {
                    const agg = aggregations[col.id]
                    if (!agg) return null
                    const values = group.rows.map(r => getCellValue(r, col.accessor))
                    return (
                      <span key={col.id} className="ui-data-table__group-agg" data-testid={`group-agg-${groupKey}-${col.id}`}>
                        {getHeaderText(col.header, col.id)}: {computeAggregation(values, agg)}
                      </span>
                    )
                  })}
                </td>
              </tr>
            )
            if (!isExpanded) return [groupHeader]
            const childRows = group.rows.map((row, idx) => {
              const globalIdx = sortedData.indexOf(row)
              const isSelected = selectedRows.has(globalIdx)
              return renderDataRow(row, globalIdx, isSelected, idx)
            })
            return [groupHeader, ...childRows]
          })
        ) : (
          displayData.map((row, idx) => {
            const baseOffset = virtualScroll && !paginated ? startIndex : 0
            const pageOffset = paginated && !showAllPages && !serverSide ? page * pageSize : 0
            const globalIdx = pageOffset + baseOffset + idx
            const isSelected = selectedRows.has(globalIdx)
            return renderDataRow(row, globalIdx, isSelected, idx)
          })
        )}
      </tbody>
    </table>
  )

  return (
    <div
      ref={ref}
      className={cn(cls('root'), className)}
      data-motion={motionLevel}
      data-responsive={responsiveMode}
      {...(stickyHeader ? { 'data-sticky-header': '' } : {})}
      {...(striped ? { 'data-striped': '' } : {})}
      {...(compact ? { 'data-compact': '' } : {})}
      {...(bordered ? { 'data-bordered': '' } : {})}
      {...(openFilterCol ? { 'data-filter-open': '' } : {})}
      {...rest}
    >
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      {showToolbar && (
        <div className="ui-data-table__toolbar" role="toolbar" aria-label="Table controls">
          {/* Search */}
          {searchable && (
            <div className="ui-data-table__search-wrapper">
              <input
                type="search"
                role="searchbox"
                className="ui-data-table__search"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchInput}
                aria-label="Search table"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ui-data-table__search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  &#x2715;
                </button>
              )}
            </div>
          )}

          {/* Result count */}
          {searchable && debouncedSearch && (
            <span className="ui-data-table__result-count" aria-live="polite">
              {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Custom toolbar */}
          {toolbar}

          {/* Spacer */}
          <span style={{ flex: '1 1 0' }} />

          {/* Column selector */}
          <div className="ui-data-table__col-toggle" ref={colDropdownRef}>
            <button
              type="button"
              className="ui-data-table__toolbar-btn"
              onClick={() => setShowColDropdown(v => !v)}
              aria-label="Toggle columns"
              aria-expanded={showColDropdown}
              aria-haspopup="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Columns
            </button>
            {showColDropdown && (
              <div className="ui-data-table__col-dropdown" role="menu">
                <div className="ui-data-table__col-dropdown-actions">
                  <button type="button" onClick={showAllColumns}>
                    Show all
                  </button>
                  <button type="button" onClick={hideAllColumns}>
                    Hide all
                  </button>
                </div>
                {columnsProp.map(col => (
                  <label key={col.id} className="ui-data-table__col-item">
                    <input
                      type="checkbox"
                      className="ui-data-table__col-checkbox"
                      checked={!hiddenColumns.has(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    {getHeaderText(col.header, col.id)}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          {exportable && (
            <div className="ui-data-table__export-wrapper" ref={exportDropdownRef}>
              <button
                type="button"
                className="ui-data-table__toolbar-btn"
                onClick={() => setShowExportDropdown(v => !v)}
                aria-label="Export"
                aria-expanded={showExportDropdown}
                aria-haspopup="true"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M7 1v8M3.5 5.5L7 9l3.5-3.5M2 11h10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Export
              </button>
              {showExportDropdown && (
                <div className="ui-data-table__export-dropdown" role="menu">
                  <button
                    type="button"
                    className="ui-data-table__export-item"
                    role="menuitem"
                    onClick={() => handleExport('csv')}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="ui-data-table__export-item"
                    role="menuitem"
                    onClick={() => handleExport('json')}
                  >
                    Export JSON
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────── */}
      {error ? (
        <div className="ui-data-table__error" role="alert">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              className="ui-data-table__retry-btn"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      ) : virtualScroll && !paginated ? (
        /* ── Virtual scroll wrapper ──────────────────────────────── */
        <div
          ref={virtualContainerRef}
          className="ui-data-table__virtual-scroll"
          style={{ maxBlockSize: '600px' }}
          data-testid="virtual-scroll-container"
        >
          <div
            className="ui-data-table__virtual-spacer"
            style={{ height: `${totalHeight}px` }}
          >
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {tableContent}
            </div>
          </div>
        </div>
      ) : (
        /* ── Standard scroll wrapper ─────────────────────────────── */
        <div className="ui-data-table__scroll">{tableContent}</div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {paginated && !error && !loading && (
        <nav className="ui-data-table__pagination" aria-label="Table pagination">
          <span className="ui-data-table__page-info">{pageInfoText}</span>

          <div className="ui-data-table__page-controls">
            <button
              type="button"
              className="ui-data-table__page-btn"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Previous page"
            >
              &#x276E;
            </button>
            {paginationRange.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e${i}`} style={{ padding: '0 4px' }}>
                  &hellip;
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className="ui-data-table__page-btn"
                  data-active={p === page ? '' : undefined}
                  onClick={() => handlePageChange(p)}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p + 1}
                </button>
              )
            )}
            <button
              type="button"
              className="ui-data-table__page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Next page"
            >
              &#x276F;
            </button>

            <select
              className="ui-data-table__page-size-select"
              value={showAllPages ? 'all' : pageSize}
              onChange={handlePageSizeChange}
              aria-label="Page size"
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
              <option value="all">All</option>
            </select>
          </div>
        </nav>
      )}
    </div>
  )
}

export const DataTable = forwardRef(DataTableInner) as <
  T extends object
>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

;(DataTable as unknown as { displayName: string }).displayName = 'DataTable'
