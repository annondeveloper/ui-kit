'use client'

import { forwardRef } from 'react'
import { TypingIndicator as BaseTypingIndicator, type TypingIndicatorProps } from '../domain/typing-indicator'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTypingStyles = css`
  @layer premium {
    @scope (.ui-premium-typing-indicator) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Enhanced aurora pulse dots with glow */
      :scope:not([data-motion="0"]) .ui-typing-indicator__dot {
        background: oklch(75% 0.18 270);
        box-shadow: 0 0 6px 1px oklch(65% 0.2 270 / 0.35);
      }

      /* Spring-bounce physics with overshoot */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot {
        animation: ui-premium-typing-spring 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(1) {
        animation-delay: 0s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(2) {
        animation-delay: 0.15s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes ui-premium-typing-spring {
        0%, 65%, 100% {
          transform: translateY(0) scale(1);
          box-shadow: 0 0 6px 1px oklch(65% 0.2 270 / 0.35);
        }
        18% {
          transform: translateY(-8px) scale(1.2);
          box-shadow: 0 0 12px 3px oklch(75% 0.22 270 / 0.5);
        }
        30% {
          transform: translateY(2px) scale(0.95);
          box-shadow: 0 0 4px 1px oklch(65% 0.18 270 / 0.25);
        }
        42% {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 0 8px 2px oklch(70% 0.2 270 / 0.4);
        }
      }

      /* Aurora glow on dots container */
      :scope:not([data-motion="0"]) .ui-typing-indicator__dots {
        box-shadow: 0 0 10px -3px oklch(65% 0.15 270 / 0.2);
        border-color: oklch(65% 0.1 270 / 0.15);
      }

      /* Subtle breathing glow on container at motion 3 */
      :scope[data-motion="3"] .ui-typing-indicator__dots {
        animation: ui-premium-typing-breathe 3s ease-in-out infinite;
      }
      @keyframes ui-premium-typing-breathe {
        0%, 100% { box-shadow: 0 0 10px -3px oklch(65% 0.15 270 / 0.2); }
        50% { box-shadow: 0 0 16px -2px oklch(70% 0.18 270 / 0.3); }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-typing-indicator__dot {
        animation: none;
        box-shadow: none;
        background: var(--text-secondary, oklch(65% 0 0));
      }
      :scope[data-motion="0"] .ui-typing-indicator__dots {
        animation: none;
        box-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-typing-indicator__dot { animation: none; box-shadow: none; }
        :scope .ui-typing-indicator__dots { animation: none; box-shadow: none; }
      }
    }
  }
`

export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-typing-indicator', premiumTypingStyles)

    return (
      <div ref={ref} className="ui-premium-typing-indicator" data-motion={motionLevel}>
        <BaseTypingIndicator motion={motionProp} {...rest} />
      </div>
    )
  }
)

TypingIndicator.displayName = 'TypingIndicator'
