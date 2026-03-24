'use client'

import { forwardRef } from 'react'
import { Progress as BaseProgress, type ProgressProps } from '../components/progress'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumProgressStyles = css`
  @layer premium {
    @scope (.ui-premium-progress) {
      :scope {
        display: contents;
      }

      /* ── Animated shimmer sweep across the filled bar ── */
      :scope .ui-progress__fill {
        position: relative;
        overflow: hidden;
      }
      :scope .ui-progress__fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 25%,
          oklch(100% 0 0 / 0.25) 45%,
          oklch(100% 0 0 / 0.35) 50%,
          oklch(100% 0 0 / 0.25) 55%,
          transparent 75%
        );
        animation: ui-premium-progress-shimmer 2.5s ease-in-out infinite;
      }
      @keyframes ui-premium-progress-shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* ── Aurora glow beneath the progress bar ── */
      :scope .ui-progress__track {
        box-shadow:
          0 4px 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 40px -8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* ── Celebration particles at 100% ── */
      :scope[data-complete] .ui-progress__fill::before {
        content: '';
        position: absolute;
        inset-inline-end: 0;
        inset-block-start: 50%;
        inline-size: 6px;
        block-size: 6px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(95% 0.15 100);
        box-shadow:
          -8px -6px 0 oklch(80% 0.2 150),
          -4px -10px 0 oklch(85% 0.18 200),
          4px -8px 0 oklch(75% 0.22 300),
          -12px -3px 0 oklch(90% 0.15 50),
          8px -5px 0 oklch(80% 0.2 270);
        animation: ui-premium-progress-celebrate 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-progress-celebrate {
        0% {
          opacity: 1;
          transform: translateY(-50%) scale(0);
        }
        40% {
          opacity: 1;
          transform: translateY(-50%) scale(1.5);
        }
        100% {
          opacity: 0;
          transform: translateY(-200%) scale(2);
        }
      }

      /* ── Variant-specific glow colors ── */
      :scope[data-variant="success"] .ui-progress__track {
        box-shadow:
          0 4px 20px -4px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.2),
          0 0 40px -8px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.12);
      }
      :scope[data-variant="warning"] .ui-progress__track {
        box-shadow:
          0 4px 20px -4px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.2),
          0 0 40px -8px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.12);
      }
      :scope[data-variant="danger"] .ui-progress__track {
        box-shadow:
          0 4px 20px -4px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2),
          0 0 40px -8px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.12);
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-progress__fill::after {
        display: none;
      }
      :scope[data-motion="0"] .ui-progress__track {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-progress__fill::before {
        display: none;
      }

      /* ── Motion level 1: subtle glow, no shimmer ── */
      :scope[data-motion="1"] .ui-progress__fill::after {
        display: none;
      }
      :scope[data-motion="1"][data-complete] .ui-progress__fill::before {
        display: none;
      }

      /* ── Motion level 2: slower shimmer, no particles ── */
      :scope[data-motion="2"] .ui-progress__fill::after {
        animation-duration: 4s;
      }
      :scope[data-motion="2"][data-complete] .ui-progress__fill::before {
        display: none;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-progress__fill::after {
          display: none !important;
        }
        :scope .ui-progress__fill::before {
          display: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-progress__track {
          box-shadow: none;
        }
        :scope .ui-progress__fill::after {
          display: none;
        }
        :scope .ui-progress__fill::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ motion: motionProp, value, max = 100, variant, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-progress', premiumProgressStyles)

    const isComplete = value !== undefined && value >= max

    return (
      <div
        className="ui-premium-progress"
        data-motion={motionLevel}
        data-variant={variant}
        {...(isComplete ? { 'data-complete': '' } : {})}
      >
        <BaseProgress ref={ref} value={value} max={max} variant={variant} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Progress.displayName = 'Progress'
