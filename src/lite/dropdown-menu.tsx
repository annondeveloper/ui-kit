import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

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
  /** Controlled open state — wired to details[open] */
  open?: boolean
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void
  /** data-placement attribute for CSS positioning hints */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top'
}

export const DropdownMenu = forwardRef<HTMLDivElement, LiteDropdownMenuProps>(
  ({ trigger, items, open, onOpenChange, placement, className, ...rest }, ref) => {
    const detailsRef = useRef<HTMLDetailsElement>(null)

    // Sync controlled open state to the details element
    useEffect(() => {
      const el = detailsRef.current
      if (!el || open === undefined) return
      if (el.open !== open) el.open = open
    }, [open])

    function handleToggle() {
      if (onOpenChange && detailsRef.current) {
        onOpenChange(detailsRef.current.open)
      }
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-dropdown-menu${className ? ` ${className}` : ''}`}
        data-placement={placement}
        {...rest}
      >
        <details ref={detailsRef} onToggle={handleToggle}>
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
  },
)
DropdownMenu.displayName = 'DropdownMenu'
