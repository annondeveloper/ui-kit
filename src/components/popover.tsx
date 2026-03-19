'use client'

import type React from 'react'
import { type ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface PopoverProps {
  /** Trigger element that opens the popover. */
  trigger: ReactNode
  /** Popover content. */
  children: ReactNode
  /** Side of the trigger to display the popover. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment of the popover relative to the trigger. */
  align?: 'start' | 'center' | 'end'
  /** Additional class name for the content container. */
  className?: string
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -2 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -2 },
}

/**
 * @description A popover wrapper built on Radix Popover with Framer Motion entry animation.
 * Closes on outside click. Includes an arrow pointer.
 */
export function Popover({ trigger, children, side = 'bottom', align = 'center', className }: PopoverProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>

      <AnimatePresence>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={side}
            align={align}
            sideOffset={8}
            collisionPadding={16}
            asChild
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'z-50 rounded-xl p-4',
                'border border-[hsl(var(--border-default))]',
                'bg-[hsl(var(--bg-elevated))] shadow-xl',
                'focus:outline-none',
                className,
              )}
            >
              {children}
              <PopoverPrimitive.Arrow
                className="fill-[hsl(var(--bg-elevated))]"
                width={12}
                height={6}
              />
            </motion.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </AnimatePresence>
    </PopoverPrimitive.Root>
  )
}
