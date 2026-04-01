import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteAppShellProps extends HTMLAttributes<HTMLDivElement> {
  navbar?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
}

export const AppShell = forwardRef<HTMLDivElement, LiteAppShellProps>(
  ({ navbar, sidebar, footer, className, children, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-app-shell${className ? ` ${className}` : ''}`} {...rest}>
      {navbar && <div className="ui-lite-app-shell__navbar">{navbar}</div>}
      <div className="ui-lite-app-shell__body">
        {sidebar && <div className="ui-lite-app-shell__sidebar">{sidebar}</div>}
        <main className="ui-lite-app-shell__main">{children}</main>
      </div>
      {footer && <footer className="ui-lite-app-shell__footer">{footer}</footer>}
    </div>
  )
)
AppShell.displayName = 'AppShell'
