'use client'

import { CoreChart as BaseCoreChart, type CoreChartProps } from '../domain/core-chart'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCoreChartStyles = css`
  @layer premium {
    @scope (.ui-premium-core-chart) {
      :scope {
        position: relative;
        display: inline-block;
      }

      /* Subtle cell glow on high usage */
      :scope:not([data-motion="0"]) .ui-core-chart__cell {
        transition: background-color 0.4s ease, box-shadow 0.4s ease;
      }

      :scope:not([data-motion="0"]) .ui-core-chart__cell:hover {
        box-shadow: 0 0 8px 2px oklch(100% 0 0 / 0.15);
      }

      /* Staggered fade-in */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-core-chart__cell {
        animation: ui-premium-core-fadein 0.3s ease both;
      }
      @keyframes ui-premium-core-fadein {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }

      :scope[data-motion="0"] .ui-core-chart__cell {
        transition: none;
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-core-chart__cell { animation: none; transition: none; }
      }
    }
  }
`

export function CoreChart({ motion: motionProp, ...rest }: CoreChartProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-core-chart', premiumCoreChartStyles)

  return (
    <div className="ui-premium-core-chart" data-motion={motionLevel}>
      <BaseCoreChart motion={motionProp} {...rest} />
    </div>
  )
}

CoreChart.displayName = 'CoreChart'
