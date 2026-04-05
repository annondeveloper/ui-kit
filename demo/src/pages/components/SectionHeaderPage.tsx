'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SectionHeader } from '@ui/components/section-header'
import { SectionHeader as LiteSectionHeader } from '@ui/lite/section-header'
import { SectionHeader as PremiumSectionHeader } from '@ui/premium/section-header'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.sectionheader-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: sectionheader-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .sectionheader-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .sectionheader-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .sectionheader-page__hero::before { animation: none; }
      }

      .sectionheader-page__title {
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

      .sectionheader-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .sectionheader-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .sectionheader-page__import-code {
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

      .sectionheader-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ─── */

      .sectionheader-page__section {
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
        animation: sectionheader-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sectionheader-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .sectionheader-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .sectionheader-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .sectionheader-page__section-title a { color: inherit; text-decoration: none; }
      .sectionheader-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .sectionheader-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview ─── */

      .sectionheader-page__preview {
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

      .sectionheader-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─── */

      .sectionheader-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .sectionheader-page__playground { grid-template-columns: 1fr; }
      }

      @container sectionheader-page (max-width: 680px) {
        .sectionheader-page__playground { grid-template-columns: 1fr; }
      }

      .sectionheader-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .sectionheader-page__playground-result {
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

      .sectionheader-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .sectionheader-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .sectionheader-page__playground-controls {
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

      .sectionheader-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .sectionheader-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sectionheader-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .sectionheader-page__option-btn {
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
      .sectionheader-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .sectionheader-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .sectionheader-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .sectionheader-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Tier Cards ─── */

      .sectionheader-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .sectionheader-page__tier-card {
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

      .sectionheader-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sectionheader-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .sectionheader-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sectionheader-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .sectionheader-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .sectionheader-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .sectionheader-page__tier-import {
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

      .sectionheader-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .sectionheader-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color presets ─── */

      .sectionheader-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .sectionheader-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .sectionheader-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .sectionheader-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ─── */

      .sectionheader-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .sectionheader-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .sectionheader-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .sectionheader-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─── */

      .sectionheader-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .sectionheader-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Code tabs ─── */

      .sectionheader-page__code-tabs {
        margin-block-start: 1rem;
      }

      .sectionheader-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .sectionheader-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Responsive ─── */

      @media (max-width: 768px) {
        .sectionheader-page__hero { padding: 2rem 1.25rem; }
        .sectionheader-page__title { font-size: 1.75rem; }
        .sectionheader-page__preview { padding: 1.75rem; }
        .sectionheader-page__playground { grid-template-columns: 1fr; }
        .sectionheader-page__tiers { grid-template-columns: 1fr; }
        .sectionheader-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .sectionheader-page__hero { padding: 1.5rem 1rem; }
        .sectionheader-page__title { font-size: 1.5rem; }
        .sectionheader-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .sectionheader-page__title { font-size: 4rem; }
      }
    }
  }
`

// ─── Props Data ─────────────────────────────────────────────────────────────

const sectionHeaderProps: PropDef[] = [
  { name: 'title', type: 'string', description: 'Section title text (required).' },
  { name: 'description', type: 'string', description: 'Optional description below the title.' },
  { name: 'action', type: 'ReactNode', description: 'Action slot rendered on the right side, e.g. a Button or Link.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Title size scale.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SectionHeader } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SectionHeader } from '@annondeveloper/ui-kit'",
  premium: "import { SectionHeader } from '@annondeveloper/ui-kit/premium'",
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
      className="sectionheader-page__copy-btn"
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
    <div className="sectionheader-page__control-group">
      <span className="sectionheader-page__control-label">{label}</span>
      <div className="sectionheader-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`sectionheader-page__option-btn${opt === value ? ' sectionheader-page__option-btn--active' : ''}`}
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

function generateReactCode(tier: Tier, size: Size, titleText: string, description: string, showAction: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push(`  title="${titleText}"`)
  if (description) props.push(`  description="${description}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showAction) props.push(`  action={<Button variant="ghost" size="sm">View All</Button>}`)
  return `${importStr}\n\n<SectionHeader\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, size: Size, titleText: string, description: string): string {
  const className = tier === 'lite' ? 'ui-lite-section-header' : 'ui-section-header'
  return `<!-- SectionHeader — ${tier} tier -->\n<header class="${className}" data-size="${size}">\n  <div class="${className}__left">\n    <h2 class="${className}__title">${titleText}</h2>${description ? `\n    <p class="${className}__description">${description}</p>` : ''}\n  </div>\n  <div class="${className}__action">\n    <button class="ui-button" data-variant="ghost" data-size="sm">View All</button>\n  </div>\n</header>`
}

function generateVueCode(tier: Tier, size: Size, titleText: string, description: string, showAction: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  if (tier === 'lite') {
    return `<template>\n  <header class="ui-lite-section-header" data-size="${size}">\n    <div class="ui-lite-section-header__left">\n      <h2 class="ui-lite-section-header__title">${titleText}</h2>${description ? `\n      <p class="ui-lite-section-header__description">${description}</p>` : ''}\n    </div>\n  </header>\n</template>\n\n<style>\n@import '${importPath}/styles.css';\n</style>`
  }
  const props = [`title="${titleText}"`]
  if (description) props.push(`description="${description}"`)
  if (size !== 'md') props.push(`size="${size}"`)
  return `<template>\n  <SectionHeader\n    ${props.join('\n    ')}\n  />\n</template>\n\n<script setup>\nimport { SectionHeader } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, size: Size, titleText: string, description: string): string {
  const className = tier === 'lite' ? 'ui-lite-section-header' : 'ui-section-header'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier (CSS-only approach) -->\n<header class="${className}" data-size="${size}">\n  <div class="${className}__left">\n    <h2 class="${className}__title">${titleText}</h2>${description ? `\n    <p class="${className}__description">${description}</p>` : ''}\n  </div>\n</header>\n\n/* In styles.css */\n@import '${importPath}/css/components/section-header.css';`
}

function generateSvelteCode(tier: Tier, size: Size, titleText: string, description: string, showAction: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier -->\n<header class="ui-lite-section-header" data-size="${size}">\n  <div class="ui-lite-section-header__left">\n    <h2 class="ui-lite-section-header__title">${titleText}</h2>${description ? `\n    <p class="ui-lite-section-header__description">${description}</p>` : ''}\n  </div>\n</header>\n\n<style>\n  @import '${importPath}/styles.css';\n</style>`
  }
  return `<script>\n  import { SectionHeader } from '${importPath}';\n</script>\n\n<SectionHeader\n  title="${titleText}"\n  ${description ? `description="${description}"` : ''}\n  ${size !== 'md' ? `size="${size}"` : ''}\n/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [titleText, setTitleText] = useState('Dashboard Overview')
  const [description, setDescription] = useState('Key metrics and recent activity')
  const [showAction, setShowAction] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const SHComponent = tier === 'lite' ? LiteSectionHeader : tier === 'premium' ? PremiumSectionHeader : SectionHeader

  const reactCode = useMemo(() => generateReactCode(tier, size, titleText, description, showAction), [tier, size, titleText, description, showAction])
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, titleText, description), [tier, size, titleText, description])
  const vueCode = useMemo(() => generateVueCode(tier, size, titleText, description, showAction), [tier, size, titleText, description, showAction])
  const angularCode = useMemo(() => generateAngularCode(tier, size, titleText, description), [tier, size, titleText, description])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, titleText, description, showAction), [tier, size, titleText, description, showAction])

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
    <section className="sectionheader-page__section" id="playground">
      <h2 className="sectionheader-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="sectionheader-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="sectionheader-page__playground">
        <div className="sectionheader-page__playground-preview">
          <div className="sectionheader-page__playground-result" style={{ placeItems: 'stretch' }}>
            <SHComponent
              title={titleText}
              description={description || undefined}
              size={size}
              action={showAction ? <Button variant="ghost" size="sm">View All</Button> : undefined}
            />
          </div>

          <div className="sectionheader-page__code-tabs">
            <div className="sectionheader-page__export-row">
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
              {copyStatus && <span className="sectionheader-page__export-status">{copyStatus}</span>}
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

        <div className="sectionheader-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
          <div className="sectionheader-page__control-group">
            <span className="sectionheader-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show action" checked={showAction} onChange={setShowAction} />
            </div>
          </div>
          <div className="sectionheader-page__control-group">
            <span className="sectionheader-page__control-label">Title</span>
            <input
              type="text"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              className="sectionheader-page__text-input"
              placeholder="Section title..."
            />
          </div>
          <div className="sectionheader-page__control-group">
            <span className="sectionheader-page__control-label">Description</span>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="sectionheader-page__text-input"
              placeholder="Optional description..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SectionHeaderPage() {
  useStyles('sectionheader-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const SHComponent = tier === 'lite' ? LiteSectionHeader : tier === 'premium' ? PremiumSectionHeader : SectionHeader

  const sizeInfo = useMemo(() => {
    if (tier === 'lite') return { component: 0.3, shared: 3.7, total: 4.0, note: 'CSS-only wrapper, zero JS beyond forwardRef.' }
    if (tier === 'premium') return { component: 1.2, shared: 3.3, total: 4.5, note: 'Premium wraps Standard with entrance animation and aurora glow.' }
    return { component: 1.1, shared: 0.9, total: 2.0, note: 'Standard with useStyles and scoped CSS.' }
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
    const sections = document.querySelectorAll('.sectionheader-page__section')
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
    <div className="sectionheader-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ─── */}
      <div className="sectionheader-page__hero">
        <h1 className="sectionheader-page__title">SectionHeader</h1>
        <p className="sectionheader-page__desc">
          Section title with optional description and action slot. Renders as a flex row
          with title/description on the left and an action on the right. Ships in three
          weight tiers from 0.3KB lite to 1.2KB premium.
        </p>
        <div className="sectionheader-page__import-row">
          <code className="sectionheader-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyBtn text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ─── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. All Sizes ─── */}
      <section className="sectionheader-page__section" id="sizes">
        <h2 className="sectionheader-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="sectionheader-page__section-desc">
          Three sizes for different levels of visual hierarchy. Title font-size scales fluidly with clamp().
        </p>
        <div className="sectionheader-page__preview">
          {SIZES.map(s => (
            <SHComponent key={s} title={`${s.toUpperCase()} Section Title`} description={`This is a ${s} section header with description`} size={s} />
          ))}
        </div>
      </section>

      {/* ── 4. With Actions ─── */}
      <section className="sectionheader-page__section" id="actions">
        <h2 className="sectionheader-page__section-title"><a href="#actions">With Actions</a></h2>
        <p className="sectionheader-page__section-desc">
          Pass any ReactNode to the <code>action</code> prop. Typically a Button, Link, or icon button.
        </p>
        <div className="sectionheader-page__preview">
          <SHComponent
            title="Recent Activity"
            description="Last 7 days of user activity"
            action={<Button variant="ghost" size="sm" icon={<Icon name="arrow-right" size="sm" />}>View All</Button>}
          />
          <SHComponent
            title="Team Members"
            action={<Button variant="primary" size="sm" icon={<Icon name="plus" size="sm" />}>Invite</Button>}
          />
          <SHComponent
            title="Settings"
            description="Configure your account preferences"
            action={<Button variant="secondary" size="sm" icon={<Icon name="settings" size="sm" />}>Configure</Button>}
          />
        </div>
      </section>

      {/* ── 5. Title Only ─── */}
      <section className="sectionheader-page__section" id="title-only">
        <h2 className="sectionheader-page__section-title"><a href="#title-only">Title Only</a></h2>
        <p className="sectionheader-page__section-desc">
          Use SectionHeader without description or action for simple section dividers.
        </p>
        <div className="sectionheader-page__preview">
          <SHComponent title="Simple Section" />
          <SHComponent title="Another Section" size="sm" />
          <SHComponent title="Large Heading" size="lg" />
        </div>
        <CopyBlock
          code={`<SectionHeader title="Simple Section" />`}
          language="typescript"
        />
      </section>

      {/* ── 6. In Context ─── */}
      <section className="sectionheader-page__section" id="in-context">
        <h2 className="sectionheader-page__section-title"><a href="#in-context">In Context</a></h2>
        <p className="sectionheader-page__section-desc">
          SectionHeader pairs naturally with cards and content blocks to create structured page layouts.
        </p>
        <div className="sectionheader-page__preview" style={{ gap: '1.5rem' }}>
          <SHComponent title="Analytics" description="Real-time performance metrics" action={<Button variant="ghost" size="sm">Refresh</Button>} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%' }}>
            <Card variant="default" padding="md"><div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Card 1</div></Card>
            <Card variant="default" padding="md"><div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Card 2</div></Card>
            <Card variant="default" padding="md"><div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Card 3</div></Card>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ─── */}
      <section className="sectionheader-page__section" id="tiers">
        <h2 className="sectionheader-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="sectionheader-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface.
        </p>

        <div className="sectionheader-page__tiers">
          {/* Lite */}
          <div
            className={`sectionheader-page__tier-card${tier === 'lite' ? ' sectionheader-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="sectionheader-page__tier-header">
              <span className="sectionheader-page__tier-name">Lite</span>
              <span className="sectionheader-page__tier-size">~0.3 KB</span>
            </div>
            <p className="sectionheader-page__tier-desc">CSS-only variant. Zero JavaScript beyond forwardRef wrapper. No motion, no style engine.</p>
            <div className="sectionheader-page__tier-import">import {'{'} SectionHeader {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="sectionheader-page__size-breakdown">
              <div className="sectionheader-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`sectionheader-page__tier-card${tier === 'standard' ? ' sectionheader-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="sectionheader-page__tier-header">
              <span className="sectionheader-page__tier-name">Standard</span>
              <span className="sectionheader-page__tier-size">~1.1 KB</span>
            </div>
            <p className="sectionheader-page__tier-desc">Full-featured with useStyles, scoped CSS, forced colors support, and print media query.</p>
            <div className="sectionheader-page__tier-import">import {'{'} SectionHeader {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="sectionheader-page__size-breakdown">
              <div className="sectionheader-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`sectionheader-page__tier-card${tier === 'premium' ? ' sectionheader-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="sectionheader-page__tier-header">
              <span className="sectionheader-page__tier-name">Premium</span>
              <span className="sectionheader-page__tier-size">~1.2 KB</span>
            </div>
            <p className="sectionheader-page__tier-desc">Everything in Standard plus entrance animation, aurora glow border, and shimmer effect.</p>
            <div className="sectionheader-page__tier-import">import {'{'} SectionHeader {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="sectionheader-page__size-breakdown">
              <div className="sectionheader-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─── */}
      <section className="sectionheader-page__section" id="brand-color">
        <h2 className="sectionheader-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="sectionheader-page__section-desc">
          Pick a brand color to see the section header update in real-time. The theme generates derived colors automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="sectionheader-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`sectionheader-page__color-preset${brandColor === p.hex ? ' sectionheader-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ─── */}
      <section className="sectionheader-page__section" id="props">
        <h2 className="sectionheader-page__section-title"><a href="#props">Props API</a></h2>
        <p className="sectionheader-page__section-desc">
          All props accepted by SectionHeader. It also spreads native {'<header>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sectionHeaderProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─── */}
      <section className="sectionheader-page__section" id="accessibility">
        <h2 className="sectionheader-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="sectionheader-page__section-desc">
          Built on semantic {'<header>'} and {'<h2>'} elements for proper document structure.
        </p>
        <Card variant="default" padding="md">
          <ul className="sectionheader-page__a11y-list">
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Semantic HTML:</strong> Uses <code className="sectionheader-page__a11y-key">{'<header>'}</code> with <code className="sectionheader-page__a11y-key">{'<h2>'}</code> for proper heading hierarchy.</span>
            </li>
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Text wrapping:</strong> Title uses <code className="sectionheader-page__a11y-key">text-wrap: balance</code> for optimal line breaks.</span>
            </li>
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Contrast:</strong> Title and description meet WCAG AA contrast ratio (4.5:1).</span>
            </li>
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="sectionheader-page__a11y-key">forced-colors: active</code> with visible border colors.</span>
            </li>
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Print:</strong> Action slot hidden in print view to avoid non-functional UI.</span>
            </li>
            <li className="sectionheader-page__a11y-item">
              <span className="sectionheader-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Fluid sizing:</strong> Font sizes use <code className="sectionheader-page__a11y-key">clamp()</code> for comfortable reading at all viewport widths.</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ─── */}
      <section className="sectionheader-page__section" id="source">
        <h2 className="sectionheader-page__section-title"><a href="#source">Source</a></h2>
        <p className="sectionheader-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="sectionheader-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/section-header.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/section-header.tsx (Standard)
          </a>
          <a className="sectionheader-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/section-header.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/section-header.tsx (Lite)
          </a>
          <a className="sectionheader-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/section-header.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/section-header.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
