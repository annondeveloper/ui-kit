'use client'

import { forwardRef } from 'react'
import { ToggleSwitch as BaseToggleSwitch, type ToggleSwitchProps } from '../components/toggle-switch'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumToggleSwitchStyles = css`
  @layer premium {
    @scope (.ui-premium-toggle-switch) {
      :scope {
        display: contents;
      }

      /* ── Spring-bounce thumb animation on toggle ── */
      :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        animation: ui-premium-toggle-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes ui-premium-toggle-bounce {
        0%   { transform: scale(1); }
        30%  { transform: scale(0.8, 1.15); }
        50%  { transform: scale(1.2, 0.85); }
        70%  { transform: scale(0.95, 1.05); }
        100% { transform: scale(1); }
      }

      /* ── Brand glow trail behind thumb when checked ── */
      :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
        box-shadow:
          0 0 0 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 20px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 40px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        transition: box-shadow 0.35s var(--ease-out, ease-out);
      }

      /* ── Glow trail on the thumb itself ── */
      :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        box-shadow:
          0 0 8px 2px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h / 0.4),
          0 0 16px 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* ── Fade glow on uncheck ── */
      :scope .ui-toggle-switch__track {
        transition: box-shadow 0.25s var(--ease-out, ease-out);
      }
      :scope .ui-toggle-switch__thumb {
        transition: box-shadow 0.25s var(--ease-out, ease-out);
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        animation: none;
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
      }

      /* ── Motion level 1: subtle glow only, no bounce ── */
      :scope[data-motion="1"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        animation: none;
      }
      :scope[data-motion="1"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
        box-shadow: 0 0 0 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* ── Motion level 2: softer bounce ── */
      :scope[data-motion="2"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        animation: ui-premium-toggle-bounce-soft 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
      }
      @keyframes ui-premium-toggle-bounce-soft {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.1, 0.9); }
        100% { transform: scale(1); }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
          animation: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
          box-shadow: none;
        }
        :scope .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-toggle-switch', premiumToggleSwitchStyles)

    return (
      <div className="ui-premium-toggle-switch" data-motion={motionLevel}>
        <BaseToggleSwitch ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'
