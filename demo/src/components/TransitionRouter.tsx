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

      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (anchor.target === '_blank') return
      if (href.startsWith('http') || href.startsWith('//')) return
      if (href.startsWith('#')) return

      const url = new URL(anchor.href, window.location.origin)
      const basename = '/ui-kit'
      let path = url.pathname
      if (path.startsWith(basename)) {
        path = path.slice(basename.length) || '/'
      }

      // Skip if already on this path
      const currentPath = window.location.pathname.startsWith(basename)
        ? window.location.pathname.slice(basename.length) || '/'
        : window.location.pathname
      if (path === currentPath) return

      e.preventDefault()

      // Always navigate immediately — never let View Transition block navigation
      if (!canTransition || transitioning.current) {
        navigate(path)
        window.scrollTo(0, 0)
        return
      }

      transitioning.current = true

      // Safety timeout — never stay stuck for more than 500ms
      const timeout = setTimeout(() => {
        transitioning.current = false
      }, 500)

      try {
        const transition = document.startViewTransition!(() => {
          navigate(path)
          window.scrollTo(0, 0)
          // Resolve immediately — let React handle rendering asynchronously
          return Promise.resolve()
        })

        transition.finished.finally(() => {
          clearTimeout(timeout)
          transitioning.current = false
        })
      } catch {
        // If View Transition fails for any reason, navigate anyway
        clearTimeout(timeout)
        transitioning.current = false
        navigate(path)
        window.scrollTo(0, 0)
      }
    },
    [navigate],
  )

  return (
    <div onClick={handleClick} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
