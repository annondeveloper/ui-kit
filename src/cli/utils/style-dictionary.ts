import type { ThemeTokens } from '../../core/tokens/tokens'

/**
 * Converts ThemeTokens to Style Dictionary format.
 *
 * Output shape:
 * ```json
 * {
 *   "color": {
 *     "brand": { "value": "oklch(65% 0.2 270)" },
 *     "brand-light": { "value": "..." },
 *     ...
 *   }
 * }
 * ```
 */
export function themeToStyleDictionary(tokens: ThemeTokens, name: string): object {
  const color: Record<string, { value: string }> = {}

  for (const [key, value] of Object.entries(tokens)) {
    const dashed = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    color[dashed] = { value }
  }

  return { color }
}
