import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const dropdownMenuStyles = css`
  @layer components {
    @scope (.ui-lite-dropdown-menu) {
      :scope {
        position: relative;
        display: inline-block;
        font-family: inherit;
      }
      details summary {
        list-style: none;
        cursor: pointer;
      }
      details summary::-webkit-details-marker { display: none; }

      .ui-lite-dropdown-menu__list {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-start: 0;
        margin: 0.25rem 0 0;
        padding: 0.25rem;
        list-style: none;
        min-inline-size: 10rem;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 10px);
        box-shadow: 0 8px 24px oklch(0% 0 0 / 0.3);
        z-index: 50;
      }

      /* Placement hints */
      :scope[data-placement="bottom-end"] .ui-lite-dropdown-menu__list,
      :scope[data-placement="top-end"] .ui-lite-dropdown-menu__list {
        inset-inline-start: auto;
        inset-inline-end: 0;
      }
      :scope[data-placement="top-start"] .ui-lite-dropdown-menu__list,
      :scope[data-placement="top-end"] .ui-lite-dropdown-menu__list,
      :scope[data-placement="top"] .ui-lite-dropdown-menu__list {
        inset-block-start: auto;
        inset-block-end: 100%;
        margin: 0 0 0.25rem;
      }

      .ui-lite-dropdown-menu__list li { padding: 0; }

      .ui-lite-dropdown-menu__list button,
      .ui-lite-dropdown-menu__list a {
        display: block;
        inline-size: 100%;
        padding: 0.375rem 0.625rem;
        background: none;
        border: none;
        text-align: start;
        text-decoration: none;
        font-family: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
        color: var(--text-primary, oklch(97% 0 0));
        border-radius: var(--radius-sm, 6px);
      }
      .ui-lite-dropdown-menu__list button:hover,
      .ui-lite-dropdown-menu__list a:hover {
        background: oklch(100% 0 0 / 0.06);
      }
      .ui-lite-dropdown-menu__list button:focus-visible,
      .ui-lite-dropdown-menu__list a:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }
      .ui-lite-dropdown-menu__list button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`

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
    useStyles('lite-dropdown-menu', dropdownMenuStyles)
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
