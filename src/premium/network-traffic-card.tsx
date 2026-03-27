'use client'

import { forwardRef } from 'react'
import { NetworkTrafficCard as BaseNetworkTrafficCard, type NetworkTrafficCardProps } from '../domain/network-traffic-card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTrafficStyles = css`
  @layer premium {
    @scope (.ui-premium-network-traffic-card) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow per status */
      :scope .ui-network-traffic-card[data-status="ok"] {
        box-shadow: 0 0 20px -6px oklch(72% 0.19 155 / 0.25),
                    0 0 40px -12px oklch(72% 0.19 155 / 0.1);
      }
      :scope .ui-network-traffic-card[data-status="warning"] {
        box-shadow: 0 0 20px -6px oklch(80% 0.18 85 / 0.25),
                    0 0 40px -12px oklch(80% 0.18 85 / 0.1);
      }
      :scope .ui-network-traffic-card[data-status="critical"] {
        box-shadow: 0 0 20px -6px oklch(62% 0.22 25 / 0.3),
                    0 0 40px -12px oklch(62% 0.22 25 / 0.15);
      }

      /* Spring-pulse on traffic rate values */
      :scope:not([data-motion="0"]) .ui-network-traffic-card__rate {
        animation: ui-premium-traffic-pulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-traffic-pulse {
        from {
          opacity: 0.6;
          transform: scale(0.92);
        }
        60% {
          transform: scale(1.04);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Shimmer sweep on sparkline */
      :scope:not([data-motion="0"]) .ui-network-traffic-card__sparkline {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]) .ui-network-traffic-card__sparkline::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(65% 0.2 270 / 0.12) 45%,
          oklch(65% 0.2 270 / 0.2) 50%,
          oklch(65% 0.2 270 / 0.12) 55%,
          transparent 100%
        );
        animation: ui-premium-traffic-shimmer 3s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ui-premium-traffic-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }

      /* Status dot enhanced glow */
      :scope .ui-network-traffic-card__status {
        box-shadow: 0 0 8px 2px currentColor;
      }

      /* Motion 0: no animations */
      :scope[data-motion="0"] .ui-network-traffic-card__rate { animation: none; }
      :scope[data-motion="0"] .ui-network-traffic-card__sparkline::after { animation: none; display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-network-traffic-card__rate { animation: none; }
        :scope .ui-network-traffic-card__sparkline::after { animation: none; display: none; }
      }
    }
  }
`

export const NetworkTrafficCard = forwardRef<HTMLDivElement, NetworkTrafficCardProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-network-traffic-card', premiumTrafficStyles)

    return (
      <div className="ui-premium-network-traffic-card" data-motion={motionLevel} ref={ref}>
        <BaseNetworkTrafficCard motion={motionProp} {...rest} />
      </div>
    )
  }
)

NetworkTrafficCard.displayName = 'NetworkTrafficCard'
