import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const diffViewerStyles = css`
  @layer components {
    @scope (.ui-lite-diff-viewer) {
      :scope {
        overflow-x: auto;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-md, 10px);
      }
      table {
        inline-size: 100%;
        border-collapse: collapse;
        font-family: var(--font-mono, ui-monospace, monospace);
        font-size: 0.75rem;
      }
      th {
        padding: 0.375rem 0.75rem;
        text-align: start;
        font-weight: 600;
        background: oklch(100% 0 0 / 0.02);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: var(--text-secondary, oklch(70% 0 0));
      }
      td {
        padding: 0.125rem 0.75rem;
        white-space: pre-wrap;
        vertical-align: top;
        inline-size: 50%;
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-lite-diff-viewer__removed {
        background: oklch(62% 0.22 25 / 0.08);
      }
      .ui-lite-diff-viewer__added {
        background: oklch(72% 0.19 145 / 0.08);
      }
    }
  }
`

export interface LiteDiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string
  newValue: string
  oldTitle?: string
  newTitle?: string
}

export const DiffViewer = forwardRef<HTMLDivElement, LiteDiffViewerProps>(
  ({ oldValue, newValue, oldTitle = 'Old', newTitle = 'New', className, ...rest }, ref) => {
    useStyles('lite-diff-viewer', diffViewerStyles)
    const oldLines = useMemo(() => oldValue.split('\n'), [oldValue])
    const newLines = useMemo(() => newValue.split('\n'), [newValue])
    const maxLen = Math.max(oldLines.length, newLines.length)

    return (
      <div ref={ref} className={`ui-lite-diff-viewer${className ? ` ${className}` : ''}`} {...rest}>
        <table>
          <thead>
            <tr><th>{oldTitle}</th><th>{newTitle}</th></tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLen }, (_, i) => {
              const oldLine = oldLines[i] ?? ''
              const newLine = newLines[i] ?? ''
              const changed = oldLine !== newLine
              return (
                <tr key={i} data-changed={changed ? '' : undefined}>
                  <td className={changed ? 'ui-lite-diff-viewer__removed' : ''}>{oldLine}</td>
                  <td className={changed ? 'ui-lite-diff-viewer__added' : ''}>{newLine}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
)
DiffViewer.displayName = 'DiffViewer'
