'use client'

import { useRef, type ReactElement } from 'react'
import { StatsGrid as BaseStatsGrid, type StatsGridProps } from '../components/stats-grid'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumStatsGridStyles = css`
  @layer premium {
    @scope (.ui-premium-stats-grid) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Staggered entrance for children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-stats-grid > * {
        animation: ui-premium-stats-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--child-index, 0) * 80ms);
      }

      @keyframes ui-premium-stats-enter {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Aurora ambient border glow on children */
      :scope:not([data-motion="0"]):not([data-motion="1"]) > .ui-stats-grid > *::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, oklch(65% 0.15 270 / 0.1), oklch(70% 0.12 300 / 0.06));
        z-index: -1;
        pointer-events: none;
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] > .ui-stats-grid > * {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope > .ui-stats-grid > * {
          animation: none !important;
        }
      }
    }
  }
`

export function StatsGrid({
  motion: motionProp,
  ...rest
}: StatsGridProps & { motion?: number }): ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(motionProp)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 300 })
  useStyles('premium-stats-grid', premiumStatsGridStyles)

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-stats-grid"
      data-motion={motionLevel}
    >
      <BaseStatsGrid {...rest} />
    </div>
  )
}

StatsGrid.displayName = 'StatsGrid'
