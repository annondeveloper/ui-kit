'use client'

import {
  type HTMLAttributes,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VlanEntry {
  id: number
  name?: string
  color?: string
  ports: number[]
  tagged?: boolean
}

export interface VlanBusBarProps extends HTMLAttributes<HTMLDivElement> {
  vlans: VlanEntry[]
  totalPorts: number
  showLabels?: boolean
  showPortNumbers?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  onVlanClick?: (vlan: VlanEntry) => void
  onPortClick?: (port: number, vlans: VlanEntry[]) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function autoColor(index: number): string {
  const hue = (index * 137.508) % 360
  return `oklch(65% 0.15 ${hue})`
}

// ─── Dimensions ─────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { rowHeight: 16, tickWidth: 12, labelWidth: 80, fontSize: 0.625, portFontSize: 0.5, padding: 2 },
  md: { rowHeight: 22, tickWidth: 16, labelWidth: 110, fontSize: 0.75, portFontSize: 0.625, padding: 3 },
  lg: { rowHeight: 30, tickWidth: 22, labelWidth: 140, fontSize: 0.875, portFontSize: 0.75, padding: 4 },
} as const

// ─── Styles ─────────────────────────────────────────────────────────────────

const busBarStyles = css`
  @layer components {
    @scope (.ui-vlan-bus-bar) {
      :scope {
        position: relative;
        display: inline-block;
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      :scope[data-orientation="vertical"] {
        writing-mode: vertical-lr;
      }

      .ui-vlan-bus-bar__svg {
        display: block;
        overflow: visible;
      }

      /* VLAN label text */
      .ui-vlan-bus-bar__label {
        fill: var(--text-secondary, oklch(70% 0 0));
        font-weight: 600;
        dominant-baseline: central;
        text-anchor: end;
      }

      /* Port tick labels */
      .ui-vlan-bus-bar__port-label {
        fill: var(--text-tertiary, oklch(55% 0 0));
        text-anchor: middle;
        dominant-baseline: hanging;
        font-variant-numeric: tabular-nums;
      }

      /* VLAN segment rectangles */
      .ui-vlan-bus-bar__segment {
        cursor: default;
        transition: opacity 0.15s ease;
      }

      .ui-vlan-bus-bar__segment--clickable {
        cursor: pointer;
      }

      .ui-vlan-bus-bar__segment--dimmed {
        opacity: 0.25;
      }

      /* Port tick marks */
      .ui-vlan-bus-bar__tick {
        stroke: var(--border-default, oklch(100% 0 0 / 0.1));
        stroke-width: 1;
      }

      .ui-vlan-bus-bar__tick--highlighted {
        stroke: var(--text-primary, oklch(90% 0 0));
        stroke-width: 2;
      }

      .ui-vlan-bus-bar__port-tick-area {
        cursor: default;
        fill: transparent;
      }

      .ui-vlan-bus-bar__port-tick-area--clickable {
        cursor: pointer;
      }

      /* Tooltip */
      .ui-vlan-bus-bar__tooltip {
        position: absolute;
        padding: 0.25rem 0.5rem;
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 10;
        line-height: 1.4;
        transform: translate(-50%, -100%);
        margin-block-start: -4px;
      }

      .ui-vlan-bus-bar__tooltip-tagged {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
      }

      /* Tagged segments: dashed outline */
      .ui-vlan-bus-bar__segment--tagged {
        stroke-dasharray: 3 2;
        stroke-width: 1;
      }

      /* Motion hover effects */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-vlan-bus-bar__segment:hover {
          filter: brightness(1.2);
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-vlan-bus-bar__segment {
          forced-color-adjust: none;
          stroke: ButtonText;
          stroke-width: 1;
        }
        .ui-vlan-bus-bar__label,
        .ui-vlan-bus-bar__port-label {
          fill: ButtonText;
        }
        .ui-vlan-bus-bar__tick {
          stroke: ButtonText;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-vlan-bus-bar__segment { transition: none; }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function VlanBusBarInner({
  vlans,
  totalPorts,
  showLabels = true,
  showPortNumbers = false,
  orientation = 'horizontal',
  size = 'md',
  onVlanClick,
  onPortClick,
  motion: motionProp,
  className,
  ...rest
}: VlanBusBarProps) {
  useStyles('vlan-bus-bar', busBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredVlan, setHoveredVlan] = useState<number | null>(null)
  const [hoveredPort, setHoveredPort] = useState<number | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number; y: number; content: string; sub?: string } | null>(null)

  const config = SIZE_CONFIG[size]
  const labelAreaWidth = showLabels ? config.labelWidth : 0
  const portNumberAreaHeight = showPortNumbers ? config.rowHeight : 0
  const gap = config.padding
  const chartWidth = totalPorts * config.tickWidth
  const totalWidth = labelAreaWidth + chartWidth + gap * 2
  const totalHeight = vlans.length * (config.rowHeight + gap) + gap + portNumberAreaHeight

  // Build port-to-vlans lookup
  const portVlansMap = useMemo(() => {
    const map = new Map<number, VlanEntry[]>()
    for (let p = 1; p <= totalPorts; p++) {
      const containing = vlans.filter(v => v.ports.includes(p))
      if (containing.length > 0) map.set(p, containing)
    }
    return map
  }, [vlans, totalPorts])

  // Compute colors
  const vlanColors = useMemo(() => {
    return vlans.map((vlan, i) => vlan.color || autoColor(i))
  }, [vlans])

  const handleSegmentEnter = useCallback((vlan: VlanEntry, x: number, y: number) => {
    setHoveredVlan(vlan.id)
    setTooltipInfo({
      x,
      y,
      content: `VLAN ${vlan.id}${vlan.name ? ` — ${vlan.name}` : ''} (${vlan.ports.length} ports)`,
      sub: vlan.tagged ? 'Tagged (trunk)' : 'Untagged (access)',
    })
  }, [])

  const handleSegmentLeave = useCallback(() => {
    setHoveredVlan(null)
    setTooltipInfo(null)
  }, [])

  const handlePortEnter = useCallback((port: number) => {
    setHoveredPort(port)
  }, [])

  const handlePortLeave = useCallback(() => {
    setHoveredPort(null)
  }, [])

  const isVertical = orientation === 'vertical'

  return (
    <div
      className={cn('ui-vlan-bus-bar', className)}
      data-motion={motionLevel}
      data-size={size}
      data-orientation={orientation}
      role="img"
      aria-label={`VLAN bus bar diagram showing ${vlans.length} VLANs across ${totalPorts} ports`}
      style={isVertical ? { writingMode: 'initial' } : undefined}
      {...rest}
    >
      <svg
        className="ui-vlan-bus-bar__svg"
        width={isVertical ? totalHeight : totalWidth}
        height={isVertical ? totalWidth : totalHeight}
        viewBox={isVertical ? `0 0 ${totalHeight} ${totalWidth}` : `0 0 ${totalWidth} ${totalHeight}`}
        aria-hidden="true"
      >
        {isVertical ? (
          <g transform={`rotate(90 ${totalHeight / 2} ${totalHeight / 2}) translate(${(totalHeight - totalWidth) / 2} ${(totalHeight - totalHeight) / 2})`}>
            {renderContent()}
          </g>
        ) : renderContent()}
      </svg>

      {/* Tooltip */}
      {tooltipInfo && (
        <div
          className="ui-vlan-bus-bar__tooltip"
          style={{ left: tooltipInfo.x, top: tooltipInfo.y }}
        >
          <div>{tooltipInfo.content}</div>
          {tooltipInfo.sub && (
            <div className="ui-vlan-bus-bar__tooltip-tagged">{tooltipInfo.sub}</div>
          )}
        </div>
      )}
    </div>
  )

  function renderContent() {
    return (
      <>
        {/* VLAN rows */}
        {vlans.map((vlan, vlanIndex) => {
          const y = gap + vlanIndex * (config.rowHeight + gap)
          const color = vlanColors[vlanIndex]
          const isDimmed = hoveredPort !== null && !vlan.ports.includes(hoveredPort)

          return (
            <g key={vlan.id} data-testid={`vlan-row-${vlan.id}`}>
              {/* Label */}
              {showLabels && (
                <text
                  className="ui-vlan-bus-bar__label"
                  x={labelAreaWidth - gap}
                  y={y + config.rowHeight / 2}
                  fontSize={config.fontSize + 'rem'}
                >
                  {vlan.name || `VLAN ${vlan.id}`}
                </text>
              )}

              {/* Port segments */}
              {Array.from({ length: totalPorts }, (_, portIdx) => {
                const port = portIdx + 1
                const inVlan = vlan.ports.includes(port)
                if (!inVlan) return null

                const x = labelAreaWidth + gap + portIdx * config.tickWidth
                return (
                  <rect
                    key={port}
                    className={cn(
                      'ui-vlan-bus-bar__segment',
                      onVlanClick && 'ui-vlan-bus-bar__segment--clickable',
                      isDimmed && 'ui-vlan-bus-bar__segment--dimmed',
                      vlan.tagged && 'ui-vlan-bus-bar__segment--tagged',
                    )}
                    x={x + 1}
                    y={y}
                    width={config.tickWidth - 2}
                    height={config.rowHeight}
                    rx={2}
                    fill={color}
                    fillOpacity={0.7}
                    stroke={vlan.tagged ? color : 'none'}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect()
                      const parent = (e.target as SVGRectElement).closest('.ui-vlan-bus-bar')?.getBoundingClientRect()
                      if (parent) {
                        handleSegmentEnter(vlan, rect.left - parent.left + rect.width / 2, rect.top - parent.top)
                      }
                    }}
                    onMouseLeave={handleSegmentLeave}
                    onClick={onVlanClick ? () => onVlanClick(vlan) : undefined}
                  />
                )
              })}
            </g>
          )
        })}

        {/* Port tick marks */}
        {Array.from({ length: totalPorts }, (_, portIdx) => {
          const port = portIdx + 1
          const x = labelAreaWidth + gap + portIdx * config.tickWidth + config.tickWidth / 2
          const tickTop = 0
          const tickBottom = vlans.length * (config.rowHeight + gap) + gap
          const isHighlighted = hoveredPort === port

          return (
            <g key={port}>
              <line
                className={cn(
                  'ui-vlan-bus-bar__tick',
                  isHighlighted && 'ui-vlan-bus-bar__tick--highlighted',
                )}
                x1={x}
                y1={tickTop}
                x2={x}
                y2={tickBottom}
                opacity={0.15}
              />

              {/* Invisible hit area for port hover */}
              <rect
                className={cn(
                  'ui-vlan-bus-bar__port-tick-area',
                  onPortClick && 'ui-vlan-bus-bar__port-tick-area--clickable',
                )}
                x={labelAreaWidth + gap + portIdx * config.tickWidth}
                y={tickTop}
                width={config.tickWidth}
                height={tickBottom}
                onMouseEnter={() => handlePortEnter(port)}
                onMouseLeave={handlePortLeave}
                onClick={onPortClick ? () => onPortClick(port, portVlansMap.get(port) || []) : undefined}
              />

              {/* Port number labels */}
              {showPortNumbers && (
                <text
                  className="ui-vlan-bus-bar__port-label"
                  x={x}
                  y={tickBottom + gap}
                  fontSize={config.portFontSize + 'rem'}
                >
                  {port}
                </text>
              )}
            </g>
          )
        })}
      </>
    )
  }
}

export function VlanBusBar(props: VlanBusBarProps) {
  return (
    <ComponentErrorBoundary>
      <VlanBusBarInner {...props} />
    </ComponentErrorBoundary>
  )
}

VlanBusBar.displayName = 'VlanBusBar'
