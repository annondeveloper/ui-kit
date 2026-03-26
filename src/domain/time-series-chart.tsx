'use client'

import {
  type HTMLAttributes,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimeSeriesData {
  timestamp: number
  value: number
}

export interface TimeSeriesSeries {
  id: string
  label: string
  data: TimeSeriesData[]
  color?: string
}

export interface TimeSeriesChartProps extends HTMLAttributes<HTMLDivElement> {
  series: TimeSeriesSeries[]
  height?: number
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  yMin?: number
  yMax?: number
  formatValue?: (v: number) => string
  formatTime?: (t: number) => string
  motion?: 0 | 1 | 2 | 3
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  'oklch(65% 0.2 270)',  // purple
  'oklch(72% 0.19 155)', // green
  'oklch(70% 0.2 30)',   // coral
  'oklch(75% 0.15 200)', // cyan
  'oklch(80% 0.18 85)',  // amber
  'oklch(65% 0.2 320)',  // pink
]

const PADDING = { top: 12, right: 16, bottom: 28, left: 52 }

// ─── Styles ─────────────────────────────────────────────────────────────────

const chartStyles = css`
  @layer components {
    @scope (.ui-time-series-chart) {
      :scope {
        position: relative;
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      svg {
        display: block;
      }

      .ui-time-series-chart__grid-line {
        stroke: oklch(100% 0 0 / 0.06);
        stroke-width: 1;
      }

      .ui-time-series-chart__axis-label {
        fill: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.5625rem;
        font-variant-numeric: tabular-nums;
      }

      .ui-time-series-chart__series-line {
        fill: none;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      :scope:not([data-motion="0"]) .ui-time-series-chart__series-line {
        stroke-dasharray: var(--line-len, 2000);
        stroke-dashoffset: var(--line-len, 2000);
        animation: ui-tsc-draw 0.8s ease-out forwards;
      }

      @keyframes ui-tsc-draw {
        to { stroke-dashoffset: 0; }
      }

      .ui-time-series-chart__crosshair {
        stroke: oklch(100% 0 0 / 0.15);
        stroke-width: 1;
        stroke-dasharray: 3 3;
        pointer-events: none;
      }

      .ui-time-series-chart__dot {
        pointer-events: none;
      }

      .ui-time-series-chart__hit-area {
        fill: transparent;
        cursor: crosshair;
      }

      .ui-time-series-chart__tooltip-box {
        position: absolute;
        padding: 0.375rem 0.5rem;
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 10;
        transform: translate(-50%, -100%);
        line-height: 1.4;
      }

      .ui-time-series-chart__tooltip-time {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
        margin-block-end: 0.125rem;
      }

      .ui-time-series-chart__tooltip-row {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ui-time-series-chart__tooltip-swatch {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ui-time-series-chart__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        padding-block-start: 0.5rem;
        justify-content: center;
      }

      .ui-time-series-chart__legend-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-time-series-chart__legend-swatch {
        inline-size: 0.75rem;
        block-size: 0.1875rem;
        border-radius: 1px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-time-series-chart__series-line { stroke: CanvasText; }
        .ui-time-series-chart__grid-line { stroke: GrayText; }
        .ui-time-series-chart__axis-label { fill: CanvasText; }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-time-series-chart__series-line {
          stroke-dasharray: none;
          stroke-dashoffset: 0;
          animation: none;
        }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultFormatValue(v: number): string {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return v % 1 === 0 ? String(v) : v.toFixed(1)
}

function defaultFormatTime(t: number): string {
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function buildSeriesPath(
  data: TimeSeriesData[],
  xScale: (t: number) => number,
  yScale: (v: number) => number,
) {
  if (data.length < 2) return ''
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  let d = `M ${xScale(sorted[0].timestamp)} ${yScale(sorted[0].value)}`
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    const cpx = (xScale(prev.timestamp) + xScale(curr.timestamp)) / 2
    d += ` Q ${cpx} ${yScale(prev.value)}, ${xScale(curr.timestamp)} ${yScale(curr.value)}`
  }
  return d
}

// ─── Component ──────────────────────────────────────────────────────────────

function TimeSeriesChartInner({
  series,
  height = 200,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  yMin: yMinProp,
  yMax: yMaxProp,
  formatValue = defaultFormatValue,
  formatTime = defaultFormatTime,
  motion: motionProp,
  className,
  style,
  ...rest
}: TimeSeriesChartProps) {
  useStyles('time-series-chart', chartStyles)
  const motionLevel = useMotionLevel(motionProp)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(400)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Responsive width via ResizeObserver
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 0) setWidth(w)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Compute all timestamps union, sorted
  const allTimestamps = useMemo(() => {
    const set = new Set<number>()
    for (const s of series) for (const d of s.data) set.add(d.timestamp)
    return [...set].sort((a, b) => a - b)
  }, [series])

  // Y domain
  const [yMin, yMax] = useMemo(() => {
    let lo = yMinProp ?? Infinity
    let hi = yMaxProp ?? -Infinity
    for (const s of series) {
      for (const d of s.data) {
        if (yMinProp === undefined && d.value < lo) lo = d.value
        if (yMaxProp === undefined && d.value > hi) hi = d.value
      }
    }
    if (!isFinite(lo)) lo = 0
    if (!isFinite(hi)) hi = 100
    if (lo === hi) { lo -= 1; hi += 1 }
    // Add 5% padding
    const padding = (hi - lo) * 0.05
    return [yMinProp ?? lo - padding, yMaxProp ?? hi + padding]
  }, [series, yMinProp, yMaxProp])

  const plotW = width - PADDING.left - PADDING.right
  const plotH = height - PADDING.top - PADDING.bottom

  const xScale = useCallback(
    (t: number) => {
      if (allTimestamps.length < 2) return PADDING.left + plotW / 2
      const tMin = allTimestamps[0]
      const tMax = allTimestamps[allTimestamps.length - 1]
      const range = tMax - tMin || 1
      return PADDING.left + ((t - tMin) / range) * plotW
    },
    [allTimestamps, plotW],
  )

  const yScale = useCallback(
    (v: number) => {
      const range = yMax - yMin || 1
      return PADDING.top + plotH - ((v - yMin) / range) * plotH
    },
    [yMin, yMax, plotH],
  )

  // Grid ticks
  const yTicks = useMemo(() => {
    const count = Math.max(2, Math.min(6, Math.floor(plotH / 36)))
    const step = (yMax - yMin) / count
    return Array.from({ length: count + 1 }, (_, i) => yMin + step * i)
  }, [yMin, yMax, plotH])

  const xTicks = useMemo(() => {
    if (allTimestamps.length <= 1) return allTimestamps
    const maxLabels = Math.max(2, Math.floor(plotW / 60))
    const step = Math.max(1, Math.floor(allTimestamps.length / maxLabels))
    const ticks: number[] = []
    for (let i = 0; i < allTimestamps.length; i += step) ticks.push(allTimestamps[i])
    if (ticks[ticks.length - 1] !== allTimestamps[allTimestamps.length - 1]) {
      ticks.push(allTimestamps[allTimestamps.length - 1])
    }
    return ticks
  }, [allTimestamps, plotW])

  // Series paths & colors
  const seriesData = useMemo(
    () =>
      series.map((s, i) => ({
        ...s,
        color: s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        path: buildSeriesPath(s.data, xScale, yScale),
      })),
    [series, xScale, yScale],
  )

  // Tooltip: find nearest timestamp
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!showTooltip || allTimestamps.length === 0) return
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      let closest = 0
      let minDist = Infinity
      for (let i = 0; i < allTimestamps.length; i++) {
        const dist = Math.abs(xScale(allTimestamps[i]) - mouseX)
        if (dist < minDist) { minDist = dist; closest = i }
      }
      setHoveredIdx(closest)
    },
    [showTooltip, allTimestamps, xScale],
  )

  const hoveredTimestamp = hoveredIdx !== null ? allTimestamps[hoveredIdx] : null

  return (
    <div
      ref={containerRef}
      className={cn('ui-time-series-chart', className)}
      data-motion={motionLevel}
      style={style}
      {...rest}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Time series chart"
        role="img"
      >
        {/* Grid lines */}
        {showGrid && yTicks.map(v => (
          <line
            key={`gy-${v}`}
            className="ui-time-series-chart__grid-line"
            x1={PADDING.left}
            y1={yScale(v)}
            x2={width - PADDING.right}
            y2={yScale(v)}
          />
        ))}

        {/* Y axis labels */}
        {showYAxis && yTicks.map(v => (
          <text
            key={`yl-${v}`}
            className="ui-time-series-chart__axis-label"
            x={PADDING.left - 6}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="central"
          >
            {formatValue(v)}
          </text>
        ))}

        {/* X axis labels */}
        {showXAxis && xTicks.map(t => (
          <text
            key={`xl-${t}`}
            className="ui-time-series-chart__axis-label"
            x={xScale(t)}
            y={height - 4}
            textAnchor="middle"
          >
            {formatTime(t)}
          </text>
        ))}

        {/* Series lines */}
        {seriesData.map(s => (
          s.path && (
            <path
              key={s.id}
              className="ui-time-series-chart__series-line"
              d={s.path}
              stroke={s.color}
              style={{ '--line-len': '2000' } as React.CSSProperties}
            />
          )
        ))}

        {/* Crosshair */}
        {hoveredTimestamp !== null && (
          <line
            className="ui-time-series-chart__crosshair"
            x1={xScale(hoveredTimestamp)}
            y1={PADDING.top}
            x2={xScale(hoveredTimestamp)}
            y2={height - PADDING.bottom}
          />
        )}

        {/* Hover dots */}
        {hoveredTimestamp !== null && seriesData.map(s => {
          const pt = s.data.find(d => d.timestamp === hoveredTimestamp)
          if (!pt) return null
          return (
            <circle
              key={`dot-${s.id}`}
              className="ui-time-series-chart__dot"
              cx={xScale(pt.timestamp)}
              cy={yScale(pt.value)}
              r={3.5}
              fill={s.color}
              stroke="var(--bg-base, oklch(18% 0.02 270))"
              strokeWidth={1.5}
            />
          )
        })}

        {/* Hit area */}
        <rect
          className="ui-time-series-chart__hit-area"
          x={PADDING.left}
          y={PADDING.top}
          width={plotW}
          height={plotH}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        />
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredTimestamp !== null && (
        <div
          className="ui-time-series-chart__tooltip-box"
          style={{
            left: `${xScale(hoveredTimestamp)}px`,
            top: `${PADDING.top - 4}px`,
          }}
        >
          <div className="ui-time-series-chart__tooltip-time">
            {formatTime(hoveredTimestamp)}
          </div>
          {seriesData.map(s => {
            const pt = s.data.find(d => d.timestamp === hoveredTimestamp)
            if (!pt) return null
            return (
              <div key={s.id} className="ui-time-series-chart__tooltip-row">
                <span className="ui-time-series-chart__tooltip-swatch" style={{ background: s.color }} />
                <span>{s.label}: {formatValue(pt.value)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <div className="ui-time-series-chart__legend">
          {seriesData.map(s => (
            <div key={s.id} className="ui-time-series-chart__legend-item">
              <span className="ui-time-series-chart__legend-swatch" style={{ background: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TimeSeriesChart(props: TimeSeriesChartProps) {
  return (
    <ComponentErrorBoundary>
      <TimeSeriesChartInner {...props} />
    </ComponentErrorBoundary>
  )
}

TimeSeriesChart.displayName = 'TimeSeriesChart'
