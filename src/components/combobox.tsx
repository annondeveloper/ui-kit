'use client'
import type React from 'react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn } from '../utils'
import { ChevronDown, X, Search, Loader2, Check } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  group?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  onSearch?: (query: string) => Promise<ComboboxOption[]>
  placeholder?: string
  label?: string
  multiple?: boolean
  disabled?: boolean
  loading?: boolean
  maxHeight?: number
  virtualize?: boolean
  emptyMessage?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEM_HEIGHT = 40
const GROUP_HEADER_HEIGHT = 28
const BUFFER_COUNT = 5
const DEBOUNCE_MS = 300

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple fuzzy match — checks if all query chars appear in order in the target. */
function fuzzyMatch(target: string, query: string): boolean {
  const t = target.toLowerCase()
  const q = query.toLowerCase()
  let ti = 0
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti)
    if (idx === -1) return false
    ti = idx + 1
  }
  return true
}

/** Group options by their group key, preserving insertion order. */
function groupOptions(opts: ComboboxOption[]): { group: string | null; items: ComboboxOption[] }[] {
  const groups: { group: string | null; items: ComboboxOption[] }[] = []
  const map = new Map<string | null, ComboboxOption[]>()
  for (const o of opts) {
    const key = o.group ?? null
    let arr = map.get(key)
    if (!arr) {
      arr = []
      map.set(key, arr)
      groups.push({ group: key, items: arr })
    }
    arr.push(o)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Combobox({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Select...',
  label,
  multiple = false,
  disabled = false,
  loading: externalLoading = false,
  maxHeight = 300,
  virtualize = false,
  emptyMessage = 'No results found',
  className,
}: ComboboxProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[] | null>(null)
  const [asyncLoading, setAsyncLoading] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = externalLoading || asyncLoading

  // Normalized selected values
  const selectedValues = useMemo<string[]>(() => {
    if (value === undefined) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  // Merge base options with async results
  const baseOptions = asyncOptions ?? options

  // Filter options by query (local fuzzy search)
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return baseOptions
    return baseOptions.filter(
      (o) => fuzzyMatch(o.label, query) || (o.description && fuzzyMatch(o.description, query)),
    )
  }, [baseOptions, query])

  // Grouped for rendering
  const grouped = useMemo(() => groupOptions(filteredOptions), [filteredOptions])

  // Flat list for keyboard navigation (skipping disabled)
  const flatItems = useMemo(() => filteredOptions.filter((o) => !o.disabled), [filteredOptions])

  // Virtual scrolling calculations
  const totalItems = useMemo(() => {
    if (!virtualize) return 0
    let count = 0
    for (const g of grouped) {
      if (g.group !== null) count++ // group header
      count += g.items.length
    }
    return count
  }, [grouped, virtualize])

  const totalHeight = virtualize ? totalItems * ITEM_HEIGHT : 0

  // ── Async search debounce ──
  useEffect(() => {
    if (!onSearch) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setAsyncOptions(null)
      setAsyncLoading(false)
      return
    }
    setAsyncLoading(true)
    debounceRef.current = setTimeout(() => {
      onSearch(query)
        .then((results) => {
          setAsyncOptions(results)
          setAsyncLoading(false)
        })
        .catch(() => {
          setAsyncLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, onSearch])

  // ── Close on outside click ──
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ── Scroll active item into view ──
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current || virtualize) return
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, virtualize])

  // ── Selection helpers ──
  const isSelected = useCallback((val: string) => selectedValues.includes(val), [selectedValues])

  const selectOption = useCallback(
    (opt: ComboboxOption) => {
      if (opt.disabled) return
      if (multiple) {
        const next = isSelected(opt.value)
          ? selectedValues.filter((v) => v !== opt.value)
          : [...selectedValues, opt.value]
        onChange(next)
      } else {
        onChange(opt.value)
        setOpen(false)
        setQuery('')
      }
      inputRef.current?.focus()
    },
    [multiple, selectedValues, isSelected, onChange],
  )

  const removeTag = useCallback(
    (val: string) => {
      if (multiple) {
        onChange(selectedValues.filter((v) => v !== val))
      }
    },
    [multiple, selectedValues, onChange],
  )

  const clearAll = useCallback(() => {
    onChange(multiple ? [] : '')
    setQuery('')
    inputRef.current?.focus()
  }, [multiple, onChange])

  // ── Keyboard handler ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (!open) {
            setOpen(true)
            setActiveIndex(0)
          } else {
            setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : prev))
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (open && activeIndex >= 0 && activeIndex < flatItems.length) {
            selectOption(flatItems[activeIndex])
          } else if (!open) {
            setOpen(true)
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          break
        case 'Backspace':
          if (multiple && query === '' && selectedValues.length > 0) {
            removeTag(selectedValues[selectedValues.length - 1])
          }
          break
      }
    },
    [disabled, open, activeIndex, flatItems, selectOption, multiple, query, selectedValues, removeTag],
  )

  // ── Virtual scroll handler ──
  const handleScroll = useCallback(() => {
    if (listRef.current) setScrollTop(listRef.current.scrollTop)
  }, [])

  // ── Build virtual items ──
  const renderVirtualized = useCallback(() => {
    const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT)
    const visibleCount = Math.ceil(maxHeight / ITEM_HEIGHT)
    const start = Math.max(0, visibleStart - BUFFER_COUNT)
    const end = Math.min(totalItems, visibleStart + visibleCount + BUFFER_COUNT)

    // Build flat render list with group headers
    const flatRender: { type: 'header' | 'item'; group?: string; option?: ComboboxOption; flatIdx: number }[] = []
    let idx = 0
    for (const g of grouped) {
      if (g.group !== null) {
        flatRender.push({ type: 'header', group: g.group, flatIdx: idx })
        idx++
      }
      for (const item of g.items) {
        flatRender.push({ type: 'item', option: item, flatIdx: idx })
        idx++
      }
    }

    const visible = flatRender.slice(start, end)

    return (
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visible.map((entry) => (
          <div
            key={entry.type === 'header' ? `gh-${entry.group}` : `opt-${entry.option!.value}`}
            style={{
              position: 'absolute',
              top: entry.flatIdx * ITEM_HEIGHT,
              left: 0,
              right: 0,
              height: entry.type === 'header' ? GROUP_HEADER_HEIGHT : ITEM_HEIGHT,
            }}
          >
            {entry.type === 'header' ? (
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                {entry.group}
              </div>
            ) : (
              <OptionRow
                option={entry.option!}
                selected={isSelected(entry.option!.value)}
                active={flatItems.indexOf(entry.option!) === activeIndex}
                index={flatItems.indexOf(entry.option!)}
                onClick={() => selectOption(entry.option!)}
                onMouseEnter={() => setActiveIndex(flatItems.indexOf(entry.option!))}
              />
            )}
          </div>
        ))}
      </div>
    )
  }, [scrollTop, maxHeight, totalItems, grouped, flatItems, activeIndex, isSelected, selectOption, totalHeight])

  // ── Non-virtualized render ──
  const renderStandard = useCallback(() => {
    let flatIdx = 0
    return grouped.map((g) => (
      <div key={g.group ?? '__ungrouped'}>
        {g.group !== null && (
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
            {g.group}
          </div>
        )}
        {g.items.map((opt) => {
          const navIdx = flatItems.indexOf(opt)
          const el = (
            <OptionRow
              key={opt.value}
              option={opt}
              selected={isSelected(opt.value)}
              active={navIdx === activeIndex}
              index={navIdx}
              onClick={() => selectOption(opt)}
              onMouseEnter={() => {
                if (!opt.disabled) setActiveIndex(navIdx)
              }}
            />
          )
          flatIdx++
          return el
        })}
      </div>
    ))
  }, [grouped, flatItems, activeIndex, isSelected, selectOption])

  // ── Resolve label for single select display ──
  const displayLabel = useMemo(() => {
    if (multiple) return null
    if (selectedValues.length === 0) return null
    const opt = options.find((o) => o.value === selectedValues[0])
    return opt?.label ?? selectedValues[0]
  }, [multiple, selectedValues, options])

  const hasValue = selectedValues.length > 0
  const listboxId = 'combobox-listbox'
  const activeDescendant = activeIndex >= 0 && activeIndex < flatItems.length
    ? `combobox-option-${flatItems[activeIndex].value}`
    : undefined

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-secondary))]">
          {label}
        </label>
      )}

      {/* Input area */}
      <div
        className={cn(
          'flex min-h-[2.5rem] w-full flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5',
          'bg-[hsl(var(--bg-surface))] border-[hsl(var(--border-default))]',
          'transition-colors duration-150',
          open && 'border-[hsl(var(--brand-primary))] ring-1 ring-[hsl(var(--brand-primary))]',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-text hover:border-[hsl(var(--border-strong))]',
        )}
        onClick={() => {
          if (!disabled) {
            setOpen(true)
            inputRef.current?.focus()
          }
        }}
      >
        <Search className="h-4 w-4 shrink-0 text-[hsl(var(--text-tertiary))]" />

        {/* Multi-select tags */}
        {multiple &&
          selectedValues.map((val) => {
            const opt = options.find((o) => o.value === val)
            return (
              <span
                key={val}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                  'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))]',
                  'border border-[hsl(var(--border-subtle))]',
                )}
              >
                {opt?.label ?? val}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(val)
                  }}
                  className="ml-0.5 rounded-sm hover:text-[hsl(var(--status-critical))] transition-colors"
                  aria-label={`Remove ${opt?.label ?? val}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
            if (!open) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          placeholder={!multiple && displayLabel ? displayLabel : placeholder}
          className={cn(
            'min-w-[80px] flex-1 bg-transparent text-sm outline-none',
            'text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]',
            !multiple && displayLabel && !query && 'placeholder:text-[hsl(var(--text-primary))]',
          )}
        />

        {/* Right side icons */}
        <div className="flex shrink-0 items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--text-tertiary))]" />
          )}
          {hasValue && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
              className="rounded-sm p-0.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-[hsl(var(--text-tertiary))] transition-transform duration-150',
              open && 'rotate-180',
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border',
            'bg-[hsl(var(--bg-surface))] border-[hsl(var(--border-default))]',
            'shadow-lg shadow-black/20',
          )}
        >
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="overflow-y-auto"
            style={{ maxHeight }}
            onScroll={virtualize ? handleScroll : undefined}
          >
            {filteredOptions.length === 0 && !isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-[hsl(var(--text-tertiary))]">
                {emptyMessage}
              </div>
            ) : virtualize ? (
              renderVirtualized()
            ) : (
              renderStandard()
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// OptionRow sub-component
// ---------------------------------------------------------------------------

interface OptionRowProps {
  option: ComboboxOption
  selected: boolean
  active: boolean
  index: number
  onClick: () => void
  onMouseEnter: () => void
}

function OptionRow({ option, selected, active, index, onClick, onMouseEnter }: OptionRowProps): React.JSX.Element {
  return (
    <div
      id={`combobox-option-${option.value}`}
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      data-index={index}
      className={cn(
        'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
        active && 'bg-[hsl(var(--bg-elevated))]',
        selected && !active && 'bg-[hsl(var(--bg-elevated)/.5)]',
        option.disabled && 'cursor-not-allowed opacity-40',
        !option.disabled && !active && 'hover:bg-[hsl(var(--bg-elevated))]',
      )}
      onClick={() => {
        if (!option.disabled) onClick()
      }}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex-1 min-w-0">
        <div className="truncate text-[hsl(var(--text-primary))]">{option.label}</div>
        {option.description && (
          <div className="truncate text-xs text-[hsl(var(--text-tertiary))]">{option.description}</div>
        )}
      </div>
      {selected && (
        <Check className="h-4 w-4 shrink-0 text-[hsl(var(--brand-primary))]" />
      )}
    </div>
  )
}
