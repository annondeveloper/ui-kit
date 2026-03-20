'use client'

import {
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RealtimeValueProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  previousValue?: number
  format?: (value: number) => string
  showDelta?: boolean
  flashOnChange?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const realtimeValueStyles = css`
  @layer components {
    @scope (.ui-realtime-value) {
      :scope {
        display: inline-flex;
        align-items: baseline;
        gap: var(--space-2xs, 0.25rem);
        font-variant-numeric: tabular-nums;
      }

      .ui-realtime-value__number {
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Delta indicator */
      .ui-realtime-value__delta {
        font-size: 0.8em;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }

      .ui-realtime-value__delta[data-direction="positive"] {
        color: oklch(72% 0.19 155);
      }
      .ui-realtime-value__delta[data-direction="negative"] {
        color: oklch(62% 0.22 25);
      }
      .ui-realtime-value__delta[data-direction="zero"] {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Flash animations */
      :scope[data-flash="up"] {
        animation: ui-realtime-flash-up 0.6s ease-out;
      }
      :scope[data-flash="down"] {
        animation: ui-realtime-flash-down 0.6s ease-out;
      }

      :scope[data-motion="0"] {
        animation: none !important;
      }

      @keyframes ui-realtime-flash-up {
        0% { background: oklch(72% 0.19 155 / 0.15); }
        100% { background: transparent; }
      }

      @keyframes ui-realtime-flash-down {
        0% { background: oklch(62% 0.22 25 / 0.15); }
        100% { background: transparent; }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-realtime-value__delta[data-direction="positive"] {
          color: LinkText;
        }
        .ui-realtime-value__delta[data-direction="negative"] {
          color: LinkText;
        }
      }
    }
  }
`

// ─── Default formatter ──────────────────────────────────────────────────────

const defaultFormat = (v: number): string => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(v)
}

// ─── Component ──────────────────────────────────────────────────────────────

function RealtimeValueInner({
  value,
  previousValue,
  format = defaultFormat,
  showDelta,
  flashOnChange = true,
  motion: motionProp,
  className,
  ...rest
}: RealtimeValueProps) {
  useStyles('realtime-value', realtimeValueStyles)
  const motionLevel = useMotionLevel(motionProp)

  // Flash state
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevValueRef = useRef(value)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const prev = prevValueRef.current
    prevValueRef.current = value

    if (prev === value) return
    if (!flashOnChange || motionLevel === 0) {
      setFlash(null)
      return
    }

    setFlash(value > prev ? 'up' : 'down')

    // Clear flash after animation
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setFlash(null), 600)

    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }, [value, flashOnChange, motionLevel])

  // Delta calculation
  const delta = previousValue !== undefined ? value - previousValue : undefined
  const deltaDirection =
    delta !== undefined
      ? delta > 0
        ? 'positive'
        : delta < 0
          ? 'negative'
          : 'zero'
      : undefined

  const formatDelta = (d: number): string => {
    const sign = d > 0 ? '+' : ''
    return `${sign}${format(d)}`
  }

  return (
    <span
      className={cn('ui-realtime-value', className)}
      data-motion={motionLevel}
      {...(flash && { 'data-flash': flash })}
      aria-live="polite"
      {...rest}
    >
      <span className="ui-realtime-value__number">
        {format(value)}
      </span>
      {showDelta && delta !== undefined && (
        <span
          className="ui-realtime-value__delta"
          data-direction={deltaDirection}
          aria-label={`Change: ${formatDelta(delta)}`}
        >
          {formatDelta(delta)}
        </span>
      )}
    </span>
  )
}

export function RealtimeValue(props: RealtimeValueProps) {
  return (
    <ComponentErrorBoundary>
      <RealtimeValueInner {...props} />
    </ComponentErrorBoundary>
  )
}

RealtimeValue.displayName = 'RealtimeValue'
