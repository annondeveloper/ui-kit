import type { ThemeTokens } from '../../core/tokens/tokens'
import { TOKEN_TO_CSS } from '../../core/tokens/tokens'

/**
 * Attempts to convert an OKLCH color string to a hex approximation.
 * Falls through to returning the raw OKLCH string if parsing fails.
 */
function oklchToApproxHex(oklch: string): string {
  // Simple extraction: oklch(L% C H) or oklch(L% C H / A)
  const match = oklch.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/)
  if (!match) return oklch

  const L = parseFloat(match[1]) / 100
  const C = parseFloat(match[2])
  const H = parseFloat(match[3])

  // Approximate conversion via OKLAB → linear sRGB → hex
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const lc = l_ * l_ * l_
  const mc = m_ * m_ * m_
  const sc = s_ * s_ * s_

  let r = 3.2404542 * lc - 1.5371385 * mc - 0.4985314 * sc
  let g = -0.9692660 * lc + 1.8760108 * mc + 0.0415560 * sc
  let bl = 0.0556434 * lc - 0.2040259 * mc + 1.0572252 * sc

  // Linear to sRGB
  const toSrgb = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  r = toSrgb(Math.max(0, Math.min(1, r)))
  g = toSrgb(Math.max(0, Math.min(1, g)))
  bl = toSrgb(Math.max(0, Math.min(1, bl)))

  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

/** Converts a camelCase token key to a human-readable variable name */
function tokenToVariableName(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * Converts ThemeTokens to Figma Variables REST API format.
 */
export function themeToFigmaVariables(
  tokens: ThemeTokens,
  name: string,
  mode: 'dark' | 'light' = 'dark'
): object {
  const variables = Object.entries(tokens).map(([key, value]) => ({
    name: tokenToVariableName(key),
    type: 'COLOR' as const,
    value: oklchToApproxHex(value),
  }))

  return {
    version: '1.0',
    collections: [
      {
        name: `${name} Theme`,
        modes: [{ name: mode }],
        variables,
      },
    ],
  }
}
