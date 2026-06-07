import { forwardRef, useState, useRef, useEffect, useCallback, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const popoverStyles = css`
  @layer components {
    @scope (.ui-lite-popover) {
      :scope { position: relative; display: inline-block; }

      .ui-lite-popover__trigger { display: contents; }

      .ui-lite-popover__content {
        position: absolute;
        z-index: 50;
        min-inline-size: 180px;
        padding: var(--space-md, 0.75rem);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.5rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* Placement: content positioning (gap honors the offset prop) */
      .ui-lite-popover__content[data-placement="bottom"],
      .ui-lite-popover__content[data-placement="bottom-start"],
      .ui-lite-popover__content[data-placement="bottom-end"] {
        inset-block-start: 100%; margin-block-start: var(--lite-popover-gap, 0.5rem);
      }
      .ui-lite-popover__content[data-placement="top"],
      .ui-lite-popover__content[data-placement="top-start"],
      .ui-lite-popover__content[data-placement="top-end"] {
        inset-block-end: 100%; margin-block-end: var(--lite-popover-gap, 0.5rem);
      }
      .ui-lite-popover__content[data-placement="bottom"],
      .ui-lite-popover__content[data-placement="top"] {
        inset-inline-start: 50%; transform: translateX(-50%);
      }
      .ui-lite-popover__content[data-placement="bottom-start"],
      .ui-lite-popover__content[data-placement="top-start"] {
        inset-inline-start: 0;
      }
      .ui-lite-popover__content[data-placement="bottom-end"],
      .ui-lite-popover__content[data-placement="top-end"] {
        inset-inline-end: 0;
      }
      .ui-lite-popover__content[data-placement="left"] {
        inset-inline-end: 100%; margin-inline-end: var(--lite-popover-gap, 0.5rem);
        inset-block-start: 50%; transform: translateY(-50%);
      }
      .ui-lite-popover__content[data-placement="right"] {
        inset-inline-start: 100%; margin-inline-start: var(--lite-popover-gap, 0.5rem);
        inset-block-start: 50%; transform: translateY(-50%);
      }

      /* Arrow */
      .ui-lite-popover__arrow {
        position: absolute;
        inline-size: 10px; block-size: 10px;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        transform: rotate(45deg);
      }
      .ui-lite-popover__content[data-placement^="top"] .ui-lite-popover__arrow {
        inset-block-end: -6px; inset-inline-start: calc(50% - 5px);
        border-block-start: none; border-inline-start: none;
      }
      .ui-lite-popover__content[data-placement^="bottom"] .ui-lite-popover__arrow {
        inset-block-start: -6px; inset-inline-start: calc(50% - 5px);
        border-block-end: none; border-inline-end: none;
      }
      .ui-lite-popover__content[data-placement="left"] .ui-lite-popover__arrow {
        inset-inline-end: -6px; inset-block-start: calc(50% - 5px);
        border-block-end: none; border-inline-start: none;
      }
      .ui-lite-popover__content[data-placement="right"] .ui-lite-popover__arrow {
        inset-inline-start: -6px; inset-block-start: calc(50% - 5px);
        border-block-start: none; border-inline-end: none;
      }

      @media (forced-colors: active) {
        .ui-lite-popover__content { border: 2px solid ButtonText; background: Canvas; color: CanvasText; }
        .ui-lite-popover__arrow { background: Canvas; border-color: ButtonText; }
      }
    }
  }
`

export interface LitePopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  open?: boolean
  defaultOpen?: boolean
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  offset?: number
  modal?: boolean
  arrow?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover = forwardRef<HTMLDivElement, LitePopoverProps>(
  ({ open: controlledOpen, defaultOpen = false, content, placement = 'bottom', offset, modal, arrow, onOpenChange, className, children, ...rest }, ref) => {
    useStyles('lite-popover', popoverStyles)
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const rootRef = useRef<HTMLDivElement>(null)

    const setOpen = useCallback(
      (val: boolean) => {
        if (controlledOpen === undefined) setInternalOpen(val)
        onOpenChange?.(val)
      },
      [controlledOpen, onOpenChange]
    )

    // Merge the forwarded ref with the internal ref used for outside-click detection.
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // Close on outside click / Escape while open.
    useEffect(() => {
      if (!isOpen) return
      const handlePointer = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
      }
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      document.addEventListener('mousedown', handlePointer)
      document.addEventListener('keydown', handleKey)
      return () => {
        document.removeEventListener('mousedown', handlePointer)
        document.removeEventListener('keydown', handleKey)
      }
    }, [isOpen, setOpen])

    const contentStyle: CSSProperties | undefined =
      offset != null ? ({ '--lite-popover-gap': `${offset}px` } as CSSProperties) : undefined

    return (
      <div
        ref={setRef}
        className={`ui-lite-popover${className ? ` ${className}` : ''}`}
        data-placement={placement}
        data-open={isOpen ? '' : undefined}
        {...rest}
      >
        <span
          className="ui-lite-popover__trigger"
          onClick={() => setOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup={modal ? 'dialog' : 'true'}
        >
          {children}
        </span>
        {isOpen && (
          <div
            className="ui-lite-popover__content"
            role={modal ? 'dialog' : undefined}
            aria-modal={modal ? true : undefined}
            data-placement={placement}
            style={contentStyle}
          >
            {arrow && <span className="ui-lite-popover__arrow" aria-hidden="true" />}
            {content}
          </div>
        )}
      </div>
    )
  }
)
Popover.displayName = 'Popover'
