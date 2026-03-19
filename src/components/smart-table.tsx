'use client'

import type React from 'react'
import { useState, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, X, TrendingUp, AlertTriangle, Hash, Regex } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DataTable, type DataTableProps } from './data-table'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Describes an auto-detected filter suggestion for a data column. */
export interface FilterSuggestion {
  /** Column accessor key. */
  column: string
  /** Type of insight: outlier, top-n, pattern, or threshold. */
  type: 'outlier' | 'top-n' | 'pattern' | 'threshold'
  /** Human-readable label for the suggestion pill. */
  label: string
  /** Apply this filter to the data. */
  filter: () => void
}

/** Props for the SmartTable component. */
export interface SmartTableProps<T> extends DataTableProps<T> {
  /** Callback fired when a filter suggestion is generated or clicked. */
  onFilterSuggestion?: (suggestion: FilterSuggestion) => void
  /** Maximum number of suggestions to show. */
  maxSuggestions?: number
}

// ---------------------------------------------------------------------------
// Analysis helpers
// ---------------------------------------------------------------------------

function mean(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0
  const m = mean(nums)
  const variance = nums.reduce((sum, n) => sum + (n - m) ** 2, 0) / nums.length
  return Math.sqrt(variance)
}

function analyzeColumn<T>(
  columnId: string,
  columnHeader: string,
  data: T[],
  getValue: (row: T) => unknown,
): FilterSuggestion[] {
  const suggestions: FilterSuggestion[] = []
  const values = data.map(getValue).filter(v => v != null)
  if (values.length === 0) return suggestions

  // Check if numeric column
  const numericValues = values
    .map(v => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' && !isNaN(Number(v)) ? Number(v) : null))
    .filter((v): v is number => v !== null)

  if (numericValues.length > values.length * 0.7) {
    // Outlier detection (>2 std dev from mean)
    const m = mean(numericValues)
    const sd = stdDev(numericValues)
    if (sd > 0) {
      const outliers = numericValues.filter(v => Math.abs(v - m) > 2 * sd)
      if (outliers.length > 0 && outliers.length < numericValues.length * 0.3) {
        suggestions.push({
          column: columnId,
          type: 'outlier',
          label: `${outliers.length} outlier${outliers.length > 1 ? 's' : ''} in ${columnHeader}`,
          filter: () => {},
        })
      }
    }

    // Threshold suggestion — find if >80% of values are above or below median
    const sorted = [...numericValues].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0
    const aboveMedian = numericValues.filter(v => v > median)
    if (aboveMedian.length > 0 && aboveMedian.length < numericValues.length * 0.2) {
      suggestions.push({
        column: columnId,
        type: 'threshold',
        label: `Top ${aboveMedian.length} high values in ${columnHeader}`,
        filter: () => {},
      })
    }
  } else {
    // String column analysis
    const strValues = values.map(String)
    const freq = new Map<string, number>()
    for (const v of strValues) {
      freq.set(v, (freq.get(v) ?? 0) + 1)
    }

    // Pattern detection: if one value is >90% dominant
    for (const [val, count] of freq) {
      if (count / strValues.length >= 0.9 && freq.size > 1) {
        const otherCount = strValues.length - count
        suggestions.push({
          column: columnId,
          type: 'pattern',
          label: `Show non-"${val.length > 20 ? val.slice(0, 20) + '\u2026' : val}" (${otherCount})`,
          filter: () => {},
        })
      }
    }

    // Top-N: if there are more than 5 unique values, suggest top 5
    if (freq.size > 5) {
      const topEntries = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      const topTotal = topEntries.reduce((s, e) => s + e[1], 0)
      suggestions.push({
        column: columnId,
        type: 'top-n',
        label: `Top 5 ${columnHeader} (${Math.round((topTotal / strValues.length) * 100)}%)`,
        filter: () => {},
      })
    }

    // Minority value detection: values that appear in <12% of rows
    const minorityValues = [...freq.entries()].filter(
      ([, count]) => count / strValues.length < 0.12 && count > 0,
    )
    if (minorityValues.length > 0 && minorityValues.length < freq.size) {
      const totalMinority = minorityValues.reduce((s, [, c]) => s + c, 0)
      suggestions.push({
        column: columnId,
        type: 'pattern',
        label: `Rare ${columnHeader} values (${totalMinority} rows)`,
        filter: () => {},
      })
    }
  }

  return suggestions
}

// ---------------------------------------------------------------------------
// Suggestion icon mapping
// ---------------------------------------------------------------------------

const SUGGESTION_ICONS: Record<FilterSuggestion['type'], LucideIcon> = {
  outlier: AlertTriangle,
  'top-n': TrendingUp,
  pattern: Regex,
  threshold: Hash,
}

const SUGGESTION_COLORS: Record<FilterSuggestion['type'], string> = {
  outlier: 'bg-[hsl(var(--status-warning)/0.15)] text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning)/0.3)]',
  'top-n': 'bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))] border-[hsl(var(--brand-primary)/0.3)]',
  pattern: 'bg-[hsl(var(--brand-secondary)/0.15)] text-[hsl(var(--brand-secondary))] border-[hsl(var(--brand-secondary)/0.3)]',
  threshold: 'bg-[hsl(var(--status-critical)/0.15)] text-[hsl(var(--status-critical))] border-[hsl(var(--status-critical)/0.3)]',
}

// ---------------------------------------------------------------------------
// SmartTable
// ---------------------------------------------------------------------------

/**
 * @description An enhanced DataTable that analyzes column data on mount and auto-generates
 * smart filter suggestions such as outlier detection, top-N values, dominant patterns,
 * and threshold-based highlights. Click a suggestion to apply it as a filter.
 * Wraps the existing DataTable via composition.
 */
export function SmartTable<T>({
  columns,
  data,
  onFilterSuggestion,
  maxSuggestions = 6,
  ...tableProps
}: SmartTableProps<T>): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [appliedFilter, setAppliedFilter] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<T[] | null>(null)

  // Generate suggestions by analyzing each column
  const suggestions = useMemo(() => {
    if (data.length < 3) return []

    const allSuggestions: FilterSuggestion[] = []

    for (const colDef of columns) {
      const col = colDef as ColumnDef<T, unknown> & { accessorKey?: string; accessorFn?: (row: T) => unknown; header?: string }
      const columnId = col.accessorKey ?? (col as { id?: string }).id ?? ''
      const columnHeader = typeof col.header === 'string' ? col.header : columnId

      if (!columnId) continue

      const getValue = col.accessorFn
        ? col.accessorFn
        : (row: T) => (row as Record<string, unknown>)[columnId]

      const columnSuggestions = analyzeColumn(columnId, columnHeader, data, getValue)

      // Wire up actual filter functions
      for (const s of columnSuggestions) {
        s.filter = () => {
          const vals = data.map(getValue).filter(v => v != null)
          let filtered: T[]

          switch (s.type) {
            case 'outlier': {
              const nums = vals
                .map(v => (typeof v === 'number' ? v : Number(v)))
                .filter(v => !isNaN(v))
              const m = mean(nums)
              const sd = stdDev(nums)
              filtered = data.filter(row => {
                const v = getValue(row)
                const n = typeof v === 'number' ? v : Number(v)
                return !isNaN(n) && Math.abs(n - m) > 2 * sd
              })
              break
            }
            case 'top-n': {
              const freq = new Map<string, number>()
              for (const v of vals) freq.set(String(v), (freq.get(String(v)) ?? 0) + 1)
              const topKeys = new Set([...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]))
              filtered = data.filter(row => topKeys.has(String(getValue(row))))
              break
            }
            case 'threshold': {
              const nums = vals
                .map(v => (typeof v === 'number' ? v : Number(v)))
                .filter(v => !isNaN(v))
              const sorted = [...nums].sort((a, b) => a - b)
              const median = sorted[Math.floor(sorted.length / 2)] ?? 0
              filtered = data.filter(row => {
                const v = getValue(row)
                const n = typeof v === 'number' ? v : Number(v)
                return !isNaN(n) && n > median
              })
              break
            }
            case 'pattern': {
              const freq = new Map<string, number>()
              for (const v of vals) freq.set(String(v), (freq.get(String(v)) ?? 0) + 1)
              // Find dominant value
              let dominant = ''
              let maxCount = 0
              for (const [k, c] of freq) {
                if (c > maxCount) { dominant = k; maxCount = c }
              }
              if (maxCount / vals.length >= 0.9) {
                // Show non-dominant
                filtered = data.filter(row => String(getValue(row)) !== dominant)
              } else {
                // Rare values
                const rareKeys = new Set(
                  [...freq.entries()].filter(([, c]) => c / vals.length < 0.12).map(e => e[0]),
                )
                filtered = data.filter(row => rareKeys.has(String(getValue(row))))
              }
              break
            }
            default:
              filtered = data
          }

          setFilteredData(filtered)
          setAppliedFilter(s.label)
          onFilterSuggestion?.(s)
        }
      }

      allSuggestions.push(...columnSuggestions)
    }

    return allSuggestions.slice(0, maxSuggestions)
  }, [data, columns, maxSuggestions, onFilterSuggestion])

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.label))

  const handleDismiss = useCallback((label: string) => {
    setDismissed(prev => new Set(prev).add(label))
  }, [])

  const handleClearFilter = useCallback(() => {
    setFilteredData(null)
    setAppliedFilter(null)
  }, [])

  const displayData = filteredData ?? data

  return (
    <div>
      {/* Suggestion pills bar */}
      <AnimatePresence>
        {visibleSuggestions.length > 0 && !appliedFilter && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex flex-wrap items-center gap-2"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-primary))]" />
              Suggested Filters
            </span>

            {visibleSuggestions.map(suggestion => {
              const Icon = SUGGESTION_ICONS[suggestion.type]
              return (
                <motion.button
                  key={suggestion.label}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={suggestion.filter}
                  className={cn(
                    'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium',
                    'transition-all hover:shadow-sm cursor-pointer',
                    SUGGESTION_COLORS[suggestion.type],
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {suggestion.label}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleDismiss(suggestion.label) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDismiss(suggestion.label) } }}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-60 transition-opacity rounded-full p-0.5 hover:bg-[hsl(var(--bg-overlay)/0.3)]"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter indicator */}
      <AnimatePresence>
        {appliedFilter && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mb-3 flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-primary)/0.15)] border border-[hsl(var(--brand-primary)/0.3)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--brand-primary))]">
              <Sparkles className="h-3 w-3" />
              {appliedFilter}
              <span className="ml-1 tabular-nums text-[11px] opacity-70">
                ({displayData.length} row{displayData.length !== 1 ? 's' : ''})
              </span>
            </span>
            <button
              onClick={handleClearFilter}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated)/0.5)] transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrapped DataTable */}
      <DataTable<T>
        columns={columns}
        data={displayData}
        {...tableProps}
      />
    </div>
  )
}
