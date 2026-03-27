'use client'

import { useRef } from 'react'
import { ServiceStrip as BaseServiceStrip, type ServiceStripProps } from '../domain/service-strip'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumServiceStripStyles = css`
  @layer premium {
    @scope (.ui-premium-service-strip) {
      :scope {
        position: relative;
      }
      /* Badge entrance stagger at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"])
        .ui-service-strip__badge {
        animation: ui-premium-badge-enter 0.25s ease-out both;
      }
      :scope .ui-service-strip__badge:nth-child(1) { animation-delay: 0s; }
      :scope .ui-service-strip__badge:nth-child(2) { animation-delay: 0.04s; }
      :scope .ui-service-strip__badge:nth-child(3) { animation-delay: 0.08s; }
      :scope .ui-service-strip__badge:nth-child(4) { animation-delay: 0.12s; }
      :scope .ui-service-strip__badge:nth-child(5) { animation-delay: 0.16s; }
      :scope .ui-service-strip__badge:nth-child(6) { animation-delay: 0.2s; }
      :scope .ui-service-strip__badge:nth-child(7) { animation-delay: 0.24s; }
      :scope .ui-service-strip__badge:nth-child(8) { animation-delay: 0.28s; }
      @keyframes ui-premium-badge-enter {
        from { opacity: 0; transform: translateY(6px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      /* Running status glow */
      :scope:not([data-motion="0"])
        .ui-service-strip__badge[data-status="running"] {
        box-shadow: 0 0 8px oklch(72% 0.19 155 / 0.12);
      }
      /* Error badge pulse at motion 3 */
      :scope:not([data-motion="0"]):not([data-motion="1"]):not([data-motion="2"])
        .ui-service-strip__badge[data-status="error"] {
        animation: ui-premium-error-pulse 2s ease-in-out infinite;
      }
      @keyframes ui-premium-error-pulse {
        0%, 100% { box-shadow: 0 0 0 oklch(62% 0.22 25 / 0); }
        50% { box-shadow: 0 0 12px oklch(62% 0.22 25 / 0.2); }
      }
      /* Hover shimmer on badges */
      :scope:not([data-motion="0"]) .ui-service-strip__badge[data-clickable]::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(100% 0 0 / 0.04) 50%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }
      :scope:not([data-motion="0"]) .ui-service-strip__badge[data-clickable]:hover::before {
        opacity: 1;
      }
      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-service-strip__badge {
        animation: none;
        box-shadow: none;
      }
    }
  }
`

export function ServiceStrip({
  motion: motionProp,
  ...rest
}: ServiceStripProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-service-strip', premiumServiceStripStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-service-strip"
      data-motion={motionLevel}
    >
      <BaseServiceStrip motion={motionProp} {...rest} />
    </div>
  )
}

ServiceStrip.displayName = 'ServiceStrip'
