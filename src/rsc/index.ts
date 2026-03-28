/**
 * RSC (React Server Components) entry point.
 *
 * Exports only server-safe utilities — no hooks, no client-side state,
 * no browser APIs. Safe to import in Server Components.
 */
export { ServerStyleSheet } from '../core/styles/server-style-sheet'
export { CONTAINER_BREAKPOINTS, type ContainerBreakpoint } from '../core/utils/container-breakpoints'
export { generateTheme, themeToCSS } from '../core/tokens/generator'
export type { ThemeTokens } from '../core/tokens/tokens'
export type { ThemeMode } from '../core/tokens/generator'
