import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteTimeSeriesData {
  timestamp: number
  value: number
}

export interface LiteTimeSeriesSeries {
  id: string
  label: string
  data: LiteTimeSeriesData[]
  color?: string
}

export interface LiteTimeSeriesChartProps extends HTMLAttributes<HTMLDivElement> {
  series: LiteTimeSeriesSeries[]
  height?: number
  width?: number | string
}

const COLORS = ['oklch(65% 0.2 270)', 'oklch(72% 0.19 155)', 'oklch(70% 0.2 30)', 'oklch(75% 0.15 200)']

/** Lite TimeSeriesChart — simple SVG polylines, no animation or interactivity */
export const TimeSeriesChart = forwardRef<HTMLDivElement, LiteTimeSeriesChartProps>(
  ({ series, height = 200, width = '100%', className, ...rest }, ref) => {
    const padding = { top: 8, right: 8, bottom: 20, left: 44 }
    const viewW = 400
    const viewH = height

    const { yMin, yMax, paths, xTicks } = useMemo(() => {
      let lo = Infinity, hi = -Infinity
      const allTs: number[] = []
      for (const s of series) for (const d of s.data) {
        if (d.value < lo) lo = d.value
        if (d.value > hi) hi = d.value
        allTs.push(d.timestamp)
      }
      if (!isFinite(lo)) { lo = 0; hi = 100 }
      if (lo === hi) { lo -= 1; hi += 1 }
      const sortedTs = [...new Set(allTs)].sort((a, b) => a - b)
      const tMin = sortedTs[0] ?? 0
      const tMax = sortedTs[sortedTs.length - 1] ?? 1
      const tRange = tMax - tMin || 1
      const vRange = hi - lo || 1
      const plotW = viewW - padding.left - padding.right
      const plotH = viewH - padding.top - padding.bottom

      const paths = series.map((s, i) => {
        const sorted = [...s.data].sort((a, b) => a.timestamp - b.timestamp)
        const pts = sorted
          .map(d => {
            const x = padding.left + ((d.timestamp - tMin) / tRange) * plotW
            const y = padding.top + plotH - ((d.value - lo) / vRange) * plotH
            return `${x},${y}`
          })
          .join(' ')
        return { points: pts, color: s.color || COLORS[i % COLORS.length] }
      })

      const step = Math.max(1, Math.floor(sortedTs.length / 5))
      const xTicks = sortedTs.filter((_, i) => i % step === 0)

      return { yMin: lo, yMax: hi, paths, xTicks }
    }, [series, viewW, viewH])

    const plotH = viewH - padding.top - padding.bottom
    const vRange = yMax - yMin || 1
    const tMin = useMemo(() => {
      let m = Infinity
      for (const s of series) for (const d of s.data) if (d.timestamp < m) m = d.timestamp
      return isFinite(m) ? m : 0
    }, [series])
    const tMax = useMemo(() => {
      let m = -Infinity
      for (const s of series) for (const d of s.data) if (d.timestamp > m) m = d.timestamp
      return isFinite(m) ? m : 1
    }, [series])
    const tRange = tMax - tMin || 1
    const plotW = viewW - padding.left - padding.right

    const fmt = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v)))
    const fmtT = (t: number) => {
      const d = new Date(t)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    const ySteps = 4
    const yTickVals = Array.from({ length: ySteps + 1 }, (_, i) => yMin + (vRange / ySteps) * i)

    return (
      <div ref={ref} className={`ui-lite-time-series-chart${className ? ` ${className}` : ''}`} {...rest}>
        <svg viewBox={`0 0 ${viewW} ${viewH}`} width={width} height={height}>
          {/* Y grid + labels */}
          {yTickVals.map(v => {
            const y = padding.top + plotH - ((v - yMin) / vRange) * plotH
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={viewW - padding.right} y2={y} stroke="oklch(100% 0 0 / 0.06)" strokeWidth="1" />
                <text x={padding.left - 4} y={y} textAnchor="end" dominantBaseline="central" fontSize="8" fill="oklch(55% 0 0)">
                  {fmt(v)}
                </text>
              </g>
            )
          })}
          {/* X labels */}
          {xTicks.map(t => (
            <text
              key={t}
              x={padding.left + ((t - tMin) / tRange) * plotW}
              y={viewH - 4}
              textAnchor="middle"
              fontSize="8"
              fill="oklch(55% 0 0)"
            >
              {fmtT(t)}
            </text>
          ))}
          {/* Series */}
          {paths.map((p, i) => (
            <polyline key={i} points={p.points} fill="none" stroke={p.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
    )
  }
)
TimeSeriesChart.displayName = 'TimeSeriesChart'
