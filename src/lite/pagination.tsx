import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const paginationStyles = css`
  @layer components {
    @scope (.ui-lite-pagination) {
      :scope { display: flex; align-items: center; gap: 0.25rem; }
      :scope button {
        min-inline-size: 32px; block-size: 32px;
        display: inline-flex; align-items: center; justify-content: center;
        background: none; border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 6px); font-family: inherit; font-size: 0.8125rem;
        cursor: pointer; color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-size="sm"] button { min-inline-size: 28px; block-size: 28px; font-size: 0.75rem; }
      :scope[data-size="lg"] button { min-inline-size: 40px; block-size: 40px; font-size: 1rem; }
      :scope button:hover:not(:disabled) { background: oklch(100% 0 0 / 0.06); color: var(--text-primary, oklch(97% 0 0)); }
      :scope button:focus-visible { outline: 2px solid var(--brand, oklch(65% 0.2 270)); outline-offset: 2px; }
      :scope button[data-active] { background: var(--brand, oklch(65% 0.2 270)); color: oklch(100% 0 0); border-color: transparent; }
      :scope button:disabled { opacity: 0.4; cursor: not-allowed; }
      .ui-lite-pagination__ellipsis {
        display: inline-flex; align-items: center; justify-content: center;
        min-inline-size: 32px; block-size: 32px;
        color: var(--text-tertiary, oklch(55% 0 0)); font-size: 0.8125rem;
      }
      @media (forced-colors: active) {
        :scope button[data-active] { background: Highlight; color: HighlightText; }
      }
    }
  }
`

export interface LitePaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number
  totalPages: number
  onChange?: (page: number) => void
  size?: 'sm' | 'md' | 'lg'
  /** Show previous/next buttons (default true) */
  showPrevNext?: boolean
  /** Show first/last buttons */
  showFirst?: boolean
  /** Number of sibling pages shown on each side of current page (default 1) */
  siblingCount?: number
}

export const Pagination = forwardRef<HTMLElement, LitePaginationProps>(
  ({ page, totalPages, onChange, size, showPrevNext = true, showFirst = false, siblingCount = 1, className, ...rest }, ref) => {
    useStyles('lite-pagination', paginationStyles)
    // Build page range with ellipsis
    const buildPages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
      const delta = siblingCount
      const range: number[] = []
      for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i)
      const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
      if (range[0] > 1) {
        pages.push(1)
        if (range[0] > 2) pages.push('ellipsis-start')
      }
      pages.push(...range)
      if (range[range.length - 1] < totalPages) {
        if (range[range.length - 1] < totalPages - 1) pages.push('ellipsis-end')
        pages.push(totalPages)
      }
      return pages
    }

    const pages = buildPages()

    return (
      <nav ref={ref} className={`ui-lite-pagination${className ? ` ${className}` : ''}`} aria-label="Pagination" data-size={size} {...rest}>
        {showFirst && (
          <button type="button" disabled={page <= 1} onClick={() => onChange?.(1)} aria-label="First page">&laquo;&laquo;</button>
        )}
        {showPrevNext && (
          <button type="button" disabled={page <= 1} onClick={() => onChange?.(page - 1)} aria-label="Previous page">&laquo;</button>
        )}
        {pages.map((p) =>
          p === 'ellipsis-start' || p === 'ellipsis-end' ? (
            <span key={p} className="ui-lite-pagination__ellipsis" aria-hidden="true">&hellip;</span>
          ) : (
            <button
              key={p}
              type="button"
              className="ui-lite-pagination__page"
              aria-current={p === page ? 'page' : undefined}
              data-active={p === page ? '' : undefined}
              onClick={() => onChange?.(p)}
            >
              {p}
            </button>
          )
        )}
        {showPrevNext && (
          <button type="button" disabled={page >= totalPages} onClick={() => onChange?.(page + 1)} aria-label="Next page">&raquo;</button>
        )}
        {showFirst && (
          <button type="button" disabled={page >= totalPages} onClick={() => onChange?.(totalPages)} aria-label="Last page">&raquo;&raquo;</button>
        )}
      </nav>
    )
  }
)
Pagination.displayName = 'Pagination'
