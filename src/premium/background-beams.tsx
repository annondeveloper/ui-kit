'use client'

import { forwardRef } from 'react'
import { BackgroundBeams as BaseBackgroundBeams, type BackgroundBeamsProps } from '../domain/background-beams'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumBackgroundBeamsStyles = css`
  @layer premium {
    @scope (.ui-premium-background-beams) {
      :scope {
        position: relative;
      }

      /* Enhanced beam glow intensity */
      :scope .ui-background-beams--beam {
        filter: blur(0.5px);
        box-shadow: 0 0 20px 4px oklch(75% 0.2 270 / 0.2);
      }

      /* Aurora color cycling on beams */
      :scope:not([data-motion="0"]) .ui-background-beams--beam {
        animation-name: ui-beam-sweep, ui-premium-beam-aurora;
        animation-duration: var(--beam-duration, 8s), 6s;
        animation-timing-function: linear, ease-in-out;
        animation-iteration-count: infinite, infinite;
      }

      @keyframes ui-premium-beam-aurora {
        0% {
          background: linear-gradient(
            to bottom,
            transparent,
            oklch(75% 0.2 270 / 0.4),
            transparent
          );
        }
        33% {
          background: linear-gradient(
            to bottom,
            transparent,
            oklch(75% 0.2 330 / 0.4),
            transparent
          );
        }
        66% {
          background: linear-gradient(
            to bottom,
            transparent,
            oklch(75% 0.2 180 / 0.4),
            transparent
          );
        }
        100% {
          background: linear-gradient(
            to bottom,
            transparent,
            oklch(75% 0.2 270 / 0.4),
            transparent
          );
        }
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-background-beams--beam {
        animation: none;
        filter: none;
        box-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-background-beams--beam {
          animation: none;
          filter: none;
          box-shadow: none;
        }
      }
    }
  }
`

export const BackgroundBeams = forwardRef<HTMLDivElement, BackgroundBeamsProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-background-beams', premiumBackgroundBeamsStyles)

    return (
      <div ref={ref} className="ui-premium-background-beams" data-motion={motionLevel}>
        <BaseBackgroundBeams motion={motionProp} {...rest} />
      </div>
    )
  }
)

BackgroundBeams.displayName = 'BackgroundBeams'
