'use client'

import { useRef, useState, useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Copy, Check } from 'lucide-react'

export interface TruncatedTextProps {
  /** The full text to display (truncated if it overflows). */
  text: string
  /** Max width constraint for truncation. */
  maxWidth?: string | number
  className?: string
}

/**
 * @description A text element that truncates with ellipsis and shows a tooltip with the
 * full text on hover when truncated. Includes a copy-to-clipboard button in the tooltip.
 */
export function TruncatedText({ text, maxWidth = '100%', className = '' }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth)
  }, [text])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const inner = (
    <span
      ref={ref}
      className={`block truncate ${className}`}
      style={{ maxWidth }}
    >
      {text}
    </span>
  )

  if (!isTruncated) return inner

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{inner}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="start"
            sideOffset={6}
            className="z-50 max-w-[400px] rounded-lg border border-[hsl(var(--border-default))]
              bg-[hsl(var(--bg-elevated))] px-3 py-2 shadow-lg
              animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <p className="text-small text-[hsl(var(--text-primary))] break-all">{text}</p>
            <div className="mt-1.5 flex justify-end">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded px-2 py-0.5
                  text-[11px] text-[hsl(var(--brand-primary))]
                  hover:bg-[hsl(var(--bg-surface))] transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <Tooltip.Arrow className="fill-[hsl(var(--bg-elevated))]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
