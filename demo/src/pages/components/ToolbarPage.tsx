'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Toolbar } from '@ui/components/toolbar'
import { Toolbar as LiteToolbar } from '@ui/lite/toolbar'
import { Toolbar as PremiumToolbar } from '@ui/premium/toolbar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { SearchInput } from '@ui/components/search-input'
import { Badge } from '@ui/components/badge'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.toolbar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: toolbar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .toolbar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .toolbar-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: aurora-spin-toolbar 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-toolbar {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toolbar-page__hero::before { animation: none; }
      }

      .toolbar-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .toolbar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .toolbar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .toolbar-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .toolbar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ─── */

      .toolbar-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: toolbar-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes toolbar-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .toolbar-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .toolbar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .toolbar-page__section-title a { color: inherit; text-decoration: none; }
      .toolbar-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .toolbar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview ─── */

      .toolbar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .toolbar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─── */

      .toolbar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .toolbar-page__playground { grid-template-columns: 1fr; }
      }

      @container toolbar-page (max-width: 680px) {
        .toolbar-page__playground { grid-template-columns: 1fr; }
      }

      .toolbar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .toolbar-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .toolbar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .toolbar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .toolbar-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .toolbar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .toolbar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .toolbar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .toolbar-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .toolbar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .toolbar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Tier Cards ─── */

      .toolbar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .toolbar-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .toolbar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .toolbar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .toolbar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .toolbar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .toolbar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .toolbar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .toolbar-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .toolbar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .toolbar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color presets ─── */

      .toolbar-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .toolbar-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .toolbar-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .toolbar-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ─── */

      .toolbar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .toolbar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .toolbar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .toolbar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─── */

      .toolbar-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .toolbar-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Code tabs ─── */

      .toolbar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .toolbar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .toolbar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Responsive ─── */

      @media (max-width: 768px) {
        .toolbar-page__hero { padding: 2rem 1.25rem; }
        .toolbar-page__title { font-size: 1.75rem; }
        .toolbar-page__preview { padding: 1.75rem; }
        .toolbar-page__playground { grid-template-columns: 1fr; }
        .toolbar-page__tiers { grid-template-columns: 1fr; }
        .toolbar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .toolbar-page__hero { padding: 1.5rem 1rem; }
        .toolbar-page__title { font-size: 1.5rem; }
        .toolbar-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .toolbar-page__title { font-size: 4rem; }
      }
    }
  }
`

// ─── Props Data ─────────────────────────────────────────────────────────────

const toolbarProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', description: 'Toolbar content: search inputs, filter buttons, action buttons.' },
  { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Gap between items.' },
  { name: 'justify', type: "'start' | 'end' | 'between' | 'center'", default: "'start'", description: 'Horizontal alignment.' },
  { name: 'wrap', type: 'boolean', default: 'false', description: 'Allow items to wrap on narrow containers.' },
  { name: 'sticky', type: 'boolean', default: 'false', description: 'Stick to top of scroll container with backdrop blur.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

type Gap = 'sm' | 'md' | 'lg'
type Justify = 'start' | 'end' | 'between' | 'center'
const GAPS: Gap[] = ['sm', 'md', 'lg']
const JUSTIFIES: Justify[] = ['start', 'end', 'between', 'center']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Toolbar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Toolbar } from '@annondeveloper/ui-kit'",
  premium: "import { Toolbar } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="toolbar-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="toolbar-page__control-group">
      <span className="toolbar-page__control-label">{label}</span>
      <div className="toolbar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`toolbar-page__option-btn${opt === value ? ' toolbar-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, gap: Gap, justify: Justify, wrap: boolean, sticky: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (gap !== 'md') props.push(`  gap="${gap}"`)
  if (justify !== 'start') props.push(`  justify="${justify}"`)
  if (wrap) props.push(`  wrap`)
  if (sticky) props.push(`  sticky`)

  const content = `  <SearchInput placeholder="Search..." size="sm" />\n  <Button variant="secondary" size="sm">Filter</Button>\n  <Button variant="primary" size="sm">Add New</Button>`
  const propsStr = props.length ? `\n${props.join('\n')}\n` : ''
  return `${importStr}\n\n<Toolbar${propsStr}>\n${content}\n</Toolbar>`
}

function generateHtmlCode(tier: Tier, gap: Gap, justify: Justify, wrap: boolean, sticky: boolean): string {
  const className = tier === 'lite' ? 'ui-lite-toolbar' : 'ui-toolbar'
  const attrs = [`class="${className}"`, `role="toolbar"`, `data-gap="${gap}"`, `data-justify="${justify}"`]
  if (wrap) attrs.push('data-wrap="true"')
  if (sticky) attrs.push('data-sticky="true"')
  return `<!-- Toolbar — ${tier} tier -->\n<div ${attrs.join(' ')}>\n  <input type="search" placeholder="Search...">\n  <button class="ui-button" data-variant="secondary" data-size="sm">Filter</button>\n  <button class="ui-button" data-variant="primary" data-size="sm">Add New</button>\n</div>`
}

function generateVueCode(tier: Tier, gap: Gap, justify: Justify, wrap: boolean, sticky: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-toolbar"`, `role="toolbar"`, `data-gap="${gap}"`, `data-justify="${justify}"`]
    if (wrap) attrs.push('data-wrap="true"')
    if (sticky) attrs.push('data-sticky="true"')
    return `<template>\n  <div ${attrs.join(' ')}>\n    <input type="search" placeholder="Search...">\n    <button>Filter</button>\n    <button>Add New</button>\n  </div>\n</template>\n\n<style>\n@import '${importPath}/styles.css';\n</style>`
  }
  const props = []
  if (gap !== 'md') props.push(`gap="${gap}"`)
  if (justify !== 'start') props.push(`justify="${justify}"`)
  if (wrap) props.push('wrap')
  if (sticky) props.push('sticky')
  return `<template>\n  <Toolbar${props.length ? ' ' + props.join(' ') : ''}>\n    <SearchInput placeholder="Search..." size="sm" />\n    <Button variant="secondary" size="sm">Filter</Button>\n    <Button variant="primary" size="sm">Add New</Button>\n  </Toolbar>\n</template>\n\n<script setup>\nimport { Toolbar } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, gap: Gap, justify: Justify, wrap: boolean, sticky: boolean): string {
  const className = tier === 'lite' ? 'ui-lite-toolbar' : 'ui-toolbar'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [`class="${className}"`, `role="toolbar"`, `data-gap="${gap}"`, `data-justify="${justify}"`]
  if (wrap) attrs.push('data-wrap="true"')
  if (sticky) attrs.push('data-sticky="true"')
  return `<!-- Angular — ${tier} tier (CSS-only approach) -->\n<div ${attrs.join(' ')}>\n  <input type="search" placeholder="Search...">\n  <button class="ui-button" data-variant="secondary" data-size="sm">Filter</button>\n  <button class="ui-button" data-variant="primary" data-size="sm">Add New</button>\n</div>\n\n/* In styles.css */\n@import '${importPath}/css/components/toolbar.css';`
}

function generateSvelteCode(tier: Tier, gap: Gap, justify: Justify, wrap: boolean, sticky: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-toolbar"`, `role="toolbar"`, `data-gap="${gap}"`, `data-justify="${justify}"`]
    if (wrap) attrs.push('data-wrap="true"')
    if (sticky) attrs.push('data-sticky="true"')
    return `<!-- Svelte — Lite tier -->\n<div ${attrs.join(' ')}>\n  <input type="search" placeholder="Search...">\n  <button>Filter</button>\n  <button>Add New</button>\n</div>\n\n<style>\n  @import '${importPath}/styles.css';\n</style>`
  }
  const props = []
  if (gap !== 'md') props.push(`gap="${gap}"`)
  if (justify !== 'start') props.push(`justify="${justify}"`)
  if (wrap) props.push('wrap')
  if (sticky) props.push('sticky')
  return `<script>\n  import { Toolbar } from '${importPath}';\n</script>\n\n<Toolbar${props.length ? ' ' + props.join(' ') : ''}>\n  <input type="search" placeholder="Search...">\n  <button>Filter</button>\n  <button>Add New</button>\n</Toolbar>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [gap, setGap] = useState<Gap>('md')
  const [justify, setJustify] = useState<Justify>('start')
  const [wrap, setWrap] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const TBComponent = tier === 'lite' ? LiteToolbar : tier === 'premium' ? PremiumToolbar : Toolbar

  const reactCode = useMemo(() => generateReactCode(tier, gap, justify, wrap, sticky), [tier, gap, justify, wrap, sticky])
  const htmlCode = useMemo(() => generateHtmlCode(tier, gap, justify, wrap, sticky), [tier, gap, justify, wrap, sticky])
  const vueCode = useMemo(() => generateVueCode(tier, gap, justify, wrap, sticky), [tier, gap, justify, wrap, sticky])
  const angularCode = useMemo(() => generateAngularCode(tier, gap, justify, wrap, sticky), [tier, gap, justify, wrap, sticky])
  const svelteCode = useMemo(() => generateSvelteCode(tier, gap, justify, wrap, sticky), [tier, gap, justify, wrap, sticky])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="toolbar-page__section" id="playground">
      <h2 className="toolbar-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="toolbar-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="toolbar-page__playground">
        <div className="toolbar-page__playground-preview">
          <div className="toolbar-page__playground-result" style={{ placeItems: 'stretch' }}>
            <TBComponent gap={gap} justify={justify} wrap={wrap} sticky={sticky}>
              <Button variant="secondary" size="sm" icon={<Icon name="search" size="sm" />}>Search</Button>
              <Button variant="secondary" size="sm">Filter</Button>
              <Button variant="primary" size="sm" icon={<Icon name="plus" size="sm" />}>Add New</Button>
            </TBComponent>
          </div>

          <div className="toolbar-page__code-tabs">
            <div className="toolbar-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="toolbar-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="toolbar-page__playground-controls">
          <OptionGroup label="Gap" options={GAPS} value={gap} onChange={setGap} />
          <OptionGroup label="Justify" options={JUSTIFIES} value={justify} onChange={setJustify} />
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
          <div className="toolbar-page__control-group">
            <span className="toolbar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Wrap" checked={wrap} onChange={setWrap} />
              <Toggle label="Sticky" checked={sticky} onChange={setSticky} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ToolbarPage() {
  useStyles('toolbar-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const TBComponent = tier === 'lite' ? LiteToolbar : tier === 'premium' ? PremiumToolbar : Toolbar

  const sizeInfo = useMemo(() => {
    if (tier === 'lite') return { component: 0.3, shared: 3.7, total: 4.0, note: 'CSS-only wrapper with role="toolbar".' }
    if (tier === 'premium') return { component: 1.3, shared: 3.3, total: 4.6, note: 'Premium wraps Standard with entrance and aurora effects.' }
    return { component: 1.2, shared: 0.9, total: 2.1, note: 'Standard with sticky backdrop blur and container queries.' }
  }, [tier])

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = ['brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2']

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.toolbar-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="toolbar-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ─── */}
      <div className="toolbar-page__hero">
        <h1 className="toolbar-page__title">Toolbar</h1>
        <p className="toolbar-page__desc">
          Horizontal bar for search inputs, filters, and action buttons. Supports sticky mode
          with backdrop blur, configurable gap, alignment, and wrapping. Ships in three weight
          tiers from 0.3KB lite to 1.3KB premium.
        </p>
        <div className="toolbar-page__import-row">
          <code className="toolbar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyBtn text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ─── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Gap Variants ─── */}
      <section className="toolbar-page__section" id="gap">
        <h2 className="toolbar-page__section-title"><a href="#gap">Gap Variants</a></h2>
        <p className="toolbar-page__section-desc">
          Three gap sizes control spacing between toolbar items.
        </p>
        <div className="toolbar-page__preview">
          {GAPS.map(g => (
            <div key={g} style={{ width: '100%' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>gap="{g}"</div>
              <TBComponent gap={g}>
                <Button variant="secondary" size="sm">Action 1</Button>
                <Button variant="secondary" size="sm">Action 2</Button>
                <Button variant="primary" size="sm">Action 3</Button>
              </TBComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Justify Variants ─── */}
      <section className="toolbar-page__section" id="justify">
        <h2 className="toolbar-page__section-title"><a href="#justify">Justify Variants</a></h2>
        <p className="toolbar-page__section-desc">
          Control horizontal alignment of toolbar items with the justify prop.
        </p>
        <div className="toolbar-page__preview">
          {JUSTIFIES.map(j => (
            <div key={j} style={{ width: '100%' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>justify="{j}"</div>
              <TBComponent justify={j}>
                <Button variant="secondary" size="sm">Left</Button>
                <Button variant="secondary" size="sm">Center</Button>
                <Button variant="primary" size="sm">Right</Button>
              </TBComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Sticky Mode ─── */}
      <section className="toolbar-page__section" id="sticky">
        <h2 className="toolbar-page__section-title"><a href="#sticky">Sticky Mode</a></h2>
        <p className="toolbar-page__section-desc">
          Enable <code>sticky</code> to pin the toolbar at the top with backdrop blur. Scroll within the container below to see it in action.
        </p>
        <div className="toolbar-page__preview" style={{ maxBlockSize: '250px', overflowY: 'auto' }}>
          <TBComponent sticky justify="between">
            <Button variant="secondary" size="sm" icon={<Icon name="search" size="sm" />}>Search</Button>
            <Button variant="primary" size="sm" icon={<Icon name="plus" size="sm" />}>Add</Button>
          </TBComponent>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Scroll item {i + 1} — The toolbar stays fixed at the top
            </div>
          ))}
        </div>
        <CopyBlock code={`<Toolbar sticky justify="between">\n  <SearchInput placeholder="Search..." size="sm" />\n  <Button variant="primary" size="sm">Add</Button>\n</Toolbar>`} language="typescript" />
      </section>

      {/* ── 6. Wrapping ─── */}
      <section className="toolbar-page__section" id="wrap">
        <h2 className="toolbar-page__section-title"><a href="#wrap">Wrapping</a></h2>
        <p className="toolbar-page__section-desc">
          Enable <code>wrap</code> to allow items to flow to the next line on narrow containers.
          Mobile containers auto-wrap at 480px regardless of this prop.
        </p>
        <div className="toolbar-page__preview" style={{ maxInlineSize: '400px' }}>
          <TBComponent wrap gap="sm">
            <Button variant="secondary" size="sm">All</Button>
            <Button variant="secondary" size="sm">Active</Button>
            <Button variant="secondary" size="sm">Pending</Button>
            <Button variant="secondary" size="sm">Resolved</Button>
            <Button variant="secondary" size="sm">Archived</Button>
            <Badge variant="info">5 filters</Badge>
          </TBComponent>
        </div>
        <CopyBlock code={`<Toolbar wrap gap="sm">\n  <Button variant="secondary" size="sm">All</Button>\n  <Button variant="secondary" size="sm">Active</Button>\n  <Button variant="secondary" size="sm">Pending</Button>\n  <Badge variant="info">5 filters</Badge>\n</Toolbar>`} language="typescript" />
      </section>

      {/* ── 7. Real-World Example ─── */}
      <section className="toolbar-page__section" id="real-world">
        <h2 className="toolbar-page__section-title"><a href="#real-world">Real-World Example</a></h2>
        <p className="toolbar-page__section-desc">
          A typical data table toolbar with search, filters, and actions.
        </p>
        <div className="toolbar-page__preview" style={{ gap: '0' }}>
          <TBComponent justify="between" wrap>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <SearchInput placeholder="Search records..." size="sm" style={{ minInlineSize: '200px' }} />
              <Button variant="secondary" size="sm" icon={<Icon name="filter" size="sm" />}>Filters</Button>
              <Badge variant="warning">3 active</Badge>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button variant="secondary" size="sm" icon={<Icon name="download" size="sm" />}>Export</Button>
              <Button variant="primary" size="sm" icon={<Icon name="plus" size="sm" />}>New Record</Button>
            </div>
          </TBComponent>
        </div>
      </section>

      {/* ── 8. Weight Tiers ─── */}
      <section className="toolbar-page__section" id="tiers">
        <h2 className="toolbar-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="toolbar-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface.
        </p>

        <div className="toolbar-page__tiers">
          {/* Lite */}
          <div
            className={`toolbar-page__tier-card${tier === 'lite' ? ' toolbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="toolbar-page__tier-header">
              <span className="toolbar-page__tier-name">Lite</span>
              <span className="toolbar-page__tier-size">~0.3 KB</span>
            </div>
            <p className="toolbar-page__tier-desc">CSS-only wrapper with role="toolbar". No style engine, no backdrop blur effects.</p>
            <div className="toolbar-page__tier-import">import {'{'} Toolbar {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="toolbar-page__size-breakdown">
              <div className="toolbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`toolbar-page__tier-card${tier === 'standard' ? ' toolbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="toolbar-page__tier-header">
              <span className="toolbar-page__tier-name">Standard</span>
              <span className="toolbar-page__tier-size">~1.2 KB</span>
            </div>
            <p className="toolbar-page__tier-desc">Full-featured with sticky backdrop blur, container queries for mobile, and forced colors support.</p>
            <div className="toolbar-page__tier-import">import {'{'} Toolbar {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="toolbar-page__size-breakdown">
              <div className="toolbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`toolbar-page__tier-card${tier === 'premium' ? ' toolbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="toolbar-page__tier-header">
              <span className="toolbar-page__tier-name">Premium</span>
              <span className="toolbar-page__tier-size">~1.3 KB</span>
            </div>
            <p className="toolbar-page__tier-desc">Everything in Standard plus entrance animation, aurora glow backdrop, and shimmer effects.</p>
            <div className="toolbar-page__tier-import">import {'{'} Toolbar {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="toolbar-page__size-breakdown">
              <div className="toolbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─── */}
      <section className="toolbar-page__section" id="brand-color">
        <h2 className="toolbar-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="toolbar-page__section-desc">
          Pick a brand color to see the toolbar update in real-time. The theme generates derived colors automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="toolbar-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`toolbar-page__color-preset${brandColor === p.hex ? ' toolbar-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 10. Props API ─── */}
      <section className="toolbar-page__section" id="props">
        <h2 className="toolbar-page__section-title"><a href="#props">Props API</a></h2>
        <p className="toolbar-page__section-desc">
          All props accepted by Toolbar. It also spreads native {'<div>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={toolbarProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ─── */}
      <section className="toolbar-page__section" id="accessibility">
        <h2 className="toolbar-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="toolbar-page__section-desc">
          Built with the WAI-ARIA toolbar pattern for proper keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="toolbar-page__a11y-list">
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Role:</strong> Uses <code className="toolbar-page__a11y-key">role="toolbar"</code> for assistive technology recognition.</span>
            </li>
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Keyboard:</strong> Arrow keys navigate between toolbar items per WAI-ARIA APG toolbar pattern.</span>
            </li>
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Reduced motion:</strong> Backdrop blur disabled with <code className="toolbar-page__a11y-key">prefers-reduced-motion: reduce</code>.</span>
            </li>
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="toolbar-page__a11y-key">forced-colors: active</code> with Canvas background and visible borders.</span>
            </li>
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Print:</strong> Sticky mode disabled in print view, backdrop removed.</span>
            </li>
            <li className="toolbar-page__a11y-item">
              <span className="toolbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Mobile:</strong> Auto-wraps at 480px via <code className="toolbar-page__a11y-key">@container</code> query for narrow viewports.</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 12. Source ─── */}
      <section className="toolbar-page__section" id="source">
        <h2 className="toolbar-page__section-title"><a href="#source">Source</a></h2>
        <p className="toolbar-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="toolbar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/toolbar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/toolbar.tsx (Standard)
          </a>
          <a className="toolbar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/toolbar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/toolbar.tsx (Lite)
          </a>
          <a className="toolbar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/toolbar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/toolbar.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
