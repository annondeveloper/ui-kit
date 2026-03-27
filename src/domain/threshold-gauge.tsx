'use client'

import {
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ThresholdGaugeProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  thresholds?: { warning: number; critical: number }
  label?: ReactNode
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const gaugeStyles = css`
  @layer components {
    @scope (.ui-threshold-gauge) {
      :scope {
        position: relative;
        min-inline-size: 120px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      /* Sizes */
      :scope[data-size="sm"] { --gauge-size: 80px; }
      :scope[data-size="md"] { --gauge-size: 120px; }
      :scope[data-size="lg"] { --gauge-size: 160px; }

      .ui-threshold-gauge__svg {
        display: block;
        overflow: visible;
      }

      .ui-threshold-gauge__track {
        fill: none;
        stroke: var(--bg-muted, oklch(100% 0 0 / 0.06));
        stroke-linecap: round;
      }

      .ui-threshold-gauge__fill {
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] .ui-threshold-gauge__fill {
        transition: none;
      }

      /* Status colors */
      :scope[data-status="ok"] .ui-threshold-gauge__fill {
        stroke: oklch(72% 0.19 155);
      }
      :scope[data-status="warning"] .ui-threshold-gauge__fill {
        stroke: oklch(80% 0.18 85);
      }
      :scope[data-status="critical"] .ui-threshold-gauge__fill {
        stroke: oklch(62% 0.22 25);
      }

      /* Default color (no thresholds) */
      .ui-threshold-gauge__fill {
        stroke: oklch(65% 0.2 270);
      }

      .ui-threshold-gauge__needle {
        fill: var(--text-primary, oklch(90% 0 0));
        transition: transform 0.6s var(--ease-out, ease-out);
        transform-origin: center;
      }

      :scope[data-motion="0"] .ui-threshold-gauge__needle {
        transition: none;
      }

      .ui-threshold-gauge__value-text {
        font-size: var(--text-xl, 1.25rem);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        fill: var(--text-primary, oklch(90% 0 0));
        text-anchor: middle;
        dominant-baseline: middle;
      }

      :scope[data-size="sm"] .ui-threshold-gauge__value-text {
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-threshold-gauge__value-text {
        font-size: var(--text-2xl, 1.5rem);
      }

      .ui-threshold-gauge__label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        text-align: center;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-threshold-gauge__track {
          stroke: GrayText;
        }
        .ui-threshold-gauge__fill {
          stroke: Highlight;
        }
        .ui-threshold-gauge__value-text {
          fill: CanvasText;
        }
      }
    }
  }
`

// ─── Arc helpers ─────────────────────────────────────────────────────────────

const SIZE_MAP = { sm: 80, md: 120, lg: 160 }
const STROKE_MAP = { sm: 6, md: 8, lg: 10 }

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

function ThresholdGaugeInner({
  value: rawValue,
  thresholds,
  label,
  showValue = false,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: ThresholdGaugeProps) {
  useStyles('threshold-gauge', gaugeStyles)
  const motionLevel = useMotionLevel(motionProp)

  // Clamp value
  const value = Math.max(0, Math.min(100, rawValue))

  // Determine status
  let status: 'ok' | 'warning' | 'critical' | undefined
  if (thresholds) {
    if (value >= thresholds.critical) status = 'critical'
    else if (value >= thresholds.warning) status = 'warning'
    else status = 'ok'
  }

  // SVG geometry — semicircle arc from 180° to 360°
  const svgSize = SIZE_MAP[size]
  const strokeWidth = STROKE_MAP[size]
  const cx = svgSize / 2
  const cy = svgSize / 2
  const r = (svgSize - strokeWidth) / 2

  // Arc spans 180 degrees (from left to right, top semicircle)
  const startAngle = 180
  const endAngle = 360
  const totalArc = endAngle - startAngle

  // Full track arc
  const trackPath = describeArc(cx, cy, r, startAngle, endAngle)

  // Fill arc based on value
  const fillAngle = startAngle + (value / 100) * totalArc
  const fillPath = value > 0 ? describeArc(cx, cy, r, startAngle, fillAngle) : ''

  // Arc circumference for stroke-dasharray
  const arcLength = (Math.PI * r * totalArc) / 360

  return (
    <div
      className={cn('ui-threshold-gauge', className)}
      data-motion={motionLevel}
      data-size={size}
      {...(status && { 'data-status': status })}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={typeof label === 'string' ? label : 'Gauge'}
      {...rest}
    >
      <svg
        className="ui-threshold-gauge__svg"
        width={svgSize}
        height={svgSize / 2 + strokeWidth}
        viewBox={`0 0 ${svgSize} ${svgSize / 2 + strokeWidth}`}
        aria-hidden="true"
      >
        {/* Track */}
        <path
          className="ui-threshold-gauge__track"
          d={trackPath}
          strokeWidth={strokeWidth}
        />

        {/* Fill */}
        {fillPath && (
          <path
            className="ui-threshold-gauge__fill"
            d={fillPath}
            strokeWidth={strokeWidth}
          />
        )}

        {/* Value text centered */}
        {showValue && (
          <text
            className="ui-threshold-gauge__value-text"
            x={cx}
            y={cy}
          >
            {value}
          </text>
        )}
      </svg>

      {label && (
        <div className="ui-threshold-gauge__label">{label}</div>
      )}
    </div>
  )
}

export function ThresholdGauge(props: ThresholdGaugeProps) {
  return (
    <ComponentErrorBoundary>
      <ThresholdGaugeInner {...props} />
    </ComponentErrorBoundary>
  )
}

ThresholdGauge.displayName = 'ThresholdGauge'
