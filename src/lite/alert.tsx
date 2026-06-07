import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const alertStyles = css`
  @layer components {
    @scope (.ui-lite-alert) {
      :scope {
        position: relative;
        display: flex;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.75rem);
        padding-inline: var(--space-md, 1rem);
        border-radius: var(--radius-md, 10px);
        border-inline-start: 4px solid transparent;
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
      }

      /* Sizes */
      :scope[data-size="xs"] { padding-block: 0.25rem; padding-inline: 0.5rem; gap: 0.25rem; font-size: 0.6875rem; border-inline-start-width: 2px; }
      :scope[data-size="sm"] { padding-block: 0.375rem; padding-inline: 0.75rem; gap: 0.375rem; font-size: 0.75rem; border-inline-start-width: 3px; }
      :scope[data-size="lg"] { padding-block: 1rem; padding-inline: 1.25rem; gap: 0.75rem; font-size: 1rem; border-inline-start-width: 5px; }
      :scope[data-size="xl"] { padding-block: 1.25rem; padding-inline: 1.5rem; gap: 1rem; font-size: 1.125rem; border-inline-start-width: 6px; }

      /* Variant colors */
      :scope[data-variant="info"] { border-inline-start-color: var(--status-info, oklch(70% 0.17 250)); background: oklch(70% 0.17 250 / 0.06); color: oklch(75% 0.15 250); }
      :scope[data-variant="success"] { border-inline-start-color: var(--status-positive, oklch(72% 0.19 145)); background: oklch(72% 0.19 145 / 0.06); color: oklch(75% 0.17 145); }
      :scope[data-variant="warning"] { border-inline-start-color: var(--status-warning, oklch(78% 0.17 85)); background: oklch(78% 0.17 85 / 0.06); color: oklch(80% 0.15 85); }
      :scope[data-variant="error"] { border-inline-start-color: var(--status-critical, oklch(62% 0.22 25)); background: oklch(62% 0.22 25 / 0.06); color: oklch(65% 0.2 25); }

      /* Icon */
      .ui-lite-alert__icon {
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        padding-block-start: 0.125rem;
      }
      .ui-lite-alert__icon svg {
        inline-size: 1.25rem;
        block-size: 1.25rem;
      }

      /* Content */
      .ui-lite-alert__content {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }
      .ui-lite-alert__title {
        font-weight: 600;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-alert__body {
        color: inherit;
      }

      /* Action button */
      .ui-lite-alert__action {
        align-self: flex-start;
        padding: 0;
        border: none;
        background: none;
        font-family: inherit;
        font-size: inherit;
        font-weight: 600;
        color: inherit;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
        flex-shrink: 0;
      }
      .ui-lite-alert__action:hover {
        opacity: 0.8;
      }
      .ui-lite-alert__action:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 6px);
      }

      /* Dismiss button */
      .ui-lite-alert__dismiss {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem;
        border: none;
        background: none;
        color: inherit;
        cursor: pointer;
        border-radius: var(--radius-sm, 6px);
        font-size: 1.125rem;
        line-height: 1;
        opacity: 0.7;
      }
      .ui-lite-alert__dismiss:hover {
        opacity: 1;
      }
      .ui-lite-alert__dismiss:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Banner mode */
      :scope[data-banner] {
        border-radius: 0;
        border-inline-start: none;
        border-block-start: 4px solid transparent;
        inline-size: 100%;
      }
      :scope[data-banner][data-variant="info"] { border-block-start-color: var(--status-info, oklch(70% 0.17 250)); }
      :scope[data-banner][data-variant="success"] { border-block-start-color: var(--status-positive, oklch(72% 0.19 145)); }
      :scope[data-banner][data-variant="warning"] { border-block-start-color: var(--status-warning, oklch(78% 0.17 85)); }
      :scope[data-banner][data-variant="error"] { border-block-start-color: var(--status-critical, oklch(62% 0.22 25)); }

      /* Compact mode */
      :scope[data-compact] {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        align-items: center;
      }
      :scope[data-compact] .ui-lite-alert__content {
        flex-direction: row;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }
      :scope[data-compact] .ui-lite-alert__icon {
        padding-block-start: 0;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 2px solid CanvasText; }
        .ui-lite-alert__action { color: LinkText; }
      }

      /* Print */
      @media print {
        :scope { border-inline-start-width: 4px; background: none; }
      }
    }
  }
`

export interface LiteAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: ReactNode
  icon?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  action?: { label: string; onClick: () => void }
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  banner?: boolean
  compact?: boolean
  children?: ReactNode
}

export const Alert = forwardRef<HTMLDivElement, LiteAlertProps>(
  ({ variant = 'info', title, icon, dismissible, onDismiss, action, size = 'md', banner, compact, className, role = 'alert', children, ...rest }, ref) => {
    useStyles('lite-alert', alertStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-alert${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-banner={banner || undefined}
      data-compact={compact || undefined}
      role={role}
      {...rest}
    >
      {icon && <span className="ui-lite-alert__icon">{icon}</span>}
      <div className="ui-lite-alert__content">
        {title && <div className="ui-lite-alert__title">{title}</div>}
        {children && <div className="ui-lite-alert__body">{children}</div>}
      </div>
      {action && (
        <button type="button" className="ui-lite-alert__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {dismissible && (
        <button type="button" className="ui-lite-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
    )
  }
)
Alert.displayName = 'Alert'
