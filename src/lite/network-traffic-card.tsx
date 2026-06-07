import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const networkTrafficCardStyles = css`
  @layer components {
    @scope (.ui-lite-network-traffic-card) {
      :scope {
        position: relative;
        min-inline-size: 280px;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }

      :scope[data-status="ok"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      :scope[data-status="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      :scope[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      :scope[data-status="unknown"] { border-inline-start: 3px solid oklch(60% 0 0); }

      .ui-lite-network-traffic-card__header {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-lite-network-traffic-card__title {
        margin: 0;
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.4;
        flex: 1;
      }

      .ui-lite-network-traffic-card__status {
        flex-shrink: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: oklch(60% 0 0);
      }
      :scope[data-status="ok"] .ui-lite-network-traffic-card__status { background: oklch(72% 0.19 155); }
      :scope[data-status="warning"] .ui-lite-network-traffic-card__status { background: oklch(80% 0.18 85); }
      :scope[data-status="critical"] .ui-lite-network-traffic-card__status { background: oklch(62% 0.22 25); }
      :scope[data-status="unknown"] .ui-lite-network-traffic-card__status { background: oklch(60% 0 0); }

      .ui-lite-network-traffic-card__vendor {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      .ui-lite-network-traffic-card__traffic {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md, 1rem);
      }

      .ui-lite-network-traffic-card__direction {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
      }

      .ui-lite-network-traffic-card__label {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
      }

      .ui-lite-network-traffic-card__rate {
        font-size: var(--text-xl, 1.25rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }

      @media (forced-colors: active) {
        :scope { border: 1px solid CanvasText; }
      }
    }
  }
`

export interface TrafficData {
  inbound: number
  outbound: number
  timestamp?: number
}

export interface LiteNetworkTrafficCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  vendor?: string
  location?: string
  traffic: TrafficData
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  compact?: boolean
}

export function formatBitRate(bytesPerSecond: number): string {
  const bps = bytesPerSecond * 8
  if (bps >= 1e12) return `${(bps / 1e12).toFixed(2)} Tbps`
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`
  return `${bps.toFixed(0)} bps`
}

export const NetworkTrafficCard = forwardRef<HTMLDivElement, LiteNetworkTrafficCardProps>(
  ({ title, vendor, location, traffic, status, compact, className, ...rest }, ref) => {
    useStyles('lite-network-traffic-card', networkTrafficCardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-network-traffic-card${className ? ` ${className}` : ''}`}
      data-status={status}
      {...(compact ? { 'data-compact': '' } : {})}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      <div className="ui-lite-network-traffic-card__header">
        <h3 className="ui-lite-network-traffic-card__title">{title}</h3>
        {status && <span className="ui-lite-network-traffic-card__status" role="status" aria-label={`Status: ${status}`} />}
      </div>
      {(vendor || location) && (
        <div className="ui-lite-network-traffic-card__vendor">
          {vendor && <span>{vendor}</span>}
          {vendor && location && <span> / </span>}
          {location && <span>{location}</span>}
        </div>
      )}
      <div className="ui-lite-network-traffic-card__traffic">
        <div className="ui-lite-network-traffic-card__direction">
          <span className="ui-lite-network-traffic-card__label">Inbound</span>
          <span className="ui-lite-network-traffic-card__rate">{formatBitRate(traffic.inbound)}</span>
        </div>
        <div className="ui-lite-network-traffic-card__direction">
          <span className="ui-lite-network-traffic-card__label">Outbound</span>
          <span className="ui-lite-network-traffic-card__rate">{formatBitRate(traffic.outbound)}</span>
        </div>
      </div>
    </div>
    )
  }
)
NetworkTrafficCard.displayName = 'NetworkTrafficCard'
