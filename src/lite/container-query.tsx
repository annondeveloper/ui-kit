import { forwardRef, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const containerQueryStyles = css`
  @layer components {
    @scope (.ui-lite-container-query) {
      :scope {
        container-type: inline-size;
        display: block;
      }
    }
  }
`

export interface LiteContainerQueryProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties | undefined
}

/**
 * Lite ContainerQuery — a simple wrapper that sets `container-type: inline-size`.
 * No JS measurement, no render-prop. Use CSS @container queries in children.
 */
export const ContainerQuery = forwardRef<HTMLDivElement, LiteContainerQueryProps>(
  ({ children, className, style }, ref) => {
    useStyles('lite-container-query', containerQueryStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-container-query${className ? ` ${className}` : ''}`}
      style={style ? { containerType: 'inline-size' as const, ...style } : { containerType: 'inline-size' as const }}
    >
      {children}
    </div>
    )
  },
)

ContainerQuery.displayName = 'ContainerQuery'
