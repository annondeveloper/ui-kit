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

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TooltipProps {
  content: ReactNode
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  offset?: number
  disabled?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const tooltipStyles = css`
  @layer components {
    @scope (.ui-tooltip) {
      :scope {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        max-inline-size: 250px;
      }

      .ui-tooltip__panel {
        position: relative;
        background: var(--surface-elevated, oklch(22% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.4;
        padding-block: 0.375rem;
        padding-inline: 0.625rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.25rem);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.35), 0 0 0 1px var(--border-subtle);
        text-wrap: pretty;
        word-break: break-word;
      }

      /* Arrow */
      .ui-tooltip__arrow {
        position: absolute;
        inline-size: 8px;
        block-size: 8px;
        background: var(--surface-elevated, oklch(22% 0.01 270));
        transform: rotate(45deg);
      }

      /* Arrow placement variants */
      :scope[data-placement="top"] .ui-tooltip__arrow {
        inset-block-end: -4px;
        inset-inline-start: calc(50% - 4px);
      }
      :scope[data-placement="bottom"] .ui-tooltip__arrow {
        inset-block-start: -4px;
        inset-inline-start: calc(50% - 4px);
      }
      :scope[data-placement="left"] .ui-tooltip__arrow {
        inset-inline-end: -4px;
        inset-block-start: calc(50% - 4px);
      }
      :scope[data-placement="right"] .ui-tooltip__arrow {
        inset-inline-start: -4px;
        inset-block-start: calc(50% - 4px);
      }

      /* Entry animation — motion level 1+ */
      :scope:not([data-motion="0"]) {
        animation: ui-tooltip-in 0.15s var(--ease-out, ease-out);
      }

      :scope[data-placement="top"]:not([data-motion="0"]) {
        animation-name: ui-tooltip-in-top;
      }
      :scope[data-placement="bottom"]:not([data-motion="0"]) {
        animation-name: ui-tooltip-in-bottom;
      }
      :scope[data-placement="left"]:not([data-motion="0"]) {
        animation-name: ui-tooltip-in-left;
      }
      :scope[data-placement="right"]:not([data-motion="0"]) {
        animation-name: ui-tooltip-in-right;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-tooltip__panel {
          border: 1px solid CanvasText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-tooltip__arrow {
          background: Canvas;
          border: 1px solid CanvasText;
        }
      }

      /* Print */
      @media print {
        :scope {
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

    @keyframes ui-tooltip-in-top {
      from {
        opacity: 0;
        transform: translateY(4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-tooltip-in-bottom {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-tooltip-in-left {
      from {
        opacity: 0;
        transform: translateX(4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes ui-tooltip-in-right {
      from {
        opacity: 0;
        transform: translateX(-4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  offset = 8,
  disabled = false,
  motion: motionProp,
}: TooltipProps) {
  useStyles('tooltip', tooltipStyles)
  const motionLevel = useMotionLevel(motionProp)
  const tooltipId = useStableId('tooltip')

  const [visible, setVisible] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<Element | null>(null)
  const floatingRef = useRef<HTMLDivElement | null>(null)

  const position = useAnchorPosition(triggerRef, floatingRef, {
    placement,
    offset,
    enabled: visible,
  })

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    showTimerRef.current = setTimeout(() => {
      setVisible(true)
    }, delay)
  }, [disabled, delay])

  const hide = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    setVisible(false)
  }, [])

  // Touch: dismiss on touch outside
  useEffect(() => {
    if (!visible) return

    const handleTouchOutside = (e: TouchEvent) => {
      const trigger = triggerRef.current
      if (trigger && !trigger.contains(e.target as Node)) {
        setVisible(false)
      }
    }

    document.addEventListener('touchstart', handleTouchOutside)
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [visible])

  // Escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        hide()
      }
      // Forward to child's onKeyDown if present
      const childOnKeyDown = (children.props as Record<string, unknown>).onKeyDown as
        | ((e: React.KeyboardEvent) => void)
        | undefined
      childOnKeyDown?.(e)
    },
    [visible, hide, children.props]
  )

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return
      longPressTimerRef.current = setTimeout(() => {
        setVisible(true)
      }, 500)
      // Forward to child
      const childHandler = (children.props as Record<string, unknown>).onTouchStart as
        | ((e: React.TouchEvent) => void)
        | undefined
      childHandler?.(e)
    },
    [disabled, children.props]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
      const childHandler = (children.props as Record<string, unknown>).onTouchEnd as
        | ((e: React.TouchEvent) => void)
        | undefined
      childHandler?.(e)
    },
    [children.props]
  )

  // Clone child to attach event handlers
  const trigger = cloneElement(children, {
    ref: (node: Element | null) => {
      triggerRef.current = node
      // Forward ref from child if it has one
      const childRef = (children as { ref?: React.Ref<Element> }).ref
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<Element | null>).current = node
      }
    },
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      const childHandler = (children.props as Record<string, unknown>).onMouseEnter as
        | ((e: React.MouseEvent) => void)
        | undefined
      childHandler?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      const childHandler = (children.props as Record<string, unknown>).onMouseLeave as
        | ((e: React.MouseEvent) => void)
        | undefined
      childHandler?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      show()
      const childHandler = (children.props as Record<string, unknown>).onFocus as
        | ((e: React.FocusEvent) => void)
        | undefined
      childHandler?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      hide()
      const childHandler = (children.props as Record<string, unknown>).onBlur as
        | ((e: React.FocusEvent) => void)
        | undefined
      childHandler?.(e)
    },
    onKeyDown: handleKeyDown,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  } as Record<string, unknown>)

  return (
    <>
      {trigger}
      {visible && (
        <div
          ref={floatingRef}
          className="ui-tooltip"
          data-placement={position.placement}
          data-motion={motionLevel}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="ui-tooltip__panel" role="tooltip" id={tooltipId}>
            {content}
          </div>
          <div className="ui-tooltip__arrow" />
        </div>
      )}
    </>
  )
}

Tooltip.displayName = 'Tooltip'
