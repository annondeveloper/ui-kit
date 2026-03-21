import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteHeatmapData {
  date: string
  value: number
}

export interface LiteHeatmapCalendarProps extends HTMLAttributes<HTMLDivElement> {
  data: LiteHeatmapData[]
  colorScale?: [string, string]
}

export const HeatmapCalendar = forwardRef<HTMLDivElement, LiteHeatmapCalendarProps>(
  ({ data, colorScale = ['oklch(30% 0 0)', 'oklch(72% 0.19 145)'], className, ...rest }, ref) => {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
      <div ref={ref} className={`ui-lite-heatmap-calendar${className ? ` ${className}` : ''}`} {...rest}>
        <div className="ui-lite-heatmap-calendar__grid">
          {data.map(d => (
            <div
              key={d.date}
              className="ui-lite-heatmap-calendar__cell"
              style={{ opacity: 0.15 + (d.value / max) * 0.85, background: colorScale[1] }}
              title={`${d.date}: ${d.value}`}
            />
          ))}
        </div>
      </div>
    )
  }
)
HeatmapCalendar.displayName = 'HeatmapCalendar'
