'use client'

import { forwardRef } from 'react'
import { ConfidenceBar as BaseConfidenceBar, type ConfidenceBarProps } from '../domain/confidence-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumConfidenceBarStyles = css`
  @layer premium {
    @scope (.ui-premium-confidence-bar) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Shimmer on filled segments */
      :scope:not([data-motion="0"]) .ui-confidence-bar__fill {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-confidence-bar__fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.15) 50%,
          transparent 70%
        );
        animation: ui-premium-confidence-shimmer 2.5s ease-in-out infinite;
      }

      @keyframes ui-premium-confidence-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Aurora glow on hover */
      :scope:not([data-motion="0"]) .ui-confidence-bar__track {
        transition: box-shadow 0.3s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-confidence-bar__track:hover {
        box-shadow:
          0 0 12px -2px oklch(75% 0.2 270 / 0.25),
          0 0 24px -4px oklch(70% 0.15 300 / 0.12);
      }

      /* Spring transition on fill width */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-confidence-bar__fill {
        transition: inline-size 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Subtle glow matching confidence level */
      :scope:not([data-motion="0"]) .ui-confidence-bar__fill[data-level="high"] {
        box-shadow: 0 0 8px oklch(72% 0.19 155 / 0.3);
      }
      :scope:not([data-motion="0"]) .ui-confidence-bar__fill[data-level="medium"] {
        box-shadow: 0 0 8px oklch(80% 0.18 85 / 0.3);
      }
      :scope:not([data-motion="0"]) .ui-confidence-bar__fill[data-level="low"] {
        box-shadow: 0 0 8px oklch(65% 0.25 25 / 0.3);
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-confidence-bar__fill::after {
        display: none;
      }
      :scope[data-motion="0"] .ui-confidence-bar__track {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-confidence-bar__fill::after { display: none; }
        :scope .ui-confidence-bar__track { transition: none; }
        :scope .ui-confidence-bar__fill { transition: none; }
      }
    }
  }
`

export const ConfidenceBar = forwardRef<HTMLDivElement, ConfidenceBarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-confidence-bar', premiumConfidenceBarStyles)

    return (
      <div ref={ref} className="ui-premium-confidence-bar" data-motion={motionLevel}>
        <BaseConfidenceBar motion={motionProp} {...rest} />
      </div>
    )
  }
)

ConfidenceBar.displayName = 'ConfidenceBar'
