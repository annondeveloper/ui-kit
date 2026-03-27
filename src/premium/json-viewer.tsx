'use client'

import { JsonViewer as BaseJsonViewer, type JsonViewerProps } from '../domain/json-viewer'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumJsonViewerStyles = css`
  @layer premium {
    @scope (.ui-premium-json-viewer) {
      :scope {
        position: relative;
      }

      /* Aurora glow on container */
      :scope:not([data-motion="0"]) .ui-json-viewer {
        box-shadow:
          0 0 0 1px oklch(75% 0.1 270 / 0.08),
          0 4px 16px oklch(0% 0 0 / 0.2);
        transition: box-shadow 0.3s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-json-viewer:hover {
        box-shadow:
          0 0 0 1px oklch(75% 0.15 270 / 0.12),
          0 4px 20px oklch(0% 0 0 / 0.25),
          0 0 24px -8px oklch(75% 0.15 270 / 0.1);
      }

      /* Expand/collapse spring animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-json-viewer__children {
        transition: grid-template-rows 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Chevron rotation spring */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-json-viewer__chevron {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Row hover glow */
      :scope:not([data-motion="0"]) .ui-json-viewer__row:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
        transition: background 0.2s ease-out;
      }

      /* Copy feedback pulse */
      :scope:not([data-motion="0"]) .ui-json-viewer__value[data-copied]::after {
        animation: ui-premium-json-copy-pulse 1.5s ease forwards;
      }

      @keyframes ui-premium-json-copy-pulse {
        0% { opacity: 1; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-4px); }
        100% { opacity: 0; transform: translateY(-8px); }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-json-viewer { box-shadow: none; transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-json-viewer { transition: none; }
        :scope .ui-json-viewer__children { transition: none; }
        :scope .ui-json-viewer__chevron { transition: none; }
      }
    }
  }
`

export function JsonViewer({ motion: motionProp, ...rest }: JsonViewerProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-json-viewer', premiumJsonViewerStyles)

  return (
    <div className="ui-premium-json-viewer" data-motion={motionLevel}>
      <BaseJsonViewer motion={motionProp} {...rest} />
    </div>
  )
}

JsonViewer.displayName = 'JsonViewer'
