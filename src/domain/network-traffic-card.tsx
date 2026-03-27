'use client'

import {
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TrafficData {
  inbound: number       // bytes per second
  outbound: number      // bytes per second
  timestamp?: number
}

export interface NetworkTrafficCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  vendor?: string
  location?: string
  traffic: TrafficData
  trend?: number[]              // Historical data points for sparkline
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  compact?: boolean             // Compact card mode
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatBitRate(bytesPerSecond: number): string {
  const bps = bytesPerSecond * 8
  if (bps >= 1e12) return `${(bps / 1e12).toFixed(2)} Tbps`
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`
  return `${bps.toFixed(0)} bps`
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const trafficCardStyles = css`
  @layer components {
    @scope (.ui-network-traffic-card) {
      :scope {
        position: relative;
        min-inline-size: 280px;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        container-type: inline-size;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      /* Aurora glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
        position: relative;
        z-index: 1;
      }

      /* Status accent */
      :scope[data-status="ok"] {
        border-inline-start: 3px solid oklch(72% 0.19 155);
      }
      :scope[data-status="warning"] {
        border-inline-start: 3px solid oklch(80% 0.18 85);
      }
      :scope[data-status="critical"] {
        border-inline-start: 3px solid oklch(62% 0.22 25);
      }
      :scope[data-status="unknown"] {
        border-inline-start: 3px solid oklch(60% 0 0);
      }

      /* Header */
      .ui-network-traffic-card__header {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-network-traffic-card__title {
        margin: 0;
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.4;
        flex: 1;
      }

      .ui-network-traffic-card__status {
        flex-shrink: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: oklch(60% 0 0);
      }

      :scope[data-status="ok"] .ui-network-traffic-card__status {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 6px oklch(72% 0.19 155 / 0.5);
      }
      :scope[data-status="warning"] .ui-network-traffic-card__status {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 6px oklch(80% 0.18 85 / 0.5);
      }
      :scope[data-status="critical"] .ui-network-traffic-card__status {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 6px oklch(62% 0.22 25 / 0.5);
        animation: ui-ntc-pulse 1.5s ease-in-out infinite;
      }
      :scope[data-status="unknown"] .ui-network-traffic-card__status {
        background: oklch(60% 0 0);
      }

      @keyframes ui-ntc-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      /* Vendor / location */
      .ui-network-traffic-card__vendor {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      .ui-network-traffic-card__vendor-sep {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Traffic columns */
      .ui-network-traffic-card__traffic {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md, 1rem);
      }

      .ui-network-traffic-card__direction {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
      }

      .ui-network-traffic-card__label {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
      }

      .ui-network-traffic-card__arrow {
        display: inline-flex;
        align-items: center;
      }

      .ui-network-traffic-card__arrow--inbound svg {
        color: oklch(72% 0.19 155);
      }

      .ui-network-traffic-card__arrow--outbound svg {
        color: oklch(65% 0.2 270);
      }

      .ui-network-traffic-card__rate {
        font-size: var(--text-xl, 1.25rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }

      /* Sparkline */
      .ui-network-traffic-card__sparkline {
        margin-block-start: var(--space-2xs, 0.125rem);
      }
      .ui-network-traffic-card__sparkline svg {
        display: block;
        inline-size: 100%;
        block-size: 2rem;
      }

      /* Animated arrow pulse */
      :scope:not([data-motion="0"]) .ui-network-traffic-card__arrow svg {
        animation: ui-ntc-arrow-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-ntc-arrow-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Hover lift */
      @media (hover: hover) {
        :scope:hover:not([data-motion="0"]) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        }
      }

      /* Compact mode */
      :scope[data-compact] {
        padding: var(--space-sm, 0.5rem);
        gap: var(--space-xs, 0.25rem);
      }

      :scope[data-compact] .ui-network-traffic-card__rate {
        font-size: var(--text-base, 1rem);
      }

      :scope[data-compact] .ui-network-traffic-card__sparkline {
        display: none;
      }

      /* Container query: narrow */
      @container (max-width: 250px) {
        .ui-network-traffic-card__traffic {
          grid-template-columns: 1fr;
          gap: var(--space-xs, 0.25rem);
        }
        .ui-network-traffic-card__vendor {
          display: none;
        }
        .ui-network-traffic-card__sparkline {
          display: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before {
          display: none;
        }
        :scope[data-status="ok"],
        :scope[data-status="warning"],
        :scope[data-status="critical"],
        :scope[data-status="unknown"] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-network-traffic-card__status {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
        :scope::before {
          display: none;
        }
      }
    }
  }
`

// ─── Sub-components ─────────────────────────────────────────────────────────

function InboundArrow() {
  return (
    <span className="ui-network-traffic-card__arrow ui-network-traffic-card__arrow--inbound">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2v10M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function OutboundArrow() {
  return (
    <span className="ui-network-traffic-card__arrow ui-network-traffic-card__arrow--outbound">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 12V2M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function TrendSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = 24
  const padding = 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - padding - ((v - min) / range) * (h - padding * 2),
  }))

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`
  }

  const areaD = `${d} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ntc-sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(65% 0.2 270)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(65% 0.2 270)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#ntc-sparkline-fill)" />
      <path d={d} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function NetworkTrafficCardInner({
  title,
  vendor,
  location,
  traffic,
  trend,
  status,
  compact,
  motion: motionProp,
  className,
  ...rest
}: NetworkTrafficCardProps) {
  useStyles('network-traffic-card', trafficCardStyles)
  const motionLevel = useMotionLevel(motionProp)
  const cardRef = useRef<HTMLDivElement>(null)

  useEntrance(
    cardRef,
    motionLevel >= 2 ? 'fade-up' : 'none',
    { duration: 280 }
  )

  const showVendor = vendor || location

  return (
    <div
      ref={cardRef}
      className={cn('ui-network-traffic-card', className)}
      data-motion={motionLevel}
      {...(status && { 'data-status': status })}
      {...(compact && { 'data-compact': '' })}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      <div className="ui-network-traffic-card__header">
        <h3 className="ui-network-traffic-card__title">{title}</h3>
        {status && <span className="ui-network-traffic-card__status" role="status" aria-label={`Status: ${status}`} />}
      </div>

      {showVendor && (
        <div className="ui-network-traffic-card__vendor">
          {vendor && <span>{vendor}</span>}
          {vendor && location && <span className="ui-network-traffic-card__vendor-sep">/</span>}
          {location && <span>{location}</span>}
        </div>
      )}

      <div className="ui-network-traffic-card__traffic">
        <div className="ui-network-traffic-card__direction">
          <span className="ui-network-traffic-card__label">
            <InboundArrow />
            Inbound
          </span>
          <span className="ui-network-traffic-card__rate">
            {formatBitRate(traffic.inbound)}
          </span>
        </div>
        <div className="ui-network-traffic-card__direction">
          <span className="ui-network-traffic-card__label">
            <OutboundArrow />
            Outbound
          </span>
          <span className="ui-network-traffic-card__rate">
            {formatBitRate(traffic.outbound)}
          </span>
        </div>
      </div>

      {trend && trend.length >= 2 && (
        <div className="ui-network-traffic-card__sparkline">
          <TrendSparkline data={trend} />
        </div>
      )}
    </div>
  )
}

export function NetworkTrafficCard(props: NetworkTrafficCardProps) {
  return (
    <ComponentErrorBoundary>
      <NetworkTrafficCardInner {...props} />
    </ComponentErrorBoundary>
  )
}

NetworkTrafficCard.displayName = 'NetworkTrafficCard'
