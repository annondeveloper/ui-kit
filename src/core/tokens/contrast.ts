import type { ThemeTokens } from './tokens'

/**
 * WCAG contrast auditing for OKLCH theme tokens.
 *
 * Token values are stored as CSS color strings (e.g. `oklch(97% 0 0)`), so this
 * module parses them directly rather than going through the OklchColor object
 * pipeline in `core/utils/color`. The relative-luminance formula here is the
 * WCAG 2.x definition (0.2126/0.7152/0.0722 on linearized sRGB), which is the
 * correct basis for contrast ratios.
 */

export interface ContrastPair {
  foreground: { token: string; value: string }
  background: { token: string; value: string }
  ratio: number
  passAA: boolean
  passAAA: boolean
}

export interface ContrastResult {
  /** Contrast ratio of primary text on the base background (headline pair). */
  ratio: number
  /** True when primary text passes WCAG AA (>= 4.5:1) on every surface. */
  aa: boolean
  /** True when primary text passes WCAG AAA (>= 7:1) on every surface. */
  aaa: boolean
  /** Full audit of every foreground/background pair, worst contrast first. */
  pairs: ContrastPair[]
}

function parseOklch(value: string): { l: number; c: number; h: number } | null {
  const match = value.match(
    /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)/
  )
  if (!match) return null
  return {
    l: parseFloat(match[1]) / 100,
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  }
}

function oklchToSrgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const lc = l_ * l_ * l_
  const mc = m_ * m_ * m_
  const sc = s_ * s_ * s_

  const x = 1.2270138511 * lc - 0.5577999807 * mc + 0.2812561490 * sc
  const y = -0.0405801784 * lc + 1.1122568696 * mc - 0.0716766787 * sc
  const z = -0.0763812845 * lc - 0.4214819784 * mc + 1.5861632204 * sc

  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  const lg = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z

  const toSrgb = (v: number): number => {
    const clamped = Math.max(0, Math.min(1, v))
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
  }

  return [toSrgb(lr), toSrgb(lg), toSrgb(lb)]
}

function relativeLuminance(r: number, g: number, b: number): number {
  const linearize = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function luminanceFromString(color: string): number {
  const oklch = parseOklch(color)
  if (oklch) {
    const [r, g, b] = oklchToSrgb(oklch.l, oklch.c, oklch.h)
    return relativeLuminance(r, g, b)
  }

  const hex = color.replace('#', '')
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    return relativeLuminance(r, g, b)
  }

  return 0
}

/** WCAG contrast ratio between two color strings (hex or oklch). */
function contrastRatio(color1: string, color2: string): number {
  const lum1 = luminanceFromString(color1)
  const lum2 = luminanceFromString(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

const FOREGROUND_TOKENS: (keyof ThemeTokens)[] = [
  'textPrimary',
  'textSecondary',
  'textTertiary',
  'textDisabled',
  'brand',
  'brandLight',
  'brandDark',
  'statusOk',
  'statusWarning',
  'statusCritical',
  'statusInfo',
]

const BACKGROUND_TOKENS: (keyof ThemeTokens)[] = ['bgBase', 'bgSurface', 'bgElevated']

/**
 * Audit all meaningful contrast pairs in a theme. Tests every foreground token
 * against every background surface; results are sorted worst-contrast-first.
 * Tokens with alpha are skipped since they composite and can't be measured statically.
 */
export function auditThemeContrast(tokens: ThemeTokens): ContrastPair[] {
  const pairs: ContrastPair[] = []

  for (const fgKey of FOREGROUND_TOKENS) {
    const fgValue = tokens[fgKey]
    if (fgValue.includes('/')) continue

    for (const bgKey of BACKGROUND_TOKENS) {
      const bgValue = tokens[bgKey]
      if (bgValue.includes('/')) continue

      const ratio = contrastRatio(fgValue, bgValue)
      pairs.push({
        foreground: { token: fgKey, value: fgValue },
        background: { token: bgKey, value: bgValue },
        ratio: Math.round(ratio * 100) / 100,
        passAA: ratio >= 4.5,
        passAAA: ratio >= 7,
      })
    }
  }

  pairs.sort((a, b) => a.ratio - b.ratio)
  return pairs
}
