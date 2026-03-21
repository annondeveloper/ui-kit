import { forwardRef, type HTMLAttributes } from 'react'

export interface LitePortStatus {
  port: number
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  label?: string
}

export interface LitePortStatusGridProps extends HTMLAttributes<HTMLDivElement> {
  ports: LitePortStatus[]
}

export const PortStatusGrid = forwardRef<HTMLDivElement, LitePortStatusGridProps>(
  ({ ports, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-port-status-grid${className ? ` ${className}` : ''}`} {...rest}>
      {ports.map(port => (
        <div
          key={port.port}
          className="ui-lite-port-status-grid__port"
          data-status={port.status}
          title={port.label ?? `Port ${port.port}`}
        >
          {port.port}
        </div>
      ))}
    </div>
  )
)
PortStatusGrid.displayName = 'PortStatusGrid'
