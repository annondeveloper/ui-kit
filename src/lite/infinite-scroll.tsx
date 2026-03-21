import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteInfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  onLoadMore: () => void
  hasMore: boolean
  loading?: boolean
  children: ReactNode
}

export const InfiniteScroll = forwardRef<HTMLDivElement, LiteInfiniteScrollProps>(
  ({ onLoadMore, hasMore, loading, className, children, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-infinite-scroll${className ? ` ${className}` : ''}`} {...rest}>
      {children}
      {hasMore && (
        <div className="ui-lite-infinite-scroll__trigger">
          {loading ? (
            <span className="ui-lite-infinite-scroll__loading">Loading...</span>
          ) : (
            <button type="button" className="ui-lite-button" data-variant="ghost" onClick={onLoadMore}>Load more</button>
          )}
        </div>
      )}
    </div>
  )
)
InfiniteScroll.displayName = 'InfiniteScroll'
