'use client'

import { forwardRef } from 'react'
import { StatusBadge as BaseStatusBadge, type StatusBadgeProps } from '../components/status-badge'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumStatusBadgeStyles = css`
  @layer premium {
    @scope (.ui-premium-status-badge) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale entrance ── */
      :scope .ui-status-badge {
        animation: ui-premium-status-badge-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-status-badge-enter {
        0% {
          opacity: 0;
          transform: scale(0.6);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* ── Enhanced pulse glow per status color ── */
      :scope .ui-status-badge__dot::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: var(--radius-full, 9999px);
        opacity: 0;
        pointer-events: none;
      }

      :scope[data-status="ok"] .ui-status-badge__dot::after {
        box-shadow: 0 0 12px 2px oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.5);
        animation: ui-premium-status-badge-glow 2s ease-in-out infinite;
      }
      :scope[data-status="warning"] .ui-status-badge__dot::after {
        box-shadow: 0 0 12px 2px oklch(from var(--status-warning, oklch(80% 0.15 75)) l c h / 0.5);
        animation: ui-premium-status-badge-glow 2s ease-in-out infinite;
      }
      :scope[data-status="critical"] .ui-status-badge__dot::after {
        box-shadow: 0 0 12px 2px oklch(from var(--status-critical, oklch(63% 0.24 25)) l c h / 0.5);
        animation: ui-premium-status-badge-glow 1.5s ease-in-out infinite;
      }
      :scope[data-status="info"] .ui-status-badge__dot::after {
        box-shadow: 0 0 12px 2px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.5);
        animation: ui-premium-status-badge-glow 2s ease-in-out infinite;
      }
      :scope[data-status="unknown"] .ui-status-badge__dot::after,
      :scope[data-status="maintenance"] .ui-status-badge__dot::after {
        display: none;
      }

      @keyframes ui-premium-status-badge-glow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
      }

      /* ── Aurora badge border glow ── */
      :scope[data-status="ok"] .ui-status-badge {
        box-shadow: 0 0 16px -6px oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.2);
      }
      :scope[data-status="warning"] .ui-status-badge {
        box-shadow: 0 0 16px -6px oklch(from var(--status-warning, oklch(80% 0.15 75)) l c h / 0.2);
      }
      :scope[data-status="critical"] .ui-status-badge {
        box-shadow: 0 0 16px -6px oklch(from var(--status-critical, oklch(63% 0.24 25)) l c h / 0.2);
      }
      :scope[data-status="info"] .ui-status-badge {
        box-shadow: 0 0 16px -6px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* ── Motion level 0: no effects ── */
      :scope[data-motion="0"] .ui-status-badge {
        animation: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-status-badge__dot::after {
        display: none;
      }

      /* ── Motion level 1: entrance only, no glow pulse ── */
      :scope[data-motion="1"] .ui-status-badge__dot::after {
        display: none;
      }
      :scope[data-motion="1"] .ui-status-badge {
        animation-duration: 0.3s;
        animation-timing-function: ease-out;
      }

      /* ── Motion level 2: no entrance spring overshoot ── */
      :scope[data-motion="2"] .ui-status-badge {
        animation-timing-function: ease-out;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-status-badge {
          animation: none !important;
          box-shadow: none !important;
        }
        :scope .ui-status-badge__dot::after {
          display: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-status-badge {
          box-shadow: none;
        }
        :scope .ui-status-badge__dot::after {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ motion: motionProp, status, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-status-badge', premiumStatusBadgeStyles)

    return (
      <div
        className="ui-premium-status-badge"
        data-motion={motionLevel}
        data-status={status}
      >
        <BaseStatusBadge ref={ref} status={status} motion={motionProp} {...rest} />
      </div>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'
