# Theme Editor

Interactive theme customization with color harmony generation, WCAG contrast auditing, multi-format export, and shareable URLs.

## Overview

The Theme Editor utilities extend the existing theme system with a color harmony engine (5 harmony types), WCAG contrast auditing, export to 4 formats (CSS, Tailwind, Figma Tokens, CSS-in-JS), and a URL-based sharing scheme for theme configurations. These are available in the demo app and as importable utilities.

## Quick Start

```tsx
import { generateTheme, themeToCSS, validateContrast } from '@annondeveloper/ui-kit/theme'
import { generateHarmony, suggestHarmonies } from '@annondeveloper/ui-kit'
import { exportTheme, encodeThemeToHash, decodeThemeFromHash } from '@annondeveloper/ui-kit'

// Generate theme from brand color
const tokens = generateTheme('#6366f1', 'dark')

// Validate WCAG contrast
const result = validateContrast(tokens)
// { aa: true, aaa: false, ratio: 7.2 }

// Export to different formats
const css = exportTheme(tokens, 'css')
const tailwind = exportTheme(tokens, 'tailwind')
const figma = exportTheme(tokens, 'figma-tokens')
const jsTheme = exportTheme(tokens, 'css-in-js')

// Share via URL
const hash = encodeThemeToHash('#6366f1', 'dark')
window.location.hash = hash
```

## API Reference

### Color Harmony Engine

#### `generateHarmony(brandHex, type)`

Generates a color harmony palette from a brand color using OKLCH hue rotation.

```ts
import { generateHarmony } from '@annondeveloper/ui-kit'

const palette = generateHarmony('#6366f1', 'triadic')
// { type: 'triadic', colors: ['#6366f1', ...], description: '...' }
```

| Harmony Type | Colors | Description |
|-------------|--------|-------------|
| `complementary` | 2 | Opposite on the color wheel -- maximum contrast |
| `analogous` | 3 | Neighboring colors -- harmonious and pleasing |
| `triadic` | 3 | Equally spaced -- vibrant and balanced |
| `split-complementary` | 3 | Base + two adjacent to complement -- high contrast, less tension |
| `tetradic` | 4 | Rectangle pattern -- rich palette |

#### `suggestHarmonies(brandHex)`

Returns all 5 harmony types for a given brand color:

```ts
const all = suggestHarmonies('#6366f1')
// Array of 5 HarmonyResult objects
```

### WCAG Contrast Audit

```ts
import { validateContrast } from '@annondeveloper/ui-kit/theme'

const tokens = generateTheme('#6366f1', 'dark')
const result = validateContrast(tokens)
// { aa: boolean, aaa: boolean, ratio: number }
```

Checks text-on-background contrast ratios against WCAG 2.1 guidelines:
- **AA**: 4.5:1 for normal text, 3:1 for large text and UI elements
- **AAA**: 7:1 for normal text, 4.5:1 for large text

### Export Formats

#### `exportTheme(tokens, format)`

| Format | Output | Use Case |
|--------|--------|----------|
| `'css'` | CSS custom properties | Direct stylesheet usage |
| `'tailwind'` | Tailwind config object | Tailwind CSS integration |
| `'figma-tokens'` | Figma Variables JSON | Figma plugin import |
| `'css-in-js'` | TypeScript const object | styled-components, Emotion, etc. |

```ts
// CSS output
const css = exportTheme(tokens, 'css')
// :root { --brand: oklch(65% 0.27 270); --bg-base: oklch(15% 0.02 270); ... }

// Tailwind output
const tw = exportTheme(tokens, 'tailwind')
// module.exports = { theme: { extend: { colors: { 'brand': 'var(--brand)', ... } } } }

// Figma Tokens output
const figma = exportTheme(tokens, 'figma-tokens')
// { "brand": { "$type": "color", "$value": "oklch(65% 0.27 270)" }, ... }

// CSS-in-JS output
const js = exportTheme(tokens, 'css-in-js')
// export const theme = { brand: 'oklch(65% 0.27 270)', ... } as const
```

### URL Sharing

#### `encodeThemeToHash(brandHex, mode)`

Encodes theme parameters into a base64 URL hash:

```ts
const hash = encodeThemeToHash('#6366f1', 'dark')
// 'IzYzNjZmMTpkYXJr'
```

#### `decodeThemeFromHash(hash)`

Decodes a hash back to theme parameters:

```ts
const params = decodeThemeFromHash('IzYzNjZmMTpkYXJr')
// { brandHex: '#6366f1', mode: 'dark' }
```

## Examples

### Full theme editor workflow

```tsx
import { useState } from 'react'
import { generateTheme, validateContrast } from '@annondeveloper/ui-kit/theme'
import { suggestHarmonies, exportTheme, encodeThemeToHash } from '@annondeveloper/ui-kit'

function ThemeEditor() {
  const [brand, setBrand] = useState('#6366f1')
  const [mode, setMode] = useState<'dark' | 'light'>('dark')

  const tokens = generateTheme(brand, mode)
  const contrast = validateContrast(tokens)
  const harmonies = suggestHarmonies(brand)

  const shareUrl = `${window.location.origin}#${encodeThemeToHash(brand, mode)}`

  return (
    <div>
      <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} />
      <p>Contrast: {contrast.ratio.toFixed(1)}:1 {contrast.aa ? 'AA' : 'Fail'}</p>
      <ul>
        {harmonies.map((h) => (
          <li key={h.type}>{h.type}: {h.colors.join(', ')}</li>
        ))}
      </ul>
      <pre>{exportTheme(tokens, 'css')}</pre>
      <a href={shareUrl}>Share this theme</a>
    </div>
  )
}
```

### Load theme from shared URL

```tsx
import { decodeThemeFromHash } from '@annondeveloper/ui-kit'
import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'

const params = decodeThemeFromHash(window.location.hash)
if (params) {
  const tokens = generateTheme(params.brandHex, params.mode)
  applyTheme(tokens)
}
```
