'use client'

import { forwardRef } from 'react'
import { Select as BaseSelect, type SelectProps } from '../components/select'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumSelectStyles = css`
  @layer premium {
    @scope (.ui-premium-select) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on trigger when focused */
      :scope .ui-select__trigger:focus-visible {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25),
          0 0 40px -8px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.12);
      }

      /* Aurora glow when open */
      :scope .ui-select[data-open] .ui-select__trigger {
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        box-shadow:
          0 0 0 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 24px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Spring-animated dropdown entrance (scale + fade from top) */
      :scope:not([data-motion="0"]) .ui-select__dropdown {
        animation: ui-premium-select-drop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top center;
      }
      @keyframes ui-premium-select-drop {
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

      /* Subtle shimmer on selected option */
      :scope .ui-select__option[data-selected] {
        background: linear-gradient(
          110deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.16) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08) 55%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-select-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-select-shimmer {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Motion 0: no animations */
      :scope[data-motion="0"] .ui-select__dropdown,
      :scope[data-motion="0"] .ui-select__option[data-selected] {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-select__dropdown { animation: none; }
        :scope .ui-select__option[data-selected] { animation: none; }
      }
    }
  }
`

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-select', premiumSelectStyles)

    return (
      <span className="ui-premium-select" data-motion={motionLevel}>
        <BaseSelect ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

Select.displayName = 'Select'
