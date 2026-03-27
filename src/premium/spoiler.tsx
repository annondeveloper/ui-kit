'use client'

import { forwardRef } from 'react'
import { Spoiler as BaseSpoiler, type SpoilerProps } from '../components/spoiler'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-spoiler) {
      :scope {
        display: contents;
      }

      /* Smooth reveal with spring ease */
      :scope:not([data-motion="0"]) .ui-spoiler__content {
        transition: max-height 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.3s var(--ease-out, ease-out);
      }

      /* Spring hover on toggle button */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-spoiler__toggle {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-spoiler__toggle:hover {
          transform: scale(1.06);
        }
      }

      :scope[data-motion="0"] .ui-spoiler__content { transition: none; }
      :scope[data-motion="0"] .ui-spoiler__toggle { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-spoiler__content { transition: none; }
        :scope .ui-spoiler__toggle { transition: none; }
      }
    }
  }
`

export const Spoiler = forwardRef<HTMLDivElement, SpoilerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-spoiler', premiumStyles)

    return (
      <div className="ui-premium-spoiler" data-motion={motionLevel}>
        <BaseSpoiler ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Spoiler.displayName = 'Spoiler'
