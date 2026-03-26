'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string
  content: ReactNode
  timestamp: number | Date
  type?: string
}

export interface LiveFeedProps extends HTMLAttributes<HTMLDivElement> {
  items: FeedItem[]
  maxItems?: number
  autoScroll?: boolean
  paused?: boolean
  onPause?: () => void
  onResume?: () => void
  connectionStatus?: 'connected' | 'reconnecting' | 'offline'
  height?: string
  emptyMessage?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const liveFeedStyles = css`
  @layer components {
    @scope (.ui-live-feed) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }

      /* Header with status */
      .ui-live-feed__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      /* Connection status indicator */
      .ui-live-feed__status {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-live-feed__status-dot {
        display: block;
        inline-size: 8px;
        block-size: 8px;
        border-radius: 50%;
      }

      [data-connection="connected"] .ui-live-feed__status-dot {
        background: var(--status-ok, oklch(72% 0.19 155));
      }
      [data-connection="reconnecting"] .ui-live-feed__status-dot {
        background: var(--status-warning, oklch(80% 0.18 85));
        animation: ui-live-feed-pulse 1.5s ease-in-out infinite;
      }
      [data-connection="offline"] .ui-live-feed__status-dot {
        background: var(--status-critical, oklch(62% 0.22 25));
      }

      :scope[data-motion="0"] [data-connection="reconnecting"] .ui-live-feed__status-dot {
        animation: none;
      }

      @keyframes ui-live-feed-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Scrollable area */
      .ui-live-feed__scroll {
        overflow-y: auto;
        flex: 1;
        scroll-behavior: smooth;
      }

      :scope[data-motion="0"] .ui-live-feed__scroll {
        scroll-behavior: auto;
      }

      /* Items list */
      .ui-live-feed__list {
        display: flex;
        flex-direction: column;
        padding: var(--space-2xs, 0.25rem) 0;
      }

      /* Individual item */
      .ui-live-feed__item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-xs, 0.375rem) var(--space-md, 1rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.03));
      }

      /* New item flash animation */
      :scope:not([data-motion="0"]) .ui-live-feed__item[data-new] {
        animation: ui-live-feed-flash 0.6s ease-out;
      }

      @keyframes ui-live-feed-flash {
        0% {
          background: oklch(65% 0.15 270 / 0.12);
        }
        100% {
          background: transparent;
        }
      }

      .ui-live-feed__item-content {
        flex: 1;
        min-inline-size: 0;
      }

      .ui-live-feed__timestamp {
        flex-shrink: 0;
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
      }

      /* Empty state */
      .ui-live-feed__empty {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl, 2rem) var(--space-md, 1rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* Pause indicator */
      .ui-live-feed__pause-badge {
        font-size: var(--text-xs, 0.75rem);
        padding: var(--space-3xs, 0.125rem) var(--space-xs, 0.375rem);
        border-radius: var(--radius-sm, 0.375rem);
        background: oklch(80% 0.18 85 / 0.15);
        color: oklch(80% 0.18 85);
        font-weight: 500;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-live-feed__status-dot {
          background: ButtonText;
        }
        [data-connection="connected"] .ui-live-feed__status-dot {
          background: Highlight;
        }
      }
    }
  }
`

// ─── Time formatter ─────────────────────────────────────────────────────────

function formatTime(ts: number | Date): string {
  const date = ts instanceof Date ? ts : new Date(ts)
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const connectionLabels = {
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
}

// ─── Component ──────────────────────────────────────────────────────────────

function LiveFeedInner({
  items,
  maxItems = 50,
  autoScroll = true,
  paused,
  onPause,
  onResume,
  connectionStatus,
  height,
  emptyMessage,
  motion: motionProp,
  className,
  ...rest
}: LiveFeedProps) {
  useStyles('live-feed', liveFeedStyles)
  const motionLevel = useMotionLevel(motionProp)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevItemCount = useRef(items.length)

  // Truncate to maxItems (keep latest)
  const visibleItems = useMemo(
    () => items.slice(-maxItems),
    [items, maxItems]
  )

  // Auto-scroll to bottom on new items
  useEffect(() => {
    if (autoScroll && !paused && scrollRef.current && items.length > prevItemCount.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    prevItemCount.current = items.length
  }, [items.length, autoScroll, paused])

  const showHeader = connectionStatus || paused

  return (
    <div
      className={cn('ui-live-feed', className)}
      data-motion={motionLevel}
      {...(paused && { 'data-paused': 'true' })}
      {...(connectionStatus && { 'data-connection': connectionStatus })}
      aria-live="polite"
      {...rest}
    >
      {showHeader && (
        <div className="ui-live-feed__header">
          {connectionStatus && (
            <div className="ui-live-feed__status">
              <span className="ui-live-feed__status-dot" aria-hidden="true" />
              <span>{connectionLabels[connectionStatus]}</span>
            </div>
          )}
          {paused && (
            <span className="ui-live-feed__pause-badge">Paused</span>
          )}
        </div>
      )}

      <div
        className="ui-live-feed__scroll"
        ref={scrollRef}
        style={height ? { blockSize: height } : undefined}
      >
        {visibleItems.length === 0 ? (
          <div className="ui-live-feed__empty">
            {emptyMessage || 'No events'}
          </div>
        ) : (
          <div className="ui-live-feed__list">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="ui-live-feed__item"
                {...(item.type && { 'data-type': item.type })}
              >
                <div className="ui-live-feed__item-content">{item.content}</div>
                <span className="ui-live-feed__timestamp">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function LiveFeed(props: LiveFeedProps) {
  return (
    <ComponentErrorBoundary>
      <LiveFeedInner {...props} />
    </ComponentErrorBoundary>
  )
}

LiveFeed.displayName = 'LiveFeed'
