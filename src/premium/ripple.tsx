'use client'

import { Ripple as BaseRipple, type RippleProps } from '../domain/ripple'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumRippleStyles = css`
  @layer premium {
    @scope (.ui-premium-ripple) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora-colored ripple circles */
      :scope .ui-ripple--circle {
        background: radial-gradient(
          circle,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3) 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.15) 50%,
          transparent 70%
        );
      }

      /* Enhanced multi-ring glow effect */
      :scope:not([data-motion="0"]) .ui-ripple--circle::before,
      :scope:not([data-motion="0"]) .ui-ripple--circle::after {
        content: '';
        position: absolute;
        inset: -15%;
        border-radius: 50%;
        pointer-events: none;
      }

      :scope:not([data-motion="0"]) .ui-ripple--circle::before {
        border: 2px solid oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        animation: ui-premium-ripple-ring-1 0.8s ease-out forwards;
      }

      :scope:not([data-motion="0"]) .ui-ripple--circle::after {
        border: 1px solid oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.12);
        animation: ui-premium-ripple-ring-2 1s ease-out 0.1s forwards;
      }

      @keyframes ui-premium-ripple-ring-1 {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(5); opacity: 0; }
      }

      @keyframes ui-premium-ripple-ring-2 {
        0% { transform: scale(0); opacity: 0.8; }
        100% { transform: scale(6); opacity: 0; }
      }

      /* Ambient glow on click area */
      :scope:not([data-motion="0"]) .ui-ripple:active {
        box-shadow: 0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-ripple--circle {
        background: var(--ripple-color);
      }
      :scope[data-motion="0"] .ui-ripple--circle::before,
      :scope[data-motion="0"] .ui-ripple--circle::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-ripple--circle::before,
        :scope .ui-ripple--circle::after {
          display: none !important;
        }
        :scope .ui-ripple:active { box-shadow: none; }
      }

      @media (forced-colors: active) {
        :scope .ui-ripple--circle { background: Highlight; }
        :scope .ui-ripple:active { box-shadow: none; }
      }
    }
  }
`

export function Ripple({ motion: motionProp, ...rest }: RippleProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-ripple', premiumRippleStyles)

  return (
    <div className="ui-premium-ripple" data-motion={motionLevel}>
      <BaseRipple motion={motionProp} {...rest} />
    </div>
  )
}

Ripple.displayName = 'Ripple'
