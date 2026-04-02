'use client'

import { type NetworkInterfaceGridProps, NetworkInterfaceGrid as BaseNetworkInterfaceGrid } from '../domain/network-interface-grid'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-network-interface-grid) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Aurora glow per status */
      :scope .ui-nig__card[data-status="up"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.4),
                    0 0 16px -4px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
      }
      :scope .ui-nig__card[data-status="down"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.4),
                    0 0 16px -4px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.15);
      }
      :scope .ui-nig__card[data-status="dormant"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.35),
                    0 0 16px -4px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.12);
      }
      :scope .ui-nig__card[data-status="unknown"] {
        box-shadow: 0 0 6px -2px oklch(60% 0 0 / 0.15);
      }

      /* Spring-scale entry animation */
      :scope:not([data-motion="0"]) .ui-nig__card {
        animation: ui-premium-nig-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-nig-enter {
        0% { transform: scale(0.9); opacity: 0.6; }
        60% { transform: scale(1.04); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Hover spring lift */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-nig__card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 6px 20px oklch(0% 0 0 / 0.25),
                      0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        }
      }

      /* Breathing for down cards */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-nig__card[data-status="down"] {
        animation: ui-premium-nig-critical-glow 2s ease-in-out infinite;
      }

      @keyframes ui-premium-nig-critical-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.25); }
      }

      /* Enhanced LED glow */
      :scope:not([data-motion="0"]) .ui-nig__led[data-status="up"] {
        box-shadow: 0 0 4px 1px oklch(72% 0.19 155 / 0.6);
      }
      :scope:not([data-motion="0"]) .ui-nig__led[data-status="down"] {
        box-shadow: 0 0 4px 1px oklch(62% 0.22 25 / 0.5);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-nig__card {
        animation: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-nig__led {
        box-shadow: none;
      }

      /* Motion 1: glow only, no animations */
      :scope[data-motion="1"] .ui-nig__card {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-nig__card {
          animation: none !important;
          filter: none !important;
        }
        :scope .ui-nig__led { box-shadow: none; }
      }

      @media (forced-colors: active) {
        :scope .ui-nig__card {
          box-shadow: none;
        }
      }
    }
  }
`

export function NetworkInterfaceGrid({ motion: motionProp, ...rest }: NetworkInterfaceGridProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-network-interface-grid', premiumStyles)

  return (
    <div className="ui-premium-network-interface-grid" data-motion={motionLevel}>
      <BaseNetworkInterfaceGrid motion={motionProp} {...rest} />
    </div>
  )
}

NetworkInterfaceGrid.displayName = 'NetworkInterfaceGrid'
