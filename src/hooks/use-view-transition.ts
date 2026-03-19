'use client'

import { useCallback } from 'react'

interface ViewTransitionAPI {
  startViewTransition: (callback: () => void | Promise<void>) => { finished: Promise<void> }
}

/**
 * Hook that wraps the View Transitions API (`document.startViewTransition`)
 * for cross-component animations. Falls back to an instant state update
 * on unsupported browsers or during SSR.
 *
 * @returns `startTransition` — call with a callback that mutates state/DOM.
 *
 * @example
 * ```tsx
 * const { startTransition } = useViewTransition()
 * startTransition(() => setTab('details'))
 * ```
 */
export function useViewTransition(): { startTransition: (callback: () => void) => void } {
  const startTransition = useCallback((callback: () => void) => {
    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document
    ) {
      ;(document as unknown as ViewTransitionAPI).startViewTransition(callback)
    } else {
      callback()
    }
  }, [])

  return { startTransition } as const
}
