import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const serviceStripStyles = css`
  @layer components {
    @scope (.ui-lite-service-strip) {
      :scope {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      .ui-lite-service-strip__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: var(--bg-surface, oklch(12% 0.015 270));
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
      }
      :scope[data-size="sm"] .ui-lite-service-strip__badge {
        padding: 0.125rem 0.5rem;
        font-size: 0.6875rem;
        gap: 0.25rem;
      }
      .ui-lite-service-strip__dot {
        inline-size: 6px;
        block-size: 6px;
        border-radius: 9999px;
        flex-shrink: 0;
      }
      :scope[data-size="sm"] .ui-lite-service-strip__dot {
        inline-size: 5px;
        block-size: 5px;
      }
      .ui-lite-service-strip__badge[data-status="running"] {
        border-color: oklch(72% 0.19 155 / 0.25);
      }
      .ui-lite-service-strip__badge[data-status="running"] .ui-lite-service-strip__dot {
        background: oklch(72% 0.19 155);
      }
      .ui-lite-service-strip__badge[data-status="stopped"] {
        border-color: oklch(55% 0 0 / 0.2);
      }
      .ui-lite-service-strip__badge[data-status="stopped"] .ui-lite-service-strip__dot {
        background: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-lite-service-strip__badge[data-status="error"] {
        border-color: oklch(62% 0.22 25 / 0.25);
      }
      .ui-lite-service-strip__badge[data-status="error"] .ui-lite-service-strip__dot {
        background: oklch(62% 0.22 25);
      }
      .ui-lite-service-strip__badge[data-status="unknown"] {
        border-color: oklch(55% 0 0 / 0.15);
      }
      .ui-lite-service-strip__badge[data-status="unknown"] .ui-lite-service-strip__dot {
        background: var(--text-disabled, oklch(40% 0 0));
      }
      .ui-lite-service-strip__version {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
        font-variant-numeric: tabular-nums;
      }
      :scope[data-size="sm"] .ui-lite-service-strip__version { display: none; }
      .ui-lite-service-strip__overflow {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        border: 1px dashed var(--border-subtle, oklch(100% 0 0 / 0.12));
        background: transparent;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
      }
      @media (forced-colors: active) {
        .ui-lite-service-strip__badge { border: 1px solid ButtonText; }
        .ui-lite-service-strip__dot { background: ButtonText; }
      }
    }
  }
`

export interface LiteServiceItem {
  name: string
  status: 'running' | 'stopped' | 'error' | 'unknown'
  version?: string
  icon?: ReactNode
}

export interface LiteServiceStripProps extends HTMLAttributes<HTMLDivElement> {
  services: LiteServiceItem[]
  maxVisible?: number
  size?: 'sm' | 'md'
}

export const ServiceStrip = forwardRef<HTMLDivElement, LiteServiceStripProps>(
  ({ services, maxVisible, size = 'md', className, ...rest }, ref) => {
    useStyles('lite-service-strip', serviceStripStyles)
    const visible = maxVisible != null ? services.slice(0, maxVisible) : services
    const overflow = maxVisible != null ? Math.max(0, services.length - maxVisible) : 0

    return (
      <div
        ref={ref}
        className={`ui-lite-service-strip${className ? ` ${className}` : ''}`}
        data-size={size}
        role="list"
        {...rest}
      >
        {visible.map((s) => (
          <span key={s.name} className="ui-lite-service-strip__badge" data-status={s.status} role="listitem">
            <span className="ui-lite-service-strip__dot" />
            {s.name}
            {s.version && <span className="ui-lite-service-strip__version">v{s.version}</span>}
          </span>
        ))}
        {overflow > 0 && <span className="ui-lite-service-strip__overflow">+{overflow} more</span>}
      </div>
    )
  }
)
ServiceStrip.displayName = 'ServiceStrip'
