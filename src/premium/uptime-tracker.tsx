'use client'

import { forwardRef } from 'react'
import { UptimeTracker as BaseUptimeTracker, type UptimeTrackerProps } from '../domain/uptime-tracker'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumUptimeTrackerStyles = css`
  @layer premium {
    @scope (.ui-premium-uptime-tracker) {
      :scope {
        position: relative;
      }

      /* Aurora glow bars based on status */
      :scope .ui-uptime-tracker__day[data-status="up"] {
        box-shadow: 0 0 10px -2px oklch(72% 0.19 155 / 0.4);
      }
      :scope .ui-uptime-tracker__day[data-status="partial"] {
        box-shadow: 0 0 10px -2px oklch(80% 0.18 85 / 0.4);
      }
      :scope .ui-uptime-tracker__day[data-status="down"] {
        box-shadow: 0 0 10px -2px oklch(65% 0.25 25 / 0.4);
      }

      /* Spring-expand details panel */
      :scope:not([data-motion="0"]) .ui-uptime-tracker__details {
        animation: ui-premium-uptime-expand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top center;
      }

      @keyframes ui-premium-uptime-expand {
        from { opacity: 0; transform: scaleY(0.6); }
        70% { transform: scaleY(1.04); }
        to { opacity: 1; transform: scaleY(1); }
      }

      /* Shimmer loading state */
      :scope .ui-uptime-tracker[data-loading="true"] .ui-uptime-tracker__day {
        background: linear-gradient(
          90deg,
          oklch(30% 0.02 270 / 0.3) 0%,
          oklch(50% 0.06 270 / 0.4) 50%,
          oklch(30% 0.02 270 / 0.3) 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-uptime-shimmer 1.5s ease-in-out infinite;
      }

      @keyframes ui-premium-uptime-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Staggered bar entrance */
      :scope:not([data-motion="0"]) .ui-uptime-tracker__day {
        animation: ui-premium-uptime-bar-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--day-index, 0) * 20ms);
      }

      @keyframes ui-premium-uptime-bar-enter {
        from { opacity: 0; transform: scaleY(0.3); }
        to { opacity: 1; transform: scaleY(1); }
      }

      :scope[data-motion="0"] .ui-uptime-tracker__day,
      :scope[data-motion="0"] .ui-uptime-tracker__details {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-uptime-tracker__day { animation: none; }
        :scope .ui-uptime-tracker__details { animation: none; }
      }
    }
  }
`

export const UptimeTracker = forwardRef<HTMLDivElement, UptimeTrackerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-uptime-tracker', premiumUptimeTrackerStyles)

    return (
      <div ref={ref} className="ui-premium-uptime-tracker" data-motion={motionLevel}>
        <BaseUptimeTracker motion={motionProp} {...rest} />
      </div>
    )
  }
)

UptimeTracker.displayName = 'UptimeTracker'
