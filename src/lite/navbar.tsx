import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

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

const navbarStyles = css`
  @layer components {
    @scope (.ui-lite-navbar) {
      :scope {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0 1rem;
        block-size: var(--navbar-height, 56px);
        background: var(--bg-surface, oklch(12% 0.015 270));
      }

      :scope[data-bordered] {
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      :scope[data-sticky] {
        position: sticky;
        inset-block-start: 0;
        z-index: 100;
      }
      :scope[data-transparent] {
        background: transparent;
      }

      .ui-lite-navbar__logo {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
      .ui-lite-navbar__nav {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .ui-lite-navbar__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
`

export const Navbar = forwardRef<HTMLElement, LiteNavbarProps>(
  ({ logo, actions, sticky, bordered = true, height, transparent, className, style, children, ...rest }, ref) => {
    useStyles('lite-navbar', navbarStyles)
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
