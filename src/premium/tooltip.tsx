'use client'

import { Tooltip as BaseTooltip, type TooltipProps } from '../components/tooltip'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTooltipStyles = css`
  @layer premium {
    @scope (.ui-premium-tooltip) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-scale entrance with blur-in */
      :scope .ui-tooltip:not([data-motion="0"]) {
        animation: ui-premium-tooltip-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-tooltip-enter {
        from {
          opacity: 0;
          transform: scale(0.8);
          filter: blur(4px);
        }
        60% {
          opacity: 1;
          filter: blur(0);
        }
        75% {
          transform: scale(1.04);
        }
        to {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
      }

      /* Directional offsets */
      :scope .ui-tooltip[data-placement="top"]:not([data-motion="0"]) {
        animation-name: ui-premium-tooltip-enter-top;
      }
      :scope .ui-tooltip[data-placement="bottom"]:not([data-motion="0"]) {
        animation-name: ui-premium-tooltip-enter-bottom;
      }
      @keyframes ui-premium-tooltip-enter-top {
        from { opacity: 0; transform: translateY(6px) scale(0.8); filter: blur(4px); }
        60% { opacity: 1; filter: blur(0); }
        75% { transform: translateY(-1px) scale(1.04); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }
      @keyframes ui-premium-tooltip-enter-bottom {
        from { opacity: 0; transform: translateY(-6px) scale(0.8); filter: blur(4px); }
        60% { opacity: 1; filter: blur(0); }
        75% { transform: translateY(1px) scale(1.04); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      /* Aurora glow shadow around the tooltip */
      :scope .ui-tooltip__panel {
        box-shadow:
          var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.25)),
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 40px -8px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-tooltip {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-tooltip { animation: none; }
      }
    }
  }
`

export function Tooltip({
  motion: motionProp,
  children,
  ...rest
}: TooltipProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-tooltip', premiumTooltipStyles)

  return (
    <span className="ui-premium-tooltip" data-motion={motionLevel}>
      <BaseTooltip motion={motionProp} {...rest}>
        {children}
      </BaseTooltip>
    </span>
  )
}

Tooltip.displayName = 'Tooltip'
