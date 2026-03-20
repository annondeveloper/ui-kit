import { useContext } from 'react'
import { MotionContext } from './motion-context'

export function useMotionLevel(propMotion?: number): number {
  const contextMotion = useContext(MotionContext)

  // OS preference check (SSR-safe)
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return 0
  }

  if (propMotion !== undefined) return propMotion
  return contextMotion
}
