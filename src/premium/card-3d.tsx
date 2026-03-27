'use client'

import { forwardRef } from 'react'
import { Card3D as BaseCard3D, type Card3DProps } from '../domain/card-3d'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumCard3DStyles = css`
  @layer premium {
    @scope (.ui-premium-card-3d) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced glare overlay */
      :scope .ui-card-3d--glare {
        background: radial-gradient(
          circle at var(--glare-x, 50%) var(--glare-y, 50%),
          oklch(100% 0 0 / 0.2) 0%,
          oklch(100% 0 0 / 0.08) 30%,
          transparent 70%
        );
      }

      /* Aurora edge glow */
      :scope:not([data-motion="0"]) .ui-card-3d--inner {
        box-shadow:
          0 0 0 1px oklch(75% 0.15 270 / 0.15),
          0 0 20px -4px oklch(75% 0.2 270 / 0.2),
          0 0 40px -8px oklch(70% 0.15 300 / 0.1);
        transition:
          transform 0.15s var(--ease-out, ease-out),
          box-shadow 0.3s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-card-3d:hover .ui-card-3d--inner {
        box-shadow:
          0 0 0 1px oklch(75% 0.18 270 / 0.25),
          0 0 24px -2px oklch(75% 0.25 270 / 0.3),
          0 0 48px -6px oklch(70% 0.18 300 / 0.15);
      }

      /* Spring tilt physics — overshoot on return */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-card-3d--inner {
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease-out;
      }

      /* Aurora edge cycling at motion 3 */
      :scope[data-motion="3"] .ui-card-3d--inner {
        animation: ui-premium-card3d-aurora 6s ease-in-out infinite;
      }

      @keyframes ui-premium-card3d-aurora {
        0%, 100% {
          box-shadow:
            0 0 0 1px oklch(75% 0.15 270 / 0.15),
            0 0 20px -4px oklch(75% 0.2 270 / 0.2),
            0 0 40px -8px oklch(70% 0.15 300 / 0.1);
        }
        33% {
          box-shadow:
            0 0 0 1px oklch(75% 0.15 330 / 0.15),
            0 0 20px -4px oklch(75% 0.2 330 / 0.2),
            0 0 40px -8px oklch(70% 0.15 30 / 0.1);
        }
        66% {
          box-shadow:
            0 0 0 1px oklch(75% 0.15 180 / 0.15),
            0 0 20px -4px oklch(75% 0.2 180 / 0.2),
            0 0 40px -8px oklch(70% 0.15 220 / 0.1);
        }
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-card-3d--inner {
        box-shadow: none;
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-card-3d--inner { animation: none; box-shadow: none; }
      }
    }
  }
`

export const Card3D = forwardRef<HTMLDivElement, Card3DProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-card-3d', premiumCard3DStyles)

    return (
      <div ref={ref} className="ui-premium-card-3d" data-motion={motionLevel}>
        <BaseCard3D motion={motionProp} {...rest} />
      </div>
    )
  }
)

Card3D.displayName = 'Card3D'
