import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteNavbarProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode
  actions?: ReactNode
  sticky?: boolean
  bordered?: boolean
  /** Height of the navbar — applied as CSS var `--navbar-height` and inline style */
  height?: number | string
  /** Render navbar with transparent background (data-transparent) */
  transparent?: boolean
}

export const Navbar = forwardRef<HTMLElement, LiteNavbarProps>(
  ({ logo, actions, sticky, bordered = true, height, transparent, className, style, children, ...rest }, ref) => {
    const heightValue = height !== undefined
      ? (typeof height === 'number' ? `${height}px` : height)
      : undefined

    return (
      <header
        ref={ref}
        className={`ui-lite-navbar${className ? ` ${className}` : ''}`}
        data-sticky={sticky ? '' : undefined}
        data-bordered={bordered ? '' : undefined}
        data-transparent={transparent ? '' : undefined}
        style={
          heightValue
            ? { ...style, '--navbar-height': heightValue, height: heightValue } as React.CSSProperties
            : style
        }
        {...rest}
      >
        {logo && <div className="ui-lite-navbar__logo">{logo}</div>}
        <nav className="ui-lite-navbar__nav">{children}</nav>
        {actions && <div className="ui-lite-navbar__actions">{actions}</div>}
      </header>
    )
  },
)
Navbar.displayName = 'Navbar'
