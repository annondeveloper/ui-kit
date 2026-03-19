/**
 * Auto-generate a complete accessible dark + light theme from a single brand color.
 * Uses HSL color space to derive all semantic tokens with contrast validation.
 *
 * @example
 * ```ts
 * import { generateTheme, themeToCSS } from '@annondeveloper/ui-kit'
 * const dark = generateTheme('#6366f1', 'dark')
 * const css = themeToCSS(dark, ':root')
 * ```
 */

export interface ThemeTokens {
  'bg-base': string
  'bg-surface': string
  'bg-elevated': string
  'bg-overlay': string
  'border-subtle': string
  'border-default': string
  'border-strong': string
  'text-primary': string
  'text-secondary': string
  'text-tertiary': string
  'text-disabled': string
  'brand-primary': string
  'brand-secondary': string
  'text-on-brand': string
  'status-ok': string
  'status-warning': string
  'status-critical': string
  'status-unknown': string
}

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/** Generate a complete theme from a single brand hex color. */
export function generateTheme(brandHex: string, mode: 'dark' | 'light' = 'dark'): ThemeTokens {
  const [h, s] = hexToHsl(brandHex)
  const sat = Math.min(s, 50)

  if (mode === 'dark') {
    return {
      'bg-base': `${h} ${sat}% 7%`,
      'bg-surface': `${h} ${Math.max(sat - 5, 10)}% 10%`,
      'bg-elevated': `${h} ${Math.max(sat - 10, 8)}% 14%`,
      'bg-overlay': `${h} ${Math.max(sat - 15, 5)}% 18%`,
      'border-subtle': `${h} ${Math.max(sat - 15, 5)}% 20%`,
      'border-default': `${h} ${Math.max(sat - 20, 5)}% 25%`,
      'border-strong': `${h} ${Math.max(sat - 25, 5)}% 35%`,
      'text-primary': `${h} ${Math.min(sat, 40)}% 95%`,
      'text-secondary': `${h} ${Math.min(sat, 20)}% 70%`,
      'text-tertiary': `${h} ${Math.min(sat, 15)}% 50%`,
      'text-disabled': `${h} ${Math.min(sat, 10)}% 35%`,
      'brand-primary': `${h} ${s}% 60%`,
      'brand-secondary': `${(h + 40) % 360} ${Math.min(s, 80)}% 65%`,
      'text-on-brand': '0 0% 100%',
      'status-ok': '142 71% 45%',
      'status-warning': '38 92% 50%',
      'status-critical': '0 84% 60%',
      'status-unknown': `${h} 15% 50%`,
    }
  }
  return {
    'bg-base': `${h} ${Math.min(sat, 40)}% 98%`,
    'bg-surface': '0 0% 100%',
    'bg-elevated': `${h} ${Math.min(sat, 40)}% 96%`,
    'bg-overlay': `${h} ${Math.min(sat, 30)}% 92%`,
    'border-subtle': `${h} ${Math.min(sat, 20)}% 88%`,
    'border-default': `${h} ${Math.min(sat, 20)}% 80%`,
    'border-strong': `${h} ${Math.min(sat, 20)}% 65%`,
    'text-primary': `${h} ${sat}% 11%`,
    'text-secondary': `${h} ${Math.min(sat, 25)}% 35%`,
    'text-tertiary': `${h} ${Math.min(sat, 15)}% 55%`,
    'text-disabled': `${h} ${Math.min(sat, 10)}% 75%`,
    'brand-primary': `${h} ${s}% 50%`,
    'brand-secondary': `${(h + 40) % 360} ${Math.min(s, 80)}% 58%`,
    'text-on-brand': '0 0% 100%',
    'status-ok': '142 71% 38%',
    'status-warning': '38 92% 42%',
    'status-critical': '0 84% 52%',
    'status-unknown': `${h} 15% 55%`,
  }
}

/** Convert ThemeTokens to a CSS string. */
export function themeToCSS(tokens: ThemeTokens, selector: string = ':root'): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  --${k}: ${v};`)
  return `${selector} {\n${lines.join('\n')}\n}`
}

/** Validate theme contrast. Returns warnings for insufficient text/bg contrast. */
export function validateTheme(tokens: ThemeTokens): string[] {
  const warnings: string[] = []
  const textKeys = ['text-primary', 'text-secondary', 'text-tertiary'] as const
  const bgKeys = ['bg-base', 'bg-surface', 'bg-elevated'] as const

  for (const txt of textKeys) {
    for (const bg of bgKeys) {
      const txtL = parseInt(tokens[txt].split(/\s+/)[2] ?? '50')
      const bgL = parseInt(tokens[bg].split(/\s+/)[2] ?? '50')
      const diff = Math.abs(txtL - bgL)
      if (diff < 30) {
        warnings.push(`Low contrast: --${txt} (L${txtL}%) on --${bg} (L${bgL}%) — diff ${diff}%, need 40%+`)
      }
    }
  }
  return warnings
}
