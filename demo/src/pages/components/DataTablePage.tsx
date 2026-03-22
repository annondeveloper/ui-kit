'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DataTable, type ColumnDef } from '@ui/domain/data-table'
import { Card } from '@ui/components/card'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Server {
  id: number
  hostname: string
  ip: string
  region: string
  os: string
  cpu: number
  memory: number
  disk: number
  status: 'online' | 'degraded' | 'offline'
  uptime: string
  lastSeen: string
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'eu-central-1']
const OS_LIST = ['Ubuntu 24.04', 'RHEL 9', 'Debian 12', 'Alpine 3.19']
const STATUSES: ('online' | 'degraded' | 'offline')[] = ['online', 'online', 'online', 'degraded', 'offline']

const sampleData: Server[] = [
  { id: 1, hostname: 'api-gateway-01', ip: '10.0.1.12', region: 'us-east-1', os: 'Ubuntu 24.04', cpu: 45, memory: 62, disk: 38, status: 'online', uptime: '142d', lastSeen: '1m ago' },
  { id: 2, hostname: 'db-primary-01', ip: '10.0.1.24', region: 'us-east-1', os: 'RHEL 9', cpu: 78, memory: 85, disk: 52, status: 'online', uptime: '89d', lastSeen: '30s ago' },
  { id: 3, hostname: 'cache-redis-01', ip: '10.0.2.5', region: 'us-west-2', os: 'Alpine 3.19', cpu: 22, memory: 41, disk: 15, status: 'online', uptime: '201d', lastSeen: '2m ago' },
  { id: 4, hostname: 'worker-batch-03', ip: '10.0.2.18', region: 'us-west-2', os: 'Debian 12', cpu: 91, memory: 73, disk: 67, status: 'degraded', uptime: '34d', lastSeen: '5m ago' },
  { id: 5, hostname: 'lb-ingress-01', ip: '10.0.3.2', region: 'eu-west-1', os: 'Ubuntu 24.04', cpu: 33, memory: 28, disk: 12, status: 'online', uptime: '312d', lastSeen: '15s ago' },
  { id: 6, hostname: 'ml-inference-02', ip: '10.0.3.15', region: 'eu-west-1', os: 'Ubuntu 24.04', cpu: 87, memory: 92, disk: 44, status: 'online', uptime: '56d', lastSeen: '1m ago' },
  { id: 7, hostname: 'log-collector-01', ip: '10.0.4.8', region: 'ap-south-1', os: 'Debian 12', cpu: 55, memory: 48, disk: 78, status: 'online', uptime: '167d', lastSeen: '45s ago' },
  { id: 8, hostname: 'auth-service-01', ip: '10.0.4.22', region: 'ap-south-1', os: 'RHEL 9', cpu: 42, memory: 55, disk: 29, status: 'online', uptime: '98d', lastSeen: '2m ago' },
  { id: 9, hostname: 'cdn-edge-05', ip: '10.0.5.3', region: 'eu-central-1', os: 'Alpine 3.19', cpu: 18, memory: 22, disk: 8, status: 'online', uptime: '245d', lastSeen: '10s ago' },
  { id: 10, hostname: 'db-replica-02', ip: '10.0.5.17', region: 'eu-central-1', os: 'RHEL 9', cpu: 65, memory: 71, disk: 55, status: 'online', uptime: '89d', lastSeen: '1m ago' },
  { id: 11, hostname: 'queue-rabbitmq-01', ip: '10.0.1.30', region: 'us-east-1', os: 'Debian 12', cpu: 38, memory: 44, disk: 33, status: 'online', uptime: '178d', lastSeen: '30s ago' },
  { id: 12, hostname: 'monitor-prom-01', ip: '10.0.2.25', region: 'us-west-2', os: 'Ubuntu 24.04', cpu: 29, memory: 52, disk: 71, status: 'degraded', uptime: '45d', lastSeen: '8m ago' },
  { id: 13, hostname: 'storage-minio-01', ip: '10.0.3.40', region: 'eu-west-1', os: 'Debian 12', cpu: 15, memory: 35, disk: 88, status: 'online', uptime: '290d', lastSeen: '3m ago' },
  { id: 14, hostname: 'ci-runner-07', ip: '10.0.4.55', region: 'ap-south-1', os: 'Ubuntu 24.04', cpu: 95, memory: 88, disk: 42, status: 'offline', uptime: '0d', lastSeen: '2h ago' },
  { id: 15, hostname: 'vpn-gateway-01', ip: '10.0.5.60', region: 'eu-central-1', os: 'Alpine 3.19', cpu: 12, memory: 18, disk: 5, status: 'online', uptime: '365d', lastSeen: '5s ago' },
]

function generateLargeDataset(count: number): Server[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    hostname: `srv-${String(i + 1).padStart(5, '0')}`,
    ip: `10.${Math.floor(i / 256)}.${i % 256}.${(i * 7) % 256}`,
    region: REGIONS[i % 5],
    os: OS_LIST[i % 4],
    cpu: Math.round(20 + ((i * 37) % 70)),
    memory: Math.round(30 + ((i * 53) % 60)),
    disk: Math.round(10 + ((i * 41) % 80)),
    status: STATUSES[i % 5],
    uptime: `${((i * 13) % 365)}d`,
    lastSeen: '2m ago',
  }))
}

// ─── Column Definitions ─────────────────────────────────────────────────────

function PercentBar({ value, thresholds }: { value: number; thresholds?: [number, number] }) {
  const [warn, crit] = thresholds ?? [60, 80]
  const color = value > crit ? 'oklch(62% 0.22 25)' : value > warn ? 'oklch(75% 0.18 80)' : 'oklch(65% 0.2 150)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'oklch(100% 0 0 / 0.06)' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem', textAlign: 'right' as const, color: 'var(--text-secondary)' }}>{value}%</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { online: 'oklch(65% 0.2 150)', degraded: 'oklch(75% 0.18 80)', offline: 'oklch(62% 0.22 25)' }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[status] || 'oklch(50% 0 0)', flexShrink: 0 }} />
      {status}
    </span>
  )
}

const fullColumns: ColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname', sortable: true, filterable: true, pinned: 'left' },
  { id: 'ip', header: 'IP Address', accessor: 'ip', filterable: true },
  { id: 'region', header: 'Region', accessor: 'region', sortable: true, filterable: true, filterType: 'select' },
  { id: 'os', header: 'OS', accessor: 'os', filterable: true, filterType: 'select' },
  {
    id: 'cpu', header: 'CPU %', accessor: 'cpu', sortable: true, filterable: true, filterType: 'number', editable: true,
    cell: (value) => <PercentBar value={value as number} />,
  },
  {
    id: 'memory', header: 'Memory %', accessor: 'memory', sortable: true, filterable: true, filterType: 'number', editable: true,
    cell: (value) => <PercentBar value={value as number} />,
  },
  {
    id: 'disk', header: 'Disk %', accessor: 'disk', sortable: true, filterable: true, filterType: 'number',
    cell: (value) => <PercentBar value={value as number} thresholds={[70, 85]} />,
  },
  {
    id: 'status', header: 'Status', accessor: 'status', sortable: true, filterable: true, filterType: 'select',
    cell: (value) => <StatusBadge status={value as string} />,
  },
  { id: 'uptime', header: 'Uptime', accessor: 'uptime', sortable: true },
  { id: 'lastSeen', header: 'Last Seen', accessor: 'lastSeen', sortable: true },
]

const basicColumns: ColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname', sortable: true },
  { id: 'ip', header: 'IP Address', accessor: 'ip' },
  { id: 'region', header: 'Region', accessor: 'region', sortable: true },
  { id: 'cpu', header: 'CPU %', accessor: 'cpu', sortable: true, cell: (v) => <PercentBar value={v as number} /> },
  { id: 'memory', header: 'Memory %', accessor: 'memory', sortable: true, cell: (v) => <PercentBar value={v as number} /> },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (v) => <StatusBadge status={v as string} /> },
  { id: 'uptime', header: 'Uptime', accessor: 'uptime', sortable: true },
]

// ─── Page Styles ────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.datatable-page) {
      :scope {
        max-inline-size: min(1100px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: datatable-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .datatable-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .datatable-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .datatable-page__hero::before { animation: none; }
      }

      .datatable-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .datatable-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 65ch;
        text-wrap: pretty;
      }

      .datatable-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .datatable-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .datatable-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .datatable-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .datatable-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .datatable-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .datatable-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .datatable-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .datatable-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Playground ─────────────────────────────────── */

      .datatable-page__playground {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .datatable-page__playground-controls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      @container datatable-page (max-width: 680px) {
        .datatable-page__playground-controls {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .datatable-page__playground-controls {
          grid-template-columns: 1fr;
        }
      }

      .datatable-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .datatable-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .datatable-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .datatable-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .datatable-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .datatable-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .datatable-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .datatable-page__code-tabs {
        margin-block-start: 1rem;
      }

      .datatable-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .datatable-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Preview box ────────────────────────────────── */

      .datatable-page__preview {
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .datatable-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Info bar ──────────────────────────────────── */

      .datatable-page__info-bar {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        border: 1px solid oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        border-radius: var(--radius-md);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        margin-block-start: 0.75rem;
        font-variant-numeric: tabular-nums;
        flex-wrap: wrap;
      }

      .datatable-page__info-bar strong {
        color: var(--text-primary);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .datatable-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .datatable-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .datatable-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .datatable-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .datatable-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .datatable-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .datatable-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .datatable-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .datatable-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .datatable-page__tier-features {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── Color picker ──────────────────────────────── */

      .datatable-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .datatable-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .datatable-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .datatable-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .datatable-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .datatable-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .datatable-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .datatable-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .datatable-page__hero {
          padding: 2rem 1.25rem;
        }
        .datatable-page__title {
          font-size: 1.75rem;
        }
        .datatable-page__section {
          padding: 1.25rem;
        }
        .datatable-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .datatable-page__hero {
          padding: 1.5rem 1rem;
        }
        .datatable-page__title {
          font-size: 1.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .datatable-page__import-code,
      .datatable-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ─────────────────────────────────────────────────────────────

const dataTableProps: PropDef[] = [
  { name: 'data', type: 'T[]', description: 'Array of row data objects.' },
  { name: 'columns', type: 'ColumnDef<T>[]', description: 'Column definitions array with header, accessor, cell renderer, etc.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Show a global search input in the toolbar.' },
  { name: 'sortable', type: 'boolean', default: 'false', description: 'Enable column sorting (multi-sort with Shift+click).' },
  { name: 'paginated', type: 'boolean', default: 'false', description: 'Enable pagination with page controls.' },
  { name: 'pageSize', type: 'number', default: '10', description: 'Initial number of rows per page.' },
  { name: 'pageSizes', type: 'number[]', default: '[5, 10, 25, 50, 100]', description: 'Available page size options in the dropdown.' },
  { name: 'selectable', type: 'boolean', default: 'false', description: 'Show row selection checkboxes with select-all.' },
  { name: 'resizable', type: 'boolean', default: 'false', description: 'Allow resizing columns by dragging header borders.' },
  { name: 'reorderable', type: 'boolean', default: 'false', description: 'Allow reordering columns by dragging headers.' },
  { name: 'exportable', type: 'boolean', default: 'false', description: 'Show export button (CSV/JSON).' },
  { name: 'virtualScroll', type: 'boolean', default: 'false', description: 'Enable virtual scrolling for large datasets. Only renders visible rows.' },
  { name: 'rowHeight', type: 'number', default: '40', description: 'Row height in pixels (used by virtual scroll calculations).' },
  { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Make the table header sticky when scrolling.' },
  { name: 'filterable', type: 'boolean', default: 'false', description: 'Enable per-column filter dropdowns in headers.' },
  { name: 'filters', type: 'Record<string, { value, operator }>', description: 'Controlled filter state.' },
  { name: 'onFilterChange', type: '(filters) => void', description: 'Callback when filters change.' },
  { name: 'groupBy', type: 'string', description: 'Column ID to group rows by. Shows expandable group headers.' },
  { name: 'aggregations', type: "Record<string, 'sum' | 'avg' | 'count' | 'min' | 'max'>", description: 'Aggregation functions per column for group footers.' },
  { name: 'expandedGroups', type: 'Set<string>', description: 'Controlled set of expanded group keys.' },
  { name: 'onGroupToggle', type: '(groupKey: string) => void', description: 'Callback when a group is expanded/collapsed.' },
  { name: 'editable', type: 'boolean', default: 'false', description: 'Enable cell editing (double-click to edit).' },
  { name: 'onCellEdit', type: '(rowIndex, columnId, value) => void', description: 'Callback when a cell value is edited.' },
  { name: 'serverSide', type: 'boolean', default: 'false', description: 'Enable server-side mode. Disables client-side sort/filter/page.' },
  { name: 'totalRows', type: 'number', description: 'Total row count for server-side pagination.' },
  { name: 'onFetchData', type: '(params) => void', description: 'Callback to fetch data from server with sort, filter, page params.' },
  { name: 'autoSizeColumns', type: 'boolean', default: 'false', description: 'Auto-size columns to fit content width.' },
  { name: 'striped', type: 'boolean', default: 'false', description: 'Alternate row background colors.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Reduce cell padding for dense data.' },
  { name: 'bordered', type: 'boolean', default: 'false', description: 'Show cell borders.' },
  { name: 'responsiveMode', type: "'scroll' | 'card'", default: "'scroll'", description: 'Responsive layout: scroll horizontally or stack as cards on mobile.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading skeleton overlay.' },
  { name: 'empty', type: 'ReactNode', description: 'Custom empty state content when no data matches.' },
  { name: 'error', type: 'ReactNode', description: 'Custom error state content.' },
  { name: 'onRetry', type: '() => void', description: 'Retry callback shown with error state.' },
  { name: 'toolbar', type: 'ReactNode', description: 'Additional toolbar content injected after built-in controls.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'sortBy', type: '{ column, direction }[]', description: 'Controlled sort state.' },
  { name: 'onSort', type: '(sort) => void', description: 'Sort change callback.' },
  { name: 'selectedRows', type: 'Set<number>', description: 'Controlled selection state.' },
  { name: 'onSelectionChange', type: '(selected: Set<number>) => void', description: 'Selection change callback.' },
  { name: 'onExport', type: "(format: 'csv' | 'json', data: T[]) => void", description: 'Export callback with format and current data.' },
  { name: 'onPageChange', type: '(page: number) => void', description: 'Page change callback.' },
  { name: 'onSearchChange', type: '(query: string) => void', description: 'Search query change callback.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DataTable } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DataTable } from '@annondeveloper/ui-kit'",
  premium: "import { DataTable } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="datatable-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="datatable-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="datatable-page__control-group">
      <span className="datatable-page__control-label">{label}</span>
      <div className="datatable-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`datatable-page__option-btn${opt === value ? ' datatable-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(opts: {
  tier: Tier
  searchable: boolean
  sortable: boolean
  paginated: boolean
  pageSize: number
  selectable: boolean
  resizable: boolean
  reorderable: boolean
  exportable: boolean
  virtualScroll: boolean
  filterable: boolean
  editable: boolean
  groupBy: string
  stickyHeader: boolean
  autoSize: boolean
  striped: boolean
  compact: boolean
  bordered: boolean
  responsiveMode: 'scroll' | 'card'
}): string {
  const importPath = opts.tier === 'lite' ? '@annondeveloper/ui-kit/lite' : opts.tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'

  const props: string[] = [
    '  data={servers}',
    '  columns={columns}',
  ]
  if (opts.searchable) props.push('  searchable')
  if (opts.sortable) props.push('  sortable')
  if (opts.filterable) props.push('  filterable')
  if (opts.editable) props.push('  editable')
  if (opts.paginated) props.push(`  paginated\n  pageSize={${opts.pageSize}}`)
  if (opts.virtualScroll) props.push('  virtualScroll\n  rowHeight={36}')
  if (opts.selectable) props.push('  selectable')
  if (opts.resizable) props.push('  resizable')
  if (opts.reorderable) props.push('  reorderable')
  if (opts.exportable) props.push('  exportable')
  if (opts.stickyHeader) props.push('  stickyHeader')
  if (opts.autoSize) props.push('  autoSizeColumns')
  if (opts.groupBy && opts.groupBy !== 'none') props.push(`  groupBy="${opts.groupBy}"`)
  if (opts.striped) props.push('  striped')
  if (opts.compact) props.push('  compact')
  if (opts.bordered) props.push('  bordered')
  if (opts.responsiveMode !== 'scroll') props.push(`  responsiveMode="${opts.responsiveMode}"`)

  return `import { DataTable } from '${importPath}'\nimport type { ColumnDef } from '${importPath}'\n\n<DataTable\n${props.join('\n')}\n/>`
}

function generateHtmlCode(): string {
  return `<!-- DataTable — CSS-only approach not available -->
<!-- DataTable requires JavaScript for interactivity -->
<!-- Use the React component or server-render the HTML -->

<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/data-table.css">

<div class="ui-data-table">
  <table class="ui-data-table__table">
    <thead class="ui-data-table__thead">
      <tr><th class="ui-data-table__th">Hostname</th>...</tr>
    </thead>
    <tbody class="ui-data-table__tbody">
      <tr class="ui-data-table__tr"><td class="ui-data-table__td">srv-001</td>...</tr>
    </tbody>
  </table>
</div>`
}

function generateVueCode(tier: Tier): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <DataTable
    :data="servers"
    :columns="columns"
    searchable
    sortable
    paginated
    :page-size="10"
  />
</template>

<script setup>
import { DataTable } from '${importPath}'
import { ref } from 'vue'

const servers = ref([...])
const columns = ref([...])
</script>`
}

function generateAngularCode(): string {
  return `<!-- Angular — use CSS-only or React wrapper -->
<div class="ui-data-table">
  <table class="ui-data-table__table">
    <thead class="ui-data-table__thead">
      <tr>
        <th class="ui-data-table__th" *ngFor="let col of columns">
          {{ col.header }}
        </th>
      </tr>
    </thead>
    <tbody class="ui-data-table__tbody">
      <tr class="ui-data-table__tr" *ngFor="let row of data">
        <td class="ui-data-table__td" *ngFor="let col of columns">
          {{ row[col.accessor] }}
        </td>
      </tr>
    </tbody>
  </table>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/data-table.css';`
}

function generateSvelteCode(tier: Tier): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { DataTable } from '${importPath}';

  let servers = [...];
  let columns = [...];
</script>

<DataTable
  data={servers}
  {columns}
  searchable
  sortable
  paginated
  pageSize={10}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier, brandColor }: { tier: Tier; brandColor: string }) {
  // Data features
  const [searchable, setSearchable] = useState(true)
  const [sortable, setSortable] = useState(true)
  const [filterable, setFilterable] = useState(false)
  const [editable, setEditable] = useState(false)
  const [groupBy, setGroupBy] = useState<string>('none')

  // Layout features
  const [paginated, setPaginated] = useState(true)
  const [pageSize, setPageSize] = useState<number>(10)
  const [virtualScroll, setVirtualScroll] = useState(false)
  const [virtualRowCount, setVirtualRowCount] = useState<number>(1000)
  const [selectable, setSelectable] = useState(true)
  const [resizable, setResizable] = useState(true)
  const [reorderable, setReorderable] = useState(false)
  const [autoSize, setAutoSize] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(true)

  // Appearance
  const [exportable, setExportable] = useState(true)
  const [striped, setStriped] = useState(false)
  const [compact, setCompact] = useState(false)
  const [bordered, setBordered] = useState(false)
  const [responsiveMode, setResponsiveMode] = useState<'scroll' | 'card'>('scroll')

  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  // Editable data state
  const [editableData, setEditableData] = useState<Server[]>(sampleData)

  const handleCellEdit = useCallback((rowIndex: number, columnId: string, value: unknown) => {
    setEditableData(prev => prev.map((row, i) => i === rowIndex ? { ...row, [columnId]: value } : row))
  }, [])

  const data = useMemo(() => {
    if (virtualScroll) return generateLargeDataset(virtualRowCount)
    return editableData
  }, [virtualScroll, virtualRowCount, editableData])

  const reactCode = useMemo(
    () => generateReactCode({
      tier, searchable, sortable, paginated, pageSize, selectable, resizable,
      reorderable, exportable, virtualScroll, filterable, editable, groupBy,
      stickyHeader, autoSize, striped, compact, bordered, responsiveMode,
    }),
    [tier, searchable, sortable, paginated, pageSize, selectable, resizable, reorderable, exportable, virtualScroll, filterable, editable, groupBy, stickyHeader, autoSize, striped, compact, bordered, responsiveMode],
  )

  const htmlCode = useMemo(() => generateHtmlCode(), [])
  const vueCode = useMemo(() => generateVueCode(tier), [tier])
  const angularCode = useMemo(() => generateAngularCode(), [])
  const svelteCode = useMemo(() => generateSvelteCode(tier), [tier])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const tableProps: Record<string, unknown> = {
    data,
    columns: fullColumns,
    searchable,
    sortable,
    selectable,
    resizable,
    reorderable,
    exportable,
    stickyHeader,
    filterable,
    striped,
    compact,
    bordered,
    responsiveMode,
  }

  if (paginated && !virtualScroll) {
    tableProps.paginated = true
    tableProps.pageSize = pageSize
  }
  if (virtualScroll) {
    tableProps.virtualScroll = true
    tableProps.rowHeight = 36
  }
  if (editable) {
    tableProps.editable = true
    tableProps.onCellEdit = handleCellEdit
  }
  if (autoSize) tableProps.autoSizeColumns = true
  if (groupBy !== 'none') tableProps.groupBy = groupBy

  return (
    <section className="datatable-page__section" id="playground">
      <h2 className="datatable-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="datatable-page__section-desc">
        Toggle every feature flag and see the DataTable update in real-time. Generated code updates as you change settings.
      </p>

      <div className="datatable-page__playground">
        {/* Controls panel */}
        <div className="datatable-page__playground-controls">
          {/* Data Features */}
          <div className="datatable-page__control-group">
            <span className="datatable-page__control-label">Data Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />
              <Toggle label="Sortable" checked={sortable} onChange={setSortable} />
              <Toggle label="Filterable" checked={filterable} onChange={setFilterable} />
              <Toggle label="Editable" checked={editable} onChange={setEditable} />
              <OptionGroup
                label="Group By"
                options={['none', 'region', 'os', 'status'] as const}
                value={groupBy as 'none'}
                onChange={setGroupBy}
              />
            </div>
          </div>

          {/* Layout Features */}
          <div className="datatable-page__control-group">
            <span className="datatable-page__control-label">Layout Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Paginated" checked={paginated && !virtualScroll} onChange={(v) => { setPaginated(v); if (v) setVirtualScroll(false) }} />
              {paginated && !virtualScroll && (
                <OptionGroup
                  label="Page Size"
                  options={['5', '10', '25', '50'] as const}
                  value={String(pageSize) as '10'}
                  onChange={v => setPageSize(Number(v))}
                />
              )}
              <Toggle label="Virtual Scroll" checked={virtualScroll} onChange={(v) => { setVirtualScroll(v); if (v) setPaginated(false) }} />
              {virtualScroll && (
                <OptionGroup
                  label="Row Count"
                  options={['100', '1K', '10K', '100K'] as const}
                  value={virtualRowCount === 100 ? '100' : virtualRowCount === 1000 ? '1K' : virtualRowCount === 10000 ? '10K' : '100K'}
                  onChange={v => setVirtualRowCount(v === '100' ? 100 : v === '1K' ? 1000 : v === '10K' ? 10000 : 100000)}
                />
              )}
              <Toggle label="Selectable" checked={selectable} onChange={setSelectable} />
              <Toggle label="Resizable" checked={resizable} onChange={setResizable} />
              <Toggle label="Reorderable" checked={reorderable} onChange={setReorderable} />
              <Toggle label="Auto-size" checked={autoSize} onChange={setAutoSize} />
              <Toggle label="Sticky Header" checked={stickyHeader} onChange={setStickyHeader} />
            </div>
          </div>

          {/* Export & Appearance */}
          <div className="datatable-page__control-group">
            <span className="datatable-page__control-label">Export & Appearance</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Exportable" checked={exportable} onChange={setExportable} />
              <Toggle label="Striped" checked={striped} onChange={setStriped} />
              <Toggle label="Compact" checked={compact} onChange={setCompact} />
              <Toggle label="Bordered" checked={bordered} onChange={setBordered} />
              <OptionGroup
                label="Responsive"
                options={['scroll', 'card'] as const}
                value={responsiveMode}
                onChange={setResponsiveMode}
              />
            </div>
          </div>
        </div>

        {/* Table preview */}
        <div style={virtualScroll ? { height: 400, position: 'relative' as const } : undefined}>
          <DataTable {...tableProps as any} />
        </div>

        {/* Code tabs */}
        <div className="datatable-page__code-tabs">
          <div className="datatable-page__export-row">
            <Button
              size="xs"
              variant="secondary"
              icon={<Icon name="copy" size="sm" />}
              onClick={() => {
                navigator.clipboard?.writeText(activeCode).then(() => {
                  setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                  setTimeout(() => setCopyStatus(''), 2000)
                })
              }}
            >
              Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
            </Button>
            {copyStatus && <span className="datatable-page__export-status">{copyStatus}</span>}
          </div>
          <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
            <TabPanel tabId="react">
              <CopyBlock code={reactCode} language="typescript" showLineNumbers />
            </TabPanel>
            <TabPanel tabId="html">
              <CopyBlock code={htmlCode} language="html" showLineNumbers />
            </TabPanel>
            <TabPanel tabId="vue">
              <CopyBlock code={vueCode} language="html" showLineNumbers />
            </TabPanel>
            <TabPanel tabId="angular">
              <CopyBlock code={angularCode} language="html" showLineNumbers />
            </TabPanel>
            <TabPanel tabId="svelte">
              <CopyBlock code={svelteCode} language="html" showLineNumbers />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DataTablePage() {
  useStyles('datatable-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  // Large datasets — memoized so they're stable across renders
  const virtualScrollData = useMemo(() => generateLargeDataset(100000), [])
  const pinnedData = useMemo(() => sampleData.slice(0, 8), [])

  // Editable demo state
  const [editDemoData, setEditDemoData] = useState<Server[]>(() => sampleData.slice(0, 5))
  const handleEditDemoCellEdit = useCallback((rowIndex: number, columnId: string, value: unknown) => {
    setEditDemoData(prev => prev.map((row, i) => i === rowIndex ? { ...row, [columnId]: value } : row))
  }, [])

  // Theme
  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.datatable-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  // Pinned columns demo
  const pinnedColumns: ColumnDef<Server>[] = [
    { id: 'hostname', header: 'Hostname', accessor: 'hostname', sortable: true, pinned: 'left', width: 180 },
    { id: 'ip', header: 'IP Address', accessor: 'ip', width: 140 },
    { id: 'region', header: 'Region', accessor: 'region', sortable: true, width: 120 },
    { id: 'os', header: 'OS', accessor: 'os', width: 140 },
    { id: 'cpu', header: 'CPU %', accessor: 'cpu', sortable: true, width: 150, cell: (v) => <PercentBar value={v as number} /> },
    { id: 'memory', header: 'Memory %', accessor: 'memory', sortable: true, width: 150, cell: (v) => <PercentBar value={v as number} /> },
    { id: 'disk', header: 'Disk %', accessor: 'disk', sortable: true, width: 150, cell: (v) => <PercentBar value={v as number} thresholds={[70, 85]} /> },
    { id: 'uptime', header: 'Uptime', accessor: 'uptime', width: 100 },
    { id: 'status', header: 'Status', accessor: 'status', pinned: 'right', width: 120, cell: (v) => <StatusBadge status={v as string} /> },
  ]

  return (
    <div className="datatable-page" style={themeStyle}>
      {/* ── 1. Hero ─────────────────────────────────────── */}
      <div className="datatable-page__hero">
        <h1 className="datatable-page__title">DataTable</h1>
        <p className="datatable-page__desc">
          Enterprise-grade data grid with AG Grid-level features and zero dependencies.
          Virtual scrolling for 100K+ rows, per-column filters, row grouping with aggregation,
          inline cell editing, pinned columns, server-side mode, and CSV/JSON export.
        </p>
        <div className="datatable-page__import-row">
          <code className="datatable-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ───────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Virtual Scrolling ─────────────────────────── */}
      <section className="datatable-page__section" id="virtual-scroll">
        <h2 className="datatable-page__section-title">
          <a href="#virtual-scroll">Virtual Scrolling -- 100,000 Rows</a>
        </h2>
        <p className="datatable-page__section-desc">
          Smooth 60fps scrolling with only ~50 DOM nodes rendered at any time.
          The virtual scroll engine calculates visible rows based on scroll position and row height,
          rendering just what's on screen plus a small buffer.
        </p>
        <div style={{ height: 400 }}>
          <DataTable
            data={virtualScrollData}
            columns={basicColumns}
            virtualScroll
            rowHeight={36}
            stickyHeader
            sortable
          />
        </div>
        <div className="datatable-page__info-bar">
          <span>Total rows: <strong>100,000</strong></span>
          <span>Rendered: <strong>~50</strong></span>
          <span>Row height: <strong>36px</strong></span>
          <span>Zero lag, zero jank</span>
        </div>
        <CopyBlock
          code={`<DataTable
  data={largeDataset}   // 100,000 rows
  columns={columns}
  virtualScroll
  rowHeight={36}
  stickyHeader
  style={{ height: 400 }}
/>`}
          language="typescript"
        />
      </section>

      {/* ── 4. Per-Column Filters ────────────────────────── */}
      <section className="datatable-page__section" id="filters">
        <h2 className="datatable-page__section-title">
          <a href="#filters">Per-Column Filters</a>
        </h2>
        <p className="datatable-page__section-desc">
          Each column can have its own filter with type-aware controls: text search, number range,
          or select dropdown. Filter types are inferred from the column's <code>filterType</code> property.
          Click the filter icon in any column header.
        </p>
        <DataTable
          data={sampleData}
          columns={fullColumns}
          filterable
          sortable
          stickyHeader
          paginated
          pageSize={10}
        />
        <CopyBlock
          code={`const columns: ColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname',
    filterable: true },
  { id: 'region', header: 'Region', accessor: 'region',
    filterable: true, filterType: 'select' },
  { id: 'cpu', header: 'CPU %', accessor: 'cpu',
    filterable: true, filterType: 'number' },
]

<DataTable data={servers} columns={columns} filterable />`}
          language="typescript"
        />
      </section>

      {/* ── 5. Row Grouping & Aggregation ────────────────── */}
      <section className="datatable-page__section" id="grouping">
        <h2 className="datatable-page__section-title">
          <a href="#grouping">Row Grouping & Aggregation</a>
        </h2>
        <p className="datatable-page__section-desc">
          Group rows by any column and display aggregated values (count, sum, avg, min, max)
          in group headers. Click a group header to expand/collapse.
        </p>
        <DataTable
          data={sampleData}
          columns={fullColumns}
          groupBy="region"
          aggregations={{ cpu: 'avg', memory: 'avg', disk: 'sum' }}
          sortable
          stickyHeader
        />
        <CopyBlock
          code={`<DataTable
  data={servers}
  columns={columns}
  groupBy="region"
  aggregations={{
    cpu: 'avg',
    memory: 'avg',
    disk: 'sum',
  }}
/>`}
          language="typescript"
        />
      </section>

      {/* ── 6. Cell Editing ──────────────────────────────── */}
      <section className="datatable-page__section" id="editing">
        <h2 className="datatable-page__section-title">
          <a href="#editing">Cell Editing</a>
        </h2>
        <p className="datatable-page__section-desc">
          Double-click any editable cell to edit its value inline. The <code>onCellEdit</code> callback
          receives the row index, column ID, and new value. Mark columns as editable in their definition.
        </p>
        <DataTable
          data={editDemoData}
          columns={[
            { id: 'hostname', header: 'Hostname', accessor: 'hostname', editable: true },
            { id: 'ip', header: 'IP Address', accessor: 'ip', editable: true },
            { id: 'region', header: 'Region', accessor: 'region', editable: true },
            { id: 'cpu', header: 'CPU %', accessor: 'cpu', editable: true, cell: (v) => <PercentBar value={v as number} /> },
            { id: 'memory', header: 'Memory %', accessor: 'memory', editable: true, cell: (v) => <PercentBar value={v as number} /> },
            { id: 'status', header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v as string} /> },
          ]}
          editable
          onCellEdit={handleEditDemoCellEdit}
          stickyHeader
          bordered
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
          Try double-clicking on hostname, IP, region, CPU, or memory cells above.
        </p>
        <CopyBlock
          code={`const [data, setData] = useState(servers)

<DataTable
  data={data}
  columns={[
    { id: 'hostname', header: 'Hostname', accessor: 'hostname',
      editable: true },
    { id: 'cpu', header: 'CPU %', accessor: 'cpu',
      editable: true },
  ]}
  editable
  onCellEdit={(rowIndex, columnId, value) => {
    setData(prev => prev.map((row, i) =>
      i === rowIndex ? { ...row, [columnId]: value } : row
    ))
  }}
/>`}
          language="typescript"
        />
      </section>

      {/* ── 7. Server-Side Mode ──────────────────────────── */}
      <section className="datatable-page__section" id="server-side">
        <h2 className="datatable-page__section-title">
          <a href="#server-side">Server-Side Mode</a>
        </h2>
        <p className="datatable-page__section-desc">
          For large datasets or real-time data, use server-side mode. The DataTable delegates
          all sorting, filtering, searching, and pagination to your server. It calls
          <code> onFetchData</code> whenever the user interacts, passing the current state.
        </p>
        <CopyBlock
          code={`const [data, setData] = useState<Server[]>([])
const [loading, setLoading] = useState(false)
const [totalRows, setTotalRows] = useState(0)

<DataTable
  data={data}
  columns={columns}
  serverSide
  totalRows={totalRows}
  loading={loading}
  paginated
  pageSize={25}
  searchable
  sortable
  filterable
  onFetchData={async ({ page, pageSize, sortBy, filters, search }) => {
    setLoading(true)
    const res = await fetch(\`/api/servers?\${new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: JSON.stringify(sortBy),
      filters: JSON.stringify(filters),
      search,
    })}\`)
    const { rows, total } = await res.json()
    setData(rows)
    setTotalRows(total)
    setLoading(false)
  }}
/>`}
          language="typescript"
        />
        <div className="datatable-page__info-bar">
          <span><strong>serverSide</strong> disables client-side processing</span>
          <span><strong>totalRows</strong> enables proper pagination</span>
          <span><strong>onFetchData</strong> receives all query params</span>
        </div>
      </section>

      {/* ── 8. Pinned Columns ────────────────────────────── */}
      <section className="datatable-page__section" id="pinned">
        <h2 className="datatable-page__section-title">
          <a href="#pinned">Pinned Columns</a>
        </h2>
        <p className="datatable-page__section-desc">
          Pin columns to the left or right edge so they stay visible while scrolling horizontally.
          Set <code>pinned: 'left'</code> or <code>pinned: 'right'</code> in the column definition.
        </p>
        <div style={{ overflowX: 'auto' as const }}>
          <DataTable
            data={pinnedData}
            columns={pinnedColumns}
            sortable
            stickyHeader
            bordered
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
          Hostname is pinned left, Status is pinned right. Scroll horizontally to see them stick.
        </p>
        <CopyBlock
          code={`const columns: ColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname',
    pinned: 'left', width: 180 },
  // ... middle columns scroll freely ...
  { id: 'status', header: 'Status', accessor: 'status',
    pinned: 'right', width: 120 },
]`}
          language="typescript"
        />
      </section>

      {/* ── 9. Weight Tiers ──────────────────────────────── */}
      <section className="datatable-page__section" id="tiers">
        <h2 className="datatable-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="datatable-page__section-desc">
          Choose the right balance of features and bundle size for your use case.
        </p>

        <div className="datatable-page__tiers">
          {/* Lite */}
          <div
            className={`datatable-page__tier-card${tier === 'lite' ? ' datatable-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="datatable-page__tier-header">
              <span className="datatable-page__tier-name">Lite</span>
              <span className="datatable-page__tier-size">~3 KB</span>
            </div>
            <p className="datatable-page__tier-desc">
              Static table with sort and search. No virtual scroll, grouping, or editing.
            </p>
            <div className="datatable-page__tier-import">
              {IMPORT_STRINGS.lite}
            </div>
            <div className="datatable-page__tier-features">
              <span>Sort, Search, Paginate, Export</span>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`datatable-page__tier-card${tier === 'standard' ? ' datatable-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="datatable-page__tier-header">
              <span className="datatable-page__tier-name">Standard</span>
              <span className="datatable-page__tier-size">~6 KB</span>
            </div>
            <p className="datatable-page__tier-desc">
              Full-featured grid: virtual scroll, filters, grouping, editing,
              column resize/reorder, pinned columns.
            </p>
            <div className="datatable-page__tier-import">
              {IMPORT_STRINGS.standard}
            </div>
            <div className="datatable-page__tier-features">
              <span>All Lite + Virtual Scroll, Filters, Grouping, Editing, Pinning</span>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`datatable-page__tier-card${tier === 'premium' ? ' datatable-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="datatable-page__tier-header">
              <span className="datatable-page__tier-name">Premium</span>
              <span className="datatable-page__tier-size">~8 KB</span>
            </div>
            <p className="datatable-page__tier-desc">
              Everything in Standard plus animated row transitions,
              drag-to-select, and advanced server-side with infinite scroll.
            </p>
            <div className="datatable-page__tier-import">
              {IMPORT_STRINGS.premium}
            </div>
            <div className="datatable-page__tier-features">
              <span>All Standard + Row Animations, Drag Select, Infinite Scroll</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Brand Color ──────────────────────────────── */}
      <section className="datatable-page__section" id="brand-color">
        <h2 className="datatable-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="datatable-page__section-desc">
          Pick a brand color to see the DataTable theme update in real-time. Sort indicators,
          selection highlights, filter accents, and focus rings all adapt automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1', '#f97316', '#f43f5e', '#0ea5e9', '#10b981', '#8b5cf6', '#d946ef', '#f59e0b', '#06b6d4', '#64748b']}
          />
          <div className="datatable-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`datatable-page__color-preset${brandColor === p.hex ? ' datatable-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 11. Props API ────────────────────────────────── */}
      <section className="datatable-page__section" id="props">
        <h2 className="datatable-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="datatable-page__section-desc">
          All props accepted by DataTable. It also spreads any native div HTML attributes
          onto the wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dataTableProps} />
        </Card>
      </section>

      {/* ── 12. Accessibility ────────────────────────────── */}
      <section className="datatable-page__section" id="accessibility">
        <h2 className="datatable-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="datatable-page__section-desc">
          Built with WAI-ARIA grid pattern for full keyboard navigation and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="datatable-page__a11y-list">
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Grid Role:</strong> Uses <code className="datatable-page__a11y-key">role="grid"</code> with
                <code className="datatable-page__a11y-key"> role="row"</code> and
                <code className="datatable-page__a11y-key"> role="gridcell"</code> for proper semantics.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Arrow Keys:</strong> Navigate between cells with
                <code className="datatable-page__a11y-key"> Arrow</code> keys.
                <code className="datatable-page__a11y-key"> Home</code> / <code className="datatable-page__a11y-key">End</code> for row start/end.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Sort:</strong> Column headers announce sort state via
                <code className="datatable-page__a11y-key"> aria-sort</code>. Sortable headers have
                <code className="datatable-page__a11y-key"> role="columnheader"</code>.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Selection:</strong> Checkboxes use
                <code className="datatable-page__a11y-key"> aria-checked</code> with
                <code className="datatable-page__a11y-key"> Space</code> to toggle.
                Select-all checkbox uses indeterminate state.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Editing:</strong> <code className="datatable-page__a11y-key">Enter</code> or
                <code className="datatable-page__a11y-key"> F2</code> to start editing.
                <code className="datatable-page__a11y-key"> Escape</code> to cancel,
                <code className="datatable-page__a11y-key"> Enter</code> to confirm.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow.
                Focus management preserves position across re-renders and virtual scroll.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live Regions:</strong> Row count, filter results, and page changes
                announced via <code className="datatable-page__a11y-key">aria-live="polite"</code>.
              </span>
            </li>
            <li className="datatable-page__a11y-item">
              <span className="datatable-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High Contrast:</strong> Supports <code className="datatable-page__a11y-key">forced-colors: active</code> with
                visible borders and system color tokens.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
