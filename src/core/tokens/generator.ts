import { hexToOklch, adjustLightness, type OklchColor } from '../utils/color'
import { type ThemeTokens, TOKEN_TO_CSS } from './tokens'
import { auditThemeContrast, type ContrastResult } from './contrast'

export type ThemeMode = 'dark' | 'light'

export function generateTheme(brandHex: string, mode: ThemeMode = 'dark'): ThemeTokens {
  const brand = hexToOklch(brandHex)

  if (mode === 'dark') {
    return {
      brand: formatOklch(brand),
      brandLight: formatOklch(adjustLightness(brand, 0.1)),
      brandDark: formatOklch(adjustLightness(brand, -0.1)),
      brandSubtle: formatOklchAlpha(brand, 0.08),
      brandGlow: formatOklchAlpha(brand, 0.15),
      bgBase: `oklch(8% 0.02 ${brand.h})`,
      bgSurface: `oklch(12% 0.015 ${brand.h})`,
      bgElevated: `oklch(16% 0.02 ${brand.h + 5})`,
      bgOverlay: `oklch(6% 0.025 ${brand.h - 5} / 0.85)`,
      borderSubtle: 'oklch(100% 0 0 / 0.04)',
      borderDefault: 'oklch(100% 0 0 / 0.08)',
      borderStrong: 'oklch(100% 0 0 / 0.14)',
      borderGlow: formatOklchAlpha(brand, 0.2),
      textPrimary: 'oklch(97% 0 0)',
      textSecondary: 'oklch(70% 0 0)',
      textTertiary: 'oklch(45% 0 0)',
      textDisabled: 'oklch(30% 0 0)',
      statusOk: 'oklch(72% 0.19 145)',
      statusWarning: 'oklch(78% 0.17 85)',
      statusCritical: 'oklch(62% 0.22 25)',
      statusInfo: 'oklch(70% 0.17 250)',
      aurora1: `oklch(60% 0.15 ${brand.h - 20} / 0.06)`,
      aurora2: `oklch(55% 0.18 ${brand.h + 30} / 0.04)`,
    }
  }

  // light mode
  return {
    brand: formatOklch(brand),
    brandLight: formatOklch(adjustLightness(brand, 0.1)),
    brandDark: formatOklch(adjustLightness(brand, -0.1)),
    brandSubtle: formatOklchAlpha(brand, 0.08),
    brandGlow: formatOklchAlpha(brand, 0.15),
    bgBase: `oklch(98% 0.005 ${brand.h})`,
    bgSurface: 'oklch(100% 0 0)',
    bgElevated: 'oklch(100% 0 0)',
    bgOverlay: `oklch(20% 0.02 ${brand.h} / 0.4)`,
    borderSubtle: 'oklch(0% 0 0 / 0.04)',
    borderDefault: 'oklch(0% 0 0 / 0.08)',
    borderStrong: 'oklch(0% 0 0 / 0.14)',
    borderGlow: formatOklchAlpha(brand, 0.2),
    textPrimary: `oklch(15% 0.01 ${brand.h})`,
    textSecondary: 'oklch(40% 0 0)',
    textTertiary: 'oklch(60% 0 0)',
    textDisabled: 'oklch(75% 0 0)',
    statusOk: 'oklch(72% 0.19 145)',
    statusWarning: 'oklch(78% 0.17 85)',
    statusCritical: 'oklch(62% 0.22 25)',
    statusInfo: 'oklch(70% 0.17 250)',
    aurora1: `oklch(70% 0.1 ${brand.h - 20} / 0.04)`,
    aurora2: `oklch(65% 0.12 ${brand.h + 30} / 0.03)`,
  }
}

function formatOklch(c: OklchColor): string {
  return `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${c.h.toFixed(1)})`
}

function formatOklchAlpha(c: OklchColor, alpha: number): string {
  return `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${c.h.toFixed(1)} / ${alpha})`
}

export function themeToCSS(tokens: ThemeTokens, selector = ':root'): string {
  const lines = Object.entries(tokens).map(([key, value]) => {
    const cssVar = TOKEN_TO_CSS[key as keyof ThemeTokens]
    return `  ${cssVar}: ${value};`
  })
  return `${selector} {\n${lines.join('\n')}\n}`
}

export function applyTheme(tokens: ThemeTokens): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS[key as keyof ThemeTokens]
    root.style.setProperty(cssVar, value)
  }
}

/**
 * Convert theme tokens to an inline-style object of CSS custom properties,
 * suitable for scoping a theme to a single element:
 *
 * ```tsx
 * <div style={themeToInlineStyle(generateTheme('#10b981'))}>...</div>
 * ```
 */
export function themeToInlineStyle(tokens: ThemeTokens): Record<string, string> {
  const style: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens)) {
    const cssVar = TOKEN_TO_CSS[key as keyof ThemeTokens]
    if (cssVar) style[cssVar] = value
  }
  return style
}

/**
 * Validate a theme's text-on-background contrast against WCAG 2.1.
 *
 * `ratio` is the contrast of primary text on the base background; `aa`/`aaa`
 * report whether primary text clears 4.5:1 / 7:1 on every surface. `pairs`
 * carries the full audit (worst contrast first) for detailed reporting.
 */
export function validateContrast(tokens: ThemeTokens): ContrastResult {
  const pairs = auditThemeContrast(tokens)
  const primaryPairs = pairs.filter(p => p.foreground.token === 'textPrimary')
  const basePair = primaryPairs.find(p => p.background.token === 'bgBase')
  const ratio = basePair ? basePair.ratio : (primaryPairs[0]?.ratio ?? 0)
  const aa = primaryPairs.length > 0 && primaryPairs.every(p => p.passAA)
  const aaa = primaryPairs.length > 0 && primaryPairs.every(p => p.passAAA)
  return { ratio, aa, aaa, pairs }
}
