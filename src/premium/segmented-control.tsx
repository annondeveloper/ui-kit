'use client'

import { forwardRef } from 'react'
import { SegmentedControl as BaseSegmentedControl, type SegmentedControlProps } from '../components/segmented-control'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-segmented-control) {
      :scope {
        display: inline-flex;
      }

      /* Glow on active indicator */
      :scope .ui-segmented__indicator {
        box-shadow: 0 0 12px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Spring indicator slide */
      :scope:not([data-motion="0"]) .ui-segmented__indicator {
        transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s var(--ease-out, ease-out);
      }

      /* Hover scale on segments */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-segmented__option {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-segmented__option:hover {
          transform: scale(1.03);
        }
      }

      :scope[data-motion="0"] .ui-segmented__indicator { transition: none; box-shadow: none; }
      :scope[data-motion="0"] .ui-segmented__option { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-segmented__indicator { transition: none; }
        :scope .ui-segmented__option { transition: none; }
      }
    }
  }
`

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-segmented-control', premiumStyles)

    return (
      <div className="ui-premium-segmented-control" data-motion={motionLevel}>
        <BaseSegmentedControl ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

SegmentedControl.displayName = 'SegmentedControl'
