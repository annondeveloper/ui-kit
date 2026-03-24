'use client'

import { forwardRef, useState, useCallback } from 'react'
import { Alert as BaseAlert, type AlertProps } from '../components/alert'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumAlertStyles = css`
  @layer premium {
    @scope (.ui-premium-alert) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale entrance with blur-in ── */
      :scope .ui-alert {
        animation: ui-premium-alert-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-alert-enter {
        from {
          opacity: 0;
          transform: scale(0.92);
          filter: blur(4px);
        }
        60% {
          opacity: 1;
          filter: blur(0);
        }
        75% {
          transform: scale(1.015);
        }
        to {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
      }

      /* ── Dismiss animation (scale down + fade out) ── */
      :scope[data-dismissing] .ui-alert {
        animation: ui-premium-alert-dismiss 0.35s cubic-bezier(0.4, 0, 0.7, 0.2) forwards;
      }
      @keyframes ui-premium-alert-dismiss {
        from {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
        to {
          opacity: 0;
          transform: scale(0.92);
          filter: blur(3px);
        }
      }

      /* ── Aurora shimmer line at top edge ── */
      :scope .ui-alert::before {
        content: '';
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        block-size: 2px;
        border-radius: var(--radius-md, 0.375rem) var(--radius-md, 0.375rem) 0 0;
        pointer-events: none;
        animation: ui-premium-alert-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-alert-shimmer {
        from { opacity: 0.5; }
        to { opacity: 1; }
      }

      /* ── Variant shimmer + ambient glow ── */

      /* Info (blue hue ~250) */
      :scope[data-variant="info"] .ui-alert::before {
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--status-info, oklch(65% 0.2 250)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 270 / 0.5) 35%,
          oklch(from var(--status-info, oklch(65% 0.2 250)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 230 / 0.5) 65%,
          oklch(from var(--status-info, oklch(65% 0.2 250)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
      }
      :scope[data-variant="info"] .ui-alert {
        box-shadow:
          0 0 0 1px oklch(from var(--status-info, oklch(65% 0.2 250)) l c h / 0.1),
          0 4px 24px -4px oklch(from var(--status-info, oklch(65% 0.2 250)) l c h / 0.15),
          0 0 48px -8px oklch(from var(--status-info, oklch(65% 0.2 250)) l c h / 0.1);
      }

      /* Success (green hue ~145) */
      :scope[data-variant="success"] .ui-alert::before {
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--status-positive, oklch(65% 0.2 145)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 165 / 0.5) 35%,
          oklch(from var(--status-positive, oklch(65% 0.2 145)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 125 / 0.5) 65%,
          oklch(from var(--status-positive, oklch(65% 0.2 145)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
      }
      :scope[data-variant="success"] .ui-alert {
        box-shadow:
          0 0 0 1px oklch(from var(--status-positive, oklch(65% 0.2 145)) l c h / 0.1),
          0 4px 24px -4px oklch(from var(--status-positive, oklch(65% 0.2 145)) l c h / 0.15),
          0 0 48px -8px oklch(from var(--status-positive, oklch(65% 0.2 145)) l c h / 0.1);
      }

      /* Warning (amber hue ~80) */
      :scope[data-variant="warning"] .ui-alert::before {
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--status-warning, oklch(75% 0.15 80)) calc(l + 0.15) c h / 0.7) 15%,
          oklch(75% 0.15 100 / 0.5) 35%,
          oklch(from var(--status-warning, oklch(75% 0.15 80)) calc(l + 0.2) c h / 0.9) 50%,
          oklch(75% 0.15 60 / 0.5) 65%,
          oklch(from var(--status-warning, oklch(75% 0.15 80)) calc(l + 0.15) c h / 0.7) 85%,
          transparent 100%
        );
      }
      :scope[data-variant="warning"] .ui-alert {
        box-shadow:
          0 0 0 1px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.1),
          0 4px 24px -4px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.15),
          0 0 48px -8px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.1);
      }

      /* Error (red hue ~25) */
      :scope[data-variant="error"] .ui-alert::before {
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--status-critical, oklch(65% 0.25 25)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.2 45 / 0.5) 35%,
          oklch(from var(--status-critical, oklch(65% 0.25 25)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.2 5 / 0.5) 65%,
          oklch(from var(--status-critical, oklch(65% 0.25 25)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
      }
      :scope[data-variant="error"] .ui-alert {
        box-shadow:
          0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.1),
          0 4px 24px -4px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.15),
          0 0 48px -8px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.1);
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-alert {
        animation: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-alert::before {
        animation: none;
        display: none;
      }

      /* ── Motion level 1: subtle — fade only, no spring/blur ── */
      :scope[data-motion="1"] .ui-alert {
        animation: ui-premium-alert-enter-subtle 0.3s ease-out forwards;
      }
      :scope[data-motion="1"] .ui-alert::before {
        animation: none;
        opacity: 0.6;
      }
      :scope[data-motion="1"][data-dismissing] .ui-alert {
        animation: ui-premium-alert-dismiss-subtle 0.25s ease-in forwards;
      }
      @keyframes ui-premium-alert-enter-subtle {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes ui-premium-alert-dismiss-subtle {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      /* ── Motion level 2: moderate — spring without blur ── */
      :scope[data-motion="2"] .ui-alert {
        animation: ui-premium-alert-enter-moderate 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
      }
      :scope[data-motion="2"] .ui-alert::before {
        animation: ui-premium-alert-shimmer 4s ease-in-out infinite alternate;
      }
      :scope[data-motion="2"][data-dismissing] .ui-alert {
        animation: ui-premium-alert-dismiss-moderate 0.3s ease-in forwards;
      }
      @keyframes ui-premium-alert-enter-moderate {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        80% {
          transform: scale(1.005);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes ui-premium-alert-dismiss-moderate {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.95);
        }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-alert {
          animation: none !important;
        }
        :scope .ui-alert::before {
          animation: none !important;
          display: none;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-alert {
          box-shadow: none;
        }
        :scope .ui-alert::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ motion: motionProp, dismissible, onDismiss, variant, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-alert', premiumAlertStyles)
    const [dismissing, setDismissing] = useState(false)

    const handleDismiss = useCallback(() => {
      if (motionLevel === 0) {
        onDismiss?.()
        return
      }

      setDismissing(true)

      // Wait for dismiss animation to complete before calling onDismiss
      const duration = motionLevel === 1 ? 250 : motionLevel === 2 ? 300 : 350
      setTimeout(() => {
        setDismissing(false)
        onDismiss?.()
      }, duration)
    }, [motionLevel, onDismiss])

    return (
      <div
        className="ui-premium-alert"
        data-motion={motionLevel}
        data-variant={variant}
        {...(dismissing ? { 'data-dismissing': '' } : {})}
      >
        <BaseAlert
          ref={ref}
          variant={variant}
          motion={motionProp}
          dismissible={dismissible}
          onDismiss={dismissible ? handleDismiss : undefined}
          {...rest}
        />
      </div>
    )
  }
)

Alert.displayName = 'Alert'
