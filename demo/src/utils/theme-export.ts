import type { ThemeTokens } from '@ui/core/tokens/tokens'
import { TOKEN_TO_CSS } from '@ui/core/tokens/tokens'
import { themeToCSS } from '@ui/core/tokens/generator'

export type ExportFormat = 'css' | 'tailwind' | 'figma-tokens' | 'css-in-js'

/**
 * Export a ThemeTokens object to one of 4 formats.
 */
export function exportTheme(tokens: ThemeTokens, format: ExportFormat): string {
  switch (format) {
    case 'css':
      return exportCSS(tokens)
    case 'tailwind':
      return exportTailwind(tokens)
    case 'figma-tokens':
      return exportFigmaTokens(tokens)
    case 'css-in-js':
      return exportCSSInJS(tokens)
  }
}

// --- CSS ---

function exportCSS(tokens: ThemeTokens): string {
  return themeToCSS(tokens)
}

// --- Tailwind ---

function exportTailwind(tokens: ThemeTokens): string {
  const colorEntries = Object.entries(TOKEN_TO_CSS).map(([key, cssVar]) => {
    // Convert camelCase to kebab for Tailwind key: brandLight → brand-light
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

// --- Figma Tokens ---

function exportFigmaTokens(tokens: ThemeTokens): string {
  const entries: Record<string, { $type: string; $value: string }> = {}

  for (const [key, value] of Object.entries(tokens) as [keyof ThemeTokens, string][]) {
    // Use kebab-case keys for Figma tokens
    const tokenName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    entries[tokenName] = {
      $type: 'color',
      $value: value,
    }
  }

  return JSON.stringify(entries, null, 2)
}

// --- CSS-in-JS ---

function exportCSSInJS(tokens: ThemeTokens): string {
  const lines = Object.entries(tokens).map(([key, value]) => {
    return `  ${key}: '${value}',`
  })

  return `export const theme = {
${lines.join('\n')}
} as const`
}

// --- URL sharing via hash fragment ---

/**
 * Encode theme parameters into a URL hash string.
 * Format: base64 of "hex:mode"
 */
export function encodeThemeToHash(brandHex: string, mode: 'dark' | 'light'): string {
  const payload = `${brandHex}:${mode}`
  return btoa(payload)
}

/**
 * Decode a URL hash string back to theme parameters.
 * Returns null if the hash is invalid.
 */
export function decodeThemeFromHash(
  hash: string
): { brandHex: string; mode: 'dark' | 'light' } | null {
  try {
    const cleaned = hash.replace(/^#/, '')
    if (!cleaned) return null

    const decoded = atob(cleaned)
    const [brandHex, mode] = decoded.split(':')

    if (!brandHex || !mode) return null
    if (mode !== 'dark' && mode !== 'light') return null
    // Validate hex format
    if (!/^#[0-9a-fA-F]{6}$/.test(brandHex)) return null

    return { brandHex, mode }
  } catch {
    return null
  }
}
