'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SuccessCheckmarkProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  label?: string
  motion?: 0 | 1 | 2 | 3
}

const SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const
const PARTICLE_COUNT = 8

const successCheckmarkStyles = css`
  @layer components {
    @scope (.ui-success-checkmark) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        inline-size: 32px;
        block-size: 32px;
      }
      :scope[data-size="md"] {
        inline-size: 48px;
        block-size: 48px;
      }
      :scope[data-size="lg"] {
        inline-size: 64px;
        block-size: 64px;
      }

      /* SVG container */
      .ui-success-checkmark__svg {
        inline-size: 100%;
        block-size: 100%;
        overflow: visible;
      }

      /* Circle */
      .ui-success-checkmark__circle {
        fill: none;
        stroke: var(--status-ok, oklch(72% 0.19 145));
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Checkmark path */
      .ui-success-checkmark__check {
        fill: none;
        stroke: oklch(100% 0 0);
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Circle fill for background */
      .ui-success-checkmark__circle-fill {
        fill: var(--status-ok, oklch(72% 0.19 145));
        opacity: 0.15;
      }

      /* ─── Animated: motion level 0 — instant display ──── */
      :scope[data-motion="0"] .ui-success-checkmark__circle,
      :scope[data-animated="false"] .ui-success-checkmark__circle {
        stroke-dasharray: none;
      }
      :scope[data-motion="0"] .ui-success-checkmark__check,
      :scope[data-animated="false"] .ui-success-checkmark__check {
        stroke-dasharray: none;
      }

      /* ─── Animated: motion level 1 — fade in ──── */
      :scope[data-animated="true"][data-motion="1"] {
        animation: ui-success-checkmark-fade 0.4s ease-out both;
      }

      /* ─── Animated: motion level 2+ — draw in ──── */
      :scope[data-animated="true"]:not([data-motion="0"]):not([data-motion="1"]) .ui-success-checkmark__circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        animation: ui-success-checkmark-circle 0.6s var(--ease-out, ease-out) forwards;
      }

      :scope[data-animated="true"]:not([data-motion="0"]):not([data-motion="1"]) .ui-success-checkmark__check {
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: ui-success-checkmark-check 0.35s var(--ease-out, ease-out) 0.5s forwards;
      }

      :scope[data-animated="true"]:not([data-motion="0"]):not([data-motion="1"]) .ui-success-checkmark__circle-fill {
        opacity: 0;
        animation: ui-success-checkmark-fill 0.3s ease-out 0.7s forwards;
      }

      /* ─── Burst particles (motion level 3) ──── */
      .ui-success-checkmark__particle {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        inline-size: 3px;
        block-size: 3px;
        border-radius: var(--radius-full, 9999px);
        background: var(--status-ok, oklch(72% 0.19 145));
        opacity: 0;
        pointer-events: none;
      }

      :scope[data-animated="true"][data-motion="3"] .ui-success-checkmark__particle {
        animation: ui-success-checkmark-burst 0.6s var(--ease-out, ease-out) 0.7s forwards;
      }

      .ui-success-checkmark__particle:nth-child(1) { --angle: 0deg; }
      .ui-success-checkmark__particle:nth-child(2) { --angle: 45deg; }
      .ui-success-checkmark__particle:nth-child(3) { --angle: 90deg; }
      .ui-success-checkmark__particle:nth-child(4) { --angle: 135deg; }
      .ui-success-checkmark__particle:nth-child(5) { --angle: 180deg; }
      .ui-success-checkmark__particle:nth-child(6) { --angle: 225deg; }
      .ui-success-checkmark__particle:nth-child(7) { --angle: 270deg; }
      .ui-success-checkmark__particle:nth-child(8) { --angle: 315deg; }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-success-checkmark__circle {
          stroke: ButtonText;
        }
        .ui-success-checkmark__check {
          stroke: ButtonText;
        }
        .ui-success-checkmark__circle-fill {
          fill: transparent;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope,
        .ui-success-checkmark__circle,
        .ui-success-checkmark__check,
        .ui-success-checkmark__circle-fill,
        .ui-success-checkmark__particle {
          animation: none !important;
          stroke-dasharray: none !important;
          stroke-dashoffset: 0 !important;
          opacity: 1 !important;
        }
        .ui-success-checkmark__circle-fill {
          opacity: 0.15 !important;
        }
        .ui-success-checkmark__particle {
          display: none;
        }
      }
    }

    @keyframes ui-success-checkmark-circle {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes ui-success-checkmark-check {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes ui-success-checkmark-fill {
      to {
        opacity: 0.15;
      }
    }

    @keyframes ui-success-checkmark-fade {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes ui-success-checkmark-burst {
      0% {
        opacity: 1;
        translate: -50% -50%;
      }
      100% {
        opacity: 0;
        translate: calc(-50% + cos(var(--angle, 0deg)) * 20px) calc(-50% + sin(var(--angle, 0deg)) * 20px);
      }
    }
  }
`

export const SuccessCheckmark = forwardRef<HTMLDivElement, SuccessCheckmarkProps>(
  (
    {
      size = 'md',
      animated = true,
      label = 'Success',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('success-checkmark', successCheckmarkStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-animated={String(animated)}
        data-motion={motionLevel}
        role="img"
        aria-label={label}
        {...rest}
      >
        <svg
          className="ui-success-checkmark__svg"
          viewBox="0 0 52 52"
          aria-hidden="true"
        >
          {/* Background fill circle */}
          <circle
            className="ui-success-checkmark__circle-fill"
            cx="26"
            cy="26"
            r="24"
          />
          {/* Stroke circle */}
          <circle
            className="ui-success-checkmark__circle"
            cx="26"
            cy="26"
            r="24"
          />
          {/* Checkmark */}
          <polyline
            className="ui-success-checkmark__check"
            points="16 26 22 32 36 20"
          />
        </svg>
        {/* Burst particles for motion level 3 */}
        {motionLevel >= 3 && animated && Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span
            key={i}
            className="ui-success-checkmark__particle"
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }
)
SuccessCheckmark.displayName = 'SuccessCheckmark'
