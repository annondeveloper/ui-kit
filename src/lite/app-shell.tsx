import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const appShellStyles = css`
  @layer components {
    @scope (.ui-lite-app-shell) {
      :scope {
        display: flex;
        flex-direction: column;
        min-block-size: 100vh;
        font-family: inherit;
        color: var(--text-primary, oklch(97% 0 0));
        background: var(--bg-base, oklch(10% 0.012 270));
      }
      .ui-lite-app-shell__navbar {
        flex-shrink: 0;
      }
      .ui-lite-app-shell__body {
        display: flex;
        flex: 1;
        min-block-size: 0;
      }
      .ui-lite-app-shell__sidebar {
        flex-shrink: 0;
        inline-size: var(--sidebar-width, 240px);
        background: var(--bg-surface, oklch(12% 0.015 270));
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        overflow: auto;
      }
      .ui-lite-app-shell__sidebar[data-collapsed] {
        inline-size: 56px;
      }
      :scope[data-sidebar-position="right"] .ui-lite-app-shell__sidebar {
        border-inline-end: none;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      .ui-lite-app-shell__main {
        flex: 1;
        min-inline-size: 0;
        padding: var(--space-md, 1rem);
        overflow: auto;
      }
      .ui-lite-app-shell__footer {
        flex-shrink: 0;
        padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: var(--text-secondary, oklch(70% 0 0));
      }
    }
  }
`

export interface LiteAppShellProps extends HTMLAttributes<HTMLDivElement> {
  navbar?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  /** Collapse the sidebar */
  sidebarCollapsed?: boolean
  /** Which side the sidebar appears on */
  sidebarPosition?: 'left' | 'right'
}

export const AppShell = forwardRef<HTMLDivElement, LiteAppShellProps>(
  ({ navbar, sidebar, footer, sidebarCollapsed, sidebarPosition = 'left', className, children, ...rest }, ref) => {
    useStyles('lite-app-shell', appShellStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-app-shell${className ? ` ${className}` : ''}`}
      data-sidebar-collapsed={sidebarCollapsed ? '' : undefined}
      data-sidebar-position={sidebarPosition}
      {...rest}
    >
      {navbar && <div className="ui-lite-app-shell__navbar">{navbar}</div>}
      <div className="ui-lite-app-shell__body">
        {sidebar && sidebarPosition === 'left' && (
          <div className="ui-lite-app-shell__sidebar" data-collapsed={sidebarCollapsed ? '' : undefined}>
            {sidebar}
          </div>
        )}
        <main className="ui-lite-app-shell__main">{children}</main>
        {sidebar && sidebarPosition === 'right' && (
          <div className="ui-lite-app-shell__sidebar" data-collapsed={sidebarCollapsed ? '' : undefined}>
            {sidebar}
          </div>
        )}
      </div>
      {footer && <footer className="ui-lite-app-shell__footer">{footer}</footer>}
    </div>
    )
  }
)
AppShell.displayName = 'AppShell'
