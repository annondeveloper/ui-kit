/**
 * @module @annondeveloper/ui-kit/theme
 *
 * Theme utilities for the OKLCH color system. Generate complete themes from a
 * single brand color, validate WCAG contrast ratios, and export to CSS/Tailwind/Figma.
 *
 * @example
 * ```tsx
 * import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'
 *
 * const theme = generateTheme('#6366f1', 'dark')
 * applyTheme(theme)
 * ```
 */
export { generateTheme, themeToCSS, themeToInlineStyle, applyTheme, validateContrast, type ThemeMode } from './core/tokens/generator'
export { auditThemeContrast, type ContrastPair, type ContrastResult } from './core/tokens/contrast'
export { generateHarmony, suggestHarmonies, type HarmonyType, type HarmonyResult } from './core/tokens/harmony'
export { exportTheme, encodeThemeToHash, decodeThemeFromHash, type ExportFormat } from './core/tokens/theme-export'
export { themes, lightThemes, type ThemeName } from './core/tokens/themes'
export { ThemeProvider, useTheme } from './core/tokens/theme-context'
export { type ThemeTokens, TOKEN_KEYS, TOKEN_TO_CSS } from './core/tokens/tokens'
