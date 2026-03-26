'use client'

import { forwardRef } from 'react'
import { OrbitingCircles as BaseOrbitingCircles, type OrbitingCirclesProps } from '../domain/orbiting-circles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumOrbitingStyles = css`
  @layer premium {
    @scope (.ui-premium-orbiting-circles) {
      :scope {
        display: contents;
      }

      /* Aurora glow on the orbit track */
      :scope .ui-orbiting-circles::before {
        border-color: oklch(65% 0.15 270 / 0.15);
        box-shadow: 0 0 20px 2px oklch(65% 0.15 270 / 0.08),
                    inset 0 0 20px 2px oklch(70% 0.12 300 / 0.06);
      }

      /* Aurora color cycling on orbit ring at motion >= 2 */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-orbiting-circles::before {
        animation: ui-premium-orbit-aurora 8s ease-in-out infinite;
      }

      @keyframes ui-premium-orbit-aurora {
        0%, 100% {
          border-color: oklch(65% 0.15 270 / 0.15);
          box-shadow: 0 0 20px 2px oklch(65% 0.15 270 / 0.08), inset 0 0 20px 2px oklch(70% 0.12 300 / 0.06);
        }
        33% {
          border-color: oklch(70% 0.15 300 / 0.15);
          box-shadow: 0 0 20px 2px oklch(70% 0.15 300 / 0.08), inset 0 0 20px 2px oklch(65% 0.12 330 / 0.06);
        }
        66% {
          border-color: oklch(68% 0.12 200 / 0.15);
          box-shadow: 0 0 20px 2px oklch(68% 0.12 200 / 0.08), inset 0 0 20px 2px oklch(72% 0.1 240 / 0.06);
        }
      }

      /* Enhanced trails on orbiting items */
      :scope:not([data-motion="0"]) .ui-orbiting-circles--item::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          oklch(65% 0.2 270 / 0.2) 0%,
          oklch(70% 0.15 300 / 0.08) 50%,
          transparent 70%
        );
        pointer-events: none;
        filter: blur(4px);
      }

      /* Cinematic: trailing glow comet tail */
      :scope:not([data-motion="0"]):not([data-motion="1"]):not([data-motion="2"]) .ui-orbiting-circles--item::before {
        content: '';
        position: absolute;
        inset-inline-end: 100%;
        inset-block-start: 25%;
        inline-size: 1.5rem;
        block-size: 50%;
        background: linear-gradient(to left, oklch(65% 0.2 270 / 0.15), transparent);
        border-radius: 9999px;
        pointer-events: none;
        filter: blur(3px);
      }

      /* Glow on each item */
      :scope .ui-orbiting-circles--item > * {
        filter: drop-shadow(0 0 6px oklch(65% 0.2 270 / 0.3));
      }

      /* Motion 0: no trails */
      :scope[data-motion="0"] .ui-orbiting-circles--item::after,
      :scope[data-motion="0"] .ui-orbiting-circles--item::before {
        display: none;
      }
      :scope[data-motion="0"] .ui-orbiting-circles--item > * {
        filter: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-orbiting-circles::before { animation: none; }
        :scope .ui-orbiting-circles--item::after,
        :scope .ui-orbiting-circles--item::before { display: none; }
        :scope .ui-orbiting-circles--item > * { filter: none; }
      }
    }
  }
`

export const OrbitingCircles = forwardRef<HTMLDivElement, OrbitingCirclesProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-orbiting-circles', premiumOrbitingStyles)

    return (
      <div className="ui-premium-orbiting-circles" data-motion={motionLevel} ref={ref}>
        <BaseOrbitingCircles motion={motionProp} {...rest} />
      </div>
    )
  }
)

OrbitingCircles.displayName = 'OrbitingCircles'
