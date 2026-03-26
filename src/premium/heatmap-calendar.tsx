'use client'

import { HeatmapCalendar as BaseHeatmapCalendar, type HeatmapCalendarProps } from '../domain/heatmap-calendar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumHeatmapStyles = css`
  @layer premium {
    @scope (.ui-premium-heatmap-calendar) {
      :scope {
        position: relative;
      }

      /* Aurora glow on hover cell */
      :scope .ui-heatmap-calendar__cell:hover {
        box-shadow: 0 0 12px oklch(65% 0.2 270 / 0.4);
        filter: brightness(1.15);
        transition: box-shadow 0.2s ease-out, filter 0.2s ease-out;
      }

      /* Shimmer fill on cells with data */
      :scope:not([data-motion="0"]) .ui-heatmap-calendar__cell[data-value]:not([data-value="0"]) {
        background-size: 200% 100%;
        animation: ui-premium-heatmap-shimmer 3s ease-in-out infinite;
      }
      @keyframes ui-premium-heatmap-shimmer {
        0%   { background-position: 100% 50%; }
        50%  { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }

      /* Spring-scale tooltip entrance */
      :scope:not([data-motion="0"]) .ui-heatmap-calendar__tooltip {
        animation: ui-premium-heatmap-tooltip 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-heatmap-tooltip {
        from { opacity: 0; transform: scale(0.85) translateY(4px); }
        70%  { transform: scale(1.04) translateY(-1px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* Cell entrance stagger */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-heatmap-calendar__cell {
        animation: ui-premium-heatmap-cell-enter 0.4s ease-out both;
      }
      @keyframes ui-premium-heatmap-cell-enter {
        from { opacity: 0; transform: scale(0.6); }
        to   { opacity: 1; transform: scale(1); }
      }

      /* Aurora ambient border glow */
      :scope::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 30px oklch(65% 0.12 270 / 0.05);
        pointer-events: none;
      }

      :scope[data-motion="0"] .ui-heatmap-calendar__cell,
      :scope[data-motion="0"] .ui-heatmap-calendar__tooltip {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-heatmap-calendar__cell { animation: none; }
        :scope .ui-heatmap-calendar__tooltip { animation: none; }
      }
    }
  }
`

export function HeatmapCalendar({ motion: motionProp, ...rest }: HeatmapCalendarProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-heatmap-calendar', premiumHeatmapStyles)

  return (
    <div className="ui-premium-heatmap-calendar" data-motion={motionLevel}>
      <BaseHeatmapCalendar motion={motionProp} {...rest} />
    </div>
  )
}

HeatmapCalendar.displayName = 'HeatmapCalendar'
