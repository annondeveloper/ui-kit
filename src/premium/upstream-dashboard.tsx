'use client'

import { forwardRef } from 'react'
import { UpstreamDashboard as BaseUpstreamDashboard, type UpstreamDashboardProps } from '../domain/upstream-dashboard'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumUpstreamDashboardStyles = css`
  @layer premium {
    @scope (.ui-premium-upstream-dashboard) {
      :scope {
        position: relative;
      }

      /* Glass morphism cards */
      :scope .ui-upstream-dashboard__card,
      :scope .ui-upstream-dashboard__compact-card {
        background: oklch(20% 0.02 270 / 0.4);
        backdrop-filter: blur(16px) saturate(1.4);
        border: 1px solid oklch(80% 0.04 270 / 0.12);
      }

      /* Aurora glow on status indicators */
      :scope .ui-upstream-dashboard__status[data-status="healthy"] {
        box-shadow: 0 0 14px -2px oklch(72% 0.19 155 / 0.45);
      }
      :scope .ui-upstream-dashboard__status[data-status="degraded"] {
        box-shadow: 0 0 14px -2px oklch(80% 0.18 85 / 0.45);
      }
      :scope .ui-upstream-dashboard__status[data-status="down"] {
        box-shadow: 0 0 14px -2px oklch(65% 0.25 25 / 0.45);
      }

      /* Spring-pulse on status dot */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-upstream-dashboard__status::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: inherit;
        opacity: 0;
        animation: ui-premium-upstream-pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
      }

      @keyframes ui-premium-upstream-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.8); opacity: 0.15; }
        100% { transform: scale(2.4); opacity: 0; }
      }

      /* Spring-scale card entrance */
      :scope:not([data-motion="0"]) .ui-upstream-dashboard__card {
        animation: ui-premium-upstream-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-upstream-enter {
        from { opacity: 0; transform: scale(0.92) translateY(8px); }
        70% { transform: scale(1.02) translateY(-2px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      :scope[data-motion="0"] .ui-upstream-dashboard__card,
      :scope[data-motion="0"] .ui-upstream-dashboard__status::after {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-upstream-dashboard__card { animation: none; }
        :scope .ui-upstream-dashboard__status::after { animation: none; }
      }
    }
  }
`

export const UpstreamDashboard = forwardRef<HTMLDivElement, UpstreamDashboardProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-upstream-dashboard', premiumUpstreamDashboardStyles)

    return (
      <div ref={ref} className="ui-premium-upstream-dashboard" data-motion={motionLevel}>
        <BaseUpstreamDashboard motion={motionProp} {...rest} />
      </div>
    )
  }
)

UpstreamDashboard.displayName = 'UpstreamDashboard'
