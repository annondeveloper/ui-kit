'use client'

import {
  useRef,
  useState,
  useCallback,
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

export interface PropertyItem {
  label: string
  value: ReactNode
  copyable?: boolean
  mono?: boolean
  href?: string
}

export interface PropertyListProps extends HTMLAttributes<HTMLDivElement> {
  items: PropertyItem[]
  columns?: 1 | 2
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const propertyListStyles = css`
  @layer components {
    @scope (.ui-property-list) {
      :scope {
        display: grid;
        gap: 0;
        container-type: inline-size;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      /* Size variants */
      :scope[data-size="sm"] .ui-property-list__row {
        padding: var(--space-2xs, 0.125rem) var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-property-list__row,
      :scope:not([data-size]) .ui-property-list__row {
        padding: var(--space-xs, 0.25rem) var(--space-md, 1rem);
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-property-list__row {
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        font-size: var(--text-base, 1rem);
      }

      /* Row layout */
      .ui-property-list__row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--space-md, 1rem);
        min-block-size: 2rem;
        line-height: 1.5;
        transition: background 0.15s ease;
      }

      /* Striped rows */
      :scope[data-striped] .ui-property-list__row:nth-child(odd) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.04));
      }

      /* Hover */
      @media (hover: hover) {
        .ui-property-list__row:hover {
          background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        }
      }

      /* Two-column layout */
      :scope[data-columns="2"] {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      :scope[data-columns="2"] .ui-property-list__row {
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      :scope[data-columns="2"] .ui-property-list__row:nth-child(2n) {
        border-inline-end: none;
      }

      /* Row separator */
      .ui-property-list__row + .ui-property-list__row {
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      :scope[data-columns="2"] .ui-property-list__row:nth-child(1),
      :scope[data-columns="2"] .ui-property-list__row:nth-child(2) {
        border-block-start: none;
      }

      :scope[data-columns="2"] .ui-property-list__row:nth-child(n+3) {
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      /* Label */
      .ui-property-list__label {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 500;
        flex-shrink: 0;
        white-space: nowrap;
      }

      /* Value */
      .ui-property-list__value {
        color: var(--text-primary, oklch(90% 0 0));
        text-align: end;
        overflow-wrap: anywhere;
        min-inline-size: 0;
      }

      .ui-property-list__value[data-mono] {
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-variant-numeric: tabular-nums;
      }

      /* Link value */
      .ui-property-list__link {
        color: oklch(72% 0.15 250);
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ui-property-list__link:hover {
        color: oklch(80% 0.15 250);
        text-decoration: underline;
      }

      /* Copy button */
      .ui-property-list__copy {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-inline-start: var(--space-2xs, 0.125rem);
        padding: 0.125rem;
        border: none;
        background: transparent;
        color: var(--text-tertiary, oklch(55% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.375rem);
        transition: color 0.15s ease, background 0.15s ease;
        flex-shrink: 0;
        min-inline-size: 1.5rem;
        min-block-size: 1.5rem;
      }
      .ui-property-list__copy:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }
      .ui-property-list__copy[data-copied] {
        color: oklch(72% 0.19 155);
      }

      /* Container query: narrow — stack label/value */
      @container (max-width: 280px) {
        :scope[data-columns="2"] {
          grid-template-columns: 1fr;
        }
        :scope[data-columns="2"] .ui-property-list__row {
          border-inline-end: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-property-list__link {
          color: LinkText;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
      }
    }
  }
`

// ─── Copy icon ──────────────────────────────────────────────────────────────

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function PropertyListInner({
  items,
  columns = 1,
  size = 'md',
  striped,
  motion: motionProp,
  className,
  ...rest
}: PropertyListProps) {
  useStyles('property-list', propertyListStyles)
  const motionLevel = useMotionLevel(motionProp)
  const listRef = useRef<HTMLDivElement>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEntrance(
    listRef,
    motionLevel >= 2 ? 'fade-up' : 'none',
    { duration: 280 }
  )

  const handleCopy = useCallback((value: ReactNode, index: number) => {
    const text = typeof value === 'string' ? value : String(value)
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }, [])

  return (
    <div
      ref={listRef}
      className={cn('ui-property-list', className)}
      data-motion={motionLevel}
      data-size={size}
      data-columns={columns}
      {...(striped && { 'data-striped': '' })}
      role="list"
      aria-label="Properties"
      {...rest}
    >
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className="ui-property-list__row"
          role="listitem"
        >
          <span className="ui-property-list__label">{item.label}</span>
          <span
            className="ui-property-list__value"
            {...(item.mono && { 'data-mono': '' })}
          >
            {item.href ? (
              <a
                className="ui-property-list__link"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
            {item.copyable && (
              <button
                className="ui-property-list__copy"
                onClick={() => handleCopy(item.value, i)}
                aria-label={`Copy ${item.label}`}
                type="button"
                {...(copiedIndex === i && { 'data-copied': '' })}
              >
                <CopyIcon copied={copiedIndex === i} />
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PropertyList(props: PropertyListProps) {
  return (
    <ComponentErrorBoundary>
      <PropertyListInner {...props} />
    </ComponentErrorBoundary>
  )
}

PropertyList.displayName = 'PropertyList'
