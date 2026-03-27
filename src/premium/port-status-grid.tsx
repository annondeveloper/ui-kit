'use client'

import { PortStatusGrid as BasePortStatusGrid, type PortStatusGridProps } from '../domain/port-status-grid'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPortStatusGridStyles = css`
  @layer premium {
    @scope (.ui-premium-port-status-grid) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow per status */
      :scope .ui-port-status-grid__item[data-status="ok"] {
        box-shadow: 0 0 10px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.4),
                    0 0 20px -4px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
      }
      :scope .ui-port-status-grid__item[data-status="warning"] {
        box-shadow: 0 0 10px -2px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.4),
                    0 0 20px -4px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.15);
      }
      :scope .ui-port-status-grid__item[data-status="critical"] {
        box-shadow: 0 0 10px -2px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.4),
                    0 0 20px -4px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.15);
      }
      :scope .ui-port-status-grid__item[data-status="unknown"] {
        box-shadow: 0 0 8px -2px oklch(60% 0 0 / 0.2);
      }

      /* Spring-pulse on status change */
      :scope:not([data-motion="0"]) .ui-port-status-grid__item {
        animation: ui-premium-port-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-port-pulse {
        0% { transform: scale(0.85); opacity: 0.6; }
        60% { transform: scale(1.08); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Ambient breathing for critical ports */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-port-status-grid__item[data-status="critical"] {
        animation: ui-premium-port-critical-glow 2s ease-in-out infinite;
      }
      @keyframes ui-premium-port-critical-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.25); }
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-port-status-grid__item {
        animation: none;
        box-shadow: none;
      }

      /* Motion 1: glow only, no pulse */
      :scope[data-motion="1"] .ui-port-status-grid__item {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-port-status-grid__item {
          animation: none !important;
          filter: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-port-status-grid__item {
          box-shadow: none;
        }
      }
    }
  }
`

export function PortStatusGrid({ motion: motionProp, ...rest }: PortStatusGridProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-port-status-grid', premiumPortStatusGridStyles)

  return (
    <div className="ui-premium-port-status-grid" data-motion={motionLevel}>
      <BasePortStatusGrid motion={motionProp} {...rest} />
    </div>
  )
}

PortStatusGrid.displayName = 'PortStatusGrid'
