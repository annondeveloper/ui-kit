import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const toastStyles = css`
  @layer components {
    @scope (.ui-lite-toast) {
      :scope {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding-block: 0.75rem;
        padding-inline: 1rem;
        border-radius: var(--radius-md, 10px);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        font-size: 0.875rem;
        max-inline-size: 24rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope[data-variant="success"] { border-inline-start: 3px solid oklch(72% 0.19 145); }
      :scope[data-variant="error"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      :scope[data-variant="warning"] { border-inline-start: 3px solid oklch(78% 0.17 85); }
      :scope[data-variant="info"] { border-inline-start: 3px solid oklch(70% 0.17 250); }
      .ui-lite-toast__content {
        flex: 1;
        min-inline-size: 0;
      }
      .ui-lite-toast__content strong {
        display: block;
        margin-block-end: 0.125rem;
      }
      .ui-lite-toast__content p {
        margin: 0;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 0.8125rem;
      }
      .ui-lite-toast__close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 1.125rem;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
      }
      .ui-lite-toast__close:hover {
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-toast__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
    }
  }
`

export interface LiteToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  onClose?: () => void
}

export const Toast = forwardRef<HTMLDivElement, LiteToastProps>(
  ({ title, description, variant = 'default', onClose, className, ...rest }, ref) => {
    useStyles('lite-toast', toastStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-toast${className ? ` ${className}` : ''}`}
        data-variant={variant}
        role="status"
        aria-live="polite"
        {...rest}
      >
        <div className="ui-lite-toast__content">
          <strong>{title}</strong>
          {description && <p>{description}</p>}
        </div>
        {onClose && <button type="button" className="ui-lite-toast__close" onClick={onClose} aria-label="Close">&times;</button>}
      </div>
    )
  }
)
Toast.displayName = 'Toast'
