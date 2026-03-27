import { BREAKPOINT_ORDER, type ContainerBreakpoint } from './container-breakpoints'

/**
 * A value that is either static or varies by container breakpoint.
 *
 * Static:      `"md"`
 * Responsive:  `{ xs: "sm", md: "lg" }`
 */
export type ResponsiveValue<T> = T | Partial<Record<ContainerBreakpoint, T>>

/**
 * Resolves a ResponsiveValue for a given breakpoint.
 *
 * If value is a primitive (not an object with breakpoint keys), returns it directly.
 * If value is a breakpoint map, cascades down from the current breakpoint
 * to find the closest defined value. Falls back to defaultValue if nothing matches.
 */
export function resolveResponsive<T>(
  value: ResponsiveValue<T>,
  breakpoint: ContainerBreakpoint,
  defaultValue: T,
): T {
  // Primitive / non-breakpoint-map path
  if (value === null || value === undefined) return defaultValue
  if (typeof value !== 'object' || Array.isArray(value)) return value as T

  const map = value as Partial<Record<ContainerBreakpoint, T>>
  const idx = BREAKPOINT_ORDER.indexOf(breakpoint)

  // Cascade down: try current breakpoint, then each smaller one
  for (let i = idx; i >= 0; i--) {
    const key = BREAKPOINT_ORDER[i]
    if (key in map) return map[key] as T
  }

  return defaultValue
}
