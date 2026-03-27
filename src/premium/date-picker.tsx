'use client'

import { forwardRef } from 'react'
import { DatePicker as BaseDatePicker, type DatePickerProps } from '../components/date-picker'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDatePickerStyles = css`
  @layer premium {
    @scope (.ui-premium-date-picker) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring calendar entrance */
      :scope:not([data-motion="0"]) .ui-date-picker__calendar {
        animation: ui-premium-datepicker-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top center;
      }
      @keyframes ui-premium-datepicker-in {
        from {
          opacity: 0;
          transform: scaleY(0.88) translateY(-6px);
        }
        70% {
          transform: scaleY(1.02) translateY(1px);
        }
        to {
          opacity: 1;
          transform: scaleY(1) translateY(0);
        }
      }

      /* Aurora glow on selected date */
      :scope .ui-date-picker__day[data-selected] {
        box-shadow:
          0 0 0 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 32px -6px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.15);
      }

      /* Shimmer on today */
      :scope .ui-date-picker__day[data-today] {
        background-size: 200% 100%;
        background-image: linear-gradient(
          110deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.14) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 55%,
          transparent 100%
        );
        animation: ui-premium-datepicker-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-datepicker-shimmer {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-date-picker__calendar,
      :scope[data-motion="0"] .ui-date-picker__day[data-today] {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-date-picker__calendar { animation: none; }
        :scope .ui-date-picker__day[data-today] { animation: none; }
      }
    }
  }
`

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-date-picker', premiumDatePickerStyles)

    return (
      <span className="ui-premium-date-picker" data-motion={motionLevel}>
        <BaseDatePicker ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

DatePicker.displayName = 'DatePicker'
