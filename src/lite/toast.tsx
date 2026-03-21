import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  onClose?: () => void
}

export const Toast = forwardRef<HTMLDivElement, LiteToastProps>(
  ({ title, description, variant = 'default', onClose, className, ...rest }, ref) => (
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
)
Toast.displayName = 'Toast'
