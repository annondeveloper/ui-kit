'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { generateTheme, themeToCSS } from '@ui/core/tokens/generator'
import type { ThemeName } from '@ui/core/tokens/themes'
import { ColorInput } from '@ui/components/color-input'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Card } from '@ui/components/card'
import { Progress } from '@ui/components/progress'
import { Checkbox } from '@ui/components/checkbox'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Alert } from '@ui/components/alert'
import { StatusBadge } from '@ui/components/status-badge'
import { FormInput } from '@ui/components/form-input'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Preset colors ──────────────────────────────────────────────────────────

const presetColors: Record<ThemeName, string> = {
  aurora: '#6366f1',
  sunset: '#f97316',
  rose: '#f43f5e',
  amber: '#f59e0b',
  ocean: '#0ea5e9',
  emerald: '#10b981',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  slate: '#64748b',
  corporate: '#1e40af',
  midnight: '#312e81',
  forest: '#065f46',
  wine: '#881337',
  carbon: '#27272a',
}

const presetNames = Object.keys(presetColors) as ThemeName[]

// ─── Styles ─────────────────────────────────────────────────────────────────

const themePageStyles = css`
  @layer demo {
    .theme-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    .theme-page__header {
      margin-block-end: 2rem;
    }

    .theme-page__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
    }

    .theme-page__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
    }

    /* ── Section ────────────────────────────────────── */

    .theme-page__section {
      margin-block-end: 2.5rem;
    }

    .theme-page__section-title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* ── Color picker area ──────────────────────────── */

    .theme-page__picker-row {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .theme-page__presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .theme-page__preset-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md, 0.5rem);
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.15s, transform 0.15s;
      position: relative;
    }

    .theme-page__preset-btn:hover {
      transform: scale(1.1);
    }

    .theme-page__preset-btn--active {
      border-color: var(--text-primary);
      box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--text-primary);
    }

    .theme-page__preset-label {
      font-size: 0.625rem;
      text-transform: capitalize;
      color: var(--text-tertiary);
      text-align: center;
      margin-block-start: 0.25rem;
    }

    .theme-page__preset-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .theme-page__mode-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-inline-start: auto;
    }

    .theme-page__mode-label {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* ── Preview grid ───────────────────────────────── */

    .theme-page__preview {
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.5rem;
      background: var(--bg-surface);
    }

    .theme-page__preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .theme-page__preview-cell {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .theme-page__preview-label {
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .theme-page__preview-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    /* ── Export section ──────────────────────────────── */

    .theme-page__export-tabs {
      display: flex;
      gap: 0.25rem;
      margin-block-end: 1rem;
    }

    .theme-page__export-tab {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm, 0.375rem);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      font-size: var(--text-sm, 0.875rem);
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .theme-page__export-tab:hover {
      background: oklch(100% 0 0 / 0.03);
    }

    .theme-page__export-tab--active {
      background: var(--brand-subtle);
      color: var(--brand);
      border-color: var(--brand);
      font-weight: 600;
    }

    .theme-page__color-hex {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-primary);
      font-weight: 600;
      font-family: monospace;
      margin-block-start: 0.25rem;
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export default function ThemePage() {
  useStyles('theme-page', themePageStyles)

  // Read initial state from URL hash
  const getInitialColor = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1))
      return params.get('color') || '#6366f1'
    }
    return '#6366f1'
  }
  const getInitialMode = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1))
      return params.get('mode') !== 'light'
    }
    return true
  }

  const [brandColor, setBrandColor] = useState(getInitialColor)
  const [activePreset, setActivePreset] = useState<ThemeName | null>(() => {
    const c = getInitialColor()
    return (presetNames.find(n => presetColors[n].toLowerCase() === c.toLowerCase()) ?? 'aurora') as ThemeName
  })
  const [darkMode, setDarkMode] = useState(getInitialMode)
  const [exportTab, setExportTab] = useState<'css' | 'tailwind' | 'figma' | 'cssinjs'>('css')
  const originalThemeRef = useRef<Record<string, string> | null>(null)

  // Capture original brand tokens on mount for cleanup
  useEffect(() => {
    const root = document.documentElement
    const original: Record<string, string> = {}
    const brandVars = ['--brand', '--brand-light', '--brand-dark', '--brand-subtle', '--brand-glow',
      '--border-glow', '--aurora-1', '--aurora-2']
    for (const v of brandVars) {
      original[v] = root.style.getPropertyValue(v)
    }
    originalThemeRef.current = original
    return () => {
      // Restore original brand values on unmount
      if (originalThemeRef.current) {
        for (const [prop, val] of Object.entries(originalThemeRef.current)) {
          if (val) {
            root.style.setProperty(prop, val)
          } else {
            root.style.removeProperty(prop)
          }
        }
      }
    }
  }, [])

  // Generate theme — apply ONLY brand tokens to document root (not surface/text/border)
  // Surface/text/border tokens are managed by the site's own light/dark mode toggle
  useEffect(() => {
    const mode = darkMode ? 'dark' : 'light'
    const theme = generateTheme(brandColor, mode)
    const root = document.documentElement
    // Only apply brand-related tokens, NOT surface/text/border tokens
    const brandOnlyKeys: (keyof typeof theme)[] = [
      'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
      'borderGlow', 'aurora1', 'aurora2',
    ]
    const tokenToCSS: Record<string, string> = {
      brand: '--brand', brandLight: '--brand-light', brandDark: '--brand-dark',
      brandSubtle: '--brand-subtle', brandGlow: '--brand-glow',
      borderGlow: '--border-glow', aurora1: '--aurora-1', aurora2: '--aurora-2',
    }
    for (const key of brandOnlyKeys) {
      const cssVar = tokenToCSS[key]
      if (cssVar && theme[key]) root.style.setProperty(cssVar, theme[key])
    }
  }, [brandColor, darkMode])

  // Sync URL hash
  useEffect(() => {
    const hash = `#color=${encodeURIComponent(brandColor)}&mode=${darkMode ? 'dark' : 'light'}`
    window.history.replaceState(null, '', hash)
  }, [brandColor, darkMode])

  const handleColorChange = (color: string) => {
    setBrandColor(color)
    // Check if it matches any preset
    const match = presetNames.find(name => presetColors[name].toLowerCase() === color.toLowerCase())
    setActivePreset(match ?? null)
  }

  const selectPreset = (name: ThemeName) => {
    setActivePreset(name)
    setBrandColor(presetColors[name])
  }

  // Generate CSS for both modes
  const mode = darkMode ? 'dark' : 'light'
  const darkTokens = generateTheme(brandColor, 'dark')
  const lightTokens = generateTheme(brandColor, 'light')
  const darkCSS = themeToCSS(darkTokens, ':root')
  const lightCSS = themeToCSS(lightTokens, ':root[data-mode="light"]')
  const fullCSS = `/* Dark mode (default) */\n${darkCSS}\n\n/* Light mode */\n${lightCSS}`

  const codeExample = `import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'

// Generate theme from your brand color
const theme = generateTheme('${brandColor}', '${mode}')

// Apply to document root
applyTheme(theme)

// Or generate CSS string for static usage
import { themeToCSS } from '@annondeveloper/ui-kit/theme'
const css = themeToCSS(theme)
`

  // Tailwind config export
  const tailwindExport = useMemo(() => {
    const tokens = generateTheme(brandColor, mode)
    const entries = Object.entries(tokens)
      .map(([k, v]) => `      '${k.replace('--', '')}': '${v}',`)
      .join('\n')
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      },
    },
  },
}`
  }, [brandColor, mode])

  // Figma JSON export
  const figmaExport = useMemo(() => {
    const tokens = generateTheme(brandColor, mode)
    const figmaTokens: Record<string, { value: string; type: string }> = {}
    for (const [k, v] of Object.entries(tokens)) {
      figmaTokens[k.replace('--', '')] = { value: String(v), type: 'color' }
    }
    return JSON.stringify({ 'ui-kit-theme': figmaTokens }, null, 2)
  }, [brandColor, mode])

  // CSS-in-JS export
  const cssInJsExport = useMemo(() => {
    const tokens = generateTheme(brandColor, mode)
    const entries = Object.entries(tokens)
      .map(([k, v]) => `  '${k}': '${v}',`)
      .join('\n')
    return `export const theme = {\n${entries}\n} as const`
  }, [brandColor, mode])

  // State for interactive previews
  const [checked, setChecked] = useState(true)
  const [toggle, setToggle] = useState(true)

  return (
    <div className="theme-page">
      {/* Header */}
      <div className="theme-page__header">
        <h1 className="theme-page__title">Theme Playground</h1>
        <p className="theme-page__subtitle">
          Pick a brand color and see all components update in real-time. Export the generated theme for your project.
        </p>
      </div>

      {/* Section 1: Brand Color Picker */}
      <section className="theme-page__section">
        <h2 className="theme-page__section-title">
          <Icon name="settings" size={18} />
          Brand Color
        </h2>

        <div className="theme-page__picker-row">
          <div>
            <ColorInput
              name="brand-color"
              value={brandColor}
              onChange={handleColorChange}
              label="Brand color"
              size="lg"
            />
            <div className="theme-page__color-hex">{brandColor.toUpperCase()}</div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="theme-page__presets">
              {presetNames.map(name => (
                <div key={name} className="theme-page__preset-wrap">
                  <button
                    className={`theme-page__preset-btn${activePreset === name ? ' theme-page__preset-btn--active' : ''}`}
                    style={{ background: presetColors[name] }}
                    onClick={() => selectPreset(name)}
                    title={name}
                    aria-label={`${name} theme preset`}
                  />
                  <span className="theme-page__preset-label">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-page__mode-toggle">
            <span className="theme-page__mode-label">
              <Icon name={darkMode ? 'eye-off' : 'eye'} size={14} />
            </span>
            <ToggleSwitch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              label={darkMode ? 'Dark' : 'Light'}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Live Component Preview */}
      <section className="theme-page__section">
        <h2 className="theme-page__section-title">
          <Icon name="code" size={18} />
          Live Preview
        </h2>

        <div className="theme-page__preview">
          <div className="theme-page__preview-grid">

            {/* Buttons */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Button</span>
              <div className="theme-page__preview-row">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Badge</span>
              <div className="theme-page__preview-row">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Error</Badge>
              </div>
            </div>

            {/* Card */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Card</span>
              <Card padding="md">
                <div style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Aurora Fluid</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: 'var(--text-xs)' }}>
                    Deep atmospheric surfaces with ambient glows and ethereal color washes.
                  </p>
                </div>
              </Card>
            </div>

            {/* Progress */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Progress</span>
              <Progress value={72} max={100} label="72% complete" />
            </div>

            {/* Checkbox + Toggle */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Checkbox & Toggle</span>
              <div className="theme-page__preview-row">
                <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Checked" />
                <ToggleSwitch checked={toggle} onChange={(e) => setToggle(e.target.checked)} label="Enabled" />
              </div>
            </div>

            {/* StatusBadge */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Status Badge</span>
              <div className="theme-page__preview-row">
                <StatusBadge status="ok" label="Healthy" pulse />
                <StatusBadge status="warning" label="Degraded" />
                <StatusBadge status="critical" label="Down" />
                <StatusBadge status="info" label="Info" />
                <StatusBadge status="maintenance" label="Maint" />
              </div>
            </div>

            {/* Alerts */}
            <div className="theme-page__preview-cell" style={{ gridColumn: '1 / -1' }}>
              <span className="theme-page__preview-label">Alert</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Alert variant="info" title="Information">This is an info alert with themed colors.</Alert>
                <Alert variant="success" title="Success">Operation completed successfully.</Alert>
                <Alert variant="warning" title="Warning">Check your configuration settings.</Alert>
                <Alert variant="error" title="Error">Something went wrong.</Alert>
              </div>
            </div>

            {/* FormInput */}
            <div className="theme-page__preview-cell">
              <span className="theme-page__preview-label">Form Input</span>
              <FormInput
                name="email"
                label="Email address"
                placeholder="you@example.com"
                type="email"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Section 3 & 4: Export */}
      <section className="theme-page__section">
        <h2 className="theme-page__section-title">
          <Icon name="file" size={18} />
          Export Theme
        </h2>

        <div className="theme-page__export-tabs">
          {(['css', 'tailwind', 'figma', 'cssinjs'] as const).map(tab => (
            <button
              key={tab}
              className={`theme-page__export-tab${exportTab === tab ? ' theme-page__export-tab--active' : ''}`}
              onClick={() => setExportTab(tab)}
            >
              {tab === 'css' ? 'CSS' : tab === 'tailwind' ? 'Tailwind' : tab === 'figma' ? 'Figma JSON' : 'CSS-in-JS'}
            </button>
          ))}
        </div>

        {exportTab === 'css' && (
          <CopyBlock
            code={fullCSS}
            language="css"
            title="Generated CSS Tokens (Dark + Light)"
            showLineNumbers
            maxHeight="400px"
          />
        )}
        {exportTab === 'tailwind' && (
          <CopyBlock
            code={tailwindExport}
            language="javascript"
            title="Tailwind Config"
            showLineNumbers
            maxHeight="400px"
          />
        )}
        {exportTab === 'figma' && (
          <CopyBlock
            code={figmaExport}
            language="json"
            title="Figma Variables JSON"
            showLineNumbers
            maxHeight="400px"
          />
        )}
        {exportTab === 'cssinjs' && (
          <CopyBlock
            code={cssInJsExport}
            language="typescript"
            title="CSS-in-JS Theme Object"
            showLineNumbers
            maxHeight="400px"
          />
        )}
      </section>

      {/* Section 4: Color Harmony */}
      <section className="theme-page__section">
        <h2 className="theme-page__section-title">
          <Icon name="settings" size={18} />
          Color Harmony
        </h2>

        <div className="theme-page__preview">
          <ColorHarmonyPanel brandColor={brandColor} />
        </div>
      </section>

      {/* Section 5: Contrast Audit */}
      <section className="theme-page__section">
        <h2 className="theme-page__section-title">
          <Icon name="eye" size={18} />
          Contrast Audit
        </h2>

        <div className="theme-page__preview">
          <ContrastAuditPanel mode={mode} />
        </div>
      </section>
    </div>
  )
}

// ─── Color Harmony Panel ──────────────────────────────────────────────────────

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
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

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const harmonyTypes = [
  { name: 'Complementary', offsets: [180] },
  { name: 'Analogous', offsets: [-30, 30] },
  { name: 'Triadic', offsets: [120, 240] },
  { name: 'Split-Complementary', offsets: [150, 210] },
  { name: 'Tetradic', offsets: [90, 180, 270] },
]

function ColorHarmonyPanel({ brandColor }: { brandColor: string }) {
  const [h, s, l] = hexToHSL(brandColor)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {harmonyTypes.map(harmony => (
        <div key={harmony.name}>
          <div style={{
            fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBlockEnd: '0.5rem'
          }}>
            {harmony.name}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-md, 0.5rem)',
              background: brandColor, border: '2px solid var(--text-primary)',
            }} title={`Base: ${brandColor}`} />
            {harmony.offsets.map((offset, i) => {
              const color = hslToHex((h + offset + 360) % 360, s, l)
              return (
                <div key={i} style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md, 0.5rem)',
                  background: color, border: '1px solid var(--border-default)',
                }} title={`${harmony.name} ${i + 1}: ${color}`} />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Contrast Audit Panel ─────────────────────────────────────────────────────

const contrastPairs = [
  { name: 'Primary text on base', fg: '--text-primary', bg: '--bg-base' },
  { name: 'Secondary text on base', fg: '--text-secondary', bg: '--bg-base' },
  { name: 'Primary text on surface', fg: '--text-primary', bg: '--bg-surface' },
  { name: 'Secondary text on elevated', fg: '--text-secondary', bg: '--bg-elevated' },
  { name: 'Brand on base', fg: '--brand', bg: '--bg-base' },
  { name: 'Brand light on surface', fg: '--brand-light', bg: '--bg-surface' },
  { name: 'Status OK on base', fg: '--status-ok', bg: '--bg-base' },
  { name: 'Status warning on base', fg: '--status-warning', bg: '--bg-base' },
  { name: 'Status critical on base', fg: '--status-critical', bg: '--bg-base' },
]

function getComputedCSSVar(varName: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

function parseCSSColor(val: string): [number, number, number] | null {
  // Try to parse hex
  if (val.startsWith('#')) {
    const r = parseInt(val.slice(1, 3), 16) / 255
    const g = parseInt(val.slice(3, 5), 16) / 255
    const b = parseInt(val.slice(5, 7), 16) / 255
    return [r, g, b]
  }
  // Try rgb()
  const rgbMatch = val.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return [Number(rgbMatch[1]) / 255, Number(rgbMatch[2]) / 255, Number(rgbMatch[3]) / 255]
  }
  return null
}

function relativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function ContrastAuditPanel({ mode }: { mode: string }) {
  const [results, setResults] = useState<{ name: string; ratio: number; passAA: boolean; passAAA: boolean }[]>([])

  useEffect(() => {
    // Defer to next frame so CSS vars are applied
    requestAnimationFrame(() => {
      const newResults = contrastPairs.map(pair => {
        const fgVal = getComputedCSSVar(pair.fg)
        const bgVal = getComputedCSSVar(pair.bg)
        const fgRgb = parseCSSColor(fgVal)
        const bgRgb = parseCSSColor(bgVal)

        if (!fgRgb || !bgRgb) {
          return { name: pair.name, ratio: 0, passAA: false, passAAA: false }
        }

        const fgLum = relativeLuminance(...fgRgb)
        const bgLum = relativeLuminance(...bgRgb)
        const ratio = contrastRatio(fgLum, bgLum)

        return {
          name: pair.name,
          ratio: Math.round(ratio * 100) / 100,
          passAA: ratio >= 4.5,
          passAAA: ratio >= 7,
        }
      })
      setResults(newResults)
    })
  }, [mode])

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm, 0.875rem)',
      }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'start', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBlockEnd: '1px solid var(--border-default)' }}>Pair</th>
            <th style={{ textAlign: 'end', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBlockEnd: '1px solid var(--border-default)' }}>Ratio</th>
            <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBlockEnd: '1px solid var(--border-default)' }}>AA</th>
            <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBlockEnd: '1px solid var(--border-default)' }}>AAA</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.name}>
              <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', borderBlockEnd: '1px solid var(--border-subtle)' }}>{r.name}</td>
              <td style={{ textAlign: 'end', padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: 'var(--text-primary)', borderBlockEnd: '1px solid var(--border-subtle)' }}>{r.ratio > 0 ? `${r.ratio}:1` : 'N/A'}</td>
              <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderBlockEnd: '1px solid var(--border-subtle)' }}>
                <span style={{
                  display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '1rem',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  background: r.passAA ? 'var(--status-ok)' : 'var(--status-critical)',
                  color: 'var(--bg-base)',
                }}>
                  {r.passAA ? 'Pass' : 'Fail'}
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderBlockEnd: '1px solid var(--border-subtle)' }}>
                <span style={{
                  display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '1rem',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  background: r.passAAA ? 'var(--status-ok)' : 'var(--status-warning)',
                  color: 'var(--bg-base)',
                }}>
                  {r.passAAA ? 'Pass' : 'Fail'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {results.length === 0 && (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Computing contrast ratios...
        </div>
      )}
    </div>
  )
}
