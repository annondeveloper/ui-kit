'use client'

import type React from 'react'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Search, Clock, Command, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single command item in the palette. */
export interface CommandItem {
  /** Unique identifier. */
  id: string
  /** Display label. */
  label: string
  /** Optional description shown below the label. */
  description?: string
  /** Optional icon component. */
  icon?: LucideIcon
  /** Keyboard shortcut display string (e.g. "Cmd+K"). */
  shortcut?: string
  /** Group name for sectioning items. */
  group?: string
  /** Callback when item is selected. */
  onSelect: () => void
  /** Additional search terms that match this item. */
  keywords?: string[]
}

/** Props for the CommandBar component. */
export interface CommandBarProps {
  /** Array of command items to display and search. */
  items: CommandItem[]
  /** Placeholder text for the search input. */
  placeholder?: string
  /** Hotkey letter (combined with Cmd/Ctrl). Default "k". */
  hotkey?: string
  /** Async search function for remote results. */
  onSearch?: (query: string) => Promise<CommandItem[]>
  /** localStorage key for persisting recent selections. */
  recentKey?: string
  /** Maximum number of recent items to store. Default 5. */
  maxRecent?: number
  /** Additional class name for the dialog. */
  className?: string
}

// ---------------------------------------------------------------------------
// Fuzzy scoring
// ---------------------------------------------------------------------------

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  // Fuzzy subsequence match
  let qi = 0
  let score = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10
      qi++
    }
  }
  return qi === q.length ? score : 0
}

function scoreItem(query: string, item: CommandItem): number {
  if (!query) return 0
  let best = fuzzyScore(query, item.label)
  if (item.description) best = Math.max(best, fuzzyScore(query, item.description) * 0.8)
  if (item.keywords) {
    for (const kw of item.keywords) {
      best = Math.max(best, fuzzyScore(query, kw) * 0.9)
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// CommandBar
// ---------------------------------------------------------------------------

/**
 * @description A universal command palette activated by Cmd+K (Mac) or Ctrl+K (Win).
 * Features fuzzy search, grouped items, recent selections (localStorage),
 * async search support, keyboard navigation, and Framer Motion animations.
 * Fully configurable and not hardcoded to any app.
 */
export function CommandBar({
  items,
  placeholder = 'Type a command\u2026',
  hotkey = 'k',
  onSearch,
  recentKey = 'ui-kit-command-recent',
  maxRecent = 5,
  className,
}: CommandBarProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [asyncResults, setAsyncResults] = useState<CommandItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Recent items from localStorage
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(recentKey) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  const saveRecent = useCallback(
    (id: string) => {
      const updated = [id, ...recentIds.filter(r => r !== id)].slice(0, maxRecent)
      setRecentIds(updated)
      try {
        localStorage.setItem(recentKey, JSON.stringify(updated))
      } catch {
        // localStorage might be full
      }
    },
    [recentIds, recentKey, maxRecent],
  )

  // Hotkey listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === hotkey) {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [hotkey, open])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setAsyncResults([])
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  // Async search debounce
  useEffect(() => {
    if (!onSearch || !query) {
      setAsyncResults([])
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(query)
        setAsyncResults(results)
      } catch {
        setAsyncResults([])
      } finally {
        setIsSearching(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  // Build display list
  const displayItems = useMemo(() => {
    const allItems = [...items, ...asyncResults]

    if (!query) {
      // Show recent items first, then all items
      const recentItems = recentIds
        .map(id => allItems.find(i => i.id === id))
        .filter((i): i is CommandItem => i !== undefined)
      const rest = allItems.filter(i => !recentIds.includes(i.id))
      return [
        ...recentItems.map(i => ({ ...i, group: 'Recent' })),
        ...rest,
      ]
    }

    // Score and sort
    return allItems
      .map(item => ({ item, score: scoreItem(query, item) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
  }, [items, asyncResults, query, recentIds])

  // Group items
  const groups = useMemo(() => {
    const grouped = new Map<string, CommandItem[]>()
    for (const item of displayItems) {
      const group = item.group ?? ''
      const arr = grouped.get(group)
      if (arr) arr.push(item)
      else grouped.set(group, [item])
    }
    return grouped
  }, [displayItems])

  // Flatten for keyboard nav
  const flatItems = displayItems

  // Keep activeIndex in bounds
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleSelect = useCallback(
    (item: CommandItem) => {
      saveRecent(item.id)
      setOpen(false)
      item.onSelect()
    },
    [saveRecent],
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, flatItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = flatItems[activeIndex]
        if (item) handleSelect(item)
      }
    },
    [flatItems, activeIndex, handleSelect],
  )

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.userAgent ?? '')

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className="absolute inset-0 bg-[hsl(var(--bg-base)/0.6)] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-1/2 top-[15%] -translate-x-1/2',
              'w-full max-w-lg rounded-2xl overflow-hidden',
              'border border-[hsl(var(--border-default))]',
              'bg-[hsl(var(--bg-elevated))] shadow-2xl',
              'flex flex-col max-h-[70vh]',
              className,
            )}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border-subtle)/0.5)]">
              <Search className="h-5 w-5 text-[hsl(var(--text-tertiary))] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-[hsl(var(--text-primary))] text-sm placeholder:text-[hsl(var(--text-tertiary))] outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
                Esc
              </kbd>
            </div>

            {/* Results list */}
            <div ref={listRef} className="flex-1 overflow-y-auto py-2">
              {flatItems.length === 0 && !isSearching && (
                <div className="px-4 py-8 text-center text-sm text-[hsl(var(--text-tertiary))]">
                  {query ? 'No results found.' : 'No commands available.'}
                </div>
              )}

              {isSearching && flatItems.length === 0 && (
                <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-[hsl(var(--text-tertiary))]">
                  <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--brand-primary))] border-t-transparent animate-spin" />
                  Searching...
                </div>
              )}

              {[...groups.entries()].map(([groupName, groupItems]) => {
                return (
                  <div key={groupName || '__ungrouped'}>
                    {groupName && (
                      <div className="px-4 pt-2 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                          {groupName}
                        </span>
                      </div>
                    )}
                    {groupItems.map(item => {
                      const globalIdx = flatItems.indexOf(item)
                      const isActive = globalIdx === activeIndex
                      const Icon = item.icon
                      const isRecent = item.group === 'Recent'
                      return (
                        <button
                          key={item.id}
                          data-active={isActive}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            isActive
                              ? 'bg-[hsl(var(--brand-primary)/0.1)]'
                              : 'hover:bg-[hsl(var(--bg-surface)/0.5)]',
                          )}
                        >
                          {Icon ? (
                            <Icon className={cn(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-[hsl(var(--brand-primary))]' : 'text-[hsl(var(--text-tertiary))]',
                            )} />
                          ) : isRecent ? (
                            <Clock className={cn(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-[hsl(var(--brand-primary))]' : 'text-[hsl(var(--text-tertiary))]',
                            )} />
                          ) : (
                            <div className="h-4 w-4 shrink-0" />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'text-sm font-medium truncate',
                              isActive ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-primary))]',
                            )}>
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>

                          {item.shortcut && (
                            <kbd className="flex items-center gap-0.5 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-tertiary))] font-mono shrink-0">
                              {item.shortcut}
                            </kbd>
                          )}

                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-[hsl(var(--text-tertiary))] shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-[hsl(var(--border-subtle)/0.5)] text-[10px] text-[hsl(var(--text-tertiary))]">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1 py-0.5 font-mono">&uarr;&darr;</kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1 py-0.5 font-mono">&crarr;</kbd>
                Select
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1 py-0.5 font-mono">Esc</kbd>
                Close
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1 py-0.5 font-mono">
                  {isMac ? '\u2318' : 'Ctrl+'}
                </kbd>
                <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1 py-0.5 font-mono uppercase">
                  {hotkey}
                </kbd>
                Toggle
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
