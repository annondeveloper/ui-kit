'use client'

import { forwardRef } from 'react'
import { Calendar as BaseCalendar, type CalendarProps } from '../components/calendar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-calendar) {
      :scope {
        display: inline-flex;
      }

      /* Subtle glow on selected day */
      :scope .ui-calendar__day[data-selected="true"] {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Spring hover on day cells */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-calendar__day {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background-color 0.2s;
        }
        :scope:not([data-motion="0"]) .ui-calendar__day:hover:not(:disabled) {
          transform: scale(1.12);
        }
      }

      /* Month transition fade */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-calendar__grid {
        animation: ui-premium-calendar-enter 0.25s ease-out;
      }
      @keyframes ui-premium-calendar-enter {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      :scope[data-motion="0"] .ui-calendar__day { transition: none; }
      :scope[data-motion="0"] .ui-calendar__grid { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-calendar__day { transition: none; }
        :scope .ui-calendar__grid { animation: none; }
      }
    }
  }
`

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-calendar', premiumStyles)

    return (
      <div className="ui-premium-calendar" data-motion={motionLevel}>
        <BaseCalendar ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Calendar.displayName = 'Calendar'
