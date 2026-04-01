import { forwardRef, type HTMLAttributes } from 'react'

export interface LitePaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number
  totalPages: number
  onChange?: (page: number) => void
}

export const Pagination = forwardRef<HTMLElement, LitePaginationProps>(
  ({ page, totalPages, onChange, className, ...rest }, ref) => (
    <nav ref={ref} className={`ui-lite-pagination${className ? ` ${className}` : ''}`} aria-label="Pagination" {...rest}>
      <button type="button" disabled={page <= 1} onClick={() => onChange?.(page - 1)} aria-label="Previous page">&laquo;</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
      ))}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange?.(page + 1)} aria-label="Next page">&raquo;</button>
    </nav>
  )
)
Pagination.displayName = 'Pagination'
