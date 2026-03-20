'use client'

import { forwardRef, useState, useEffect, useRef, useCallback, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { solveSpring } from '../core/motion/spring'
import { cn } from '../core/utils/cn'

export interface AnimatedCounterProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  format?: (value: number) => string
  duration?: number
  motion?: 0 | 1 | 2 | 3
}

const defaultFormat = (value: number): string => {
  try {
    return new Intl.NumberFormat().format(Math.round(value))
  } catch {
    return String(Math.round(value))
  }
}

/** Ease-out cubic for motion level 1 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const animatedCounterStyles = css`
  @layer components {
    @scope (.ui-animated-counter) {
      :scope {
        display: inline-block;
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum";
        font-family: inherit;
        white-space: nowrap;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          color: ButtonText;
        }
      }
    }
  }
`

export const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  (
    {
      value,
      format,
      duration = 500,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('animated-counter', animatedCounterStyles)
    const motionLevel = useMotionLevel(motionProp)
    const formatter = format || defaultFormat

    const prevValueRef = useRef(value)
    const [displayValue, setDisplayValue] = useState(value)
    const rafIdRef = useRef<number>(0)
    const startTimeRef = useRef<number | null>(null)
    const spanRef = useRef<HTMLSpanElement | null>(null)

    // Merge forwarded ref with internal ref
    const setRefs = useCallback(
      (el: HTMLSpanElement | null) => {
        spanRef.current = el
        if (typeof ref === 'function') {
          ref(el)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSpanElement | null>).current = el
        }
      },
      [ref]
    )

    // Pre-compute spring curve for level 2+
    const springCurveRef = useRef<number[] | null>(null)
    if (motionLevel >= 2 && !springCurveRef.current) {
      springCurveRef.current = solveSpring({ stiffness: 120, damping: 14, mass: 1 })
    }

    // Use refs for animation parameters so the effect doesn't depend on them
    const motionLevelRef = useRef(motionLevel)
    motionLevelRef.current = motionLevel
    const durationRef = useRef(duration)
    durationRef.current = duration
    const formatterRef = useRef(formatter)
    formatterRef.current = formatter

    useEffect(() => {
      if (prevValueRef.current === value) return

      const from = prevValueRef.current
      prevValueRef.current = value
      const currentMotion = motionLevelRef.current
      const currentDuration = durationRef.current

      // Cancel any in-progress animation
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      if (currentMotion === 0) {
        setDisplayValue(value)
        return
      }

      startTimeRef.current = performance.now()
      const springCurve = springCurveRef.current

      const tick = (now: number) => {
        const elapsed = now - (startTimeRef.current || now)
        const progress = Math.min(elapsed / currentDuration, 1)

        let interpolated: number
        if (currentMotion >= 2 && springCurve) {
          const frameIndex = Math.min(
            Math.floor(progress * (springCurve.length - 1)),
            springCurve.length - 1
          )
          const springProgress = springCurve[frameIndex]
          interpolated = from + (value - from) * springProgress
        } else {
          interpolated = from + (value - from) * easeOut(progress)
        }

        // Update DOM directly — avoids 60 React re-renders per second
        if (spanRef.current) {
          spanRef.current.textContent = formatterRef.current(interpolated)
        }

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(tick)
        } else {
          // Final React state update for consistency
          setDisplayValue(value)
        }
      }

      rafIdRef.current = requestAnimationFrame(tick)

      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
      }
    }, [value])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
      }
    }, [])

    return (
      <span
        ref={setRefs}
        className={cn(cls('root'), className)}
        role="status"
        aria-live="polite"
        data-motion={motionLevel}
        {...rest}
      >
        {formatter(displayValue)}
      </span>
    )
  }
)
AnimatedCounter.displayName = 'AnimatedCounter'
