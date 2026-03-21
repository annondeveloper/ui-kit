import { generateTheme, type ThemeMode } from './generator'
import type { ThemeTokens } from './tokens'

/**
 * 10 named theme presets — pre-built themes users can switch between.
 * Each provides a complete ThemeTokens object for dark mode (default).
 */
export const themes = {
  // Default — our Aurora Fluid identity
  aurora: generateTheme('#6366f1'),          // Indigo

  // Warm themes
  sunset: generateTheme('#f97316'),           // Orange
  rose: generateTheme('#f43f5e'),             // Rose/Pink
  amber: generateTheme('#f59e0b'),            // Amber/Gold

  // Cool themes
  ocean: generateTheme('#0ea5e9'),            // Sky blue
  emerald: generateTheme('#10b981'),          // Green
  cyan: generateTheme('#06b6d4'),             // Cyan/Teal

  // Vibrant themes
  violet: generateTheme('#8b5cf6'),           // Purple
  fuchsia: generateTheme('#d946ef'),          // Magenta/Fuchsia

  // Neutral themes
  slate: generateTheme('#64748b'),            // Gray/Slate
} as const

/**
 * Light-mode variants of each named theme.
 */
export const lightThemes = {
  aurora: generateTheme('#6366f1', 'light'),
  sunset: generateTheme('#f97316', 'light'),
  rose: generateTheme('#f43f5e', 'light'),
  amber: generateTheme('#f59e0b', 'light'),
  ocean: generateTheme('#0ea5e9', 'light'),
  emerald: generateTheme('#10b981', 'light'),
  cyan: generateTheme('#06b6d4', 'light'),
  violet: generateTheme('#8b5cf6', 'light'),
  fuchsia: generateTheme('#d946ef', 'light'),
  slate: generateTheme('#64748b', 'light'),
} as const

/** Union type of available theme names */
export type ThemeName = keyof typeof themes
