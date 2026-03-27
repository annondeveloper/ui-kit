'use client'

import { forwardRef } from 'react'
import { Chip as BaseChip, type ChipProps } from '../components/chip'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-chip) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow when checked */
      :scope .ui-chip[data-checked="true"] {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring scale on toggle */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-chip {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s var(--ease-out, ease-out);
        }
        :scope:not([data-motion="0"]) .ui-chip:hover {
          transform: scale(1.06);
        }
      }

      :scope:not([data-motion="0"]) .ui-chip:active:not([data-disabled="true"]) {
        transform: scale(0.94);
      }

      :scope[data-motion="0"] .ui-chip { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-chip { transition: none; }
      }
    }
  }
`

export const Chip = forwardRef<HTMLLabelElement, ChipProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-chip', premiumStyles)

    return (
      <span className="ui-premium-chip" data-motion={motionLevel}>
        <BaseChip ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Chip.displayName = 'Chip'
