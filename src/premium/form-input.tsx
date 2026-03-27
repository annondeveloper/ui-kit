'use client'

import { forwardRef } from 'react'
import { FormInput as BaseFormInput, type FormInputProps } from '../components/form-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumFormInputStyles = css`
  @layer premium {
    @scope (.ui-premium-form-input) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow focus ring */
      :scope .ui-form-input__field:focus {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 32px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Spring-shake on error */
      :scope:not([data-motion="0"]) .ui-form-input[data-invalid] .ui-form-input__field-wrapper {
        animation: ui-premium-input-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      @keyframes ui-premium-input-shake {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-6px); }
        30% { transform: translateX(5px); }
        45% { transform: translateX(-4px); }
        60% { transform: translateX(3px); }
        75% { transform: translateX(-1px); }
      }

      /* Shimmer on valid — when focused and not invalid */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-form-input:not([data-invalid]) .ui-form-input__field:focus::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h / 0.12) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        pointer-events: none;
        animation: ui-premium-input-shimmer 2s ease-in-out infinite;
      }

      /* Shimmer via field-wrapper instead (input can't have ::after) */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-form-input:not([data-invalid]) .ui-form-input__field-wrapper {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-form-input:not([data-invalid]) .ui-form-input__field-wrapper:has(.ui-form-input__field:focus)::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-md, 0.375rem);
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 45%,
          oklch(100% 0 0 / 0.1) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        pointer-events: none;
        animation: ui-premium-input-shimmer 2s ease-in-out infinite;
      }
      @keyframes ui-premium-input-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -50% center; }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-form-input__field-wrapper {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-form-input__field-wrapper { animation: none; }
        :scope .ui-form-input__field-wrapper::after { animation: none; }
      }
    }
  }
`

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-form-input', premiumFormInputStyles)

    return (
      <div className="ui-premium-form-input" data-motion={motionLevel}>
        <BaseFormInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
