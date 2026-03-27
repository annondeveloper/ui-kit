import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteJsonViewerProps extends HTMLAttributes<HTMLDivElement> {
  data: unknown
  initialExpandDepth?: number
  collapsed?: boolean
  rootName?: string
}

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
