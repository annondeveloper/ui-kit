'use client'

import {
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

export interface DashboardGroup {
  id: string
  title: ReactNode
  description?: string
  summary?: ReactNode           // Aggregated summary (e.g., total traffic)
  items: ReactNode[]            // Child cards/components
  collapsed?: boolean
}

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  groups?: DashboardGroup[]     // Grouped mode
  columns?: number | 'auto'    // Fixed columns or auto-fit (default: 'auto')
  gap?: 'sm' | 'md' | 'lg'
  children?: ReactNode          // Ungrouped mode — just children in grid
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dashboardGridStyles = css`
  @layer components {
    @scope (.ui-dashboard-grid) {
      :scope {
        position: relative;
        min-inline-size: 320px;
        display: flex;
        flex-direction: column;
        container-type: inline-size;
      }

      /* Grid layout */
      .ui-dashboard-grid__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: var(--space-md, 1rem);
      }

      /* Fixed column overrides */
      :scope[data-columns="1"] .ui-dashboard-grid__grid {
        grid-template-columns: 1fr;
      }
      :scope[data-columns="2"] .ui-dashboard-grid__grid {
        grid-template-columns: repeat(2, 1fr);
      }
      :scope[data-columns="3"] .ui-dashboard-grid__grid {
        grid-template-columns: repeat(3, 1fr);
      }
      :scope[data-columns="4"] .ui-dashboard-grid__grid {
        grid-template-columns: repeat(4, 1fr);
      }
      :scope[data-columns="5"] .ui-dashboard-grid__grid {
        grid-template-columns: repeat(5, 1fr);
      }
      :scope[data-columns="6"] .ui-dashboard-grid__grid {
        grid-template-columns: repeat(6, 1fr);
      }

      /* Gap sizes */
      :scope[data-gap="sm"] .ui-dashboard-grid__grid {
        gap: var(--space-sm, 0.5rem);
      }
      :scope[data-gap="md"] .ui-dashboard-grid__grid {
        gap: var(--space-md, 1rem);
      }
      :scope[data-gap="lg"] .ui-dashboard-grid__grid {
        gap: var(--space-lg, 1.5rem);
      }

      :scope[data-gap="sm"] {
        gap: var(--space-sm, 0.5rem);
      }
      :scope[data-gap="md"] {
        gap: var(--space-md, 1rem);
      }
      :scope[data-gap="lg"] {
        gap: var(--space-lg, 1.5rem);
      }

      /* Group */
      .ui-dashboard-grid__group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-dashboard-grid__group-header {
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

      .ui-dashboard-grid__group-header:hover {
        background: var(--bg-hover);
      }

      .ui-dashboard-grid__group-header:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-dashboard-grid__group-chevron {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        transition: transform 0.2s var(--ease-out, ease-out);
      }

      .ui-dashboard-grid__group[data-collapsed] .ui-dashboard-grid__group-chevron {
        transform: rotate(-90deg);
      }

      .ui-dashboard-grid__group-title {
        margin: 0;
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.4;
      }

      .ui-dashboard-grid__group-summary {
        margin-inline-start: auto;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-dashboard-grid__group-description {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        margin: 0;
        padding-inline-start: 1.25rem;
        line-height: 1.4;
      }

      .ui-dashboard-grid__group-content {
        overflow: hidden;
        transition: max-height 0.3s var(--ease-out, ease-out),
                    opacity 0.2s var(--ease-out, ease-out);
      }

      .ui-dashboard-grid__group[data-collapsed] .ui-dashboard-grid__group-content {
        max-height: 0;
        opacity: 0;
        pointer-events: none;
      }

      :scope[data-motion="0"] .ui-dashboard-grid__group-content,
      :scope[data-motion="0"] .ui-dashboard-grid__group-chevron {
        transition: none;
      }

      /* Container queries — responsive scaling */
      @container (max-width: 300px) {
        .ui-dashboard-grid__grid {
          grid-template-columns: 1fr;
        }
        .ui-dashboard-grid__group-summary {
          display: none;
        }
      }

      @container (min-width: 600px) and (max-width: 1199px) {
        :scope[data-columns="auto"] .ui-dashboard-grid__grid {
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        }
      }

      /* Video wall */
      @container (min-width: 3000px) {
        .ui-dashboard-grid__grid {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }
        .ui-dashboard-grid__group-title {
          font-size: var(--text-xl, 1.25rem);
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-dashboard-grid__group-header {
          border: 1px solid ButtonText;
        }
        .ui-dashboard-grid__group-header:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-dashboard-grid__group[data-collapsed] .ui-dashboard-grid__group-content {
          max-height: none;
          opacity: 1;
          pointer-events: auto;
        }
      }
    }
  }
`

// ─── Chevron Icon ───────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Group Component ────────────────────────────────────────────────────────

function GridGroup({
  group,
}: {
  group: DashboardGroup
}) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false)

  return (
    <section
      className="ui-dashboard-grid__group"
      {...(collapsed && { 'data-collapsed': '' })}
    >
      <button
        type="button"
        className="ui-dashboard-grid__group-header"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span className="ui-dashboard-grid__group-chevron">
          <ChevronDown />
        </span>
        <h3 className="ui-dashboard-grid__group-title">{group.title}</h3>
        {group.summary && (
          <span className="ui-dashboard-grid__group-summary">{group.summary}</span>
        )}
      </button>

      {group.description && !collapsed && (
        <p className="ui-dashboard-grid__group-description">{group.description}</p>
      )}

      <div className="ui-dashboard-grid__group-content">
        <div className="ui-dashboard-grid__grid">
          {group.items.map((item, i) => (
            <div key={i} className="ui-dashboard-grid__item">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function DashboardGridInner({
  groups,
  columns = 'auto',
  gap = 'md',
  children,
  motion: motionProp,
  className,
  ...rest
}: DashboardGridProps) {
  useStyles('dashboard-grid', dashboardGridStyles)
  const motionLevel = useMotionLevel(motionProp)

  return (
    <div
      className={cn('ui-dashboard-grid', className)}
      data-motion={motionLevel}
      data-columns={columns}
      data-gap={gap}
      {...rest}
    >
      {groups ? (
        groups.map(group => (
          <GridGroup key={group.id} group={group} />
        ))
      ) : (
        <div className="ui-dashboard-grid__grid">
          {children}
        </div>
      )}
    </div>
  )
}

export function DashboardGrid(props: DashboardGridProps) {
  return (
    <ComponentErrorBoundary>
      <DashboardGridInner {...props} />
    </ComponentErrorBoundary>
  )
}

DashboardGrid.displayName = 'DashboardGrid'
