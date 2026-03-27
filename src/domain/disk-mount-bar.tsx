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

export interface MountInfo {
  mount: string
  totalBytes: number
  usedBytes: number
  freeBytes: number
  utilPct: number
}

export interface DiskMountBarProps extends HTMLAttributes<HTMLDivElement> {
  mounts: MountInfo[]
  maxVisible?: number
  showFree?: boolean
  formatBytes?: (bytes: number) => string
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const diskMountBarStyles = css`
  @layer components {
    @scope (.ui-disk-mount-bar) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        inline-size: 100%;
      }

      .ui-disk-mount-bar__list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-disk-mount-bar__entry {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .ui-disk-mount-bar__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-disk-mount-bar__mount {
        font-family: var(--font-mono, ui-monospace, monospace);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-inline-size: 60%;
      }

      :scope[data-size="sm"] .ui-disk-mount-bar__mount {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="lg"] .ui-disk-mount-bar__mount {
        font-size: var(--text-base, 1rem);
      }

      .ui-disk-mount-bar__info {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
      }

      .ui-disk-mount-bar__pct {
        font-weight: 600;
        min-inline-size: 2.5rem;
        text-align: end;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-disk-mount-bar__track {
        block-size: 6px;
        border-radius: var(--radius-sm, 0.375rem);
        background: var(--bg-muted, oklch(100% 0 0 / 0.06));
        overflow: hidden;
      }

      :scope[data-size="sm"] .ui-disk-mount-bar__track { block-size: 4px; }
      :scope[data-size="md"] .ui-disk-mount-bar__track { block-size: 6px; }
      :scope[data-size="lg"] .ui-disk-mount-bar__track { block-size: 10px; }

      .ui-disk-mount-bar__fill {
        block-size: 100%;
        border-radius: inherit;
        transition: inline-size 0.5s var(--ease-out, ease-out);
        min-inline-size: 0;
      }

      :scope[data-motion="0"] .ui-disk-mount-bar__fill {
        transition: none;
      }

      /* Threshold colors */
      .ui-disk-mount-bar__fill[data-level="ok"] {
        background: oklch(72% 0.19 155);
      }
      .ui-disk-mount-bar__fill[data-level="warning"] {
        background: oklch(78% 0.17 85);
      }
      .ui-disk-mount-bar__fill[data-level="critical"] {
        background: oklch(62% 0.22 25);
      }

      .ui-disk-mount-bar__free {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-variant-numeric: tabular-nums;
      }

      .ui-disk-mount-bar__toggle {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-block: var(--space-xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--brand, oklch(65% 0.2 270));
        transition: color 0.15s ease;
      }

      .ui-disk-mount-bar__toggle:hover {
        color: oklch(72% 0.22 270);
      }

      .ui-disk-mount-bar__toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: 2px;
      }

      .ui-disk-mount-bar__toggle-icon {
        display: inline-block;
        font-size: 0.625rem;
        transition: transform 0.2s ease;
      }

      .ui-disk-mount-bar__toggle-icon[data-expanded="true"] {
        transform: rotate(180deg);
      }

      :scope[data-motion="0"] .ui-disk-mount-bar__toggle-icon {
        transition: none;
      }

      .ui-disk-mount-bar__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        padding-block-start: var(--space-2xs, 0.125rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-disk-mount-bar__track {
          border: 1px solid CanvasText;
        }
        .ui-disk-mount-bar__fill {
          background: Highlight !important;
        }
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultFormatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  if (bytes < 1024 ** 4) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${(bytes / 1024 ** 4).toFixed(1)} TB`
}

function thresholdLevel(pct: number): 'ok' | 'warning' | 'critical' {
  if (pct >= 90) return 'critical'
  if (pct >= 70) return 'warning'
  return 'ok'
}

// ─── Component ──────────────────────────────────────────────────────────────

function DiskMountBarInner({
  mounts,
  maxVisible = 3,
  showFree = false,
  formatBytes: formatBytesProp,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: DiskMountBarProps) {
  useStyles('disk-mount-bar', diskMountBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [expanded, setExpanded] = useState(false)

  const fmt = formatBytesProp ?? defaultFormatBytes

  const sorted = useMemo(
    () => [...mounts].sort((a, b) => b.utilPct - a.utilPct),
    [mounts],
  )

  const visible = expanded ? sorted : sorted.slice(0, maxVisible)
  const hiddenCount = sorted.length - maxVisible

  return (
    <div
      className={cn('ui-disk-mount-bar', className)}
      data-size={size}
      data-motion={motionLevel}
      role="list"
      aria-label={`Disk utilization — ${sorted.length} mount${sorted.length !== 1 ? 's' : ''}`}
      {...rest}
    >
      <div className="ui-disk-mount-bar__list">
        {visible.map((m) => {
          const level = thresholdLevel(m.utilPct)
          return (
            <div
              key={m.mount}
              className="ui-disk-mount-bar__entry"
              role="listitem"
            >
              <div className="ui-disk-mount-bar__header">
                <span className="ui-disk-mount-bar__mount" title={m.mount}>
                  {m.mount}
                </span>
                <span className="ui-disk-mount-bar__info">
                  <span>{fmt(m.usedBytes)} / {fmt(m.totalBytes)}</span>
                  <span className="ui-disk-mount-bar__pct">
                    {m.utilPct.toFixed(1)}%
                  </span>
                </span>
              </div>

              <div
                className="ui-disk-mount-bar__track"
                role="progressbar"
                aria-valuenow={m.utilPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${m.mount}: ${m.utilPct.toFixed(1)}% used`}
              >
                <div
                  className="ui-disk-mount-bar__fill"
                  data-level={level}
                  style={{ inlineSize: `${Math.max(m.utilPct, 0.5)}%` }}
                />
              </div>

              {showFree && (
                <span className="ui-disk-mount-bar__free">
                  {fmt(m.freeBytes)} free
                </span>
              )}
            </div>
          )
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          className="ui-disk-mount-bar__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span
            className="ui-disk-mount-bar__toggle-icon"
            data-expanded={expanded}
            aria-hidden="true"
          >
            &#9660;
          </span>
          {expanded
            ? 'Show less'
            : `Show ${hiddenCount} more mount${hiddenCount !== 1 ? 's' : ''}`}
        </button>
      )}

      <div className="ui-disk-mount-bar__footer">
        <span>{sorted.length} mount point{sorted.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

export function DiskMountBar(props: DiskMountBarProps) {
  return (
    <ComponentErrorBoundary>
      <DiskMountBarInner {...props} />
    </ComponentErrorBoundary>
  )
}

DiskMountBar.displayName = 'DiskMountBar'
