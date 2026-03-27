'use client'

import { forwardRef } from 'react'
import { TimeRangeSelector as BaseTimeRangeSelector, type TimeRangeSelectorProps } from '../domain/time-range-selector'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-time-range-selector) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on preset handles */
      :scope:not([data-motion="0"]) .ui-time-range-selector__preset[data-active="true"] {
        box-shadow: 0 0 12px -2px oklch(65% 0.2 270 / 0.35);
      }

      /* Spring-snap: active preset pops in */
      :scope:not([data-motion="0"]) .ui-time-range-selector__preset[data-active="true"] {
        animation: ui-premium-trs-snap 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-trs-snap {
        from { transform: scale(0.92); opacity: 0.6; }
        60% { transform: scale(1.06); }
        to { transform: scale(1); opacity: 1; }
      }

      /* Shimmer sweep across selection bar */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-time-range-selector__presets::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          105deg,
          transparent 40%,
          oklch(100% 0 0 / 0.06) 50%,
          transparent 60%
        );
        animation: ui-premium-trs-shimmer 3.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes ui-premium-trs-shimmer {
        0%, 100% { transform: translateX(-150%); }
        50% { transform: translateX(150%); }
      }

      /* Ensure presets container is positioned for shimmer */
      :scope .ui-time-range-selector__presets {
        position: relative;
        overflow: hidden;
      }

      /* Aurora glow on custom inputs when focused */
      :scope:not([data-motion="0"]) .ui-time-range-selector__input:focus-visible {
        box-shadow: 0 0 10px -2px oklch(65% 0.2 270 / 0.3);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-time-range-selector__preset { animation: none; }
      :scope[data-motion="0"] .ui-time-range-selector__presets::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-time-range-selector__preset { animation: none; }
        :scope .ui-time-range-selector__presets::after { display: none; }
      }
    }
  }
`

export const TimeRangeSelector = forwardRef<HTMLDivElement, TimeRangeSelectorProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-time-range-selector', premiumStyles)

    return (
      <div ref={ref} className="ui-premium-time-range-selector" data-motion={motionLevel}>
        <BaseTimeRangeSelector motion={motionProp} {...rest} />
      </div>
    )
  }
)

TimeRangeSelector.displayName = 'TimeRangeSelector'
