'use client'

import { forwardRef } from 'react'
import { AppShell as BaseAppShell, type AppShellProps } from '../components/app-shell'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

interface PremiumAppShellProps extends AppShellProps {
  motion?: 0 | 1 | 2 | 3
}

const premiumAppShellStyles = css`
  @layer premium {
    @scope (.ui-premium-app-shell) {
      :scope {
        display: contents;
      }

      /* Glass morphism sidebar */
      :scope .ui-app-shell__sidebar {
        background: oklch(15% 0.02 270 / 0.6);
        backdrop-filter: blur(16px) saturate(1.3);
        -webkit-backdrop-filter: blur(16px) saturate(1.3);
        border-inline-end: 1px solid oklch(100% 0 0 / 0.06);
      }

      :scope .ui-app-shell[data-sidebar-position="right"] .ui-app-shell__sidebar {
        border-inline-end: none;
        border-inline-start: 1px solid oklch(100% 0 0 / 0.06);
      }

      /* Aurora glow on active nav items within sidebar */
      :scope .ui-app-shell__sidebar [aria-current="page"],
      :scope .ui-app-shell__sidebar [data-active="true"],
      :scope .ui-app-shell__sidebar .active {
        box-shadow: 0 0 14px -3px oklch(65% 0.2 270 / 0.4);
        background: oklch(65% 0.2 270 / 0.08);
      }

      /* Smooth spring transitions for sidebar collapse */
      :scope:not([data-motion="0"]) .ui-app-shell__sidebar {
        transition:
          inline-size 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.3s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-app-shell[data-sidebar-collapsed="true"] .ui-app-shell__sidebar {
        opacity: 0.85;
      }

      /* Entrance animation for main content */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-app-shell__main {
        animation: ui-premium-shell-main-enter 0.4s ease-out both;
      }
      @keyframes ui-premium-shell-main-enter {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-app-shell__sidebar {
        transition: none;
        backdrop-filter: none;
      }
      :scope[data-motion="0"] .ui-app-shell__main {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-app-shell__sidebar {
          transition: none !important;
        }
        :scope .ui-app-shell__main {
          animation: none !important;
        }
      }
    }
  }
`

export const AppShell = forwardRef<HTMLDivElement, PremiumAppShellProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-app-shell', premiumAppShellStyles)

    return (
      <div className="ui-premium-app-shell" data-motion={motionLevel}>
        <BaseAppShell ref={ref} {...rest} />
      </div>
    )
  }
)

AppShell.displayName = 'AppShell'
