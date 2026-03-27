'use client'

import { ConnectionTestPanel as BaseConnectionTestPanel, type ConnectionTestPanelProps } from '../domain/connection-test-panel'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumConnectionTestPanelStyles = css`
  @layer premium {
    @scope (.ui-premium-connection-test-panel) {
      :scope {
        display: contents;
      }

      /* Aurora glow on running icon */
      :scope .ui-connection-test-panel__icon[data-status="running"] {
        box-shadow: 0 0 10px 2px oklch(65% 0.2 270 / 0.35),
                    0 0 20px 4px oklch(65% 0.15 270 / 0.15);
      }

      /* Spring pulse on running icon */
      :scope:not([data-motion="0"]) .ui-connection-test-panel__icon[data-status="running"] {
        animation: ui-premium-ctp-pulse 1.6s cubic-bezier(0.34, 1.2, 0.64, 1) infinite;
      }

      @keyframes ui-premium-ctp-pulse {
        0%, 100% {
          box-shadow: 0 0 10px 2px oklch(65% 0.2 270 / 0.35), 0 0 20px 4px oklch(65% 0.15 270 / 0.15);
          transform: scale(1) rotate(0deg);
        }
        50% {
          box-shadow: 0 0 16px 4px oklch(65% 0.2 270 / 0.5), 0 0 32px 8px oklch(65% 0.15 270 / 0.2);
          transform: scale(1.08) rotate(180deg);
        }
      }

      /* Passed icon success burst */
      :scope:not([data-motion="0"]) .ui-connection-test-panel__icon[data-status="passed"] {
        animation: ui-premium-ctp-pass 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-ctp-pass {
        from {
          transform: scale(0.8);
          box-shadow: 0 0 0 0 oklch(72% 0.19 155 / 0.5);
        }
        50% {
          transform: scale(1.15);
          box-shadow: 0 0 14px 5px oklch(72% 0.19 155 / 0.3);
        }
        to {
          transform: scale(1);
          box-shadow: 0 0 6px 2px oklch(72% 0.19 155 / 0.15);
        }
      }

      /* Failed icon glow */
      :scope .ui-connection-test-panel__icon[data-status="failed"] {
        box-shadow: 0 0 10px 2px oklch(62% 0.22 25 / 0.3);
      }

      /* Stagger step entrance with spring */
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step {
        animation: ui-premium-ctp-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(2) { animation-delay: 80ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(3) { animation-delay: 160ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(4) { animation-delay: 240ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(5) { animation-delay: 320ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(6) { animation-delay: 400ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(7) { animation-delay: 480ms; }
      :scope:not([data-motion="0"]) .ui-connection-test-panel__step:nth-child(8) { animation-delay: 560ms; }

      @keyframes ui-premium-ctp-enter {
        from { opacity: 0; transform: translateX(-8px) scale(0.95); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }

      /* Motion 0 */
      :scope[data-motion="0"] .ui-connection-test-panel__icon { animation: none; }
      :scope[data-motion="0"] .ui-connection-test-panel__step { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-connection-test-panel__icon { animation: none; }
        :scope .ui-connection-test-panel__step { animation: none; }
      }
    }
  }
`

export function ConnectionTestPanel({ motion: motionProp, ...rest }: ConnectionTestPanelProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-connection-test-panel', premiumConnectionTestPanelStyles)

  return (
    <div className="ui-premium-connection-test-panel" data-motion={motionLevel}>
      <BaseConnectionTestPanel motion={motionProp} {...rest} />
    </div>
  )
}

ConnectionTestPanel.displayName = 'ConnectionTestPanel'
