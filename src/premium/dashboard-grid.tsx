'use client'

import { useRef } from 'react'
import { DashboardGrid as BaseDashboardGrid, type DashboardGridProps } from '../domain/dashboard-grid'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDashboardGridStyles = css`
  @layer premium {
    @scope (.ui-premium-dashboard-grid) {
      :scope {
        position: relative;
      }

      /* Glass morphism cells */
      :scope .ui-dashboard-grid__cell,
      :scope .ui-dashboard-grid__group {
        background: oklch(from var(--surface, oklch(20% 0.02 270)) l c h / 0.55);
        backdrop-filter: blur(12px) saturate(1.4);
        -webkit-backdrop-filter: blur(12px) saturate(1.4);
        border: 1px solid oklch(90% 0 0 / 0.08);
      }

      /* Aurora glow on drag */
      :scope:not([data-motion="0"]) .ui-dashboard-grid__cell:active,
      :scope:not([data-motion="0"]) .ui-dashboard-grid__cell[data-dragging="true"] {
        box-shadow:
          0 0 24px -4px oklch(65% 0.2 270 / 0.35),
          0 0 48px -8px oklch(70% 0.15 300 / 0.2);
        transition: box-shadow 0.3s ease-out;
      }

      /* Spring-snap positioning for children */
      :scope:not([data-motion="0"]) .ui-dashboard-grid__cell {
        transition:
          transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease-out;
      }

      /* Staggered entrance animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-dashboard-grid__cell {
        animation: ui-premium-grid-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--child-index, 0) * 60ms);
      }
      @keyframes ui-premium-grid-enter {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Aurora ambient border glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-dashboard-grid__cell::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, oklch(65% 0.15 270 / 0.12), oklch(70% 0.12 300 / 0.08));
        z-index: -1;
        pointer-events: none;
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-dashboard-grid__cell {
        animation: none;
        backdrop-filter: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-dashboard-grid__cell {
          animation: none !important;
          transition: none !important;
        }
      }
    }
  }
`

export function DashboardGrid({
  motion: motionProp,
  ...rest
}: DashboardGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 300 })
  useStyles('premium-dashboard-grid', premiumDashboardGridStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-dashboard-grid"
      data-motion={motionLevel}
    >
      <BaseDashboardGrid motion={motionProp} {...rest} />
    </div>
  )
}

DashboardGrid.displayName = 'DashboardGrid'
