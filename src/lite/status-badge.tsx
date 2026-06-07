import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const statusBadgeStyles = css`
  @layer components {
    @scope (.ui-lite-status-badge) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-lite-status-badge__dot {
        position: relative;
        inline-size: 8px;
        block-size: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ui-lite-status-badge__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-lite-status-badge__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      :scope[data-size="sm"] { font-size: 0.75rem; }
      :scope[data-size="sm"] .ui-lite-status-badge__dot { inline-size: 6px; block-size: 6px; }
      :scope[data-size="lg"] { font-size: 0.9375rem; }
      :scope[data-size="lg"] .ui-lite-status-badge__dot { inline-size: 10px; block-size: 10px; }

      :scope[data-status="ok"] .ui-lite-status-badge__dot { background: oklch(72% 0.19 145); }
      :scope[data-status="warning"] .ui-lite-status-badge__dot { background: oklch(78% 0.17 85); }
      :scope[data-status="critical"] .ui-lite-status-badge__dot { background: oklch(62% 0.22 25); }
      :scope[data-status="info"] .ui-lite-status-badge__dot { background: oklch(70% 0.17 250); }
      :scope[data-status="unknown"] .ui-lite-status-badge__dot { background: oklch(50% 0 0); }
      :scope[data-status="maintenance"] .ui-lite-status-badge__dot { background: oklch(65% 0.15 290); }

      /* Static pulse ring (no animation in Lite) */
      :scope[data-pulse] .ui-lite-status-badge__dot::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: inherit;
        opacity: 0.3;
      }

      @media (forced-colors: active) {
        .ui-lite-status-badge__dot { border: 1px solid CanvasText; }
      }
    }
  }
`

export interface LiteStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info' | 'unknown' | 'maintenance'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Icon rendered before label */
  icon?: ReactNode
  /** Animate the status dot with a pulse effect */
  pulse?: boolean
}

export const StatusBadge = forwardRef<HTMLSpanElement, LiteStatusBadgeProps>(
  ({ status, label, size = 'md', icon, pulse, className, ...rest }, ref) => {
    useStyles('lite-status-badge', statusBadgeStyles)
    return (
      <span
        ref={ref}
        className={`ui-lite-status-badge${className ? ` ${className}` : ''}`}
        data-status={status}
        data-size={size}
        data-pulse={pulse ? '' : undefined}
        {...rest}
      >
        <span className="ui-lite-status-badge__dot" />
        {icon && <span className="ui-lite-status-badge__icon" aria-hidden="true">{icon}</span>}
        {label && <span>{label}</span>}
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'
