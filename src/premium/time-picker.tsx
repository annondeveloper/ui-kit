'use client'

import { forwardRef } from 'react'
import { TimePicker as BaseTimePicker, type TimePickerProps } from '../components/time-picker'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-time-picker) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-time-picker__input:focus {
        box-shadow: 0 0 14px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring dropdown entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-time-picker__dropdown {
        animation: ui-premium-tp-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-tp-enter {
        from { opacity: 0; transform: translateY(6px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      :scope[data-motion="0"] .ui-time-picker__dropdown { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-time-picker__dropdown { animation: none; }
      }
    }
  }
`

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-time-picker', premiumStyles)

    return (
      <div className="ui-premium-time-picker" data-motion={motionLevel}>
        <BaseTimePicker ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

TimePicker.displayName = 'TimePicker'
