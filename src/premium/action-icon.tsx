'use client'

import { forwardRef } from 'react'
import { ActionIcon as BaseActionIcon, type ActionIconProps } from '../components/action-icon'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-action-icon) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-action-icon:focus-visible {
        box-shadow: 0 0 14px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Spring hover lift */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-action-icon {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s var(--ease-out, ease-out);
        }
        :scope:not([data-motion="0"]) .ui-action-icon:hover {
          transform: scale(1.1);
        }
      }

      /* Press depression */
      :scope:not([data-motion="0"]) .ui-action-icon:active:not(:disabled) {
        transform: scale(0.92);
      }

      :scope[data-motion="0"] .ui-action-icon { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-action-icon { transition: none; }
      }
    }
  }
`

export const ActionIcon = forwardRef<HTMLButtonElement, ActionIconProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-action-icon', premiumStyles)

    return (
      <span className="ui-premium-action-icon" data-motion={motionLevel}>
        <BaseActionIcon ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

ActionIcon.displayName = 'ActionIcon'
