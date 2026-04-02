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

export interface NetworkInterface {
  name: string
  status: 'up' | 'down' | 'dormant' | 'unknown'
  speed?: string
  duplex?: 'full' | 'half' | 'unknown'
  mac?: string
  ipv4?: string
  ipv6?: string
  mtu?: number
  txRate?: number
  rxRate?: number
  txErrors?: number
  rxErrors?: number
  type?: 'ethernet' | 'bond' | 'bridge' | 'vlan' | 'loopback' | 'wireless'
}

export interface NetworkInterfaceGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  interfaces: NetworkInterface[]
  columns?: number
  size?: 'sm' | 'md' | 'lg'
  showTraffic?: boolean
  showErrors?: boolean
  onInterfaceClick?: (iface: NetworkInterface) => void
  compact?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB/s`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB/s`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${bytes} B/s`
}

const TYPE_LABELS: Record<string, string> = {
  ethernet: 'ETH',
  bond: 'BOND',
  bridge: 'BR',
  vlan: 'VLAN',
  loopback: 'LO',
  wireless: 'WLAN',
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const gridStyles = css`
  @layer components {
    @scope (.ui-network-interface-grid) {
      :scope {
        container-type: inline-size;
        display: grid;
        inline-size: 100%;
        grid-template-columns: repeat(auto-fit, minmax(var(--nig-min-col, 200px), 1fr));
        gap: var(--nig-gap, 0.75rem);
        font-family: var(--font-mono, ui-monospace, monospace);
      }

      /* Column override when explicit columns set */
      :scope[data-columns] {
        grid-template-columns: repeat(var(--nig-cols), minmax(120px, 1fr));
      }

      /* Size variants */
      :scope[data-size="sm"] {
        --nig-gap: 0.5rem;
        --nig-min-col: 160px;
        --nig-card-pad: 0.5rem 0.625rem;
        --nig-name-size: 0.75rem;
        --nig-detail-size: 0.625rem;
      }

      :scope[data-size="md"] {
        --nig-gap: 0.75rem;
        --nig-min-col: 200px;
        --nig-card-pad: 0.75rem 1rem;
        --nig-name-size: 0.875rem;
        --nig-detail-size: 0.75rem;
      }

      :scope[data-size="lg"] {
        --nig-gap: 1rem;
        --nig-min-col: 240px;
        --nig-card-pad: 1rem 1.25rem;
        --nig-name-size: 1rem;
        --nig-detail-size: 0.8125rem;
      }

      /* Compact mode */
      :scope[data-compact] {
        --nig-min-col: 140px;
        --nig-card-pad: 0.375rem 0.5rem;
        --nig-name-size: 0.75rem;
        --nig-detail-size: 0.625rem;
        --nig-gap: 0.375rem;
      }

      /* ── Card ─────────────────────────────────────── */

      .ui-nig__card {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: var(--nig-card-pad, 0.75rem 1rem);
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-surface, oklch(20% 0.01 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        user-select: none;
      }

      /* Status border accent */
      .ui-nig__card[data-status="up"] {
        border-inline-start: 3px solid oklch(72% 0.19 155);
      }
      .ui-nig__card[data-status="down"] {
        border-inline-start: 3px solid oklch(62% 0.22 25);
      }
      .ui-nig__card[data-status="dormant"] {
        border-inline-start: 3px solid oklch(80% 0.18 85);
      }
      .ui-nig__card[data-status="unknown"] {
        border-inline-start: 3px solid oklch(55% 0 0);
      }

      @media (hover: hover) {
        .ui-nig__card:not([data-motion="0"]):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);
          border-color: var(--border-strong, oklch(100% 0 0 / 0.15));
        }
      }

      /* ── Clickable button ─────────────────────────── */

      .ui-nig__card-btn {
        all: unset;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        cursor: pointer;
        font: inherit;
        color: inherit;
        inline-size: 100%;
      }

      .ui-nig__card-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: inherit;
      }

      /* ── Header row ───────────────────────────────── */

      .ui-nig__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-block-size: 0;
      }

      .ui-nig__led {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ui-nig__led[data-status="up"] {
        background: oklch(72% 0.19 155);
      }
      .ui-nig__led[data-status="down"] {
        background: oklch(62% 0.22 25);
      }
      .ui-nig__led[data-status="dormant"] {
        background: oklch(80% 0.18 85);
      }
      .ui-nig__led[data-status="unknown"] {
        background: oklch(55% 0 0);
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-nig__led[data-status="up"] {
        animation: ui-nig-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-nig-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .ui-nig__name {
        font-size: var(--nig-name-size, 0.875rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-inline-size: 0;
      }

      .ui-nig__type-badge {
        font-size: 0.5625rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.0625rem 0.3125rem;
        border-radius: var(--radius-sm, 0.25rem);
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-tertiary, oklch(55% 0 0));
        flex-shrink: 0;
      }

      /* ── Detail row ───────────────────────────────── */

      .ui-nig__details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem 0.5rem;
        font-size: var(--nig-detail-size, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-nig__speed-badge {
        font-size: var(--nig-detail-size, 0.75rem);
        font-weight: 600;
        color: var(--text-primary, oklch(85% 0 0));
      }

      .ui-nig__duplex {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Traffic ──────────────────────────────────── */

      .ui-nig__traffic {
        display: flex;
        gap: 0.625rem;
        font-size: var(--nig-detail-size, 0.75rem);
        font-variant-numeric: tabular-nums;
      }

      .ui-nig__traffic-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .ui-nig__traffic-arrow {
        font-size: 0.625rem;
        line-height: 1;
      }

      .ui-nig__traffic-arrow--tx {
        color: oklch(72% 0.19 155);
      }

      .ui-nig__traffic-arrow--rx {
        color: oklch(65% 0.18 250);
      }

      .ui-nig__traffic-value {
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* ── Errors ───────────────────────────────────── */

      .ui-nig__errors {
        display: flex;
        gap: 0.5rem;
        font-size: var(--nig-detail-size, 0.75rem);
        font-variant-numeric: tabular-nums;
      }

      .ui-nig__error-item {
        color: oklch(62% 0.22 25);
        font-weight: 600;
      }

      .ui-nig__error-item--zero {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 400;
      }

      /* ── Container queries ────────────────────────── */

      @container (max-width: 400px) {
        :scope {
          --nig-min-col: 100%;
        }
      }

      /* ── Forced colors ────────────────────────────── */

      @media (forced-colors: active) {
        .ui-nig__card {
          forced-color-adjust: none;
          border: 2px solid ButtonText;
        }
        .ui-nig__card[data-status="down"] {
          border-color: LinkText;
        }
        .ui-nig__led {
          forced-color-adjust: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-nig__led { animation: none; }
        .ui-nig__card { transition: none; }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function NetworkInterfaceGridInner({
  interfaces,
  columns,
  size = 'md',
  showTraffic = false,
  showErrors = false,
  onInterfaceClick,
  compact = false,
  motion: motionProp,
  className,
  style,
  ...rest
}: NetworkInterfaceGridProps) {
  useStyles('network-interface-grid', gridStyles)
  const motionLevel = useMotionLevel(motionProp)

  const gridStyle = useMemo(() => {
    const s: Record<string, string> = {}
    if (columns != null) s['--nig-cols'] = String(columns)
    return { ...s, ...style as Record<string, string> }
  }, [columns, style])

  return (
    <div
      className={cn('ui-network-interface-grid', className)}
      data-motion={motionLevel}
      data-size={size}
      {...(compact ? { 'data-compact': '' } : {})}
      {...(columns != null ? { 'data-columns': '' } : {})}
      role="group"
      aria-label="Network interfaces"
      style={gridStyle}
      {...rest}
    >
      {interfaces.map(iface => {
        const hasErrors = (iface.txErrors != null && iface.txErrors > 0) ||
                          (iface.rxErrors != null && iface.rxErrors > 0)

        const cardContent = (
          <>
            {/* Header: LED + name + type badge */}
            <div className="ui-nig__header">
              <span
                className="ui-nig__led"
                data-status={iface.status}
                aria-hidden="true"
              />
              <span className="ui-nig__name">{iface.name}</span>
              {iface.type && (
                <span className="ui-nig__type-badge">
                  {TYPE_LABELS[iface.type] || iface.type}
                </span>
              )}
            </div>

            {/* Speed + duplex */}
            {(iface.speed || iface.duplex) && !compact && (
              <div className="ui-nig__details">
                {iface.speed && (
                  <span className="ui-nig__speed-badge">{iface.speed}</span>
                )}
                {iface.duplex && (
                  <span className="ui-nig__duplex">{iface.duplex}</span>
                )}
              </div>
            )}

            {/* Traffic rates */}
            {showTraffic && (iface.txRate != null || iface.rxRate != null) && (
              <div className="ui-nig__traffic">
                {iface.txRate != null && (
                  <span className="ui-nig__traffic-item">
                    <span className="ui-nig__traffic-arrow ui-nig__traffic-arrow--tx" aria-hidden="true">{'\u2191'}</span>
                    <span className="ui-nig__traffic-value">{formatBytes(iface.txRate)}</span>
                  </span>
                )}
                {iface.rxRate != null && (
                  <span className="ui-nig__traffic-item">
                    <span className="ui-nig__traffic-arrow ui-nig__traffic-arrow--rx" aria-hidden="true">{'\u2193'}</span>
                    <span className="ui-nig__traffic-value">{formatBytes(iface.rxRate)}</span>
                  </span>
                )}
              </div>
            )}

            {/* Error counts */}
            {showErrors && (iface.txErrors != null || iface.rxErrors != null) && (
              <div className="ui-nig__errors">
                {iface.txErrors != null && (
                  <span className={`ui-nig__error-item${iface.txErrors === 0 ? ' ui-nig__error-item--zero' : ''}`}>
                    TX err: {iface.txErrors}
                  </span>
                )}
                {iface.rxErrors != null && (
                  <span className={`ui-nig__error-item${iface.rxErrors === 0 ? ' ui-nig__error-item--zero' : ''}`}>
                    RX err: {iface.rxErrors}
                  </span>
                )}
              </div>
            )}
          </>
        )

        return (
          <div
            key={iface.name}
            className="ui-nig__card"
            data-status={iface.status}
            data-motion={motionLevel}
          >
            {onInterfaceClick ? (
              <button
                className="ui-nig__card-btn"
                onClick={() => onInterfaceClick(iface)}
                aria-label={`${iface.name}: ${iface.status}${iface.speed ? `, ${iface.speed}` : ''}${iface.type ? `, ${iface.type}` : ''}`}
              >
                {cardContent}
              </button>
            ) : (
              cardContent
            )}
          </div>
        )
      })}
    </div>
  )
}

export function NetworkInterfaceGrid(props: NetworkInterfaceGridProps) {
  return (
    <ComponentErrorBoundary>
      <NetworkInterfaceGridInner {...props} />
    </ComponentErrorBoundary>
  )
}

NetworkInterfaceGrid.displayName = 'NetworkInterfaceGrid'
