'use client'

import { forwardRef } from 'react'
import { BorderBeam as BaseBorderBeam, type BorderBeamProps } from '../domain/border-beam'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumBorderBeamStyles = css`
  @layer premium {
    @scope (.ui-premium-border-beam) {
      :scope {
        position: relative;
      }

      /* Multi-color aurora gradient beam */
      :scope .ui-border-beam::before {
        background: conic-gradient(
          from calc(var(--beam-angle, 0) * 1deg),
          transparent 0%,
          transparent 55%,
          oklch(75% 0.2 270) 70%,
          oklch(72% 0.19 330) 80%,
          oklch(70% 0.18 180) 90%,
          transparent 100%
        );
      }

      /* Enhanced glow trail */
      :scope:not([data-motion="0"]) .ui-border-beam::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: conic-gradient(
          from calc(var(--beam-angle, 0) * 1deg),
          transparent 0%,
          transparent 65%,
          oklch(75% 0.15 270 / 0.3) 80%,
          transparent 95%
        );
        filter: blur(8px);
        z-index: -1;
        animation: ui-border-beam-rotate var(--beam-duration, 5s) linear infinite;
        pointer-events: none;
      }

      @keyframes ui-border-beam-rotate {
        from { --beam-angle: 0; }
        to { --beam-angle: 360; }
      }

      /* Aurora color cycling at motion 3 */
      :scope[data-motion="3"] .ui-border-beam::before {
        animation-name: ui-border-beam-rotate, ui-premium-border-hue;
        animation-duration: var(--beam-duration, 5s), 8s;
        animation-timing-function: linear, ease-in-out;
        animation-iteration-count: infinite, infinite;
      }

      @keyframes ui-premium-border-hue {
        0%, 100% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(60deg); }
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-border-beam::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-border-beam::after { display: none; }
        :scope .ui-border-beam::before { animation: none; }
      }
    }
  }
`

export const BorderBeam = forwardRef<HTMLDivElement, BorderBeamProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-border-beam', premiumBorderBeamStyles)

    return (
      <div ref={ref} className="ui-premium-border-beam" data-motion={motionLevel}>
        <BaseBorderBeam motion={motionProp} {...rest} />
      </div>
    )
  }
)

BorderBeam.displayName = 'BorderBeam'
