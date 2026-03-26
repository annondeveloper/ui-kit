import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteUpstreamLink {
  id: string
  vendor: string
  location: string
  inbound: number
  outbound: number
  status: 'ok' | 'warning' | 'critical' | 'unknown'
}

export interface LiteUpstreamDashboardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  links: LiteUpstreamLink[]
  title?: ReactNode
  mode?: 'hero' | 'compact' | 'table'
}

export const UpstreamDashboard = forwardRef<HTMLDivElement, LiteUpstreamDashboardProps>(
  ({ links, title, mode = 'hero', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-upstream-dashboard${className ? ` ${className}` : ''}`}
      data-mode={mode}
      data-motion="0"
      {...rest}
    >
      {title && <div className="ui-lite-upstream-dashboard__title">{title}</div>}
      <div className="ui-lite-upstream-dashboard__grid">
        {links.map((link) => (
          <div key={link.id} className="ui-lite-upstream-dashboard__link" data-status={link.status}>
            <span className="ui-lite-upstream-dashboard__vendor">{link.vendor}</span>
            <span className="ui-lite-upstream-dashboard__location">{link.location}</span>
          </div>
        ))}
      </div>
    </div>
  )
)
UpstreamDashboard.displayName = 'UpstreamDashboard'
