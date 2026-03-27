'use client'

import { forwardRef } from 'react'
import { BackToTop as BaseBackToTop, type BackToTopProps } from '../components/back-to-top'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-back-to-top) {
      :scope {
        display: contents;
      }

      /* Aurora glow pulse */
      :scope:not([data-motion="0"]) .ui-back-to-top {
        box-shadow: 0 0 16px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s var(--ease-out, ease-out);
      }

      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-back-to-top:hover {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 0 24px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.45);
        }
      }

      :scope:not([data-motion="0"]) .ui-back-to-top:active {
        transform: scale(0.93);
      }

      :scope[data-motion="0"] .ui-back-to-top { transition: none; box-shadow: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-back-to-top { transition: none; box-shadow: none; }
      }
    }
  }
`

export const BackToTop = forwardRef<HTMLButtonElement, BackToTopProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-back-to-top', premiumStyles)

    return (
      <span className="ui-premium-back-to-top" data-motion={motionLevel}>
        <BaseBackToTop ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

BackToTop.displayName = 'BackToTop'
