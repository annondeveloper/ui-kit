'use client'

import { forwardRef } from 'react'
import { NotificationStack as BaseNotificationStack, type NotificationStackProps } from '../domain/notification-stack'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumNotificationStyles = css`
  @layer premium {
    @scope (.ui-premium-notification-stack) {
      :scope {
        display: contents;
      }

      /* Spring-slide entrance for each notification */
      :scope:not([data-motion="0"]) .ui-notification {
        animation: ui-premium-notif-slide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(2) { animation-delay: 50ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(3) { animation-delay: 100ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(4) { animation-delay: 150ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(5) { animation-delay: 200ms; }

      @keyframes ui-premium-notif-slide {
        from {
          opacity: 0;
          transform: translateX(-12px) scale(0.96);
        }
        70% {
          transform: translateX(2px) scale(1.01);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      /* Aurora glow per variant */
      :scope .ui-notification[data-variant="success"] {
        box-shadow: inset 0 0 16px -8px oklch(72% 0.19 155 / 0.2);
      }
      :scope .ui-notification[data-variant="warning"] {
        box-shadow: inset 0 0 16px -8px oklch(80% 0.18 85 / 0.2);
      }
      :scope .ui-notification[data-variant="error"] {
        box-shadow: inset 0 0 16px -8px oklch(62% 0.22 25 / 0.25);
      }
      :scope .ui-notification[data-variant="info"] {
        box-shadow: inset 0 0 16px -8px oklch(65% 0.2 270 / 0.2);
      }

      /* Shimmer on dismiss button hover */
      :scope:not([data-motion="0"]) .ui-notification__dismiss:hover {
        background: linear-gradient(
          135deg,
          oklch(100% 0 0 / 0.08) 0%,
          oklch(65% 0.15 270 / 0.12) 50%,
          oklch(100% 0 0 / 0.08) 100%
        );
        background-size: 200% 200%;
        animation: ui-premium-notif-dismiss-shimmer 0.6s ease-out;
      }

      @keyframes ui-premium-notif-dismiss-shimmer {
        from { background-position: 200% 200%; }
        to { background-position: 0% 0%; }
      }

      /* Unread dot aurora pulse */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-notification__unread-dot {
        box-shadow: 0 0 6px 1px oklch(65% 0.2 270 / 0.4);
        animation: ui-premium-notif-dot-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-premium-notif-dot-pulse {
        0%, 100% { box-shadow: 0 0 6px 1px oklch(65% 0.2 270 / 0.4); }
        50% { box-shadow: 0 0 10px 3px oklch(65% 0.2 270 / 0.6); }
      }

      /* Motion 0 */
      :scope[data-motion="0"] .ui-notification { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-notification { animation: none; }
        :scope .ui-notification__unread-dot { animation: none; }
        :scope .ui-notification__dismiss:hover { animation: none; }
      }
    }
  }
`

export const NotificationStack = forwardRef<HTMLDivElement, NotificationStackProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-notification-stack', premiumNotificationStyles)

    return (
      <div className="ui-premium-notification-stack" data-motion={motionLevel} ref={ref}>
        <BaseNotificationStack motion={motionProp} {...rest} />
      </div>
    )
  }
)

NotificationStack.displayName = 'NotificationStack'
