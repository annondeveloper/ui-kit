import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteJsonViewerProps extends HTMLAttributes<HTMLDivElement> {
  data: unknown
  initialExpandDepth?: number
  collapsed?: boolean
  rootName?: string
}

const jsonViewerStyles = css`
  @layer components {
    @scope (.ui-lite-json-viewer) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(18% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: auto;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        padding: var(--space-md, 1rem);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-lite-json-viewer pre {
        margin: 0;
      }
    }
  }
`

function renderValue(value: unknown, depth: number, maxDepth: number, indent: number): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (depth >= maxDepth) return Array.isArray(value) ? '[...]' : '{...}'

  const pad = ' '.repeat(indent * (depth + 1))
  const closePad = ' '.repeat(indent * depth)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map(v => `${pad}${renderValue(v, depth + 1, maxDepth, indent)}`)
    return `[\n${items.join(',\n')}\n${closePad}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const items = entries.map(([k, v]) => `${pad}"${k}": ${renderValue(v, depth + 1, maxDepth, indent)}`)
    return `{\n${items.join(',\n')}\n${closePad}}`
  }

  return String(value)
}

/** Lite JSON viewer — static pre-formatted output, no animation */
export const JsonViewer = forwardRef<HTMLDivElement, LiteJsonViewerProps>(
  ({ data, initialExpandDepth = 2, collapsed = false, rootName = 'root', className, ...rest }, ref) => {
    useStyles('lite-json-viewer', jsonViewerStyles)
    const depth = collapsed ? 0 : initialExpandDepth
    const formatted = renderValue(data, 0, depth, 2)

    return (
      <div
        ref={ref}
        className={`ui-lite-json-viewer${className ? ` ${className}` : ''}`}
        role="group"
        aria-label={`JSON viewer: ${rootName}`}
        {...rest}
      >
        <pre style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
          {formatted}
        </pre>
      </div>
    )
  }
)
JsonViewer.displayName = 'JsonViewer'
