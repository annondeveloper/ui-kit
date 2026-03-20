'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  navbar?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  sidebarCollapsed?: boolean
  sidebarPosition?: 'left' | 'right'
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const appShellStyles = css`
  @layer components {
    @scope (.ui-app-shell) {
      :scope {
        display: grid;
        grid-template-rows: auto 1fr auto;
        grid-template-columns: auto 1fr;
        min-block-size: 100dvh;
        background: var(--bg-base, oklch(15% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Without sidebar: single column */
      :scope:not([data-has-sidebar="true"]) {
        grid-template-columns: 1fr;
      }

      /* Right sidebar */
      :scope[data-sidebar-position="right"] {
        grid-template-columns: 1fr auto;
      }

      /* Navbar: spans full width */
      .ui-app-shell__navbar {
        grid-column: 1 / -1;
        grid-row: 1;
      }

      /* Sidebar */
      .ui-app-shell__sidebar {
        grid-row: 2;
      }

      :scope[data-sidebar-position="left"] .ui-app-shell__sidebar {
        grid-column: 1;
      }
      :scope[data-sidebar-position="right"] .ui-app-shell__sidebar {
        grid-column: 2;
      }

      /* Main content */
      .ui-app-shell__main {
        grid-row: 2;
        min-inline-size: 0;
        min-block-size: 0;
        overflow: auto;
      }

      :scope[data-sidebar-position="left"] .ui-app-shell__main,
      :scope:not([data-has-sidebar="true"]) .ui-app-shell__main {
        grid-column: -1;
      }
      :scope[data-sidebar-position="right"] .ui-app-shell__main {
        grid-column: 1;
      }
      :scope:not([data-has-sidebar="true"]) .ui-app-shell__main {
        grid-column: 1 / -1;
      }

      /* Footer: spans full width */
      .ui-app-shell__footer {
        grid-column: 1 / -1;
        grid-row: 3;
      }

      /* Responsive: sidebar collapses on mobile */
      @container (max-width: 768px) {
        :scope {
          grid-template-columns: 1fr !important;
        }
        .ui-app-shell__sidebar {
          display: none;
        }
        .ui-app-shell__main {
          grid-column: 1 / -1 !important;
        }
      }

      /* Fallback for non-container contexts */
      @media (max-width: 768px) {
        :scope {
          grid-template-columns: 1fr !important;
        }
        .ui-app-shell__sidebar {
          display: none;
        }
        .ui-app-shell__main {
          grid-column: 1 / -1 !important;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          background: Canvas;
          color: CanvasText;
        }
      }

      /* Print */
      @media print {
        :scope {
          display: block;
          min-block-size: auto;
        }
        .ui-app-shell__sidebar {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      navbar,
      sidebar,
      footer,
      sidebarCollapsed = false,
      sidebarPosition = 'left',
      children,
      className,
      ...rest
    },
    ref
  ) {
    useStyles('app-shell', appShellStyles)

    const hasSidebar = sidebar != null

    return (
      <div
        ref={ref}
        className={cn('ui-app-shell', className)}
        data-has-sidebar={String(hasSidebar)}
        data-sidebar-position={sidebarPosition}
        data-sidebar-collapsed={String(sidebarCollapsed)}
        {...rest}
      >
        {navbar && (
          <div className="ui-app-shell__navbar">{navbar}</div>
        )}

        {sidebar && (
          <div className="ui-app-shell__sidebar">{sidebar}</div>
        )}

        <div className="ui-app-shell__main">{children}</div>

        {footer && (
          <div className="ui-app-shell__footer">{footer}</div>
        )}
      </div>
    )
  }
)

AppShell.displayName = 'AppShell'
