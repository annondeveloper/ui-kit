'use client'

import { forwardRef } from 'react'
import { RadioGroup as BaseRadioGroup, type RadioGroupProps } from '../components/radio-group'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumRadioGroupStyles = css`
  @layer premium {
    @scope (.ui-premium-radio-group) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale on selection ── */
      :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        animation: ui-premium-radio-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes ui-premium-radio-pop {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.28); }
        70%  { transform: scale(0.9); }
        100% { transform: scale(1); }
      }

      /* ── Aurora glow on checked radio ── */
      :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 14px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 28px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        transition: box-shadow 0.3s var(--ease-out, ease-out);
      }

      /* ── Glow fade out on uncheck ── */
      :scope .ui-radio-group__circle {
        transition: box-shadow 0.25s var(--ease-out, ease-out);
      }

      /* ── Shimmer indicator on checked dot ── */
      :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle .ui-radio-group__dot {
        background: linear-gradient(
          110deg,
          oklch(100% 0 0) 0%,
          oklch(100% 0 0 / 0.6) 40%,
          oklch(100% 0 0) 50%,
          oklch(100% 0 0 / 0.6) 60%,
          oklch(100% 0 0) 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-radio-shimmer 2s ease-in-out infinite;
      }
      @keyframes ui-premium-radio-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        animation: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-radio-group__input:checked ~ .ui-radio-group__circle .ui-radio-group__dot {
        animation: none;
        background: oklch(100% 0 0);
      }

      /* ── Motion level 1: subtle glow only ── */
      :scope[data-motion="1"] .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        animation: none;
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }
      :scope[data-motion="1"] .ui-radio-group__input:checked ~ .ui-radio-group__circle .ui-radio-group__dot {
        animation: none;
        background: oklch(100% 0 0);
      }

      /* ── Motion level 2: conservative spring, softer glow ── */
      :scope[data-motion="2"] .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        animation: ui-premium-radio-pop-soft 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
      }
      @keyframes ui-premium-radio-pop-soft {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.12); }
        100% { transform: scale(1); }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle {
          animation: none !important;
        }
        :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle .ui-radio-group__dot {
          animation: none !important;
          background: oklch(100% 0 0) !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-radio-group__input:checked ~ .ui-radio-group__circle {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-radio-group', premiumRadioGroupStyles)

    return (
      <div className="ui-premium-radio-group" data-motion={motionLevel}>
        <BaseRadioGroup ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
