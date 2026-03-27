'use client'

import { forwardRef } from 'react'
import { PinInput as BasePinInput, type PinInputProps } from '../components/pin-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-pin-input) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focused cell */
      :scope:not([data-motion="0"]) .ui-pin-input__cell:focus {
        box-shadow: 0 0 14px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Spring entrance stagger */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell {
        animation: ui-premium-pin-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell:nth-child(2) { animation-delay: 30ms; }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell:nth-child(3) { animation-delay: 60ms; }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell:nth-child(4) { animation-delay: 90ms; }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell:nth-child(5) { animation-delay: 120ms; }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__cell:nth-child(6) { animation-delay: 150ms; }
      @keyframes ui-premium-pin-enter {
        from { opacity: 0; transform: scale(0.7) translateY(4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      :scope[data-motion="0"] .ui-pin-input__cell { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-pin-input__cell { animation: none; }
      }
    }
  }
`

export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-pin-input', premiumStyles)

    return (
      <div className="ui-premium-pin-input" data-motion={motionLevel}>
        <BasePinInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

PinInput.displayName = 'PinInput'
