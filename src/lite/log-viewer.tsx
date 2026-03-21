import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteLogLine {
  id: string | number
  timestamp?: number | Date
  level?: 'debug' | 'info' | 'warn' | 'error'
  message: string
}

export interface LiteLogViewerProps extends HTMLAttributes<HTMLDivElement> {
  lines: LiteLogLine[]
  maxHeight?: string
}

export const LogViewer = forwardRef<HTMLDivElement, LiteLogViewerProps>(
  ({ lines, maxHeight = '400px', className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-log-viewer${className ? ` ${className}` : ''}`}
      style={{ ...style, maxHeight }}
      {...rest}
    >
      <pre>
        {lines.map(line => (
          <div key={line.id} className="ui-lite-log-viewer__line" data-level={line.level}>
            {line.timestamp && (
              <span className="ui-lite-log-viewer__time">
                {new Date(line.timestamp).toISOString().slice(11, 23)}
              </span>
            )}
            {line.level && <span className="ui-lite-log-viewer__level">[{line.level.toUpperCase()}]</span>}
            <span className="ui-lite-log-viewer__msg">{line.message}</span>
          </div>
        ))}
      </pre>
    </div>
  )
)
LogViewer.displayName = 'LogViewer'
