import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

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

const logViewerStyles = css`
  @layer components {
    @scope (.ui-lite-log-viewer) {
      :scope {
        overflow-y: auto;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-md, 10px);
      }

      .ui-lite-log-viewer pre {
        margin: 0;
        padding: 0.5rem;
      }

      .ui-lite-log-viewer__line {
        display: flex;
        gap: 0.5rem;
        font-family: 'SF Mono', 'Cascadia Code', ui-monospace, monospace;
        font-size: 0.75rem;
        padding: 0.0625rem 0;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .ui-lite-log-viewer__time {
        color: var(--text-secondary, oklch(70% 0 0));
        opacity: 0.6;
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
      }

      .ui-lite-log-viewer__level {
        font-weight: 600;
        flex-shrink: 0;
        inline-size: 4em;
      }
      .ui-lite-log-viewer__line[data-level="error"] .ui-lite-log-viewer__level { color: oklch(62% 0.22 25); }
      .ui-lite-log-viewer__line[data-level="warn"] .ui-lite-log-viewer__level { color: oklch(78% 0.17 85); }
      .ui-lite-log-viewer__line[data-level="info"] .ui-lite-log-viewer__level { color: oklch(70% 0.17 250); }
      .ui-lite-log-viewer__line[data-level="debug"] .ui-lite-log-viewer__level { color: var(--text-secondary, oklch(70% 0 0)); }

      .ui-lite-log-viewer__msg {
        color: var(--text-primary, oklch(85% 0 0));
        min-inline-size: 0;
      }
    }
  }
`

export const LogViewer = forwardRef<HTMLDivElement, LiteLogViewerProps>(
  ({ lines, maxHeight = '400px', className, style, ...rest }, ref) => {
    useStyles('lite-log-viewer', logViewerStyles)
    return (
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
  }
)
LogViewer.displayName = 'LogViewer'
