import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const sidebarStyles = css`
  @layer components {
    @scope (.ui-lite-sidebar) {
      :scope {
        inline-size: var(--sidebar-width, 240px);
        background: var(--bg-surface, oklch(12% 0.015 270));
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      :scope[data-position="right"] {
        border-inline-end: none;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      :scope[data-collapsed] {
        inline-size: var(--sidebar-collapsed-width, 56px);
      }
      :scope[data-collapsed] .ui-lite-sidebar__label {
        display: none;
      }
    }
  }
`

const sidebarItemStyles = css`
  @layer components {
    @scope (.ui-lite-sidebar__item) {
      :scope {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
        color: var(--text-secondary, oklch(70% 0 0));
        text-decoration: none;
        border-radius: var(--radius-md, 10px);
        margin-inline: 0.375rem;
        cursor: pointer;
      }
      :scope:hover {
        background: oklch(100% 0 0 / 0.04);
      }
      :scope[data-active] {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(97% 0 0));
        font-weight: 500;
      }
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }
      .ui-lite-sidebar__icon {
        flex-shrink: 0;
        inline-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
`

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
    useStyles('lite-sidebar', sidebarStyles)
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
    useStyles('lite-sidebar-item', sidebarItemStyles)
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
