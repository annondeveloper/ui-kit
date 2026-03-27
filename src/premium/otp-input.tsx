'use client'

import { forwardRef } from 'react'
import { OtpInput as BaseOtpInput, type OtpInputProps } from '../components/otp-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumOtpStyles = css`
  @layer premium {
    @scope (.ui-premium-otp-input) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow focus ring */
      :scope .ui-otp-input__digit:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Spring-scale on digit entry — motion 1+ */
      :scope:not([data-motion="0"]) .ui-otp-input__digit {
        transition:
          border-color 0.15s ease-out,
          box-shadow 0.25s ease-out,
          transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope:not([data-motion="0"]) .ui-otp-input__digit:not(:placeholder-shown),
      :scope:not([data-motion="0"]) .ui-otp-input__digit[data-filled] {
        animation: ui-premium-otp-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes ui-premium-otp-pop {
        0% { transform: scale(1); }
        40% { transform: scale(1.12); }
        70% { transform: scale(0.96); }
        100% { transform: scale(1); }
      }

      /* Celebration particles on complete — motion 2+ */
      :scope[data-complete]:not([data-motion="0"]):not([data-motion="1"])::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: var(--radius-lg, 0.5rem);
        background: radial-gradient(
          circle at 50% 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15) 0%,
          transparent 70%
        );
        animation: ui-premium-otp-celebrate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        pointer-events: none;
      }

      :scope[data-complete]:not([data-motion="0"]):not([data-motion="1"]) .ui-otp-input__digit {
        border-color: var(--status-ok, oklch(72% 0.19 155));
        box-shadow: 0 0 12px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.3);
        animation: ui-premium-otp-success 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes ui-premium-otp-celebrate {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: scale(1.4); }
      }

      @keyframes ui-premium-otp-success {
        0% { transform: scale(1); }
        50% { transform: scale(1.08); }
        100% { transform: scale(1); }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-otp-input__digit {
        animation: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-otp-input__digit { animation: none; }
        :scope::after { animation: none; display: none; }
      }
    }
  }
`

export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  ({ motion: motionProp, onComplete, value, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-otp-input', premiumOtpStyles)

    const length = rest.length ?? 6
    const isComplete = (value?.length ?? 0) >= length

    return (
      <span
        className="ui-premium-otp-input"
        data-motion={motionLevel}
        data-complete={isComplete || undefined}
        style={{ position: 'relative' }}
      >
        <BaseOtpInput
          ref={ref}
          motion={motionProp}
          value={value}
          onComplete={onComplete}
          {...rest}
        />
      </span>
    )
  }
)

OtpInput.displayName = 'OtpInput'
