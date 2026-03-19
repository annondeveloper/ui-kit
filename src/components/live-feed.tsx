'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'
import { Pause, Play, ChevronUp } from 'lucide-react'

export interface FeedItem {
  id: string
  content: React.ReactNode
  timestamp: string | Date
  type?: 'info' | 'success' | 'warning' | 'error'
}

export interface LiveFeedProps {
  /** Array of feed items, newest first. */
  items: FeedItem[]
  /** Maximum visible items before oldest are faded out. */
  maxVisible?: number
  /** Show relative timestamps beside each item. */
  showTimestamps?: boolean
  /** Auto-scroll to newest items. */
  autoScroll?: boolean
  /** Callback when an item is clicked. */
  onItemClick?: (item: FeedItem) => void
  /** Message shown when items array is empty. */
  emptyMessage?: string
  className?: string
}

const TYPE_BORDER: Record<string, string> = {
  info: 'border-l-[hsl(var(--brand-secondary))]',
  success: 'border-l-[hsl(var(--status-ok))]',
  warning: 'border-l-[hsl(var(--status-warning))]',
  error: 'border-l-[hsl(var(--status-critical))]',
}

function relativeTime(ts: string | Date): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (diff < 5) return 'now'
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * @description A real-time event feed with animated item entry, auto-scroll,
 * pause/resume controls, type-colored borders, and relative timestamps.
 */
export function LiveFeed({
  items,
  maxVisible = 50,
  showTimestamps = true,
  autoScroll: autoScrollProp = true,
  onItemClick,
  emptyMessage = 'No events yet',
  className,
}: LiveFeedProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const prevCountRef = useRef(items.length)

  // Track new items arriving while scrolled away
  useEffect(() => {
    const diff = items.length - prevCountRef.current
    if (diff > 0 && (paused || userScrolled)) {
      setNewCount((c) => c + diff)
    }
    prevCountRef.current = items.length
  }, [items.length, paused, userScrolled])

  // Auto-scroll
  useEffect(() => {
    if (autoScrollProp && !paused && !userScrolled && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [items, autoScrollProp, paused, userScrolled])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop } = scrollRef.current
    // scrollTop is 0 at top (newest), positive when scrolled down (older)
    setUserScrolled(scrollTop > 40)
  }, [])

  const scrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
    setUserScrolled(false)
    setNewCount(0)
  }, [])

  const togglePause = useCallback(() => {
    setPaused((p) => {
      if (p) {
        setNewCount(0)
        setUserScrolled(false)
      }
      return !p
    })
  }, [])

  // Relative timestamp updater
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!showTimestamps) return
    const id = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(id)
  }, [showTimestamps])

  const visibleItems = items.slice(0, maxVisible)

  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Controls bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border-subtle))]">
        <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">
          {items.length} events
        </span>
        <button
          type="button"
          onClick={togglePause}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer',
            'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]',
            'hover:bg-[hsl(var(--bg-overlay))] transition-colors duration-150',
          )}
          aria-label={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Feed container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        aria-live="polite"
        aria-atomic="false"
      >
        {visibleItems.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[hsl(var(--text-tertiary))]">
            {emptyMessage}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visibleItems.map((item) => (
              <motion.div
                key={item.id}
                layout={!reduced}
                initial={reduced ? undefined : { opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={reduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
              >
                <div
                  role={onItemClick ? 'button' : undefined}
                  tabIndex={onItemClick ? 0 : undefined}
                  onClick={onItemClick ? () => onItemClick(item) : undefined}
                  onKeyDown={
                    onItemClick
                      ? (e) => { if (e.key === 'Enter' || e.key === ' ') onItemClick(item) }
                      : undefined
                  }
                  className={cn(
                    'flex items-start gap-3 px-3 py-2.5 border-l-2',
                    'border-b border-b-[hsl(var(--border-subtle))]',
                    TYPE_BORDER[item.type ?? 'info'],
                    onItemClick && 'cursor-pointer hover:bg-[hsl(var(--bg-surface))] transition-colors duration-100',
                  )}
                >
                  <div className="flex-1 min-w-0 text-sm text-[hsl(var(--text-primary))]">
                    {item.content}
                  </div>
                  {showTimestamps && (
                    <span
                      className="shrink-0 text-[10px] tabular-nums text-[hsl(var(--text-tertiary))] mt-0.5"
                      title={new Date(item.timestamp).toISOString()}
                    >
                      {relativeTime(item.timestamp)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* "N new items" floating badge */}
      <AnimatePresence>
        {newCount > 0 && (userScrolled || paused) && (
          <motion.button
            type="button"
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            onClick={scrollToTop}
            className={cn(
              'absolute top-12 left-1/2 -translate-x-1/2 z-10',
              'inline-flex items-center gap-1 px-3 py-1.5 rounded-full',
              'bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-on-brand))] text-xs font-medium',
              'shadow-lg cursor-pointer hover:brightness-110 transition-[filter] duration-100',
            )}
          >
            <ChevronUp className="size-3" />
            {newCount} new {newCount === 1 ? 'item' : 'items'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
