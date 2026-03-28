'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { Select } from '@ui/components/select'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { generateTheme } from '@ui/core/tokens/generator'
import { themes, lightThemes, type ThemeName } from '@ui/core/tokens/themes'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { exportTheme } from '../utils/theme-export'
import { themeToFigmaVariables } from '@ui/cli/utils/figma-tokens'
import { themeToStyleDictionary } from '@ui/cli/utils/style-dictionary'

// ─── Theme hex map ───────────────────────────────────────────────────────────

const THEME_HEXES: Record<ThemeName, string> = {
  aurora: '#6366f1', sunset: '#f97316', rose: '#f43f5e', amber: '#f59e0b',
  ocean: '#0ea5e9', emerald: '#10b981', cyan: '#06b6d4', violet: '#8b5cf6',
  fuchsia: '#d946ef', slate: '#64748b', corporate: '#1e40af', midnight: '#312e81',
  forest: '#065f46', wine: '#881337', carbon: '#27272a',
}

const THEME_NAMES: ThemeName[] = Object.keys(THEME_HEXES) as ThemeName[]

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .figma-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────── */
    .figma-hero {
      margin-block-end: 3rem;
    }

    .figma-hero__badge {
      display: inline-flex;
      margin-block-end: 0.75rem;
    }

    .figma-hero__title {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-block-end: 0.5rem;
      background: linear-gradient(135deg, var(--brand, oklch(65% 0.2 270)), var(--brand-light, oklch(75% 0.2 300)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-wrap: balance;
    }

    .figma-hero__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.6;
    }

    /* ── Section ──────────────────────────────────────────────── */
    .figma-section {
      margin-block-end: 3rem;
    }

    .figma-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1.25rem;
    }

    .figma-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ── Controls Row ─────────────────────────────────────────── */
    .figma-controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-block-end: 1.5rem;
      align-items: flex-end;
    }

    .figma-controls > * {
      min-width: 140px;
    }

    .figma-controls .ui-select__trigger {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      box-shadow: var(--shadow-sm);
    }

    /* ── Token Grid ──────────────────────────────────────────── */
    .figma-tokens {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-block-end: 1.5rem;
      max-height: 400px;
      overflow-y: auto;
      padding-inline-end: 0.25rem;
    }

    .figma-token {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.625rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--bg-base);
      border: 1px solid var(--border-subtle);
      transition: border-color 0.15s;
    }

    .figma-token:hover {
      border-color: var(--border-default);
    }

    .figma-token__swatch {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-xs, 0.25rem);
      border: 1px solid var(--border-default);
      flex-shrink: 0;
      box-shadow: inset 0 0 0 1px oklch(50% 0 0 / 0.1);
    }

    .figma-token__info {
      min-width: 0;
      flex: 1;
    }

    .figma-token__name {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .figma-token__value {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Export Buttons ───────────────────────────────────────── */
    .figma-exports {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-block-end: 1rem;
    }

    .figma-export-output {
      margin-block-start: 0.75rem;
      max-height: 420px;
      overflow-y: auto;
    }

    /* ── Import Section ──────────────────────────────────────── */
    .figma-import-area {
      width: 100%;
      min-height: 200px;
      max-height: 400px;
      padding: 0.75rem;
      border-radius: var(--radius-md, 0.5rem);
      border: 2px dashed var(--border-default);
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8125rem;
      resize: vertical;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .figma-import-area:focus {
      outline: none;
      border-color: var(--brand, oklch(65% 0.2 270));
    }

    .figma-import-area::placeholder {
      color: var(--text-tertiary);
    }

    .figma-import-actions {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.75rem;
    }

    .figma-import-result {
      margin-block-start: 1rem;
    }

    .figma-mapped-tokens {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm, 0.375rem);
      font-size: 0.8125rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      max-height: 300px;
      overflow-y: auto;
    }

    .figma-mapped-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }

    .figma-mapped-row__figma {
      color: var(--text-tertiary);
      min-width: 160px;
    }

    .figma-mapped-row__arrow {
      color: var(--brand, oklch(65% 0.2 270));
    }

    .figma-mapped-row__css {
      color: var(--text-primary);
      font-weight: 600;
    }

    /* ── Plugin section ──────────────────────────────────────── */
    .figma-plugin-steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .figma-plugin-step {
      display: flex;
      gap: 0.75rem;
    }

    .figma-plugin-step__num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      color: var(--brand, oklch(65% 0.2 270));
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .figma-plugin-step__content {
      flex: 1;
    }

    .figma-plugin-step__label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-block-end: 0.25rem;
    }

    .figma-plugin-step__desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ── Color picker row ─────────────────────────────────────── */
    .figma-color-picker {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .figma-color-picker__input {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: var(--radius-sm, 0.375rem);
      cursor: pointer;
      background: transparent;
      padding: 0;
    }

    .figma-color-picker__input::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .figma-color-picker__input::-webkit-color-swatch {
      border: 2px solid var(--border-default);
      border-radius: var(--radius-sm, 0.375rem);
    }

    .figma-color-picker__hex {
      font-size: 0.8125rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-secondary);
    }

    /* ── Applied banner ─────────────────────────────────────── */
    .figma-applied-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--status-ok, oklch(72% 0.19 145));
      color: var(--text-on-status, oklch(15% 0.02 145));
      font-size: 0.8125rem;
      font-weight: 600;
      margin-block-start: 0.75rem;
    }

    /* ── Light mode adjustments ──────────────────────────────── */
    @media (prefers-color-scheme: light) {
      .figma-token {
        border-color: var(--border-default);
      }

      .figma-import-area {
        background: var(--bg-surface);
      }

      .figma-mapped-tokens {
        background: var(--bg-surface);
        border-color: var(--border-default);
      }
    }

    :root[data-theme="light"] .figma-token,
    [data-mode="light"] .figma-token {
      border-color: var(--border-default);
    }

    :root[data-theme="light"] .figma-import-area,
    [data-mode="light"] .figma-import-area {
      background: var(--bg-surface);
    }

    :root[data-theme="light"] .figma-mapped-tokens,
    [data-mode="light"] .figma-mapped-tokens {
      background: var(--bg-surface);
      border-color: var(--border-default);
    }

    @media (max-width: 640px) {
      .figma-tokens {
        grid-template-columns: 1fr;
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tokenKeyToCSS(key: string): string {
  return TOKEN_TO_CSS[key as keyof typeof TOKEN_TO_CSS] || `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
}

function parseFigmaVariablesJSON(raw: string): { figmaName: string; cssVar: string; value: string }[] | null {
  try {
    const parsed = JSON.parse(raw)
    const results: { figmaName: string; cssVar: string; value: string }[] = []

    // Handle Figma Variables REST format
    if (parsed.collections) {
      for (const collection of parsed.collections) {
        for (const variable of collection.variables || []) {
          const cssVar = `--${variable.name}`
          results.push({
            figmaName: variable.name,
            cssVar,
            value: variable.value || '',
          })
        }
      }
      return results
    }

    // Handle flat token format: { "token-name": { "$value": "..." } }
    for (const [key, val] of Object.entries(parsed)) {
      const v = val as any
      results.push({
        figmaName: key,
        cssVar: `--${key}`,
        value: v.$value || v.value || (typeof v === 'string' ? v : ''),
      })
    }
    return results.length > 0 ? results : null
  } catch {
    return null
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FigmaPage() {
  useStyles('figma-page', styles)

  // Export section state
  const [selectedTheme, setSelectedTheme] = useState<ThemeName | 'custom'>('aurora')
  const [customColor, setCustomColor] = useState('#6366f1')
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [exportOutput, setExportOutput] = useState('')

  // Import section state
  const [importJSON, setImportJSON] = useState('')
  const [parsedTokens, setParsedTokens] = useState<{ figmaName: string; cssVar: string; value: string }[] | null>(null)
  const [applied, setApplied] = useState(false)

  // Export tab
  const [exportTab, setExportTab] = useState('figma')
  const exportTabs = [
    { id: 'figma', label: 'Figma Variables' },
    { id: 'style-dict', label: 'Style Dictionary' },
    { id: 'css', label: 'CSS Variables' },
    { id: 'tailwind', label: 'Tailwind Config' },
  ]

  // Resolve the active theme tokens
  const activeTokens = useMemo<ThemeTokens>(() => {
    if (selectedTheme === 'custom') {
      return generateTheme(customColor, mode)
    }
    return mode === 'dark' ? themes[selectedTheme] : lightThemes[selectedTheme]
  }, [selectedTheme, customColor, mode])

  const activeHex = selectedTheme === 'custom' ? customColor : THEME_HEXES[selectedTheme]
  const activeName = selectedTheme === 'custom' ? 'Custom' : selectedTheme

  // Generate export output for the active tab
  const handleExport = useCallback((tabId: string) => {
    setExportTab(tabId)
    switch (tabId) {
      case 'figma': {
        const figma = themeToFigmaVariables(activeTokens, activeName, mode)
        setExportOutput(JSON.stringify(figma, null, 2))
        break
      }
      case 'style-dict': {
        const sd = themeToStyleDictionary(activeTokens, activeName)
        setExportOutput(JSON.stringify(sd, null, 2))
        break
      }
      case 'css': {
        setExportOutput(exportTheme(activeTokens, 'css'))
        break
      }
      case 'tailwind': {
        setExportOutput(exportTheme(activeTokens, 'tailwind'))
        break
      }
    }
    setExportFormat(tabId)
  }, [activeTokens, activeName, mode])

  // Parse pasted JSON
  const handleParse = useCallback(() => {
    const result = parseFigmaVariablesJSON(importJSON)
    setParsedTokens(result)
    setApplied(false)
  }, [importJSON])

  // Apply parsed tokens as CSS custom properties
  const handleApply = useCallback(() => {
    if (!parsedTokens) return
    const root = document.documentElement
    for (const token of parsedTokens) {
      root.style.setProperty(token.cssVar, token.value)
    }
    setApplied(true)
  }, [parsedTokens])

  // Reset applied tokens
  const handleReset = useCallback(() => {
    if (!parsedTokens) return
    const root = document.documentElement
    for (const token of parsedTokens) {
      root.style.removeProperty(token.cssVar)
    }
    setApplied(false)
  }, [parsedTokens])

  const themeOptions = [
    ...THEME_NAMES.map(n => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) })),
    { value: 'custom', label: 'Custom Color...' },
  ]

  return (
    <div className="figma-page">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="figma-hero">
        <div className="figma-hero__badge">
          <Badge variant="primary">Figma Integration</Badge>
        </div>
        <h1 className="figma-hero__title">Figma Integration</h1>
        <p className="figma-hero__desc">
          Bridge the gap between design and code. Export UI Kit theme tokens directly to Figma
          Variables, Style Dictionary, CSS, or Tailwind -- or import Figma tokens to apply them
          as live CSS custom properties. Keep your design system in perfect sync.
        </p>
      </section>

      {/* ── Theme Export Section ───────────────────────────────── */}
      <section className="figma-section">
        <div className="figma-section__header">
          <Icon name="upload" size="sm" />
          <h2 className="figma-section__title">Theme &rarr; Figma Export</h2>
        </div>

        <Card padding="lg">
          {/* Controls */}
          <div className="figma-controls">
            <Select
              name="figma-theme"
              label="Theme"
              options={themeOptions}
              value={selectedTheme}
              onChange={(v) => {
                setSelectedTheme(v as ThemeName | 'custom')
                setExportFormat(null)
                setExportOutput('')
              }}
            />
            {selectedTheme === 'custom' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBlockEnd: '0.25rem' }}>
                  Brand Color
                </label>
                <div className="figma-color-picker">
                  <input
                    type="color"
                    className="figma-color-picker__input"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value)
                      setExportFormat(null)
                      setExportOutput('')
                    }}
                  />
                  <span className="figma-color-picker__hex">{customColor}</span>
                </div>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBlockEnd: '0.25rem' }}>
                Mode
              </label>
              <ToggleSwitch
                checked={mode === 'light'}
                onChange={(e) => {
                  setMode(e.target.checked ? 'light' : 'dark')
                  setExportFormat(null)
                  setExportOutput('')
                }}
                label={mode === 'dark' ? 'Dark' : 'Light'}
              />
            </div>
          </div>

          {/* Token Preview Grid */}
          <div style={{ marginBlockEnd: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {Object.keys(activeTokens).length} tokens | Hex: {activeHex} | Mode: {mode}
          </div>
          <div className="figma-tokens">
            {Object.entries(activeTokens).map(([key, value]) => (
              <div key={key} className="figma-token">
                <div
                  className="figma-token__swatch"
                  style={{ background: value }}
                />
                <div className="figma-token__info">
                  <div className="figma-token__name">{tokenKeyToCSS(key)}</div>
                  <div className="figma-token__value">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Export Tabs */}
          <Tabs
            tabs={exportTabs}
            activeTab={exportTab}
            onChange={handleExport}
            variant="pills"
            size="sm"
          >
            <TabPanel tabId="figma">
              <div className="figma-export-output">
                {exportFormat === 'figma' ? (
                  <CopyBlock code={exportOutput} language="json" />
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleExport('figma')}>
                    Export Figma Variables JSON
                  </Button>
                )}
              </div>
            </TabPanel>
            <TabPanel tabId="style-dict">
              <div className="figma-export-output">
                {exportFormat === 'style-dict' ? (
                  <CopyBlock code={exportOutput} language="json" />
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleExport('style-dict')}>
                    Export Style Dictionary
                  </Button>
                )}
              </div>
            </TabPanel>
            <TabPanel tabId="css">
              <div className="figma-export-output">
                {exportFormat === 'css' ? (
                  <CopyBlock code={exportOutput} language="css" />
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleExport('css')}>
                    Export CSS Variables
                  </Button>
                )}
              </div>
            </TabPanel>
            <TabPanel tabId="tailwind">
              <div className="figma-export-output">
                {exportFormat === 'tailwind' ? (
                  <CopyBlock code={exportOutput} language="javascript" />
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleExport('tailwind')}>
                    Export Tailwind Config
                  </Button>
                )}
              </div>
            </TabPanel>
          </Tabs>
        </Card>
      </section>

      {/* ── Figma Import Section ──────────────────────────────── */}
      <section className="figma-section">
        <div className="figma-section__header">
          <Icon name="download" size="sm" />
          <h2 className="figma-section__title">Figma &rarr; Code Import</h2>
        </div>

        <Card padding="lg">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBlockEnd: '1rem', lineHeight: 1.6 }}>
            Paste Figma Variables JSON exported from your Figma file. The parser detects tokens
            and maps them to UI Kit CSS custom properties that you can apply live.
          </p>

          <textarea
            className="figma-import-area"
            placeholder={`Paste Figma Variables JSON here, e.g.:
{
  "collections": [{
    "name": "My Theme",
    "modes": [{ "name": "dark" }],
    "variables": [
      { "name": "brand", "type": "COLOR", "value": "#6366f1" },
      { "name": "bg-base", "type": "COLOR", "value": "#0d0d1a" }
    ]
  }]
}`}
            value={importJSON}
            onChange={(e) => {
              setImportJSON(e.target.value)
              setParsedTokens(null)
              setApplied(false)
            }}
          />

          <div className="figma-import-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={handleParse}
              disabled={!importJSON.trim()}
            >
              Parse Tokens
            </Button>
            {parsedTokens && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleApply}
                  disabled={applied}
                >
                  Apply Theme Live
                </Button>
                {applied && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                )}
              </>
            )}
          </div>

          {parsedTokens === null && importJSON.trim() !== '' && (
            <div style={{ marginBlockStart: '0.75rem', fontSize: '0.8125rem', color: 'var(--status-critical)' }}>
              Could not parse the JSON. Make sure it is valid Figma Variables format.
            </div>
          )}

          {parsedTokens && parsedTokens.length > 0 && (
            <div className="figma-import-result">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>
                {parsedTokens.length} token{parsedTokens.length !== 1 ? 's' : ''} detected:
              </div>
              <div className="figma-mapped-tokens">
                {parsedTokens.map((t, i) => (
                  <div key={i} className="figma-mapped-row">
                    <span className="figma-mapped-row__figma">{t.figmaName}</span>
                    <span className="figma-mapped-row__arrow">&rarr;</span>
                    <span className="figma-mapped-row__css">{t.cssVar}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginInlineStart: 'auto' }}>
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>
              {applied && (
                <div className="figma-applied-banner">
                  <Icon name="check-circle" size="sm" />
                  Theme applied! The page is now using your imported tokens.
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* ── Plugin Installation ────────────────────────────────── */}
      <section className="figma-section">
        <div className="figma-section__header">
          <Icon name="settings" size="sm" />
          <h2 className="figma-section__title">Figma Plugin Setup</h2>
        </div>

        <Card padding="lg">
          <div className="figma-plugin-steps">
            <div className="figma-plugin-step">
              <div className="figma-plugin-step__num">1</div>
              <div className="figma-plugin-step__content">
                <div className="figma-plugin-step__label">Install the Plugin</div>
                <div className="figma-plugin-step__desc">
                  Open Figma, go to Plugins &rarr; Development &rarr; Import plugin from manifest.
                  Point to the <code>figma-plugin/manifest.json</code> in the ui-kit repository.
                </div>
              </div>
            </div>

            <div className="figma-plugin-step">
              <div className="figma-plugin-step__num">2</div>
              <div className="figma-plugin-step__content">
                <div className="figma-plugin-step__label">Export Tokens from CLI</div>
                <div className="figma-plugin-step__desc">
                  Use the CLI to generate Figma-compatible token files:
                </div>
                <div style={{ marginBlockStart: '0.5rem' }}>
                  <CopyBlock
                    code={`# Export Figma Variables JSON
npx @annondeveloper/ui-kit figma-export --format figma --theme aurora

# Export Style Dictionary format
npx @annondeveloper/ui-kit figma-export --format style-dictionary --theme sunset

# Export all formats at once
npx @annondeveloper/ui-kit figma-export --all --theme ocean --mode light`}
                    language="bash"
                  />
                </div>
              </div>
            </div>

            <div className="figma-plugin-step">
              <div className="figma-plugin-step__num">3</div>
              <div className="figma-plugin-step__content">
                <div className="figma-plugin-step__label">Import into Figma</div>
                <div className="figma-plugin-step__desc">
                  Run the plugin in Figma and paste the exported JSON. The plugin creates
                  Figma Variables for every token, grouped by category (brand, background,
                  border, text, status, aurora). Use these variables in your designs for
                  automatic theme switching.
                </div>
              </div>
            </div>

            <div className="figma-plugin-step">
              <div className="figma-plugin-step__num">4</div>
              <div className="figma-plugin-step__content">
                <div className="figma-plugin-step__label">Round-trip Sync</div>
                <div className="figma-plugin-step__desc">
                  When designers update tokens in Figma, export them as Variables JSON and
                  use the import panel above to verify the mapping. Then paste the CSS output
                  into your project&apos;s theme file for a complete design-to-code round trip.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Workflow Diagram ─────────────────────────────────── */}
      <section className="figma-section">
        <div className="figma-section__header">
          <Icon name="activity" size="sm" />
          <h2 className="figma-section__title">Token Workflow</h2>
        </div>
        <Card padding="lg">
          <CopyBlock
            code={`Design System Workflow:

  UI Kit Theme ──── generateTheme('#6366f1') ────> ThemeTokens
       │                                               │
       │                                               ├── themeToFigmaVariables() ──> Figma Variables JSON
       │                                               ├── themeToStyleDictionary() ──> Style Dictionary
       │                                               ├── themeToCSS()             ──> CSS Custom Properties
       │                                               └── exportTailwind()         ──> Tailwind Config
       │
  Figma File ────── Variables JSON Export ──────> Parse & Map ──> CSS Variables ──> Live Theme`}
            language="text"
          />
        </Card>
      </section>
    </div>
  )
}
