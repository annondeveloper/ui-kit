'use client'

import {
  useRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  onLoadMore: () => void | Promise<void>
  hasMore: boolean
  loading?: boolean
  threshold?: number
  loader?: ReactNode
  endMessage?: ReactNode
  direction?: 'down' | 'up'
  pullToRefresh?: boolean
  onRefresh?: () => void | Promise<void>
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const infiniteScrollStyles = css`
  @layer components {
    @scope (.ui-infinite-scroll) {
      :scope {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        position: relative;
      }

      :scope[data-direction="up"] {
        flex-direction: column;
      }

      .ui-infinite-scroll__content {
        display: flex;
        flex-direction: column;
      }

      /* ── Sentinel ──────────────────────────────────────── */

      .ui-infinite-scroll__sentinel {
        block-size: 1px;
        inline-size: 100%;
        pointer-events: none;
        flex-shrink: 0;
      }

      /* ── Loader ────────────────────────────────────────── */

      .ui-infinite-scroll__loader {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md, 1rem);
      }

      .ui-infinite-scroll__spinner {
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-block-start-color: var(--brand, oklch(65% 0.2 270));
        border-radius: var(--radius-full, 9999px);
        animation: ui-infinite-scroll-spin 0.7s linear infinite;
      }

      /* ── End message ───────────────────────────────────── */

      .ui-infinite-scroll__end {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md, 1rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* ── Pull to refresh ───────────────────────────────── */

      .ui-infinite-scroll__pull-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: 0;
        overflow: hidden;
        transition: block-size 0.2s var(--ease-out, ease-out);
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-infinite-scroll__pull-indicator[data-pulling="true"] {
        block-size: 3rem;
      }

      /* ── Live region ───────────────────────────────────── */

      .ui-infinite-scroll__status {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-infinite-scroll__spinner {
          border-color: ButtonText;
          border-block-start-color: Highlight;
        }
      }

      /* ── Print ─────────────────────────────────────────── */

      @media print {
        .ui-infinite-scroll__loader,
        .ui-infinite-scroll__sentinel,
        .ui-infinite-scroll__pull-indicator {
          display: none;
        }
      }
    }

    @keyframes ui-infinite-scroll-spin {
      to { transform: rotate(360deg); }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 200,
  loader,
  endMessage,
  direction = 'down',
  pullToRefresh = false,
  onRefresh,
  children,
  className,
  ...rest
}: InfiniteScrollProps) {
  useStyles('infinite-scroll', infiniteScrollStyles)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Keep loadingRef in sync to prevent duplicate calls
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && !loadingRef.current) {
        loadingRef.current = true
        onLoadMore()
      }
    },
    [onLoadMore]
  )

  useEffect(() => {
    if (!hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `${threshold}px`,
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, threshold, handleIntersect])

  const sentinelEl = hasMore ? (
    <div
      ref={sentinelRef}
      className="ui-infinite-scroll__sentinel"
      aria-hidden="true"
    />
  ) : null

  const loaderEl = loading ? (
    <div className="ui-infinite-scroll__loader">
      {loader ?? <div className="ui-infinite-scroll__spinner" />}
    </div>
  ) : null

  const endEl = !hasMore && endMessage ? (
    <div className="ui-infinite-scroll__end">{endMessage}</div>
  ) : null

  const pullIndicator = pullToRefresh && onRefresh ? (
    <div className="ui-infinite-scroll__pull-indicator">
      Pull to refresh
    </div>
  ) : null

  return (
    <div
      className={cn('ui-infinite-scroll', className)}
      data-direction={direction}
      {...rest}
    >
      <div className="ui-infinite-scroll__status" aria-live="polite">
        {loading ? 'Loading more items...' : ''}
      </div>

      {pullIndicator}

      {direction === 'up' && sentinelEl}
      {direction === 'up' && loaderEl}

      <div className="ui-infinite-scroll__content">
        {children}
      </div>

      {direction === 'down' && loaderEl}
      {direction === 'down' && sentinelEl}
      {endEl}
    </div>
  )
}

InfiniteScroll.displayName = 'InfiniteScroll'
