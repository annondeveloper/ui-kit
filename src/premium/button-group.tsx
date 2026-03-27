'use client'

import { forwardRef } from 'react'
import { ButtonGroup as BaseButtonGroup, type ButtonGroupProps } from '../components/button-group'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumButtonGroupStyles = css`
  @layer premium {
    @scope (.ui-premium-button-group) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow on the entire group when attached */
      :scope .ui-button-group[data-attached="true"] {
        box-shadow: 0 0 16px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        border-radius: var(--radius-md, 0.5rem);
      }

      /* Stagger entrance for child buttons */
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button {
        animation: ui-premium-button-group-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(2) { animation-delay: 40ms; }
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(3) { animation-delay: 80ms; }
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(4) { animation-delay: 120ms; }
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(5) { animation-delay: 160ms; }
      :scope:not([data-motion="0"]) .ui-button-group > .ui-button:nth-child(6) { animation-delay: 200ms; }

      @keyframes ui-premium-button-group-enter {
        from {
          opacity: 0;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Hover glow on individual buttons at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-button-group > .ui-button:hover {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Spring hover scale at motion 3 */
      :scope[data-motion="3"] .ui-button-group > .ui-button {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.2s var(--ease-out, ease-out);
      }

      :scope[data-motion="3"] .ui-button-group:not([data-attached="true"]) > .ui-button:hover {
        transform: scale(1.03);
      }

      /* Motion 0: disable everything */
      :scope[data-motion="0"] .ui-button-group > .ui-button {
        animation: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-button-group > .ui-button {
          animation: none !important;
          transition: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-button-group[data-attached="true"] {
          box-shadow: none;
        }
        :scope .ui-button-group > .ui-button:hover {
          box-shadow: none;
        }
      }
    }
  }
`

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-button-group', premiumButtonGroupStyles)

    return (
      <div className="ui-premium-button-group" data-motion={motionLevel}>
        <BaseButtonGroup ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

export type { ButtonGroupProps } from '../components/button-group'
