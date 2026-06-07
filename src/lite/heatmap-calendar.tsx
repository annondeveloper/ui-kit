import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteHeatmapData {
  date: string
  value: number
}

export interface LiteHeatmapCalendarProps extends HTMLAttributes<HTMLDivElement> {
  data: LiteHeatmapData[]
  colorScale?: [string, string]
}

const heatmapCalendarStyles = css`
  @layer components {
    @scope (.ui-lite-heatmap-calendar) {
      :scope {
        position: relative;
        min-inline-size: 200px;
        overflow-x: auto;
      }

      .ui-lite-heatmap-calendar__grid {
        display: flex;
        gap: 2px;
        flex-wrap: wrap;
      }

      .ui-lite-heatmap-calendar__cell {
        inline-size: 12px;
        block-size: 12px;
        border-radius: 2px;
        cursor: default;
      }

      .ui-lite-heatmap-calendar__cell:hover {
        outline: 1px solid var(--border-strong, oklch(100% 0 0 / 0.2));
        outline-offset: -1px;
      }

      @media (forced-colors: active) {
        .ui-lite-heatmap-calendar__cell {
          border: 1px solid CanvasText;
        }
      }
    }
  }
`

export const HeatmapCalendar = forwardRef<HTMLDivElement, LiteHeatmapCalendarProps>(
  ({ data, colorScale = ['oklch(30% 0 0)', 'oklch(72% 0.19 145)'], className, ...rest }, ref) => {
    useStyles('lite-heatmap-calendar', heatmapCalendarStyles)
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
