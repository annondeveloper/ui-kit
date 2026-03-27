'use client'

import { forwardRef } from 'react'
import { Checkbox as BaseCheckbox, type CheckboxProps } from '../components/checkbox'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumCheckboxStyles = css`
  @layer premium {
    @scope (.ui-premium-checkbox) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* ── Spring-scale check animation ── */
      :scope .ui-checkbox__input:checked ~ .ui-checkbox__box {
        animation: ui-premium-checkbox-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes ui-premium-checkbox-pop {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.25); }
        70%  { transform: scale(0.92); }
        100% { transform: scale(1); }
      }

      /* ── Brand-colored glow when checked ── */
      :scope .ui-checkbox__input:checked ~ .ui-checkbox__box {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25),
          0 0 32px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        transition: box-shadow 0.3s var(--ease-out, ease-out);
      }

      /* ── Glow fade out on uncheck ── */
      :scope .ui-checkbox__box {
        transition: box-shadow 0.25s var(--ease-out, ease-out);
      }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-checkbox__input:checked ~ .ui-checkbox__box {
        animation: none;
        box-shadow: none;
      }

      /* ── Motion level 1: subtle glow only, no spring ── */
      :scope[data-motion="1"] .ui-checkbox__input:checked ~ .ui-checkbox__box {
        animation: none;
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* ── Motion level 2: conservative spring, softer glow ── */
      :scope[data-motion="2"] .ui-checkbox__input:checked ~ .ui-checkbox__box {
        animation: ui-premium-checkbox-pop-soft 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
      }
      @keyframes ui-premium-checkbox-pop-soft {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.12); }
        100% { transform: scale(1); }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-checkbox__input:checked ~ .ui-checkbox__box {
          animation: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-checkbox__input:checked ~ .ui-checkbox__box {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-checkbox', premiumCheckboxStyles)

    return (
      <div className="ui-premium-checkbox" data-motion={motionLevel}>
        <BaseCheckbox ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
