import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'subtle' | 'brand'
  underline?: 'always' | 'hover' | 'none'
  external?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const linkStyles = css`
  @layer components {
    @scope (.ui-lite-link) {
      :scope {
        display: inline;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        border-radius: var(--radius-xs, 2px);
        text-decoration: none;
        text-underline-offset: 0.2em;
        color: var(--brand, oklch(65% 0.2 270));
      }

      :scope[data-size="xs"] { font-size: 0.6875rem; }
      :scope[data-size="sm"] { font-size: 0.75rem; }
      :scope[data-size="md"] { font-size: 0.875rem; }
      :scope[data-size="lg"] { font-size: 1rem; }
      :scope[data-size="xl"] { font-size: 1.125rem; }

      :scope[data-variant="default"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="default"]:hover {
        color: var(--brand-light, oklch(72% 0.2 270));
      }

      :scope[data-variant="subtle"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="subtle"]:hover {
        color: var(--text-primary, oklch(97% 0 0));
      }

      :scope[data-variant="brand"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="brand"]:hover {
        color: var(--brand-light, oklch(72% 0.2 270));
      }

      :scope[data-underline="always"] {
        text-decoration: underline;
        text-decoration-color: currentColor;
      }
      :scope[data-underline="hover"] {
        text-decoration: none;
      }
      :scope[data-underline="hover"]:hover {
        text-decoration: underline;
      }
      :scope[data-underline="none"],
      :scope[data-underline="none"]:hover {
        text-decoration: none;
      }

      :scope[data-external="true"]::after {
        content: ' →';
        display: inline;
        font-size: 0.85em;
      }

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      @media (forced-colors: active) {
        :scope {
          color: LinkText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      @media print {
        :scope {
          color: inherit;
          text-decoration: underline;
        }
        :scope[data-external="true"]::after {
          content: ' (' attr(href) ')';
          font-size: 0.8em;
        }
      }
    }
  }
`

export const Link = forwardRef<HTMLAnchorElement, LiteLinkProps>(
  ({ variant = 'default', underline = 'hover', external = false, size = 'md', className, target, rel, ...rest }, ref) => {
    useStyles('lite-link', linkStyles)
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
