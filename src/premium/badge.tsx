'use client'

import { forwardRef } from 'react'
import { Badge as BaseBadge, type BadgeProps } from '../components/badge'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumBadgeStyles = css`
  @layer premium {
    @scope (.ui-premium-badge) {
      :scope {
        display: inline-flex;
      }

      /* Ambient glow matching variant color */
      :scope .ui-badge[data-variant="primary"] {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }
      :scope .ui-badge[data-variant="success"] {
        box-shadow: 0 0 12px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.35);
      }
      :scope .ui-badge[data-variant="warning"] {
        box-shadow: 0 0 12px -2px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.35);
      }
      :scope .ui-badge[data-variant="danger"] {
        box-shadow: 0 0 12px -2px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.35);
      }
      :scope .ui-badge[data-variant="info"] {
        box-shadow: 0 0 12px -2px oklch(from var(--status-info, oklch(65% 0.2 240)) l c h / 0.35);
      }

      /* Spring-scale entrance animation */
      :scope:not([data-motion="0"]) .ui-badge {
        animation: ui-premium-badge-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-badge-enter {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        70% {
          transform: scale(1.08);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Enhanced pulse on dot indicator */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-badge__dot[data-pulse="true"]::after {
        animation: ui-premium-badge-pulse 1.4s var(--ease-out, ease-out) infinite;
      }
      @keyframes ui-premium-badge-pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(2.2); opacity: 0.3; }
        100% { transform: scale(2.8); opacity: 0; }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-badge {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-badge { animation: none; }
        :scope .ui-badge__dot[data-pulse="true"]::after { animation: none; }
      }
    }
  }
`

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-badge', premiumBadgeStyles)

    return (
      <span className="ui-premium-badge" data-motion={motionLevel}>
        <BaseBadge ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Badge.displayName = 'Badge'
