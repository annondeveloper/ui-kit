import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteViewTransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** In lite mode, this is a plain anchor — no view transitions */
}

const viewTransitionLinkStyles = css`
  @layer components {
    @scope (.ui-lite-link) {
      :scope {
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: none;
        cursor: pointer;
      }

      :scope:hover {
        text-decoration: underline;
      }

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      @media (forced-colors: active) {
        :scope {
          color: LinkText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }
    }
  }
`

export const ViewTransitionLink = forwardRef<HTMLAnchorElement, LiteViewTransitionLinkProps>(
  ({ className, ...rest }, ref) => {
    useStyles('lite-link', viewTransitionLinkStyles)
    return <a ref={ref} className={`ui-lite-link${className ? ` ${className}` : ''}`} {...rest} />
  }
)
ViewTransitionLink.displayName = 'ViewTransitionLink'
