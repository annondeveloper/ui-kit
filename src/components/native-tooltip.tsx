'use client'

import type React from 'react'
import { useId, useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '../utils'
import { Tooltip } from './tooltip'

export interface NativeTooltipProps {
  /** Tooltip content (text or ReactNode). */
  content: string | React.ReactNode
  /** Trigger element. */
  children: React.ReactNode
  /** Side of the trigger to display the tooltip. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Delay in milliseconds before showing. Only used in JS fallback. */
  delay?: number
  /** Additional class names on the tooltip content. */
  className?: string
}

/** Check if the browser supports the Popover API. */
function supportsPopover(): boolean {
  if (typeof HTMLElement === 'undefined') return false
  return 'popover' in HTMLElement.prototype
}

/** Check if the browser supports `interesttarget` (popover="hint" triggers). */
function supportsInterestTarget(): boolean {
  if (typeof HTMLButtonElement === 'undefined') return false
  return 'interestTargetElement' in HTMLButtonElement.prototype
}

const anchorOffsets: Record<string, React.CSSProperties> = {
  top: { bottom: 'calc(anchor(top) + 6px)', left: 'anchor(center)', translate: '-50% 0' },
  bottom: { top: 'calc(anchor(bottom) + 6px)', left: 'anchor(center)', translate: '-50% 0' },
  left: { right: 'calc(anchor(left) + 6px)', top: 'anchor(center)', translate: '0 -50%' },
  right: { left: 'calc(anchor(right) + 6px)', top: 'anchor(center)', translate: '0 -50%' },
}

/**
 * @description A tooltip that uses the native HTML Popover API (`popover="hint"` + `interesttarget`)
 * for zero-JS hover tooltips in supported browsers. Falls back to the Radix-based Tooltip component
 * in older browsers. Styled identically with theme tokens.
 */
export function NativeTooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  className,
}: NativeTooltipProps): React.JSX.Element {
  const id = useId()
  const popoverId = `ntt-${id.replace(/:/g, '')}`
  const anchorName = `--anchor-${popoverId}`
  const [useNative, setUseNative] = useState(false)

  // Detect support on mount (SSR safe)
  useEffect(() => {
    setUseNative(supportsPopover() && supportsInterestTarget())
  }, [])

  // Fallback: use existing Radix tooltip
  if (!useNative) {
    return (
      <Tooltip content={content} side={side} delay={delay} className={className}>
        {children}
      </Tooltip>
    )
  }

  // Native popover path
  const tooltipStyles: React.CSSProperties = {
    position: 'fixed' as const,
    positionAnchor: anchorName,
    ...anchorOffsets[side],
    margin: 0,
  }

  return (
    <>
      {/* Trigger with anchor name and interest target */}
      <span
        style={{ anchorName } as React.CSSProperties}
        {...{ interesttarget: popoverId } as Record<string, string>}
      >
        {children}
      </span>

      {/* Tooltip content using popover="hint" */}
      <div
        id={popoverId}
        {...{ popover: 'hint' } as Record<string, string>}
        style={tooltipStyles}
        className={cn(
          'z-50 px-3 py-1.5 rounded-lg text-xs font-medium',
          'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))]',
          'border border-[hsl(var(--border-default))] shadow-lg',
          // Popover animation via CSS
          'opacity-0 transition-[opacity,transform] duration-150',
          '[:popover-open>&]:opacity-100',
          className,
        )}
      >
        {content}
      </div>
    </>
  )
}
