'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface StatusPulseProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  motion?: 0 | 1 | 2 | 3
}

const statusPulseStyles = css`
  @layer components {
    @scope (.ui-status-pulse) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Sizes — define the outer bounding box to contain rings */
      :scope[data-size="sm"] {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }
      :scope[data-size="md"] {
        inline-size: 1rem;
        block-size: 1rem;
      }
      :scope[data-size="lg"] {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }

      /* Central dot */
      .ui-status-pulse__dot {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-size="sm"] .ui-status-pulse__dot {
        inline-size: 0.375rem;
        block-size: 0.375rem;
      }
      :scope[data-size="md"] .ui-status-pulse__dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
      }
      :scope[data-size="lg"] .ui-status-pulse__dot {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }

      /* Radiating rings */
      .ui-status-pulse__ring {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        border-radius: var(--radius-full, 9999px);
        border: 1.5px solid currentColor;
        opacity: 0;
        pointer-events: none;
      }
      :scope[data-size="sm"] .ui-status-pulse__ring {
        inline-size: 0.375rem;
        block-size: 0.375rem;
      }
      :scope[data-size="md"] .ui-status-pulse__ring {
        inline-size: 0.5rem;
        block-size: 0.5rem;
      }
      :scope[data-size="lg"] .ui-status-pulse__ring {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }

      /* Status colors */
      :scope[data-status="ok"] {
        color: var(--status-ok, oklch(72% 0.19 145));
      }
      :scope[data-status="ok"] .ui-status-pulse__dot {
        background: var(--status-ok, oklch(72% 0.19 145));
      }
      :scope[data-status="warning"] {
        color: var(--status-warning, oklch(80% 0.15 75));
      }
      :scope[data-status="warning"] .ui-status-pulse__dot {
        background: var(--status-warning, oklch(80% 0.15 75));
      }
      :scope[data-status="critical"] {
        color: var(--status-critical, oklch(63% 0.24 25));
      }
      :scope[data-status="critical"] .ui-status-pulse__dot {
        background: var(--status-critical, oklch(63% 0.24 25));
      }
      :scope[data-status="info"] {
        color: var(--status-info, oklch(65% 0.2 270));
      }
      :scope[data-status="info"] .ui-status-pulse__dot {
        background: var(--status-info, oklch(65% 0.2 270));
      }

      /* Motion level 0: static dot, no rings */
      :scope[data-motion="0"] .ui-status-pulse__ring {
        display: none;
      }

      /* Motion level 1: subtle opacity pulse on dot */
      :scope[data-motion="1"] .ui-status-pulse__dot {
        animation: ui-status-pulse-opacity 2s ease-in-out infinite;
      }
      :scope[data-motion="1"] .ui-status-pulse__ring {
        display: none;
      }

      /* Motion level 2+: full radiating rings */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-status-pulse__ring:nth-child(1) {
        animation: ui-status-pulse-radiate 2.4s ease-out infinite;
        animation-delay: 0s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-status-pulse__ring:nth-child(2) {
        animation: ui-status-pulse-radiate 2.4s ease-out infinite;
        animation-delay: 0.8s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-status-pulse__ring:nth-child(3) {
        animation: ui-status-pulse-radiate 2.4s ease-out infinite;
        animation-delay: 1.6s;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-status-pulse__dot {
          background: ButtonText;
        }
        .ui-status-pulse__ring {
          border-color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-status-pulse__dot {
          animation: none;
        }
        .ui-status-pulse__ring {
          animation: none;
          display: none;
        }
      }
    }

    @keyframes ui-status-pulse-radiate {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }

    @keyframes ui-status-pulse-opacity {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
    }
  }
`

export const StatusPulse = forwardRef<HTMLSpanElement, StatusPulseProps>(
  (
    {
      status,
      size = 'md',
      label,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('status-pulse', statusPulseStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <span
        ref={ref}
        className={cn(cls('root'), className)}
        data-status={status}
        data-size={size}
        data-motion={motionLevel}
        role="img"
        aria-label={label}
        {...rest}
      >
        <span className="ui-status-pulse__dot" aria-hidden="true" />
        <span className="ui-status-pulse__ring" aria-hidden="true" />
        <span className="ui-status-pulse__ring" aria-hidden="true" />
        <span className="ui-status-pulse__ring" aria-hidden="true" />
      </span>
    )
  }
)
StatusPulse.displayName = 'StatusPulse'
