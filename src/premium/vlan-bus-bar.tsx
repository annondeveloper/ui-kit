'use client'

import { type ReactElement } from 'react'

import { type VlanBusBarProps, VlanBusBar as BaseVlanBusBar } from '../domain/vlan-bus-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumVlanBusBarStyles = css`
  @layer premium {
    @scope (.ui-premium-vlan-bus-bar) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Animated segment reveal — segments slide in from left */
      :scope:not([data-motion="0"]) .ui-vlan-bus-bar__segment {
        animation: ui-premium-vbb-segment-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-vbb-segment-reveal {
        0% { transform: scaleX(0); opacity: 0; }
        60% { transform: scaleX(1.05); }
        100% { transform: scaleX(1); opacity: 1; }
      }

      /* Glow on segment hover */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-vlan-bus-bar__segment:hover {
          filter: brightness(1.3) drop-shadow(0 0 6px currentColor);
        }
      }

      /* Aurora gradient behind labels */
      :scope:not([data-motion="0"]) .ui-vlan-bus-bar__label {
        filter: drop-shadow(0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3));
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-vlan-bus-bar__segment {
        animation: none;
        filter: none;
      }
      :scope[data-motion="0"] .ui-vlan-bus-bar__label {
        filter: none;
      }

      /* Motion 1: glow only, no reveal */
      :scope[data-motion="1"] .ui-vlan-bus-bar__segment {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-vlan-bus-bar__segment {
          animation: none !important;
          filter: none !important;
        }
        :scope .ui-vlan-bus-bar__label {
          filter: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-vlan-bus-bar__segment {
          filter: none;
        }
      }
    }
  }
`

export function VlanBusBar({ motion: motionProp, ...rest }: VlanBusBarProps): ReactElement {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-vlan-bus-bar', premiumVlanBusBarStyles)

  return (
    <div className="ui-premium-vlan-bus-bar" data-motion={motionLevel}>
      <BaseVlanBusBar motion={motionProp} {...rest} />
    </div>
  )
}

VlanBusBar.displayName = 'VlanBusBar'
