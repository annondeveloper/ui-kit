'use client'

import {
  cloneElement,
  useCallback,
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
import { useFocusTrap } from '../core/a11y/focus-trap'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PopoverProps {
  content: ReactNode
  children: ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  arrow?: boolean
  modal?: boolean
  className?: string
  motion?: 0 | 1 | 2 | 3
  'aria-label'?: string
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const popoverStyles = css`
  @layer components {
    @scope (.ui-popover) {
      :scope {
        position: fixed;
        z-index: 50;
      }

      .ui-popover__panel {
        position: relative;
        background: var(--surface-elevated, oklch(22% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding: var(--space-md, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        outline: none;
      }

      /* Arrow */
      .ui-popover__arrow {
        position: absolute;
        inline-size: 10px;
        block-size: 10px;
        background: var(--surface-elevated, oklch(22% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        transform: rotate(45deg);
      }

      /* Arrow placement variants */
      :scope[data-placement="top"] .ui-popover__arrow {
        inset-block-end: -6px;
        inset-inline-start: calc(50% - 5px);
        border-block-start: none;
        border-inline-start: none;
      }
      :scope[data-placement="bottom"] .ui-popover__arrow {
        inset-block-start: -6px;
        inset-inline-start: calc(50% - 5px);
        border-block-end: none;
        border-inline-end: none;
      }
      :scope[data-placement="left"] .ui-popover__arrow {
        inset-inline-end: -6px;
        inset-block-start: calc(50% - 5px);
        border-block-end: none;
        border-inline-start: none;
      }
      :scope[data-placement="right"] .ui-popover__arrow {
        inset-inline-start: -6px;
        inset-block-start: calc(50% - 5px);
        border-block-start: none;
        border-inline-end: none;
      }

      /* Entry animation — motion level 1+ */
      :scope:not([data-motion="0"]) {
        animation: ui-popover-in 0.2s var(--ease-out, ease-out);
      }

      :scope[data-placement="top"]:not([data-motion="0"]) {
        animation-name: ui-popover-in-top;
      }
      :scope[data-placement="bottom"]:not([data-motion="0"]) {
        animation-name: ui-popover-in-bottom;
      }
      :scope[data-placement="left"]:not([data-motion="0"]) {
        animation-name: ui-popover-in-left;
      }
      :scope[data-placement="right"]:not([data-motion="0"]) {
        animation-name: ui-popover-in-right;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-popover__panel button,
        .ui-popover__panel a,
        .ui-popover__panel [role="button"] {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-popover__panel {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-popover__arrow {
          background: Canvas;
          border-color: ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          position: static;
        }
        .ui-popover__panel {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-popover__arrow {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          animation: none;
        }
      }
    }

    @keyframes ui-popover-in-top {
      from {
        opacity: 0;
        transform: translateY(4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-popover-in-bottom {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-popover-in-left {
      from {
        opacity: 0;
        transform: translateX(4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes ui-popover-in-right {
      from {
        opacity: 0;
        transform: translateX(-4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function Popover({
  content,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  arrow = true,
  modal = false,
  className,
  motion: motionProp,
  'aria-label': ariaLabel,
}: PopoverProps) {
  useStyles('popover', popoverStyles)
  const motionLevel = useMotionLevel(motionProp)
  const popoverId = useStableId('popover')

  // ── State ──────────────────────────────────────────────────────────
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = isControlled ? controlledOpen : internalOpen

  const triggerRef = useRef<Element | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // ── Position ───────────────────────────────────────────────────────
  const position = useAnchorPosition(triggerRef, rootRef, {
    placement,
    offset,
    enabled: isOpen,
  })

  // ── Focus trap ─────────────────────────────────────────────────────
  useFocusTrap(panelRef, {
    active: isOpen && modal,
    returnFocus: true,
    initialFocus: 'first',
  })

  // ── Open / Close ───────────────────────────────────────────────────
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

    // Immediate binding — no timeout needed since we use mousedown
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, close])

  // ── Escape key ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  // ── Clone trigger ──────────────────────────────────────────────────
  const trigger = cloneElement(children, {
    ref: (node: Element | null) => {
      triggerRef.current = node
      const childRef = (children as { ref?: React.Ref<Element> }).ref
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<Element | null>).current = node
      }
    },
    'aria-expanded': isOpen ? 'true' : 'false',
    'aria-haspopup': 'dialog',
    'aria-controls': isOpen ? popoverId : undefined,
    onClick: (e: React.MouseEvent) => {
      toggle()
      const childHandler = (children.props as Record<string, unknown>).onClick as
        | ((e: React.MouseEvent) => void)
        | undefined
      childHandler?.(e)
    },
  } as Record<string, unknown>)

  return (
    <>
      {trigger}
      {isOpen && (
        <div
          ref={rootRef}
          className={cn('ui-popover', className)}
          data-placement={position.placement}
          data-motion={motionLevel}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div
            ref={panelRef}
            className="ui-popover__panel"
            id={popoverId}
            role="dialog"
            aria-label={ariaLabel || 'Popover'}
            tabIndex={-1}
          >
            {content}
          </div>
          {arrow && <div className="ui-popover__arrow" />}
        </div>
      )}
    </>
  )
}

Popover.displayName = 'Popover'
