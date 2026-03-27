'use client'

import { forwardRef } from 'react'
import { TruncatedText as BaseTruncatedText, type TruncatedTextProps } from '../domain/truncated-text'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTruncatedStyles = css`
  @layer premium {
    @scope (.ui-premium-truncated-text) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-expand on show more/less toggle */
      :scope:not([data-motion="0"]) .ui-truncated-text__content {
        transition: max-block-size 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.25s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-truncated-text__content[data-expanded] {
        animation: ui-premium-trunc-expand 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes ui-premium-trunc-expand {
        from { opacity: 0.7; transform: translateY(-2px); }
        60% { transform: translateY(1px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Aurora glow on toggle button */
      :scope:not([data-motion="0"]) .ui-truncated-text__toggle {
        transition: color 0.2s ease, text-shadow 0.2s ease;
      }
      :scope:not([data-motion="0"]) .ui-truncated-text__toggle:hover {
        text-shadow: 0 0 10px oklch(65% 0.2 270 / 0.4);
      }
      :scope:not([data-motion="0"]) .ui-truncated-text__toggle:active {
        text-shadow: 0 0 14px oklch(65% 0.25 270 / 0.5);
      }

      /* Shimmer reveal when expanding */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-truncated-text__content[data-expanded]::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 35%,
          oklch(100% 0 0 / 0.05) 50%,
          transparent 65%
        );
        animation: ui-premium-trunc-shimmer 0.8s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-trunc-shimmer {
        from { transform: translateX(-100%); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Ensure content is positioned for shimmer */
      :scope .ui-truncated-text__content {
        position: relative;
        overflow: hidden;
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-truncated-text__content { transition: none; animation: none; }
      :scope[data-motion="0"] .ui-truncated-text__toggle { transition: none; }
      :scope[data-motion="0"] .ui-truncated-text__content::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-truncated-text__content { transition: none; animation: none; }
        :scope .ui-truncated-text__toggle { transition: none; }
        :scope .ui-truncated-text__content::after { display: none; }
      }
    }
  }
`

export const TruncatedText = forwardRef<HTMLSpanElement, TruncatedTextProps>(
  ({ ...rest }, ref) => {
    const motionLevel = useMotionLevel()
    useStyles('premium-truncated-text', premiumTruncatedStyles)

    return (
      <span ref={ref} className="ui-premium-truncated-text" data-motion={motionLevel}>
        <BaseTruncatedText {...rest} />
      </span>
    )
  }
)

TruncatedText.displayName = 'TruncatedText'
