'use client'

import { forwardRef } from 'react'
import { InlineEdit as BaseInlineEdit, type InlineEditProps } from '../components/inline-edit'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumInlineEditStyles = css`
  @layer premium {
    @scope (.ui-premium-inline-edit) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-scale on edit mode enter */
      :scope:not([data-motion="0"]) .ui-inline-edit__field {
        animation: ui-premium-inline-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-inline-spring {
        from {
          opacity: 0;
          transform: scale(0.92);
        }
        65% {
          transform: scale(1.03);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Aurora glow border on edit field */
      :scope .ui-inline-edit__field {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 16px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 32px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Shimmer on save — plays on display text after editing */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-inline-edit__display {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-inline-edit__display::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.08) 45%,
          oklch(100% 0 0 / 0.15) 50%,
          oklch(100% 0 0 / 0.08) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        pointer-events: none;
        opacity: 0;
        animation: ui-premium-inline-shimmer 1.2s ease-in-out 1;
      }
      @keyframes ui-premium-inline-shimmer {
        0% {
          opacity: 1;
          background-position: 200% center;
        }
        80% {
          opacity: 1;
          background-position: -50% center;
        }
        100% {
          opacity: 0;
          background-position: -50% center;
        }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-inline-edit__field {
        animation: none;
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-inline-edit__field { animation: none; }
        :scope .ui-inline-edit__display::after { animation: none; }
      }
    }
  }
`

export const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-inline-edit', premiumInlineEditStyles)

    return (
      <span className="ui-premium-inline-edit" data-motion={motionLevel}>
        <BaseInlineEdit ref={ref} motion={motionProp} {...rest} />
      </span>
    )
  }
)

InlineEdit.displayName = 'InlineEdit'
