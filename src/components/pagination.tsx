'use client'

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number
  totalPages: number
  onChange: (page: number) => void
  siblingCount?: number
  showFirst?: boolean
  showPrevNext?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const paginationStyles = css`
  @layer components {
    @scope (.ui-pagination) {
      :scope {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        line-height: 1;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        padding: 0;
      }
      button:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
        border-color: oklch(100% 0 0 / 0.15);
      }
      button:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      button:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      /* Current page */
      button[aria-current="page"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
        border-color: var(--brand, oklch(65% 0.2 270));
        cursor: default;
      }

      /* Sizes */
      :scope[data-size="xs"] button {
        min-inline-size: 1.5rem;
        block-size: 1.5rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] button {
        min-inline-size: 1.75rem;
        block-size: 1.75rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] button {
        min-inline-size: 2.25rem;
        block-size: 2.25rem;
      }
      :scope[data-size="lg"] button {
        min-inline-size: 2.75rem;
        block-size: 2.75rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] button {
        min-inline-size: 3.25rem;
        block-size: 3.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Ellipsis */
      .ui-pagination__ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 2rem;
        block-size: 2rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(50% 0 0));
        user-select: none;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        button {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        button {
          border: 1px solid ButtonText;
          color: ButtonText;
          background: Canvas;
        }
        button[aria-current="page"] {
          background: Highlight;
          color: HighlightText;
          border-color: Highlight;
        }
        button:disabled {
          border-color: GrayText;
          color: GrayText;
        }
      }

      /* Print */
      @media print {
        button {
          border: 1px solid #000;
        }
        button[aria-current="page"] {
          background: #000;
          color: #fff;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        button {
          transition: none;
        }
      }
    }
  }
`

// ─── Icons ──────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronsLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 3L3 7L7 11M11 3L7 7L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronsRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3L7 7L3 11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Page range logic ───────────────────────────────────────────────────────

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageRange(page: number, totalPages: number, siblingCount: number): PageItem[] {
  if (totalPages <= 0) return []

  const totalNumbers = siblingCount * 2 + 5 // siblings + current + 2 boundaries + 2 ellipsis slots

  // If total pages fits without truncation
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    // Show left pages + right ellipsis
    const leftCount = siblingCount * 2 + 3
    const leftRange = Array.from({ length: leftCount }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis-end', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Show left ellipsis + right pages
    const rightCount = siblingCount * 2 + 3
    const rightRange = Array.from(
      { length: rightCount },
      (_, i) => totalPages - rightCount + 1 + i
    )
    return [1, 'ellipsis-start', ...rightRange]
  }

  // Both ellipses
  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i
  )
  return [1, 'ellipsis-start', ...middleRange, 'ellipsis-end', totalPages]
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      page,
      totalPages,
      onChange,
      siblingCount = 1,
      showFirst = false,
      showPrevNext = true,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) {
    useStyles('pagination', paginationStyles)
    const motionLevel = useMotionLevel(motionProp)

    const pages = useMemo(
      () => getPageRange(page, totalPages, siblingCount),
      [page, totalPages, siblingCount]
    )

    return (
      <nav
        ref={ref}
        className={cn('ui-pagination', className)}
        aria-label="Pagination"
        data-size={size}
        data-motion={motionLevel}
        {...rest}
      >
        {showFirst && (
          <button
            type="button"
            aria-label="First page"
            disabled={page <= 1}
            onClick={() => onChange(1)}
          >
            <ChevronsLeft />
          </button>
        )}

        {showPrevNext && (
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <ChevronLeft />
          </button>
        )}

        {pages.map((item, i) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <span key={item} className="ui-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            )
          }

          const isCurrent = item === page
          return (
            <button
              key={item}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${item}`}
              onClick={isCurrent ? undefined : () => onChange(item)}
            >
              {item}
            </button>
          )
        })}

        {showPrevNext && (
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onChange(page + 1)}
          >
            <ChevronRight />
          </button>
        )}

        {showFirst && (
          <button
            type="button"
            aria-label="Last page"
            disabled={page >= totalPages}
            onClick={() => onChange(totalPages)}
          >
            <ChevronsRight />
          </button>
        )}
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'
