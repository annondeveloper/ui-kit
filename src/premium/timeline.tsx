'use client'

import { forwardRef } from 'react'
import { Timeline as BaseTimeline, type TimelineProps, type TimelineItem } from '../components/timeline'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTimelineStyles = css`
  @layer premium {
    @scope (.ui-premium-timeline) {
      :scope {
        position: relative;
      }

      /* Aurora glow on active dot */
      :scope .ui-timeline__dot[data-status="active"] {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Completed dot glow */
      :scope .ui-timeline__dot[data-status="completed"] {
        box-shadow: 0 0 10px -2px oklch(72% 0.19 145 / 0.3);
      }

      /* Error dot glow */
      :scope .ui-timeline__dot[data-status="error"] {
        box-shadow: 0 0 10px -2px oklch(65% 0.25 25 / 0.3);
      }

      /* Connector shimmer at motion level 3 */
      :scope[data-motion="3"] .ui-timeline::before {
        background: linear-gradient(
          180deg,
          var(--border-subtle, oklch(50% 0 0 / 0.2)) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3) 50%,
          var(--border-subtle, oklch(50% 0 0 / 0.2)) 100%
        );
        background-size: 100% 200%;
        animation: ui-premium-timeline-shimmer 3s ease-in-out infinite;
      }

      @keyframes ui-premium-timeline-shimmer {
        0%   { background-position: 0 0; }
        50%  { background-position: 0 100%; }
        100% { background-position: 0 0; }
      }

      /* Stagger entrance with spring easing at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-timeline__item {
        animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Dot spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-timeline__dot {
        animation: ui-premium-timeline-dot-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-timeline-dot-enter {
        from {
          opacity: 0;
          transform: scale(0.4);
        }
        70% {
          transform: scale(1.1);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Stagger dot animation delays */
      :scope .ui-timeline__item:nth-child(1) .ui-timeline__dot { animation-delay: 0ms; }
      :scope .ui-timeline__item:nth-child(2) .ui-timeline__dot { animation-delay: 80ms; }
      :scope .ui-timeline__item:nth-child(3) .ui-timeline__dot { animation-delay: 160ms; }
      :scope .ui-timeline__item:nth-child(4) .ui-timeline__dot { animation-delay: 240ms; }
      :scope .ui-timeline__item:nth-child(5) .ui-timeline__dot { animation-delay: 320ms; }
      :scope .ui-timeline__item:nth-child(6) .ui-timeline__dot { animation-delay: 400ms; }
      :scope .ui-timeline__item:nth-child(7) .ui-timeline__dot { animation-delay: 480ms; }
      :scope .ui-timeline__item:nth-child(8) .ui-timeline__dot { animation-delay: 560ms; }

      /* Motion 0: disable everything */
      :scope[data-motion="0"] .ui-timeline__dot {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-timeline__dot { animation: none; }
        :scope .ui-timeline::before { animation: none; }
      }

      @media (forced-colors: active) {
        :scope .ui-timeline__dot {
          box-shadow: none;
        }
      }
    }
  }
`

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-timeline', premiumTimelineStyles)

    return (
      <div className="ui-premium-timeline" data-motion={motionLevel}>
        <BaseTimeline ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Timeline.displayName = 'Timeline'

export type { TimelineProps, TimelineItem } from '../components/timeline'
