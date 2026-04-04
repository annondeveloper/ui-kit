'use client'

import {
  type HTMLAttributes,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'
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

export interface ChartAnnotation {
  type: 'horizontal' | 'vertical'
  value: number                  // y-value for horizontal, timestamp for vertical
  label?: string
  color?: string                 // OKLCH color, default: oklch(70% 0 0)
  dashed?: boolean               // default: true
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
  brushable?: boolean
  onBrush?: (range: [number, number]) => void
  zoomable?: boolean
  onZoom?: (domain: { x: [number, number]; y: [number, number] }) => void
  toggleableSeries?: boolean
  annotations?: ChartAnnotation[]
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
        min-inline-size: 200px;
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      svg {
        display: block;
      }

      .ui-time-series-chart__grid-line {
        stroke: var(--border-subtle);
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
        stroke: var(--border-strong);
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
        position: fixed;
        padding: 0.375rem 0.5rem;
        background: var(--bg-elevated, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 1000;
        line-height: 1.4;
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3);
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

      .ui-time-series-chart__brush {
        fill: oklch(65% 0.15 270 / 0.15);
        stroke: oklch(65% 0.15 270 / 0.4);
        stroke-width: 1;
        cursor: ew-resize;
      }

      .ui-time-series-chart__brush-handle {
        fill: oklch(65% 0.15 270 / 0.6);
        stroke: oklch(65% 0.15 270);
        stroke-width: 1;
        cursor: ew-resize;
      }

      .ui-time-series-chart__annotation {
        pointer-events: none;
      }

      .ui-time-series-chart__annotation-label {
        font-size: 0.5625rem;
        font-variant-numeric: tabular-nums;
        pointer-events: none;
      }

      .ui-time-series-chart__legend-checkbox {
        appearance: none;
        -webkit-appearance: none;
        inline-size: 0.75rem;
        block-size: 0.75rem;
        border: 1.5px solid var(--border-strong, oklch(60% 0 0));
        border-radius: 2px;
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
      }

      .ui-time-series-chart__legend-checkbox:checked::after {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: 1px;
        background: var(--cb-color, oklch(65% 0.2 270));
      }

      .ui-time-series-chart__zoom-reset {
        position: absolute;
        inset-block-start: 0.375rem;
        inset-inline-end: 0.375rem;
        font-size: 0.625rem;
        font-family: inherit;
        padding: 0.1875rem 0.5rem;
        border-radius: var(--radius-sm, 0.25rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        background: var(--bg-elevated, oklch(22% 0.02 270));
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        z-index: 2;
        line-height: 1.4;
      }
      .ui-time-series-chart__zoom-reset:hover {
        background: var(--bg-surface, oklch(25% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
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
  brushable = false,
  onBrush,
  zoomable = false,
  onZoom,
  toggleableSeries = false,
  annotations,
  className,
  style,
  ...rest
}: TimeSeriesChartProps) {
  useStyles('time-series-chart', chartStyles)
  const motionLevel = useMotionLevel(motionProp)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(400)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // ─── Brush state ──────────────────────────────────────────────────
  const [brushStart, setBrushStart] = useState<number | null>(null)
  const [brushEnd, setBrushEnd] = useState<number | null>(null)
  const brushing = useRef(false)

  // ─── Zoom state ───────────────────────────────────────────────────
  const [zoomX, setZoomX] = useState<[number, number] | null>(null)
  const [zoomY, setZoomY] = useState<[number, number] | null>(null)
  const isZoomed = zoomX !== null || zoomY !== null

  // ─── Toggleable series state ──────────────────────────────────────
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())

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

  // Effective domains accounting for zoom
  const effectiveXMin = zoomX ? zoomX[0] : (allTimestamps.length > 0 ? allTimestamps[0] : 0)
  const effectiveXMax = zoomX ? zoomX[1] : (allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : 1)
  const effectiveYMin = zoomY ? zoomY[0] : yMin
  const effectiveYMax = zoomY ? zoomY[1] : yMax

  const xScale = useCallback(
    (t: number) => {
      if (allTimestamps.length < 2 && !zoomX) return PADDING.left + plotW / 2
      const range = effectiveXMax - effectiveXMin || 1
      return PADDING.left + ((t - effectiveXMin) / range) * plotW
    },
    [allTimestamps, plotW, effectiveXMin, effectiveXMax, zoomX],
  )

  const yScale = useCallback(
    (v: number) => {
      const range = effectiveYMax - effectiveYMin || 1
      return PADDING.top + plotH - ((v - effectiveYMin) / range) * plotH
    },
    [effectiveYMin, effectiveYMax, plotH],
  )

  // Inverse x scale: pixel to timestamp
  const xScaleInverse = useCallback(
    (px: number) => {
      const range = effectiveXMax - effectiveXMin || 1
      return effectiveXMin + ((px - PADDING.left) / plotW) * range
    },
    [effectiveXMin, effectiveXMax, plotW],
  )

  // Grid ticks
  const yTicks = useMemo(() => {
    const count = Math.max(2, Math.min(6, Math.floor(plotH / 36)))
    const step = (effectiveYMax - effectiveYMin) / count
    return Array.from({ length: count + 1 }, (_, i) => effectiveYMin + step * i)
  }, [effectiveYMin, effectiveYMax, plotH])

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
        hidden: hiddenSeries.has(s.id),
      })),
    [series, xScale, yScale, hiddenSeries],
  )

  // Toggle a series
  const toggleSeriesVisibility = useCallback((id: string) => {
    setHiddenSeries(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Tooltip: find nearest timestamp
  const tooltipRef = useRef<HTMLDivElement>(null)
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
      // Position tooltip within chart bounds, close to cursor
      const tip = tooltipRef.current
      if (tip) {
        const tw = tip.offsetWidth
        const th = tip.offsetHeight
        // Use chart container bounds, not viewport
        let x = e.clientX - tw / 2
        let y = e.clientY - th - 12
        // Clamp right: keep tooltip inside chart right edge
        if (x + tw > rect.right - 4) x = rect.right - tw - 4
        // Clamp left: keep tooltip inside chart left edge
        if (x < rect.left + 4) x = rect.left + 4
        // Clamp top: flip below cursor if near chart top
        if (y < rect.top + 4) y = e.clientY + 16
        // Clamp bottom: keep above chart bottom
        if (y + th > rect.bottom - 4) y = rect.bottom - th - 4
        tip.style.left = `${x}px`
        tip.style.top = `${y}px`
      }
    },
    [showTooltip, allTimestamps, xScale],
  )

  // ─── Brush handlers ─────────────────────────────────────────────────
  const handleBrushDown = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!brushable) return
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      setBrushStart(mouseX)
      setBrushEnd(mouseX)
      brushing.current = true
    },
    [brushable],
  )

  const handleBrushMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (brushing.current && brushable) {
        const svg = svgRef.current
        if (!svg) return
        const rect = svg.getBoundingClientRect()
        const mouseX = Math.max(PADDING.left, Math.min(e.clientX - rect.left, PADDING.left + plotW))
        setBrushEnd(mouseX)
      }
    },
    [brushable, plotW],
  )

  const handleBrushUp = useCallback(
    () => {
      if (!brushing.current || !brushable) return
      brushing.current = false
      if (brushStart !== null && brushEnd !== null) {
        const left = Math.min(brushStart, brushEnd)
        const right = Math.max(brushStart, brushEnd)
        if (right - left > 4) {
          const tLeft = xScaleInverse(left)
          const tRight = xScaleInverse(right)
          onBrush?.([tLeft, tRight])
        }
      }
      setBrushStart(null)
      setBrushEnd(null)
    },
    [brushable, brushStart, brushEnd, xScaleInverse, onBrush],
  )

  // Global mouse up for brush
  useEffect(() => {
    if (!brushable) return
    const up = () => {
      if (brushing.current) {
        brushing.current = false
        setBrushStart(null)
        setBrushEnd(null)
      }
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [brushable])

  // ─── Zoom handler ─────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      if (!zoomable) return
      e.preventDefault()
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const fraction = (mouseX - PADDING.left) / plotW

      const curXMin = effectiveXMin
      const curXMax = effectiveXMax
      const curYMin_ = effectiveYMin
      const curYMax_ = effectiveYMax

      const dataXMin = allTimestamps.length > 0 ? allTimestamps[0] : 0
      const dataXMax = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : 1

      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15
      const xRange = curXMax - curXMin
      const newXRange = xRange * factor
      const pivot = curXMin + fraction * xRange
      let newXMin = pivot - fraction * newXRange
      let newXMax = pivot + (1 - fraction) * newXRange

      // Clamp to data bounds
      if (newXMin < dataXMin) newXMin = dataXMin
      if (newXMax > dataXMax) newXMax = dataXMax
      // If zoomed out beyond data, reset
      if (newXRange >= (dataXMax - dataXMin) * 1.01) {
        setZoomX(null)
        setZoomY(null)
        onZoom?.({ x: [dataXMin, dataXMax], y: [yMin, yMax] })
        return
      }

      setZoomX([newXMin, newXMax])
      // Keep Y domain from props (don't zoom Y on scroll)
      onZoom?.({ x: [newXMin, newXMax], y: [curYMin_, curYMax_] })
    },
    [zoomable, plotW, effectiveXMin, effectiveXMax, effectiveYMin, effectiveYMax, allTimestamps, onZoom, yMin, yMax],
  )

  const resetZoom = useCallback(() => {
    setZoomX(null)
    setZoomY(null)
    const dataXMin = allTimestamps.length > 0 ? allTimestamps[0] : 0
    const dataXMax = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : 1
    onZoom?.({ x: [dataXMin, dataXMax], y: [yMin, yMax] })
  }, [allTimestamps, onZoom, yMin, yMax])

  const hoveredTimestamp = hoveredIdx !== null ? allTimestamps[hoveredIdx] : null

  return (
    <div
      ref={containerRef}
      className={cn('ui-time-series-chart', className)}
      data-motion={motionLevel}
      style={style}
      {...rest}
    >
      {/* Zoom reset button */}
      {zoomable && isZoomed && (
        <button
          className="ui-time-series-chart__zoom-reset"
          onClick={resetZoom}
          type="button"
        >
          Reset zoom
        </button>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Time series chart"
        role="img"
        onWheel={zoomable ? handleWheel : undefined}
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
          s.path && !s.hidden && (
            <path
              key={s.id}
              className="ui-time-series-chart__series-line"
              d={s.path}
              stroke={s.color}
              style={{ '--line-len': '2000' } as React.CSSProperties}
            />
          )
        ))}

        {/* Annotations */}
        {annotations?.map((ann, i) => {
          const annColor = ann.color || 'oklch(70% 0 0)'
          const dashArray = ann.dashed !== false ? '6 4' : undefined
          if (ann.type === 'horizontal') {
            const y = yScale(ann.value)
            return (
              <g key={`ann-${i}`} className="ui-time-series-chart__annotation">
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={width - PADDING.right}
                  y2={y}
                  stroke={annColor}
                  strokeWidth={1.5}
                  strokeDasharray={dashArray}
                />
                {ann.label && (
                  <text
                    className="ui-time-series-chart__annotation-label"
                    x={width - PADDING.right - 4}
                    y={y - 4}
                    textAnchor="end"
                    fill={annColor}
                  >
                    {ann.label}
                  </text>
                )}
              </g>
            )
          }
          // vertical
          const x = xScale(ann.value)
          return (
            <g key={`ann-${i}`} className="ui-time-series-chart__annotation">
              <line
                x1={x}
                y1={PADDING.top}
                x2={x}
                y2={height - PADDING.bottom}
                stroke={annColor}
                strokeWidth={1.5}
                strokeDasharray={dashArray}
              />
              {ann.label && (
                <text
                  className="ui-time-series-chart__annotation-label"
                  x={x + 4}
                  y={PADDING.top + 10}
                  textAnchor="start"
                  fill={annColor}
                >
                  {ann.label}
                </text>
              )}
            </g>
          )
        })}

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
          if (s.hidden) return null
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

        {/* Brush overlay */}
        {brushable && brushStart !== null && brushEnd !== null && (
          <>
            <rect
              className="ui-time-series-chart__brush"
              x={Math.min(brushStart, brushEnd)}
              y={PADDING.top}
              width={Math.abs(brushEnd - brushStart)}
              height={plotH}
            />
            <rect
              className="ui-time-series-chart__brush-handle"
              x={Math.min(brushStart, brushEnd) - 2}
              y={PADDING.top}
              width={4}
              height={plotH}
              rx={2}
            />
            <rect
              className="ui-time-series-chart__brush-handle"
              x={Math.max(brushStart, brushEnd) - 2}
              y={PADDING.top}
              width={4}
              height={plotH}
              rx={2}
            />
          </>
        )}

        {/* Hit area */}
        <rect
          className="ui-time-series-chart__hit-area"
          x={PADDING.left}
          y={PADDING.top}
          width={plotW}
          height={plotH}
          onMouseMove={(e) => {
            handleMouseMove(e)
            handleBrushMove(e)
          }}
          onMouseDown={brushable ? handleBrushDown : undefined}
          onMouseUp={brushable ? handleBrushUp : undefined}
          onMouseLeave={() => { setHoveredIdx(null); if (brushing.current) handleBrushUp() }}
        />
      </svg>

      {/* Tooltip — portaled to body to avoid ancestor transform breaking position:fixed */}
      {showTooltip && hoveredTimestamp !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="ui-time-series-chart__tooltip-box"
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: -9999,
            top: -9999,
            padding: '0.375rem 0.5rem',
            background: 'oklch(22% 0.02 270)',
            border: '1px solid oklch(100% 0 0 / 0.1)',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: 'oklch(90% 0 0)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            lineHeight: 1.4,
            boxShadow: '0 4px 12px oklch(0% 0 0 / 0.3)',
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
        </div>,
        document.body,
      )}

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <div className="ui-time-series-chart__legend">
          {seriesData.map(s => (
            <div key={s.id} className="ui-time-series-chart__legend-item" style={s.hidden ? { opacity: 0.4 } : undefined}>
              {toggleableSeries && (
                <input
                  type="checkbox"
                  className="ui-time-series-chart__legend-checkbox"
                  checked={!s.hidden}
                  onChange={() => toggleSeriesVisibility(s.id)}
                  aria-label={`Toggle ${s.label}`}
                  style={{ '--cb-color': s.color, background: s.hidden ? 'transparent' : undefined } as React.CSSProperties}
                />
              )}
              <span className="ui-time-series-chart__legend-swatch" style={{ background: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TimeSeriesChart(props: TimeSeriesChartProps): ReactElement {
  return (
    <ComponentErrorBoundary>
      <TimeSeriesChartInner {...props} />
    </ComponentErrorBoundary>
  )
}

TimeSeriesChart.displayName = 'TimeSeriesChart'
