'use client'

import {
  type HTMLAttributes,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  data: number[]
  width?: number | string
  height?: number
  color?: string
  gradient?: boolean
  showTooltip?: boolean
  animate?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sparklineStyles = css`
  @layer components {
    @scope (.ui-sparkline) {
      :scope {
        position: relative;
        display: inline-block;
        line-height: 0;
      }

      svg {
        display: block;
      }

      .ui-sparkline__line {
        fill: none;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .ui-sparkline__area {
        opacity: 0.3;
      }

      .ui-sparkline__hit-area {
        fill: transparent;
        cursor: crosshair;
      }

      .ui-sparkline__dot {
        fill: var(--sparkline-color, oklch(65% 0.2 270));
      }

      .ui-sparkline__tooltip {
        position: absolute;
        padding: 0.25rem 0.5rem;
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        z-index: 10;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-sparkline__line {
          stroke: CanvasText;
        }
        .ui-sparkline__area {
          display: none;
        }
        .ui-sparkline__dot {
          fill: Highlight;
        }
      }
    }
  }
`

// ─── Path generation ─────────────────────────────────────────────────────────

function buildPath(data: number[], viewW: number, viewH: number, padding: number) {
  if (data.length < 2) return { line: '', area: '', points: [] as { x: number; y: number }[] }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * viewW,
    y: viewH - padding - ((v - min) / range) * (viewH - padding * 2),
  }))

  // Quadratic bezier smooth path
  let line = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    line += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`
  }

  const area = `${line} L ${points[points.length - 1].x} ${viewH} L ${points[0].x} ${viewH} Z`

  return { line, area, points }
}

// ─── Component ──────────────────────────────────────────────────────────────

function SparklineInner({
  data,
  width,
  height = 32,
  color,
  gradient = true,
  showTooltip = false,
  animate = true,
  motion: motionProp,
  className,
  style,
  ...rest
}: SparklineProps) {
  useStyles('sparkline', sparklineStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const viewW = 100
  const viewH = height
  const padding = 2
  const strokeColor = color || 'oklch(65% 0.2 270)'

  const { line, area, points } = buildPath(data, viewW, viewH, padding)

  const wrapperStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    '--sparkline-color': strokeColor,
  } as React.CSSProperties

  const gradientId = `sparkline-grad-${data.length}`

  return (
    <div
      className={cn('ui-sparkline', className)}
      data-motion={motionLevel}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ width: '100%', height: `${height}px` }}
      >
        {gradient && line && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {gradient && area && (
          <path className="ui-sparkline__area" d={area} fill={`url(#${gradientId})`} />
        )}

        {line && (
          <path className="ui-sparkline__line" d={line} stroke={strokeColor} />
        )}

        {/* Hover dot */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <circle
            className="ui-sparkline__dot"
            cx={points[hoveredIndex].x}
            cy={points[hoveredIndex].y}
            r={3}
          />
        )}

        {/* Hit areas for tooltip */}
        {showTooltip && points.map((pt, i) => {
          const sliceW = viewW / data.length
          return (
            <rect
              key={i}
              className="ui-sparkline__hit-area"
              x={pt.x - sliceW / 2}
              y={0}
              width={sliceW}
              height={viewH}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          )
        })}
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="ui-sparkline__tooltip"
          style={{
            left: `${(points[hoveredIndex].x / viewW) * 100}%`,
            top: `${(points[hoveredIndex].y / viewH) * 100}%`,
          }}
        >
          {data[hoveredIndex]}
        </div>
      )}
    </div>
  )
}

export function Sparkline(props: SparklineProps) {
  return (
    <ComponentErrorBoundary>
      <SparklineInner {...props} />
    </ComponentErrorBoundary>
  )
}

Sparkline.displayName = 'Sparkline'
