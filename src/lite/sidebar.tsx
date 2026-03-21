import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSidebarProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  width?: number | string
}

export const Sidebar = forwardRef<HTMLElement, LiteSidebarProps>(
  ({ collapsed, width = 240, className, style, children, ...rest }, ref) => (
    <aside
      ref={ref}
      className={`ui-lite-sidebar${className ? ` ${className}` : ''}`}
      data-collapsed={collapsed ? '' : undefined}
      style={{ ...style, '--sidebar-width': typeof width === 'number' ? `${width}px` : width } as React.CSSProperties}
      {...rest}
    >
      {children}
    </aside>
  )
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
  }
)
SidebarItem.displayName = 'SidebarItem'
