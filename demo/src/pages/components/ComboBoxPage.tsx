'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Combobox, type ComboboxOption } from '@ui/components/combobox'
import { Combobox as LiteCombobox } from '@ui/lite/combobox'
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
    @scope (.combobox-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: combobox-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .combobox-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .combobox-page__hero::before {
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
        .combobox-page__hero::before { animation: none; }
      }

      .combobox-page__title {
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

      .combobox-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .combobox-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .combobox-page__import-code {
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

      .combobox-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .combobox-page__section {
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
        .combobox-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .combobox-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .combobox-page__section-title a { color: inherit; text-decoration: none; }
      .combobox-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .combobox-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .combobox-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .combobox-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .combobox-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .combobox-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .combobox-page__playground { grid-template-columns: 1fr; }
        .combobox-page__playground-controls { position: static !important; }
      }

      @container combobox-page (max-width: 680px) {
        .combobox-page__playground { grid-template-columns: 1fr; }
        .combobox-page__playground-controls { position: static !important; }
      }

      .combobox-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .combobox-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .combobox-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .combobox-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .combobox-page__playground-controls {
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

      .combobox-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .combobox-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .combobox-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .combobox-page__option-btn {
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
      .combobox-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .combobox-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .combobox-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .combobox-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .combobox-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .combobox-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .combobox-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .combobox-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .combobox-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .combobox-page__state-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .combobox-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .combobox-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .combobox-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .combobox-page__tier-card {
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
      .combobox-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .combobox-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .combobox-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .combobox-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .combobox-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .combobox-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
      .combobox-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }
      .combobox-page__tier-import {
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
      .combobox-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }

      .combobox-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .combobox-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */

      .combobox-page__code-tabs { margin-block-start: 1rem; }
      .combobox-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .combobox-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── Color picker ──────────────────────────────── */

      .combobox-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .combobox-page__color-preset {
        inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent;
        cursor: pointer; padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .combobox-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .combobox-page__color-preset--active {
        border-color: oklch(100% 0 0); transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .combobox-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .combobox-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .combobox-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .combobox-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .combobox-page__hero { padding: 2rem 1.25rem; }
        .combobox-page__title { font-size: 1.75rem; }
        .combobox-page__preview { padding: 1.75rem; }
        .combobox-page__playground { grid-template-columns: 1fr; }
        .combobox-page__playground-result { padding: 2rem; min-block-size: 300px; }
        .combobox-page__states-grid { grid-template-columns: 1fr; }
        .combobox-page__tiers { grid-template-columns: 1fr; }
        .combobox-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .combobox-page__hero { padding: 1.5rem 1rem; }
        .combobox-page__title { font-size: 1.5rem; }
        .combobox-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .combobox-page__title { font-size: 4rem; }
        .combobox-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .combobox-page__import-code, .combobox-page code, pre {
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

const comboboxPropDefs: PropDef[] = [
  { name: 'name', type: 'string', description: 'Field name for form context integration and hidden input submission.' },
  { name: 'options', type: 'ComboboxOption[]', description: 'Array of options with value, label, optional icon, group, and description.' },
  { name: 'value', type: 'string', description: 'Controlled selected value.' },
  { name: 'defaultValue', type: 'string', description: 'Initial value for uncontrolled mode.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called when a selection is made.' },
  { name: 'onSearch', type: '(query: string) => void', description: 'Called on input change for external/async filtering.' },
  { name: 'placeholder', type: 'string', default: "'Search...'", description: 'Placeholder text in the search input.' },
  { name: 'label', type: 'ReactNode', description: 'Label text rendered above the combobox.' },
  { name: 'error', type: 'string', description: 'Error message with role="alert" for screen readers.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls input size, padding, and font-size.' },
  { name: 'allowCreate', type: 'boolean', default: 'false', description: 'Allow creating new options by typing.' },
  { name: 'onCreate', type: '(value: string) => void', description: 'Called when user creates a new option.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading spinner inside the dropdown.' },
  { name: 'emptyMessage', type: 'string', default: "'No results found'", description: 'Message when no options match the search.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for dropdown and error animations.' },
]

// ─── Sample Data ─────────────────────────────────────────────────────────────

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
  { value: 'vue', label: 'Vue', description: 'The progressive JavaScript framework' },
  { value: 'angular', label: 'Angular', description: 'Platform for building mobile and desktop apps' },
  { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
  { value: 'solid', label: 'SolidJS', description: 'Simple and performant reactivity' },
  { value: 'preact', label: 'Preact', description: 'Fast 3kB alternative to React' },
]

const COUNTRY_OPTIONS: ComboboxOption[] = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'br', label: 'Brazil', group: 'Americas' },
  { value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
  { value: 'au', label: 'Australia', group: 'Oceania' },
]

const LITE_OPTIONS = FRAMEWORK_OPTIONS.map(o => ({ value: o.value, label: o.label }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Combobox } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Combobox } from '@annondeveloper/ui-kit'",
  premium: "import { Combobox } from '@annondeveloper/ui-kit'",
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
    <Button
      size="sm"
      variant="secondary"
      className="combobox-page__copy-btn"
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
  label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="combobox-page__control-group">
      <span className="combobox-page__control-label">{label}</span>
      <div className="combobox-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`combobox-page__option-btn${opt === value ? ' combobox-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="combobox-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, label: string, placeholder: string, error: string, disabled: boolean, allowCreate: boolean, loading: boolean): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = ['  name="framework"', '  options={frameworks}']
  if (label) props.push(`  label="${label}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (placeholder !== 'Search...') props.push(`  placeholder="${placeholder}"`)
  if (error) props.push(`  error="${error}"`)
  if (disabled) props.push('  disabled')
  if (allowCreate && tier !== 'lite') props.push('  allowCreate')
  if (loading && tier !== 'lite') props.push('  loading')

  const optionsCode = `const frameworks = [\n  { value: 'react', label: 'React' },\n  { value: 'vue', label: 'Vue' },\n  { value: 'angular', label: 'Angular' },\n]`

  return `${importStr}\n\n${optionsCode}\n\n<Combobox\n${props.join('\n')}\n  onChange={(val) => console.log(val)}\n/>`
}

function generateHtmlCode(tier: Tier, label: string): string {
  const className = tier === 'lite' ? 'ui-lite-select' : 'ui-combobox'
  return `<!-- Combobox -- @annondeveloper/ui-kit ${tier} tier -->
${tier === 'lite' ? `<div class="${className}">
  ${label ? `<label for="framework">${label}</label>` : ''}
  <select id="framework" name="framework">
    <option value="react">React</option>
    <option value="vue">Vue</option>
    <option value="angular">Angular</option>
  </select>
</div>` : `<!-- Standard tier uses JS component for search/filter -->
<div class="${className}">
  ${label ? `<label>${label}</label>` : ''}
  <!-- Input with combobox role + listbox dropdown -->
  <input type="text" role="combobox" aria-expanded="false" aria-haspopup="listbox" />
</div>`}`
}

function generateVueCode(tier: Tier, size: Size, label: string, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-select">
    ${label ? `<label for="framework">${label}</label>` : ''}
    <select id="framework" name="framework" ${disabled ? 'disabled' : ''}>
      <option value="react">React</option>
      <option value="vue">Vue</option>
    </select>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <Combobox
    name="framework"
    :options="frameworks"
    ${label ? `label="${label}"` : ''}
    ${size !== 'md' ? `size="${size}"` : ''}
    ${placeholder !== 'Search...' ? `placeholder="${placeholder}"` : ''}
    ${disabled ? 'disabled' : ''}
    @change="onSelect"
  />
</template>

<script setup>
import { Combobox } from '@annondeveloper/ui-kit'

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
]
const onSelect = (val) => console.log(val)
</script>`
}

function generateAngularCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (native select) -->
<div class="ui-lite-select">
  ${label ? `<label for="framework">${label}</label>` : ''}
  <select id="framework" name="framework" ${disabled ? '[disabled]="true"' : ''}>
    <option value="react">React</option>
    <option value="vue">Vue</option>
  </select>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular -- Standard tier -->
<div class="ui-combobox" data-size="${size}">
  ${label ? `<label>${label}</label>` : ''}
  <input type="text" role="combobox" ${disabled ? '[disabled]="true"' : ''} />
</div>

@import '@annondeveloper/ui-kit/css/components/combobox.css';`
}

function generateSvelteCode(tier: Tier, size: Size, label: string, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier -->
<div class="ui-lite-select">
  ${label ? `<label for="framework">${label}</label>` : ''}
  <select id="framework" name="framework" ${disabled ? 'disabled' : ''}>
    <option value="react">React</option>
    <option value="vue">Vue</option>
  </select>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { Combobox } from '@annondeveloper/ui-kit';

  const frameworks = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
  ];
</script>

<Combobox
  name="framework"
  options={frameworks}
  ${label ? `label="${label}"` : ''}
  ${size !== 'md' ? `size="${size}"` : ''}
  ${placeholder !== 'Search...' ? `placeholder="${placeholder}"` : ''}
  ${disabled ? 'disabled' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [label, setLabel] = useState('Framework')
  const [placeholder, setPlaceholder] = useState('Search...')
  const [error, setError] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [allowCreate, setAllowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, size, label, placeholder, error, disabled, allowCreate, loading),
    [tier, size, label, placeholder, error, disabled, allowCreate, loading],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, label), [tier, label])
  const vueCode = useMemo(() => generateVueCode(tier, size, label, placeholder, disabled), [tier, size, label, placeholder, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, label, disabled), [tier, size, label, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, label, placeholder, disabled), [tier, size, label, placeholder, disabled])

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
    <section className="combobox-page__section" id="playground">
      <h2 className="combobox-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="combobox-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="combobox-page__playground">
        <div className="combobox-page__playground-preview">
          <div className="combobox-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '360px', position: 'relative', zIndex: 1 }}>
              {tier === 'lite' ? (
                <LiteCombobox
                  name="playground-combobox"
                  options={LITE_OPTIONS}
                  label={label || undefined}
                  placeholder={placeholder}
                  disabled={disabled}
                  error={error || undefined}
                />
              ) : (
                <Combobox
                  name="playground-combobox"
                  options={FRAMEWORK_OPTIONS}
                  value={selectedValue}
                  onChange={setSelectedValue}
                  label={label || undefined}
                  placeholder={placeholder}
                  size={size}
                  error={error || undefined}
                  disabled={disabled}
                  allowCreate={allowCreate}
                  loading={loading}
                />
              )}
            </div>
          </div>

          <div className="combobox-page__code-tabs">
            <div className="combobox-page__export-row">
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
              {copyStatus && <span className="combobox-page__export-status">{copyStatus}</span>}
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

        <div className="combobox-page__playground-controls">
          {tier !== 'lite' && <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />}

          <div className="combobox-page__control-group">
            <span className="combobox-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Allow create" checked={allowCreate} onChange={setAllowCreate} />}
              {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
            </div>
          </div>

          <div className="combobox-page__control-group">
            <span className="combobox-page__control-label">Label</span>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="combobox-page__text-input" placeholder="Label text..." />
          </div>

          <div className="combobox-page__control-group">
            <span className="combobox-page__control-label">Placeholder</span>
            <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="combobox-page__text-input" placeholder="Placeholder..." />
          </div>

          <div className="combobox-page__control-group">
            <span className="combobox-page__control-label">Error</span>
            <input type="text" value={error} onChange={e => setError(e.target.value)} className="combobox-page__text-input" placeholder="Error message..." />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComboBoxPage() {
  useStyles('combobox-page', pageStyles)

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
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.combobox-page__section')
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
    <div className="combobox-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="combobox-page__hero">
        <h1 className="combobox-page__title">ComboBox</h1>
        <p className="combobox-page__desc">
          Searchable dropdown with keyboard navigation, option groups, match highlighting, and create-new support.
          Ships in two tiers: lite (native select fallback) and standard with full search and filter.
        </p>
        <div className="combobox-page__import-row">
          <code className="combobox-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="combobox-page__section" id="sizes">
          <h2 className="combobox-page__section-title">
            <a href="#sizes">Size Scale</a>
          </h2>
          <p className="combobox-page__section-desc">
            Three sizes for different density requirements. Sizes control the input height, padding, and font-size.
          </p>
          <div className="combobox-page__preview combobox-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '400px', marginInline: 'auto' }}>
            {SIZES.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="combobox-page__item-label" style={{ minInlineSize: '2rem' }}>{s}</span>
                <div style={{ flex: 1 }}>
                  <Combobox name={`size-${s}`} options={FRAMEWORK_OPTIONS} placeholder={`Size ${s}`} size={s} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Grouped Options ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="combobox-page__section" id="groups">
          <h2 className="combobox-page__section-title">
            <a href="#groups">Grouped Options</a>
          </h2>
          <p className="combobox-page__section-desc">
            Options with a <code>group</code> property are automatically organized under group headers.
            Groups appear in the order they are first encountered.
          </p>
          <div className="combobox-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '360px' }}>
              <Combobox
                name="grouped"
                options={COUNTRY_OPTIONS}
                label="Country"
                placeholder="Search countries..."
              />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`const countries = [\n  { value: 'us', label: 'United States', group: 'Americas' },\n  { value: 'gb', label: 'United Kingdom', group: 'Europe' },\n  { value: 'jp', label: 'Japan', group: 'Asia' },\n]\n\n<Combobox name="country" options={countries} label="Country" />`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 5. Option Descriptions ─────────────────────── */}
      {tier !== 'lite' && (
        <section className="combobox-page__section" id="descriptions">
          <h2 className="combobox-page__section-title">
            <a href="#descriptions">Option Descriptions</a>
          </h2>
          <p className="combobox-page__section-desc">
            Options can include a <code>description</code> field that renders as secondary text below the label.
          </p>
          <div className="combobox-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '360px' }}>
              <Combobox
                name="described"
                options={FRAMEWORK_OPTIONS}
                label="Framework"
                placeholder="Pick a framework..."
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Create New ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="combobox-page__section" id="create">
          <h2 className="combobox-page__section-title">
            <a href="#create">Allow Create</a>
          </h2>
          <p className="combobox-page__section-desc">
            When <code>allowCreate</code> is enabled, typing a value that does not match any option shows a "Create" option.
            The <code>onCreate</code> callback receives the new value.
          </p>
          <div className="combobox-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '360px' }}>
              <Combobox
                name="creatable"
                options={FRAMEWORK_OPTIONS}
                label="Framework (creatable)"
                placeholder="Type to search or create..."
                allowCreate
                onCreate={(val) => console.log('Created:', val)}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. States ──────────────────────────────────── */}
      <section className="combobox-page__section" id="states">
        <h2 className="combobox-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="combobox-page__section-desc">
          Combobox handles all interaction states with visual feedback including focus glow, error highlights, and disabled styling.
        </p>
        <div className="combobox-page__states-grid">
          <div className="combobox-page__state-cell">
            {tier === 'lite' ? (
              <LiteCombobox name="state-default" options={LITE_OPTIONS} label="Default" placeholder="Select..." />
            ) : (
              <Combobox name="state-default" options={FRAMEWORK_OPTIONS} label="Default" placeholder="Select..." />
            )}
            <span className="combobox-page__state-label">Default</span>
          </div>
          <div className="combobox-page__state-cell">
            {tier === 'lite' ? (
              <LiteCombobox name="state-error" options={LITE_OPTIONS} label="With Error" error="Selection required" />
            ) : (
              <Combobox name="state-error" options={FRAMEWORK_OPTIONS} label="With Error" error="Selection required" />
            )}
            <span className="combobox-page__state-label">Error</span>
          </div>
          <div className="combobox-page__state-cell">
            {tier === 'lite' ? (
              <LiteCombobox name="state-disabled" options={LITE_OPTIONS} label="Disabled" disabled />
            ) : (
              <Combobox name="state-disabled" options={FRAMEWORK_OPTIONS} label="Disabled" disabled />
            )}
            <span className="combobox-page__state-label">Disabled</span>
          </div>
          {tier !== 'lite' && (
            <div className="combobox-page__state-cell">
              <Combobox name="state-loading" options={[]} label="Loading" loading placeholder="Loading..." />
              <span className="combobox-page__state-label">Loading</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="combobox-page__section" id="tiers">
        <h2 className="combobox-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="combobox-page__section-desc">
          Lite tier renders a native {'<select>'} element for maximum compatibility and zero JS.
          Standard tier provides full combobox with search, filter, groups, and keyboard navigation.
        </p>

        <div className="combobox-page__tiers">
          {/* Lite */}
          <div
            className={`combobox-page__tier-card${tier === 'lite' ? ' combobox-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="combobox-page__tier-header">
              <span className="combobox-page__tier-name">Lite</span>
              <span className="combobox-page__tier-size">~0.3 KB</span>
            </div>
            <p className="combobox-page__tier-desc">
              Native {'<select>'} fallback. No search, no groups, no descriptions. Just a simple dropdown.
            </p>
            <div className="combobox-page__tier-import">
              import {'{'} Combobox {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="combobox-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <LiteCombobox name="lite-preview" options={LITE_OPTIONS} label="Lite" placeholder="Select..." />
              </div>
            </div>
            <div className="combobox-page__size-breakdown">
              <div className="combobox-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`combobox-page__tier-card${tier === 'standard' ? ' combobox-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="combobox-page__tier-header">
              <span className="combobox-page__tier-name">Standard</span>
              <span className="combobox-page__tier-size">~4 KB</span>
            </div>
            <p className="combobox-page__tier-desc">
              Full searchable combobox with keyboard nav, groups, match highlighting, create-new, and anchor positioning.
            </p>
            <div className="combobox-page__tier-import">
              import {'{'} Combobox {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="combobox-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <Combobox name="std-preview" options={FRAMEWORK_OPTIONS} label="Standard" placeholder="Search..." />
              </div>
            </div>
            <div className="combobox-page__size-breakdown">
              <div className="combobox-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`combobox-page__tier-card${tier === 'premium' ? ' combobox-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="combobox-page__tier-header">
              <span className="combobox-page__tier-name">Premium</span>
              <span className="combobox-page__tier-size">~3-5 KB</span>
            </div>
            <p className="combobox-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="combobox-page__tier-import">
              import {'{'} Combobox {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="combobox-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <Combobox name="prem-preview" options={FRAMEWORK_OPTIONS} label="Premium" placeholder="Search..." />
              </div>
            </div>
            <div className="combobox-page__size-breakdown">
              <div className="combobox-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="combobox-page__section" id="brand-color">
        <h2 className="combobox-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="combobox-page__section-desc">
          Pick a brand color to see the combobox focus glow and selection highlights update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="combobox-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`combobox-page__color-preset${brandColor === p.hex ? ' combobox-page__color-preset--active' : ''}`}
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

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="combobox-page__section" id="props">
        <h2 className="combobox-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="combobox-page__section-desc">
          All props accepted by Combobox. It also spreads native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={comboboxPropDefs} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="combobox-page__section" id="accessibility">
        <h2 className="combobox-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="combobox-page__section-desc">
          Built with WAI-ARIA combobox pattern for full keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="combobox-page__a11y-list">
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA combobox:</strong> Uses <code className="combobox-page__a11y-key">role="combobox"</code> on input and <code className="combobox-page__a11y-key">role="listbox"</code> on dropdown.
              </span>
            </li>
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="combobox-page__a11y-key">Arrow</code> keys navigate, <code className="combobox-page__a11y-key">Enter</code> selects, <code className="combobox-page__a11y-key">Escape</code> closes, <code className="combobox-page__a11y-key">Home</code>/<code className="combobox-page__a11y-key">End</code> jump.
              </span>
            </li>
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Active descendant:</strong> Uses <code className="combobox-page__a11y-key">aria-activedescendant</code> for virtual focus tracking.
              </span>
            </li>
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error announcements:</strong> Error messages use <code className="combobox-page__a11y-key">role="alert"</code> for screen reader notification.
              </span>
            </li>
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="combobox-page__a11y-item">
              <span className="combobox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="combobox-page__a11y-key">forced-colors: active</code> with visible borders and highlight markers.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
