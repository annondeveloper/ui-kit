import type { ThemeTokens } from './tokens'
import { TOKEN_TO_CSS } from './tokens'
import { themeToCSS } from './generator'

export type ExportFormat = 'css' | 'tailwind' | 'figma-tokens' | 'css-in-js'

/** Export a ThemeTokens object to one of four formats. */
export function exportTheme(tokens: ThemeTokens, format: ExportFormat): string {
  switch (format) {
    case 'css':
      return themeToCSS(tokens)
    case 'tailwind':
      return exportTailwind()
    case 'figma-tokens':
      return exportFigmaTokens(tokens)
    case 'css-in-js':
      return exportCSSInJS(tokens)
  }
}

function exportTailwind(): string {
  const colorEntries = Object.entries(TOKEN_TO_CSS).map(([key, cssVar]) => {
    const tailwindKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    return `      '${tailwindKey}': 'var(${cssVar})',`
  })

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries.join('\n')}
      },
    },
  },
}`
}

function exportFigmaTokens(tokens: ThemeTokens): string {
  const entries: Record<string, { $type: string; $value: string }> = {}
  for (const [key, value] of Object.entries(tokens) as [keyof ThemeTokens, string][]) {
    const tokenName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    entries[tokenName] = { $type: 'color', $value: value }
  }
  return JSON.stringify(entries, null, 2)
}

function exportCSSInJS(tokens: ThemeTokens): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  ${key}: '${value}',`)
  return `export const theme = {\n${lines.join('\n')}\n} as const`
}

/** Encode theme parameters into a URL-safe hash string (base64 of "hex:mode"). */
export function encodeThemeToHash(brandHex: string, mode: 'dark' | 'light'): string {
  return btoa(`${brandHex}:${mode}`)
}

/** Decode a URL hash back to theme parameters, or null if invalid. */
export function decodeThemeFromHash(
  hash: string
): { brandHex: string; mode: 'dark' | 'light' } | null {
  try {
    const cleaned = hash.replace(/^#/, '')
    if (!cleaned) return null
    const [brandHex, mode] = atob(cleaned).split(':')
    if (!brandHex || !mode) return null
    if (mode !== 'dark' && mode !== 'light') return null
    if (!/^#[0-9a-fA-F]{6}$/.test(brandHex)) return null
    return { brandHex, mode }
  } catch {
    return null
  }
}
