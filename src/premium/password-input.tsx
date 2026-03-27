'use client'

import { forwardRef } from 'react'
import { PasswordInput as BasePasswordInput, type PasswordInputProps } from '../components/password-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-password-input) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-password-input__field:focus {
        box-shadow: 0 0 14px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring toggle button */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-password-input__toggle {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-password-input__toggle:hover {
          transform: scale(1.15);
        }
      }

      :scope:not([data-motion="0"]) .ui-password-input__toggle:active {
        transform: scale(0.9);
      }

      :scope[data-motion="0"] .ui-password-input__toggle { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-password-input__toggle { transition: none; }
      }
    }
  }
`

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-password-input', premiumStyles)

    return (
      <div className="ui-premium-password-input" data-motion={motionLevel}>
        <BasePasswordInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
