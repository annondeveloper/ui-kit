import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteRackDevice { startU: number; heightU: number; label: string; status?: 'ok' | 'warning' | 'critical' | 'empty' }

export interface LiteRackDiagramProps extends HTMLAttributes<HTMLDivElement> {
  units: number
  devices: LiteRackDevice[]
  showUnitNumbers?: boolean
}

const STATUS_BG: Record<string, string> = {
  ok: 'oklch(45% 0.12 155)',
  warning: 'oklch(55% 0.14 85)',
  critical: 'oklch(45% 0.18 25)',
  empty: 'oklch(100% 0 0 / 0.04)',
}

/** Lite rack diagram — simple CSS grid, no animation */
export const RackDiagram = forwardRef<HTMLDivElement, LiteRackDiagramProps>(
  ({ units, devices, showUnitNumbers = true, className, ...rest }, ref) => {
    const unitH = 14
    return (
      <div
        ref={ref}
        className={`ui-lite-rack-diagram${className ? ` ${className}` : ''}`}
        role="img"
        aria-label={`Rack: ${units}U`}
        style={{ display: 'inline-flex' }}
        {...rest}
      >
        {showUnitNumbers && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: units }, (_, i) => (
              <div key={i} style={{ height: unitH, fontSize: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, color: 'oklch(55% 0 0)' }}>
                {units - i}
              </div>
            ))}
          </div>
        )}
        <div style={{ position: 'relative', width: 120, height: units * unitH, border: '1px solid oklch(100% 0 0 / 0.12)', borderRadius: 4, background: 'oklch(22% 0.01 270)' }}>
          {devices.map((dev) => {
            const top = (units - dev.startU - dev.heightU + 1) * unitH
            return (
              <div
                key={`${dev.startU}-${dev.label}`}
                title={`${dev.label} U${dev.startU}${dev.heightU > 1 ? `-${dev.startU + dev.heightU - 1}` : ''}`}
                style={{
                  position: 'absolute', left: 2, right: 2, top: top + 1, height: dev.heightU * unitH - 2,
                  borderRadius: 2, background: STATUS_BG[dev.status ?? 'ok'],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', color: dev.status === 'empty' ? 'oklch(55% 0 0)' : 'oklch(95% 0 0)', overflow: 'hidden',
                }}
              >
                {dev.label}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
RackDiagram.displayName = 'RackDiagram'
