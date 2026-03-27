'use client'

import { forwardRef } from 'react'
import { TracingBeam as BaseTracingBeam, type TracingBeamProps } from '../domain/tracing-beam'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumBeamStyles = css`
  @layer premium {
    @scope (.ui-premium-tracing-beam) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced aurora beam gradient with wider glow */
      :scope:not([data-motion="0"]) .ui-tracing-beam--progress {
        background: linear-gradient(
          to bottom,
          oklch(75% 0.2 270),
          oklch(70% 0.18 300),
          oklch(65% 0.22 240)
        );
        box-shadow:
          0 0 8px 1px oklch(75% 0.15 270 / 0.4),
          0 0 20px 3px oklch(70% 0.12 270 / 0.15);
      }

      /* Enhanced dot glow with pulse on scroll */
      :scope:not([data-motion="0"]) .ui-tracing-beam--dot {
        background: oklch(80% 0.2 270);
        box-shadow:
          0 0 10px 3px oklch(75% 0.2 270 / 0.6),
          0 0 28px 6px oklch(70% 0.15 270 / 0.25);
      }

      /* Glow pulse animation on the dot */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tracing-beam--dot {
        animation: ui-premium-beam-pulse 2s ease-in-out infinite;
      }
      @keyframes ui-premium-beam-pulse {
        0%, 100% {
          box-shadow:
            0 0 10px 3px oklch(75% 0.2 270 / 0.6),
            0 0 28px 6px oklch(70% 0.15 270 / 0.25);
        }
        50% {
          box-shadow:
            0 0 16px 5px oklch(80% 0.22 270 / 0.7),
            0 0 40px 10px oklch(70% 0.18 270 / 0.35);
        }
      }

      /* Aurora glow on the track itself */
      :scope:not([data-motion="0"]) .ui-tracing-beam--track {
        background: linear-gradient(
          to bottom,
          oklch(100% 0 0 / 0.04),
          oklch(65% 0.08 270 / 0.1),
          oklch(100% 0 0 / 0.04)
        );
      }

      /* Motion 0: disable all enhancements */
      :scope[data-motion="0"] .ui-tracing-beam--progress { box-shadow: none; }
      :scope[data-motion="0"] .ui-tracing-beam--dot { animation: none; box-shadow: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-tracing-beam--dot { animation: none; }
        :scope .ui-tracing-beam--progress { box-shadow: none; }
      }
    }
  }
`

export const TracingBeam = forwardRef<HTMLDivElement, TracingBeamProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-tracing-beam', premiumBeamStyles)

    return (
      <div ref={ref} className="ui-premium-tracing-beam" data-motion={motionLevel}>
        <BaseTracingBeam motion={motionProp} {...rest} />
      </div>
    )
  }
)

TracingBeam.displayName = 'TracingBeam'
