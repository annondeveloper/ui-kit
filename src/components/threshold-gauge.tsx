'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn, clamp } from '../utils'

export interface ThresholdGaugeProps {
  /** Gauge value from 0 to 100. */
  value: number
  /** Label displayed below the gauge. */
  label?: string
  /** Warning and critical thresholds. */
  thresholds?: { warning: number; critical: number }
  /** Gauge diameter in pixels. */
  size?: number
  /** Show the numeric value in the center. */
  showValue?: boolean
  /** Custom formatter for the center value. */
  format?: (n: number) => string
  className?: string
}

const ARC_START = 135 // degrees, bottom-left
const ARC_SWEEP = 270 // degrees, total arc span

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

function getArcColor(pct: number, warning: number, critical: number): string {
  if (pct >= critical) return 'hsl(var(--util-high))'
  if (pct >= warning) return 'hsl(var(--util-medium))'
  return 'hsl(var(--util-low))'
}

/**
 * @description A semicircular SVG gauge with color-coded threshold zones
 * (green/yellow/red). Animates the arc on mount. Displays value in center.
 */
export function ThresholdGauge({
  value: rawValue,
  label,
  thresholds,
  size = 120,
  showValue = true,
  format,
  className,
}: ThresholdGaugeProps) {
  const reduced = useReducedMotion()
  const value = clamp(rawValue, 0, 100)
  const warning = thresholds?.warning ?? 70
  const critical = thresholds?.critical ?? 90

  const [animatedValue, setAnimatedValue] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced) {
      setAnimatedValue(value)
      return
    }
    const start = performance.now()
    const from = 0
    const dur = 600
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setAnimatedValue(from + (value - from) * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, reduced])

  const cx = size / 2
  const cy = size / 2
  const r = (size - 16) / 2
  const strokeWidth = Math.max(6, size * 0.08)

  // Background zone arcs
  const warnAngle = ARC_START + (warning / 100) * ARC_SWEEP
  const critAngle = ARC_START + (critical / 100) * ARC_SWEEP
  const endAngle = ARC_START + ARC_SWEEP

  const greenArc = describeArc(cx, cy, r, ARC_START, warnAngle)
  const yellowArc = describeArc(cx, cy, r, warnAngle, critAngle)
  const redArc = describeArc(cx, cy, r, critAngle, endAngle)

  // Value arc
  const valueAngle = ARC_START + (animatedValue / 100) * ARC_SWEEP
  const valueArc = animatedValue > 0.5
    ? describeArc(cx, cy, r, ARC_START, valueAngle)
    : ''

  const displayText = format ? format(value) : `${Math.round(value)}%`

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`} aria-hidden="true">
        {/* Background zones */}
        <path d={greenArc} fill="none" stroke="hsl(var(--util-low))" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2} />
        <path d={yellowArc} fill="none" stroke="hsl(var(--util-medium))" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2} />
        <path d={redArc} fill="none" stroke="hsl(var(--util-high))" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.2} />

        {/* Value arc */}
        {valueArc && (
          <path
            d={valueArc}
            fill="none"
            stroke={getArcColor(animatedValue, warning, critical)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Center value */}
        {showValue && (
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--text-primary))"
            fontSize={size * 0.2}
            fontWeight={600}
            fontFamily="inherit"
            className="tabular-nums"
          >
            {displayText}
          </text>
        )}
      </svg>
      {label && (
        <span className="text-[0.75rem] font-medium text-[hsl(var(--text-secondary))] mt-1">
          {label}
        </span>
      )}
    </div>
  )
}
