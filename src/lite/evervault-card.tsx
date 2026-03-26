import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteEvervaultCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const EvervaultCard = forwardRef<HTMLDivElement, LiteEvervaultCardProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-evervault-card${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
  )
)
EvervaultCard.displayName = 'EvervaultCard'
