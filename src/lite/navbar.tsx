import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteNavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode
  actions?: ReactNode
  sticky?: boolean
  bordered?: boolean
}

export const Navbar = forwardRef<HTMLElement, LiteNavbarProps>(
  ({ logo, actions, sticky, bordered = true, className, children, ...rest }, ref) => (
    <header
      ref={ref}
      className={`ui-lite-navbar${className ? ` ${className}` : ''}`}
      data-sticky={sticky ? '' : undefined}
      data-bordered={bordered ? '' : undefined}
      {...rest}
    >
      {logo && <div className="ui-lite-navbar__logo">{logo}</div>}
      <nav className="ui-lite-navbar__nav">{children}</nav>
      {actions && <div className="ui-lite-navbar__actions">{actions}</div>}
    </header>
  )
)
Navbar.displayName = 'Navbar'
