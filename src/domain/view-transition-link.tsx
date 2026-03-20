'use client'

import {
  useCallback,
  type AnchorHTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ViewTransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  transitionName?: string
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const viewTransitionLinkStyles = css`
  @layer components {
    @scope (.ui-view-transition-link) {
      :scope {
        display: inline;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
      }

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Forced colors ─────────────────────────────────── */

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

// ─── Component ──────────────────────────────────────────────────────────────

export function ViewTransitionLink({
  transitionName,
  children,
  className,
  style,
  onClick,
  href,
  ...rest
}: ViewTransitionLinkProps) {
  useStyles('view-transition-link', viewTransitionLinkStyles)

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)

      // If View Transitions API is available and not already prevented
      if (!e.defaultPrevented && typeof document.startViewTransition === 'function') {
        e.preventDefault()
        document.startViewTransition(() => {
          if (href) {
            window.location.href = href
          }
        })
      }
      // Otherwise, fall through to native anchor navigation
    },
    [onClick, href]
  )

  const combinedStyle: React.CSSProperties | undefined =
    transitionName
      ? { ...style, viewTransitionName: transitionName }
      : style || undefined

  return (
    <a
      href={href}
      className={cn('ui-view-transition-link', className)}
      style={combinedStyle}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}

ViewTransitionLink.displayName = 'ViewTransitionLink'
