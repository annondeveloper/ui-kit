'use client'

import { forwardRef } from 'react'
import { DateRangePicker as BaseDateRangePicker, type DateRangePickerProps } from '../components/date-range-picker'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-date-range-picker) {
      :scope {
        display: inline-flex;
      }

      /* Aurora glow on focus */
      :scope:not([data-motion="0"]) .ui-date-range-picker__trigger:focus-within {
        box-shadow: 0 0 14px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring popover entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-date-range-picker__popover {
        animation: ui-premium-drp-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-drp-enter {
        from { opacity: 0; transform: translateY(6px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      :scope[data-motion="0"] .ui-date-range-picker__popover { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-date-range-picker__popover { animation: none; }
      }
    }
  }
`

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-date-range-picker', premiumStyles)

    return (
      <div className="ui-premium-date-range-picker" data-motion={motionLevel}>
        <BaseDateRangePicker ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'
