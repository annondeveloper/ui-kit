import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useMotionLevel } from './use-motion-level'

export interface SkeletonTransitionResult {
  showSkeleton: boolean
  contentStyle: CSSProperties
}

/**
 * Smoothly transitions from skeleton loading state to real content.
 * When `loading` transitions from true to false:
 *   1. Keeps showing skeleton for a minimum display time (50ms)
 *   2. Fades skeleton out while fading content in
 *
 * Returns `showSkeleton` boolean and `contentStyle` to apply to the content wrapper.
 */
export function useSkeletonTransition(
  loading: boolean,
  options: { minDisplayTime?: number; fadeDuration?: number } = {}
): SkeletonTransitionResult {
  const { minDisplayTime = 50, fadeDuration = 200 } = options
  const motionLevel = useMotionLevel()
  const [showSkeleton, setShowSkeleton] = useState(loading)
  const [contentOpacity, setContentOpacity] = useState(loading ? 0 : 1)
  const loadingStartTime = useRef<number>(loading ? Date.now() : 0)
  const prevLoading = useRef(loading)

  useEffect(() => {
    // Track when loading starts
    if (loading && !prevLoading.current) {
      loadingStartTime.current = Date.now()
      setShowSkeleton(true)
      setContentOpacity(0)
    }

    // Handle loading -> done transition
    if (!loading && prevLoading.current) {
      const elapsed = Date.now() - loadingStartTime.current
      const remaining = Math.max(0, minDisplayTime - elapsed)

      if (motionLevel === 0) {
        // Instant transition for reduced motion
        setShowSkeleton(false)
        setContentOpacity(1)
        prevLoading.current = loading
        return
      }

      const minTimer = setTimeout(() => {
        setShowSkeleton(false)
        // Small delay before fading in content
        requestAnimationFrame(() => {
          setContentOpacity(1)
        })
      }, remaining)

      prevLoading.current = loading
      return () => clearTimeout(minTimer)
    }

    prevLoading.current = loading
  }, [loading, minDisplayTime, motionLevel])

  const contentStyle: CSSProperties =
    motionLevel === 0
      ? {}
      : {
          opacity: contentOpacity,
          transition: `opacity ${fadeDuration}ms var(--ease-out, ease-out)`,
        }

  return { showSkeleton, contentStyle }
}
