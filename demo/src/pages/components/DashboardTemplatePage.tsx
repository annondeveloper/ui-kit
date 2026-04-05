'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DashboardTemplate, type DashboardMetric, type DashboardSection } from '@ui/domain/dashboard-template'
import { DashboardTemplate as LiteDashboardTemplate } from '@ui/lite/dashboard-template'
import { DashboardTemplate as PremiumDashboardTemplate } from '@ui/premium/dashboard-template'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ─────────────────────────────────────────────────────────────

const sampleMetrics: DashboardMetric[] = [
  { id: 'cpu', title: 'CPU Usage', value: '42%', status: 'ok', trend: 'up', change: { value: 3.2, period: 'last hour' }, sparkline: [30, 35, 42, 38, 40, 42] },
  { id: 'mem', title: 'Memory', value: '7.2 GB', status: 'warning', trend: 'up', change: { value: 12, period: 'last hour' }, sparkline: [50, 55, 60, 65, 70, 72] },
  { id: 'disk', title: 'Disk I/O', value: '145 MB/s', status: 'ok', trend: 'flat' },
  { id: 'net', title: 'Network', value: '2.4 Gbps', status: 'ok', trend: 'down', change: { value: -5, period: 'last hour' } },
  { id: 'errors', title: 'Error Rate', value: '0.02%', status: 'ok', trend: 'down', change: { value: -80, period: 'yesterday' } },
]

const sampleSections: DashboardSection[] = [
  { id: 'chart', title: 'CPU Over Time', content: <div style={{ height: 200, background: 'var(--bg-hover)', borderRadius: 8 }} />, span: 2 },
  { id: 'logs', title: 'Recent Logs', content: <div style={{ height: 150, background: 'var(--bg-hover)', borderRadius: 8 }} /> },
  { id: 'alerts', title: 'Active Alerts', content: <div style={{ height: 100, background: 'var(--bg-hover)', borderRadius: 8 }} />, collapsible: true },
]

const sampleSidebar = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '0.5rem' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Quick Actions</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <div>Restart services</div>
        <div>Clear cache</div>
        <div>View logs</div>
      </div>
    </div>
    <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '0.5rem' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h4>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
        <div>Deploy completed 5m ago</div>
        <div>Alert cleared 12m ago</div>
        <div>Config updated 1h ago</div>
      </div>
    </div>
  </div>
)

const previewMetrics: DashboardMetric[] = [
  { id: 'cpu', title: 'CPU', value: '42%', status: 'ok' },
  { id: 'mem', title: 'Mem', value: '7 GB', status: 'warning' },
]

const previewSections: DashboardSection[] = [
  { id: 's1', title: 'Overview', content: <div style={{ height: 60, background: 'var(--bg-hover)', borderRadius: 6 }} /> },
]

const litePreviewMetrics = [
  { title: 'CPU', value: '42%' },
  { title: 'Mem', value: '7 GB' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.dashboard-template-page) {
      :scope {
        max-inline-size: min(1100px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: dashboard-template-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .dashboard-template-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .dashboard-template-page__hero::before {
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
        animation: dt-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dt-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dashboard-template-page__hero::before { animation: none; }
      }

      .dashboard-template-page__title {
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

      .dashboard-template-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .dashboard-template-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dashboard-template-page__import-code {
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

      /* ── Sections ─────────────────────────────────── */

      .dashboard-template-page__section {
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
        animation: dt-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dt-page-section-reveal {
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
        .dashboard-template-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .dashboard-template-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .dashboard-template-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .dashboard-template-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .dashboard-template-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────── */

      .dashboard-template-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .dashboard-template-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────── */

      .dashboard-template-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container dashboard-template-page (max-width: 720px) {
        .dashboard-template-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .dashboard-template-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dashboard-template-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .dashboard-template-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .dashboard-template-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .dashboard-template-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dashboard-template-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dashboard-template-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .dashboard-template-page__option-btn {
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
      .dashboard-template-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .dashboard-template-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .dashboard-template-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Weight Tier Cards ─────────────────────── */

      .dashboard-template-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .dashboard-template-page__tier-card {
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

      .dashboard-template-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .dashboard-template-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .dashboard-template-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dashboard-template-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .dashboard-template-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .dashboard-template-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .dashboard-template-page__tier-import {
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

      .dashboard-template-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        max-block-size: 220px;
        overflow: hidden;
        border-radius: var(--radius-sm);
        transform: scale(0.72);
        transform-origin: top center;
      }

      /* ── Code tabs ─────────────────────────────── */

      .dashboard-template-page__code-tabs {
        margin-block-start: 1rem;
      }

      .dashboard-template-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .dashboard-template-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ─────────────────────────────── */

      .dashboard-template-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .dashboard-template-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .dashboard-template-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ──────────────────────────── */

      .dashboard-template-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .dashboard-template-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown ────────────────────────── */

      .dashboard-template-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .dashboard-template-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ────────────────────────────── */

      @media (max-width: 768px) {
        .dashboard-template-page__hero { padding: 2rem 1.25rem; }
        .dashboard-template-page__title { font-size: 1.75rem; }
        .dashboard-template-page__playground { grid-template-columns: 1fr; }
        .dashboard-template-page__tiers { grid-template-columns: 1fr; }
        .dashboard-template-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .dashboard-template-page__hero { padding: 1.5rem 1rem; }
        .dashboard-template-page__title { font-size: 1.5rem; }
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const dashboardTemplateProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', description: 'Dashboard title displayed in the header.' },
  { name: 'subtitle', type: 'string', description: 'Subtitle shown below the title.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'", description: 'Dashboard status shown as a badge in the header.' },
  { name: 'lastUpdated', type: 'number | Date', description: 'Timestamp shown as relative time in header.' },
  { name: 'metrics', type: 'DashboardMetric[]', description: 'Array of metrics displayed in the horizontal strip.' },
  { name: 'sections', type: 'DashboardSection[]', description: 'Array of content sections in the main grid.' },
  { name: 'columns', type: '1 | 2 | 3', default: '2', description: 'Number of columns in the main content grid.' },
  { name: 'sidebar', type: 'ReactNode', description: 'Sidebar content. Renders a 280px fixed-width panel.' },
  { name: 'sidebarPosition', type: "'left' | 'right'", default: "'right'", description: 'Position of the sidebar panel.' },
  { name: 'sidebarCollapsible', type: 'boolean', default: 'false', description: 'Show toggle button to collapse the sidebar.' },
  { name: 'actions', type: 'ReactNode', description: 'Action buttons rendered in the header.' },
  { name: 'autoRefresh', type: 'number', description: 'Auto-refresh interval in milliseconds.' },
  { name: 'onRefresh', type: '() => void', description: 'Callback fired on each auto-refresh tick.' },
  { name: 'headerHeight', type: 'number | string', description: 'Custom header height (number in px or CSS string).' },
  { name: 'metricsScrollable', type: 'boolean', default: 'true', description: 'Enable horizontal scroll-snap for the metrics strip.' },
  { name: 'sidebarWidth', type: 'number | string', default: '280px', description: 'Custom sidebar width (number in px or CSS string).' },
  { name: 'variant', type: "'default' | 'compact' | 'fullscreen'", default: "'default'", description: 'Layout density variant. Compact reduces padding/fonts, fullscreen stretches to edges.' },
  { name: 'showBreadcrumb', type: 'ReactNode', description: 'Breadcrumb content rendered above the title.' },
  { name: 'showStatusBar', type: 'boolean', default: 'false', description: 'Show a status bar below the header.' },
  { name: 'statusBarContent', type: 'ReactNode', description: 'Custom status bar content. Defaults to auto-generated text from status prop.' },
  { name: 'onSectionToggle', type: '(sectionId: string, collapsed: boolean) => void', description: 'Callback when a collapsible section is toggled.' },
  { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Make the header sticky on scroll.' },
  { name: 'metricsLayout', type: "'row' | 'grid'", default: "'row'", description: 'Metrics layout: row (horizontal scroll) or grid (wrapping).' },
  { name: 'onMetricClick', type: '(metric: DashboardMetric) => void', description: 'Makes metric cards clickable. Fires with the clicked metric.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

const metricProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique metric identifier.' },
  { name: 'title', type: 'string', required: true, description: 'Metric label displayed above the value.' },
  { name: 'value', type: 'ReactNode', required: true, description: 'The metric value (string, number, or element).' },
  { name: 'change', type: '{ value: number; period?: string }', description: 'Change indicator with percentage and optional period text.' },
  { name: 'trend', type: "'up' | 'down' | 'flat'", description: 'Trend direction controlling the arrow and color.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical'", description: 'Status controlling border color of the metric card.' },
  { name: 'sparkline', type: 'number[]', description: 'Array of values rendered as an inline sparkline SVG.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon displayed next to the metric title.' },
]

const sectionProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique section identifier.' },
  { name: 'title', type: 'string', required: true, description: 'Section heading text.' },
  { name: 'description', type: 'string', description: 'Brief description shown next to the title.' },
  { name: 'collapsible', type: 'boolean', description: 'Makes the section collapsible with a chevron toggle.' },
  { name: 'defaultCollapsed', type: 'boolean', description: 'Start collapsed when collapsible is true.' },
  { name: 'content', type: 'ReactNode', required: true, description: 'Section body content.' },
  { name: 'span', type: '1 | 2 | 3', default: '1', description: 'Grid column span for this section.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'

const COLUMN_OPTIONS = ['1', '2', '3'] as const
const STATUS_OPTIONS: Status[] = ['ok', 'warning', 'critical', 'unknown', 'maintenance']
const SIDEBAR_POS_OPTIONS = ['left', 'right'] as const
const VARIANT_OPTIONS = ['default', 'compact', 'fullscreen'] as const
const METRICS_LAYOUT_OPTIONS = ['row', 'grid'] as const
const MOTION_OPTIONS = ['0', '1', '2', '3'] as const
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DashboardTemplate } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DashboardTemplate } from '@annondeveloper/ui-kit'",
  premium: "import { DashboardTemplate } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
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
    <div className="dashboard-template-page__control-group">
      <span className="dashboard-template-page__control-label">{label}</span>
      <div className="dashboard-template-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`dashboard-template-page__option-btn${opt === value ? ' dashboard-template-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="dashboard-template-page__toggle-label">
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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  columns: number,
  sidebarPosition: string,
  sidebarCollapsible: boolean,
  status: Status,
  variant: string = 'default',
  stickyHeader: boolean = false,
  metricsLayout: string = 'row',
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  title="System Dashboard"',
    `  status="${status}"`,
    '  lastUpdated={Date.now()}',
    '  metrics={metrics}',
    '  sections={sections}',
  ]
  if (columns !== 2) props.push(`  columns={${columns}}`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (stickyHeader) props.push('  stickyHeader')
  if (metricsLayout !== 'row') props.push(`  metricsLayout="${metricsLayout}"`)
  if (sidebarPosition !== 'right') props.push(`  sidebarPosition="${sidebarPosition}"`)
  if (sidebarCollapsible) props.push('  sidebarCollapsible')
  props.push('  sidebar={<Sidebar />}')

  return `${importStr}

const metrics = [
  { id: 'cpu', title: 'CPU Usage', value: '42%', status: 'ok', trend: 'up',
    change: { value: 3.2, period: 'last hour' }, sparkline: [30, 35, 42, 38, 40, 42] },
  { id: 'mem', title: 'Memory', value: '7.2 GB', status: 'warning', trend: 'up' },
]

const sections = [
  { id: 'chart', title: 'CPU Over Time', content: <Chart />, span: 2 },
  { id: 'logs', title: 'Recent Logs', content: <LogList /> },
]

<DashboardTemplate
${props.join('\n')}
/>`
}

function generateHtmlCode(status: Status): string {
  return `<!-- DashboardTemplate — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/dashboard-template.css">

<div class="ui-dashboard-template" data-columns="2" role="group"
     aria-label="Dashboard: System Dashboard">
  <div class="ui-dashboard-template__header">
    <div class="ui-dashboard-template__title-group">
      <h2 class="ui-dashboard-template__title">System Dashboard</h2>
    </div>
    <span class="ui-dashboard-template__status-badge" data-status="${status}">
      <span class="ui-dashboard-template__status-dot"></span>
      ${status}
    </span>
  </div>
  <div class="ui-dashboard-template__metrics" role="list">
    <div class="ui-dashboard-template__metric" role="listitem">
      <span class="ui-dashboard-template__metric-title">CPU Usage</span>
      <span class="ui-dashboard-template__metric-value">42%</span>
    </div>
  </div>
  <div class="ui-dashboard-template__body" data-sidebar="right">
    <div class="ui-dashboard-template__main">
      <!-- sections -->
    </div>
    <aside class="ui-dashboard-template__sidebar">
      <!-- sidebar -->
    </aside>
  </div>
</div>`
}

function generateVueCode(tier: Tier, columns: number, status: Status): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  return `<template>
  <DashboardTemplate
    title="System Dashboard"
    status="${status}"
    :metrics="metrics"
    :sections="sections"
    :columns="${columns}"
    :sidebar="sidebar"
  />
</template>

<script setup>
import { DashboardTemplate } from '${importPath}'

const metrics = [
  { id: 'cpu', title: 'CPU Usage', value: '42%', status: 'ok', trend: 'up' },
  { id: 'mem', title: 'Memory', value: '7.2 GB', status: 'warning', trend: 'up' },
]

const sections = [
  { id: 'chart', title: 'CPU Over Time', content: '<Chart />', span: 2 },
  { id: 'logs', title: 'Recent Logs', content: '<LogList />' },
]
</script>`
}

function generateAngularCode(status: Status): string {
  return `<!-- Angular — CSS-only approach -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/dashboard-template.css">

<div class="ui-dashboard-template" data-columns="2" role="group"
     aria-label="Dashboard: System Dashboard">
  <div class="ui-dashboard-template__header">
    <h2 class="ui-dashboard-template__title">System Dashboard</h2>
    <span class="ui-dashboard-template__status-badge" data-status="${status}">
      ${status}
    </span>
  </div>
  <div class="ui-dashboard-template__metrics" role="list">
    <div *ngFor="let m of metrics" class="ui-dashboard-template__metric" role="listitem">
      <span class="ui-dashboard-template__metric-title">{{ m.title }}</span>
      <span class="ui-dashboard-template__metric-value">{{ m.value }}</span>
    </div>
  </div>
  <div class="ui-dashboard-template__body" data-sidebar="right">
    <div class="ui-dashboard-template__main">
      <ng-content></ng-content>
    </div>
    <aside class="ui-dashboard-template__sidebar">
      <ng-content select="[sidebar]"></ng-content>
    </aside>
  </div>
</div>

<style>
@import '@annondeveloper/ui-kit/css/components/dashboard-template.css';
</style>`
}

function generateSvelteCode(tier: Tier, columns: number, status: Status): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  return `<script>
  import { DashboardTemplate } from '${importPath}';

  const metrics = [
    { id: 'cpu', title: 'CPU Usage', value: '42%', status: 'ok', trend: 'up' },
    { id: 'mem', title: 'Memory', value: '7.2 GB', status: 'warning', trend: 'up' },
  ];

  const sections = [
    { id: 'chart', title: 'CPU Over Time', content: 'Chart', span: 2 },
    { id: 'logs', title: 'Recent Logs', content: 'LogList' },
  ];
</script>

<DashboardTemplate
  title="System Dashboard"
  status="${status}"
  {metrics}
  {sections}
  columns={${columns}}
/>`
}

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [columns, setColumns] = useState<1 | 2 | 3>(2)
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('right')
  const [sidebarCollapsible, setSidebarCollapsible] = useState(false)
  const [status, setStatus] = useState<Status>('ok')
  const [showSidebar, setShowSidebar] = useState(true)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const [variant, setVariant] = useState<'default' | 'compact' | 'fullscreen'>('default')
  const [stickyHeader, setStickyHeader] = useState(false)
  const [metricsLayout, setMetricsLayout] = useState<'row' | 'grid'>('row')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [showStatusBar, setShowStatusBar] = useState(false)
  const [showBreadcrumb, setShowBreadcrumb] = useState(false)
  const [clickableMetrics, setClickableMetrics] = useState(false)
  const [clickedMetric, setClickedMetric] = useState('')

  const Component = tier === 'lite'
    ? (props: any) => <LiteDashboardTemplate {...props} />
    : tier === 'premium'
    ? PremiumDashboardTemplate
    : DashboardTemplate

  const reactCode = useMemo(
    () => generateReactCode(tier, columns, sidebarPosition, sidebarCollapsible, status, variant, stickyHeader, metricsLayout),
    [tier, columns, sidebarPosition, sidebarCollapsible, status, variant, stickyHeader, metricsLayout],
  )
  const htmlCode = useMemo(() => generateHtmlCode(status), [status])
  const vueCode = useMemo(() => generateVueCode(tier, columns, status), [tier, columns, status])
  const angularCode = useMemo(() => generateAngularCode(status), [status])
  const svelteCode = useMemo(() => generateSvelteCode(tier, columns, status), [tier, columns, status])

  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const codeMap: Record<string, string> = { react: reactCode, html: htmlCode, vue: vueCode, angular: angularCode, svelte: svelteCode }
  const activeCode = codeMap[activeCodeTab] ?? reactCode

  const previewProps: Record<string, unknown> = {
    title: 'System Dashboard',
    subtitle: 'Production cluster monitoring',
    status,
    lastUpdated: Date.now() - 120000,
    actions: <Button size="sm" variant="secondary" icon={<Icon name="refresh" size="sm" />}>Refresh</Button>,
  }

  if (tier === 'lite') {
    // Lite tier simplified props
    return (
      <section className="dashboard-template-page__section" id="playground">
        <h2 className="dashboard-template-page__section-title">
          <a href="#playground">Live Playground</a>
        </h2>
        <p className="dashboard-template-page__section-desc">
          Configure the dashboard template in real-time. Adjust layout, status, and sidebar options.
        </p>
        <div className="dashboard-template-page__playground">
          <div className="dashboard-template-page__playground-preview">
            <div className="dashboard-template-page__playground-result">
              <LiteDashboardTemplate
                title="System Dashboard"
                metrics={sampleMetrics.slice(0, 3).map(m => ({ title: m.title, value: m.value }))}
                sections={sampleSections.slice(0, 2).map(s => ({ title: s.title, content: s.content }))}
                sidebar={showSidebar ? sampleSidebar : undefined}
              />
            </div>
            <div className="dashboard-template-page__code-tabs">
              <CopyBlock code={reactCode} language="typescript" showLineNumbers />
            </div>
          </div>
          <div className="dashboard-template-page__playground-controls">
            <Toggle label="Show sidebar" checked={showSidebar} onChange={setShowSidebar} />
          </div>
        </div>
      </section>
    )
  }

  // Standard/Premium props
  Object.assign(previewProps, {
    metrics: sampleMetrics,
    sections: sampleSections,
    columns,
    sidebar: showSidebar ? sampleSidebar : undefined,
    sidebarPosition,
    sidebarCollapsible,
    autoRefresh: autoRefreshEnabled ? 5000 : undefined,
    onRefresh: autoRefreshEnabled ? () => setRefreshCount(c => c + 1) : undefined,
    variant,
    stickyHeader,
    metricsLayout,
    showStatusBar,
    showBreadcrumb: showBreadcrumb ? <span>Home / Monitoring / <strong>Dashboard</strong></span> : undefined,
    onMetricClick: clickableMetrics ? (m: DashboardMetric) => setClickedMetric(m.title) : undefined,
    motion,
  })

  return (
    <section className="dashboard-template-page__section" id="playground">
      <h2 className="dashboard-template-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="dashboard-template-page__section-desc">
        Configure the dashboard template in real-time. Adjust layout, status, and sidebar options.
      </p>

      <div className="dashboard-template-page__playground">
        <div className="dashboard-template-page__playground-preview">
          <div className="dashboard-template-page__playground-result">
            <Component {...previewProps} />
          </div>

          <div className="dashboard-template-page__code-tabs">
            <div className="dashboard-template-page__export-row">
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
              {copyStatus && <span className="dashboard-template-page__export-status">{copyStatus}</span>}
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

        <div className="dashboard-template-page__playground-controls">
          <OptionGroup
            label="Variant"
            options={VARIANT_OPTIONS}
            value={variant}
            onChange={v => setVariant(v as 'default' | 'compact' | 'fullscreen')}
          />
          <OptionGroup
            label="Columns"
            options={COLUMN_OPTIONS}
            value={String(columns) as typeof COLUMN_OPTIONS[number]}
            onChange={v => setColumns(Number(v) as 1 | 2 | 3)}
          />
          <OptionGroup
            label="Sidebar"
            options={SIDEBAR_POS_OPTIONS}
            value={sidebarPosition}
            onChange={v => setSidebarPosition(v as 'left' | 'right')}
          />
          <OptionGroup
            label="Status"
            options={STATUS_OPTIONS as unknown as readonly string[]}
            value={status}
            onChange={v => setStatus(v as Status)}
          />
          <OptionGroup
            label="Metrics Layout"
            options={METRICS_LAYOUT_OPTIONS}
            value={metricsLayout}
            onChange={v => setMetricsLayout(v as 'row' | 'grid')}
          />
          <OptionGroup
            label="Motion"
            options={MOTION_OPTIONS}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <div className="dashboard-template-page__control-group">
            <span className="dashboard-template-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show sidebar" checked={showSidebar} onChange={setShowSidebar} />
              <Toggle label="Collapsible sidebar" checked={sidebarCollapsible} onChange={setSidebarCollapsible} />
              <Toggle label="Auto-refresh (5s)" checked={autoRefreshEnabled} onChange={setAutoRefreshEnabled} />
              <Toggle label="Sticky header" checked={stickyHeader} onChange={setStickyHeader} />
              <Toggle label="Status bar" checked={showStatusBar} onChange={setShowStatusBar} />
              <Toggle label="Breadcrumb" checked={showBreadcrumb} onChange={setShowBreadcrumb} />
              <Toggle label="Clickable metrics" checked={clickableMetrics} onChange={v => { setClickableMetrics(v); setClickedMetric('') }} />
            </div>
          </div>
          {autoRefreshEnabled && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Refresh count: {refreshCount}
            </div>
          )}
          {clickedMetric && (
            <div style={{ fontSize: '0.75rem', color: 'var(--brand)' }}>
              Clicked: {clickedMetric}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardTemplatePage() {
  useStyles('dashboard-template-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.dashboard-template-page__section')
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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

  return (
    <div className="dashboard-template-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="dashboard-template-page__hero">
        <h1 className="dashboard-template-page__title">DashboardTemplate</h1>
        <p className="dashboard-template-page__desc">
          Composable dashboard layout with metric strip, collapsible content sections in a responsive grid,
          optional sidebar, auto-refresh, and status indicators. Build monitoring dashboards in minutes.
        </p>
        <div className="dashboard-template-page__import-row">
          <code className="dashboard-template-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Tier Comparison Cards ──────────────────── */}
      <section className="dashboard-template-page__section" id="tiers">
        <h2 className="dashboard-template-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="dashboard-template-page__section-desc">
          Three weight tiers for different use cases. Lite for minimal bundles, Standard for full features,
          Premium for aurora effects and spring animations.
        </p>
        <div className="dashboard-template-page__tiers">
          {TIERS.map(t => (
            <div
              key={t.id}
              className={`dashboard-template-page__tier-card${tier === t.id ? ' dashboard-template-page__tier-card--active' : ''}`}
              onClick={() => setTier(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier(t.id) } }}
            >
              <div className="dashboard-template-page__tier-header">
                <span className="dashboard-template-page__tier-name">{t.label}</span>
                <span className="dashboard-template-page__tier-size">
                  {t.id === 'lite' ? '~0.8 KB' : t.id === 'standard' ? '~4.2 KB' : '~5.8 KB'}
                </span>
              </div>
              <p className="dashboard-template-page__tier-desc">
                {t.id === 'lite'
                  ? 'Inline styles only. No animation, no collapse, no auto-refresh. Minimal footprint for static dashboards.'
                  : t.id === 'standard'
                  ? 'Full-featured with CSS grid, collapsible sections, sidebar toggle, sparkline charts, auto-refresh with indicator.'
                  : 'Aurora glow on status, spring sidebar transitions, metric card shimmer, gradient section headers, particle effects.'
                }
              </p>
              <div className="dashboard-template-page__tier-import">
                {IMPORT_STRINGS[t.id]}
              </div>
              <div className="dashboard-template-page__size-breakdown">
                <div className="dashboard-template-page__size-row">
                  {t.id === 'lite' ? (
                    <>
                      <span>JSX: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                      <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                      <span>= <strong style={{ color: 'var(--brand)' }}>0.8 KB</strong> gzip</span>
                    </>
                  ) : t.id === 'standard' ? (
                    <>
                      <span>JSX: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                      <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                      <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
                    </>
                  ) : (
                    <>
                      <span>JSX: <strong style={{ color: 'var(--text-primary)' }}>3.6 KB</strong></span>
                      <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>2.2 KB</strong></span>
                      <span>= <strong style={{ color: 'var(--brand)' }}>5.8 KB</strong> gzip</span>
                    </>
                  )}
                </div>
              </div>
              <div className="dashboard-template-page__tier-preview">
                {t.id === 'lite' ? (
                  <LiteDashboardTemplate title="Server Overview" metrics={litePreviewMetrics}>
                    <div style={{ height: 40, background: 'var(--bg-hover)', borderRadius: 6 }} />
                  </LiteDashboardTemplate>
                ) : t.id === 'standard' ? (
                  <DashboardTemplate title="Server Overview" metrics={previewMetrics} sections={previewSections} />
                ) : (
                  <PremiumDashboardTemplate title="Server Overview" metrics={previewMetrics} sections={previewSections} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Props Table ────────────────────────────── */}
      <section className="dashboard-template-page__section" id="props">
        <h2 className="dashboard-template-page__section-title">
          <a href="#props">Props</a>
        </h2>
        <p className="dashboard-template-page__section-desc">
          Complete API reference for DashboardTemplate, DashboardMetric, and DashboardSection.
        </p>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          DashboardTemplateProps
        </h3>
        <PropsTable props={dashboardTemplateProps} />

        <h3 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          DashboardMetric
        </h3>
        <PropsTable props={metricProps} />

        <h3 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          DashboardSection
        </h3>
        <PropsTable props={sectionProps} />
      </section>

      {/* ── 5. Accessibility ──────────────────────────── */}
      <section className="dashboard-template-page__section" id="accessibility">
        <h2 className="dashboard-template-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="dashboard-template-page__section-desc">
          Built with semantic HTML and ARIA patterns for screen reader and keyboard accessibility.
        </p>
        <ul className="dashboard-template-page__a11y-list">
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>role="group"</strong> with aria-label on the root element for screen reader context.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>Semantic headings</strong> — h2 for title, h3 for section headings, proper heading hierarchy.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>Metric list</strong> — role="list" with role="listitem" for screen reader enumeration.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>Collapsible sections</strong> — aria-expanded on toggle buttons with descriptive aria-label.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>Sidebar toggle</strong> — aria-expanded with "Expand/Collapse sidebar" label.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>prefers-reduced-motion</strong> — all animations and transitions disabled.</span>
          </li>
          <li className="dashboard-template-page__a11y-item">
            <Icon name="check" size="sm" className="dashboard-template-page__a11y-icon" />
            <span><strong>forced-colors</strong> — borders and outlines adapt to high contrast mode.</span>
          </li>
        </ul>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="dashboard-template-page__section" id="brand-color">
        <h2 className="dashboard-template-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="dashboard-template-page__section-desc">
          Pick a brand color to see the dashboard update in real-time. Derived tokens are generated automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── Source ────────────────────────────────────── */}
      <section className="dashboard-template-page__section" id="source">
        <h2 className="dashboard-template-page__section-title"><a href="#source">Source</a></h2>
        <p className="dashboard-template-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="dashboard-template-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/dashboard-template.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/domain/dashboard-template.tsx (Standard)
          </a>
          <a className="dashboard-template-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/dashboard-template.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/dashboard-template.tsx (Lite)
          </a>
          <a className="dashboard-template-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/dashboard-template.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/dashboard-template.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
