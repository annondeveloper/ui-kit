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

export interface RingChartProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  thickness?: number
  color?: string
  label?: ReactNode
  showValue?: boolean
  animated?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const ringChartStyles = css`
  @layer components {
    @scope (.ui-ring-chart) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      :scope[data-size="sm"] { --ring-size: 48px; }
      :scope[data-size="md"] { --ring-size: 64px; }
      :scope[data-size="lg"] { --ring-size: 96px; }

      .ui-ring-chart__svg {
        display: block;
        transform: rotate(-90deg);
      }

      .ui-ring-chart__track {
        fill: none;
        stroke: var(--bg-muted, oklch(100% 0 0 / 0.06));
      }

      .ui-ring-chart__fill {
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] .ui-ring-chart__fill {
        transition: none;
      }

      .ui-ring-chart__center {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
      }

      :scope[data-size="sm"] .ui-ring-chart__center {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-ring-chart__center {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-ring-chart__center {
        font-size: var(--text-lg, 1.125rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-ring-chart__track {
          stroke: GrayText;
        }
        .ui-ring-chart__fill {
          stroke: Highlight;
        }
        .ui-ring-chart__center {
          color: CanvasText;
        }
      }
    }
  }
`

// ─── Constants ──────────────────────────────────────────────────────────────

const SIZE_MAP = { sm: 48, md: 64, lg: 96 } as const
const THICKNESS_MAP = { sm: 4, md: 6, lg: 8 } as const

// ─── Component ──────────────────────────────────────────────────────────────

function RingChartInner({
  value: rawValue,
  max = 100,
  size = 'md',
  thickness,
  color = 'oklch(65% 0.2 270)',
  label,
  showValue = false,
  animated = true,
  motion: motionProp,
  className,
  style,
  ...rest
}: RingChartProps) {
  useStyles('ring-chart', ringChartStyles)
  const motionLevel = useMotionLevel(motionProp)

  const value = Math.max(0, Math.min(max, rawValue))
  const percent = (value / max) * 100

  const svgSize = SIZE_MAP[size]
  const stroke = thickness ?? THICKNESS_MAP[size]
  const radius = (svgSize - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <div
      className={cn('ui-ring-chart', className)}
      data-size={size}
      data-motion={motionLevel}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={typeof label === 'string' ? label : 'Ring chart'}
      style={{ width: svgSize, height: svgSize, ...style }}
      {...rest}
    >
      <svg
        className="ui-ring-chart__svg"
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        aria-hidden="true"
      >
        <circle
          className="ui-ring-chart__track"
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="ui-ring-chart__fill"
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {(showValue || label) && (
        <div className="ui-ring-chart__center">
          {label ?? `${Math.round(percent)}%`}
        </div>
      )}
    </div>
  )
}

export function RingChart(props: RingChartProps) {
  return (
    <ComponentErrorBoundary>
      <RingChartInner {...props} />
    </ComponentErrorBoundary>
  )
}

RingChart.displayName = 'RingChart'
