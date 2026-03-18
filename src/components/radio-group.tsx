'use client'

import type React from 'react'
import { useCallback, useRef, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

/** A single radio option definition. */
export interface RadioOption {
  /** Unique value. */
  value: string
  /** Display label. */
  label: string
  /** Optional description text below the label. */
  description?: string
  /** Whether this option is disabled. */
  disabled?: boolean
}

export interface RadioGroupProps {
  /** Array of radio option definitions. */
  options: RadioOption[]
  /** Currently selected value. */
  value: string
  /** Callback when selection changes. */
  onChange: (value: string) => void
  /** Layout direction. */
  orientation?: 'horizontal' | 'vertical'
  /** Additional class name for the root element. */
  className?: string
}

/**
 * @description A custom-styled radio button group with Framer Motion selection indicator.
 * Supports keyboard navigation (arrow keys, Home, End) and ARIA roles.
 */
export function RadioGroup({
  options,
  value,
  onChange,
  orientation = 'vertical',
  className,
}: RadioGroupProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const groupRef = useRef<HTMLDivElement>(null)

  const enabledOptions = options.filter((o) => !o.disabled)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIdx = enabledOptions.findIndex((o) => o.value === value)
      if (currentIdx === -1) return

      const isVertical = orientation === 'vertical'
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

      let nextIdx: number | null = null

      if (e.key === nextKey) {
        e.preventDefault()
        nextIdx = (currentIdx + 1) % enabledOptions.length
      } else if (e.key === prevKey) {
        e.preventDefault()
        nextIdx = (currentIdx - 1 + enabledOptions.length) % enabledOptions.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        nextIdx = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIdx = enabledOptions.length - 1
      }

      if (nextIdx !== null) {
        onChange(enabledOptions[nextIdx].value)
        const radios = groupRef.current?.querySelectorAll<HTMLDivElement>('[role="radio"]:not([aria-disabled="true"])')
        radios?.[nextIdx]?.focus()
      }
    },
    [enabledOptions, value, onChange, orientation],
  )

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={option.disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              if (!option.disabled) onChange(option.value)
            }}
            className={cn(
              'flex items-start gap-3 cursor-pointer select-none group',
              'focus-visible:outline-none',
              option.disabled && 'opacity-40 pointer-events-none',
            )}
          >
            {/* Radio circle */}
            <div
              className={cn(
                'relative mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2 transition-colors duration-150',
                'flex items-center justify-center',
                isSelected
                  ? 'border-[hsl(var(--brand-primary))]'
                  : 'border-[hsl(var(--border-strong))] group-hover:border-[hsl(var(--brand-primary))]',
                'group-focus-visible:ring-2 group-focus-visible:ring-[hsl(var(--brand-primary))] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[hsl(var(--bg-base))]',
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="radio-indicator"
                  initial={prefersReducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 30 }
                  }
                  className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--brand-primary))]"
                />
              )}
            </div>

            {/* Label + description */}
            <div className="min-w-0">
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected
                    ? 'text-[hsl(var(--text-primary))]'
                    : 'text-[hsl(var(--text-secondary))]',
                )}
              >
                {option.label}
              </span>
              {option.description && (
                <p className="mt-0.5 text-xs text-[hsl(var(--text-tertiary))]">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
