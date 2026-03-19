'use client'

import type React from 'react'
import { useCallback } from 'react'
import { cn } from '../utils'
import { useViewTransition } from '../hooks/use-view-transition'

export interface ViewTransitionLinkProps {
  /** Navigation URL. If provided, navigates after the transition. */
  href?: string
  /** Click handler. Runs inside the view transition. */
  onClick?: () => void
  /** CSS `view-transition-name` applied to this element for targeted transitions. */
  transitionName?: string
  /** Link / button content. */
  children: React.ReactNode
  /** Additional class names. */
  className?: string
}

/**
 * @description A link or button that triggers a View Transition before navigating
 * or executing a callback. Applies an optional `view-transition-name` for CSS
 * `::view-transition-old` / `::view-transition-new` targeting.
 *
 * Falls back to instant navigation on unsupported browsers.
 */
export function ViewTransitionLink({
  href,
  onClick,
  transitionName,
  children,
  className,
}: ViewTransitionLinkProps): React.JSX.Element {
  const { startTransition } = useViewTransition()

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Let modifier-clicks pass through for new-tab behavior
      if (e.metaKey || e.ctrlKey || e.shiftKey) return

      if (href) e.preventDefault()

      startTransition(() => {
        onClick?.()
        if (href && typeof window !== 'undefined') {
          window.location.href = href
        }
      })
    },
    [href, onClick, startTransition],
  )

  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      href={href}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center transition-colors',
        'text-[hsl(var(--text-primary))] hover:text-[hsl(var(--brand-primary))]',
        className,
      )}
      style={transitionName ? { viewTransitionName: transitionName } as React.CSSProperties : undefined}
    >
      {children}
    </Tag>
  )
}
