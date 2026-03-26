import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteSwitchPort {
  id: number
  label?: string
  status: 'up' | 'down' | 'admin-down' | 'unused'
  type?: 'ethernet' | 'sfp' | 'qsfp' | 'management'
}

export interface LiteSwitchFaceplateProps extends HTMLAttributes<HTMLDivElement> {
  ports: LiteSwitchPort[]
  rows?: number
  label?: string
}

const STATUS_COLORS: Record<string, string> = {
  up: 'oklch(72% 0.19 155 / 0.3)',
  down: 'oklch(62% 0.22 25 / 0.3)',
  'admin-down': 'oklch(80% 0.18 85 / 0.25)',
  unused: 'oklch(100% 0 0 / 0.06)',
}

const STATUS_BORDERS: Record<string, string> = {
  up: 'oklch(72% 0.19 155 / 0.5)',
  down: 'oklch(62% 0.22 25 / 0.5)',
  'admin-down': 'oklch(80% 0.18 85 / 0.4)',
  unused: 'oklch(100% 0 0 / 0.1)',
}

/** Lite SwitchFaceplate — simple CSS grid, no animation */
export const SwitchFaceplate = forwardRef<HTMLDivElement, LiteSwitchFaceplateProps>(
  ({ ports, rows = 2, label, className, ...rest }, ref) => {
    const portRows = useMemo(() => {
      const result: LiteSwitchPort[][] = Array.from({ length: rows }, () => [])
      ports.forEach((port, idx) => result[idx % rows].push(port))
      return result
    }, [ports, rows])

    return (
      <div
        ref={ref}
        className={`ui-lite-switch-faceplate${className ? ` ${className}` : ''}`}
        style={{ display: 'inline-block', padding: '0.5rem', background: 'oklch(20% 0.01 270)', borderRadius: '0.5rem', border: '1px solid oklch(100% 0 0 / 0.08)' }}
        {...rest}
      >
        {label && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'oklch(70% 0 0)', marginBlockEnd: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </div>
        )}
        {portRows.map((rowPorts, ri) => (
          <div key={ri} style={{ display: 'flex', gap: '0.25rem', marginBlockEnd: ri < rows - 1 ? '0.25rem' : 0 }}>
            {rowPorts.map(port => (
              <div
                key={port.id}
                data-status={port.status}
                title={port.label ?? `Port ${port.id}: ${port.status}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  inlineSize: '1.75rem',
                  blockSize: '1.75rem',
                  fontSize: '0.625rem',
                  fontVariantNumeric: 'tabular-nums',
                  borderRadius: port.type === 'management' ? '50%' : (port.type === 'sfp' || port.type === 'qsfp') ? '0.125rem' : '0.25rem',
                  background: STATUS_COLORS[port.status] || STATUS_COLORS.unused,
                  border: `1px solid ${STATUS_BORDERS[port.status] || STATUS_BORDERS.unused}`,
                  color: 'oklch(80% 0 0)',
                }}
              >
                {port.id}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
)
SwitchFaceplate.displayName = 'SwitchFaceplate'
