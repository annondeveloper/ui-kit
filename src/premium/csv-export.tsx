'use client'

import { useRef, useCallback, type MouseEvent } from 'react'
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

      /* Success particle burst */
      .ui-premium-csv-export__particle {
        position: absolute;
        inline-size: 3px;
        block-size: 3px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(75% 0.2 150);
        pointer-events: none;
        z-index: 3;
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
}: CSVExportButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 200 })
  useStyles('premium-csv-export', premiumCSVExportStyles)

  const handleExport = useCallback(() => {
    if (motionLevel >= 2 && wrapperRef.current) {
      wrapperRef.current.setAttribute('data-success', 'true')
      setTimeout(() => wrapperRef.current?.removeAttribute('data-success'), 600)

      // Spawn particles at motion 3
      if (motionLevel >= 3) {
        const el = wrapperRef.current
        const rect = el.getBoundingClientRect()
        const cx = rect.width / 2
        const cy = rect.height / 2
        for (let i = 0; i < 6; i++) {
          const p = document.createElement('span')
          p.className = 'ui-premium-csv-export__particle'
          const angle = (Math.PI * 2 / 6) * i
          const dist = 25 + Math.random() * 15
          p.style.left = `${cx}px`
          p.style.top = `${cy}px`
          p.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out'
          p.style.opacity = '1'
          el.appendChild(p)
          p.getBoundingClientRect()
          p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
          p.style.opacity = '0'
          p.addEventListener('transitionend', () => p.remove(), { once: true })
        }
      }
    }
    onExport?.()
  }, [motionLevel, onExport])

  return (
    <div ref={wrapperRef} className="ui-premium-csv-export" data-motion={motionLevel}>
      <BaseCSVExportButton motion={motionProp} onExport={handleExport} {...rest} />
    </div>
  )
}

CSVExportButton.displayName = 'CSVExportButton'
