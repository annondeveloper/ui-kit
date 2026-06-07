import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const sheetStyles = css`
  @layer components {
    @scope (.ui-lite-sheet) {
      :scope {
        position: fixed;
        margin: 0;
        border: none;
        padding: 0;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-primary, oklch(97% 0 0));
        overflow: hidden;
        outline: none;
        max-block-size: 100dvh;
      }
      :scope[open] {
        display: flex;
        flex-direction: column;
      }
      :scope:not([open]) {
        display: none;
      }
      :scope::backdrop {
        background: oklch(0% 0 0 / 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }
      :scope[data-side="left"],
      :scope[data-side="right"] {
        inset-block: 0;
        block-size: 100dvh;
      }
      :scope[data-side="right"] {
        inset-inline-end: 0;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: -4px 0 16px oklch(0% 0 0 / 0.2);
      }
      :scope[data-side="left"] {
        inset-inline-start: 0;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 4px 0 16px oklch(0% 0 0 / 0.2);
      }
      :scope[data-side="left"][data-size="sm"],
      :scope[data-side="right"][data-size="sm"] {
        inline-size: 320px;
        max-inline-size: 90vw;
      }
      :scope[data-side="left"][data-size="md"],
      :scope[data-side="right"][data-size="md"] {
        inline-size: 400px;
        max-inline-size: 90vw;
      }
      :scope[data-side="left"][data-size="lg"],
      :scope[data-side="right"][data-size="lg"] {
        inline-size: 560px;
        max-inline-size: 90vw;
      }
      .ui-lite-sheet__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 1.25rem;
        padding-block-end: 0;
        flex-shrink: 0;
      }
      .ui-lite-sheet__header-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-inline-size: 0;
        flex: 1;
      }
      .ui-lite-sheet__header h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(97% 0 0));
        text-wrap: balance;
      }
      .ui-lite-sheet__description {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }
      .ui-lite-sheet__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm, 6px);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        font-size: 1.25rem;
        line-height: 1;
      }
      .ui-lite-sheet__close:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-sheet__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      .ui-lite-sheet__body {
        padding: 1.25rem;
        overflow-y: auto;
        flex: 1;
      }
      @media (pointer: coarse) {
        .ui-lite-sheet__close {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-lite-sheet__close {
          border: 1px solid ButtonText;
        }
      }
    }
  }
`

export interface LiteSheetProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** Rendered below the title in the header */
  description?: ReactNode
  side?: 'left' | 'right'
  /** Show the X close button (default true) */
  showClose?: boolean
  /** Size of the sheet panel (data-size) */
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Sheet = forwardRef<HTMLDialogElement, LiteSheetProps>(
  (
    { open, onClose, title, description, side = 'right', showClose = true, size = 'md', className, children, ...rest },
    ref,
  ) => {
    useStyles('lite-sheet', sheetStyles)
    const internalRef = useRef<HTMLDialogElement>(null)
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef

    useEffect(() => {
      const el = dialogRef.current
      if (!el) return
      if (open && !el.open) el.showModal()
      if (!open && el.open) el.close()
    }, [open, dialogRef])

    return (
      <dialog
        ref={dialogRef}
        className={`ui-lite-sheet${className ? ` ${className}` : ''}`}
        data-side={side}
        data-size={size}
        onClose={onClose}
        {...rest}
      >
        {(title || showClose) && (
          <div className="ui-lite-sheet__header">
            <div className="ui-lite-sheet__header-text">
              {title && <h2>{title}</h2>}
              {description && <p className="ui-lite-sheet__description">{description}</p>}
            </div>
            {showClose && (
              <button type="button" className="ui-lite-sheet__close" onClick={onClose} aria-label="Close">
                &times;
              </button>
            )}
          </div>
        )}
        <div className="ui-lite-sheet__body">{children}</div>
      </dialog>
    )
  },
)
Sheet.displayName = 'Sheet'
