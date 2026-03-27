'use client'

import {
  useRef,
  useMemo,
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

export interface ServiceItem {
  name: string
  status: 'running' | 'stopped' | 'error' | 'unknown'
  version?: string
  icon?: ReactNode
}

export interface ServiceStripProps extends HTMLAttributes<HTMLDivElement> {
  services: ServiceItem[]
  maxVisible?: number
  size?: 'sm' | 'md'
  onServiceClick?: (service: ServiceItem) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const serviceStripStyles = css`
  @layer components {
    @scope (.ui-service-strip) {
      :scope {
        display: flex;
        min-inline-size: 200px;
        flex-wrap: wrap;
        gap: var(--space-xs, 0.25rem);
        container-type: inline-size;
      }

      :scope[data-motion="0"] * {
        transition: none !important;
      }

      /* Badge base */
      .ui-service-strip__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: var(--bg-surface, oklch(22% 0.02 270));
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
      }

      /* Size small */
      :scope[data-size="sm"] .ui-service-strip__badge {
        padding: 0.125rem 0.5rem;
        font-size: var(--text-2xs, 0.6875rem);
        gap: 0.25rem;
      }

      /* Clickable badges */
      .ui-service-strip__badge[data-clickable] {
        cursor: pointer;
      }

      @media (hover: hover) {
        .ui-service-strip__badge[data-clickable]:hover {
          background: var(--bg-hover, oklch(100% 0 0 / 0.06));
          border-color: var(--border-default, oklch(100% 0 0 / 0.12));
        }
        .ui-service-strip__badge[data-clickable]:hover:not([data-motion="0"]) {
          transform: translateY(-1px);
        }
      }

      /* Status dot */
      .ui-service-strip__dot {
        inline-size: 6px;
        block-size: 6px;
        border-radius: 9999px;
        flex-shrink: 0;
      }

      :scope[data-size="sm"] .ui-service-strip__dot {
        inline-size: 5px;
        block-size: 5px;
      }

      /* Status colors */
      .ui-service-strip__badge[data-status="running"] {
        border-color: oklch(72% 0.19 155 / 0.25);
      }
      .ui-service-strip__badge[data-status="running"] .ui-service-strip__dot {
        background: oklch(72% 0.19 155);
      }

      .ui-service-strip__badge[data-status="stopped"] {
        border-color: oklch(55% 0 0 / 0.2);
      }
      .ui-service-strip__badge[data-status="stopped"] .ui-service-strip__dot {
        background: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-service-strip__badge[data-status="stopped"] .ui-service-strip__name {
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-service-strip__badge[data-status="error"] {
        border-color: oklch(62% 0.22 25 / 0.25);
      }
      .ui-service-strip__badge[data-status="error"] .ui-service-strip__dot {
        background: oklch(62% 0.22 25);
      }

      .ui-service-strip__badge[data-status="unknown"] {
        border-color: oklch(55% 0 0 / 0.15);
      }
      .ui-service-strip__badge[data-status="unknown"] .ui-service-strip__dot {
        background: var(--text-disabled, oklch(40% 0 0));
      }
      .ui-service-strip__badge[data-status="unknown"] .ui-service-strip__name {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Running pulse animation at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"])
        .ui-service-strip__badge[data-status="running"] .ui-service-strip__dot {
        animation: ui-service-dot-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-service-dot-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-service-strip__dot {
          animation: none !important;
        }
      }

      /* Icon */
      .ui-service-strip__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Name */
      .ui-service-strip__name {
        white-space: nowrap;
      }

      /* Version */
      .ui-service-strip__version {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.625rem;
        font-variant-numeric: tabular-nums;
      }

      :scope[data-size="sm"] .ui-service-strip__version {
        display: none;
      }

      /* Overflow badge */
      .ui-service-strip__overflow {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        border: 1px dashed var(--border-subtle, oklch(100% 0 0 / 0.12));
        background: transparent;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        cursor: default;
      }

      :scope[data-size="sm"] .ui-service-strip__overflow {
        padding: 0.125rem 0.5rem;
        font-size: var(--text-2xs, 0.6875rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-service-strip__badge {
          border: 1px solid ButtonText;
        }
        .ui-service-strip__dot {
          background: ButtonText;
        }
        .ui-service-strip__badge[data-status="running"] .ui-service-strip__dot {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-service-strip__badge {
          border: 1px solid;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function ServiceStripInner({
  services,
  maxVisible,
  size = 'md',
  onServiceClick,
  motion: motionProp,
  className,
  ...rest
}: ServiceStripProps) {
  useStyles('service-strip', serviceStripStyles)
  const motionLevel = useMotionLevel(motionProp)
  const stripRef = useRef<HTMLDivElement>(null)

  useEntrance(
    stripRef,
    motionLevel >= 2 ? 'fade-up' : 'none',
    { duration: 280 }
  )

  const { visible, overflow } = useMemo(() => {
    if (maxVisible == null || maxVisible >= services.length) {
      return { visible: services, overflow: 0 }
    }
    return {
      visible: services.slice(0, maxVisible),
      overflow: services.length - maxVisible,
    }
  }, [services, maxVisible])

  if (services.length === 0) return null

  return (
    <div
      ref={stripRef}
      className={cn('ui-service-strip', className)}
      data-motion={motionLevel}
      data-size={size}
      role="list"
      aria-label="Services"
      {...rest}
    >
      {visible.map((service) => (
        <span
          key={service.name}
          className="ui-service-strip__badge"
          data-status={service.status}
          {...(onServiceClick && { 'data-clickable': '' })}
          role="listitem"
          aria-label={`${service.name}: ${service.status}${service.version ? ` v${service.version}` : ''}`}
          onClick={onServiceClick ? () => onServiceClick(service) : undefined}
          onKeyDown={
            onServiceClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onServiceClick(service)
                  }
                }
              : undefined
          }
          tabIndex={onServiceClick ? 0 : undefined}
        >
          <span className="ui-service-strip__dot" aria-hidden="true" />
          {service.icon && (
            <span className="ui-service-strip__icon" aria-hidden="true">
              {service.icon}
            </span>
          )}
          <span className="ui-service-strip__name">{service.name}</span>
          {service.version && (
            <span className="ui-service-strip__version">v{service.version}</span>
          )}
        </span>
      ))}

      {overflow > 0 && (
        <span
          className="ui-service-strip__overflow"
          role="listitem"
          aria-label={`${overflow} more services`}
        >
          +{overflow} more
        </span>
      )}
    </div>
  )
}

export function ServiceStrip(props: ServiceStripProps) {
  return (
    <ComponentErrorBoundary>
      <ServiceStripInner {...props} />
    </ComponentErrorBoundary>
  )
}

ServiceStrip.displayName = 'ServiceStrip'
