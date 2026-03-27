'use client'

import { NumberTicker as BaseNumberTicker, type NumberTickerProps } from '../domain/number-ticker'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumNumberTickerStyles = css`
  @layer premium {
    @scope (.ui-premium-number-ticker) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on the ticker */
      :scope .ui-number-ticker {
        text-shadow: 0 0 12px oklch(65% 0.2 270 / 0.3),
                     0 0 24px oklch(70% 0.15 300 / 0.15);
      }

      /* Spring-bounce on digit column transitions */
      :scope:not([data-motion="0"]) .ui-number-ticker--digit-column {
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* At motion >= 2, add overshoot bounce */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-number-ticker--digit-column {
        transition: transform 0.7s cubic-bezier(0.22, 1.4, 0.36, 1);
      }

      /* Shimmer sweep across the entire ticker */
      :scope:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(90% 0.1 270 / 0.15) 45%,
          oklch(95% 0.08 300 / 0.2) 50%,
          oklch(90% 0.1 270 / 0.15) 55%,
          transparent 100%
        );
        animation: ui-premium-ticker-shimmer 4s ease-in-out infinite;
        pointer-events: none;
        border-radius: inherit;
      }

      @keyframes ui-premium-ticker-shimmer {
        0% { transform: translateX(-150%); }
        100% { transform: translateX(250%); }
      }

      /* Digit glow enhancement at cinematic motion */
      :scope:not([data-motion="0"]):not([data-motion="1"]):not([data-motion="2"]) .ui-number-ticker {
        text-shadow: 0 0 16px oklch(65% 0.25 270 / 0.4),
                     0 0 32px oklch(70% 0.18 300 / 0.2),
                     0 0 48px oklch(65% 0.12 330 / 0.1);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-number-ticker {
        text-shadow: none;
      }
      :scope[data-motion="0"]::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-number-ticker { text-shadow: none; }
        :scope::after { display: none; }
        :scope .ui-number-ticker--digit-column { transition: none; }
      }
    }
  }
`

export function NumberTicker({ motion: motionProp, ...rest }: NumberTickerProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-number-ticker', premiumNumberTickerStyles)

  return (
    <span className="ui-premium-number-ticker" data-motion={motionLevel} style={{ position: 'relative', overflow: 'hidden' }}>
      <BaseNumberTicker motion={motionProp} {...rest} />
    </span>
  )
}

NumberTicker.displayName = 'NumberTicker'
