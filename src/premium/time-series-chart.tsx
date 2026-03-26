'use client'

import { type TimeSeriesChartProps, TimeSeriesChart as BaseTimeSeriesChart } from '../domain/time-series-chart'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTimeSeriesStyles = css`
  @layer premium {
    @scope (.ui-premium-time-series-chart) {
      :scope {
        position: relative;
      }

      /* Aurora glow on series lines */
      :scope:not([data-motion="0"]) .ui-time-series-chart__series-line {
        filter: drop-shadow(0 0 3px oklch(from currentColor l c h / 0.4));
      }

      /* Enhanced line draw with shimmer */
      :scope:not([data-motion="0"]) .ui-time-series-chart__series-line {
        stroke-dasharray: var(--line-len, 2000);
        stroke-dashoffset: var(--line-len, 2000);
        animation: ui-premium-tsc-draw 1.2s ease-out forwards;
      }

      @keyframes ui-premium-tsc-draw {
        to { stroke-dashoffset: 0; }
      }

      /* Shimmer overlay after draw */
      :scope:not([data-motion="0"]):not([data-motion="1"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 92% 0.02 h / 0.2) 50%,
          transparent 100%
        );
        animation: ui-premium-tsc-shimmer 2s ease-in-out 1.2s 1 both;
        pointer-events: none;
      }

      @keyframes ui-premium-tsc-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Enhanced hover dots with glow */
      :scope:not([data-motion="0"]) .ui-time-series-chart__dot {
        filter: drop-shadow(0 0 5px oklch(from currentColor l c h / 0.5));
      }

      /* Crosshair glow */
      :scope:not([data-motion="0"]) .ui-time-series-chart__crosshair {
        stroke: oklch(100% 0 0 / 0.25);
        filter: drop-shadow(0 0 2px oklch(100% 0 0 / 0.15));
      }

      /* Enhanced tooltip */
      :scope .ui-time-series-chart__tooltip-box {
        background: oklch(18% 0.02 270 / 0.92);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.3),
                    0 0 0 1px oklch(100% 0 0 / 0.06);
      }

      /* Grid lines subtle animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-time-series-chart__grid-line {
        animation: ui-premium-tsc-grid-fade 0.6s ease-out both;
      }

      @keyframes ui-premium-tsc-grid-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-time-series-chart__series-line {
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        animation: none;
        filter: none;
      }
      :scope[data-motion="0"]::after { display: none; }
      :scope[data-motion="0"] .ui-time-series-chart__dot { filter: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-time-series-chart__series-line {
          stroke-dasharray: none;
          animation: none;
          filter: none;
        }
        :scope::after { animation: none; display: none; }
        :scope .ui-time-series-chart__grid-line { animation: none; }
      }
    }
  }
`

export function TimeSeriesChart({ motion: motionProp, ...rest }: TimeSeriesChartProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-time-series-chart', premiumTimeSeriesStyles)

  return (
    <div className="ui-premium-time-series-chart" data-motion={motionLevel}>
      <BaseTimeSeriesChart motion={motionProp} {...rest} />
    </div>
  )
}

TimeSeriesChart.displayName = 'TimeSeriesChart'
