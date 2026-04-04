'use client'

import {
  useRef,
  useState,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DashboardMetric {
  id: string
  title: string
  value: ReactNode
  change?: { value: number; period?: string }
  trend?: 'up' | 'down' | 'flat'
  status?: 'ok' | 'warning' | 'critical'
  sparkline?: number[]
  icon?: ReactNode
}

export interface DashboardSection {
  id: string
  title: string
  description?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  content: ReactNode
  span?: 1 | 2 | 3
}

export interface DashboardTemplateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'

  // Metric strip at top
  metrics?: DashboardMetric[]

  // Main content grid
  sections?: DashboardSection[]
  columns?: 1 | 2 | 3

  // Sidebar
  sidebar?: ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarCollapsible?: boolean

  // Actions
  actions?: ReactNode

  // Refresh
  autoRefresh?: number
  onRefresh?: () => void
  lastUpdated?: number | Date

  // Layout customization
  headerHeight?: number | string
  metricsScrollable?: boolean
  sidebarWidth?: number | string

  // Visual customization
  variant?: 'default' | 'compact' | 'fullscreen'
  showBreadcrumb?: ReactNode
  showStatusBar?: boolean
  statusBarContent?: ReactNode

  // Behavior
  onSectionToggle?: (sectionId: string, collapsed: boolean) => void
  stickyHeader?: boolean

  // Metric strip enhancements
  metricsLayout?: 'row' | 'grid'
  onMetricClick?: (metric: DashboardMetric) => void

  children?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number | Date): string {
  const ms = typeof timestamp === 'number' ? timestamp : timestamp.getTime()
  const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dashboardTemplateStyles = css`
  @layer components {
    @scope (.ui-dashboard-template) {
      :scope {
        position: relative;
        min-inline-size: 320px;
        display: flex;
        flex-direction: column;
        gap: var(--space-md, 1rem);
        container-type: inline-size;
        container-name: dashboard-template;
      }

      /* ── Header ──────────────────────────────────── */

      .ui-dashboard-template__header {
        display: flex;
        align-items: center;
        gap: var(--space-md, 1rem);
        flex-wrap: wrap;
      }

      .ui-dashboard-template__title {
        margin: 0;
        font-size: clamp(1.25rem, 3vw, 1.75rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.3;
      }

      .ui-dashboard-template__subtitle {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      .ui-dashboard-template__title-group {
        flex: 1;
        min-inline-size: 0;
      }

      .ui-dashboard-template__status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-full, 9999px);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        line-height: 1;
      }

      .ui-dashboard-template__status-dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ui-dashboard-template__status-badge[data-status="ok"] {
        background: oklch(72% 0.19 155 / 0.15);
        color: oklch(80% 0.14 155);
      }
      .ui-dashboard-template__status-badge[data-status="ok"] .ui-dashboard-template__status-dot {
        background: oklch(72% 0.19 155);
      }

      .ui-dashboard-template__status-badge[data-status="warning"] {
        background: oklch(80% 0.18 85 / 0.15);
        color: oklch(85% 0.14 85);
      }
      .ui-dashboard-template__status-badge[data-status="warning"] .ui-dashboard-template__status-dot {
        background: oklch(80% 0.18 85);
      }

      .ui-dashboard-template__status-badge[data-status="critical"] {
        background: oklch(62% 0.22 25 / 0.15);
        color: oklch(78% 0.16 25);
      }
      .ui-dashboard-template__status-badge[data-status="critical"] .ui-dashboard-template__status-dot {
        background: oklch(62% 0.22 25);
      }

      .ui-dashboard-template__status-badge[data-status="unknown"] {
        background: oklch(60% 0 0 / 0.12);
        color: oklch(70% 0 0);
      }
      .ui-dashboard-template__status-badge[data-status="unknown"] .ui-dashboard-template__status-dot {
        background: oklch(60% 0 0);
      }

      .ui-dashboard-template__status-badge[data-status="maintenance"] {
        background: oklch(70% 0.15 270 / 0.15);
        color: oklch(78% 0.12 270);
      }
      .ui-dashboard-template__status-badge[data-status="maintenance"] .ui-dashboard-template__status-dot {
        background: oklch(70% 0.15 270);
      }

      .ui-dashboard-template__header-meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      .ui-dashboard-template__last-updated {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
      }

      .ui-dashboard-template__refresh-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-dashboard-template__refresh-dot {
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-radius: 50%;
        background: oklch(72% 0.19 155);
        animation: ui-dt-refresh-pulse 1.5s ease-in-out infinite;
      }

      @keyframes ui-dt-refresh-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      .ui-dashboard-template__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      /* ── Breadcrumb ─────────────────────────────── */

      .ui-dashboard-template__breadcrumb {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-block-end: 0.25rem;
      }

      /* ── Status bar ──────────────────────────────── */

      .ui-dashboard-template__status-bar {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding: 0.5rem 0.75rem;
        font-size: var(--text-xs, 0.75rem);
        background: var(--bg-surface, oklch(20% 0.01 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* ── Sticky header ──────────────────────────── */

      :scope[data-sticky-header] .ui-dashboard-template__header {
        position: sticky;
        inset-block-start: 0;
        z-index: 10;
        background: var(--bg-base, oklch(15% 0.01 270));
        padding-block: 0.75rem;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        backdrop-filter: blur(12px);
      }

      /* ── Variant: compact ─────────────────────────── */

      :scope[data-variant="compact"] {
        gap: var(--space-sm, 0.5rem);
      }

      :scope[data-variant="compact"] .ui-dashboard-template__title {
        font-size: clamp(1rem, 2.5vw, 1.25rem);
      }

      :scope[data-variant="compact"] .ui-dashboard-template__metric {
        padding: 0.5rem 0.75rem;
        min-inline-size: 110px;
      }

      :scope[data-variant="compact"] .ui-dashboard-template__metric-value {
        font-size: var(--text-base, 1rem);
      }

      :scope[data-variant="compact"] .ui-dashboard-template__section-header {
        padding: 0.5rem 0.75rem;
      }

      :scope[data-variant="compact"] .ui-dashboard-template__section-content {
        padding: 0.75rem;
      }

      :scope[data-variant="compact"] .ui-dashboard-template__body {
        gap: var(--space-sm, 0.5rem);
      }

      :scope[data-variant="compact"] .ui-dashboard-template__main {
        gap: var(--space-sm, 0.5rem);
      }

      /* ── Variant: fullscreen ──────────────────────── */

      :scope[data-variant="fullscreen"] {
        min-block-size: 100dvh;
        border-radius: 0;
      }

      :scope[data-variant="fullscreen"] .ui-dashboard-template__section {
        border-radius: var(--radius-sm, 0.375rem);
      }

      :scope[data-variant="fullscreen"] .ui-dashboard-template__metric {
        border-radius: var(--radius-sm, 0.375rem);
      }

      /* ── Metric strip ────────────────────────────── */

      .ui-dashboard-template__metrics {
        display: flex;
        gap: var(--space-sm, 0.5rem);
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default, oklch(100% 0 0 / 0.1)) transparent;
        padding-block: 0.125rem;
      }

      .ui-dashboard-template__metrics[data-scrollable] {
        scroll-snap-type: x mandatory;
      }

      .ui-dashboard-template__metrics[data-scrollable] .ui-dashboard-template__metric {
        scroll-snap-align: start;
      }

      .ui-dashboard-template__metrics[data-layout="grid"] {
        flex-wrap: wrap;
        overflow-x: visible;
      }

      .ui-dashboard-template__metrics[data-layout="grid"] .ui-dashboard-template__metric {
        flex: 1 1 140px;
      }

      .ui-dashboard-template__metric[data-clickable] {
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      }

      .ui-dashboard-template__metric[data-clickable]:hover {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.15);
        transform: translateY(-1px);
      }

      .ui-dashboard-template__metric[data-clickable]:active {
        transform: translateY(0);
      }

      .ui-dashboard-template__metric[data-clickable]:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-dashboard-template__metric {
        flex-shrink: 0;
        min-inline-size: 140px;
        padding: 0.75rem 1rem;
        background: var(--bg-surface, oklch(20% 0.01 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ui-dashboard-template__metric[data-status="warning"] {
        border-color: oklch(80% 0.18 85 / 0.4);
      }
      .ui-dashboard-template__metric[data-status="critical"] {
        border-color: oklch(62% 0.22 25 / 0.4);
      }

      .ui-dashboard-template__metric-header {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ui-dashboard-template__metric-icon {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-dashboard-template__metric-title {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ui-dashboard-template__metric-value {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }

      .ui-dashboard-template__metric-footer {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ui-dashboard-template__metric-change {
        display: inline-flex;
        align-items: center;
        gap: 0.125rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .ui-dashboard-template__metric-change[data-trend="up"] {
        color: oklch(72% 0.19 155);
      }
      .ui-dashboard-template__metric-change[data-trend="down"] {
        color: oklch(62% 0.22 25);
      }
      .ui-dashboard-template__metric-change[data-trend="flat"] {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-dashboard-template__metric-period {
        font-size: 0.625rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
      }

      .ui-dashboard-template__metric-sparkline {
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      /* ── Body (grid + sidebar) ──────────────────── */

      .ui-dashboard-template__body {
        display: grid;
        gap: var(--space-md, 1rem);
        align-items: start;
      }

      .ui-dashboard-template__body[data-sidebar="right"] {
        grid-template-columns: 1fr 280px;
      }
      .ui-dashboard-template__body[data-sidebar="left"] {
        grid-template-columns: 280px 1fr;
      }
      .ui-dashboard-template__body[data-sidebar="none"] {
        grid-template-columns: 1fr;
      }

      /* ── Main grid ─────────────────────────────── */

      .ui-dashboard-template__main {
        display: grid;
        gap: var(--space-md, 1rem);
      }

      :scope[data-columns="1"] .ui-dashboard-template__main {
        grid-template-columns: 1fr;
      }
      :scope[data-columns="2"] .ui-dashboard-template__main {
        grid-template-columns: repeat(2, 1fr);
      }
      :scope[data-columns="3"] .ui-dashboard-template__main {
        grid-template-columns: repeat(3, 1fr);
      }

      /* ── Section cards ─────────────────────────── */

      .ui-dashboard-template__section {
        background: var(--bg-surface, oklch(20% 0.01 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        overflow: hidden;
      }

      .ui-dashboard-template__section-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      .ui-dashboard-template__section-toggle {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0.125rem;
        border-radius: var(--radius-sm, 0.375rem);
        transition: transform 0.2s var(--ease-out, ease-out);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      .ui-dashboard-template__section-toggle:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-dashboard-template__section-toggle[aria-expanded="false"] {
        transform: rotate(-90deg);
      }

      .ui-dashboard-template__section-title {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.3;
      }

      .ui-dashboard-template__section-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        margin: 0;
        margin-inline-start: auto;
      }

      .ui-dashboard-template__section-content {
        padding: 1rem;
        overflow: hidden;
        transition: max-height 0.3s var(--ease-out, ease-out),
                    opacity 0.2s var(--ease-out, ease-out);
      }

      .ui-dashboard-template__section-content[data-collapsed] {
        max-height: 0;
        opacity: 0;
        padding: 0 1rem;
        pointer-events: none;
      }

      /* ── Sidebar ───────────────────────────────── */

      .ui-dashboard-template__sidebar {
        min-inline-size: 0;
        transition: inline-size 0.3s var(--ease-out, ease-out),
                    opacity 0.2s var(--ease-out, ease-out);
      }

      .ui-dashboard-template__sidebar[data-collapsed] {
        inline-size: 0;
        opacity: 0;
        overflow: hidden;
        pointer-events: none;
      }

      .ui-dashboard-template__sidebar-toggle {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 0.375rem);
        background: var(--bg-surface, oklch(20% 0.01 270));
        cursor: pointer;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-block-end: 0.5rem;
        transition: background 0.15s;
      }

      .ui-dashboard-template__sidebar-toggle:hover {
        background: var(--bg-hover);
      }

      .ui-dashboard-template__sidebar-toggle:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* ── Motion 0: no transitions ──────────────── */

      :scope[data-motion="0"] .ui-dashboard-template__section-content,
      :scope[data-motion="0"] .ui-dashboard-template__section-toggle,
      :scope[data-motion="0"] .ui-dashboard-template__sidebar,
      :scope[data-motion="0"] .ui-dashboard-template__metric[data-clickable] {
        transition: none;
      }

      :scope[data-motion="0"] .ui-dashboard-template__refresh-dot {
        animation: none;
      }

      /* ── Container queries ─────────────────────── */

      @container dashboard-template (max-width: 600px) {
        .ui-dashboard-template__body[data-sidebar="right"],
        .ui-dashboard-template__body[data-sidebar="left"] {
          grid-template-columns: 1fr;
        }

        .ui-dashboard-template__main {
          grid-template-columns: 1fr !important;
        }

        .ui-dashboard-template__header {
          flex-direction: column;
          align-items: flex-start;
        }

        .ui-dashboard-template__header-meta {
          margin-inline-start: 0;
        }
      }

      /* ── Forced colors ─────────────────────────── */

      @media (forced-colors: active) {
        .ui-dashboard-template__metric {
          border: 2px solid ButtonText;
        }
        .ui-dashboard-template__metric[data-clickable]:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-dashboard-template__section {
          border: 2px solid ButtonText;
        }
        .ui-dashboard-template__status-badge {
          border: 1px solid ButtonText;
        }
        .ui-dashboard-template__status-bar {
          border: 1px solid ButtonText;
        }
        .ui-dashboard-template__section-toggle:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Reduced motion ────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-dashboard-template__section-content,
        .ui-dashboard-template__section-toggle,
        .ui-dashboard-template__sidebar,
        .ui-dashboard-template__metric[data-clickable] {
          transition: none;
        }
        .ui-dashboard-template__refresh-dot {
          animation: none;
        }
      }
    }
  }
`

// ─── Sparkline SVG ──────────────────────────────────────────────────────────

function Sparkline({ data, width = 48, height = 24 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ')

  return (
    <svg
      className="ui-dashboard-template__metric-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  )
}

// ─── Chevron Icon ───────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Trend Arrow ────────────────────────────────────────────────────────────

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'flat') return <span aria-hidden="true">&ndash;</span>
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      {trend === 'up' ? (
        <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
      ) : (
        <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
      )}
    </svg>
  )
}

// ─── Section Component ──────────────────────────────────────────────────────

function SectionCard({ section, onSectionToggle }: { section: DashboardSection; onSectionToggle?: (sectionId: string, collapsed: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false)

  const handleToggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onSectionToggle?.(section.id, next)
  }

  return (
    <section
      className="ui-dashboard-template__section"
      style={section.span && section.span > 1 ? { gridColumn: `span ${section.span}` } : undefined}
      data-span={section.span}
    >
      <div className="ui-dashboard-template__section-header">
        {section.collapsible && (
          <button
            type="button"
            className="ui-dashboard-template__section-toggle"
            onClick={handleToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${section.title}` : `Collapse ${section.title}`}
          >
            <ChevronDown />
          </button>
        )}
        <h3 className="ui-dashboard-template__section-title">{section.title}</h3>
        {section.description && (
          <p className="ui-dashboard-template__section-desc">{section.description}</p>
        )}
      </div>
      <div
        className="ui-dashboard-template__section-content"
        {...(collapsed && { 'data-collapsed': '' })}
      >
        {section.content}
      </div>
    </section>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function DashboardTemplateInner({
  title,
  subtitle,
  status,
  lastUpdated,
  metrics,
  sections,
  columns = 2,
  sidebar,
  sidebarPosition = 'right',
  sidebarCollapsible = false,
  actions,
  autoRefresh,
  onRefresh,
  headerHeight,
  metricsScrollable = true,
  sidebarWidth,
  variant = 'default',
  showBreadcrumb,
  showStatusBar = false,
  statusBarContent,
  onSectionToggle,
  stickyHeader = false,
  metricsLayout = 'row',
  onMetricClick,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: DashboardTemplateProps) {
  useStyles('dashboard-template', dashboardTemplateStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return
    refreshRef.current = setInterval(onRefresh, autoRefresh)
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current)
    }
  }, [autoRefresh, onRefresh])

  const sidebarLayout = sidebar
    ? (sidebarCollapsed ? 'none' : sidebarPosition)
    : 'none'

  // Build CSS custom properties for dynamic values
  const rootStyle: Record<string, unknown> = { ...style }
  if (sidebarWidth) {
    rootStyle['--dt-sidebar-w'] = typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth
  }

  return (
    <div
      className={cn('ui-dashboard-template', className)}
      data-motion={motionLevel}
      data-columns={columns}
      data-variant={variant !== 'default' ? variant : undefined}
      {...(stickyHeader && { 'data-sticky-header': '' })}
      role="group"
      aria-label={typeof title === 'string' ? `Dashboard: ${title}` : 'Dashboard'}
      style={Object.keys(rootStyle).length > 0 ? rootStyle as React.CSSProperties : undefined}
      {...rest}
    >
      {/* Header */}
      {(title || status || lastUpdated || actions || showBreadcrumb) && (
        <div
          className="ui-dashboard-template__header"
          style={headerHeight ? { minBlockSize: typeof headerHeight === 'number' ? `${headerHeight}px` : headerHeight } : undefined}
        >
          <div className="ui-dashboard-template__title-group">
            {showBreadcrumb && (
              <div className="ui-dashboard-template__breadcrumb">{showBreadcrumb}</div>
            )}
            {title && <h2 className="ui-dashboard-template__title">{title}</h2>}
            {subtitle && <p className="ui-dashboard-template__subtitle">{subtitle}</p>}
          </div>

          {status && (
            <span className="ui-dashboard-template__status-badge" data-status={status}>
              <span className="ui-dashboard-template__status-dot" />
              {status}
            </span>
          )}

          <div className="ui-dashboard-template__header-meta">
            {lastUpdated && (
              <span className="ui-dashboard-template__last-updated">
                Updated {formatRelativeTime(lastUpdated)}
              </span>
            )}

            {autoRefresh && onRefresh && (
              <span className="ui-dashboard-template__refresh-indicator">
                <span className="ui-dashboard-template__refresh-dot" />
              </span>
            )}
          </div>

          {actions && (
            <div className="ui-dashboard-template__actions">{actions}</div>
          )}
        </div>
      )}

      {/* Status bar */}
      {showStatusBar && (
        <div className="ui-dashboard-template__status-bar" role="status">
          {statusBarContent ?? (
            <span>
              {status === 'ok' ? 'All systems operational' :
               status === 'warning' ? 'Some systems degraded' :
               status === 'critical' ? 'System outage detected' :
               status === 'maintenance' ? 'Scheduled maintenance' :
               'Status unknown'}
            </span>
          )}
        </div>
      )}

      {/* Metric strip */}
      {metrics && metrics.length > 0 && (
        <div
          className="ui-dashboard-template__metrics"
          role="list"
          aria-label="Key metrics"
          data-layout={metricsLayout}
          {...(metricsScrollable && metricsLayout === 'row' && { 'data-scrollable': '' })}
        >
          {metrics.map(metric => {
            const isClickable = !!onMetricClick
            return (
              <div
                key={metric.id}
                className="ui-dashboard-template__metric"
                data-status={metric.status}
                {...(isClickable && { 'data-clickable': '' })}
                role={isClickable ? 'button' : 'listitem'}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => onMetricClick(metric) : undefined}
                onKeyDown={isClickable ? (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onMetricClick(metric)
                  }
                } : undefined}
                aria-label={isClickable ? `${metric.title}: ${typeof metric.value === 'string' ? metric.value : ''}` : undefined}
              >
                <div className="ui-dashboard-template__metric-header">
                  {metric.icon && (
                    <span className="ui-dashboard-template__metric-icon">{metric.icon}</span>
                  )}
                  <span className="ui-dashboard-template__metric-title">{metric.title}</span>
                </div>
                <span className="ui-dashboard-template__metric-value">{metric.value}</span>
                <div className="ui-dashboard-template__metric-footer">
                  {metric.trend && metric.change && (
                    <span className="ui-dashboard-template__metric-change" data-trend={metric.trend}>
                      <TrendArrow trend={metric.trend} />
                      {Math.abs(metric.change.value)}%
                    </span>
                  )}
                  {metric.change?.period && (
                    <span className="ui-dashboard-template__metric-period">{metric.change.period}</span>
                  )}
                  {metric.sparkline && metric.sparkline.length >= 2 && (
                    <Sparkline data={metric.sparkline} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Body: grid + sidebar */}
      {(sections || sidebar || children) && (
        <div
          className="ui-dashboard-template__body"
          data-sidebar={sidebarLayout}
          style={sidebarWidth && !sidebarCollapsed && sidebar ? {
            gridTemplateColumns: sidebarPosition === 'left'
              ? `var(--dt-sidebar-w, 280px) 1fr`
              : `1fr var(--dt-sidebar-w, 280px)`,
          } : undefined}
        >
          {/* Sidebar on left */}
          {sidebar && sidebarPosition === 'left' && (
            <aside
              className="ui-dashboard-template__sidebar"
              {...(sidebarCollapsed && { 'data-collapsed': '' })}
            >
              {sidebarCollapsible && (
                <button
                  type="button"
                  className="ui-dashboard-template__sidebar-toggle"
                  onClick={() => setSidebarCollapsed(c => !c)}
                  aria-expanded={!sidebarCollapsed}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <ChevronDown />
                </button>
              )}
              {!sidebarCollapsed && sidebar}
            </aside>
          )}

          {/* Main content */}
          <div className="ui-dashboard-template__main">
            {sections?.map(section => (
              <SectionCard key={section.id} section={section} onSectionToggle={onSectionToggle} />
            ))}
            {children}
          </div>

          {/* Sidebar on right */}
          {sidebar && sidebarPosition === 'right' && (
            <aside
              className="ui-dashboard-template__sidebar"
              {...(sidebarCollapsed && { 'data-collapsed': '' })}
            >
              {sidebarCollapsible && (
                <button
                  type="button"
                  className="ui-dashboard-template__sidebar-toggle"
                  onClick={() => setSidebarCollapsed(c => !c)}
                  aria-expanded={!sidebarCollapsed}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <ChevronDown />
                </button>
              )}
              {!sidebarCollapsed && sidebar}
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export function DashboardTemplate(props: DashboardTemplateProps): ReactElement {
  return (
    <ComponentErrorBoundary>
      <DashboardTemplateInner {...props} />
    </ComponentErrorBoundary>
  )
}

DashboardTemplate.displayName = 'DashboardTemplate'
