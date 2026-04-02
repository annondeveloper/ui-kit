'use client'

import { type DashboardTemplateProps, DashboardTemplate as BaseDashboardTemplate } from '../domain/dashboard-template'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDashboardTemplateStyles = css`
  @layer premium {
    @scope (.ui-premium-dashboard-template) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Ambient header glow matching status */
      :scope .ui-dashboard-template__header {
        position: relative;
      }

      :scope .ui-dashboard-template__status-badge[data-status="ok"]::after {
        content: '';
        position: absolute;
        inset: -4px;
        background: radial-gradient(ellipse at center, oklch(72% 0.19 155 / 0.06) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
      }

      :scope .ui-dashboard-template__status-badge[data-status="warning"]::after {
        content: '';
        position: absolute;
        inset: -4px;
        background: radial-gradient(ellipse at center, oklch(80% 0.18 85 / 0.06) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
      }

      :scope .ui-dashboard-template__status-badge[data-status="critical"]::after {
        content: '';
        position: absolute;
        inset: -4px;
        background: radial-gradient(ellipse at center, oklch(62% 0.22 25 / 0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
        animation: ui-premium-dt-critical-glow 2s ease-in-out infinite;
      }

      @keyframes ui-premium-dt-critical-glow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      /* Spring sidebar transition */
      :scope:not([data-motion="0"]) .ui-dashboard-template__sidebar {
        transition: inline-size 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.3s ease-out;
      }

      /* Metric card shimmer on hover */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-dashboard-template__metric {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-dashboard-template__metric::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 25%,
          oklch(100% 0 0 / 0.03) 45%,
          oklch(100% 0 0 / 0.06) 50%,
          oklch(100% 0 0 / 0.03) 55%,
          transparent 75%
        );
        background-size: 200% 100%;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s;
      }

      @media (hover: hover) {
        :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-dashboard-template__metric:hover::after {
          opacity: 1;
          animation: ui-premium-dt-shimmer 1.5s ease-in-out;
        }
      }

      @keyframes ui-premium-dt-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Aurora gradient on section headers */
      :scope:not([data-motion="0"]) .ui-dashboard-template__section-header {
        background: linear-gradient(
          135deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 0%,
          transparent 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c calc(h + 30) / 0.03) 100%
        );
      }

      /* Metric glow based on status */
      :scope:not([data-motion="0"]) .ui-dashboard-template__metric[data-status="warning"] {
        box-shadow: 0 0 12px -4px oklch(80% 0.18 85 / 0.25);
      }
      :scope:not([data-motion="0"]) .ui-dashboard-template__metric[data-status="critical"] {
        box-shadow: 0 0 12px -4px oklch(62% 0.22 25 / 0.3);
      }

      /* Section card hover effect */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-dashboard-template__section {
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        :scope:not([data-motion="0"]) .ui-dashboard-template__section:hover {
          border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
          box-shadow: 0 0 16px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        }
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-dashboard-template__metric::after { display: none; }
      :scope[data-motion="0"] .ui-dashboard-template__section { transition: none; }
      :scope[data-motion="0"] .ui-dashboard-template__status-badge::after { display: none; }

      /* Motion 1: glow only, no shimmer */
      :scope[data-motion="1"] .ui-dashboard-template__metric::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-dashboard-template__sidebar { transition: none !important; }
        :scope .ui-dashboard-template__metric::after { animation: none !important; display: none; }
        :scope .ui-dashboard-template__section { transition: none !important; }
        :scope .ui-dashboard-template__status-badge::after { animation: none !important; }
      }

      @media (forced-colors: active) {
        :scope .ui-dashboard-template__metric { box-shadow: none; }
        :scope .ui-dashboard-template__section { box-shadow: none; }
        :scope .ui-dashboard-template__section-header { background: none; }
        :scope .ui-dashboard-template__status-badge::after { display: none; }
      }
    }
  }
`

export function DashboardTemplate({ motion: motionProp, ...rest }: DashboardTemplateProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-dashboard-template', premiumDashboardTemplateStyles)

  return (
    <div className="ui-premium-dashboard-template" data-motion={motionLevel}>
      <BaseDashboardTemplate motion={motionProp} {...rest} />
    </div>
  )
}

DashboardTemplate.displayName = 'DashboardTemplate'
