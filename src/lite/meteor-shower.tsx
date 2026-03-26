import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteMeteorShowerProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  children?: ReactNode
}

export const MeteorShower = forwardRef<HTMLDivElement, LiteMeteorShowerProps>(
  ({ count = 20, children, className, ...rest }, ref) => (
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
)
MeteorShower.displayName = 'MeteorShower'
