'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useAnchorPosition } from '../core/a11y/anchor-position'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MenuItem {
  type?: 'item' | 'separator' | 'label'
  label?: ReactNode
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
}

export interface DropdownMenuProps {
  /** Declarative API: provide menu item definitions */
  items?: MenuItem[]
  children: ReactElement | ReactNode
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Composed sub-component types ──────────────────────────────────────────

export interface DropdownMenuTriggerProps {
  children: ReactElement
}

export interface DropdownMenuContentProps {
  children: ReactNode
}

export interface DropdownMenuItemProps {
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
  children: ReactNode
}

export interface DropdownMenuLabelProps {
  children: ReactNode
}

// ─── Internal context for composed API ─────────────────────────────────────

interface DropdownMenuContextValue {
  menuId: string
  isOpen: boolean
  toggle: () => void
  close: () => void
  triggerRef: React.MutableRefObject<Element | null>
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

// ─── Styles ─────────────────────────────────────────────────────────────────

const dropdownMenuStyles = css`
  @layer components {
    @scope (.ui-dropdown-menu) {
      :scope {
        position: fixed;
        z-index: 50;
      }

      .ui-dropdown-menu__panel {
        min-inline-size: 12rem;
        max-inline-size: 20rem;
        padding-block: var(--space-xs, 0.25rem);
        background: var(--surface-elevated);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        color: var(--text-primary, oklch(90% 0 0));
        outline: none;
        overflow: hidden;
      }

      /* Menu item */
      .ui-dropdown-menu__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        inline-size: 100%;
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border: none;
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        cursor: pointer;
        text-align: start;
        transition: background 0.1s;
        outline: none;
      }

      .ui-dropdown-menu__item:hover:not([aria-disabled="true"]),
      .ui-dropdown-menu__item:focus-visible:not([aria-disabled="true"]) {
        background: var(--bg-hover);
      }

      .ui-dropdown-menu__item:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }

      /* Disabled */
      .ui-dropdown-menu__item[aria-disabled="true"] {
        opacity: 0.4;
        cursor: default;
      }

      /* Danger */
      .ui-dropdown-menu__item[data-danger="true"] {
        color: var(--danger, oklch(65% 0.2 25));
      }
      .ui-dropdown-menu__item[data-danger="true"]:hover:not([aria-disabled="true"]),
      .ui-dropdown-menu__item[data-danger="true"]:focus-visible:not([aria-disabled="true"]) {
        background: oklch(65% 0.2 25 / 0.1);
      }

      /* Icon slot */
      .ui-dropdown-menu__icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        inline-size: 1rem;
        block-size: 1rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-dropdown-menu__item[data-danger="true"] .ui-dropdown-menu__icon {
        color: var(--danger, oklch(65% 0.2 25));
      }

      /* Label text */
      .ui-dropdown-menu__label-text {
        flex: 1;
        min-inline-size: 0;
      }

      /* Shortcut */
      .ui-dropdown-menu__shortcut {
        margin-inline-start: auto;
        padding-inline-start: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        flex-shrink: 0;
      }

      /* Separator */
      .ui-dropdown-menu__separator {
        block-size: 1px;
        margin-block: var(--space-xs, 0.25rem);
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Group label */
      .ui-dropdown-menu__group-label {
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Entry animation — motion 1+ */
      :scope:not([data-motion="0"]) {
        animation: ui-dropdown-in 0.15s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-dropdown-menu__item {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-dropdown-menu__panel {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-dropdown-menu__item:hover,
        .ui-dropdown-menu__item:focus-visible {
          background: Highlight;
          color: HighlightText;
        }
        .ui-dropdown-menu__separator {
          background: ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          position: static;
        }
        .ui-dropdown-menu__panel {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  }
`

// ─── Composed Sub-components ───────────────────────────────────────────────

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps): ReactElement {
  const ctx = useContext(DropdownMenuContext)

  return cloneElement(children, {
    ref: (node: Element | null) => {
      if (ctx) ctx.triggerRef.current = node
      const childRef = (children as { ref?: React.Ref<Element> }).ref
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<Element | null>).current = node
      }
    },
    'aria-expanded': ctx?.isOpen ? 'true' : 'false',
    'aria-haspopup': 'menu',
    'aria-controls': ctx?.isOpen ? ctx.menuId : undefined,
    onClick: (e: React.MouseEvent) => {
      ctx?.toggle()
      const childHandler = (children.props as Record<string, unknown>).onClick as
        | ((e: React.MouseEvent) => void)
        | undefined
      childHandler?.(e)
    },
  } as Record<string, unknown>)
}
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

export function DropdownMenuContent({ children }: DropdownMenuContentProps): ReactElement {
  return <>{children}</> as unknown as ReactElement
}
DropdownMenuContent.displayName = 'DropdownMenuContent'

export function DropdownMenuItem({ icon, shortcut, disabled, danger, onClick, children }: DropdownMenuItemProps): ReactElement {
  const ctx = useContext(DropdownMenuContext)
  return (
    <button
      type="button"
      role="menuitem"
      className="ui-dropdown-menu__item"
      tabIndex={-1}
      aria-disabled={disabled ? 'true' : undefined}
      data-danger={danger ? 'true' : undefined}
      onClick={() => {
        if (disabled) return
        onClick?.()
        ctx?.close()
      }}
    >
      {icon && <span className="ui-dropdown-menu__icon">{icon}</span>}
      <span className="ui-dropdown-menu__label-text">{children}</span>
      {shortcut && <span className="ui-dropdown-menu__shortcut">{shortcut}</span>}
    </button>
  )
}
DropdownMenuItem.displayName = 'DropdownMenuItem'

export function DropdownMenuSeparator(): ReactElement {
  return <div role="separator" className="ui-dropdown-menu__separator" />
}
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps): ReactElement {
  return (
    <div role="presentation" className="ui-dropdown-menu__group-label">
      {children}
    </div>
  )
}
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

// ─── Component ──────────────────────────────────────────────────────────────

export function DropdownMenu({
  items,
  children,
  placement = 'bottom-start',
  open: controlledOpen,
  onOpenChange,
  motion: motionProp,
}: DropdownMenuProps): ReactElement {
  useStyles('dropdown-menu', dropdownMenuStyles)
  const motionLevel = useMotionLevel(motionProp)
  const menuId = useStableId('dropdown-menu')

  // Detect composed vs declarative API
  const isComposedAPI = !items

  // ── State ──────────────────────────────────────────────────────────
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? controlledOpen : internalOpen

  const triggerRef = useRef<Element | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // ── Position (map placement to base direction) ─────────────────────
  const basePlacement = placement.startsWith('top') ? 'top' : 'bottom'
  const position = useAnchorPosition(triggerRef, rootRef, {
    placement: basePlacement as 'top' | 'bottom',
    offset: 4,
    enabled: isOpen,
  })

  // ── Open / Close ──────────────────────────────────────────────────
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const toggle = useCallback(() => {
    setOpen(!isOpen)
  }, [setOpen, isOpen])

  const close = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  // ── Click outside ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const root = rootRef.current
      const trigger = triggerRef.current
      if (
        root && !root.contains(e.target as Node) &&
        trigger && !trigger.contains(e.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

  // ── Escape key ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  // ── Keyboard navigation helper ────────────────────────────────────
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const allItems = menuRef.current
        ? Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        : []
      const enabledItems = allItems.filter(el => el.getAttribute('aria-disabled') !== 'true')
      if (enabledItems.length === 0) return

      const currentIdx = enabledItems.indexOf(document.activeElement as HTMLElement)

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const next = currentIdx + 1 >= enabledItems.length ? 0 : currentIdx + 1
          enabledItems[next].focus()
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prev = currentIdx - 1 < 0 ? enabledItems.length - 1 : currentIdx - 1
          enabledItems[prev].focus()
          break
        }
        case 'Home': {
          e.preventDefault()
          enabledItems[0].focus()
          break
        }
        case 'End': {
          e.preventDefault()
          enabledItems[enabledItems.length - 1].focus()
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          const focused = document.activeElement as HTMLElement
          if (focused.getAttribute('aria-disabled') !== 'true') {
            focused.click()
          }
          break
        }
      }
    },
    []
  )

  // ── Context value for composed API ────────────────────────────────
  const ctxValue: DropdownMenuContextValue = {
    menuId,
    isOpen,
    toggle,
    close,
    triggerRef,
  }

  // ── Composed API path ─────────────────────────────────────────────
  if (isComposedAPI) {
    // Extract trigger and content children
    let triggerChild: ReactElement | null = null
    let contentChildren: ReactNode = null

    Children.forEach(children as ReactNode, (child) => {
      if (isValidElement(child)) {
        if ((child.type as { displayName?: string })?.displayName === 'DropdownMenuTrigger') {
          triggerChild = child
        } else if ((child.type as { displayName?: string })?.displayName === 'DropdownMenuContent') {
          contentChildren = (child.props as DropdownMenuContentProps).children
        } else {
          // Direct children that are not trigger or content act as content items
          if (!contentChildren) {
            contentChildren = child
          }
        }
      }
    })

    return (
      <DropdownMenuContext.Provider value={ctxValue}>
        {triggerChild}
        {isOpen && (
          <div
            ref={rootRef}
            className="ui-dropdown-menu"
            data-placement={placement}
            data-motion={motionLevel}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div
              ref={menuRef}
              className="ui-dropdown-menu__panel"
              id={menuId}
              role="menu"
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown}
            >
              {contentChildren}
            </div>
          </div>
        )}
      </DropdownMenuContext.Provider>
    )
  }

  // ── Declarative API path (original) ───────────────────────────────

  // Clone trigger
  const trigger = cloneElement(children as ReactElement, {
    ref: (node: Element | null) => {
      triggerRef.current = node
      const childRef = ((children as ReactElement) as { ref?: React.Ref<Element> }).ref
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<Element | null>).current = node
      }
    },
    'aria-expanded': isOpen ? 'true' : 'false',
    'aria-haspopup': 'menu',
    'aria-controls': isOpen ? menuId : undefined,
    onClick: (e: React.MouseEvent) => {
      toggle()
      const childHandler = ((children as ReactElement).props as Record<string, unknown>).onClick as
        | ((e: React.MouseEvent) => void)
        | undefined
      childHandler?.(e)
    },
  } as Record<string, unknown>)

  // Render items
  const renderItem = (item: MenuItem, index: number) => {
    const type = item.type || 'item'

    if (type === 'separator') {
      return (
        <div
          key={`sep-${index}`}
          role="separator"
          className="ui-dropdown-menu__separator"
        />
      )
    }

    if (type === 'label') {
      return (
        <div
          key={`label-${index}`}
          role="presentation"
          className="ui-dropdown-menu__group-label"
        >
          {item.label}
        </div>
      )
    }

    return (
      <button
        key={`item-${index}`}
        type="button"
        role="menuitem"
        className="ui-dropdown-menu__item"
        tabIndex={-1}
        aria-disabled={item.disabled ? 'true' : undefined}
        data-danger={item.danger ? 'true' : undefined}
        onClick={() => {
          if (item.disabled) return
          item.onClick?.()
          close()
        }}
      >
        {item.icon && (
          <span className="ui-dropdown-menu__icon">{item.icon}</span>
        )}
        <span className="ui-dropdown-menu__label-text">{item.label}</span>
        {item.shortcut && (
          <span className="ui-dropdown-menu__shortcut">{item.shortcut}</span>
        )}
      </button>
    )
  }

  return (
    <>
      {trigger}
      {isOpen && (
        <div
          ref={rootRef}
          className="ui-dropdown-menu"
          data-placement={placement}
          data-motion={motionLevel}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div
            ref={menuRef}
            className="ui-dropdown-menu__panel"
            id={menuId}
            role="menu"
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
          >
            {items.map(renderItem)}
          </div>
        </div>
      )}
    </>
  )
}

DropdownMenu.displayName = 'DropdownMenu'
