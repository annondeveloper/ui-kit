'use client'

import { useCallback, useRef, type ReactNode, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Feature detection ──────────────────────────────────────────────────────

const canTransition =
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function'

// ─── TransitionRouter ───────────────────────────────────────────────────────
// Wraps an area of the page so that internal <a>/<Link> clicks are
// intercepted and wrapped in the View Transition API for a smooth crossfade.
// Falls back to normal navigation when the API is unavailable.

interface TransitionRouterProps {
  children: ReactNode
}

export function TransitionRouter({ children }: TransitionRouterProps) {
  const navigate = useNavigate()
  const transitioning = useRef(false)

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Only intercept left-clicks without modifier keys
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      // Walk up from the target to find a link element
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      // Only intercept internal links (same origin, relative paths)
      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, hash-only links, and target="_blank"
      if (anchor.target === '_blank') return
      if (href.startsWith('http') || href.startsWith('//')) return
      if (href.startsWith('#')) return

      // Determine the path (strip basename if present)
      const url = new URL(anchor.href, window.location.origin)
      const basename = '/ui-kit'
      let path = url.pathname
      if (path.startsWith(basename)) {
        path = path.slice(basename.length) || '/'
      }

      // Skip if already on this path
      if (path === window.location.pathname.replace(basename, '') || path === window.location.pathname) return

      // Prevent default navigation
      e.preventDefault()

      // If View Transition API is not available or already transitioning, navigate directly
      if (!canTransition || transitioning.current) {
        navigate(path)
        return
      }

      // Wrap navigation in a view transition
      transitioning.current = true
      const transition = document.startViewTransition!(() => {
        // flushSync not needed here — React Router navigation is async
        // and the View Transition API handles the snapshot timing
        navigate(path)
        // Return a promise that resolves after a microtask to let React commit
        return new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve()
            })
          })
        })
      })

      transition.finished.finally(() => {
        transitioning.current = false
      })
    },
    [navigate],
  )

  return (
    <div onClick={handleClick} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
