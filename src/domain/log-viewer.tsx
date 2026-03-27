'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LogLine {
  id: string | number
  timestamp?: number | Date
  level?: 'debug' | 'info' | 'warn' | 'error'
  message: string
}

export interface LogViewerProps extends HTMLAttributes<HTMLDivElement> {
  lines: LogLine[]
  maxLines?: number
  autoTail?: boolean
  showTimestamp?: boolean
  showLevel?: boolean
  search?: string
  filterLevel?: string[]
  wrap?: boolean
  height?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const logViewerStyles = css`
  @layer components {
    @scope (.ui-log-viewer) {
      :scope {
        position: relative;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        background: var(--bg-surface, oklch(18% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        overflow: auto;
      }

      .ui-log-viewer__scroll {
        overflow: auto;
        position: relative;
      }

      .ui-log-viewer__virtual-spacer {
        pointer-events: none;
      }

      .ui-log-viewer__line {
        display: flex;
        gap: var(--space-sm, 0.5rem);
        padding-inline: var(--space-sm, 0.5rem);
        padding-block: 1px;
        min-block-size: 1.5em;
        align-items: baseline;
      }

      :scope:not([data-wrap="true"]) .ui-log-viewer__line {
        white-space: nowrap;
      }

      :scope[data-wrap="true"] .ui-log-viewer__line {
        white-space: pre-wrap;
        word-break: break-all;
      }

      .ui-log-viewer__line:hover {
        background: var(--bg-hover);
      }

      /* Timestamp */
      .ui-log-viewer__timestamp {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-variant-numeric: tabular-nums;
        user-select: none;
      }

      /* Level */
      .ui-log-viewer__level {
        flex-shrink: 0;
        inline-size: 3.5em;
        text-transform: uppercase;
        font-weight: 600;
        font-size: 0.75em;
        letter-spacing: 0.05em;
        user-select: none;
      }

      .ui-log-viewer__level[data-level="debug"] { color: oklch(60% 0 0); }
      .ui-log-viewer__level[data-level="info"]  { color: oklch(65% 0.15 270); }
      .ui-log-viewer__level[data-level="warn"]  { color: oklch(80% 0.18 85); }
      .ui-log-viewer__level[data-level="error"] { color: oklch(62% 0.22 25); }

      /* Message */
      .ui-log-viewer__message {
        color: var(--text-primary, oklch(85% 0 0));
        min-inline-size: 0;
      }

      /* Error lines get subtle bg */
      .ui-log-viewer__line[data-line-level="error"] {
        background: oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.06);
      }
      .ui-log-viewer__line[data-line-level="warn"] {
        background: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.04);
      }

      /* Search highlight */
      mark {
        background: oklch(80% 0.18 85 / 0.3);
        color: inherit;
        border-radius: 2px;
        padding-inline: 1px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        mark {
          background: Highlight;
          color: HighlightText;
        }
        .ui-log-viewer__level {
          color: CanvasText;
        }
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, search: string): ReactNode {
  if (!search) return text
  try {
    const regex = new RegExp(`(${escapeRegex(search)})`, 'gi')
    const parts = text.split(regex)
    if (parts.length === 1) return text
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    )
  } catch {
    return text
  }
}

// ─── Virtual scroll constants ────────────────────────────────────────────────

const LINE_HEIGHT = 21 // approx height of one line in px
const OVERSCAN = 10

// ─── Component ──────────────────────────────────────────────────────────────

function LogViewerInner({
  lines,
  maxLines,
  autoTail = false,
  showTimestamp = false,
  showLevel = false,
  search,
  filterLevel,
  wrap = false,
  height,
  motion: motionProp,
  className,
  ...rest
}: LogViewerProps) {
  useStyles('log-viewer', logViewerStyles)
  const motionLevel = useMotionLevel(motionProp)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // Filter lines
  const filteredLines = useMemo(() => {
    let result = lines
    if (filterLevel && filterLevel.length > 0) {
      result = result.filter(l => l.level && filterLevel.includes(l.level))
    }
    if (maxLines !== undefined) {
      result = result.slice(-maxLines)
    }
    return result
  }, [lines, filterLevel, maxLines])

  // Auto-tail
  const prevLineCount = useRef(filteredLines.length)
  useEffect(() => {
    if (autoTail && scrollRef.current && filteredLines.length > prevLineCount.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    prevLineCount.current = filteredLines.length
  }, [filteredLines.length, autoTail])

  // Virtual scroll calculation
  const containerHeight = height ? parseInt(height, 10) || 300 : undefined
  const useVirtual = containerHeight !== undefined && filteredLines.length > 100

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop)
    }
  }, [])

  const totalHeight = useVirtual ? filteredLines.length * LINE_HEIGHT : undefined
  const startIndex = useVirtual ? Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - OVERSCAN) : 0
  const visibleCount = useVirtual
    ? Math.min(filteredLines.length - startIndex, Math.ceil((containerHeight!) / LINE_HEIGHT) + OVERSCAN * 2)
    : filteredLines.length
  const endIndex = startIndex + visibleCount

  const visibleLines = useVirtual ? filteredLines.slice(startIndex, endIndex) : filteredLines

  return (
    <div
      className={cn('ui-log-viewer', className)}
      data-motion={motionLevel}
      {...(wrap && { 'data-wrap': 'true' })}
      role="log"
      aria-live={autoTail ? 'polite' : undefined}
      {...rest}
    >
      <div
        ref={scrollRef}
        className="ui-log-viewer__scroll"
        style={{
          ...(height && { height, blockSize: height }),
        }}
        onScroll={useVirtual ? handleScroll : undefined}
      >
        {useVirtual && (
          <div
            className="ui-log-viewer__virtual-spacer"
            style={{ height: `${totalHeight}px` }}
          />
        )}

        <div style={useVirtual ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${startIndex * LINE_HEIGHT}px)`,
        } : undefined}>
          {visibleLines.map(line => (
            <div
              key={line.id}
              className="ui-log-viewer__line"
              data-line-level={line.level}
            >
              {showTimestamp && line.timestamp && (
                <span className="ui-log-viewer__timestamp">
                  {formatTimestamp(line.timestamp)}
                </span>
              )}
              {showLevel && line.level && (
                <span className="ui-log-viewer__level" data-level={line.level}>
                  {line.level}
                </span>
              )}
              <span className="ui-log-viewer__message">
                {search ? highlightText(line.message, search) : line.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LogViewer(props: LogViewerProps) {
  return (
    <ComponentErrorBoundary>
      <LogViewerInner {...props} />
    </ComponentErrorBoundary>
  )
}

LogViewer.displayName = 'LogViewer'
