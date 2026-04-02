'use client'

import {
  type HTMLAttributes,
  type CSSProperties,
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
  /** Externally highlight specific ports */
  highlightPorts?: number[]
  /** Externally highlight specific VLANs by ID */
  highlightVlans?: number[]
  /** Show trunk (T) / access (A) mode indicator per port */
  showTrunkIndicator?: boolean
  /** Thin bars without labels for small spaces */
  compactMode?: boolean
  /** Constrain the SVG height */
  maxHeight?: number | string
  /** Color generation mode: auto (default), categorical (max-separation hues), sequential (single-hue ramp) */
  colorScheme?: 'auto' | 'categorical' | 'sequential'
  /** Callback when a port is hovered (null on leave) */
  onPortHover?: (port: number | null) => void
  /** Callback when a VLAN row is hovered (null on leave) */
  onVlanHover?: (vlan: VlanEntry | null) => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function autoColor(index: number, scheme: 'auto' | 'categorical' | 'sequential' = 'auto', total: number = 1): string {
  if (scheme === 'sequential') {
    // Single-hue ramp (blue) with varying lightness
    const lightness = 75 - (index / Math.max(total - 1, 1)) * 30
    return `oklch(${lightness}% 0.15 250)`
  }
  // auto and categorical both use golden-angle hue rotation
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

      :scope[data-compact] {
        font-size: 0;
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
        transition: opacity 0.15s ease, filter 0.15s ease;
      }

      .ui-vlan-bus-bar__segment--clickable {
        cursor: pointer;
      }

      .ui-vlan-bus-bar__segment--dimmed {
        opacity: 0.18;
      }

      .ui-vlan-bus-bar__segment--highlighted {
        filter: brightness(1.25);
        opacity: 1;
      }

      /* Connector dots between port ticks and VLAN segments */
      .ui-vlan-bus-bar__connector {
        transition: opacity 0.15s ease, r 0.15s ease;
      }

      .ui-vlan-bus-bar__connector--dimmed {
        opacity: 0.15;
      }

      .ui-vlan-bus-bar__connector--highlighted {
        opacity: 1;
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

      /* Trunk/access mode indicator */
      .ui-vlan-bus-bar__trunk-indicator {
        fill: var(--text-tertiary, oklch(55% 0 0));
        text-anchor: middle;
        dominant-baseline: hanging;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .ui-vlan-bus-bar__trunk-indicator--trunk {
        fill: oklch(70% 0.15 250);
      }

      .ui-vlan-bus-bar__trunk-indicator--access {
        fill: oklch(70% 0.12 140);
      }

      /* Tooltip */
      .ui-vlan-bus-bar__tooltip {
        position: absolute;
        padding: 0.375rem 0.625rem;
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
        margin-block-start: -6px;
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3);
      }

      .ui-vlan-bus-bar__tooltip-title {
        font-weight: 600;
      }

      .ui-vlan-bus-bar__tooltip-detail {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
        margin-block-start: 0.125rem;
      }

      /* Tagged segments: dashed outline */
      .ui-vlan-bus-bar__segment--tagged {
        stroke-dasharray: 3 2;
        stroke-width: 1;
      }

      /* Untagged segments: solid border */
      .ui-vlan-bus-bar__segment--untagged {
        stroke-width: 1.5;
      }

      /* VLAN row background for hover target */
      .ui-vlan-bus-bar__row-bg {
        fill: transparent;
        cursor: default;
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
        .ui-vlan-bus-bar__connector {
          fill: ButtonText;
        }
        .ui-vlan-bus-bar__trunk-indicator {
          fill: ButtonText;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-vlan-bus-bar__segment { transition: none; }
        .ui-vlan-bus-bar__connector { transition: none; }
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
  highlightPorts,
  highlightVlans,
  showTrunkIndicator = false,
  compactMode = false,
  maxHeight,
  colorScheme = 'auto',
  onPortHover,
  onVlanHover,
  className,
  style,
  ...rest
}: VlanBusBarProps) {
  useStyles('vlan-bus-bar', busBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredVlan, setHoveredVlan] = useState<number | null>(null)
  const [hoveredPort, setHoveredPort] = useState<number | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number
    y: number
    title: string
    details: string[]
  } | null>(null)

  // In compact mode, hide labels and use sm config
  const effectiveSize = compactMode ? 'sm' : size
  const effectiveShowLabels = compactMode ? false : showLabels
  const effectiveShowPortNumbers = compactMode ? false : showPortNumbers

  const config = SIZE_CONFIG[effectiveSize]
  const labelAreaWidth = effectiveShowLabels ? config.labelWidth : 0
  const trunkIndicatorHeight = showTrunkIndicator ? config.rowHeight : 0
  const portNumberAreaHeight = effectiveShowPortNumbers ? config.rowHeight : 0
  const gap = config.padding
  const chartWidth = totalPorts * config.tickWidth
  const totalWidth = labelAreaWidth + chartWidth + gap * 2
  const totalHeight = vlans.length * (config.rowHeight + gap) + gap + portNumberAreaHeight + trunkIndicatorHeight

  // Build port-to-vlans lookup
  const portVlansMap = useMemo(() => {
    const map = new Map<number, VlanEntry[]>()
    for (let p = 1; p <= totalPorts; p++) {
      const containing = vlans.filter(v => v.ports.includes(p))
      if (containing.length > 0) map.set(p, containing)
    }
    return map
  }, [vlans, totalPorts])

  // Determine trunk/access per port: trunk if port is in any tagged VLAN
  const portTrunkMap = useMemo(() => {
    if (!showTrunkIndicator) return new Map<number, boolean>()
    const map = new Map<number, boolean>()
    for (let p = 1; p <= totalPorts; p++) {
      const containing = portVlansMap.get(p) || []
      const isTrunk = containing.some(v => v.tagged)
      map.set(p, isTrunk)
    }
    return map
  }, [showTrunkIndicator, portVlansMap, totalPorts])

  // Compute colors
  const vlanColors = useMemo(() => {
    return vlans.map((vlan, i) => vlan.color || autoColor(i, colorScheme, vlans.length))
  }, [vlans, colorScheme])

  // Build set of externally highlighted port/vlan IDs for fast lookup
  const highlightPortSet = useMemo(
    () => new Set(highlightPorts || []),
    [highlightPorts],
  )
  const highlightVlanSet = useMemo(
    () => new Set(highlightVlans || []),
    [highlightVlans],
  )

  // Determine effective highlighting state
  const hasExternalHighlight = highlightPortSet.size > 0 || highlightVlanSet.size > 0
  const hasHoverHighlight = hoveredPort !== null || hoveredVlan !== null
  const hasAnyHighlight = hasExternalHighlight || hasHoverHighlight

  const isPortHighlighted = useCallback((port: number): boolean => {
    if (highlightPortSet.has(port)) return true
    if (hoveredPort === port) return true
    // If a VLAN is hovered, highlight its ports
    if (hoveredVlan !== null) {
      const vlan = vlans.find(v => v.id === hoveredVlan)
      if (vlan?.ports.includes(port)) return true
    }
    // If a VLAN is externally highlighted, highlight its ports
    for (const vid of highlightVlanSet) {
      const vlan = vlans.find(v => v.id === vid)
      if (vlan?.ports.includes(port)) return true
    }
    return false
  }, [highlightPortSet, highlightVlanSet, hoveredPort, hoveredVlan, vlans])

  const isVlanHighlighted = useCallback((vlan: VlanEntry): boolean => {
    if (highlightVlanSet.has(vlan.id)) return true
    if (hoveredVlan === vlan.id) return true
    // If a port is hovered, highlight VLANs containing it
    if (hoveredPort !== null && vlan.ports.includes(hoveredPort)) return true
    // If a port is externally highlighted, highlight VLANs containing it
    for (const p of highlightPortSet) {
      if (vlan.ports.includes(p)) return true
    }
    return false
  }, [highlightVlanSet, highlightPortSet, hoveredPort, hoveredVlan])

  const handleSegmentEnter = useCallback((vlan: VlanEntry, x: number, y: number) => {
    setHoveredVlan(vlan.id)
    onVlanHover?.(vlan)
    const taggedPorts = vlan.ports.filter(p => vlan.tagged)
    setTooltipInfo({
      x,
      y,
      title: `VLAN ${vlan.id}${vlan.name ? ` — ${vlan.name}` : ''}`,
      details: [
        `${vlan.ports.length} port${vlan.ports.length !== 1 ? 's' : ''}`,
        vlan.tagged ? 'Tagged (trunk)' : 'Untagged (access)',
      ],
    })
  }, [onVlanHover])

  const handleSegmentLeave = useCallback(() => {
    setHoveredVlan(null)
    onVlanHover?.(null)
    setTooltipInfo(null)
  }, [onVlanHover])

  const handlePortEnter = useCallback((port: number) => {
    setHoveredPort(port)
    onPortHover?.(port)
    // Build tooltip for port
    const containing = portVlansMap.get(port) || []
    if (containing.length > 0) {
      setTooltipInfo(prev => prev ? prev : null) // Don't override VLAN tooltip
    }
  }, [onPortHover, portVlansMap])

  const handlePortLeave = useCallback(() => {
    setHoveredPort(null)
    onPortHover?.(null)
  }, [onPortHover])

  const isVertical = orientation === 'vertical'

  const containerStyle: CSSProperties = {
    ...(isVertical ? { writingMode: 'initial' as const } : undefined),
    ...(maxHeight != null ? { maxBlockSize: maxHeight, overflow: 'auto' } : undefined),
    ...style,
  }

  return (
    <div
      className={cn('ui-vlan-bus-bar', className)}
      data-motion={motionLevel}
      data-size={effectiveSize}
      data-orientation={orientation}
      {...(compactMode ? { 'data-compact': '' } : {})}
      role="img"
      aria-label={`VLAN bus bar diagram showing ${vlans.length} VLANs across ${totalPorts} ports`}
      style={containerStyle}
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
          <div className="ui-vlan-bus-bar__tooltip-title">{tooltipInfo.title}</div>
          {tooltipInfo.details.map((d, i) => (
            <div key={i} className="ui-vlan-bus-bar__tooltip-detail">{d}</div>
          ))}
        </div>
      )}
    </div>
  )

  function renderContent() {
    const connectorRadius = Math.max(2, config.tickWidth / 6)

    return (
      <>
        {/* VLAN rows */}
        {vlans.map((vlan, vlanIndex) => {
          const y = gap + vlanIndex * (config.rowHeight + gap)
          const color = vlanColors[vlanIndex]
          const vlanHl = isVlanHighlighted(vlan)
          const isDimmed = hasAnyHighlight && !vlanHl

          return (
            <g key={vlan.id} data-testid={`vlan-row-${vlan.id}`}>
              {/* Invisible row background for VLAN hover */}
              <rect
                className="ui-vlan-bus-bar__row-bg"
                x={labelAreaWidth}
                y={y}
                width={chartWidth + gap * 2}
                height={config.rowHeight}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect()
                  const parent = (e.target as SVGRectElement).closest('.ui-vlan-bus-bar')?.getBoundingClientRect()
                  if (parent) {
                    handleSegmentEnter(vlan, rect.left - parent.left + rect.width / 2, rect.top - parent.top)
                  }
                }}
                onMouseLeave={handleSegmentLeave}
              />

              {/* Label */}
              {effectiveShowLabels && (
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
                const segHighlighted = hasAnyHighlight && vlanHl && isPortHighlighted(port)
                return (
                  <rect
                    key={port}
                    className={cn(
                      'ui-vlan-bus-bar__segment',
                      onVlanClick && 'ui-vlan-bus-bar__segment--clickable',
                      isDimmed && !segHighlighted && 'ui-vlan-bus-bar__segment--dimmed',
                      segHighlighted && 'ui-vlan-bus-bar__segment--highlighted',
                      vlan.tagged && 'ui-vlan-bus-bar__segment--tagged',
                      !vlan.tagged && 'ui-vlan-bus-bar__segment--untagged',
                    )}
                    x={x + 1}
                    y={y}
                    width={config.tickWidth - 2}
                    height={config.rowHeight}
                    rx={2}
                    fill={color}
                    fillOpacity={segHighlighted ? 0.9 : 0.7}
                    stroke={vlan.tagged ? color : (segHighlighted ? color : 'none')}
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

              {/* Connector dots: small circles at the center-bottom of each segment */}
              {Array.from({ length: totalPorts }, (_, portIdx) => {
                const port = portIdx + 1
                const inVlan = vlan.ports.includes(port)
                if (!inVlan) return null

                const cx = labelAreaWidth + gap + portIdx * config.tickWidth + config.tickWidth / 2
                const cy = y + config.rowHeight
                const connDimmed = hasAnyHighlight && !(vlanHl && isPortHighlighted(port))

                return (
                  <circle
                    key={`conn-${port}`}
                    className={cn(
                      'ui-vlan-bus-bar__connector',
                      connDimmed && 'ui-vlan-bus-bar__connector--dimmed',
                      !connDimmed && hasAnyHighlight && 'ui-vlan-bus-bar__connector--highlighted',
                    )}
                    cx={cx}
                    cy={cy}
                    r={connectorRadius}
                    fill={color}
                    fillOpacity={0.9}
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
          const isHl = isPortHighlighted(port)
          const isHighlighted = hoveredPort === port || isHl

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
                opacity={isHighlighted ? 0.4 : 0.15}
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
              {effectiveShowPortNumbers && (
                <text
                  className="ui-vlan-bus-bar__port-label"
                  x={x}
                  y={tickBottom + gap}
                  fontSize={config.portFontSize + 'rem'}
                >
                  {port}
                </text>
              )}

              {/* Trunk/access indicator */}
              {showTrunkIndicator && (
                <text
                  className={cn(
                    'ui-vlan-bus-bar__trunk-indicator',
                    portTrunkMap.get(port)
                      ? 'ui-vlan-bus-bar__trunk-indicator--trunk'
                      : (portVlansMap.has(port) ? 'ui-vlan-bus-bar__trunk-indicator--access' : ''),
                  )}
                  x={x}
                  y={tickBottom + (effectiveShowPortNumbers ? config.rowHeight : 0) + gap}
                  fontSize={config.portFontSize + 'rem'}
                >
                  {portVlansMap.has(port) ? (portTrunkMap.get(port) ? 'T' : 'A') : ''}
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
