'use client'

import { type SwitchFaceplateProps, SwitchFaceplate as BaseSwitchFaceplate } from '../domain/switch-faceplate'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumSwitchFaceplateStyles = css`
  @layer premium {
    @scope (.ui-premium-switch-faceplate) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow per status */
      :scope .ui-switch-faceplate__port[data-status="up"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.4),
                    0 0 16px -4px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
      }
      :scope .ui-switch-faceplate__port[data-status="down"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.4),
                    0 0 16px -4px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.15);
      }
      :scope .ui-switch-faceplate__port[data-status="admin-down"] {
        box-shadow: 0 0 8px -2px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.35),
                    0 0 16px -4px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.12);
      }
      :scope .ui-switch-faceplate__port[data-status="unused"] {
        box-shadow: 0 0 6px -2px oklch(60% 0 0 / 0.15);
      }

      /* Spring-pulse entry animation */
      :scope:not([data-motion="0"]) .ui-switch-faceplate__port {
        animation: ui-premium-sfp-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-sfp-pulse {
        0% { transform: scale(0.85); opacity: 0.6; }
        60% { transform: scale(1.08); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Breathing for down ports */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-switch-faceplate__port[data-status="down"] {
        animation: ui-premium-sfp-critical-glow 2s ease-in-out infinite;
      }

      @keyframes ui-premium-sfp-critical-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }

      /* Enhanced LED glow */
      :scope:not([data-motion="0"]) .ui-switch-faceplate__led {
        box-shadow: 0 0 4px 1px oklch(72% 0.19 155 / 0.6);
      }

      /* Enhanced tooltip */
      :scope .ui-switch-faceplate__tooltip {
        background: oklch(18% 0.02 270 / 0.92);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3),
                    0 0 0 1px oklch(100% 0 0 / 0.06);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-switch-faceplate__port {
        animation: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-switch-faceplate__led {
        box-shadow: none;
      }

      /* Motion 1: glow only, no pulse */
      :scope[data-motion="1"] .ui-switch-faceplate__port {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-switch-faceplate__port {
          animation: none !important;
          filter: none !important;
        }
        :scope .ui-switch-faceplate__led { box-shadow: none; }
      }

      @media (forced-colors: active) {
        :scope .ui-switch-faceplate__port {
          box-shadow: none;
        }
      }
    }
  }
`

export function SwitchFaceplate({ motion: motionProp, ...rest }: SwitchFaceplateProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-switch-faceplate', premiumSwitchFaceplateStyles)

  return (
    <div className="ui-premium-switch-faceplate" data-motion={motionLevel}>
      <BaseSwitchFaceplate motion={motionProp} {...rest} />
    </div>
  )
}

SwitchFaceplate.displayName = 'SwitchFaceplate'
