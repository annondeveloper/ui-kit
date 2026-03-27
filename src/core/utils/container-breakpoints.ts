export const CONTAINER_BREAKPOINTS = {
  xs: 200,
  sm: 320,
  md: 480,
  lg: 640,
  xl: 960,
} as const

export type ContainerBreakpoint = keyof typeof CONTAINER_BREAKPOINTS

/** Ordered breakpoint keys from smallest to largest */
const ORDERED: ContainerBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']

/**
 * Returns the breakpoint name for a given container width.
 * Uses a mobile-first cascade: the largest breakpoint whose
 * threshold is <= width wins.
 */
export function getBreakpoint(width: number): ContainerBreakpoint {
  if (width >= 960) return 'xl'
  if (width >= 640) return 'lg'
  if (width >= 480) return 'md'
  if (width >= 320) return 'sm'
  return 'xs'
}

export { ORDERED as BREAKPOINT_ORDER }
