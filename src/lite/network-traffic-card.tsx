import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ title, vendor, location, traffic, status, compact, className, ...rest }, ref) => (
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
)
NetworkTrafficCard.displayName = 'NetworkTrafficCard'
