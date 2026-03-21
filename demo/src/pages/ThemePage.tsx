'use client'

import { useState, useEffect, useRef } from 'react'
import { generateTheme, themeToCSS, applyTheme } from '@ui/core/tokens/generator'
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

  const [brandColor, setBrandColor] = useState('#6366f1')
  const [activePreset, setActivePreset] = useState<ThemeName | null>('aurora')
  const [darkMode, setDarkMode] = useState(true)
  const [exportTab, setExportTab] = useState<'css' | 'code'>('css')
  const originalThemeRef = useRef<Record<string, string> | null>(null)

  // Capture original theme on mount for cleanup
  useEffect(() => {
    const root = document.documentElement
    const original: Record<string, string> = {}
    const vars = ['--brand', '--brand-light', '--brand-dark', '--brand-subtle', '--brand-glow',
      '--bg-base', '--bg-surface', '--bg-elevated', '--bg-overlay',
      '--border-subtle', '--border-default', '--border-strong', '--border-glow',
      '--text-primary', '--text-secondary', '--text-tertiary', '--text-disabled',
      '--status-ok', '--status-warning', '--status-critical', '--status-info',
      '--aurora-1', '--aurora-2']
    for (const v of vars) {
      original[v] = root.style.getPropertyValue(v)
    }
    originalThemeRef.current = original
    return () => {
      // Restore original values on unmount
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

  // Generate and apply theme when color or mode changes
  useEffect(() => {
    const mode = darkMode ? 'dark' : 'light'
    const theme = generateTheme(brandColor, mode)
    applyTheme(theme)
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
              onChange={setDarkMode}
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
                <Badge variant="error">Error</Badge>
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
                <Checkbox checked={checked} onChange={setChecked} label="Checked" />
                <ToggleSwitch checked={toggle} onChange={setToggle} label="Enabled" />
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
          <button
            className={`theme-page__export-tab${exportTab === 'css' ? ' theme-page__export-tab--active' : ''}`}
            onClick={() => setExportTab('css')}
          >
            CSS Custom Properties
          </button>
          <button
            className={`theme-page__export-tab${exportTab === 'code' ? ' theme-page__export-tab--active' : ''}`}
            onClick={() => setExportTab('code')}
          >
            JavaScript / TypeScript
          </button>
        </div>

        {exportTab === 'css' ? (
          <CopyBlock
            code={fullCSS}
            language="css"
            title="Generated CSS Tokens (Dark + Light)"
            showLineNumbers
            maxHeight="400px"
          />
        ) : (
          <CopyBlock
            code={codeExample}
            language="typescript"
            title="Theme Setup Code"
            showLineNumbers
          />
        )}
      </section>
    </div>
  )
}
