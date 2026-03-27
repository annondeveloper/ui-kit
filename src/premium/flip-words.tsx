'use client'

import { useRef } from 'react'
import { FlipWords as BaseFlipWords, type FlipWordsProps } from '../domain/flip-words'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumFlipWordsStyles = css`
  @layer premium {
    @scope (.ui-premium-flip-words) {
      :scope {
        display: inline-flex;
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on active word */
      :scope:not([data-motion="0"]) .ui-flip-words__word--active {
        text-shadow:
          0 0 10px oklch(65% 0.2 270 / 0.4),
          0 0 20px oklch(70% 0.15 300 / 0.2);
      }

      /* Spring-flip physics — enhanced overshoot on word swap */
      :scope:not([data-motion="0"]) .ui-flip-words__word {
        transition:
          transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.3s ease-out;
      }

      /* Enter animation with spring overshoot */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-flip-words__word--enter {
        animation: ui-premium-flip-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-flip-enter {
        from {
          opacity: 0;
          transform: translateY(100%) rotateX(-45deg) scale(0.9);
          filter: blur(3px);
        }
        70% {
          transform: translateY(-4%) rotateX(2deg) scale(1.02);
          filter: blur(0);
        }
        to {
          opacity: 1;
          transform: translateY(0) rotateX(0) scale(1);
          filter: blur(0);
        }
      }

      /* Exit animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-flip-words__word--exit {
        animation: ui-premium-flip-exit 0.35s ease-in both;
      }
      @keyframes ui-premium-flip-exit {
        to {
          opacity: 0;
          transform: translateY(-100%) rotateX(45deg) scale(0.9);
          filter: blur(3px);
        }
      }

      /* Shimmer transition on word change */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-flip-words__word--active {
        background: linear-gradient(
          110deg,
          oklch(85% 0.08 270 / 0) 30%,
          oklch(90% 0.12 270 / 0.35) 50%,
          oklch(85% 0.08 270 / 0) 70%
        );
        background-size: 200% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        animation: ui-premium-flip-shimmer 1.2s ease-in-out 1;
      }
      @keyframes ui-premium-flip-shimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-flip-words__word {
        animation: none;
        text-shadow: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-flip-words__word {
          animation: none !important;
          text-shadow: none;
          transition: none !important;
        }
      }
    }
  }
`

export function FlipWords({
  motion: motionProp,
  ...rest
}: FlipWordsProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-flip-words', premiumFlipWordsStyles)

  return (
    <span
      ref={wrapperRef}
      className="ui-premium-flip-words"
      data-motion={motionLevel}
    >
      <BaseFlipWords motion={motionProp} {...rest} />
    </span>
  )
}

FlipWords.displayName = 'FlipWords'
