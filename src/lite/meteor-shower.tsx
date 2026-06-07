import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteMeteorShowerProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  children?: ReactNode
}

const meteorShowerStyles = css`
  @layer components {
    @scope (.ui-lite-meteor-shower) {
      :scope {
        position: relative;
        overflow: hidden;
      }
    }
  }
`

export const MeteorShower = forwardRef<HTMLDivElement, LiteMeteorShowerProps>(
  ({ count = 20, children, className, ...rest }, ref) => {
    useStyles('lite-meteor-shower', meteorShowerStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-meteor-shower${className ? ` ${className}` : ''}`}
      data-count={count}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </div>
  )
  }
)
MeteorShower.displayName = 'MeteorShower'
