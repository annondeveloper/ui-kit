'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { MetricCard as BaseMetricCard, type MetricCardProps } from '../domain/metric-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumMetricCardStyles = css`
  @layer premium {
    @scope (.ui-premium-metric-card) {
      :scope {
        position: relative;
      }
      /* Pulse glow on value change */
      :scope[data-pulse="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-lg, 0.75rem);
        box-shadow: 0 0 20px oklch(65% 0.2 270 / 0.3);
        animation: ui-premium-metric-pulse 0.6s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-metric-pulse {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      /* Sparkline path draw animation */
      :scope .ui-metric-card__sparkline svg path[stroke] {
        stroke-dasharray: 200;
        stroke-dashoffset: 200;
        animation: ui-premium-sparkline-draw 1s ease-out 0.3s forwards;
      }
      :scope .ui-metric-card__sparkline svg path[fill]:not([stroke]) {
        opacity: 0;
        animation: ui-premium-sparkline-fill 0.5s ease-out 1s forwards;
      }
      @keyframes ui-premium-sparkline-draw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes ui-premium-sparkline-fill {
        to { opacity: 1; }
      }
      /* Counter animation placeholder — the value opacity fades in */
      :scope[data-counting="true"] .ui-metric-card__value {
        animation: ui-premium-counter-pulse 0.1s steps(2) infinite;
      }
      @keyframes ui-premium-counter-pulse {
        0% { opacity: 1; }
        50% { opacity: 0.85; }
      }
      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-metric-card__sparkline svg path {
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        animation: none;
        opacity: 1;
      }
      :scope[data-motion="0"]::after {
        display: none;
      }
    }
  }
`

export function MetricCard({
  motion: motionProp,
  value,
  ...rest
}: MetricCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-metric-card', premiumMetricCardStyles)

  const [pulse, setPulse] = useState(false)
  const prevValueRef = useRef(value)

  // Pulse glow on value change
  useEffect(() => {
    if (motionLevel < 2) return
    if (prevValueRef.current !== value && prevValueRef.current !== undefined) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(timer)
    }
    prevValueRef.current = value
  }, [value, motionLevel])

  // Update prev ref after pulse is handled
  useEffect(() => {
    prevValueRef.current = value
  }, [value])

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-metric-card"
      data-motion={motionLevel}
      data-pulse={pulse || undefined}
    >
      <BaseMetricCard motion={motionProp} value={value} {...rest} />
    </div>
  )
}

MetricCard.displayName = 'MetricCard'
