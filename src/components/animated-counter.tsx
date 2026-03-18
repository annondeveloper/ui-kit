'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface AnimatedCounterProps {
  /** The target numeric value to animate to. */
  value: number
  /** Animation duration in milliseconds. */
  duration?: number
  className?: string
  /** Custom formatting function for the displayed number. */
  format?: (n: number) => string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * @description An animated number counter that transitions smoothly between values
 * using requestAnimationFrame. Respects prefers-reduced-motion.
 */
export function AnimatedCounter({
  value,
  duration = 400,
  className,
  format,
}: AnimatedCounterProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const prevRef = useRef(value)
  const rafRef = useRef<number | null>(null)
  const [displayed, setDisplayed] = useState(value)
  const decimalPlacesRef = useRef(
    Number.isInteger(value) ? 0 : (value.toString().split('.')[1]?.length ?? 1)
  )

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = value
    decimalPlacesRef.current = Number.isInteger(to) ? 0 : (to.toString().split('.')[1]?.length ?? 1)

    if (reduced || from === to) {
      setDisplayed(to)
      return
    }

    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const current = from + (to - from) * eased

      setDisplayed(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayed(to)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, duration, reduced])

  const formatted = format
    ? format(displayed)
    : decimalPlacesRef.current === 0
      ? Math.round(displayed).toString()
      : displayed.toFixed(decimalPlacesRef.current)

  return (
    <span className={cn('tabular-nums', className)}>
      {formatted}
    </span>
  )
}
