'use client'

import { useRef, useCallback, type ReactElement } from 'react'
import { CSVExportButton as BaseCSVExportButton, type CSVExportButtonProps } from '../domain/csv-export'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumCSVExportStyles = css`
  @layer premium {
    @scope (.ui-premium-csv-export) {
      :scope {
        position: relative;
        display: inline-flex;
        overflow: hidden;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* CSS-only particle burst via box-shadow animation */
      :scope[data-burst="true"]::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 3;
        animation: ui-premium-csv-burst 0.5s ease-out forwards;
      }
      @keyframes ui-premium-csv-burst {
        0% {
          box-shadow:
            0 0 0 oklch(75% 0.2 150),
            0 0 0 oklch(75% 0.2 180),
            0 0 0 oklch(75% 0.2 210);
          opacity: 1;
        }
        100% {
          box-shadow:
            -15px -20px 0 oklch(75% 0.2 150),
            15px -18px 0 oklch(75% 0.2 180),
            0px 22px 0 oklch(75% 0.2 210);
          opacity: 0;
        }
      }
      /* Ripple on click */
      .ui-premium-csv-export__ripple {
        position: absolute;
        border-radius: 50%;
        background: oklch(100% 0 0 / 0.15);
        transform: scale(0);
        animation: ui-premium-csv-ripple 0.5s ease-out forwards;
        pointer-events: none;
        z-index: 2;
      }
      @keyframes ui-premium-csv-ripple {
        to { transform: scale(4); opacity: 0; }
      }
      /* Success glow */
      :scope[data-success="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: 0 0 16px oklch(65% 0.2 150 / 0.4);
        animation: ui-premium-csv-glow 0.6s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-csv-glow {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      /* Motion 0 disable */
      :scope[data-motion="0"]::after,
      :scope[data-motion="0"] .ui-premium-csv-export__ripple {
        display: none;
      }
    }
  }
`

export function CSVExportButton({
  motion: motionProp,
  onExport,
  ...rest
}: CSVExportButtonProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 200 })
  useStyles('premium-csv-export', premiumCSVExportStyles)

  const handleExport = useCallback(() => {
    if (motionLevel >= 2 && wrapperRef.current) {
      wrapperRef.current.setAttribute('data-success', 'true')
      setTimeout(() => wrapperRef.current?.removeAttribute('data-success'), 600)

      // Particle burst at motion 3 — CSS-only via class toggle
      if (motionLevel >= 3) {
        wrapperRef.current.setAttribute('data-burst', 'true')
        setTimeout(() => wrapperRef.current?.removeAttribute('data-burst'), 500)
      }
    }
    onExport?.()
  }, [motionLevel, onExport])

  return (
    <div ref={wrapperRef} className="ui-premium-csv-export" data-motion={motionLevel} style={{ display: 'contents' }}>
      <BaseCSVExportButton motion={motionProp} onExport={handleExport} {...rest} />
    </div>
  )
}

CSVExportButton.displayName = 'CSVExportButton'
