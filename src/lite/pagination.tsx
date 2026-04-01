import { forwardRef, type HTMLAttributes } from 'react'

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
        {pages.map((p, i) =>
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
