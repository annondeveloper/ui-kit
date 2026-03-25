import { forwardRef, type AnchorHTMLAttributes } from 'react'

export interface LiteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'subtle' | 'brand'
  underline?: 'always' | 'hover' | 'none'
  external?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Link = forwardRef<HTMLAnchorElement, LiteLinkProps>(
  ({ variant = 'default', underline = 'hover', external = false, size = 'md', className, target, rel, ...rest }, ref) => {
    const externalProps = external
      ? { target: target || '_blank', rel: rel || 'noopener noreferrer' }
      : { target, rel }

    return (
      <a
        ref={ref}
        className={`ui-lite-link${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-underline={underline}
        data-size={size}
        data-external={external || undefined}
        {...externalProps}
        {...rest}
      />
    )
  }
)
Link.displayName = 'Link'
