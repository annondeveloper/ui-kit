'use client'

import { type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../utils'

export interface TooltipProps {
  /** Tooltip content (can be text or ReactNode). */
  content: ReactNode
  /** Trigger element. */
  children: ReactNode
  /** Side of the trigger to display the tooltip. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Delay in milliseconds before the tooltip appears. */
  delay?: number
  /** Additional class name for the tooltip content. */
  className?: string
}

/**
 * @description A simple tooltip wrapper built on Radix Tooltip.
 * Theme-styled content with arrow pointer and configurable delay.
 * Requires a TooltipProvider ancestor (included by default).
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 px-3 py-1.5 rounded-lg text-xs font-medium',
              'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))]',
              'border border-[hsl(var(--border-default))] shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow
              className="fill-[hsl(var(--bg-elevated))]"
              width={10}
              height={5}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
