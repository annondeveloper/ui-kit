'use client'

import { forwardRef } from 'react'
import { UtilizationBar as BaseUtilizationBar, type UtilizationBarProps } from '../domain/utilization-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumUtilizationBarStyles = css`
  @layer premium {
    @scope (.ui-premium-utilization-bar) {
      :scope {
        position: relative;
      }

      /* Aurora glow fill */
      :scope .ui-utilization-bar__fill {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Spring-animate width on value change */
      :scope:not([data-motion="0"]) .ui-utilization-bar__fill {
        transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Shimmer sweep across fill */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-utilization-bar__fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(95% 0.04 270 / 0.25) 50%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-utilbar-shimmer 2.5s ease-in-out infinite;
      }

      @keyframes ui-premium-utilbar-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Threshold glow intensifies at high utilization */
      :scope .ui-utilization-bar[data-severity="critical"] .ui-utilization-bar__fill {
        box-shadow: 0 0 18px -2px oklch(65% 0.25 25 / 0.5);
      }
      :scope .ui-utilization-bar[data-severity="warning"] .ui-utilization-bar__fill {
        box-shadow: 0 0 14px -2px oklch(80% 0.18 85 / 0.45);
      }

      /* Spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-utilization-bar__track {
        animation: ui-premium-utilbar-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-utilbar-enter {
        from { opacity: 0; transform: scaleX(0.7); }
        70% { transform: scaleX(1.02); }
        to { opacity: 1; transform: scaleX(1); }
      }

      :scope[data-motion="0"] .ui-utilization-bar__fill,
      :scope[data-motion="0"] .ui-utilization-bar__track {
        animation: none;
        transition: none;
      }
      :scope[data-motion="0"] .ui-utilization-bar__fill::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-utilization-bar__fill { transition: none; }
        :scope .ui-utilization-bar__fill::after { display: none; }
        :scope .ui-utilization-bar__track { animation: none; }
      }
    }
  }
`

export const UtilizationBar = forwardRef<HTMLDivElement, UtilizationBarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-utilization-bar', premiumUtilizationBarStyles)

    return (
      <div ref={ref} className="ui-premium-utilization-bar" data-motion={motionLevel}>
        <BaseUtilizationBar motion={motionProp} {...rest} />
      </div>
    )
  }
)

UtilizationBar.displayName = 'UtilizationBar'
