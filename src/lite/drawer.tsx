import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const drawerStyles = css`
  @layer components {
    @scope (.ui-lite-drawer) {
      :scope {
        border: none;
        padding: 0;
        margin: 0;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-primary, oklch(97% 0 0));
        max-inline-size: 100vw;
        max-block-size: 100dvh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      :scope:not([open]) { display: none; }
      :scope::backdrop {
        background: oklch(0% 0 0 / 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }

      /* Left / Right: full height */
      :scope[data-side="left"],
      :scope[data-side="right"] {
        inset-block: 0;
        block-size: 100dvh;
      }
      :scope[data-side="right"] {
        margin-inline-start: auto;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: -4px 0 16px oklch(0% 0 0 / 0.2);
      }
      :scope[data-side="left"] {
        margin-inline-end: auto;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 4px 0 16px oklch(0% 0 0 / 0.2);
      }

      /* Top / Bottom: full width */
      :scope[data-side="top"],
      :scope[data-side="bottom"] {
        inset-inline: 0;
        inline-size: 100%;
        max-inline-size: 100%;
      }
      :scope[data-side="top"] {
        margin-block-end: auto;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      :scope[data-side="bottom"] {
        margin-block-start: auto;
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 0 -4px 16px oklch(0% 0 0 / 0.2);
      }

      /* Left/Right sizes */
      :scope[data-side="left"][data-size="sm"],
      :scope[data-side="right"][data-size="sm"] { inline-size: 280px; max-inline-size: 90vw; }
      :scope[data-side="left"][data-size="md"],
      :scope[data-side="right"][data-size="md"] { inline-size: 360px; max-inline-size: 90vw; }
      :scope[data-side="left"][data-size="lg"],
      :scope[data-side="right"][data-size="lg"] { inline-size: 480px; max-inline-size: 90vw; }
      :scope[data-side="left"][data-size="full"],
      :scope[data-side="right"][data-size="full"] { inline-size: 100vw; }

      /* Top/Bottom sizes */
      :scope[data-side="top"][data-size="sm"],
      :scope[data-side="bottom"][data-size="sm"] { block-size: 280px; max-block-size: 90dvh; }
      :scope[data-side="top"][data-size="md"],
      :scope[data-side="bottom"][data-size="md"] { block-size: 360px; max-block-size: 90dvh; }
      :scope[data-side="top"][data-size="lg"],
      :scope[data-side="bottom"][data-size="lg"] { block-size: 480px; max-block-size: 90dvh; }
      :scope[data-side="top"][data-size="full"],
      :scope[data-side="bottom"][data-size="full"] { block-size: 100dvh; }

      .ui-lite-drawer__overlay {
        position: fixed;
        inset: 0;
        background: oklch(0% 0 0 / 0.6);
        z-index: -1;
      }

      .ui-lite-drawer__body {
        padding: 1.25rem;
        overflow-y: auto;
        flex: 1;
        min-block-size: 0;
      }

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
      }
    }
  }
`

export interface LiteDrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  /** Render a backdrop overlay (default true) */
  overlay?: boolean
  /** Size of the drawer panel (data-size) */
  size?: 'sm' | 'md' | 'lg' | 'full'
  children: ReactNode
}

export const Drawer = forwardRef<HTMLDialogElement, LiteDrawerProps>(
  ({ open, onClose, side = 'right', overlay = true, size = 'md', className, children, ...rest }, ref) => {
    useStyles('lite-drawer', drawerStyles)
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
        className={`ui-lite-drawer${className ? ` ${className}` : ''}`}
        data-side={side}
        data-size={size}
        onClose={onClose}
        {...rest}
      >
        {overlay && (
          <div className="ui-lite-drawer__overlay" aria-hidden="true" onClick={onClose} />
        )}
        <div className="ui-lite-drawer__body">{children}</div>
      </dialog>
    )
  },
)
Drawer.displayName = 'Drawer'
