'use client'

import { RackDiagram as BaseRackDiagram, type RackDiagramProps } from '../domain/rack-diagram'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumRackDiagramStyles = css`
  @layer premium {
    @scope (.ui-premium-rack-diagram) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Status glow on devices */
      :scope:not([data-motion="0"]) .ui-rack-diagram__device[data-status="ok"] {
        box-shadow: inset 0 0 6px oklch(72% 0.19 155 / 0.3);
      }
      :scope:not([data-motion="0"]) .ui-rack-diagram__device[data-status="warning"] {
        box-shadow: inset 0 0 6px oklch(80% 0.18 85 / 0.3);
      }
      :scope:not([data-motion="0"]) .ui-rack-diagram__device[data-status="critical"] {
        box-shadow: inset 0 0 6px oklch(62% 0.22 25 / 0.4);
        animation: ui-premium-rack-pulse 2s ease-in-out infinite;
      }
      @keyframes ui-premium-rack-pulse {
        0%, 100% { box-shadow: inset 0 0 6px oklch(62% 0.22 25 / 0.4); }
        50% { box-shadow: inset 0 0 12px oklch(62% 0.22 25 / 0.6); }
      }

      /* Staggered slide-in */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-rack-diagram__device {
        animation: ui-premium-rack-slidein 0.4s ease both;
      }
      @keyframes ui-premium-rack-slidein {
        from { opacity: 0; transform: translateX(-8px); }
        to { opacity: 1; transform: translateX(0); }
      }

      /* Frame glow */
      :scope:not([data-motion="0"]) .ui-rack-diagram__frame {
        box-shadow: 0 0 12px oklch(100% 0 0 / 0.04);
      }

      :scope[data-motion="0"] .ui-rack-diagram__device { animation: none; }
      :scope[data-motion="0"] .ui-rack-diagram__frame { box-shadow: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-rack-diagram__device { animation: none; }
        :scope .ui-rack-diagram__frame { box-shadow: none; }
      }
    }
  }
`

export function RackDiagram({ motion: motionProp, ...rest }: RackDiagramProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-rack-diagram', premiumRackDiagramStyles)

  return (
    <div className="ui-premium-rack-diagram" data-motion={motionLevel}>
      <BaseRackDiagram motion={motionProp} {...rest} />
    </div>
  )
}

RackDiagram.displayName = 'RackDiagram'
