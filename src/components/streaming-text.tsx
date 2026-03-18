'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'
import { Copy, Check } from 'lucide-react'

export interface StreamingTextProps {
  /** The text content — grows as tokens arrive. */
  text: string
  /** Whether tokens are still arriving. */
  isStreaming: boolean
  /** Cursor blink speed in ms. */
  speed?: number
  /** Show a blinking cursor at the end while streaming. */
  showCursor?: boolean
  /** Called when isStreaming transitions from true to false. */
  onComplete?: () => void
  className?: string
}

/** Simple inline formatter: **bold** and `code` spans. */
function formatSegments(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      segments.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      segments.push(
        <code
          key={match.index}
          className="rounded px-1 py-0.5 text-[0.875em] bg-[hsl(var(--bg-overlay))] text-[hsl(var(--brand-primary))] font-mono"
        >
          {match[3]}
        </code>
      )
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex))
  }

  return segments
}

/**
 * @description Displays AI/LLM streaming text responses with a blinking cursor,
 * markdown-like formatting (bold, code), copy button on completion, and auto-scroll.
 */
export function StreamingText({
  text,
  isStreaming,
  speed = 500,
  showCursor = true,
  onComplete,
  className,
}: StreamingTextProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevStreamingRef = useRef(isStreaming)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      onComplete?.()
    }
    prevStreamingRef.current = isStreaming
  }, [isStreaming, onComplete])

  useEffect(() => {
    if (isStreaming && containerRef.current) {
      const el = containerRef.current
      el.scrollTop = el.scrollHeight
    }
  }, [text, isStreaming])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  const formatted = formatSegments(text)

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="overflow-y-auto text-[hsl(var(--text-primary))] leading-relaxed whitespace-pre-wrap break-words"
      >
        {formatted}
        {showCursor && isStreaming && (
          <span
            className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5 bg-[hsl(var(--brand-primary))]"
            style={
              reduced
                ? { opacity: 1 }
                : {
                    animation: `streaming-cursor-blink ${speed}ms step-end infinite`,
                  }
            }
            aria-hidden="true"
          />
        )}
        <AnimatePresence>
          {showCursor && !isStreaming && text.length > 0 && (
            <motion.span
              className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5 bg-[hsl(var(--brand-primary))]"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!isStreaming && text.length > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={handleCopy}
            className={cn(
              'absolute top-0 right-0 p-1.5 rounded-lg',
              'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]',
              'bg-[hsl(var(--bg-surface))]/80 hover:bg-[hsl(var(--bg-elevated))]',
              'transition-colors duration-150 cursor-pointer',
            )}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  )
}
