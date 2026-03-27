'use client'

import { forwardRef } from 'react'
import { Combobox as BaseCombobox, type ComboboxProps } from '../components/combobox'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumComboboxStyles = css`
  @layer premium {
    @scope (.ui-premium-combobox) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on trigger when focused */
      :scope .ui-combobox__input:focus-visible {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25),
          0 0 40px -8px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.12);
      }

      /* Spring-animated dropdown entrance */
      :scope:not([data-motion="0"]) .ui-combobox__dropdown {
        animation: ui-premium-combobox-drop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top center;
      }
      @keyframes ui-premium-combobox-drop {
        from {
          opacity: 0;
          transform: scaleY(0.9) translateY(-8px);
        }
        70% {
          transform: scaleY(1.01) translateY(1px);
        }
        to {
          opacity: 1;
          transform: scaleY(1) translateY(0);
        }
      }

      /* Shimmer on selected option */
      :scope .ui-combobox__option[data-selected] {
        background: linear-gradient(
          110deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.16) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 55%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-combobox-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-combobox-shimmer {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-combobox__dropdown,
      :scope[data-motion="0"] .ui-combobox__option[data-selected] {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-combobox__dropdown { animation: none; }
        :scope .ui-combobox__option[data-selected] { animation: none; }
      }
    }
  }
`

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-combobox', premiumComboboxStyles)

    return (
      <span className="ui-premium-combobox" data-motion={motionLevel}>
        <BaseCombobox ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Combobox.displayName = 'Combobox'
