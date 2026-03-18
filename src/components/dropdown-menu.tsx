'use client'

import { type ReactNode } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils'

/** A single menu item definition. */
export interface MenuItem {
  /** Display label. */
  label: string
  /** Optional icon component. */
  icon?: LucideIcon
  /** Callback when item is clicked. */
  onClick: () => void
  /** Visual variant — danger for destructive actions. */
  variant?: 'default' | 'danger'
  /** Whether this item is disabled. */
  disabled?: boolean
}

export interface DropdownMenuProps {
  /** Trigger element that opens the menu. */
  trigger: ReactNode
  /** Array of menu item definitions. */
  items: MenuItem[]
  /** Alignment of the menu relative to the trigger. */
  align?: 'start' | 'center' | 'end'
  /** Additional class name for the content container. */
  className?: string
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
}

/**
 * @description A context/action dropdown menu built on Radix DropdownMenu.
 * Features Framer Motion entry/exit animations, keyboard accessibility,
 * and a danger variant for destructive actions.
 */
export function DropdownMenu({ trigger, items, align = 'end', className }: DropdownMenuProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align={align}
            sideOffset={6}
            asChild
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'z-50 min-w-[160px] overflow-hidden rounded-xl p-1',
                'border border-[hsl(var(--border-default))]',
                'bg-[hsl(var(--bg-elevated))] shadow-xl',
                'focus:outline-none',
                className,
              )}
            >
              {items.map((item, i) => {
                const Icon = item.icon
                const isDanger = item.variant === 'danger'

                return (
                  <DropdownMenuPrimitive.Item
                    key={i}
                    disabled={item.disabled}
                    onSelect={item.onClick}
                    className={cn(
                      'relative flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg',
                      'outline-none cursor-pointer select-none transition-colors duration-100',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                      isDanger
                        ? 'text-[hsl(var(--status-critical))] data-[highlighted]:bg-[hsl(var(--status-critical)/0.1)]'
                        : 'text-[hsl(var(--text-primary))] data-[highlighted]:bg-[hsl(var(--bg-overlay))]',
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isDanger
                            ? 'text-[hsl(var(--status-critical))]'
                            : 'text-[hsl(var(--text-secondary))]',
                        )}
                      />
                    )}
                    {item.label}
                  </DropdownMenuPrimitive.Item>
                )
              })}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  )
}
