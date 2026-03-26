import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBackgroundBoxesProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number
  cols?: number
  children?: ReactNode
}

export const BackgroundBoxes = forwardRef<HTMLDivElement, LiteBackgroundBoxesProps>(
  ({ rows = 15, cols = 15, children, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-background-boxes${className ? ` ${className}` : ''}`}
      data-rows={rows}
      data-cols={cols}
      {...rest}
    >
      {children}
    </div>
  )
)
BackgroundBoxes.displayName = 'BackgroundBoxes'
