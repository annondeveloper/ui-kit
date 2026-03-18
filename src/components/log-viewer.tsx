'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowDown, Search } from 'lucide-react'
import { cn } from '../utils'

export interface LogEntry {
  /** ISO 8601 timestamp. */
  time: string
  /** Log level. */
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace'
  /** Log message content. */
  message: string
  /** Optional source identifier. */
  source?: string
}

export interface LogViewerProps {
  /** Log entries to display. */
  entries: LogEntry[]
  /** Maximum container height in pixels. */
  maxHeight?: number
  /** Auto-scroll to bottom on new entries. */
  autoScroll?: boolean
  /** Show timestamps column. */
  showTimestamps?: boolean
  /** Show level badge. */
  showLevel?: boolean
  /** Callback when a log entry is clicked. */
  onEntryClick?: (entry: LogEntry) => void
  className?: string
}

const levelBorder: Record<string, string> = {
  error: 'border-l-[hsl(var(--status-critical))]',
  warn: 'border-l-[hsl(var(--status-warning))]',
  info: 'border-l-[hsl(var(--brand-primary))]',
  debug: 'border-l-[hsl(var(--text-tertiary))]',
  trace: 'border-l-[hsl(var(--text-disabled))]',
}

const levelText: Record<string, string> = {
  error: 'text-[hsl(var(--status-critical))]',
  warn: 'text-[hsl(var(--status-warning))]',
  info: 'text-[hsl(var(--brand-primary))]',
  debug: 'text-[hsl(var(--text-tertiary))]',
  trace: 'text-[hsl(var(--text-disabled))]',
}

const levelLabel: Record<string, string> = {
  error: 'ERR',
  warn: 'WRN',
  info: 'INF',
  debug: 'DBG',
  trace: 'TRC',
}

function formatTs(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

/**
 * @description A log stream viewer with severity-colored borders, auto-scroll,
 * search filtering, and a "new entries" indicator when scrolled up.
 * Designed for real-time log tailing in monitoring dashboards.
 */
export function LogViewer({
  entries,
  maxHeight = 400,
  autoScroll = true,
  showTimestamps = true,
  showLevel = true,
  onEntryClick,
  className,
}: LogViewerProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [filter, setFilter] = useState('')
  const [newCount, setNewCount] = useState(0)
  const prevLenRef = useRef(entries.length)

  const checkAtBottom = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32
    setIsAtBottom(atBottom)
    if (atBottom) setNewCount(0)
  }, [])

  // Auto-scroll on new entries
  useEffect(() => {
    const added = entries.length - prevLenRef.current
    prevLenRef.current = entries.length

    if (added > 0 && !isAtBottom) {
      setNewCount(prev => prev + added)
    }

    if (autoScroll && isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [entries.length, autoScroll, isAtBottom])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      setNewCount(0)
      setIsAtBottom(true)
    }
  }, [])

  const lowerFilter = filter.toLowerCase()
  const filtered = filter
    ? entries.filter(e =>
        e.message.toLowerCase().includes(lowerFilter) ||
        e.source?.toLowerCase().includes(lowerFilter) ||
        e.level.includes(lowerFilter)
      )
    : entries

  return (
    <div className={cn('relative rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] overflow-hidden', className)}>
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]">
        <Search className="size-3.5 text-[hsl(var(--text-tertiary))] shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter logs..."
          className="flex-1 bg-transparent text-[0.75rem] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-disabled))] outline-none font-mono"
        />
        {filter && (
          <span className="text-[0.6875rem] text-[hsl(var(--text-tertiary))] tabular-nums shrink-0">
            {filtered.length} / {entries.length}
          </span>
        )}
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        onScroll={checkAtBottom}
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filtered.map((entry, i) => (
          <div
            key={`${entry.time}-${i}`}
            onClick={() => onEntryClick?.(entry)}
            className={cn(
              'flex items-start gap-2 px-3 py-1 border-l-2 font-mono text-[0.75rem] leading-5',
              'hover:bg-[hsl(var(--bg-elevated))] transition-colors',
              onEntryClick && 'cursor-pointer',
              levelBorder[entry.level] ?? levelBorder.info,
            )}
          >
            {showTimestamps && (
              <span className="text-[hsl(var(--text-tertiary))] tabular-nums shrink-0 select-all">
                {formatTs(entry.time)}
              </span>
            )}
            {showLevel && (
              <span className={cn('font-semibold shrink-0 w-[2.5ch]', levelText[entry.level] ?? levelText.info)}>
                {levelLabel[entry.level] ?? entry.level.toUpperCase().slice(0, 3)}
              </span>
            )}
            {entry.source && (
              <span className="text-[hsl(var(--text-secondary))] shrink-0">
                [{entry.source}]
              </span>
            )}
            <span className="text-[hsl(var(--text-primary))] break-all min-w-0">
              {entry.message}
            </span>
          </div>
        ))}
      </div>

      {/* New entries indicator */}
      <AnimatePresence>
        {newCount > 0 && !isAtBottom && (
          <motion.button
            type="button"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            className={cn(
              'absolute bottom-3 left-1/2 -translate-x-1/2 z-10',
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-on-brand))]',
              'text-[0.6875rem] font-medium shadow-lg cursor-pointer',
              'hover:opacity-90 transition-opacity',
            )}
          >
            <ArrowDown className="size-3" />
            {newCount} new {newCount === 1 ? 'entry' : 'entries'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
