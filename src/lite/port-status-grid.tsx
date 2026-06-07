import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const portStatusGridStyles = css`
  @layer components {
    @scope (.ui-lite-port-status-grid) {
      :scope { display: flex; flex-wrap: wrap; gap: 0.25rem; }
      .ui-lite-port-status-grid__port {
        display: flex; align-items: center; justify-content: center;
        inline-size: 3rem; block-size: 2rem; font-size: 0.6875rem; font-weight: 500;
        border-radius: var(--radius-sm, 6px); border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: var(--text-primary, oklch(97% 0 0));
        font-variant-numeric: tabular-nums;
      }
      .ui-lite-port-status-grid__port[data-status="ok"] { background: oklch(72% 0.19 145 / 0.12); color: oklch(72% 0.19 145); }
      .ui-lite-port-status-grid__port[data-status="warning"] { background: oklch(78% 0.17 85 / 0.12); color: oklch(78% 0.17 85); }
      .ui-lite-port-status-grid__port[data-status="critical"] { background: oklch(62% 0.22 25 / 0.12); color: oklch(62% 0.22 25); }
      .ui-lite-port-status-grid__port[data-status="unknown"] { background: oklch(50% 0 0 / 0.06); color: oklch(50% 0 0); }
    }
  }
`

export interface LitePortStatus {
  port: number
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  label?: string
}

export interface LitePortStatusGridProps extends HTMLAttributes<HTMLDivElement> {
  ports: LitePortStatus[]
}

export const PortStatusGrid = forwardRef<HTMLDivElement, LitePortStatusGridProps>(
  ({ ports, className, ...rest }, ref) => {
    useStyles('lite-port-status-grid', portStatusGridStyles)
    return (
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
  }
)
PortStatusGrid.displayName = 'PortStatusGrid'
