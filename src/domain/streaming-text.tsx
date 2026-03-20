'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StreamingTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  streaming?: boolean
  showCursor?: boolean
  speed?: number
  onComplete?: () => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const streamingTextStyles = css`
  @layer components {
    @scope (.ui-streaming-text) {
      :scope {
        position: relative;
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-streaming-text__content {
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* Code blocks */
      .ui-streaming-text__code-block {
        display: block;
        margin-block: var(--space-sm, 0.5rem);
        padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-inset, oklch(15% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        overflow-x: auto;
        white-space: pre;
        color: var(--text-secondary, oklch(80% 0 0));
      }

      .ui-streaming-text__code-lang {
        display: block;
        margin-block-end: var(--space-2xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Cursor */
      .ui-streaming-text__cursor {
        display: inline-block;
        inline-size: 2px;
        block-size: 1.1em;
        vertical-align: text-bottom;
        background: var(--accent, oklch(65% 0.2 270));
        border-radius: 1px;
        margin-inline-start: 1px;
      }

      :scope:not([data-motion="0"]) .ui-streaming-text__cursor {
        animation: ui-streaming-cursor-blink 1s step-end infinite;
      }

      .ui-streaming-text__cursor[data-fading="true"] {
        animation: ui-streaming-cursor-fade 0.3s ease-out forwards;
      }

      :scope[data-motion="0"] .ui-streaming-text__cursor {
        animation: none;
      }

      @keyframes ui-streaming-cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes ui-streaming-cursor-fade {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-streaming-text__code-block {
          border: 1px solid ButtonText;
        }
        .ui-streaming-text__cursor {
          background: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-streaming-text__cursor {
          display: none;
        }
      }
    }
  }
`

// ─── Text parser ────────────────────────────────────────────────────────────

interface TextSegment {
  type: 'text' | 'code'
  content: string
  language?: string
}

function parseText(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    // Code block
    segments.push({
      type: 'code',
      content: match[2],
      language: match[1] || undefined,
    })
    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  // If no segments, return single text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text })
  }

  return segments
}

// ─── Component ──────────────────────────────────────────────────────────────

function StreamingTextInner({
  text,
  streaming,
  showCursor,
  speed,
  onComplete,
  motion: motionProp,
  className,
  ...rest
}: StreamingTextProps) {
  useStyles('streaming-text', streamingTextStyles)
  const motionLevel = useMotionLevel(motionProp)

  // Track whether was previously streaming (for onComplete and cursor fade)
  const wasStreaming = useRef(false)
  const [cursorFading, setCursorFading] = useState(false)

  // Speed-based typewriter reveal
  const [revealedCount, setRevealedCount] = useState(speed ? 0 : text.length)
  const frameRef = useRef<number | null>(null)

  // Determine cursor visibility
  const shouldShowCursor = showCursor !== undefined
    ? showCursor
    : streaming === true

  useEffect(() => {
    if (streaming) {
      wasStreaming.current = true
      setCursorFading(false)
    } else if (wasStreaming.current) {
      // Streaming just ended
      wasStreaming.current = false
      setCursorFading(true)
      onComplete?.()

      // Remove cursor after fade
      const timer = setTimeout(() => setCursorFading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [streaming, onComplete])

  // Typewriter effect
  useEffect(() => {
    if (!speed) {
      setRevealedCount(text.length)
      return
    }

    // Reset if text changes with speed
    let count = revealedCount
    if (count > text.length) {
      count = text.length
      setRevealedCount(count)
      return
    }

    const advance = () => {
      count = Math.min(count + speed, text.length)
      setRevealedCount(count)
      if (count < text.length) {
        frameRef.current = requestAnimationFrame(advance)
      }
    }

    if (count < text.length) {
      frameRef.current = requestAnimationFrame(advance)
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [text, speed]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayText = speed ? text.slice(0, revealedCount) : text
  const segments = useMemo(() => parseText(displayText), [displayText])

  const renderSegments = (segs: TextSegment[]): ReactNode[] =>
    segs.map((seg, i) => {
      if (seg.type === 'code') {
        return (
          <code key={i} className="ui-streaming-text__code-block">
            {seg.language && (
              <span className="ui-streaming-text__code-lang">{seg.language}</span>
            )}
            {seg.content}
          </code>
        )
      }
      return <span key={i}>{seg.content}</span>
    })

  return (
    <div
      className={cn('ui-streaming-text', className)}
      data-motion={motionLevel}
      aria-live="polite"
      aria-busy={streaming || undefined}
      {...rest}
    >
      <div className="ui-streaming-text__content">
        {renderSegments(segments)}
        {(shouldShowCursor || cursorFading) && (
          <span
            className="ui-streaming-text__cursor"
            aria-hidden="true"
            {...(cursorFading && { 'data-fading': 'true' })}
          />
        )}
      </div>
    </div>
  )
}

export function StreamingText(props: StreamingTextProps) {
  return (
    <ComponentErrorBoundary>
      <StreamingTextInner {...props} />
    </ComponentErrorBoundary>
  )
}

StreamingText.displayName = 'StreamingText'
