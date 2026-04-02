import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteVlanEntry {
  id: number
  name?: string
  ports: number[]
}

export interface LiteVlanBusBarProps extends HTMLAttributes<HTMLDivElement> {
  vlans: LiteVlanEntry[]
  totalPorts: number
  showLabels?: boolean
}

function autoColor(index: number): string {
  const hue = (index * 137.508) % 360
  return `oklch(65% 0.15 ${hue})`
}

/** Lite VlanBusBar — simple SVG, no animation, no hover effects */
export const VlanBusBar = forwardRef<HTMLDivElement, LiteVlanBusBarProps>(
  ({ vlans, totalPorts, showLabels = true, className, ...rest }, ref) => {
    const tickWidth = 14
    const rowHeight = 18
    const gap = 2
    const labelWidth = showLabels ? 90 : 0
    const chartWidth = totalPorts * tickWidth
    const totalWidth = labelWidth + chartWidth + gap * 2
    const totalHeight = vlans.length * (rowHeight + gap) + gap

    const colors = useMemo(() => vlans.map((_, i) => autoColor(i)), [vlans])

    return (
      <div
        ref={ref}
        className={`ui-lite-vlan-bus-bar${className ? ` ${className}` : ''}`}
        style={{
          display: 'inline-block',
          background: 'oklch(20% 0.01 270)',
          borderRadius: '0.5rem',
          border: '1px solid oklch(100% 0 0 / 0.08)',
          padding: '0.5rem',
        }}
        {...rest}
      >
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          style={{ display: 'block' }}
        >
          {vlans.map((vlan, vi) => {
            const y = gap + vi * (rowHeight + gap)
            const color = colors[vi]

            return (
              <g key={vlan.id}>
                {showLabels && (
                  <text
                    x={labelWidth - gap}
                    y={y + rowHeight / 2}
                    fill="oklch(70% 0 0)"
                    fontSize="0.625rem"
                    fontWeight={600}
                    dominantBaseline="central"
                    textAnchor="end"
                  >
                    {vlan.name || `VLAN ${vlan.id}`}
                  </text>
                )}

                {Array.from({ length: totalPorts }, (_, pi) => {
                  const port = pi + 1
                  if (!vlan.ports.includes(port)) return null
                  const x = labelWidth + gap + pi * tickWidth
                  return (
                    <rect
                      key={port}
                      x={x + 1}
                      y={y}
                      width={tickWidth - 2}
                      height={rowHeight}
                      rx={2}
                      fill={color}
                      fillOpacity={0.7}
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }
)
VlanBusBar.displayName = 'VlanBusBar'
