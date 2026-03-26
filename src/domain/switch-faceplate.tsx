'use client'

import {
  type HTMLAttributes,
  useState,
  useMemo,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SwitchPort {
  id: number
  label?: string
  status: 'up' | 'down' | 'admin-down' | 'unused'
  speed?: string
  type?: 'ethernet' | 'sfp' | 'qsfp' | 'management'
  vlan?: number
}

export interface SwitchFaceplateProps extends HTMLAttributes<HTMLDivElement> {
  ports: SwitchPort[]
  rows?: number
  label?: string
  showLabels?: boolean
  onPortClick?: (port: SwitchPort) => void
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const faceplateStyles = css`
  @layer components {
    @scope (.ui-switch-faceplate) {
      :scope {
        position: relative;
        display: inline-block;
        background: var(--bg-surface, oklch(20% 0.01 270));
        border: 1px solid oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-md, 0.5rem);
        padding: 0.75rem;
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      .ui-switch-faceplate__header {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        margin-block-end: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ui-switch-faceplate__grid {
        display: grid;
        gap: var(--port-gap, 0.25rem);
      }

      .ui-switch-faceplate__row {
        display: flex;
        gap: var(--port-gap, 0.25rem);
      }

      .ui-switch-faceplate__port {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm, 0.375rem);
        font-variant-numeric: tabular-nums;
        user-select: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      /* Size variants */
      :scope[data-size="sm"] .ui-switch-faceplate__port {
        inline-size: 1.5rem;
        block-size: 1.5rem;
        font-size: 0.5rem;
      }
      :scope[data-size="sm"] { --port-gap: 0.125rem; }

      :scope[data-size="md"] .ui-switch-faceplate__port {
        inline-size: 2rem;
        block-size: 2rem;
        font-size: 0.625rem;
      }
      :scope[data-size="md"] { --port-gap: 0.25rem; }

      :scope[data-size="lg"] .ui-switch-faceplate__port {
        inline-size: 2.5rem;
        block-size: 2.5rem;
        font-size: 0.75rem;
      }
      :scope[data-size="lg"] { --port-gap: 0.375rem; }

      /* Port type shapes */
      .ui-switch-faceplate__port[data-type="sfp"],
      .ui-switch-faceplate__port[data-type="qsfp"] {
        border-radius: 0.125rem;
      }

      .ui-switch-faceplate__port[data-type="management"] {
        border-radius: 50%;
      }

      /* Status colors */
      .ui-switch-faceplate__port[data-status="up"] {
        background: oklch(72% 0.19 155 / 0.2);
        border: 1px solid oklch(72% 0.19 155 / 0.5);
        color: oklch(85% 0.12 155);
      }

      .ui-switch-faceplate__port[data-status="down"] {
        background: oklch(62% 0.22 25 / 0.2);
        border: 1px solid oklch(62% 0.22 25 / 0.5);
        color: oklch(80% 0.12 25);
      }

      .ui-switch-faceplate__port[data-status="admin-down"] {
        background: oklch(80% 0.18 85 / 0.15);
        border: 1px solid oklch(80% 0.18 85 / 0.4);
        color: oklch(85% 0.12 85);
      }

      .ui-switch-faceplate__port[data-status="unused"] {
        background: oklch(100% 0 0 / 0.04);
        border: 1px solid oklch(100% 0 0 / 0.08);
        color: var(--text-tertiary, oklch(45% 0 0));
      }

      /* QSFP wider */
      .ui-switch-faceplate__port[data-type="qsfp"] {
        inline-size: calc(var(--port-gap, 0.25rem) + 4rem);
      }
      :scope[data-size="sm"] .ui-switch-faceplate__port[data-type="qsfp"] {
        inline-size: calc(var(--port-gap, 0.125rem) + 3rem);
      }

      /* Clickable */
      .ui-switch-faceplate__port-btn {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        cursor: pointer;
        font: inherit;
        color: inherit;
      }

      .ui-switch-faceplate__port-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: inherit;
      }

      @media (hover: hover) {
        .ui-switch-faceplate__port:hover:not([data-motion="0"]) {
          transform: scale(1.15);
          z-index: 1;
        }
      }

      /* Tooltip */
      .ui-switch-faceplate__tooltip {
        position: absolute;
        inset-block-end: calc(100% + 6px);
        inset-inline-start: 50%;
        transform: translateX(-50%);
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
      }

      .ui-switch-faceplate__tooltip-speed {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
      }

      /* Port label */
      .ui-switch-faceplate__port-label {
        font-size: 0.5rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-block-start: 0.125rem;
        text-align: center;
        max-inline-size: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Activity LED for up ports */
      .ui-switch-faceplate__led {
        position: absolute;
        inset-block-start: 0.125rem;
        inset-inline-end: 0.125rem;
        inline-size: 0.25rem;
        block-size: 0.25rem;
        border-radius: 50%;
        background: oklch(72% 0.19 155);
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-switch-faceplate__led {
        animation: ui-sfp-blink 1.5s ease-in-out infinite;
      }

      @keyframes ui-sfp-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-switch-faceplate__port {
          forced-color-adjust: none;
          border: 2px solid ButtonText;
        }
        .ui-switch-faceplate__port[data-status="down"] {
          border-color: LinkText;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-switch-faceplate__led { animation: none; }
        .ui-switch-faceplate__port { transition: none; }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function SwitchFaceplateInner({
  ports,
  rows = 2,
  label,
  showLabels = false,
  onPortClick,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: SwitchFaceplateProps) {
  useStyles('switch-faceplate', faceplateStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredPort, setHoveredPort] = useState<number | null>(null)

  // Split ports into rows — top row gets even indices (ports 1,3,5... on top), bottom gets odd
  const portRows = useMemo(() => {
    const result: SwitchPort[][] = Array.from({ length: rows }, () => [])
    ports.forEach((port, idx) => {
      result[idx % rows].push(port)
    })
    return result
  }, [ports, rows])

  return (
    <div
      className={cn('ui-switch-faceplate', className)}
      data-motion={motionLevel}
      data-size={size}
      role="group"
      aria-label={label ? `Switch: ${label}` : 'Network switch faceplate'}
      {...rest}
    >
      {label && (
        <div className="ui-switch-faceplate__header">{label}</div>
      )}

      <div className="ui-switch-faceplate__grid">
        {portRows.map((rowPorts, rowIdx) => (
          <div key={rowIdx} className="ui-switch-faceplate__row">
            {rowPorts.map(port => (
              <div
                key={port.id}
                className="ui-switch-faceplate__port"
                data-status={port.status}
                data-type={port.type || 'ethernet'}
                onMouseEnter={() => setHoveredPort(port.id)}
                onMouseLeave={() => setHoveredPort(null)}
              >
                {/* Activity LED for up ports */}
                {port.status === 'up' && (
                  <span className="ui-switch-faceplate__led" aria-hidden="true" />
                )}

                {onPortClick ? (
                  <button
                    className="ui-switch-faceplate__port-btn"
                    onClick={() => onPortClick(port)}
                    aria-label={`Port ${port.id}${port.label ? ` (${port.label})` : ''}: ${port.status}${port.speed ? `, ${port.speed}` : ''}`}
                  >
                    {port.id}
                  </button>
                ) : (
                  port.id
                )}

                {/* Tooltip on hover */}
                {hoveredPort === port.id && (
                  <div className="ui-switch-faceplate__tooltip">
                    <div>Port {port.id}{port.label ? ` — ${port.label}` : ''}</div>
                    <div>{port.status}{port.vlan != null ? ` | VLAN ${port.vlan}` : ''}</div>
                    {port.speed && (
                      <div className="ui-switch-faceplate__tooltip-speed">
                        {port.speed} {port.type || 'ethernet'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Port labels below grid */}
      {showLabels && (
        <div className="ui-switch-faceplate__row" style={{ marginBlockStart: '0.125rem' }}>
          {ports.slice(0, Math.ceil(ports.length / rows)).map(port => (
            port.label ? (
              <div key={port.id} className="ui-switch-faceplate__port-label">
                {port.label}
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}

export function SwitchFaceplate(props: SwitchFaceplateProps) {
  return (
    <ComponentErrorBoundary>
      <SwitchFaceplateInner {...props} />
    </ComponentErrorBoundary>
  )
}

SwitchFaceplate.displayName = 'SwitchFaceplate'
