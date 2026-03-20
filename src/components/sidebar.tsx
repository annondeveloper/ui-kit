'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  width?: number | string
  collapsedWidth?: number | string
  position?: 'left' | 'right'
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

export interface SidebarItemProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode
  label: string
  active?: boolean
  href?: string
  onClick?: () => void
  collapsed?: boolean
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sidebarStyles = css`
  @layer components {
    @scope (.ui-sidebar) {
      :scope {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        inline-size: var(--sidebar-width, 240px);
        background: var(--bg-surface, oklch(18% 0.01 270));
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        flex-shrink: 0;
        position: relative;
      }

      /* Position */
      :scope[data-position="right"] {
        border-inline-end: none;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Collapsed */
      :scope[data-collapsed="true"] {
        inline-size: var(--sidebar-collapsed-width, 64px);
      }

      /* Motion 1+: smooth width transition */
      :scope:not([data-motion="0"]) {
        transition: inline-size 0.2s var(--ease-out, ease-out);
      }
      :scope[data-motion="0"] {
        transition: none;
      }

      /* Header */
      .ui-sidebar__header {
        padding: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        flex-shrink: 0;
      }

      /* Content */
      .ui-sidebar__content {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-sm, 0.5rem);
      }

      /* Footer */
      .ui-sidebar__footer {
        padding: var(--space-md, 0.75rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        flex-shrink: 0;
        margin-block-start: auto;
      }

      /* Collapse toggle */
      .ui-sidebar__toggle {
        position: absolute;
        inset-block-start: var(--space-md, 0.75rem);
        inset-inline-end: calc(-1 * var(--space-sm, 0.5rem));
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        z-index: 1;
        transition: background 0.15s, color 0.15s;
        padding: 0;
      }
      .ui-sidebar__toggle:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-sidebar__toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* SidebarItem */
      .ui-sidebar__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-radius: var(--radius-sm, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-decoration: none;
        cursor: pointer;
        border: none;
        background: transparent;
        inline-size: 100%;
        text-align: start;
        transition: background 0.15s, color 0.15s;
      }
      .ui-sidebar__item:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-sidebar__item:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }

      /* Active item */
      .ui-sidebar__item[data-active="true"] {
        background: oklch(65% 0.2 270 / 0.12);
        color: var(--brand, oklch(65% 0.2 270));
        font-weight: 500;
      }

      /* Icon */
      .ui-sidebar__item-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        inline-size: 1.25rem;
        block-size: 1.25rem;
      }

      /* Label */
      .ui-sidebar__item-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-inline-size: 0;
      }

      /* Collapsed: hide labels visually */
      :scope[data-collapsed="true"] .ui-sidebar__item-label {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
        padding: 0;
        margin: -1px;
      }

      :scope[data-collapsed="true"] .ui-sidebar__item {
        justify-content: center;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-sidebar__item {
          min-block-size: 44px;
        }
        .ui-sidebar__toggle {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border-color: ButtonText;
          background: Canvas;
        }
        .ui-sidebar__item {
          color: ButtonText;
        }
        .ui-sidebar__item[data-active="true"] {
          background: Highlight;
          color: HighlightText;
        }
        .ui-sidebar__toggle {
          border-color: ButtonText;
          background: Canvas;
          color: ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid #000;
          break-inside: avoid;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          transition: none;
        }
        .ui-sidebar__item {
          transition: none;
        }
      }
    }
  }
`

// ─── Icons ──────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M7.5 2.5L4.5 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

export function SidebarHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('ui-sidebar__header', className)} {...rest}>
      {children}
    </div>
  )
}
SidebarHeader.displayName = 'SidebarHeader'

export function SidebarContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('ui-sidebar__content', className)} {...rest}>
      {children}
    </div>
  )
}
SidebarContent.displayName = 'SidebarContent'

export function SidebarFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('ui-sidebar__footer', className)} {...rest}>
      {children}
    </div>
  )
}
SidebarFooter.displayName = 'SidebarFooter'

export function SidebarItem({
  icon,
  label,
  active,
  href,
  onClick,
  className,
  ...rest
}: SidebarItemProps) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href ? { href } : { type: 'button' as const }

  return (
    <Tag
      className={cn('ui-sidebar__item', className)}
      data-active={active ? 'true' : undefined}
      onClick={onClick}
      {...linkProps}
      {...(rest as any)}
    >
      {icon && <span className="ui-sidebar__item-icon">{icon}</span>}
      <span className="ui-sidebar__item-label">{label}</span>
    </Tag>
  )
}
SidebarItem.displayName = 'SidebarItem'

// ─── Main Component ─────────────────────────────────────────────────────────

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    {
      collapsed = false,
      onCollapse,
      width = 240,
      collapsedWidth = 64,
      position = 'left',
      children,
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) {
    useStyles('sidebar', sidebarStyles)
    const motionLevel = useMotionLevel(motionProp)

    const widthValue = typeof width === 'number' ? `${width}px` : width
    const collapsedWidthValue =
      typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth

    return (
      <aside
        ref={ref}
        className={cn('ui-sidebar', className)}
        data-collapsed={String(collapsed)}
        data-position={position}
        data-motion={motionLevel}
        style={{
          '--sidebar-width': widthValue,
          '--sidebar-collapsed-width': collapsedWidthValue,
          ...style,
        } as React.CSSProperties}
        {...rest}
      >
        <button
          type="button"
          className="ui-sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => onCollapse?.(!collapsed)}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
        {children}
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'
