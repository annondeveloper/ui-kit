'use client'

import { type ReactElement } from 'react'

import { type TopologyGraphProps, TopologyGraph as BaseTopologyGraph } from '../domain/topology-graph'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTopologyGraphStyles = css`
  @layer premium {
    @scope (.ui-premium-topology-graph) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Aurora glow on nodes */
      :scope .ui-topology-graph__node[data-status="ok"] rect {
        filter: drop-shadow(0 0 6px oklch(72% 0.19 155 / 0.35));
      }
      :scope .ui-topology-graph__node[data-status="warning"] rect {
        filter: drop-shadow(0 0 6px oklch(80% 0.18 85 / 0.35));
      }
      :scope .ui-topology-graph__node[data-status="critical"] rect {
        filter: drop-shadow(0 0 6px oklch(62% 0.22 25 / 0.35));
      }
      :scope .ui-topology-graph__node[data-status="maintenance"] rect {
        filter: drop-shadow(0 0 6px oklch(65% 0.15 270 / 0.35));
      }

      /* Selected node spring pulse */
      :scope:not([data-motion="0"]) .ui-topology-graph__node[data-selected] {
        animation: ui-premium-topo-pulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-topo-pulse {
        0% { transform: scale(0.92); }
        60% { transform: scale(1.06); }
        100% { transform: scale(1); }
      }

      /* Enhanced edge animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-topology-graph__edge path[style*="animation"] {
        filter: drop-shadow(0 0 3px oklch(65% 0.2 270 / 0.2));
      }

      /* Enhanced minimap gradient */
      :scope .ui-topology-graph__minimap {
        background: linear-gradient(
          135deg,
          oklch(18% 0.02 270 / 0.9) 0%,
          oklch(20% 0.03 290 / 0.85) 100%
        );
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3), inset 0 1px 0 oklch(100% 0 0 / 0.06);
      }

      /* Enhanced legend */
      :scope .ui-topology-graph__legend {
        background: oklch(18% 0.02 270 / 0.92);
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3),
                    0 0 0 1px oklch(100% 0 0 / 0.06);
      }

      /* Glow on hovered node */
      :scope:not([data-motion="0"]) .ui-topology-graph__node:hover rect {
        filter: drop-shadow(0 0 8px oklch(65% 0.2 270 / 0.3));
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-topology-graph__node rect {
        filter: none;
      }
      :scope[data-motion="0"] .ui-topology-graph__node[data-selected] {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-topology-graph__node {
          animation: none !important;
          filter: none !important;
        }
        :scope .ui-topology-graph__edge path {
          filter: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-topology-graph__node rect {
          filter: none;
        }
      }
    }
  }
`

export function TopologyGraph({ motion: motionProp, ...rest }: TopologyGraphProps): ReactElement {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-topology-graph', premiumTopologyGraphStyles)

  return (
    <div className="ui-premium-topology-graph" data-motion={motionLevel}>
      <BaseTopologyGraph motion={motionProp} {...rest} />
    </div>
  )
}

TopologyGraph.displayName = 'TopologyGraph'
