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

export interface GeoPoint {
  id: string
  lat: number
  lng: number
  label?: string
  value?: number
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  tooltip?: ReactNode
}

export interface GeoConnection {
  from: string            // Point ID
  to: string              // Point ID
  value?: number          // e.g., traffic between points
  status?: 'ok' | 'warning' | 'critical'
}

export interface GeoMapProps extends HTMLAttributes<HTMLDivElement> {
  points: GeoPoint[]
  connections?: GeoConnection[]
  projection?: 'mercator' | 'equirectangular'  // Default: equirectangular
  showLabels?: boolean
  interactive?: boolean   // Click/hover on points
  onPointClick?: (point: GeoPoint) => void
  onPointHover?: (point: GeoPoint | null) => void
  height?: number | string
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  return { x: lng + 180, y: 90 - lat }
}

function pointRadius(value: number | undefined, allValues: number[]): number {
  if (value === undefined) return 3
  const maxVal = Math.max(...allValues, 1)
  const minR = 2.5
  const maxR = 6
  return minR + (value / maxVal) * (maxR - minR)
}

// ─── Simplified World Map ───────────────────────────────────────────────────
// Rough continent outlines as SVG paths in equirectangular coords (x=lng+180, y=90-lat)

const WORLD_PATHS = [
  // North America
  'M 30 25 L 55 15 L 75 18 L 95 22 L 110 28 L 115 35 L 110 40 L 100 45 L 92 50 L 85 55 L 80 60 L 70 62 L 60 58 L 55 52 L 48 48 L 40 42 L 32 35 Z',
  // South America
  'M 95 75 L 105 70 L 115 72 L 120 78 L 118 85 L 120 95 L 118 105 L 115 115 L 110 125 L 105 130 L 100 140 L 95 145 L 90 140 L 88 130 L 90 120 L 88 110 L 85 100 L 88 90 L 90 82 Z',
  // Europe
  'M 170 22 L 175 18 L 185 20 L 195 22 L 200 28 L 198 32 L 195 35 L 190 38 L 185 40 L 180 42 L 175 40 L 170 35 L 168 30 Z',
  // Africa
  'M 170 52 L 180 48 L 190 50 L 200 52 L 205 58 L 210 65 L 208 75 L 205 85 L 200 95 L 195 105 L 190 115 L 185 120 L 180 118 L 175 110 L 172 100 L 170 90 L 168 80 L 165 70 L 165 60 Z',
  // Asia
  'M 200 22 L 215 18 L 230 15 L 250 18 L 265 20 L 280 25 L 290 22 L 305 25 L 315 30 L 320 35 L 315 40 L 310 45 L 300 48 L 290 50 L 280 52 L 270 55 L 260 52 L 250 48 L 240 45 L 230 42 L 220 40 L 210 38 L 205 35 L 200 30 Z',
  // Australia
  'M 290 100 L 305 95 L 320 98 L 328 105 L 325 112 L 318 118 L 310 120 L 300 118 L 292 112 L 288 105 Z',
]

// ─── Styles ─────────────────────────────────────────────────────────────────

const geoMapStyles = css`
  @layer components {
    @scope (.ui-geo-map) {
      :scope {
        position: relative;
        display: block;
        container-type: inline-size;
        background: var(--bg-surface, oklch(22% 0.02 270));
        border-radius: var(--radius-lg, 0.75rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }

      svg {
        display: block;
        inline-size: 100%;
        block-size: 100%;
      }

      /* World outline */
      .ui-geo-map__world {
        fill: oklch(30% 0.02 270);
        stroke: oklch(45% 0.03 270);
        stroke-width: 0.5;
      }

      /* Points */
      .ui-geo-map__point {
        transition: r 0.2s var(--ease-out, ease-out);
      }

      .ui-geo-map__point[data-status="ok"] {
        fill: oklch(72% 0.19 155);
      }
      .ui-geo-map__point[data-status="warning"] {
        fill: oklch(80% 0.18 85);
      }
      .ui-geo-map__point[data-status="critical"] {
        fill: oklch(62% 0.22 25);
      }
      .ui-geo-map__point[data-status="unknown"] {
        fill: oklch(60% 0 0);
      }
      .ui-geo-map__point:not([data-status]) {
        fill: oklch(65% 0.2 270);
      }

      .ui-geo-map__point[data-interactive] {
        cursor: pointer;
      }

      .ui-geo-map__point[data-interactive]:hover {
        filter: brightness(1.2);
      }

      /* Critical pulse */
      :scope:not([data-motion="0"]) .ui-geo-map__point[data-status="critical"] {
        animation: ui-geo-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-geo-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Connections */
      .ui-geo-map__connection {
        fill: none;
        stroke-width: 1;
        opacity: 0.6;
      }

      .ui-geo-map__connection[data-status="ok"] {
        stroke: oklch(72% 0.19 155);
      }
      .ui-geo-map__connection[data-status="warning"] {
        stroke: oklch(80% 0.18 85);
      }
      .ui-geo-map__connection[data-status="critical"] {
        stroke: oklch(62% 0.22 25);
      }
      .ui-geo-map__connection:not([data-status]) {
        stroke: oklch(65% 0.2 270);
      }

      /* Animated dash for connections */
      :scope:not([data-motion="0"]) .ui-geo-map__connection {
        stroke-dasharray: 4 3;
        animation: ui-geo-dash 1.5s linear infinite;
      }

      @keyframes ui-geo-dash {
        to { stroke-dashoffset: -14; }
      }

      /* Labels */
      .ui-geo-map__label {
        font-size: 4px;
        fill: var(--text-secondary, oklch(70% 0 0));
        pointer-events: none;
        text-anchor: middle;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-geo-map__world {
          fill: Canvas;
          stroke: CanvasText;
        }
        .ui-geo-map__point {
          fill: Highlight;
        }
        .ui-geo-map__connection {
          stroke: LinkText;
        }
        .ui-geo-map__label {
          fill: CanvasText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
          break-inside: avoid;
        }
        .ui-geo-map__world {
          fill: none;
          stroke: #333;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function GeoMapInner({
  points,
  connections,
  projection = 'equirectangular',
  showLabels,
  interactive,
  onPointClick,
  onPointHover,
  height,
  motion: motionProp,
  className,
  style,
  ...rest
}: GeoMapProps) {
  useStyles('geo-map', geoMapStyles)
  const motionLevel = useMotionLevel(motionProp)

  const allValues = points
    .map(p => p.value)
    .filter((v): v is number => v !== undefined)

  // Build point map for connections
  const pointMap = new Map(points.map(p => [p.id, p]))

  const wrapperStyle: React.CSSProperties = {
    ...style,
    ...(height !== undefined && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  }

  return (
    <div
      className={cn('ui-geo-map', className)}
      data-motion={motionLevel}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Geographic map with ${points.length} point${points.length !== 1 ? 's' : ''}`}
      >
        {/* World outline */}
        <g className="ui-geo-map__world">
          {WORLD_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Connections */}
        {connections?.map((conn, i) => {
          const fromPt = pointMap.get(conn.from)
          const toPt = pointMap.get(conn.to)
          if (!fromPt || !toPt) return null

          const from = geoToSvg(fromPt.lat, fromPt.lng)
          const to = geoToSvg(toPt.lat, toPt.lng)

          // Curved path — quadratic bezier with midpoint offset
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2 - Math.abs(to.x - from.x) * 0.15
          const d = `M ${from.x} ${from.y} Q ${midX} ${midY}, ${to.x} ${to.y}`

          return (
            <path
              key={`conn-${i}`}
              className="ui-geo-map__connection"
              d={d}
              {...(conn.status && { 'data-status': conn.status })}
            />
          )
        })}

        {/* Points */}
        {points.map(point => {
          const { x, y } = geoToSvg(point.lat, point.lng)
          const r = pointRadius(point.value, allValues)

          return (
            <circle
              key={point.id}
              className="ui-geo-map__point"
              cx={x}
              cy={y}
              r={r}
              {...(point.status && { 'data-status': point.status })}
              {...(interactive && { 'data-interactive': '' })}
              {...(interactive && {
                onClick: () => onPointClick?.(point),
                onMouseEnter: () => onPointHover?.(point),
                onMouseLeave: () => onPointHover?.(null),
              })}
            />
          )
        })}

        {/* Labels */}
        {showLabels && points.map(point => {
          if (!point.label) return null
          const { x, y } = geoToSvg(point.lat, point.lng)
          return (
            <text
              key={`label-${point.id}`}
              className="ui-geo-map__label"
              x={x}
              y={y + 6}
            >
              {point.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export function GeoMap(props: GeoMapProps) {
  return (
    <ComponentErrorBoundary>
      <GeoMapInner {...props} />
    </ComponentErrorBoundary>
  )
}

GeoMap.displayName = 'GeoMap'
