'use client'

import { type ReactElement } from 'react'

import { type PluginDashboardProps, PluginDashboard as BasePluginDashboard } from '../domain/plugin-dashboard'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumPluginDashboardStyles = css`
  @layer premium {
    @scope (.ui-premium-plugin-dashboard) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Shimmer on loading overlay */
      :scope .ui-plugin-dashboard__loading-overlay {
        background: oklch(from var(--bg-base, oklch(15% 0.01 270)) l c h / 0.6);
        backdrop-filter: blur(4px);
      }

      :scope:not([data-motion="0"]) .ui-plugin-dashboard__loading-overlay::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(100% 0 0 / 0.04) 40%,
          oklch(100% 0 0 / 0.08) 50%,
          oklch(100% 0 0 / 0.04) 60%,
          transparent 100%
        );
        animation: ui-premium-pd-shimmer 1.8s ease-in-out infinite;
      }

      @keyframes ui-premium-pd-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Aurora glow on status change */
      :scope .ui-dashboard-template__status-badge[data-status="ok"] {
        box-shadow: 0 0 8px oklch(72% 0.19 155 / 0.3);
      }
      :scope .ui-dashboard-template__status-badge[data-status="warning"] {
        box-shadow: 0 0 8px oklch(80% 0.18 85 / 0.3);
      }
      :scope .ui-dashboard-template__status-badge[data-status="critical"] {
        box-shadow: 0 0 8px oklch(62% 0.22 25 / 0.3);
      }

      /* Enhanced property list */
      :scope .ui-plugin-dashboard__prop {
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm, 0.375rem);
        transition: background 0.15s;
      }

      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-plugin-dashboard__prop:hover {
          background: oklch(100% 0 0 / 0.04);
        }
      }

      /* Enhanced metric cards */
      :scope .ui-dashboard-template__metric {
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-dashboard-template__metric:hover {
          box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        }
      }

      /* Chart placeholder glow */
      :scope .ui-plugin-dashboard__chart-placeholder {
        background: oklch(100% 0 0 / 0.02);
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-plugin-dashboard__loading-overlay::after {
        animation: none;
      }
      :scope[data-motion="0"] .ui-dashboard-template__status-badge {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-plugin-dashboard__prop {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-plugin-dashboard__loading-overlay::after {
          animation: none !important;
        }
        :scope .ui-dashboard-template__status-badge {
          box-shadow: none !important;
        }
        :scope .ui-plugin-dashboard__prop {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-dashboard-template__status-badge {
          box-shadow: none;
        }
        :scope .ui-dashboard-template__metric {
          box-shadow: none;
        }
      }
    }
  }
`

export function PluginDashboard({ motion: motionProp, ...rest }: PluginDashboardProps): ReactElement {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-plugin-dashboard', premiumPluginDashboardStyles)

  return (
    <div className="ui-premium-plugin-dashboard" data-motion={motionLevel}>
      <BasePluginDashboard motion={motionProp} {...rest} />
    </div>
  )
}

PluginDashboard.displayName = 'PluginDashboard'
