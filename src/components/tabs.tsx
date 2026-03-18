'use client'

import { useCallback, useRef, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils'

/** A single tab definition. */
export interface Tab {
  /** Unique value for this tab. */
  value: string
  /** Display label. */
  label: string
  /** Optional icon component. */
  icon?: LucideIcon
  /** Whether this tab is disabled. */
  disabled?: boolean
}

export interface TabsProps {
  /** Array of tab definitions. */
  tabs: Tab[]
  /** Currently selected tab value. */
  value: string
  /** Callback when a tab is selected. */
  onChange: (value: string) => void
  /** Visual variant. */
  variant?: 'underline' | 'pills' | 'enclosed'
  /** Size preset. */
  size?: 'sm' | 'md'
  /** Additional class name for the root element. */
  className?: string
}

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
} as const

/**
 * @description Accessible tabbed interface with three visual variants.
 * Uses Framer Motion layoutId for animated indicator sliding between tabs.
 * Supports keyboard navigation (arrow keys) and ARIA roles.
 */
export function Tabs({
  tabs,
  value,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
}: TabsProps) {
  const prefersReducedMotion = useReducedMotion()
  const tabListRef = useRef<HTMLDivElement>(null)

  const enabledTabs = tabs.filter((t) => !t.disabled)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIdx = enabledTabs.findIndex((t) => t.value === value)
      if (currentIdx === -1) return

      let nextIdx: number | null = null

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIdx = (currentIdx + 1) % enabledTabs.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIdx = (currentIdx - 1 + enabledTabs.length) % enabledTabs.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        nextIdx = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIdx = enabledTabs.length - 1
      }

      if (nextIdx !== null) {
        onChange(enabledTabs[nextIdx].value)
        const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
        buttons?.[nextIdx]?.focus()
      }
    },
    [enabledTabs, value, onChange],
  )

  const listCls = cn(
    'inline-flex items-center',
    variant === 'underline' && 'border-b border-[hsl(var(--border-subtle))] gap-0',
    variant === 'pills' && 'gap-1 p-1 rounded-xl bg-[hsl(var(--bg-surface))]',
    variant === 'enclosed' && 'gap-0 border-b border-[hsl(var(--border-subtle))]',
    className,
  )

  const layoutId = `tabs-indicator-${variant}`

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={listCls}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value
        const Icon = tab.icon

        const buttonCls = cn(
          'relative inline-flex items-center justify-center font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--bg-base))]',
          'disabled:pointer-events-none disabled:opacity-40',
          'cursor-pointer select-none whitespace-nowrap',
          sizeClasses[size],
          // variant-specific active/inactive
          variant === 'underline' && [
            isActive
              ? 'text-[hsl(var(--text-primary))]'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]',
          ],
          variant === 'pills' && [
            isActive
              ? 'text-[hsl(var(--text-primary))]'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated)/0.5)]',
            'rounded-lg',
          ],
          variant === 'enclosed' && [
            isActive
              ? 'text-[hsl(var(--text-primary))] bg-[hsl(var(--bg-elevated))]'
              : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]',
            'rounded-t-lg',
          ],
        )

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.value}`}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={buttonCls}
          >
            {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
            {tab.label}

            {/* Animated indicator */}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--brand-primary))] rounded-full"
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {isActive && variant === 'pills' && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-[hsl(var(--bg-elevated))] -z-10"
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {isActive && variant === 'enclosed' && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--brand-primary))] rounded-full"
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
