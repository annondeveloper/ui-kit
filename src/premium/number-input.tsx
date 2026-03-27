'use client'

import { forwardRef } from 'react'
import { NumberInput as BaseNumberInput, type NumberInputProps } from '../components/number-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-number-input) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-number-input__field:focus {
        box-shadow: 0 0 14px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring scale on stepper buttons */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-number-input__btn {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-number-input__btn:hover {
          transform: scale(1.12);
        }
      }

      :scope:not([data-motion="0"]) .ui-number-input__btn:active {
        transform: scale(0.9);
      }

      :scope[data-motion="0"] .ui-number-input__btn { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-number-input__btn { transition: none; }
      }
    }
  }
`

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-number-input', premiumStyles)

    return (
      <div className="ui-premium-number-input" data-motion={motionLevel}>
        <BaseNumberInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'
