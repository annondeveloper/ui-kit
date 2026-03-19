'use client'

import type React from 'react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowUp, Loader2 } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the InfiniteScroll component. */
export interface InfiniteScrollProps<T> {
  /** Array of loaded items. */
  items: T[]
  /** Render function for each item. */
  renderItem: (item: T, index: number) => React.JSX.Element
  /** Called when more items should be loaded. */
  loadMore: () => void | Promise<void>
  /** Whether more items are available. */
  hasMore: boolean
  /** Whether a load operation is in progress. */
  isLoading?: boolean
  /** Pixels from bottom to trigger loadMore. Default 200. */
  threshold?: number
  /** Fixed item height for virtualization. If omitted, all items render (no virtualization). */
  itemHeight?: number
  /** Content to display when items array is empty. */
  emptyState?: React.ReactNode
  /** Function to derive a stable key for each item. Falls back to index. */
  getItemKey?: (item: T, index: number) => string | number
  /** Additional class name for the scroll container. */
  className?: string
}

// ---------------------------------------------------------------------------
// InfiniteScroll
// ---------------------------------------------------------------------------

/**
 * @description A virtualized infinite-scroll list using IntersectionObserver.
 * Supports optional height-based virtualization, loading indicators, scroll-to-top,
 * empty states, and skeleton placeholders. No scroll event listeners used.
 */
export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading = false,
  threshold = 200,
  itemHeight,
  getItemKey,
  emptyState,
  className,
}: InfiniteScrollProps<T>): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const loadingRef = useRef(false)
  const loadMoreRef = useRef(loadMore)
  useEffect(() => { loadMoreRef.current = loadMore }, [loadMore])

  // IntersectionObserver for infinite load trigger
  // Re-create observer when items.length changes so sentinel re-enters viewport detection
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !loadingRef.current) {
          loadingRef.current = true
          const result = loadMoreRef.current()
          if (result && typeof result.then === 'function') {
            result.then(() => { loadingRef.current = false }).catch(() => { loadingRef.current = false })
          } else {
            loadingRef.current = false
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, threshold, items.length])

  // Update loadingRef when isLoading changes
  useEffect(() => {
    if (!isLoading) loadingRef.current = false
  }, [isLoading])

  // Scroll position tracking for scroll-to-top button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handler = () => {
      setShowScrollTop(container.scrollTop > 400)
    }
    container.addEventListener('scroll', handler, { passive: true })
    return () => container.removeEventListener('scroll', handler)
  }, [])

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' })
  }, [prefersReducedMotion])

  // Virtualization
  const [scrollTop, setScrollTop] = useState(0)
  const containerHeight = useRef(0)

  useEffect(() => {
    if (!itemHeight) return
    const container = containerRef.current
    if (!container) return

    containerHeight.current = container.clientHeight
    const handler = () => {
      setScrollTop(container.scrollTop)
      containerHeight.current = container.clientHeight
    }
    container.addEventListener('scroll', handler, { passive: true })
    return () => container.removeEventListener('scroll', handler)
  }, [itemHeight])

  const virtualizedContent = useMemo(() => {
    if (!itemHeight) return null

    const visibleHeight = containerHeight.current || 600
    const buffer = 5
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIdx = Math.min(
      items.length,
      Math.ceil((scrollTop + visibleHeight) / itemHeight) + buffer,
    )

    const totalHeight = items.length * itemHeight
    const offsetTop = startIdx * itemHeight

    return {
      totalHeight,
      offsetTop,
      visibleItems: items.slice(startIdx, endIdx),
      startIdx,
    }
  }, [items, itemHeight, scrollTop])

  // Empty state
  if (items.length === 0 && !isLoading && !hasMore) {
    return (
      <div className={cn('flex items-center justify-center min-h-[200px]', className)}>
        {emptyState ?? (
          <div className="text-center py-12">
            <p className="text-sm text-[hsl(var(--text-tertiary))]">No items to display.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
    >
      {/* Virtualized rendering */}
      {virtualizedContent ? (
        <div style={{ height: virtualizedContent.totalHeight, position: 'relative' }}>
          <div style={{ position: 'absolute', top: virtualizedContent.offsetTop, left: 0, right: 0 }}>
            {virtualizedContent.visibleItems.map((item, i) => (
              <div key={virtualizedContent.startIdx + i} style={{ height: itemHeight }}>
                {renderItem(item, virtualizedContent.startIdx + i)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Non-virtualized rendering */
        items.map((item, index) => (
          <div key={getItemKey ? getItemKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        ))
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="h-5 w-5 text-[hsl(var(--brand-primary))] animate-spin" />
          <span className="text-sm text-[hsl(var(--text-tertiary))]">Loading more...</span>
        </div>
      )}

      {/* Skeleton placeholders while loading with no items yet */}
      {isLoading && items.length === 0 && (
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
          ))}
        </div>
      )}

      {/* No more items */}
      {!hasMore && items.length > 0 && (
        <div className="py-4 text-center">
          <span className="text-[11px] text-[hsl(var(--text-tertiary))]">
            All {items.length} item{items.length !== 1 ? 's' : ''} loaded
          </span>
        </div>
      )}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToTop}
            className={cn(
              'sticky bottom-4 left-1/2 -translate-x-1/2 z-10',
              'inline-flex items-center gap-1.5 rounded-full',
              'px-3 py-2 text-[11px] font-medium',
              'bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-secondary))] shadow-lg',
              'hover:bg-[hsl(var(--bg-overlay))] hover:text-[hsl(var(--text-primary))] transition-colors',
              'cursor-pointer',
            )}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Back to top
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
