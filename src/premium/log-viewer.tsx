'use client'

import { LogViewer as BaseLogViewer, type LogViewerProps } from '../domain/log-viewer'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumLogViewerStyles = css`
  @layer premium {
    @scope (.ui-premium-log-viewer) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on error lines */
      :scope .ui-log-viewer__line[data-line-level="error"] {
        background: oklch(62% 0.22 25 / 0.08);
        box-shadow: inset 0 0 20px -8px oklch(62% 0.22 25 / 0.2),
                    inset 3px 0 0 oklch(62% 0.22 25 / 0.6);
      }

      :scope .ui-log-viewer__line[data-line-level="warn"] {
        box-shadow: inset 3px 0 0 oklch(80% 0.18 85 / 0.4);
      }

      /* Shimmer sweep on new entries */
      :scope:not([data-motion="0"]) .ui-log-viewer__line {
        animation: ui-premium-log-shimmer 0.8s ease-out both;
      }

      @keyframes ui-premium-log-shimmer {
        from {
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            oklch(65% 0.2 270 / 0.06) 40%,
            oklch(65% 0.2 270 / 0.1) 50%,
            oklch(65% 0.2 270 / 0.06) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          background-position: 200% 0;
        }
        60% {
          background-position: -100% 0;
        }
        to {
          background-image: none;
        }
      }

      /* Aurora ambient glow on the viewer container */
      :scope .ui-log-viewer {
        box-shadow: 0 0 30px -10px oklch(65% 0.15 270 / 0.12),
                    0 0 60px -20px oklch(70% 0.12 330 / 0.08);
      }

      /* Error line pulse at motion >= 2 */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-log-viewer__line[data-line-level="error"]::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        animation: ui-premium-log-error-pulse 2.5s ease-in-out infinite;
      }

      @keyframes ui-premium-log-error-pulse {
        0%, 100% { box-shadow: inset 0 0 12px -6px oklch(62% 0.22 25 / 0.15); }
        50% { box-shadow: inset 0 0 20px -6px oklch(62% 0.22 25 / 0.3); }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-log-viewer__line {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-log-viewer__line { animation: none; }
        :scope .ui-log-viewer__line[data-line-level="error"]::after { animation: none; }
      }
    }
  }
`

export function LogViewer({ motion: motionProp, ...rest }: LogViewerProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-log-viewer', premiumLogViewerStyles)

  return (
    <div className="ui-premium-log-viewer" data-motion={motionLevel}>
      <BaseLogViewer motion={motionProp} {...rest} />
    </div>
  )
}

LogViewer.displayName = 'LogViewer'
