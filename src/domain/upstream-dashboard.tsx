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
  burstCapacity?: number // burstable capacity in bytes per second
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  trend?: number[]      // historical data points
}

export interface UpstreamDashboardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Array of upstream links — drives the entire dashboard */
  links: UpstreamLink[]
  /** Dashboard title */
  title?: ReactNode
  /** Visualization mode */
  mode?: 'hero' | 'compact' | 'table'
  /** Show aggregated summary at top */
  showSummary?: boolean
  /** Group links */
  groupBy?: 'vendor' | 'location' | 'none'
  /** Last updated timestamp */
  lastUpdated?: number | Date
  /** Motion level */
  motion?: 0 | 1 | 2 | 3
  /** Show capacity info */
  showCapacity?: boolean
  /** Show burstable capacity */
  showBurstCapacity?: boolean
  /** Show utilization percentage */
  showUtilization?: boolean
  /** How to display utilization: 'bar' (default), 'meter' (arc gauge), 'ambient' (bg color shift) */
  utilizationDisplay?: 'bar' | 'meter' | 'ambient'
  /** Called when a link card is clicked */
  onLinkClick?: (link: UpstreamLink) => void
  /** Called when a group header is clicked */
  onGroupClick?: (groupName: string, links: UpstreamLink[]) => void
  /** Called when the summary/hero area is clicked */
  onSummaryClick?: () => void
  /** @deprecated Use mode='compact' instead */
  compact?: boolean
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

function computeUtilization(links: UpstreamLink[]): number | null {
  const totalTraffic = links.reduce((s, l) => s + l.inbound + l.outbound, 0)
  const totalCapacity = links.reduce((s, l) => s + (l.capacity ?? 0), 0)
  if (totalCapacity <= 0) return null
  return Math.min(100, Math.round((totalTraffic / totalCapacity) * 100))
}

function formatTraffic(bytesPerSecond: number): string {
  const fmt = formatBitRateSplit(bytesPerSecond)
  return `${fmt.value} ${fmt.unit}`
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
        container-name: upstream;
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

      /* ═══════════════════════════════════════════════════════════
         HERO MODE — the metric IS the card
         ═══════════════════════════════════════════════════════════ */

      .ui-upstream-dashboard__hero-card {
        position: relative;
        padding: clamp(1.5rem, 4vw, 3rem);
        background: var(--bg-elevated, oklch(20% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-lg, 0.75rem);
        overflow: visible;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.75rem;
      }

      /* Aurora glow on hero */
      .ui-upstream-dashboard__hero-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 30% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.06) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 70% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.04) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      .ui-upstream-dashboard__hero-card > * {
        position: relative;
        z-index: 1;
      }

      /* Trendline background — fills entire hero card */
      .ui-upstream-dashboard__hero-trendline {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        border-radius: inherit;
      }

      .ui-upstream-dashboard__hero-trendline svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Massive metrics row — side by side on desktop */
      .ui-upstream-dashboard__hero-metrics {
        display: flex;
        justify-content: center;
        align-items: baseline;
        gap: clamp(2rem, 6vw, 6rem);
        flex-wrap: wrap;
        position: relative;
        z-index: 1;
      }

      @container (min-width: 500px) {
        .ui-upstream-dashboard__hero-metrics {
          flex-wrap: nowrap;
        }
      }

      .ui-upstream-dashboard__hero-metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
      }

      .ui-upstream-dashboard__hero-value {
        font-size: clamp(1.5rem, 6cqw, 5rem);
        font-weight: 900;
        letter-spacing: -0.04em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
        display: flex;
        align-items: baseline;
      }

      .ui-upstream-dashboard__hero-direction {
        font-size: 0.5em;
        margin-inline-end: 0.25em;
      }

      .ui-upstream-dashboard__hero-direction--in { color: oklch(72% 0.19 155); }
      .ui-upstream-dashboard__hero-direction--out { color: oklch(65% 0.2 270); }

      .ui-upstream-dashboard__hero-unit {
        font-size: 0.35em;
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: 0.125em;
      }

      .ui-upstream-dashboard__hero-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* ── Table top metrics (smaller hero-style) ─────────────── */
      .ui-upstream-dashboard__table-top-metrics {
        display: flex;
        justify-content: center;
        align-items: baseline;
        gap: clamp(1.5rem, 4vw, 4rem);
        flex-wrap: wrap;
        padding: clamp(1rem, 3vw, 2rem);
        background: var(--bg-elevated, oklch(20% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-lg, 0.75rem);
        position: relative;
        overflow: hidden;
      }

      .ui-upstream-dashboard__table-top-metrics::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 30% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        );
        pointer-events: none;
      }

      .ui-upstream-dashboard__table-top-metrics > * {
        position: relative;
        z-index: 1;
      }

      .ui-upstream-dashboard__table-top-value {
        font-size: clamp(1.5rem, 5vw, 3rem);
        font-weight: 900;
        letter-spacing: -0.04em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
        display: flex;
        align-items: baseline;
      }

      .ui-upstream-dashboard__table-top-unit {
        font-size: 0.35em;
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: 0.125em;
      }

      .ui-upstream-dashboard__table-top-direction {
        font-size: 0.5em;
        margin-inline-end: 0.25em;
      }

      .ui-upstream-dashboard__table-top-direction--in { color: oklch(72% 0.19 155); }
      .ui-upstream-dashboard__table-top-direction--out { color: oklch(65% 0.2 270); }

      .ui-upstream-dashboard__table-top-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* ── Utilization Bar (with burst markers) ──────────────────── */
      .ui-upstream-dashboard__util-bar {
        position: relative;
        z-index: 1;
        height: 4px;
        border-radius: 2px;
        background: var(--bg-base, oklch(100% 0 0 / 0.06));
        overflow: visible;
      }

      .ui-upstream-dashboard__util-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ui-upstream-dashboard__util-fill[data-level="ok"] {
        background: oklch(72% 0.19 155);
      }
      .ui-upstream-dashboard__util-fill[data-level="warning"] {
        background: oklch(80% 0.18 85);
      }
      .ui-upstream-dashboard__util-fill[data-level="critical"] {
        background: oklch(62% 0.22 25);
      }

      .ui-upstream-dashboard__util-burst-marker {
        position: absolute;
        top: -2px;
        width: 2px;
        height: 8px;
        background: var(--text-tertiary, oklch(55% 0 0));
        border-radius: 1px;
      }

      .ui-upstream-dashboard__util-label {
        position: absolute;
        right: 0;
        top: -14px;
        font-size: 0.625rem;
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Hero footer — total / capacity / pct */
      .ui-upstream-dashboard__hero-footer {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        position: relative;
        z-index: 1;
      }

      .ui-upstream-dashboard__hero-footer-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      /* ── Mini Card ─────────────────────────────────────────── */
      .ui-upstream-dashboard__mini-card {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-upstream-dashboard__mini-card[data-status="ok"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      .ui-upstream-dashboard__mini-card[data-status="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      .ui-upstream-dashboard__mini-card[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      .ui-upstream-dashboard__mini-card[data-status="unknown"] { border-inline-start: 3px solid oklch(60% 0 0); }

      .ui-upstream-dashboard__mini-card-header {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ui-upstream-dashboard__mini-card-status {
        flex-shrink: 0;
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-radius: 50%;
        background: oklch(60% 0 0);
      }

      .ui-upstream-dashboard__mini-card[data-status="ok"] .ui-upstream-dashboard__mini-card-status {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 4px oklch(72% 0.19 155 / 0.5);
      }
      .ui-upstream-dashboard__mini-card[data-status="warning"] .ui-upstream-dashboard__mini-card-status {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 4px oklch(80% 0.18 85 / 0.5);
      }
      .ui-upstream-dashboard__mini-card[data-status="critical"] .ui-upstream-dashboard__mini-card-status {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 4px oklch(62% 0.22 25 / 0.5);
        animation: ui-ud-pulse 1.5s ease-in-out infinite;
      }

      .ui-upstream-dashboard__mini-card-label {
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--text-xs, 0.75rem);
      }

      .ui-upstream-dashboard__mini-card-metrics {
        display: flex;
        gap: 0.75rem;
        align-items: baseline;
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-upstream-dashboard__mini-card-metrics small {
        font-weight: 400;
        font-size: 0.75em;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: 0.1em;
      }

      .ui-upstream-dashboard__mini-card-capacity {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Group Card (nested grouping in hero mode) ─────────── */
      .ui-upstream-dashboard__group-card {
        background: var(--bg-elevated, oklch(20% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-lg, 0.75rem);
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ui-upstream-dashboard__group-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ui-upstream-dashboard__group-card-name {
        font-weight: 700;
        font-size: var(--text-base, 1rem);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-upstream-dashboard__group-card-metrics {
        display: flex;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .ui-upstream-dashboard__group-card-cap {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-upstream-dashboard__group-card-util {
        margin-inline-start: auto;
        min-inline-size: 80px;
      }

      .ui-upstream-dashboard__group-card-children {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.5rem;
      }

      /* Mini cards below hero (flat layout) */
      .ui-upstream-dashboard__hero-mini-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
        margin-block-start: 0.5rem;
      }

      /* Hero group cards grid */
      .ui-upstream-dashboard__hero-groups-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-block-start: 0.5rem;
      }

      /* Legacy hero mini (kept for backwards compat, but now we use MiniCard) */
      .ui-upstream-dashboard__hero-mini {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
        overflow: hidden;
      }

      .ui-upstream-dashboard__hero-mini-dot {
        flex-shrink: 0;
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-radius: 50%;
        background: oklch(60% 0 0);
      }

      .ui-upstream-dashboard__hero-mini[data-status="ok"] .ui-upstream-dashboard__hero-mini-dot {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 4px oklch(72% 0.19 155 / 0.5);
      }
      .ui-upstream-dashboard__hero-mini[data-status="warning"] .ui-upstream-dashboard__hero-mini-dot {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 4px oklch(80% 0.18 85 / 0.5);
      }
      .ui-upstream-dashboard__hero-mini[data-status="critical"] .ui-upstream-dashboard__hero-mini-dot {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 4px oklch(62% 0.22 25 / 0.5);
        animation: ui-ud-pulse 1.5s ease-in-out infinite;
      }

      .ui-upstream-dashboard__hero-mini-vendor {
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ui-upstream-dashboard__hero-mini-traffic {
        margin-inline-start: auto;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
      }

      /* ═══════════════════════════════════════════════════════════
         COMPACT MODE — dense grid of small cards
         ═══════════════════════════════════════════════════════════ */

      .ui-upstream-dashboard__compact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.75rem;
        container-type: inline-size;
      }

      @container (max-width: 300px) {
        .ui-upstream-dashboard__compact-grid { grid-template-columns: 1fr; }
      }

      @container (min-width: 3000px) {
        .ui-upstream-dashboard__compact-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
      }

      .ui-upstream-dashboard__compact-card {
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        padding: 0.75rem 1rem;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
      }

      :scope[data-motion="0"] .ui-upstream-dashboard__compact-card {
        transition: none;
      }

      @media (hover: hover) {
        .ui-upstream-dashboard__compact-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);
        }
        :scope[data-motion="0"] .ui-upstream-dashboard__compact-card:hover {
          transform: none;
        }
      }

      /* Status-colored left border */
      .ui-upstream-dashboard__compact-card[data-status="ok"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      .ui-upstream-dashboard__compact-card[data-status="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      .ui-upstream-dashboard__compact-card[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      .ui-upstream-dashboard__compact-card[data-status="unknown"] { border-inline-start: 3px solid oklch(60% 0 0); }

      .ui-upstream-dashboard__compact-header {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-upstream-dashboard__compact-dot {
        flex-shrink: 0;
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-radius: 50%;
      }

      .ui-upstream-dashboard__compact-card[data-status="ok"] .ui-upstream-dashboard__compact-dot {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 4px oklch(72% 0.19 155 / 0.5);
      }
      .ui-upstream-dashboard__compact-card[data-status="warning"] .ui-upstream-dashboard__compact-dot {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 4px oklch(80% 0.18 85 / 0.5);
      }
      .ui-upstream-dashboard__compact-card[data-status="critical"] .ui-upstream-dashboard__compact-dot {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 4px oklch(62% 0.22 25 / 0.5);
        animation: ui-ud-pulse 1.5s ease-in-out infinite;
      }
      .ui-upstream-dashboard__compact-card[data-status="unknown"] .ui-upstream-dashboard__compact-dot {
        background: oklch(60% 0 0);
      }

      .ui-upstream-dashboard__compact-metrics {
        display: flex;
        gap: 1rem;
        align-items: baseline;
      }

      .ui-upstream-dashboard__compact-value {
        font-size: clamp(1.125rem, 3vw, 1.5rem);
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em;
        color: var(--text-primary, oklch(90% 0 0));
        display: flex;
        align-items: baseline;
      }

      .ui-upstream-dashboard__compact-value-unit {
        font-size: 0.55em;
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: 0.2em;
      }

      .ui-upstream-dashboard__compact-direction {
        font-size: 0.7em;
        margin-inline-end: 0.15em;
      }

      .ui-upstream-dashboard__compact-direction--in { color: oklch(72% 0.19 155); }
      .ui-upstream-dashboard__compact-direction--out { color: oklch(65% 0.2 270); }

      /* Compact footer: mini trendline + util bar */
      .ui-upstream-dashboard__compact-footer {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6875rem;
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-upstream-dashboard__compact-sparkline svg {
        display: block;
        width: 60px;
        height: 16px;
      }

      .ui-upstream-dashboard__compact-util {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex: 1;
      }

      .ui-upstream-dashboard__compact-util-bar {
        flex: 1;
        height: 2px;
        border-radius: 1px;
        background: oklch(100% 0 0 / 0.06);
        overflow: hidden;
      }

      .ui-upstream-dashboard__compact-util-fill {
        height: 100%;
        border-radius: 1px;
      }

      /* ═══════════════════════════════════════════════════════════
         TABLE MODE — ultra-dense tabular format
         ═══════════════════════════════════════════════════════════ */

      .ui-upstream-dashboard__table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-upstream-dashboard__table thead th {
        padding: 0.5rem 0.75rem;
        text-align: start;
        font-weight: 600;
        font-size: var(--text-xs, 0.75rem);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-tertiary, oklch(55% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        white-space: nowrap;
      }

      .ui-upstream-dashboard__table tbody tr {
        transition: background 0.12s ease-out;
      }

      @media (hover: hover) {
        .ui-upstream-dashboard__table tbody tr:hover {
          background: oklch(100% 0 0 / 0.03);
        }
      }

      .ui-upstream-dashboard__table td {
        padding: 0.5rem 0.75rem;
        border-block-end: 1px solid oklch(100% 0 0 / 0.04);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        vertical-align: middle;
      }

      .ui-upstream-dashboard__table-rate {
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-upstream-dashboard__table-rate-unit {
        font-weight: 400;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: 0.25em;
      }

      .ui-upstream-dashboard__table-util {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ui-upstream-dashboard__table-util-bar {
        width: 60px;
        height: 3px;
        border-radius: 2px;
        background: oklch(100% 0 0 / 0.06);
        overflow: hidden;
      }

      .ui-upstream-dashboard__table-util-fill {
        height: 100%;
        border-radius: 2px;
      }

      .ui-upstream-dashboard__table-sparkline svg {
        display: block;
        width: 60px;
        height: 20px;
      }

      .ui-upstream-dashboard__table-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .ui-upstream-dashboard__table-status-dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
      }

      .ui-upstream-dashboard__table-status-dot[data-status="ok"] {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 4px oklch(72% 0.19 155 / 0.5);
      }
      .ui-upstream-dashboard__table-status-dot[data-status="warning"] {
        background: oklch(80% 0.18 85);
        box-shadow: 0 0 4px oklch(80% 0.18 85 / 0.5);
      }
      .ui-upstream-dashboard__table-status-dot[data-status="critical"] {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 4px oklch(62% 0.22 25 / 0.5);
        animation: ui-ud-pulse 1.5s ease-in-out infinite;
      }
      .ui-upstream-dashboard__table-status-dot[data-status="unknown"] {
        background: oklch(60% 0 0);
      }

      /* ═══════════════════════════════════════════════════════════
         LEGACY — link grid (used when mode not specified and
         no compact prop, for backwards compatibility)
         ═══════════════════════════════════════════════════════════ */

      .ui-upstream-dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: var(--space-md, 1rem);
      }

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
        transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
      }

      :scope[data-motion="0"] .ui-upstream-dashboard__link {
        transition: none;
      }

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

      .ui-upstream-dashboard__link[data-status="ok"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      .ui-upstream-dashboard__link[data-status="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      .ui-upstream-dashboard__link[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      .ui-upstream-dashboard__link[data-status="unknown"] { border-inline-start: 3px solid oklch(60% 0 0); }

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
        transition: background 0.15s ease-out;
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
        transition: transform 0.2s ease-out;
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
        transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
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

      /* ── Compact legacy ───────────────────────────────────────── */
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

      /* ── Clickable Interactions ─────────────────────────────── */
      .ui-upstream-dashboard__mini-card[data-clickable] {
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
      }
      .ui-upstream-dashboard__mini-card[data-clickable]:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }
      .ui-upstream-dashboard__mini-card[data-clickable]:active {
        transform: scale(0.98);
      }
      .ui-upstream-dashboard__mini-card[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__hero-card[data-clickable] {
        cursor: pointer;
        transition: box-shadow 0.15s, border-color 0.15s;
      }
      .ui-upstream-dashboard__hero-card[data-clickable]:hover {
        box-shadow: 0 6px 20px oklch(0% 0 0 / 0.25);
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }
      .ui-upstream-dashboard__hero-card[data-clickable]:active {
        transform: scale(0.99);
      }
      .ui-upstream-dashboard__hero-card[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__group-card-header[data-clickable] {
        cursor: pointer;
        border-radius: var(--radius-sm, 0.375rem);
        padding: 0.25rem 0.375rem;
        margin: -0.25rem -0.375rem;
        transition: background 0.15s;
      }
      .ui-upstream-dashboard__group-card-header[data-clickable]:hover {
        background: oklch(100% 0 0 / 0.04);
      }
      .ui-upstream-dashboard__group-card-header[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__table tbody tr[data-clickable] {
        cursor: pointer;
      }
      .ui-upstream-dashboard__table tbody tr[data-clickable]:hover {
        background: oklch(100% 0 0 / 0.06);
      }
      .ui-upstream-dashboard__table tbody tr[data-clickable]:active {
        background: oklch(100% 0 0 / 0.08);
      }

      .ui-upstream-dashboard__summary[data-clickable],
      .ui-upstream-dashboard__table-top-metrics[data-clickable] {
        cursor: pointer;
        transition: box-shadow 0.15s, border-color 0.15s;
      }
      .ui-upstream-dashboard__summary[data-clickable]:hover,
      .ui-upstream-dashboard__table-top-metrics[data-clickable]:hover {
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }
      .ui-upstream-dashboard__summary[data-clickable]:focus-visible,
      .ui-upstream-dashboard__table-top-metrics[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__compact-card[data-clickable] {
        cursor: pointer;
      }
      .ui-upstream-dashboard__compact-card[data-clickable]:active {
        transform: scale(0.98);
      }
      .ui-upstream-dashboard__compact-card[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-upstream-dashboard__link[data-clickable] {
        cursor: pointer;
      }
      .ui-upstream-dashboard__link[data-clickable]:active {
        transform: scale(0.98);
      }
      .ui-upstream-dashboard__link[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      :scope[data-motion="0"] [data-clickable] {
        transition: none !important;
      }

      @media (prefers-reduced-motion: reduce) {
        [data-clickable] {
          transition: none !important;
        }
        [data-clickable]:hover {
          transform: none !important;
        }
        [data-clickable]:active {
          transform: none !important;
        }
      }

      /* ── Container Queries ────────────────────────────────────── */

      /* Smartwatch: <250px */
      @container upstream (max-width: 249px) {
        .ui-upstream-dashboard__grid,
        .ui-upstream-dashboard__group { display: none; }
        .ui-upstream-dashboard__summary { grid-template-columns: 1fr; }

        .ui-upstream-dashboard__hero-metrics {
          flex-direction: column;
          gap: 0.5rem;
        }
        .ui-upstream-dashboard__hero-value {
          font-size: 1.5rem;
        }
        .ui-upstream-dashboard__hero-footer { display: none; }
        .ui-upstream-dashboard__hero-mini-grid { display: none; }
        .ui-upstream-dashboard__hero-groups-grid { display: none; }
        .ui-upstream-dashboard__table-top-value {
          font-size: 1.25rem;
        }
      }

      /* Phone: 250-599px */
      @container upstream (min-width: 250px) and (max-width: 599px) {
        .ui-upstream-dashboard__grid { grid-template-columns: 1fr; }
        .ui-upstream-dashboard__summary { grid-template-columns: 1fr; }
        .ui-upstream-dashboard__metric {
          flex-direction: row;
          align-items: baseline;
          gap: var(--space-sm, 0.5rem);
        }
        .ui-upstream-dashboard__hero-value {
          font-size: clamp(1.5rem, 8cqw, 2.5rem);
        }
        .ui-upstream-dashboard__hero-unit {
          font-size: 0.4em;
        }
        .ui-upstream-dashboard__hero-mini-grid {
          grid-template-columns: 1fr;
        }
        .ui-upstream-dashboard__group-card-children {
          grid-template-columns: 1fr;
        }
        .ui-upstream-dashboard__table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ui-upstream-dashboard__table {
          min-width: 600px;
        }
      }

      /* Tablet: 600-1199px */
      @container upstream (min-width: 600px) and (max-width: 1199px) {
        .ui-upstream-dashboard__grid { grid-template-columns: repeat(2, 1fr); }
        .ui-upstream-dashboard__hero-value {
          font-size: clamp(2rem, 5cqw, 3.5rem);
        }
        .ui-upstream-dashboard__hero-mini-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
      }

      /* Desktop: 1200-2999px */
      @container upstream (min-width: 1200px) and (max-width: 2999px) {
        .ui-upstream-dashboard__grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .ui-upstream-dashboard__hero-value {
          font-size: clamp(3rem, 4cqw, 5rem);
        }
        .ui-upstream-dashboard__hero-mini-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
      }

      /* Video wall: 3000px+ */
      @container upstream (min-width: 3000px) {
        .ui-upstream-dashboard__grid { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
        .ui-upstream-dashboard__link-rate { font-size: clamp(2rem, 5vw, 3.5rem); }
        .ui-upstream-dashboard__metric-value { font-size: clamp(2.5rem, 6vw, 4rem); }
        .ui-upstream-dashboard__hero-value {
          font-size: clamp(5rem, 3cqw, 8rem);
        }
        .ui-upstream-dashboard__hero-unit {
          font-size: 0.3em;
        }
        .ui-upstream-dashboard__hero-card {
          padding: 4rem;
          min-height: 400px;
        }
        .ui-upstream-dashboard__hero-mini-grid {
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .ui-upstream-dashboard__mini-card {
          padding: 1.5rem;
          font-size: 1.25rem;
        }
        .ui-upstream-dashboard__mini-card-metrics .ui-upstream-dashboard__compact-value {
          font-size: 2rem;
        }
        .ui-upstream-dashboard__hero-footer {
          font-size: 1.25rem;
        }
        .ui-upstream-dashboard__group-card {
          padding: 2rem;
        }
        .ui-upstream-dashboard__table th,
        .ui-upstream-dashboard__table td {
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
        }
        .ui-upstream-dashboard__table-top-value {
          font-size: clamp(3rem, 3cqw, 5rem);
        }
      }

      /* ── Forced Colors ────────────────────────────────────────── */
      @media (forced-colors: active) {
        .ui-upstream-dashboard__summary,
        .ui-upstream-dashboard__link,
        .ui-upstream-dashboard__compact-card,
        .ui-upstream-dashboard__hero-card,
        .ui-upstream-dashboard__mini-card,
        .ui-upstream-dashboard__group-card {
          border: 2px solid ButtonText;
        }
        .ui-upstream-dashboard__summary::before,
        .ui-upstream-dashboard__link::before,
        .ui-upstream-dashboard__hero-card::before {
          display: none;
        }
        .ui-upstream-dashboard__link[data-status="ok"],
        .ui-upstream-dashboard__link[data-status="warning"],
        .ui-upstream-dashboard__link[data-status="critical"],
        .ui-upstream-dashboard__link[data-status="unknown"],
        .ui-upstream-dashboard__compact-card[data-status="ok"],
        .ui-upstream-dashboard__compact-card[data-status="warning"],
        .ui-upstream-dashboard__compact-card[data-status="critical"],
        .ui-upstream-dashboard__compact-card[data-status="unknown"],
        .ui-upstream-dashboard__mini-card[data-status="ok"],
        .ui-upstream-dashboard__mini-card[data-status="warning"],
        .ui-upstream-dashboard__mini-card[data-status="critical"],
        .ui-upstream-dashboard__mini-card[data-status="unknown"] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-upstream-dashboard__status-dot,
        .ui-upstream-dashboard__compact-dot,
        .ui-upstream-dashboard__table-status-dot,
        .ui-upstream-dashboard__hero-mini-dot,
        .ui-upstream-dashboard__mini-card-status {
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
        .ui-upstream-dashboard__link,
        .ui-upstream-dashboard__compact-card,
        .ui-upstream-dashboard__hero-card,
        .ui-upstream-dashboard__mini-card,
        .ui-upstream-dashboard__group-card {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
        .ui-upstream-dashboard__summary::before,
        .ui-upstream-dashboard__link::before,
        .ui-upstream-dashboard__hero-card::before {
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
        .ui-upstream-dashboard__status-dot,
        .ui-upstream-dashboard__compact-dot,
        .ui-upstream-dashboard__table-status-dot,
        .ui-upstream-dashboard__hero-mini-dot,
        .ui-upstream-dashboard__mini-card-status {
          animation: none;
        }
        .ui-upstream-dashboard__link,
        .ui-upstream-dashboard__compact-card,
        .ui-upstream-dashboard__group-content,
        .ui-upstream-dashboard__group-chevron {
          transition: none;
        }
      }
    }
  }
`

// ─── SVG Sub-components ──────────────────────────────────────────────────────

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

// ─── Sparkline Renderers ────────────────────────────────────────────────────

function buildSparklinePath(data: number[], w: number, h: number, padding = 1): { line: string; area: string } {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

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

  const area = `${d} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`
  return { line: d, area }
}

function TrendSparkline({ data, id }: { data: number[]; id: string }) {
  if (data.length < 2) return null
  const w = 100
  const h = 24
  const { line, area } = buildSparklinePath(data, w, h)
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
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

function InlineSparkline({ data, w = 60, h = 16 }: { data: number[]; w?: number; h?: number }) {
  if (data.length < 2) return null
  const { line, area } = buildSparklinePath(data, w, h)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill="oklch(65% 0.2 270 / 0.15)" />
      <path d={line} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1" />
    </svg>
  )
}

function HeroTrendlineBg({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const w = 200
  const h = 60
  const { line, area } = buildSparklinePath(data, w, h, 2)

  return (
    <div className="ui-upstream-dashboard__hero-trendline" aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="hero-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(65% 0.2 270)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="oklch(65% 0.2 270)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#hero-trend-fill)" />
        <path d={line} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1.5" strokeOpacity="0.15" />
      </svg>
    </div>
  )
}

// ─── Utilization Helpers ────────────────────────────────────────────────────

function utilizationLevel(pct: number): 'ok' | 'warning' | 'critical' {
  if (pct > 80) return 'critical'
  if (pct > 60) return 'warning'
  return 'ok'
}

function utilColor(pct: number): string {
  if (pct > 80) return 'oklch(62% 0.22 25)'
  if (pct > 60) return 'oklch(80% 0.18 85)'
  return 'oklch(72% 0.19 155)'
}

// ─── UtilBar with capacity + burst markers ──────────────────────────────────

function UtilBar({ percent, capacity, burst }: { percent: number; capacity?: number; burst?: number }) {
  const color = utilColor(percent)
  const burstPct = burst && capacity ? Math.round((capacity / burst) * 100) : 100

  return (
    <div className="ui-upstream-dashboard__util-bar">
      <div
        className="ui-upstream-dashboard__util-fill"
        style={{ width: `${Math.min(percent, 100)}%`, background: color }}
      />
      {burst && capacity && burst > capacity && (
        <div
          className="ui-upstream-dashboard__util-burst-marker"
          style={{ left: `${burstPct}%` }}
          title="Committed capacity"
        />
      )}
      <span className="ui-upstream-dashboard__util-label">{percent}%</span>
    </div>
  )
}

function UtilMeter({ percent }: { percent: number }) {
  const color = percent > 80 ? 'var(--status-critical, oklch(62% 0.22 25))' : percent > 60 ? 'var(--status-warning, oklch(80% 0.18 85))' : 'var(--status-ok, oklch(72% 0.19 155))'
  const angle = (percent / 100) * 180
  const rad = (angle * Math.PI) / 180
  const x = 20 + 18 * Math.cos(Math.PI - rad)
  const y = 20 - 18 * Math.sin(Math.PI - rad)
  const largeArc = angle > 180 ? 1 : 0
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true">
      <path d="M 2 22 A 18 18 0 0 1 38 22" fill="none" stroke="var(--border-default, oklch(100% 0 0 / 0.1))" strokeWidth="3" />
      <path d={`M 2 22 A 18 18 0 ${largeArc} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <text x="20" y="20" textAnchor="middle" fill="var(--text-primary, oklch(90% 0 0))" fontSize="8" fontWeight="700">{percent}%</text>
    </svg>
  )
}

function ambientTintStyle(utilPct: number | null): React.CSSProperties | undefined {
  if (utilPct === null || utilPct < 40) return undefined
  if (utilPct < 70) return { background: 'oklch(80% 0.18 85 / 0.03)' }
  if (utilPct < 90) return { background: 'oklch(80% 0.18 85 / 0.05)' }
  return { background: 'oklch(62% 0.22 25 / 0.05)' }
}

// ─── MiniCard Sub-component ─────────────────────────────────────────────────

function MiniCard({
  link,
  label,
  showCapacity,
  showBurstCapacity,
  showUtilization,
  utilizationDisplay,
  onClick,
}: {
  link: UpstreamLink
  label?: string
  showCapacity?: boolean
  showBurstCapacity?: boolean
  showUtilization?: boolean
  utilizationDisplay?: 'bar' | 'meter' | 'ambient'
  onClick?: (link: UpstreamLink) => void
}) {
  const inFmt = formatBitRateSplit(link.inbound)
  const outFmt = formatBitRateSplit(link.outbound)
  const utilPct = link.capacity ? Math.round(((link.inbound + link.outbound) / link.capacity) * 100) : 0
  const ambientStyle = utilizationDisplay === 'ambient' ? ambientTintStyle(utilPct) : undefined
  const clickable = !!onClick

  return (
    <div
      className="ui-upstream-dashboard__mini-card"
      data-status={link.status}
      {...(clickable && { 'data-clickable': '', tabIndex: 0, role: 'button', onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(link) } } })}
      onClick={clickable ? () => onClick?.(link) : undefined}
      style={ambientStyle}
    >
      <div className="ui-upstream-dashboard__mini-card-header">
        <span className="ui-upstream-dashboard__mini-card-status" data-status={link.status} />
        <span className="ui-upstream-dashboard__mini-card-label">{label ?? `${link.vendor} · ${link.location}`}</span>
      </div>
      <div className="ui-upstream-dashboard__mini-card-metrics">
        <span style={{ color: 'oklch(72% 0.19 155)' }}>↓{inFmt.value}<small>{inFmt.unit}</small></span>
        <span style={{ color: 'oklch(65% 0.2 270)' }}>↑{outFmt.value}<small>{outFmt.unit}</small></span>
      </div>
      {showCapacity && link.capacity != null && (
        <div className="ui-upstream-dashboard__mini-card-capacity">
          Cap: {formatBitRateSplit(link.capacity).value} {formatBitRateSplit(link.capacity).unit}
          {showBurstCapacity && link.burstCapacity != null && ` · Burst: ${formatBitRateSplit(link.burstCapacity).value} ${formatBitRateSplit(link.burstCapacity).unit}`}
        </div>
      )}
      {showUtilization && link.capacity != null && utilizationDisplay !== 'ambient' && (
        utilizationDisplay === 'meter'
          ? <UtilMeter percent={utilPct} />
          : <UtilBar percent={utilPct} capacity={link.capacity} burst={link.burstCapacity} />
      )}
    </div>
  )
}

// ─── GroupCard Sub-component (nested grouping in hero mode) ──────────────────

function GroupCard({
  groupName,
  links,
  showCapacity,
  showBurstCapacity,
  showUtilization,
  utilizationDisplay,
  childLabelKey,
  onGroupClick,
  onLinkClick,
}: {
  groupName: string
  links: UpstreamLink[]
  showCapacity?: boolean
  showBurstCapacity?: boolean
  showUtilization?: boolean
  utilizationDisplay?: 'bar' | 'meter' | 'ambient'
  childLabelKey: 'location' | 'vendor'
  onGroupClick?: (groupName: string, links: UpstreamLink[]) => void
  onLinkClick?: (link: UpstreamLink) => void
}) {
  const totalIn = links.reduce((sum, l) => sum + l.inbound, 0)
  const totalOut = links.reduce((sum, l) => sum + l.outbound, 0)
  const totalCap = links.reduce((sum, l) => sum + (l.capacity ?? 0), 0)
  const totalBurst = links.reduce((sum, l) => sum + (l.burstCapacity ?? 0), 0)
  const utilPct = totalCap > 0 ? Math.round(((totalIn + totalOut) / totalCap) * 100) : 0

  const groupClickable = !!onGroupClick

  return (
    <div className="ui-upstream-dashboard__group-card">
      <div
        className="ui-upstream-dashboard__group-card-header"
        {...(groupClickable && { 'data-clickable': '', tabIndex: 0, role: 'button', onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGroupClick?.(groupName, links) } } })}
        onClick={groupClickable ? () => onGroupClick?.(groupName, links) : undefined}
      >
        <span className="ui-upstream-dashboard__group-card-name">{groupName}</span>
        <span className="ui-upstream-dashboard__group-card-metrics">
          <span style={{ color: 'oklch(72% 0.19 155)' }}>↓{formatTraffic(totalIn)}</span>
          <span style={{ color: 'oklch(65% 0.2 270)' }}>↑{formatTraffic(totalOut)}</span>
        </span>
        {showCapacity && totalCap > 0 && (
          <span className="ui-upstream-dashboard__group-card-cap">Cap: {formatTraffic(totalCap)}</span>
        )}
        {showUtilization && totalCap > 0 && (
          <span className="ui-upstream-dashboard__group-card-util">
            <UtilBar percent={utilPct} capacity={totalCap} burst={totalBurst > 0 ? totalBurst : undefined} />
          </span>
        )}
      </div>
      <div className="ui-upstream-dashboard__group-card-children">
        {links.map(link => (
          <MiniCard
            key={link.id}
            link={link}
            label={link[childLabelKey]}
            showCapacity={showCapacity}
            showBurstCapacity={showBurstCapacity}
            showUtilization={showUtilization}
            utilizationDisplay={utilizationDisplay}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Summary Card ───────────────────────────────────────────────────────────

function SummaryCard({
  links,
  lastUpdated,
  onSummaryClick,
}: {
  links: UpstreamLink[]
  lastUpdated?: number | Date
  onSummaryClick?: () => void
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
    <div
      className="ui-upstream-dashboard__summary"
      role="region"
      aria-label="Upstream Traffic Summary"
      {...(onSummaryClick && { 'data-clickable': '', tabIndex: 0, onClick: onSummaryClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSummaryClick() } } })}
    >
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

// ─── Hero Mode ──────────────────────────────────────────────────────────────

function HeroView({
  links,
  groupBy = 'none',
  showCapacity = true,
  showBurstCapacity = false,
  showUtilization = true,
  utilizationDisplay = 'bar',
  onSummaryClick,
  onLinkClick,
  onGroupClick,
}: {
  links: UpstreamLink[]
  groupBy?: 'vendor' | 'location' | 'none'
  showCapacity?: boolean
  showBurstCapacity?: boolean
  showUtilization?: boolean
  utilizationDisplay?: 'bar' | 'meter' | 'ambient'
  onSummaryClick?: () => void
  onLinkClick?: (link: UpstreamLink) => void
  onGroupClick?: (groupName: string, links: UpstreamLink[]) => void
}) {
  const totalInbound = links.reduce((s, l) => s + l.inbound, 0)
  const totalOutbound = links.reduce((s, l) => s + l.outbound, 0)
  const totalTraffic = totalInbound + totalOutbound
  const totalCapacity = links.reduce((s, l) => s + (l.capacity ?? 0), 0)
  const totalBurstCapacity = links.reduce((s, l) => s + (l.burstCapacity ?? 0), 0)

  const inFmt = formatBitRateSplit(totalInbound)
  const outFmt = formatBitRateSplit(totalOutbound)
  const totalFmt = formatBitRateSplit(totalTraffic)
  const capFmt = totalCapacity > 0 ? formatBitRateSplit(totalCapacity) : null
  const burstCapFmt = totalBurstCapacity > 0 ? formatBitRateSplit(totalBurstCapacity) : null
  const utilPct = computeUtilization(links)

  // Aggregate trend data from all links
  const aggregatedTrend = useMemo(() => {
    const trendsWithData = links.filter(l => l.trend && l.trend.length >= 2)
    if (trendsWithData.length === 0) return null
    const maxLen = Math.max(...trendsWithData.map(l => l.trend!.length))
    const result: number[] = []
    for (let i = 0; i < maxLen; i++) {
      let sum = 0
      for (const l of trendsWithData) {
        const idx = Math.min(i, l.trend!.length - 1)
        sum += l.trend![idx]
      }
      result.push(sum)
    }
    return result
  }, [links])

  // Build groups based on groupBy
  const groups = useMemo(() => {
    if (groupBy === 'none') return null
    const map = new Map<string, UpstreamLink[]>()
    for (const link of links) {
      const key = groupBy === 'vendor' ? link.vendor : link.location
      const arr = map.get(key) || []
      arr.push(link)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [links, groupBy])

  const ambientStyle = utilizationDisplay === 'ambient' ? ambientTintStyle(utilPct) : undefined

  return (
    <>
      <div
        className="ui-upstream-dashboard__hero-card"
        data-testid="hero-card"
        style={ambientStyle}
        {...(onSummaryClick && { 'data-clickable': '', tabIndex: 0, role: 'button', onClick: onSummaryClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSummaryClick() } } })}
      >
        {aggregatedTrend && <HeroTrendlineBg data={aggregatedTrend} />}

        <div className="ui-upstream-dashboard__hero-metrics">
          <div className="ui-upstream-dashboard__hero-metric">
            <span className="ui-upstream-dashboard__hero-value">
              <span className="ui-upstream-dashboard__hero-direction ui-upstream-dashboard__hero-direction--in" aria-hidden="true">↓</span>
              {inFmt.value}
              <span className="ui-upstream-dashboard__hero-unit">{inFmt.unit}</span>
            </span>
            <span className="ui-upstream-dashboard__hero-label">Inbound</span>
          </div>
          <div className="ui-upstream-dashboard__hero-metric">
            <span className="ui-upstream-dashboard__hero-value">
              <span className="ui-upstream-dashboard__hero-direction ui-upstream-dashboard__hero-direction--out" aria-hidden="true">↑</span>
              {outFmt.value}
              <span className="ui-upstream-dashboard__hero-unit">{outFmt.unit}</span>
            </span>
            <span className="ui-upstream-dashboard__hero-label">Outbound</span>
          </div>
        </div>

        {utilPct !== null && showUtilization && utilizationDisplay === 'bar' && (
          <UtilBar percent={utilPct} capacity={totalCapacity} burst={totalBurstCapacity > 0 ? totalBurstCapacity : undefined} />
        )}
        {utilPct !== null && showUtilization && utilizationDisplay === 'meter' && (
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <UtilMeter percent={utilPct} />
          </div>
        )}

        <div className="ui-upstream-dashboard__hero-footer">
          <span className="ui-upstream-dashboard__hero-footer-item">
            Total: {totalFmt.value} {totalFmt.unit}
          </span>
          {showCapacity && capFmt && (
            <span className="ui-upstream-dashboard__hero-footer-item">
              Capacity: {capFmt.value} {capFmt.unit}
            </span>
          )}
          {showBurstCapacity && burstCapFmt && (
            <span className="ui-upstream-dashboard__hero-footer-item">
              Burst: {burstCapFmt.value} {burstCapFmt.unit}
            </span>
          )}
          {showUtilization && utilPct !== null && (
            <span className="ui-upstream-dashboard__hero-footer-item">
              {utilPct}% used
            </span>
          )}
        </div>
      </div>

      {/* Grouped cards below the hero */}
      {groups && (
        <div className="ui-upstream-dashboard__hero-groups-grid">
          {groups.map(([key, groupLinks]) => (
            <GroupCard
              key={key}
              groupName={key}
              links={groupLinks}
              showCapacity={showCapacity}
              showBurstCapacity={showBurstCapacity}
              showUtilization={showUtilization}
              utilizationDisplay={utilizationDisplay}
              childLabelKey={groupBy === 'vendor' ? 'location' : 'vendor'}
              onGroupClick={onGroupClick}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}

      {/* Flat mini cards when no grouping */}
      {!groups && (
        <div className="ui-upstream-dashboard__hero-mini-grid">
          {links.map(link => (
            <MiniCard
              key={link.id}
              link={link}
              showCapacity={showCapacity}
              showBurstCapacity={showBurstCapacity}
              showUtilization={showUtilization}
              utilizationDisplay={utilizationDisplay}
              onClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ─── Compact Mode ───────────────────────────────────────────────────────────

function CompactCard({ link, onClick }: { link: UpstreamLink; onClick?: (link: UpstreamLink) => void }) {
  const inFmt = formatBitRateSplit(link.inbound)
  const outFmt = formatBitRateSplit(link.outbound)
  const utilPct = link.capacity ? Math.min(100, Math.round(((link.inbound + link.outbound) / link.capacity) * 100)) : null
  const clickable = !!onClick

  return (
    <div
      className="ui-upstream-dashboard__compact-card"
      data-status={link.status}
      role="group"
      aria-label={`${link.vendor} ${link.location}`}
      {...(clickable && { 'data-clickable': '', tabIndex: 0, onClick: () => onClick?.(link), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(link) } } })}
    >
      <div className="ui-upstream-dashboard__compact-header">
        <span className="ui-upstream-dashboard__compact-dot" />
        <span>{link.vendor}</span>
        <span aria-hidden="true">·</span>
        <span>{link.location}</span>
      </div>

      <div className="ui-upstream-dashboard__compact-metrics">
        <span className="ui-upstream-dashboard__compact-value">
          <span className="ui-upstream-dashboard__compact-direction ui-upstream-dashboard__compact-direction--in" aria-hidden="true">↓</span>
          {inFmt.value}
          <span className="ui-upstream-dashboard__compact-value-unit">{inFmt.unit}</span>
        </span>
        <span className="ui-upstream-dashboard__compact-value">
          <span className="ui-upstream-dashboard__compact-direction ui-upstream-dashboard__compact-direction--out" aria-hidden="true">↑</span>
          {outFmt.value}
          <span className="ui-upstream-dashboard__compact-value-unit">{outFmt.unit}</span>
        </span>
      </div>

      <div className="ui-upstream-dashboard__compact-footer">
        {link.trend && link.trend.length >= 2 && (
          <span className="ui-upstream-dashboard__compact-sparkline">
            <InlineSparkline data={link.trend} />
          </span>
        )}
        {utilPct !== null && (
          <span className="ui-upstream-dashboard__compact-util">
            <span className="ui-upstream-dashboard__compact-util-bar">
              <span
                className="ui-upstream-dashboard__compact-util-fill"
                style={{
                  display: 'block',
                  width: `${utilPct}%`,
                  height: '100%',
                  borderRadius: 1,
                  background: utilPct > 80 ? 'oklch(62% 0.22 25)' : utilPct > 60 ? 'oklch(80% 0.18 85)' : 'oklch(72% 0.19 155)',
                }}
              />
            </span>
            <span>{utilPct}%</span>
          </span>
        )}
      </div>
    </div>
  )
}

function CompactView({ links, groupBy, onLinkClick, onGroupClick }: { links: UpstreamLink[]; groupBy: 'vendor' | 'location' | 'none'; onLinkClick?: (link: UpstreamLink) => void; onGroupClick?: (groupName: string, links: UpstreamLink[]) => void }) {
  if (groupBy !== 'none') {
    const map = new Map<string, UpstreamLink[]>()
    for (const link of links) {
      const key = groupBy === 'vendor' ? link.vendor : link.location
      const arr = map.get(key) || []
      arr.push(link)
      map.set(key, arr)
    }

    return (
      <>
        {Array.from(map.entries()).map(([key, groupLinks]) => (
          <CompactGroup key={key} groupKey={key} links={groupLinks} onLinkClick={onLinkClick} onGroupClick={onGroupClick} />
        ))}
      </>
    )
  }

  return (
    <div className="ui-upstream-dashboard__compact-grid" data-testid="compact-grid">
      {links.map(link => (
        <CompactCard key={link.id} link={link} onClick={onLinkClick} />
      ))}
    </div>
  )
}

function CompactGroup({ groupKey, links, onLinkClick, onGroupClick }: { groupKey: string; links: UpstreamLink[]; onLinkClick?: (link: UpstreamLink) => void; onGroupClick?: (groupName: string, links: UpstreamLink[]) => void }) {
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
        onClick={() => { setCollapsed(c => !c); onGroupClick?.(groupKey, links) }}
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
        <div className="ui-upstream-dashboard__compact-grid">
          {links.map(link => (
            <CompactCard key={link.id} link={link} onClick={onLinkClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Table Mode ─────────────────────────────────────────────────────────────

function TableView({
  links,
  groupBy,
  showCapacity = true,
  showBurstCapacity = false,
  showUtilization = true,
  onSummaryClick,
  onLinkClick,
}: {
  links: UpstreamLink[]
  groupBy: 'vendor' | 'location' | 'none'
  showCapacity?: boolean
  showBurstCapacity?: boolean
  showUtilization?: boolean
  onSummaryClick?: () => void
  onLinkClick?: (link: UpstreamLink) => void
}) {
  // Aggregated metrics at top
  const totalInbound = links.reduce((s, l) => s + l.inbound, 0)
  const totalOutbound = links.reduce((s, l) => s + l.outbound, 0)
  const inFmtTop = formatBitRateSplit(totalInbound)
  const outFmtTop = formatBitRateSplit(totalOutbound)

  // Sort by group key if grouping
  const sortedLinks = useMemo(() => {
    if (groupBy === 'none') return links
    return [...links].sort((a, b) => {
      const keyA = groupBy === 'vendor' ? a.vendor : a.location
      const keyB = groupBy === 'vendor' ? b.vendor : b.location
      return keyA.localeCompare(keyB)
    })
  }, [links, groupBy])

  return (
    <>
      {/* Aggregated metrics at top */}
      <div
        className="ui-upstream-dashboard__table-top-metrics"
        {...(onSummaryClick && { 'data-clickable': '', tabIndex: 0, role: 'button', onClick: onSummaryClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSummaryClick() } } })}
      >
        <div className="ui-upstream-dashboard__hero-metric">
          <span className="ui-upstream-dashboard__table-top-value">
            <span className="ui-upstream-dashboard__table-top-direction ui-upstream-dashboard__table-top-direction--in" aria-hidden="true">↓</span>
            {inFmtTop.value}
            <span className="ui-upstream-dashboard__table-top-unit">{inFmtTop.unit}</span>
          </span>
          <span className="ui-upstream-dashboard__table-top-label">Inbound</span>
        </div>
        <div className="ui-upstream-dashboard__hero-metric">
          <span className="ui-upstream-dashboard__table-top-value">
            <span className="ui-upstream-dashboard__table-top-direction ui-upstream-dashboard__table-top-direction--out" aria-hidden="true">↑</span>
            {outFmtTop.value}
            <span className="ui-upstream-dashboard__table-top-unit">{outFmtTop.unit}</span>
          </span>
          <span className="ui-upstream-dashboard__table-top-label">Outbound</span>
        </div>
      </div>

      <div className="ui-upstream-dashboard__table-wrapper">
      <table className="ui-upstream-dashboard__table" data-testid="table-view">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Location</th>
            <th>↓ Inbound</th>
            <th>↑ Outbound</th>
            {showCapacity && <th>Capacity</th>}
            {showBurstCapacity && <th>Burst</th>}
            {showUtilization && <th>Util</th>}
            <th>Trend</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedLinks.map(link => {
            const inFmt = formatBitRateSplit(link.inbound)
            const outFmt = formatBitRateSplit(link.outbound)
            const utilPct = link.capacity
              ? Math.min(100, Math.round(((link.inbound + link.outbound) / link.capacity) * 100))
              : null
            const capFmt = link.capacity ? formatBitRateSplit(link.capacity) : null
            const burstFmt = link.burstCapacity ? formatBitRateSplit(link.burstCapacity) : null

            return (
              <tr
                key={link.id}
                data-status={link.status}
                {...(onLinkClick && { 'data-clickable': '', onClick: () => onLinkClick(link) })}
              >
                <td>{link.vendor}</td>
                <td>{link.location}</td>
                <td>
                  <span className="ui-upstream-dashboard__table-rate">
                    {inFmt.value}
                    <span className="ui-upstream-dashboard__table-rate-unit">{inFmt.unit}</span>
                  </span>
                </td>
                <td>
                  <span className="ui-upstream-dashboard__table-rate">
                    {outFmt.value}
                    <span className="ui-upstream-dashboard__table-rate-unit">{outFmt.unit}</span>
                  </span>
                </td>
                {showCapacity && (
                  <td>
                    {capFmt ? (
                      <span className="ui-upstream-dashboard__table-rate">
                        {capFmt.value}
                        <span className="ui-upstream-dashboard__table-rate-unit">{capFmt.unit}</span>
                      </span>
                    ) : <span>—</span>}
                  </td>
                )}
                {showBurstCapacity && (
                  <td>
                    {burstFmt ? (
                      <span className="ui-upstream-dashboard__table-rate">
                        {burstFmt.value}
                        <span className="ui-upstream-dashboard__table-rate-unit">{burstFmt.unit}</span>
                      </span>
                    ) : <span>—</span>}
                  </td>
                )}
                {showUtilization && (
                  <td>
                    {utilPct !== null ? (
                      <div className="ui-upstream-dashboard__table-util">
                        <div className="ui-upstream-dashboard__table-util-bar">
                          <div
                            className="ui-upstream-dashboard__table-util-fill"
                            style={{
                              width: `${utilPct}%`,
                              background: utilPct > 80 ? 'oklch(62% 0.22 25)' : utilPct > 60 ? 'oklch(80% 0.18 85)' : 'oklch(72% 0.19 155)',
                            }}
                          />
                        </div>
                        <span>{utilPct}%</span>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                )}
                <td>
                  {link.trend && link.trend.length >= 2 ? (
                    <span className="ui-upstream-dashboard__table-sparkline">
                      <InlineSparkline data={link.trend} w={60} h={20} />
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td>
                  <span className="ui-upstream-dashboard__table-status">
                    <span className="ui-upstream-dashboard__table-status-dot" data-status={link.status} role="status" aria-label={`Status: ${link.status}`} />
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </>
  )
}

// ─── Legacy Link Card (for backwards compat when mode is unset) ─────────────

function LinkCard({ link, compact, onClick }: { link: UpstreamLink; compact?: boolean; onClick?: (link: UpstreamLink) => void }) {
  const inFmt = formatBitRateSplit(link.inbound)
  const outFmt = formatBitRateSplit(link.outbound)
  const clickable = !!onClick

  return (
    <div
      className="ui-upstream-dashboard__link"
      data-status={link.status}
      role="group"
      aria-label={`${link.vendor} ${link.location}`}
      {...(clickable && { 'data-clickable': '', tabIndex: 0, onClick: () => onClick?.(link), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(link) } } })}
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

// ─── Legacy Link Group ──────────────────────────────────────────────────────

function LinkGroup({
  groupKey,
  links,
  compact,
  onLinkClick,
  onGroupClick,
}: {
  groupKey: string
  links: UpstreamLink[]
  compact?: boolean
  onLinkClick?: (link: UpstreamLink) => void
  onGroupClick?: (groupName: string, links: UpstreamLink[]) => void
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
        onClick={() => { setCollapsed(c => !c); onGroupClick?.(groupKey, links) }}
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
            <LinkCard key={link.id} link={link} compact={compact} onClick={onLinkClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

function UpstreamDashboardInner({
  links,
  title,
  mode,
  showSummary = false,
  groupBy = 'none',
  compact = false,
  lastUpdated,
  motion: motionProp,
  showCapacity = true,
  showBurstCapacity = false,
  showUtilization = true,
  utilizationDisplay = 'bar',
  onLinkClick,
  onGroupClick,
  onSummaryClick,
  className,
  ...rest
}: UpstreamDashboardProps) {
  useStyles('upstream-dashboard', upstreamDashboardStyles)
  const motionLevel = useMotionLevel(motionProp)

  // Resolve effective mode: explicit mode prop > compact legacy prop > default hero
  const effectiveMode = mode ?? (compact ? 'compact' : undefined)

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
      data-mode={effectiveMode}
      {...(compact && !mode && { 'data-compact': '' })}
      role="region"
      aria-label={typeof title === 'string' ? title : 'Upstream Dashboard'}
      {...rest}
    >
      {title && (
        <h2 className="ui-upstream-dashboard__title">{title}</h2>
      )}

      {showSummary && !isEmpty && (
        <SummaryCard links={links} lastUpdated={lastUpdated} onSummaryClick={onSummaryClick} />
      )}

      {isEmpty && (
        <div className="ui-upstream-dashboard__empty">
          No upstream links configured
        </div>
      )}

      {!isEmpty && effectiveMode === 'hero' && (
        <HeroView
          links={links}
          groupBy={groupBy}
          showCapacity={showCapacity}
          showBurstCapacity={showBurstCapacity}
          showUtilization={showUtilization}
          utilizationDisplay={utilizationDisplay}
          onSummaryClick={onSummaryClick}
          onLinkClick={onLinkClick}
          onGroupClick={onGroupClick}
        />
      )}

      {!isEmpty && effectiveMode === 'compact' && (
        <CompactView links={links} groupBy={groupBy} onLinkClick={onLinkClick} onGroupClick={onGroupClick} />
      )}

      {!isEmpty && effectiveMode === 'table' && (
        <TableView
          links={links}
          groupBy={groupBy}
          showCapacity={showCapacity}
          showBurstCapacity={showBurstCapacity}
          showUtilization={showUtilization}
          onSummaryClick={onSummaryClick}
          onLinkClick={onLinkClick}
        />
      )}

      {/* Legacy mode — no mode prop and no compact prop */}
      {!isEmpty && !effectiveMode && groups ? (
        groups.map(g => (
          <LinkGroup key={g.key} groupKey={g.key} links={g.links} compact={compact} onLinkClick={onLinkClick} onGroupClick={onGroupClick} />
        ))
      ) : !isEmpty && !effectiveMode && !groups ? (
        <div className="ui-upstream-dashboard__grid">
          {links.map(link => (
            <LinkCard key={link.id} link={link} compact={compact} onClick={onLinkClick} />
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
