import { forwardRef, type AnchorHTMLAttributes } from 'react'

export interface LiteViewTransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** In lite mode, this is a plain anchor — no view transitions */
}

export const ViewTransitionLink = forwardRef<HTMLAnchorElement, LiteViewTransitionLinkProps>(
  ({ className, ...rest }, ref) => (
    <a ref={ref} className={`ui-lite-link${className ? ` ${className}` : ''}`} {...rest} />
  )
)
ViewTransitionLink.displayName = 'ViewTransitionLink'
