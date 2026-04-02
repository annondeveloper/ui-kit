import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteNetworkInterface {
  name: string
  status: 'up' | 'down' | 'dormant' | 'unknown'
  speed?: string
  txRate?: number
  rxRate?: number
}

export interface LiteNetworkInterfaceGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  interfaces: LiteNetworkInterface[]
  columns?: number
  compact?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  up: 'oklch(72% 0.19 155)',
  down: 'oklch(62% 0.22 25)',
  dormant: 'oklch(80% 0.18 85)',
  unknown: 'oklch(55% 0 0)',
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  up: 'oklch(72% 0.19 155 / 0.5)',
  down: 'oklch(62% 0.22 25 / 0.5)',
  dormant: 'oklch(80% 0.18 85 / 0.4)',
  unknown: 'oklch(55% 0 0 / 0.3)',
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB/s`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB/s`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${bytes} B/s`
}

/** Lite NetworkInterfaceGrid — simple CSS grid, no animation */
export const NetworkInterfaceGrid = forwardRef<HTMLDivElement, LiteNetworkInterfaceGridProps>(
  ({ interfaces, columns, compact, className, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`ui-lite-network-interface-grid${className ? ` ${className}` : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: columns
            ? `repeat(${columns}, minmax(0, 1fr))`
            : `repeat(auto-fit, minmax(${compact ? '140px' : '180px'}, 1fr))`,
          gap: compact ? '0.375rem' : '0.625rem',
          fontFamily: 'ui-monospace, monospace',
          ...style,
        }}
        {...rest}
      >
        {interfaces.map(iface => (
          <div
            key={iface.name}
            data-status={iface.status}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              padding: compact ? '0.375rem 0.5rem' : '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'oklch(20% 0.01 270)',
              border: '1px solid oklch(100% 0 0 / 0.08)',
              borderInlineStart: `3px solid ${STATUS_BORDER_COLORS[iface.status] || STATUS_BORDER_COLORS.unknown}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span
                style={{
                  inlineSize: '0.5rem',
                  blockSize: '0.5rem',
                  borderRadius: '50%',
                  background: STATUS_COLORS[iface.status] || STATUS_COLORS.unknown,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 700, fontSize: compact ? '0.75rem' : '0.8125rem', color: 'oklch(90% 0 0)' }}>
                {iface.name}
              </span>
              {iface.speed && (
                <span style={{ marginInlineStart: 'auto', fontSize: '0.6875rem', color: 'oklch(70% 0 0)' }}>
                  {iface.speed}
                </span>
              )}
            </div>
            {(iface.txRate != null || iface.rxRate != null) && (
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6875rem', color: 'oklch(65% 0 0)', fontVariantNumeric: 'tabular-nums' }}>
                {iface.txRate != null && <span>{'\u2191'} {formatBytes(iface.txRate)}</span>}
                {iface.rxRate != null && <span>{'\u2193'} {formatBytes(iface.rxRate)}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
)
NetworkInterfaceGrid.displayName = 'NetworkInterfaceGrid'
