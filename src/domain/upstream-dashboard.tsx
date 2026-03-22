'use client'

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UpstreamLink {
  id: string
  vendor: string
  location: string
  inbound: number       // bytes per second
  outbound: number      // bytes per second
  capacity?: number     // max capacity in bytes per second
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  trend?: number[]      // historical data points
}

export interface UpstreamDashboardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Array of upstream links — drives the entire dashboard */
  links: UpstreamLink[]
  /** Dashboard title */
  title?: ReactNode
  /** Show aggregated summary card at top */
  showSummary?: boolean
  /** Group links by vendor or location */
  groupBy?: 'vendor' | 'location' | 'none'
  /** Compact mode for smaller screens */
  compact?: boolean
  /** Refresh interval indicator */
  lastUpdated?: number | Date
  /** Motion level */
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatBitRateSplit(bytesPerSecond: number): { value: string; unit: string } {
  const bps = bytesPerSecond * 8
  if (bps >= 1e12) return { value: (bps / 1e12).toFixed(2), unit: 'Tbps' }
  if (bps >= 1e9) return { value: (bps / 1e9).toFixed(2), unit: 'Gbps' }
  if (bps >= 1e6) return { value: (bps / 1e6).toFixed(2), unit: 'Mbps' }
  if (bps >= 1e3) return { value: (bps / 1e3).toFixed(2), unit: 'Kbps' }
  return { value: bps.toFixed(0), unit: 'bps' }
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const upstreamDashboardStyles = css`
  @layer components {
    @scope (.ui-upstream-dashboard) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-md, 1rem);
        container-type: inline-size;
      }

      /* ── Title ────────────────────────────────────────────────── */
      .ui-upstream-dashboard__title {
        margin: 0;
        font-size: clamp(1.25rem, 3vw, 1.75rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.3;
      }

      /* ── Summary Card ─────────────────────────────────────────── */
      .ui-upstream-dashboard__summary {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--space-md, 1rem);
        padding: var(--space-lg, 1.5rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }

      /* Aurora glow on summary */
      .ui-upstream-dashboard__summary::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.06) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.04) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      .ui-upstream-dashboard__summary > * {
        position: relative;
        z-index: 1;
      }

      .ui-upstream-dashboard__summary-title {
        grid-column: 1 / -1;
        margin: 0;
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-wrap: balance;
        line-height: 1.4;
      }

      .ui-upstream-dashboard__metric {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
      }

      .ui-upstream-dashboard__metric-label {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-upstream-dashboard__metric-value {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }

      .ui-upstream-dashboard__metric-unit {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        margin-inline-start: var(--space-2xs, 0.125rem);
      }

      .ui-upstream-dashboard__summary-footer {
        grid-column: 1 / -1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        padding-block-start: var(--space-xs, 0.25rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      .ui-upstream-dashboard__summary-sep {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-upstream-dashboard__summary-updated {
        margin-inline-start: auto;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Arrow Icons ──────────────────────────────────────────── */
      .ui-upstream-dashboard__arrow {
        display: inline-flex;
        align-items: center;
      }

      .ui-upstream-dashboard__arrow--inbound svg {
        color: oklch(72% 0.19 155);
      }

      .ui-upstream-dashboard__arrow--outbound svg {
        color: oklch(65% 0.2 270);
      }

      :scope:not([data-motion="0"]) .ui-upstream-dashboard__arrow svg {
        animation: ui-ud-arrow-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-ud-arrow-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* ── Link Grid ────────────────────────────────────────────── */
      .ui-upstream-dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: var(--space-md, 1rem);
      }

      /* ── Individual Link Card ─────────────────────────────────── */
      .ui-upstream-dashboard__link {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] .ui-upstream-dashboard__link {
        transition: none;
      }

      /* Aurora glow on link cards */
      .ui-upstream-dashboard__link::before {
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

      .ui-upstream-dashboard__link > * {
        position: relative;
        z-index: 1;
      }

      /* Status accent border */
      .ui-upstream-dashboard__link[data-status="ok"] {
        border-inline-start: 3px solid oklch(72% 0.19 155);
      }
      .ui-upstream-dashboard__link[data-status="warning"] {
        border-inline-start: 3px solid oklch(80% 0.18 85);
      }
      .ui-upstream-dashboard__link[data-status="critical"] {
        border-inline-start: 3px solid oklch(62% 0.22 25);
      }
      .ui-upstream-dashboard__link[data-status="unknown"] {
        border-inline-start: 3px solid oklch(60% 0 0);
      }

      /* Hover lift */
      @media (hover: hover) {
        .ui-upstream-dashboard__link:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        }
        :scope[data-motion="0"] .ui-upstream-dashboard__link:hover {
          transform: none;
        }
      }

      .ui-upstream-dashboard__link-header {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-upstream-dashboard__status-dot {
        flex-shrink: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: oklch(60% 0 0);
      }

      .ui-upstream-dashboard__link[data-status="ok"] .ui-upstream-dashboard__status-dot {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 6px oklch(72% 0.19 155 / 0.5);
      }
      .ui-upstream-dashboard__link[data-status="warning"] .ui-upstream-dashboard__status-dot {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 6px oklch(80% 0.18 85 / 0.5);
      }
      .ui-upstream-dashboard__link[data-status="critical"] .ui-upstream-dashboard__status-dot {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 6px oklch(62% 0.22 25 / 0.5);
        animation: ui-ud-pulse 1.5s ease-in-out infinite;
      }

      @keyframes ui-ud-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .ui-upstream-dashboard__link-vendor {
        margin: 0;
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        flex: 1;
        line-height: 1.4;
      }

      .ui-upstream-dashboard__link-location {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      .ui-upstream-dashboard__link-traffic {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md, 1rem);
      }

      .ui-upstream-dashboard__link-direction {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
      }

      .ui-upstream-dashboard__link-label {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
      }

      .ui-upstream-dashboard__link-rate {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }

      .ui-upstream-dashboard__link-unit {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Sparkline */
      .ui-upstream-dashboard__sparkline {
        margin-block-start: var(--space-2xs, 0.125rem);
      }
      .ui-upstream-dashboard__sparkline svg {
        display: block;
        inline-size: 100%;
        block-size: 2rem;
      }

      /* ── Group Headers ────────────────────────────────────────── */
      .ui-upstream-dashboard__group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-upstream-dashboard__group-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-xs, 0.25rem) 0;
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        font: inherit;
        text-align: start;
        inline-size: 100%;
        border-radius: var(--radius-sm, 0.375rem);
        transition: background 0.15s var(--ease-out, ease-out);
      }

      .ui-upstream-dashboard__group-header:hover {
        background: oklch(100% 0 0 / 0.04);
      }

      .ui-upstream-dashboard__group-header:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__group-chevron {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        transition: transform 0.2s var(--ease-out, ease-out);
      }

      .ui-upstream-dashboard__group[data-collapsed] .ui-upstream-dashboard__group-chevron {
        transform: rotate(-90deg);
      }

      .ui-upstream-dashboard__group-title {
        margin: 0;
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.4;
      }

      .ui-upstream-dashboard__group-summary {
        margin-inline-start: auto;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-upstream-dashboard__group-content {
        overflow: hidden;
        transition: max-height 0.3s var(--ease-out, ease-out),
                    opacity 0.2s var(--ease-out, ease-out);
      }

      .ui-upstream-dashboard__group[data-collapsed] .ui-upstream-dashboard__group-content {
        max-height: 0;
        opacity: 0;
        pointer-events: none;
      }

      :scope[data-motion="0"] .ui-upstream-dashboard__group-content,
      :scope[data-motion="0"] .ui-upstream-dashboard__group-chevron {
        transition: none;
      }

      /* ── Empty State ──────────────────────────────────────────── */
      .ui-upstream-dashboard__empty {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl, 2rem);
        font-size: var(--text-base, 1rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-align: center;
      }

      /* ── Compact Mode ─────────────────────────────────────────── */
      :scope[data-compact] .ui-upstream-dashboard__summary {
        padding: var(--space-md, 1rem);
      }

      :scope[data-compact] .ui-upstream-dashboard__metric-value {
        font-size: clamp(1.125rem, 3vw, 1.5rem);
      }

      :scope[data-compact] .ui-upstream-dashboard__link {
        padding: var(--space-sm, 0.5rem);
        gap: var(--space-xs, 0.25rem);
      }

      :scope[data-compact] .ui-upstream-dashboard__link-rate {
        font-size: var(--text-base, 1rem);
      }

      :scope[data-compact] .ui-upstream-dashboard__sparkline {
        display: none;
      }

      /* ── Container Queries ────────────────────────────────────── */

      /* Smartwatch: summary only */
      @container (max-width: 249px) {
        .ui-upstream-dashboard__grid,
        .ui-upstream-dashboard__group {
          display: none;
        }
        .ui-upstream-dashboard__summary {
          grid-template-columns: 1fr;
        }
      }

      /* Phone: single column */
      @container (min-width: 250px) and (max-width: 599px) {
        .ui-upstream-dashboard__grid {
          grid-template-columns: 1fr;
        }
        .ui-upstream-dashboard__summary {
          grid-template-columns: 1fr;
        }
        .ui-upstream-dashboard__metric {
          flex-direction: row;
          align-items: baseline;
          gap: var(--space-sm, 0.5rem);
        }
      }

      /* Tablet: 2 columns */
      @container (min-width: 600px) and (max-width: 1199px) {
        .ui-upstream-dashboard__grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Desktop: 3-4 columns */
      @container (min-width: 1200px) and (max-width: 2999px) {
        .ui-upstream-dashboard__grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
      }

      /* Video wall: 6+ columns with enlarged metrics */
      @container (min-width: 3000px) {
        .ui-upstream-dashboard__grid {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }
        .ui-upstream-dashboard__link-rate {
          font-size: clamp(2rem, 5vw, 3.5rem);
        }
        .ui-upstream-dashboard__metric-value {
          font-size: clamp(2.5rem, 6vw, 4rem);
        }
      }

      /* ── Forced Colors ────────────────────────────────────────── */
      @media (forced-colors: active) {
        .ui-upstream-dashboard__summary,
        .ui-upstream-dashboard__link {
          border: 2px solid ButtonText;
        }
        .ui-upstream-dashboard__summary::before,
        .ui-upstream-dashboard__link::before {
          display: none;
        }
        .ui-upstream-dashboard__link[data-status="ok"],
        .ui-upstream-dashboard__link[data-status="warning"],
        .ui-upstream-dashboard__link[data-status="critical"],
        .ui-upstream-dashboard__link[data-status="unknown"] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-upstream-dashboard__status-dot {
          background: Highlight;
        }
        .ui-upstream-dashboard__group-header {
          border: 1px solid ButtonText;
        }
        .ui-upstream-dashboard__group-header:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ─────────────────────────────────────────────────── */
      @media print {
        .ui-upstream-dashboard__summary,
        .ui-upstream-dashboard__link {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
        .ui-upstream-dashboard__summary::before,
        .ui-upstream-dashboard__link::before {
          display: none;
        }
        .ui-upstream-dashboard__group[data-collapsed] .ui-upstream-dashboard__group-content {
          max-height: none;
          opacity: 1;
          pointer-events: auto;
        }
      }

      /* ── Reduced Motion ────────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .ui-upstream-dashboard__arrow svg,
        .ui-upstream-dashboard__status-dot {
          animation: none;
        }
        .ui-upstream-dashboard__link,
        .ui-upstream-dashboard__group-content,
        .ui-upstream-dashboard__group-chevron {
          transition: none;
        }
      }
    }
  }
`

// ─── Sub-components ─────────────────────────────────────────────────────────

function InboundArrow() {
  return (
    <span className="ui-upstream-dashboard__arrow ui-upstream-dashboard__arrow--inbound">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2v10M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function OutboundArrow() {
  return (
    <span className="ui-upstream-dashboard__arrow ui-upstream-dashboard__arrow--outbound">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 12V2M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendSparkline({ data, id }: { data: number[]; id: string }) {
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
  const gradientId = `ud-sparkline-${id}`

  return (
    <div className="ui-upstream-dashboard__sparkline">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(65% 0.2 270)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(65% 0.2 270)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={d} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

// ─── Summary Card ───────────────────────────────────────────────────────────

function SummaryCard({
  links,
  lastUpdated,
}: {
  links: UpstreamLink[]
  lastUpdated?: number | Date
}) {
  const totalInbound = links.reduce((sum, l) => sum + l.inbound, 0)
  const totalOutbound = links.reduce((sum, l) => sum + l.outbound, 0)
  const totalBytes = totalInbound + totalOutbound

  const inFmt = formatBitRateSplit(totalInbound)
  const outFmt = formatBitRateSplit(totalOutbound)
  const totalFmt = formatBitRateSplit(totalBytes)

  const statusCounts = links.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const updatedTs = lastUpdated
    ? typeof lastUpdated === 'number'
      ? lastUpdated
      : lastUpdated.getTime()
    : null

  return (
    <div className="ui-upstream-dashboard__summary" role="region" aria-label="Upstream Traffic Summary">
      <h3 className="ui-upstream-dashboard__summary-title">Upstream Traffic Summary</h3>

      <div className="ui-upstream-dashboard__metric">
        <span className="ui-upstream-dashboard__metric-label">
          <InboundArrow /> Inbound
        </span>
        <span className="ui-upstream-dashboard__metric-value" data-testid="summary-inbound">
          {inFmt.value}
          <span className="ui-upstream-dashboard__metric-unit">{inFmt.unit}</span>
        </span>
      </div>

      <div className="ui-upstream-dashboard__metric">
        <span className="ui-upstream-dashboard__metric-label">
          <OutboundArrow /> Outbound
        </span>
        <span className="ui-upstream-dashboard__metric-value" data-testid="summary-outbound">
          {outFmt.value}
          <span className="ui-upstream-dashboard__metric-unit">{outFmt.unit}</span>
        </span>
      </div>

      <div className="ui-upstream-dashboard__metric">
        <span className="ui-upstream-dashboard__metric-label">Total</span>
        <span className="ui-upstream-dashboard__metric-value" data-testid="summary-total">
          {totalFmt.value}
          <span className="ui-upstream-dashboard__metric-unit">{totalFmt.unit}</span>
        </span>
      </div>

      <div className="ui-upstream-dashboard__summary-footer">
        <span>{links.length} Links</span>
        {(statusCounts.ok ?? 0) > 0 && (
          <>
            <span className="ui-upstream-dashboard__summary-sep" aria-hidden="true">&bull;</span>
            <span>{statusCounts.ok} Healthy</span>
          </>
        )}
        {(statusCounts.warning ?? 0) > 0 && (
          <>
            <span className="ui-upstream-dashboard__summary-sep" aria-hidden="true">&bull;</span>
            <span>{statusCounts.warning} Warning</span>
          </>
        )}
        {(statusCounts.critical ?? 0) > 0 && (
          <>
            <span className="ui-upstream-dashboard__summary-sep" aria-hidden="true">&bull;</span>
            <span>{statusCounts.critical} Critical</span>
          </>
        )}
        {updatedTs && (
          <span className="ui-upstream-dashboard__summary-updated">
            Last updated: {formatRelativeTime(updatedTs)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Individual Link Card ───────────────────────────────────────────────────

function LinkCard({ link, compact }: { link: UpstreamLink; compact?: boolean }) {
  const inFmt = formatBitRateSplit(link.inbound)
  const outFmt = formatBitRateSplit(link.outbound)

  return (
    <div
      className="ui-upstream-dashboard__link"
      data-status={link.status}
      role="group"
      aria-label={`${link.vendor} ${link.location}`}
    >
      <div className="ui-upstream-dashboard__link-header">
        <span className="ui-upstream-dashboard__status-dot" role="status" aria-label={`Status: ${link.status}`} />
        <h4 className="ui-upstream-dashboard__link-vendor">{link.vendor}</h4>
      </div>

      <span className="ui-upstream-dashboard__link-location">{link.location}</span>

      <div className="ui-upstream-dashboard__link-traffic">
        <div className="ui-upstream-dashboard__link-direction">
          <span className="ui-upstream-dashboard__link-label">
            <InboundArrow /> In
          </span>
          <span className="ui-upstream-dashboard__link-rate">
            {inFmt.value}
            <span className="ui-upstream-dashboard__link-unit"> {inFmt.unit}</span>
          </span>
        </div>
        <div className="ui-upstream-dashboard__link-direction">
          <span className="ui-upstream-dashboard__link-label">
            <OutboundArrow /> Out
          </span>
          <span className="ui-upstream-dashboard__link-rate">
            {outFmt.value}
            <span className="ui-upstream-dashboard__link-unit"> {outFmt.unit}</span>
          </span>
        </div>
      </div>

      {!compact && link.trend && link.trend.length >= 2 && (
        <TrendSparkline data={link.trend} id={link.id} />
      )}
    </div>
  )
}

// ─── Link Group ─────────────────────────────────────────────────────────────

function LinkGroup({
  groupKey,
  links,
  compact,
}: {
  groupKey: string
  links: UpstreamLink[]
  compact?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  const totalIn = links.reduce((s, l) => s + l.inbound, 0)
  const totalOut = links.reduce((s, l) => s + l.outbound, 0)
  const inFmt = formatBitRateSplit(totalIn)
  const outFmt = formatBitRateSplit(totalOut)

  return (
    <section
      className="ui-upstream-dashboard__group"
      {...(collapsed && { 'data-collapsed': '' })}
    >
      <button
        type="button"
        className="ui-upstream-dashboard__group-header"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span className="ui-upstream-dashboard__group-chevron">
          <ChevronDown />
        </span>
        <h3 className="ui-upstream-dashboard__group-title">{groupKey}</h3>
        <span className="ui-upstream-dashboard__group-summary">
          {inFmt.value} {inFmt.unit} in / {outFmt.value} {outFmt.unit} out
        </span>
      </button>

      <div className="ui-upstream-dashboard__group-content">
        <div className="ui-upstream-dashboard__grid">
          {links.map(link => (
            <LinkCard key={link.id} link={link} compact={compact} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function UpstreamDashboardInner({
  links,
  title,
  showSummary = false,
  groupBy = 'none',
  compact = false,
  lastUpdated,
  motion: motionProp,
  className,
  ...rest
}: UpstreamDashboardProps) {
  useStyles('upstream-dashboard', upstreamDashboardStyles)
  const motionLevel = useMotionLevel(motionProp)

  const groups = useMemo(() => {
    if (groupBy === 'none') return null

    const map = new Map<string, UpstreamLink[]>()
    for (const link of links) {
      const key = groupBy === 'vendor' ? link.vendor : link.location
      const arr = map.get(key) || []
      arr.push(link)
      map.set(key, arr)
    }

    return Array.from(map.entries()).map(([key, groupLinks]) => ({
      key,
      links: groupLinks,
    }))
  }, [links, groupBy])

  const isEmpty = links.length === 0

  return (
    <div
      className={cn('ui-upstream-dashboard', className)}
      data-motion={motionLevel}
      {...(compact && { 'data-compact': '' })}
      role="region"
      aria-label={typeof title === 'string' ? title : 'Upstream Dashboard'}
      {...rest}
    >
      {title && (
        <h2 className="ui-upstream-dashboard__title">{title}</h2>
      )}

      {showSummary && !isEmpty && (
        <SummaryCard links={links} lastUpdated={lastUpdated} />
      )}

      {isEmpty && (
        <div className="ui-upstream-dashboard__empty">
          No upstream links configured
        </div>
      )}

      {!isEmpty && groups ? (
        groups.map(g => (
          <LinkGroup key={g.key} groupKey={g.key} links={g.links} compact={compact} />
        ))
      ) : !isEmpty ? (
        <div className="ui-upstream-dashboard__grid">
          {links.map(link => (
            <LinkCard key={link.id} link={link} compact={compact} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function UpstreamDashboard(props: UpstreamDashboardProps) {
  return (
    <ComponentErrorBoundary>
      <UpstreamDashboardInner {...props} />
    </ComponentErrorBoundary>
  )
}

UpstreamDashboard.displayName = 'UpstreamDashboard'
