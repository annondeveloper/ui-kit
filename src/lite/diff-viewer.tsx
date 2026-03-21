import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteDiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string
  newValue: string
  oldTitle?: string
  newTitle?: string
}

export const DiffViewer = forwardRef<HTMLDivElement, LiteDiffViewerProps>(
  ({ oldValue, newValue, oldTitle = 'Old', newTitle = 'New', className, ...rest }, ref) => {
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
