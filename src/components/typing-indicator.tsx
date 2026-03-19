'use client'

import type React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface TypingIndicatorProps {
  /** Label text, e.g. "AI is thinking" or "3 users typing". */
  label?: string
  /** Animation variant. */
  variant?: 'dots' | 'pulse' | 'text'
  /** Size preset. */
  size?: 'sm' | 'md'
  className?: string
}

const DOT_SIZES = { sm: 'size-1.5', md: 'size-2' } as const
const FONT_SIZES = { sm: 'text-xs', md: 'text-sm' } as const

/**
 * @description A "someone is typing" indicator with three variants:
 * bouncing dots, pulsing ring, or animated ellipsis text. Respects reduced motion.
 */
export function TypingIndicator({
  label,
  variant = 'dots',
  size = 'md',
  className,
}: TypingIndicatorProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-[hsl(var(--text-secondary))]',
        FONT_SIZES[size],
        className,
      )}
      role="status"
      aria-label={label ?? 'Typing'}
    >
      {variant === 'dots' && <BouncingDots size={size} reduced={!!reduced} />}
      {variant === 'pulse' && <PulseRing size={size} reduced={!!reduced} />}
      {variant === 'text' && <AnimatedEllipsis reduced={!!reduced} />}
      {label && <span>{label}</span>}
    </div>
  )
}

function BouncingDots({ size, reduced }: { size: 'sm' | 'md'; reduced: boolean }): React.JSX.Element {
  const dotClass = cn('rounded-full bg-current', DOT_SIZES[size])

  if (reduced) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className={dotClass} />
        <span className={dotClass} />
        <span className={dotClass} />
      </span>
    )
  }

  return (
    <span className="inline-flex items-end gap-1 h-[1em] pb-[2px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={dotClass}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  )
}

function PulseRing({ size, reduced }: { size: 'sm' | 'md'; reduced: boolean }): React.JSX.Element {
  const ringSize = size === 'sm' ? 'size-4' : 'size-5'
  const dotSize = size === 'sm' ? 'size-2' : 'size-2.5'

  return (
    <span className={cn('relative inline-flex items-center justify-center', ringSize)}>
      {!reduced && (
        <motion.span
          className={cn('absolute inset-0 rounded-full border border-current')}
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span className={cn('rounded-full bg-current', dotSize)} />
    </span>
  )
}

function AnimatedEllipsis({ reduced }: { reduced: boolean }): React.JSX.Element {
  if (reduced) {
    return <span>...</span>
  }

  return (
    <span className="inline-flex items-center w-[1.2em]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}
