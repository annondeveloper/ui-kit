'use client'

import { forwardRef } from 'react'
import { StatusPulse as BaseStatusPulse, type StatusPulseProps } from '../components/status-pulse'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumStatusPulseStyles = css`
  @layer premium {
    @scope (.ui-premium-status-pulse) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale entrance ── */
      :scope .ui-status-pulse {
        animation: ui-premium-status-pulse-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-status-pulse-enter {
        0% {
          opacity: 0;
          transform: scale(0);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* ── Ambient aurora glow behind dot ── */
      :scope[data-status="ok"] .ui-status-pulse__dot {
        box-shadow:
          0 0 10px 2px oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.4),
          0 0 24px 4px oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.15);
      }
      :scope[data-status="warning"] .ui-status-pulse__dot {
        box-shadow:
          0 0 10px 2px oklch(from var(--status-warning, oklch(80% 0.15 75)) l c h / 0.4),
          0 0 24px 4px oklch(from var(--status-warning, oklch(80% 0.15 75)) l c h / 0.15);
      }
      :scope[data-status="critical"] .ui-status-pulse__dot {
        box-shadow:
          0 0 10px 2px oklch(from var(--status-critical, oklch(63% 0.24 25)) l c h / 0.4),
          0 0 24px 4px oklch(from var(--status-critical, oklch(63% 0.24 25)) l c h / 0.15);
      }
      :scope[data-status="info"] .ui-status-pulse__dot {
        box-shadow:
          0 0 10px 2px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 24px 4px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* ── Multi-ring aurora pulse — override base ring colors with gradients ── */
      :scope .ui-status-pulse__ring {
        border-width: 2px;
        border-style: solid;
        border-color: currentColor;
      }
      :scope .ui-status-pulse__ring:nth-child(2) {
        opacity: 0;
        border-color: oklch(from currentColor calc(l + 0.1) calc(c * 0.8) h);
      }
      :scope .ui-status-pulse__ring:nth-child(3) {
        opacity: 0;
        border-color: oklch(from currentColor calc(l + 0.15) calc(c * 0.6) h);
      }

      /* ── Ambient glow breathing on dot ── */
      :scope:not([data-motion="0"]) .ui-status-pulse__dot {
        animation: ui-premium-status-pulse-glow 2.5s ease-in-out infinite;
      }
      @keyframes ui-premium-status-pulse-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }

      /* ── Motion level 0: no effects ── */
      :scope[data-motion="0"] .ui-status-pulse {
        animation: none;
      }
      :scope[data-motion="0"] .ui-status-pulse__dot {
        box-shadow: none;
        animation: none;
      }

      /* ── Motion level 1: entrance only ── */
      :scope[data-motion="1"] .ui-status-pulse__dot {
        animation: none;
      }
      :scope[data-motion="1"] .ui-status-pulse {
        animation-duration: 0.3s;
        animation-timing-function: ease-out;
      }

      /* ── Motion level 2: no spring overshoot ── */
      :scope[data-motion="2"] .ui-status-pulse {
        animation-timing-function: ease-out;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-status-pulse {
          animation: none !important;
        }
        :scope .ui-status-pulse__dot {
          box-shadow: none !important;
          animation: none !important;
          filter: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-status-pulse__dot {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const StatusPulse = forwardRef<HTMLSpanElement, StatusPulseProps>(
  ({ motion: motionProp, status, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-status-pulse', premiumStatusPulseStyles)

    return (
      <div
        className="ui-premium-status-pulse"
        data-motion={motionLevel}
        data-status={status}
      >
        <BaseStatusPulse ref={ref} status={status} motion={motionProp} {...rest} />
      </div>
    )
  }
)

StatusPulse.displayName = 'StatusPulse'
