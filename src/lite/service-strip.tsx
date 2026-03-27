import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
