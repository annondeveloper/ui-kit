'use client'

import {
  forwardRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FilterPillProps extends HTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  onRemove?: () => void
  count?: number
  icon?: ReactNode
  size?: 'sm' | 'md'
  motion?: 0 | 1 | 2 | 3
}

export interface FilterPillGroupProps extends HTMLAttributes<HTMLDivElement> {
  onClearAll?: () => void
  clearLabel?: string
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const filterPillStyles = css`
  @layer components {
    @scope (.ui-filter-pill) {
      :scope {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-full, 9999px);
        background: var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        user-select: none;
        transition: background 0.15s var(--ease-out, ease-out),
                    border-color 0.15s var(--ease-out, ease-out),
                    color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
        outline: none;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        gap: 0.125rem;
      }

      :scope[data-size="md"] {
        padding-block: 0.25rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }

      /* Hover */
      :scope:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.08));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Active state */
      :scope[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        color: var(--brand, oklch(65% 0.2 270));
      }

      :scope[data-active]:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Icon */
      .ui-filter-pill__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }

      .ui-filter-pill__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Count badge */
      .ui-filter-pill__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25em;
        block-size: 1.25em;
        padding-inline: 0.25em;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        font-size: 0.8em;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        line-height: 1;
      }

      :scope[data-active] .ui-filter-pill__count {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Remove button */
      .ui-filter-pill__remove {
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem;
        margin-inline-end: -0.25rem;
        border-radius: var(--radius-full, 9999px);
        color: inherit;
        opacity: 0.6;
        transition: opacity 0.1s, background 0.1s;
        outline: none;
      }

      .ui-filter-pill__remove:hover {
        opacity: 1;
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
      }

      .ui-filter-pill__remove:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
        opacity: 1;
      }

      .ui-filter-pill__remove svg {
        inline-size: 0.85em;
        block-size: 0.85em;
      }

      /* Main button inside wrapper (when remove is present) */
      .ui-filter-pill__main {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: inherit;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: inherit;
        padding: 0;
        outline: none;
      }

      .ui-filter-pill__main:focus-visible {
        text-decoration: underline;
      }

      /* Entry animation — motion level 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) {
        animation: ui-filter-pill-enter 0.2s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 36px;
          padding-inline: 1rem;
        }
        .ui-filter-pill__remove {
          min-inline-size: 28px;
          min-block-size: 28px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        :scope[data-active] {
          border: 2px solid Highlight;
          color: Highlight;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
          box-shadow: none;
        }
        .ui-filter-pill__remove {
          display: none;
        }
      }
    }

    @keyframes ui-filter-pill-enter {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
`

const filterPillGroupStyles = css`
  @layer components {
    @scope (.ui-filter-pill-group) {
      :scope {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
      }

      .ui-filter-pill-group__clear {
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(60% 0 0));
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        border-radius: var(--radius-sm, 0.25rem);
        transition: color 0.1s, background 0.1s;
        outline: none;
      }

      .ui-filter-pill-group__clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: var(--border-subtle, oklch(100% 0 0 / 0.04));
      }

      .ui-filter-pill-group__clear:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-filter-pill-group__clear {
          color: ButtonText;
        }
        .ui-filter-pill-group__clear:focus-visible {
          outline: 2px solid Highlight;
        }
      }
    }
  }
`

// ─── FilterPill Component ───────────────────────────────────────────────────

export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  (
    {
      label,
      active = false,
      onRemove,
      count,
      icon,
      size = 'md',
      motion: motionProp,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('filter-pill', filterPillStyles)
    const motionLevel = useMotionLevel(motionProp)

    const handleRemoveClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onRemove?.()
      },
      [onRemove]
    )

    // When there's a remove button, we use a wrapper span to avoid nested interactive elements
    if (onRemove) {
      return (
        <span
          className={cn(cls('root'), className)}
          data-size={size}
          data-motion={motionLevel}
          {...(active ? { 'data-active': '' } : {})}
          role="group"
          aria-label={`${label} filter`}
        >
          <button
            ref={ref}
            type="button"
            className="ui-filter-pill__main"
            aria-pressed={active}
            onClick={onClick}
            {...rest}
          >
            {icon && (
              <span className="ui-filter-pill__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <span className="ui-filter-pill__label">{label}</span>
            {count !== undefined && (
              <span className="ui-filter-pill__count">{count}</span>
            )}
          </button>
          <button
            type="button"
            className="ui-filter-pill__remove"
            onClick={handleRemoveClick}
            aria-label={`Remove ${label}`}
          >
            <Icon name="x" size="sm" />
          </button>
        </span>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(active ? { 'data-active': '' } : {})}
        aria-pressed={active}
        onClick={onClick}
        {...rest}
      >
        {icon && (
          <span className="ui-filter-pill__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ui-filter-pill__label">{label}</span>
        {count !== undefined && (
          <span className="ui-filter-pill__count">{count}</span>
        )}
      </button>
    )
  }
)
FilterPill.displayName = 'FilterPill'

// ─── FilterPillGroup Component ──────────────────────────────────────────────

export const FilterPillGroup = forwardRef<HTMLDivElement, FilterPillGroupProps>(
  (
    {
      onClearAll,
      clearLabel = 'Clear all',
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('filter-pill-group', filterPillGroupStyles)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        role="group"
        aria-label="Active filters"
        {...rest}
      >
        {children}
        {onClearAll && (
          <button
            type="button"
            className="ui-filter-pill-group__clear"
            onClick={onClearAll}
          >
            {clearLabel}
          </button>
        )}
      </div>
    )
  }
)
FilterPillGroup.displayName = 'FilterPillGroup'
