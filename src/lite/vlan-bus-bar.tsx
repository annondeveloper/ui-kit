import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

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

const vlanBusBarStyles = css`
  @layer components {
    @scope (.ui-lite-vlan-bus-bar) {
      :scope {
        display: inline-block;
        background: var(--bg-surface, oklch(20% 0.01 270));
        border-radius: var(--radius-md, 0.5rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding: var(--space-sm, 0.5rem);
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      svg {
        display: block;
        overflow: visible;
      }

      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        rect {
          forced-color-adjust: none;
        }
      }
    }
  }
`

/** Lite VlanBusBar — simple SVG, no animation, no hover effects */
export const VlanBusBar = forwardRef<HTMLDivElement, LiteVlanBusBarProps>(
  ({ vlans, totalPorts, showLabels = true, className, ...rest }, ref) => {
    useStyles('lite-vlan-bus-bar', vlanBusBarStyles)
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
        {...rest}
      >
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
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
