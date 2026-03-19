'use client'

import type React from 'react'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the CopyBlock component. */
export interface CopyBlockProps {
  /** The text content to display and copy. */
  content: string
  /** Language hint for styling/accessibility (e.g. "json", "bash", "sql"). */
  language?: string
  /** Show line numbers in the gutter. Default false. */
  showLineNumbers?: boolean
  /** Max height in pixels before collapsing with a "Show more" toggle. */
  maxHeight?: number
  /** Optional label displayed above the code block. */
  label?: string
  /** Additional class name for the root container. */
  className?: string
}

// ---------------------------------------------------------------------------
// CopyBlock
// ---------------------------------------------------------------------------

/**
 * @description A monospace code/text display block with one-click copy, animated feedback,
 * optional line numbers, collapsible overflow (show more/less), and dark-mode optimized styling.
 * Designed for displaying code snippets, CLI commands, config blocks, and JSON payloads.
 */
export function CopyBlock({
  content,
  language,
  showLineNumbers = false,
  maxHeight,
  label,
  className,
}: CopyBlockProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  const contentRef = useRef<HTMLPreElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])

  // Check if content exceeds maxHeight
  useEffect(() => {
    if (!maxHeight || !contentRef.current) return
    setNeedsCollapse(contentRef.current.scrollHeight > maxHeight)
  }, [content, maxHeight])

  const lines = useMemo(() => content.split('\n'), [content])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
      console.warn('Clipboard API not available')
    }
  }, [content])

  const shouldCollapse = maxHeight && needsCollapse && isCollapsed

  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden',
        'border border-[hsl(var(--border-subtle))]',
        'bg-[hsl(var(--bg-base))]',
        className,
      )}
    >
      {/* Header bar */}
      {(label || language) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border-subtle)/0.5)] bg-[hsl(var(--bg-surface)/0.3)]">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))]">
                {label}
              </span>
            )}
            {language && (
              <span className="inline-flex items-center rounded-md bg-[hsl(var(--bg-overlay)/0.5)] px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                {language}
              </span>
            )}
          </div>

          {/* Copy button (always visible in header) */}
          <button
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all',
              copied
                ? 'text-[hsl(var(--status-ok))] bg-[hsl(var(--status-ok)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))]',
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={prefersReducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={prefersReducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {/* Copy button for headerless blocks */}
      {!label && !language && (
        <button
          onClick={handleCopy}
          className={cn(
            'absolute top-2 right-2 z-10 rounded-md p-1.5 transition-all',
            'opacity-0 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100',
            copied
              ? 'text-[hsl(var(--status-ok))] bg-[hsl(var(--status-ok)/0.1)]'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] bg-[hsl(var(--bg-elevated)/0.8)] hover:bg-[hsl(var(--bg-elevated))]',
          )}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}

      {/* Content area */}
      <div
        className="overflow-x-auto"
        style={shouldCollapse ? { maxHeight, overflow: 'hidden' } : undefined}
      >
        <pre
          ref={contentRef}
          className={cn(
            'p-4 text-[13px] leading-relaxed font-mono',
            'text-[hsl(var(--text-primary))]',
            'whitespace-pre overflow-x-auto',
          )}
        >
          {showLineNumbers ? (
            <table className="border-collapse w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-[hsl(var(--bg-surface)/0.3)]">
                    <td className="select-none text-right pr-4 text-[hsl(var(--text-disabled))] text-[11px] tabular-nums w-8 align-top">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            content
          )}
        </pre>
      </div>

      {/* Collapse gradient + toggle */}
      {maxHeight && needsCollapse && (
        <>
          {isCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(var(--bg-base))] to-transparent pointer-events-none" />
          )}
          <div className="relative border-t border-[hsl(var(--border-subtle)/0.3)]">
            <button
              onClick={() => setIsCollapsed(c => !c)}
              className={cn(
                'w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium',
                'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]',
                'hover:bg-[hsl(var(--bg-surface)/0.3)] transition-colors',
              )}
            >
              {isCollapsed ? (
                <>
                  Show more ({lines.length} lines)
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Show less
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
