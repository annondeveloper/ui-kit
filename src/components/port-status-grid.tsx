'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface PortStatus {
  /** Unique port identifier. */
  id: string
  /** Display label (e.g. "Gi1/0/1"). */
  label: string
  /** Port operational status. */
  status: 'up' | 'down' | 'disabled' | 'error'
  /** Link speed display string (e.g. "10G", "1G"). */
  speed?: string
  /** Port utilization 0-100 percentage. */
  utilization?: number
}

export interface PortStatusGridProps {
  /** Array of port status objects. */
  ports: PortStatus[]
  /** Number of columns. Defaults to auto-fit. */
  columns?: number
  /** Dot/rectangle size. */
  size?: 'sm' | 'md'
  /** Callback when a port is clicked. */
  onPortClick?: (port: PortStatus) => void
  className?: string
}

const statusColor: Record<string, string> = {
  up: 'bg-[hsl(var(--status-ok))]',
  down: 'bg-[hsl(var(--status-critical))]',
  disabled: 'bg-[hsl(var(--text-disabled))]',
  error: 'bg-[hsl(var(--status-warning))]',
}

const statusHover: Record<string, string> = {
  up: 'hover:ring-[hsl(var(--status-ok))]/40',
  down: 'hover:ring-[hsl(var(--status-critical))]/40',
  disabled: 'hover:ring-[hsl(var(--text-disabled))]/40',
  error: 'hover:ring-[hsl(var(--status-warning))]/40',
}

const sizeClasses = {
  sm: 'size-3 rounded-[2px]',
  md: 'size-5 rounded-[3px]',
}

/**
 * @description A grid of small colored indicators representing network ports or
 * interfaces. Each port is colored by operational status with hover tooltips showing
 * label, speed, and utilization. Designed for switch/router faceplate visualizations.
 */
export function PortStatusGrid({
  ports,
  columns,
  size = 'sm',
  onPortClick,
  className,
}: PortStatusGridProps) {
  const reduced = useReducedMotion()

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : { gridTemplateColumns: `repeat(auto-fill, minmax(${size === 'sm' ? '12px' : '20px'}, 1fr))` }

  return (
    <div
      className={cn('grid gap-1', className)}
      style={gridStyle}
      role="grid"
      aria-label="Port status grid"
    >
      {ports.map((port, i) => {
        const tooltipParts = [port.label]
        if (port.speed) tooltipParts.push(port.speed)
        if (port.utilization != null) tooltipParts.push(`${port.utilization.toFixed(0)}%`)
        tooltipParts.push(port.status)

        return (
          <motion.button
            key={port.id}
            type="button"
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1, delay: reduced ? 0 : Math.min(i * 0.008, 0.4) }}
            onClick={() => onPortClick?.(port)}
            title={tooltipParts.join(' \u00b7 ')}
            aria-label={`${port.label}: ${port.status}`}
            className={cn(
              'transition-all cursor-pointer ring-0 hover:ring-2',
              sizeClasses[size],
              statusColor[port.status] ?? statusColor.disabled,
              statusHover[port.status] ?? statusHover.disabled,
            )}
          />
        )
      })}
    </div>
  )
}
