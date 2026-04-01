import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSidebarProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  width?: number | string
  /** Width when collapsed — applied as CSS var `--sidebar-collapsed-width` */
  collapsedWidth?: number | string
  /** Called when the collapsed state changes */
  onCollapse?: (collapsed: boolean) => void
  /** Side the sidebar is positioned on (data-position, default 'left') */
  position?: 'left' | 'right'
}

export const Sidebar = forwardRef<HTMLElement, LiteSidebarProps>(
  (
    {
      collapsed,
      width = 240,
      collapsedWidth,
      onCollapse,
      position = 'left',
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const cssVars: Record<string, string> = {
      '--sidebar-width': typeof width === 'number' ? `${width}px` : width,
    }
    if (collapsedWidth !== undefined) {
      cssVars['--sidebar-collapsed-width'] =
        typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth
    }

    return (
      <aside
        ref={ref}
        className={`ui-lite-sidebar${className ? ` ${className}` : ''}`}
        data-collapsed={collapsed ? '' : undefined}
        data-position={position}
        style={{ ...style, ...cssVars } as React.CSSProperties}
        onClick={
          onCollapse
            ? () => onCollapse(!collapsed)
            : undefined
        }
        {...rest}
      >
        {children}
      </aside>
    )
  },
)
Sidebar.displayName = 'Sidebar'

export interface LiteSidebarItemProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode
  label: string
  active?: boolean
  href?: string
}

export const SidebarItem = forwardRef<HTMLElement, LiteSidebarItemProps>(
  ({ icon, label, active, href, className, ...rest }, ref) => {
    const Tag = href ? 'a' : 'div'
    return (
      <Tag
        ref={ref as any}
        className={`ui-lite-sidebar__item${className ? ` ${className}` : ''}`}
        data-active={active ? '' : undefined}
        {...(href ? { href } : {})}
        {...rest}
      >
        {icon && <span className="ui-lite-sidebar__icon">{icon}</span>}
        <span className="ui-lite-sidebar__label">{label}</span>
      </Tag>
    )
  },
)
SidebarItem.displayName = 'SidebarItem'
