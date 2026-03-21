import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** In lite mode, content is always visible (no animation) */
}

export const ScrollReveal = forwardRef<HTMLDivElement, LiteScrollRevealProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-scroll-reveal${className ? ` ${className}` : ''}`} {...rest} />
  )
)
ScrollReveal.displayName = 'ScrollReveal'
