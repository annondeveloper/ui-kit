'use client'

import { forwardRef } from 'react'
import { AnimatedCounter as BaseAnimatedCounter, type AnimatedCounterProps } from '../components/animated-counter'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumAnimatedCounterStyles = css`
  @layer premium {
    @scope (.ui-premium-animated-counter) {
      :scope {
        display: inline-flex;
        position: relative;
      }

      /* Spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-animated-counter {
        animation: ui-premium-counter-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-counter-enter {
        from {
          opacity: 0;
          transform: scale(0.6);
        }
        60% {
          transform: scale(1.06);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Aurora glow on value change — pulsed via transition */
      :scope:not([data-motion="0"]) .ui-animated-counter[aria-live] {
        text-shadow: 0 0 8px oklch(65% 0.2 270 / 0.3);
        transition: text-shadow 0.4s ease-out;
      }

      /* Shimmer sweep on digits */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-animated-counter {
        background: linear-gradient(
          110deg,
          oklch(90% 0 0 / 0) 30%,
          oklch(90% 0.05 270 / 0.35) 50%,
          oklch(90% 0 0 / 0) 70%
        );
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        animation:
          ui-premium-counter-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
          ui-premium-counter-shimmer 2.5s ease-in-out infinite 0.6s;
      }
      @keyframes ui-premium-counter-shimmer {
        0%, 100% { background-position: 200% center; }
        50% { background-position: -200% center; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-animated-counter {
        animation: none;
        text-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-animated-counter {
          animation: none !important;
          text-shadow: none;
        }
      }
    }
  }
`

export const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-animated-counter', premiumAnimatedCounterStyles)

    return (
      <span className="ui-premium-animated-counter" data-motion={motionLevel}>
        <BaseAnimatedCounter ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

AnimatedCounter.displayName = 'AnimatedCounter'
