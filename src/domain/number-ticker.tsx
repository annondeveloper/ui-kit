'use client'

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NumberTickerProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  direction?: 'up' | 'down'
  delay?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const numberTickerStyles = css`
  @layer components {
    @scope (.ui-number-ticker) {
      :scope {
        display: inline-flex;
        min-inline-size: 60px;
        align-items: baseline;
        font-variant-numeric: tabular-nums;
        overflow: hidden;
      }

      .ui-number-ticker--digit-slot {
        display: inline-block;
        block-size: 1em;
        overflow: hidden;
        line-height: 1;
      }

      .ui-number-ticker--digit-column {
        display: flex;
        flex-direction: column;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ui-number-ticker--digit {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: 1em;
        line-height: 1;
      }

      /* Static characters (comma, period, sign) */
      .ui-number-ticker--static {
        display: inline-block;
      }

      /* Motion 0 */
      :scope[data-motion="0"] .ui-number-ticker--digit-column {
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-number-ticker--digit-column {
          transition: none !important;
        }
      }

      /* Print */
      @media print {
        .ui-number-ticker--digit-column {
          transition: none !important;
        }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// ─── Component ──────────────────────────────────────────────────────────────

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  motion: motionProp,
  className,
  ...rest
}: NumberTickerProps) {
  useStyles('number-ticker', numberTickerStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [displayValue, setDisplayValue] = useState<number | null>(null)
  const delayedRef = useRef(false)

  const isInstant = motionLevel === 0

  // Apply delay before showing
  useEffect(() => {
    if (isInstant || delay <= 0) {
      setDisplayValue(value)
      delayedRef.current = true
      return
    }

    if (!delayedRef.current) {
      const timer = setTimeout(() => {
        delayedRef.current = true
        setDisplayValue(value)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(value)
    }
  }, [value, delay, isInstant])

  const formatted = useMemo(() => {
    if (displayValue === null) return '0'
    return new Intl.NumberFormat().format(displayValue)
  }, [displayValue])

  const chars = Array.from(formatted)

  return (
    <span
      className={cn('ui-number-ticker', className)}
      data-motion={motionLevel}
      aria-label={String(value)}
      role="img"
      {...rest}
    >
      {chars.map((char, i) => {
        const digitIndex = DIGITS.indexOf(char)

        if (digitIndex === -1) {
          // Non-digit character (comma, period, minus sign)
          return (
            <span key={`static-${i}`} className="ui-number-ticker--static" aria-hidden="true">
              {char}
            </span>
          )
        }

        const offset = direction === 'up'
          ? -digitIndex * 100
          : -(9 - digitIndex) * 100

        return (
          <span key={`digit-${i}`} className="ui-number-ticker--digit-slot" aria-hidden="true">
            <span
              className="ui-number-ticker--digit-column"
              style={{
                transform: `translateY(${offset / 10}em)`,
              }}
            >
              {(direction === 'up' ? DIGITS : [...DIGITS].reverse()).map((d) => (
                <span key={d} className="ui-number-ticker--digit">
                  {d}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}

NumberTicker.displayName = 'NumberTicker'
