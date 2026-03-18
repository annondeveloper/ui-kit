'use client'

import type React from 'react'
import { cn } from '../utils'

export interface SparklineProps {
  /** Array of numeric values to plot. */
  data: number[]
  /** SVG width in pixels. */
  width?: number
  /** SVG height in pixels. */
  height?: number
  /** Line color — must use hsl(var(--token)) format. */
  color?: string
  /** Opacity for the gradient fill below the line (0 to disable). */
  fillOpacity?: number
  /** Show dots on first and last data points. */
  showDots?: boolean
  className?: string
}

function buildPoints(data: number[], w: number, h: number, pad: number): string {
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (w - pad * 2) / (data.length - 1)
  return data
    .map((v, i) => {
      const x = pad + i * stepX
      const y = pad + (1 - (v - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
}

/**
 * @description A tiny inline SVG sparkline chart for embedding in tables, cards,
 * and metric tiles. Pure SVG with no external dependencies.
 */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'hsl(var(--brand-primary))',
  fillOpacity = 0.1,
  showDots = false,
  className,
}: SparklineProps): React.JSX.Element | null {
  if (data.length < 2) return null

  const pad = showDots ? 3 : 1
  const points = buildPoints(data, width, height, pad)
  const gradId = `sp-grad-${Math.random().toString(36).slice(2, 8)}`

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (width - pad * 2) / (data.length - 1)

  const firstX = pad
  const firstY = pad + (1 - (data[0] - min) / range) * (height - pad * 2)
  const lastX = pad + (data.length - 1) * stepX
  const lastY = pad + (1 - (data[data.length - 1] - min) / range) * (height - pad * 2)

  const fillPath = fillOpacity > 0
    ? `M ${firstX},${height} L ${points.split(' ').join(' L ')} L ${lastX},${height} Z`
    : undefined

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {fillOpacity > 0 && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fillPath && (
        <path d={fillPath} fill={`url(#${gradId})`} />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && (
        <>
          <circle cx={firstX} cy={firstY} r={2} fill={color} />
          <circle cx={lastX} cy={lastY} r={2} fill={color} />
        </>
      )}
    </svg>
  )
}
