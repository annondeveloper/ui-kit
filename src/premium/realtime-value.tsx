'use client'

import { RealtimeValue as BaseRealtimeValue, type RealtimeValueProps } from '../domain/realtime-value'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumRealtimeValueStyles = css`
  @layer premium {
    @scope (.ui-premium-realtime-value) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on flash-up */
      :scope .ui-realtime-value[data-flash="up"] {
        box-shadow: 0 0 14px -2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.45),
                    0 0 28px -4px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
      }

      /* Aurora glow on flash-down */
      :scope .ui-realtime-value[data-flash="down"] {
        box-shadow: 0 0 14px -2px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.45),
                    0 0 28px -4px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.15);
      }

      /* Spring-bounce on value change */
      :scope:not([data-motion="0"]) .ui-realtime-value[data-flash] .ui-realtime-value__number {
        animation: ui-premium-value-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-value-bounce {
        0% { transform: scale(0.9); }
        50% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }

      /* Shimmer transition on update */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-realtime-value[data-flash]::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-sm, 0.25rem);
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(80% 0.12 270 / 0.15) 50%,
          transparent 100%
        );
        animation: ui-premium-value-shimmer 0.6s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-value-shimmer {
        0% { transform: translateX(-100%); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }

      /* Position context for shimmer */
      :scope .ui-realtime-value {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-sm, 0.25rem);
        transition: box-shadow 0.3s ease-out;
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-realtime-value {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-realtime-value__number {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-realtime-value {
          box-shadow: none !important;
        }
        :scope .ui-realtime-value__number,
        :scope .ui-realtime-value::after {
          animation: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-realtime-value { box-shadow: none; }
      }
    }
  }
`

export function RealtimeValue({ motion: motionProp, ...rest }: RealtimeValueProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-realtime-value', premiumRealtimeValueStyles)

  return (
    <span className="ui-premium-realtime-value" data-motion={motionLevel}>
      <BaseRealtimeValue motion={motionProp} {...rest} />
    </span>
  )
}

RealtimeValue.displayName = 'RealtimeValue'
