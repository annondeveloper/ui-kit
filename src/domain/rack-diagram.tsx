'use client'

import {
  type HTMLAttributes,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export type RackDeviceStatus = 'ok' | 'warning' | 'critical' | 'empty'

export interface RackDevice {
  startU: number
  heightU: number
  label: string
  status?: RackDeviceStatus
}

export interface RackDiagramProps extends HTMLAttributes<HTMLDivElement> {
  units: number
  devices: RackDevice[]
  showUnitNumbers?: boolean
  orientation?: 'front' | 'rear'
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const rackDiagramStyles = css`
  @layer components {
    @scope (.ui-rack-diagram) {
      :scope { position: relative; display: inline-flex; }
      .ui-rack-diagram__numbers { display: flex; flex-direction: column; padding-block-start: 2px; }
      .ui-rack-diagram__number { display: flex; align-items: center; justify-content: flex-end; padding-inline-end: 0.375rem; font-size: var(--text-xs, 0.75rem); font-variant-numeric: tabular-nums; color: var(--text-tertiary, oklch(55% 0 0)); }
      :scope[data-size="sm"] .ui-rack-diagram__number { font-size: 0.5rem; padding-inline-end: 0.25rem; }
      .ui-rack-diagram__frame { position: relative; border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12)); border-radius: var(--radius-sm, 0.375rem); background: var(--bg-surface, oklch(22% 0.01 270)); overflow: hidden; }
      :scope[data-size="sm"] .ui-rack-diagram__frame { --unit-h: 10px; --rack-w: 100px; }
      :scope[data-size="md"] .ui-rack-diagram__frame { --unit-h: 16px; --rack-w: 160px; }
      :scope[data-size="lg"] .ui-rack-diagram__frame { --unit-h: 22px; --rack-w: 220px; }
      .ui-rack-diagram__slot { border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06)); inline-size: var(--rack-w, 160px); block-size: var(--unit-h, 16px); }
      .ui-rack-diagram__device { position: absolute; inset-inline: 2px; border-radius: var(--radius-xs, 0.125rem); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs, 0.75rem); color: oklch(95% 0 0); overflow: hidden; white-space: nowrap; padding-inline: 0.375rem; cursor: default; transition: filter 0.2s ease; }
      :scope[data-size="sm"] .ui-rack-diagram__device { font-size: 0.45rem; padding-inline: 0.125rem; }
      :scope[data-motion="0"] .ui-rack-diagram__device { transition: none; }
      .ui-rack-diagram__device:hover { filter: brightness(1.15); }
      .ui-rack-diagram__device[data-status="ok"] { background: oklch(45% 0.12 155); }
      .ui-rack-diagram__device[data-status="warning"] { background: oklch(55% 0.14 85); }
      .ui-rack-diagram__device[data-status="critical"] { background: oklch(45% 0.18 25); }
      .ui-rack-diagram__device[data-status="empty"] { background: var(--bg-muted, oklch(100% 0 0 / 0.04)); color: var(--text-tertiary, oklch(55% 0 0)); }
      .ui-rack-diagram__tooltip { position: fixed; padding: 0.375rem 0.625rem; background: var(--bg-elevated, oklch(28% 0.02 270)); border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1)); border-radius: var(--radius-sm, 0.375rem); font-size: var(--text-xs, 0.75rem); color: var(--text-primary, oklch(90% 0 0)); pointer-events: none; white-space: nowrap; z-index: 10; transform: translate(0.5rem, -50%); }
      @media (forced-colors: active) {
        .ui-rack-diagram__frame { border-color: CanvasText; }
        .ui-rack-diagram__device { border: 1px solid CanvasText; }
        .ui-rack-diagram__device[data-status="critical"] { background: Mark; }
      }
    }
  }
`

// ─── Constants ──────────────────────────────────────────────────────────────

const UNIT_H_MAP = { sm: 10, md: 16, lg: 22 } as const

// ─── Component ──────────────────────────────────────────────────────────────

function RackDiagramInner({
  units,
  devices,
  showUnitNumbers = true,
  orientation = 'front',
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: RackDiagramProps) {
  useStyles('rack-diagram', rackDiagramStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [tooltip, setTooltip] = useState<{ device: RackDevice; x: number; y: number } | null>(null)

  const unitH = UNIT_H_MAP[size]

  // Build a map of which units are occupied
  const deviceMap = new Map<number, RackDevice>()
  for (const dev of devices) {
    deviceMap.set(dev.startU, dev)
  }

  // Generate unit slots (top-down = high U to low U for front)
  const unitNums = Array.from({ length: units }, (_, i) =>
    orientation === 'front' ? units - i : i + 1
  )

  return (
    <div
      className={cn('ui-rack-diagram', className)}
      data-size={size}
      data-motion={motionLevel}
      role="img"
      aria-label={`Rack diagram: ${units}U, ${devices.length} devices`}
      {...rest}
    >
      {showUnitNumbers && (
        <div className="ui-rack-diagram__numbers">
          {unitNums.map((u) => (
            <div key={u} className="ui-rack-diagram__number" style={{ blockSize: unitH }}>
              {u}
            </div>
          ))}
        </div>
      )}

      <div className="ui-rack-diagram__frame" style={{ blockSize: units * unitH }}>
        {/* Slot grid lines */}
        {unitNums.map((u, i) => (
          <div key={u} className="ui-rack-diagram__slot" />
        ))}

        {/* Devices positioned absolutely */}
        {devices.map((dev) => {
          const topU = orientation === 'front'
            ? units - dev.startU - dev.heightU + 1
            : dev.startU - 1
          return (
            <div
              key={`${dev.startU}-${dev.label}`}
              className="ui-rack-diagram__device"
              data-status={dev.status ?? 'ok'}
              style={{
                top: topU * unitH + 1,
                blockSize: dev.heightU * unitH - 2,
              }}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect()
                setTooltip({ device: dev, x: rect.right, y: rect.top + rect.height / 2 })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {dev.label}
            </div>
          )
        })}
      </div>

      {tooltip && (
        <div
          className="ui-rack-diagram__tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.device.label} — U{tooltip.device.startU}
          {tooltip.device.heightU > 1 ? `-${tooltip.device.startU + tooltip.device.heightU - 1}` : ''}
          {' '}({tooltip.device.status ?? 'ok'})
        </div>
      )}
    </div>
  )
}

export function RackDiagram(props: RackDiagramProps) {
  return (
    <ComponentErrorBoundary>
      <RackDiagramInner {...props} />
    </ComponentErrorBoundary>
  )
}

RackDiagram.displayName = 'RackDiagram'
