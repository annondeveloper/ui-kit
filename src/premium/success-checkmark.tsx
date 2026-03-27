'use client'

import { forwardRef } from 'react'
import { SuccessCheckmark as BaseSuccessCheckmark, type SuccessCheckmarkProps } from '../components/success-checkmark'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSuccessCheckmarkStyles = css`
  @layer premium {
    @scope (.ui-premium-success-checkmark) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* ── Spring-draw SVG — bouncier circle and check draw ── */
      :scope .ui-success-checkmark__circle {
        animation: ui-premium-success-circle 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
      }
      :scope .ui-success-checkmark__check {
        animation: ui-premium-success-check 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards !important;
      }

      @keyframes ui-premium-success-circle {
        0% { stroke-dashoffset: 166; }
        70% { stroke-dashoffset: -8; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes ui-premium-success-check {
        0% { stroke-dashoffset: 48; }
        60% { stroke-dashoffset: -4; }
        100% { stroke-dashoffset: 0; }
      }

      /* ── Aurora glow burst on completion ── */
      :scope .ui-success-checkmark {
        position: relative;
      }
      :scope .ui-success-checkmark::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: var(--radius-full, 9999px);
        background: radial-gradient(
          circle,
          oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.3) 0%,
          oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.1) 40%,
          transparent 70%
        );
        opacity: 0;
        animation: ui-premium-success-glow-burst 0.8s ease-out 0.6s forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-success-glow-burst {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        40% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          opacity: 0;
          transform: scale(1.8);
        }
      }

      /* ── Enhanced particle celebration — aurora-colored ── */
      :scope .ui-success-checkmark__particle:nth-child(odd) {
        background: oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.9);
        inline-size: 4px;
        block-size: 4px;
      }
      :scope .ui-success-checkmark__particle:nth-child(even) {
        background: oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.9);
        inline-size: 3px;
        block-size: 3px;
      }
      :scope .ui-success-checkmark__particle {
        box-shadow: 0 0 6px 1px oklch(from var(--status-ok, oklch(72% 0.19 145)) l c h / 0.4);
      }

      /* ── Motion level 0: no effects ── */
      :scope[data-motion="0"] .ui-success-checkmark__circle,
      :scope[data-motion="0"] .ui-success-checkmark__check {
        animation: none !important;
        stroke-dasharray: none !important;
        stroke-dashoffset: 0 !important;
      }
      :scope[data-motion="0"] .ui-success-checkmark::after {
        display: none;
      }

      /* ── Motion level 1: fade only, no draw or burst ── */
      :scope[data-motion="1"] .ui-success-checkmark__circle,
      :scope[data-motion="1"] .ui-success-checkmark__check {
        animation: none !important;
        stroke-dasharray: none !important;
        stroke-dashoffset: 0 !important;
      }
      :scope[data-motion="1"] .ui-success-checkmark::after {
        display: none;
      }

      /* ── Motion level 2: draw without spring overshoot ── */
      :scope[data-motion="2"] .ui-success-checkmark__circle {
        animation-timing-function: ease-out !important;
      }
      :scope[data-motion="2"] .ui-success-checkmark__check {
        animation-timing-function: ease-out !important;
      }
      :scope[data-motion="2"] .ui-success-checkmark::after {
        display: none;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-success-checkmark__circle,
        :scope .ui-success-checkmark__check {
          animation: none !important;
          stroke-dasharray: none !important;
          stroke-dashoffset: 0 !important;
        }
        :scope .ui-success-checkmark::after {
          display: none !important;
        }
        :scope .ui-success-checkmark__particle {
          box-shadow: none;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-success-checkmark::after {
          display: none;
        }
        :scope .ui-success-checkmark__particle {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const SuccessCheckmark = forwardRef<HTMLDivElement, SuccessCheckmarkProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-success-checkmark', premiumSuccessCheckmarkStyles)

    return (
      <div className="ui-premium-success-checkmark" data-motion={motionLevel}>
        <BaseSuccessCheckmark ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

SuccessCheckmark.displayName = 'SuccessCheckmark'
