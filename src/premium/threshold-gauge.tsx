'use client'

import { forwardRef } from 'react'
import { ThresholdGauge as BaseThresholdGauge, type ThresholdGaugeProps } from '../domain/threshold-gauge'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumGaugeStyles = css`
  @layer premium {
    @scope (.ui-premium-threshold-gauge) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow per zone status */
      :scope[data-status="ok"] .ui-threshold-gauge {
        filter: drop-shadow(0 0 10px oklch(72% 0.19 155 / 0.3));
      }
      :scope[data-status="warning"] .ui-threshold-gauge {
        filter: drop-shadow(0 0 10px oklch(80% 0.18 85 / 0.35));
      }
      :scope[data-status="critical"] .ui-threshold-gauge {
        filter: drop-shadow(0 0 12px oklch(62% 0.22 25 / 0.4));
      }

      /* Spring-needle: overshoot settle via keyframes */
      :scope:not([data-motion="0"]) .ui-threshold-gauge__fill {
        animation: ui-premium-gauge-fill 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-gauge-fill {
        from { stroke-dashoffset: var(--gauge-arc, 200); opacity: 0.4; }
        60% { opacity: 1; }
        to { stroke-dashoffset: 0; opacity: 1; }
      }

      /* Shimmer sweep across threshold zones */
      :scope:not([data-motion="0"]):not([data-motion="1"])::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: linear-gradient(
          105deg,
          transparent 40%,
          oklch(100% 0 0 / 0.06) 50%,
          transparent 60%
        );
        animation: ui-premium-gauge-shimmer 3s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes ui-premium-gauge-shimmer {
        0%, 100% { transform: translateX(-120%); }
        50% { transform: translateX(120%); }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-threshold-gauge__fill { animation: none; }
      :scope[data-motion="0"]::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-threshold-gauge__fill { animation: none; }
        :scope::after { display: none; }
      }
    }
  }
`

export const ThresholdGauge = forwardRef<HTMLDivElement, ThresholdGaugeProps>(
  ({ motion: motionProp, value, thresholds, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-threshold-gauge', premiumGaugeStyles)

    let status: string | undefined
    if (thresholds) {
      const v = Math.max(0, Math.min(100, value))
      if (v >= thresholds.critical) status = 'critical'
      else if (v >= thresholds.warning) status = 'warning'
      else status = 'ok'
    }

    return (
      <div
        ref={ref}
        className="ui-premium-threshold-gauge"
        data-motion={motionLevel}
        {...(status ? { 'data-status': status } : {})}
      >
        <BaseThresholdGauge motion={motionProp} value={value} thresholds={thresholds} {...rest} />
      </div>
    )
  }
)

ThresholdGauge.displayName = 'ThresholdGauge'
