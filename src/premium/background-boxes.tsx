'use client'

import { forwardRef } from 'react'
import { BackgroundBoxes as BaseBackgroundBoxes, type BackgroundBoxesProps } from '../domain/background-boxes'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumBackgroundBoxesStyles = css`
  @layer premium {
    @scope (.ui-premium-background-boxes) {
      :scope {
        position: relative;
      }

      /* Aurora glow on hover for individual boxes */
      :scope .ui-background-boxes--box {
        transition: box-shadow 0.3s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :scope:not([data-motion="0"]) .ui-background-boxes--box:hover {
        box-shadow:
          0 0 16px 2px oklch(75% 0.2 270 / 0.3),
          0 0 32px 4px oklch(70% 0.15 300 / 0.15);
        z-index: 1;
      }

      /* Spring-scale individual boxes on hover */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-background-boxes--box:hover {
        transform: scale(1.15);
      }

      :scope:not([data-motion="0"]) .ui-background-boxes--box:active {
        transform: scale(0.95);
        transition-duration: 0.1s;
      }

      /* Aurora color shift on grid at higher motion */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-background-boxes--grid {
        animation: ui-premium-boxes-aurora-shift 10s ease-in-out infinite;
      }

      @keyframes ui-premium-boxes-aurora-shift {
        0%, 100% {
          filter: hue-rotate(0deg);
        }
        50% {
          filter: hue-rotate(40deg);
        }
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-background-boxes--box {
        transition: none;
      }
      :scope[data-motion="0"] .ui-background-boxes--grid {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-background-boxes--box { transition: none; }
        :scope .ui-background-boxes--grid { animation: none; }
      }
    }
  }
`

export const BackgroundBoxes = forwardRef<HTMLDivElement, BackgroundBoxesProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-background-boxes', premiumBackgroundBoxesStyles)

    return (
      <div ref={ref} className="ui-premium-background-boxes" data-motion={motionLevel}>
        <BaseBackgroundBoxes motion={motionProp} {...rest} />
      </div>
    )
  }
)

BackgroundBoxes.displayName = 'BackgroundBoxes'
