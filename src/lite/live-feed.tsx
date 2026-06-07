import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteFeedItem {
  id: string
  content: ReactNode
  timestamp: number | Date
}

export interface LiteLiveFeedProps extends HTMLAttributes<HTMLDivElement> {
  items: LiteFeedItem[]
  maxHeight?: string
}

const liveFeedStyles = css`
  @layer components {
    @scope (.ui-lite-live-feed) {
      :scope {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-md, 10px);
      }

      .ui-lite-live-feed__item {
        display: flex;
        gap: 0.5rem;
        padding: 0.375rem 0.5rem;
        border-block-end: 1px solid oklch(100% 0 0 / 0.02);
        font-size: 0.8125rem;
      }

      .ui-lite-live-feed__time {
        flex-shrink: 0;
        font-size: 0.6875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        opacity: 0.6;
        font-variant-numeric: tabular-nums;
      }

      .ui-lite-live-feed__content {
        min-inline-size: 0;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export const LiveFeed = forwardRef<HTMLDivElement, LiteLiveFeedProps>(
  ({ items, maxHeight = '400px', className, style, ...rest }, ref) => {
    useStyles('lite-live-feed', liveFeedStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-live-feed${className ? ` ${className}` : ''}`}
      style={{ ...style, maxHeight }}
      aria-live="polite"
      {...rest}
    >
      {items.map(item => (
        <div key={item.id} className="ui-lite-live-feed__item">
          <span className="ui-lite-live-feed__time">
            {new Date(item.timestamp).toLocaleTimeString()}
          </span>
          <div className="ui-lite-live-feed__content">{item.content}</div>
        </div>
      ))}
    </div>
  )
  }
)
LiveFeed.displayName = 'LiveFeed'
