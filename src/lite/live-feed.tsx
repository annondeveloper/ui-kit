import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteFeedItem {
  id: string
  content: ReactNode
  timestamp: number | Date
}

export interface LiteLiveFeedProps extends HTMLAttributes<HTMLDivElement> {
  items: LiteFeedItem[]
  maxHeight?: string
}

export const LiveFeed = forwardRef<HTMLDivElement, LiteLiveFeedProps>(
  ({ items, maxHeight = '400px', className, style, ...rest }, ref) => (
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
)
LiveFeed.displayName = 'LiveFeed'
