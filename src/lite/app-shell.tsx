import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ navbar, sidebar, footer, sidebarCollapsed, sidebarPosition = 'left', className, children, ...rest }, ref) => (
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
)
AppShell.displayName = 'AppShell'
