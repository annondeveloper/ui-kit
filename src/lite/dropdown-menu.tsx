import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteMenuItem {
  id: string
  label: ReactNode
  disabled?: boolean
  href?: string
  onClick?: () => void
}

export interface LiteDropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode
  items: LiteMenuItem[]
}

export const DropdownMenu = forwardRef<HTMLDivElement, LiteDropdownMenuProps>(
  ({ trigger, items, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-dropdown-menu${className ? ` ${className}` : ''}`} {...rest}>
      <details>
        <summary>{trigger}</summary>
        <ul className="ui-lite-dropdown-menu__list" role="menu">
          {items.map(item => (
            <li key={item.id} role="menuitem">
              {item.href ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <button type="button" disabled={item.disabled} onClick={item.onClick}>{item.label}</button>
              )}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
)
DropdownMenu.displayName = 'DropdownMenu'
