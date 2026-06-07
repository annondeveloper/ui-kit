import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { Button } from './button'

export interface LiteInfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  onLoadMore: () => void
  hasMore: boolean
  loading?: boolean
  children: ReactNode
}

const infiniteScrollStyles = css`
  @layer components {
    @scope (.ui-lite-infinite-scroll) {
      :scope {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        position: relative;
      }

      .ui-lite-infinite-scroll__trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        flex-shrink: 0;
      }

      .ui-lite-infinite-scroll__loading {
        font-size: 0.875rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
    }
  }
`

export const InfiniteScroll = forwardRef<HTMLDivElement, LiteInfiniteScrollProps>(
  ({ onLoadMore, hasMore, loading, className, children, ...rest }, ref) => {
    useStyles('lite-infinite-scroll', infiniteScrollStyles)
    return (
    <div ref={ref} className={`ui-lite-infinite-scroll${className ? ` ${className}` : ''}`} {...rest}>
      {children}
      {hasMore && (
        <div className="ui-lite-infinite-scroll__trigger">
          {loading ? (
            <span className="ui-lite-infinite-scroll__loading">Loading...</span>
          ) : (
            <Button variant="ghost" onClick={onLoadMore}>Load more</Button>
          )}
        </div>
      )}
    </div>
  )
  }
)
InfiniteScroll.displayName = 'InfiniteScroll'
