'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SearchInput } from '@ui/components/search-input'
import { SearchInput as LiteSearchInput } from '@ui/lite/search-input'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.search-input-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: search-input-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .search-input-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .search-input-page__hero::before {
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
        .search-input-page__hero::before { animation: none; }
      }

      .search-input-page__title {
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

      .search-input-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .search-input-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .search-input-page__import-code {
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

      .search-input-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .search-input-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .search-input-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .search-input-page__section-title {
        font-size: 1.125rem; font-weight: 700; color: var(--text-primary);
        margin: 0 0 0.375rem; padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3; scroll-margin-block-start: 2rem;
      }
      .search-input-page__section-title a { color: inherit; text-decoration: none; }
      .search-input-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .search-input-page__section-desc {
        color: var(--text-secondary); font-size: var(--text-sm, 0.875rem);
        line-height: 1.6; margin: 0 0 1.5rem; text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .search-input-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .search-input-page__preview::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }

      .search-input-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .search-input-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .search-input-page__playground { grid-template-columns: 1fr; }
        .search-input-page__playground-controls { position: static !important; }
      }

      @container search-input-page (max-width: 680px) {
        .search-input-page__playground { grid-template-columns: 1fr; }
        .search-input-page__playground-controls { position: static !important; }
      }

      .search-input-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .search-input-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .search-input-page__playground-result::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }

      .search-input-page__playground-result::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .search-input-page__playground-controls {
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

      .search-input-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .search-input-page__control-label {
        font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .search-input-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .search-input-page__option-btn {
        font-size: var(--text-xs, 0.75rem); padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-secondary); cursor: pointer;
        font-family: inherit; font-weight: 500; transition: all 0.12s; line-height: 1.4;
      }
      .search-input-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .search-input-page__option-btn--active {
        background: var(--brand); color: oklch(100% 0 0); border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .search-input-page__toggle-label {
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary);
        cursor: pointer; display: flex; align-items: center; gap: 0.375rem;
      }

      .search-input-page__text-input {
        font-size: var(--text-sm, 0.875rem); padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-primary); font-family: inherit; inline-size: 100%;
      }
      .search-input-page__text-input:focus {
        outline: 2px solid var(--brand); outline-offset: 1px;
        border-color: transparent; box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled items ─────────────────────────────── */
      .search-input-page__item-label {
        font-size: 0.6875rem; color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase; letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .search-input-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .search-input-page__state-cell {
        display: flex; flex-direction: column; gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
        background: var(--bg-base); transition: border-color 0.2s, box-shadow 0.2s;
      }
      .search-input-page__state-cell:hover { border-color: var(--border-default); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05); }

      .search-input-page__state-label {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary);
        font-weight: 500; text-align: center;
      }

      .search-input-page__state-hint {
        font-size: 0.625rem; color: var(--text-tertiary); font-style: italic; text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .search-input-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .search-input-page__tier-card {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.5rem; display: flex;
        flex-direction: column; gap: 0.75rem; cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0; overflow: hidden;
      }
      .search-input-page__tier-card:hover {
        border-color: var(--border-strong); transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .search-input-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .search-input-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .search-input-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .search-input-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .search-input-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
      .search-input-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }
      .search-input-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle);
        padding: 0.375rem 0.5rem; border-radius: var(--radius-sm);
        overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4;
      }
      .search-input-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .search-input-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .search-input-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */
      .search-input-page__code-tabs { margin-block-start: 1rem; }
      .search-input-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .search-input-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── Color picker ──────────────────────────────── */
      .search-input-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .search-input-page__color-preset {
        inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent;
        cursor: pointer; padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .search-input-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .search-input-page__color-preset--active {
        border-color: oklch(100% 0 0); transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */
      .search-input-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .search-input-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .search-input-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .search-input-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle); color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */
      @media (max-width: 768px) {
        .search-input-page__hero { padding: 2rem 1.25rem; }
        .search-input-page__title { font-size: 1.75rem; }
        .search-input-page__preview { padding: 1.75rem; }
        .search-input-page__playground { grid-template-columns: 1fr; }
        .search-input-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .search-input-page__states-grid { grid-template-columns: 1fr; }
        .search-input-page__tiers { grid-template-columns: 1fr; }
        .search-input-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .search-input-page__hero { padding: 1.5rem 1rem; }
        .search-input-page__title { font-size: 1.5rem; }
        .search-input-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .search-input-page__title { font-size: 4rem; }
        .search-input-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */
      .search-input-page__import-code, .search-input-page code, pre {
        overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%;
      }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const searchInputPropDefs: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled search value.' },
  { name: 'defaultValue', type: 'string', description: 'Initial value for uncontrolled mode.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Debounced callback when the value changes.' },
  { name: 'onSearch', type: '(value: string) => void', description: 'Called on Enter key press with the current value.' },
  { name: 'onClear', type: '() => void', description: 'Called when the clear button is clicked.' },
  { name: 'debounce', type: 'number', default: '300', description: 'Debounce delay in ms for the onChange callback.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinning loader icon instead of the search icon.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls input height, padding, and font-size.' },
  { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a clear button when the input has a value.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for the spinner rotation.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and hides the clear button.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text shown when the input is empty.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with the component root.' },
  { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'Forwarded ref to the underlying <input> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SearchInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SearchInput } from '@annondeveloper/ui-kit'",
  premium: "import { SearchInput } from '@annondeveloper/ui-kit/premium'",
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" className="search-input-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="search-input-page__control-group">
      <span className="search-input-page__control-label">{label}</span>
      <div className="search-input-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`search-input-page__option-btn${opt === value ? ' search-input-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="search-input-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, placeholder: string, loading: boolean, clearable: boolean, disabled: boolean, debounce: number): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md' && tier !== 'lite') props.push(`  size="${size}"`)
  if (loading && tier !== 'lite') props.push('  loading')
  if (!clearable && tier !== 'lite') props.push('  clearable={false}')
  if (disabled) props.push('  disabled')
  if (debounce !== 300 && tier !== 'lite') props.push(`  debounce={${debounce}}`)

  if (tier !== 'lite') {
    props.push('  onChange={(val) => console.log(val)}')
    props.push('  onSearch={(val) => console.log("Search:", val)}')
    props.push('  onClear={() => console.log("Cleared")}')
  }

  const jsx = props.length === 0
    ? '<SearchInput />'
    : `<SearchInput\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size, placeholder: string): string {
  const className = tier === 'lite' ? 'ui-lite-search-input' : 'ui-search-input'
  return `<!-- SearchInput -- @annondeveloper/ui-kit ${tier} tier -->
<div class="${className}" data-size="${size}">
  <span class="${className}__icon" aria-hidden="true">
    <!-- Search icon SVG -->
  </span>
  <input type="search" ${placeholder ? `placeholder="${placeholder}"` : ''} />
</div>`
}

function generateVueCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-search-input" data-size="${size}">
    <span class="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
    <input type="search" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? 'disabled' : ''} />
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <SearchInput
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${size !== 'md' ? `size="${size}"` : ''}
    ${disabled ? 'disabled' : ''}
    @change="onSearch"
    @search="onSubmit"
    @clear="onClear"
  />
</template>

<script setup>
import { SearchInput } from '@annondeveloper/ui-kit'

const onSearch = (val) => console.log(val)
const onSubmit = (val) => console.log('Search:', val)
const onClear = () => console.log('Cleared')
</script>`
}

function generateAngularCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier -->
<div class="ui-lite-search-input" data-size="${size}">
  <span class="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
  <input type="search" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? '[disabled]="true"' : ''} />
</div>

@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular -- Standard tier -->
<div class="ui-search-input" data-size="${size}">
  <span class="ui-search-input__icon" aria-hidden="true">
    <!-- Search icon SVG -->
  </span>
  <input type="search" class="ui-search-input__field" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? '[disabled]="true"' : ''} />
</div>

@import '@annondeveloper/ui-kit/css/components/search-input.css';`
}

function generateSvelteCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier -->
<div class="ui-lite-search-input" data-size="${size}">
  <span class="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
  <input type="search" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? 'disabled' : ''} />
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { SearchInput } from '@annondeveloper/ui-kit';
</script>

<SearchInput
  ${placeholder ? `placeholder="${placeholder}"` : ''}
  ${size !== 'md' ? `size="${size}"` : ''}
  ${disabled ? 'disabled' : ''}
  on:change={(e) => console.log(e.detail)}
  on:search={(e) => console.log('Search:', e.detail)}
  on:clear={() => console.log('Cleared')}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [placeholder, setPlaceholder] = useState('Search...')
  const [loading, setLoading] = useState(false)
  const [clearable, setClearable] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [debounce, setDebounce] = useState(300)
  const [searchValue, setSearchValue] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, size, placeholder, loading, clearable, disabled, debounce),
    [tier, size, placeholder, loading, clearable, disabled, debounce],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, placeholder), [tier, size, placeholder])
  const vueCode = useMemo(() => generateVueCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])

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
    <section className="search-input-page__section" id="playground">
      <h2 className="search-input-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="search-input-page__section-desc">
        Tweak every prop and see the result in real-time. Type to see the debounced onChange, press Enter for onSearch.
      </p>

      <div className="search-input-page__playground">
        <div className="search-input-page__playground-preview">
          <div className="search-input-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '400px' }}>
              {tier === 'lite' ? (
                <LiteSearchInput
                  placeholder={placeholder}
                  size={size as 'sm' | 'md' | 'lg'}
                  disabled={disabled}
                />
              ) : (
                <SearchInput
                  value={searchValue}
                  onChange={setSearchValue}
                  onSearch={(val) => console.log('Search:', val)}
                  onClear={() => setSearchValue('')}
                  placeholder={placeholder}
                  size={size}
                  loading={loading}
                  clearable={clearable}
                  disabled={disabled}
                  debounce={debounce}
                />
              )}
            </div>
          </div>

          <div className="search-input-page__code-tabs">
            <div className="search-input-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="search-input-page__export-status">{copyStatus}</span>}
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

        <div className="search-input-page__playground-controls">
          <OptionGroup label="Size" options={tier === 'lite' ? (['sm', 'md', 'lg'] as const) : SIZES} value={size} onChange={setSize as (v: string) => void} />

          {tier !== 'lite' && (
            <div className="search-input-page__control-group">
              <span className="search-input-page__control-label">Debounce (ms)</span>
              <div className="search-input-page__control-options">
                {[0, 150, 300, 500, 1000].map(n => (
                  <button key={n} type="button"
                    className={`search-input-page__option-btn${debounce === n ? ' search-input-page__option-btn--active' : ''}`}
                    onClick={() => setDebounce(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="search-input-page__control-group">
            <span className="search-input-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
              {tier !== 'lite' && <Toggle label="Clearable" checked={clearable} onChange={setClearable} />}
            </div>
          </div>

          <div className="search-input-page__control-group">
            <span className="search-input-page__control-label">Placeholder</span>
            <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="search-input-page__text-input" placeholder="Placeholder..." />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchInputPage() {
  useStyles('search-input-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]; const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.search-input-page__section')
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
    <div className="search-input-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="search-input-page__hero">
        <h1 className="search-input-page__title">SearchInput</h1>
        <p className="search-input-page__desc">
          Debounced search field with loading spinner, clear button, and Enter-to-search support.
          Ships in two tiers: lite with minimal markup and standard with full debounce and clear logic.
        </p>
        <div className="search-input-page__import-row">
          <code className="search-input-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="search-input-page__section" id="sizes">
        <h2 className="search-input-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="search-input-page__section-desc">
          {tier === 'lite' ? 'Three sizes (sm, md, lg)' : 'Five sizes from xs to xl'}. Sizes control input height, padding, and font-size.
        </p>
        <div className="search-input-page__preview search-input-page__preview--col" style={{ gap: '1rem', maxInlineSize: '400px', marginInline: 'auto' }}>
          {(tier === 'lite' ? ['sm', 'md', 'lg'] as Size[] : SIZES).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="search-input-page__item-label" style={{ minInlineSize: '2rem' }}>{s}</span>
              <div style={{ flex: 1 }}>
                {tier === 'lite' ? (
                  <LiteSearchInput placeholder={`Size ${s}`} size={s as 'sm' | 'md' | 'lg'} />
                ) : (
                  <SearchInput placeholder={`Size ${s}`} size={s} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Loading State ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="search-input-page__section" id="loading">
          <h2 className="search-input-page__section-title"><a href="#loading">Loading State</a></h2>
          <p className="search-input-page__section-desc">
            When <code>loading</code> is true, the search icon is replaced with an animated spinner.
            This is useful for showing async search-in-progress feedback.
          </p>
          <div className="search-input-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '400px' }}>
              <SearchInput placeholder="Searching..." loading defaultValue="react components" />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<SearchInput\n  placeholder="Searching..."\n  loading\n  defaultValue="react components"\n/>`} language="typescript" />
          </div>
        </section>
      )}

      {/* ── 5. Debounce ────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="search-input-page__section" id="debounce">
          <h2 className="search-input-page__section-title"><a href="#debounce">Debounced onChange</a></h2>
          <p className="search-input-page__section-desc">
            The <code>onChange</code> callback is debounced by default at 300ms. Adjust with the <code>debounce</code> prop.
            Set to 0 for immediate calls. Press Enter to trigger <code>onSearch</code> immediately, bypassing debounce.
          </p>
          <div className="search-input-page__preview search-input-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '400px', marginInline: 'auto' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>debounce=0 (instant)</p>
              <SearchInput placeholder="Instant search..." debounce={0} onChange={(val) => console.log('Instant:', val)} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>debounce=500</p>
              <SearchInput placeholder="500ms debounce..." debounce={500} onChange={(val) => console.log('Debounced:', val)} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>debounce=1000</p>
              <SearchInput placeholder="1s debounce..." debounce={1000} onChange={(val) => console.log('Slow:', val)} />
            </div>
          </div>
        </section>
      )}

      {/* ── 6. States ──────────────────────────────────── */}
      <section className="search-input-page__section" id="states">
        <h2 className="search-input-page__section-title"><a href="#states">States</a></h2>
        <p className="search-input-page__section-desc">
          SearchInput handles all interaction states with clear visual feedback.
        </p>
        <div className="search-input-page__states-grid">
          <div className="search-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteSearchInput placeholder="Search..." />
            ) : (
              <SearchInput placeholder="Search..." />
            )}
            <span className="search-input-page__state-label">Default</span>
          </div>
          <div className="search-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteSearchInput placeholder="Click to focus..." />
            ) : (
              <SearchInput placeholder="Click to focus..." />
            )}
            <span className="search-input-page__state-label">Focus (click)</span>
          </div>
          {tier !== 'lite' && (
            <div className="search-input-page__state-cell">
              <SearchInput defaultValue="react hooks" placeholder="With value..." />
              <span className="search-input-page__state-label">With Value</span>
              <span className="search-input-page__state-hint">shows clear button</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="search-input-page__state-cell">
              <SearchInput loading placeholder="Fetching..." defaultValue="loading" />
              <span className="search-input-page__state-label">Loading</span>
            </div>
          )}
          <div className="search-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteSearchInput placeholder="Disabled" disabled />
            ) : (
              <SearchInput placeholder="Disabled" disabled />
            )}
            <span className="search-input-page__state-label">Disabled</span>
          </div>
          {tier !== 'lite' && (
            <div className="search-input-page__state-cell">
              <SearchInput placeholder="No clear btn..." clearable={false} defaultValue="no clear" />
              <span className="search-input-page__state-label">Not Clearable</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="search-input-page__section" id="tiers">
        <h2 className="search-input-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="search-input-page__section-desc">
          Lite provides a minimal search input with icon. Standard adds debounce, loading, clear button, and controlled/uncontrolled modes.
        </p>

        <div className="search-input-page__tiers">
          {/* Lite */}
          <div className={`search-input-page__tier-card${tier === 'lite' ? ' search-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="search-input-page__tier-header">
              <span className="search-input-page__tier-name">Lite</span>
              <span className="search-input-page__tier-size">~0.2 KB</span>
            </div>
            <p className="search-input-page__tier-desc">Minimal search input with icon. No debounce, no clear button, no loading state.</p>
            <div className="search-input-page__tier-import">import {'{'} SearchInput {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="search-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <LiteSearchInput placeholder="Lite search..." />
              </div>
            </div>
            <div className="search-input-page__size-breakdown">
              <div className="search-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div className={`search-input-page__tier-card${tier === 'standard' ? ' search-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="search-input-page__tier-header">
              <span className="search-input-page__tier-name">Standard</span>
              <span className="search-input-page__tier-size">~1.5 KB</span>
            </div>
            <p className="search-input-page__tier-desc">Full-featured with debounce, loading spinner, clear button, Enter-to-search, and 5 size variants.</p>
            <div className="search-input-page__tier-import">import {'{'} SearchInput {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="search-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <SearchInput placeholder="Standard search..." />
              </div>
            </div>
            <div className="search-input-page__size-breakdown">
              <div className="search-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className={`search-input-page__tier-card${tier === 'premium' ? ' search-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="search-input-page__tier-header">
              <span className="search-input-page__tier-name">Premium</span>
              <span className="search-input-page__tier-size">~3-5 KB</span>
            </div>
            <p className="search-input-page__tier-desc">Aurora glow focus ring, spring-bounce clear button, and shimmer loading state.</p>
            <div className="search-input-page__tier-import">import {'{'} SearchInput {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="search-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <SearchInput placeholder="Premium search..." />
              </div>
            </div>
            <div className="search-input-page__size-breakdown">
              <div className="search-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Controlled vs Uncontrolled ──────────────── */}
      {tier !== 'lite' && (
        <section className="search-input-page__section" id="controlled">
          <h2 className="search-input-page__section-title">
            <a href="#controlled">Controlled vs Uncontrolled</a>
          </h2>
          <p className="search-input-page__section-desc">
            SearchInput supports both controlled (pass <code>value</code>) and uncontrolled (pass <code>defaultValue</code>) modes.
            In controlled mode, you manage the state. In uncontrolled mode, the component manages its own internal state.
          </p>
          <div className="search-input-page__preview search-input-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '400px', marginInline: 'auto' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>
                Controlled (value + onChange)
              </p>
              <SearchInput
                value=""
                onChange={(val) => console.log('Controlled:', val)}
                placeholder="Controlled input..."
              />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>
                Uncontrolled (defaultValue)
              </p>
              <SearchInput
                defaultValue="initial value"
                onChange={(val) => console.log('Uncontrolled:', val)}
                placeholder="Uncontrolled input..."
              />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Controlled\nconst [query, setQuery] = useState('')\n<SearchInput value={query} onChange={setQuery} />\n\n// Uncontrolled\n<SearchInput defaultValue="initial" onChange={console.log} />`}
              language="typescript"
              showLineNumbers
            />
          </div>
        </section>
      )}

      {/* ── 9. Keyboard Interactions ──────────────────── */}
      <section className="search-input-page__section" id="keyboard">
        <h2 className="search-input-page__section-title">
          <a href="#keyboard">Keyboard Interactions</a>
        </h2>
        <p className="search-input-page__section-desc">
          SearchInput responds to keyboard events for efficient search workflows.
        </p>
        <div className="search-input-page__preview search-input-page__preview--col" style={{ gap: '1.25rem', maxInlineSize: '480px', marginInline: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="search-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Enter</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Triggers <code>onSearch</code> immediately, bypassing debounce
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="search-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Escape</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Native browser behavior -- clears the search input on some browsers
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="search-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Tab</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Moves focus to the next focusable element
              </span>
            </div>
          </div>
          <div style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <LiteSearchInput placeholder="Type and press Enter..." />
            ) : (
              <SearchInput
                placeholder="Type and press Enter..."
                onSearch={(val) => console.log('Searched:', val)}
              />
            )}
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<SearchInput\n  placeholder="Type and press Enter..."\n  onSearch={(value) => {\n    // Fires immediately on Enter, no debounce\n    fetchResults(value)\n  }}\n  onChange={(value) => {\n    // Fires after debounce delay\n    updateSuggestions(value)\n  }}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 10. Brand Color ─────────────────────────────── */}
      <section className="search-input-page__section" id="brand-color">
        <h2 className="search-input-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="search-input-page__section-desc">
          Pick a brand color to see the search input focus glow update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
          <div className="search-input-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button key={p.hex} type="button"
                className={`search-input-page__color-preset${brandColor === p.hex ? ' search-input-page__color-preset--active' : ''}`}
                style={{ background: p.hex }} onClick={() => setBrandColor(p.hex)} title={p.name} aria-label={`Set brand color to ${p.name}`} />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 9. Props API ──────────────────────────────── */}
      <section className="search-input-page__section" id="props">
        <h2 className="search-input-page__section-title"><a href="#props">Props API</a></h2>
        <p className="search-input-page__section-desc">
          All props accepted by SearchInput. It also spreads native input HTML attributes onto the underlying {'<input>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={searchInputPropDefs} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="search-input-page__section" id="accessibility">
        <h2 className="search-input-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="search-input-page__section-desc">
          Built on the native {'<input type="search">'} element with comprehensive
          semantic markup and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="search-input-page__a11y-list">
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic type:</strong> Uses <code className="search-input-page__a11y-key">type="search"</code> which enables native browser search features and mobile keyboard.
              </span>
            </li>
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Clear button:</strong> The clear button has <code className="search-input-page__a11y-key">aria-label="Clear search"</code> for screen reader users.
              </span>
            </li>
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative icons:</strong> Search and spinner icons are marked <code className="search-input-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="search-input-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="search-input-page__a11y-item">
              <span className="search-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="search-input-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
