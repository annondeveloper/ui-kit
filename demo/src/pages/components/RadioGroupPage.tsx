'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RadioGroup } from '@ui/components/radio-group'
import { RadioGroup as LiteRadioGroup } from '@ui/lite/radio-group'
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
    @scope (.radio-group-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: radio-group-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .radio-group-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .radio-group-page__hero::before {
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
        animation: aurora-spin-rg 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-rg {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .radio-group-page__hero::before { animation: none; }
      }

      .radio-group-page__title {
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

      .radio-group-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .radio-group-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .radio-group-page__import-code {
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

      .radio-group-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .radio-group-page__section {
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
        animation: rg-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes rg-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .radio-group-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .radio-group-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .radio-group-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .radio-group-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .radio-group-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .radio-group-page__preview {
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

      .radio-group-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .radio-group-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .radio-group-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .radio-group-page__playground {
          grid-template-columns: 1fr;
        }
        .radio-group-page__playground-controls {
          position: static !important;
        }
      }

      @container radio-group-page (max-width: 680px) {
        .radio-group-page__playground {
          grid-template-columns: 1fr;
        }
        .radio-group-page__playground-controls {
          position: static !important;
        }
      }

      .radio-group-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .radio-group-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .radio-group-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .radio-group-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .radio-group-page__playground-controls {
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

      .radio-group-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .radio-group-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .radio-group-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .radio-group-page__option-btn {
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
      .radio-group-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .radio-group-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .radio-group-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .radio-group-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .radio-group-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .radio-group-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .radio-group-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .radio-group-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .radio-group-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .radio-group-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .radio-group-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .radio-group-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .radio-group-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .radio-group-page__tier-card {
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

      .radio-group-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .radio-group-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .radio-group-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .radio-group-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .radio-group-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .radio-group-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .radio-group-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .radio-group-page__tier-import {
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

      .radio-group-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .radio-group-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .radio-group-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .radio-group-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .radio-group-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .radio-group-page__code-tabs {
        margin-block-start: 1rem;
      }

      .radio-group-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .radio-group-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .radio-group-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .radio-group-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .radio-group-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .radio-group-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      .radio-group-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .radio-group-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .radio-group-page__hero { padding: 2rem 1.25rem; }
        .radio-group-page__title { font-size: 1.75rem; }
        .radio-group-page__preview { padding: 1.75rem; }
        .radio-group-page__playground { grid-template-columns: 1fr; }
        .radio-group-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .radio-group-page__tiers { grid-template-columns: 1fr; }
        .radio-group-page__section { padding: 1.25rem; }
        .radio-group-page__states-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .radio-group-page__hero { padding: 1.5rem 1rem; }
        .radio-group-page__title { font-size: 1.5rem; }
        .radio-group-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .radio-group-page__title { font-size: 4rem; }
        .radio-group-page__preview { padding: 3.5rem; }
      }

      .radio-group-page__import-code,
      .radio-group-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const radioGroupPropsData: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'HTML name attribute for the radio group, used for form submission.' },
  { name: 'options', type: 'RadioOption[]', required: true, description: 'Array of { value, label, disabled? } objects defining available choices.' },
  { name: 'value', type: 'string', description: 'Controlled selected value. When set, the component becomes controlled.' },
  { name: 'defaultValue', type: 'string', description: 'Initial selected value for uncontrolled mode.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback fired when the selected option changes.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'vertical'", description: 'Layout direction of the radio options.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls the radio circle and label size.' },
  { name: 'label', type: 'string', description: 'Fieldset legend text displayed above the group.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the group with critical styling.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for the selection dot transition.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLFieldSetElement>', description: 'Forwarded ref to the underlying <fieldset> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Orientation = 'horizontal' | 'vertical'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { RadioGroup } from '@annondeveloper/ui-kit/lite'",
  standard: "import { RadioGroup } from '@annondeveloper/ui-kit'",
  premium: "import { RadioGroup } from '@annondeveloper/ui-kit'",
}

const SAMPLE_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
]

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
      className="radio-group-page__copy-btn"
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
    <div className="radio-group-page__control-group">
      <span className="radio-group-page__control-label">{label}</span>
      <div className="radio-group-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`radio-group-page__option-btn${opt === value ? ' radio-group-page__option-btn--active' : ''}`}
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
    <label className="radio-group-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, orientation: Orientation, error: string, disabled: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const props: string[] = [`  name="framework"`, `  legend="Favorite Framework"`]
    props.push(`  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]}`)
    if (orientation !== 'vertical') props.push(`  orientation="${orientation}"`)
    return `${importStr}\n\n<RadioGroup\n${props.join('\n')}\n  onChange={setValue}\n/>`
  }

  const props: string[] = [`  name="framework"`, `  label="Favorite Framework"`]
  props.push(`  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (orientation !== 'vertical') props.push(`  orientation="${orientation}"`)
  if (error) props.push(`  error="${error}"`)
  if (disabled) props.push('  disabled')

  return `${importStr}\n\n<RadioGroup\n${props.join('\n')}\n  onChange={setValue}\n/>`
}

function generateHtmlCode(tier: Tier, orientation: Orientation, disabled: boolean): string {
  const className = tier === 'lite' ? 'ui-lite-radio-group' : 'ui-radio-group'
  return `<!-- RadioGroup — @annondeveloper/ui-kit ${tier} tier -->
<fieldset class="${className}" data-orientation="${orientation}">
  <legend>Favorite Framework</legend>
  <label>
    <input type="radio" name="framework" value="react"${disabled ? ' disabled' : ''} />
    <span>React</span>
  </label>
  <label>
    <input type="radio" name="framework" value="vue"${disabled ? ' disabled' : ''} />
    <span>Vue</span>
  </label>
  <label>
    <input type="radio" name="framework" value="angular"${disabled ? ' disabled' : ''} />
    <span>Angular</span>
  </label>
</fieldset>`
}

function generateVueCode(tier: Tier, size: Size, orientation: Orientation, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <fieldset class="ui-lite-radio-group" data-orientation="${orientation}">
    <legend>Favorite Framework</legend>
    <label v-for="opt in options" :key="opt.value">
      <input type="radio" name="framework" :value="opt.value" v-model="selected"${disabled ? ' disabled' : ''} />
      <span>{{ opt.label }}</span>
    </label>
  </fieldset>
</template>

<script setup>
import { ref } from 'vue'
const selected = ref('react')
const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
]
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <RadioGroup
    name="framework"
    label="Favorite Framework"
    :options="options"
    v-model="selected"
    size="${size}"
    orientation="${orientation}"
    ${disabled ? 'disabled' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { RadioGroup } from '@annondeveloper/ui-kit'
const selected = ref('react')
const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
]
</script>`
}

function generateAngularCode(tier: Tier, size: Size, orientation: Orientation, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<fieldset class="ui-lite-radio-group" data-orientation="${orientation}">
  <legend>Favorite Framework</legend>
  <label *ngFor="let opt of options">
    <input type="radio" name="framework" [value]="opt.value" [(ngModel)]="selected"${disabled ? ' [disabled]="true"' : ''} />
    <span>{{ opt.label }}</span>
  </label>
</fieldset>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier -->
<fieldset class="ui-radio-group" data-size="${size}" data-orientation="${orientation}">
  <legend>Favorite Framework</legend>
  <div class="ui-radio-group__options" role="radiogroup">
    <label *ngFor="let opt of options" class="ui-radio-group__option">
      <input type="radio" name="framework" [value]="opt.value" [(ngModel)]="selected"${disabled ? ' [disabled]="true"' : ''} class="ui-radio-group__input" />
      <span class="ui-radio-group__circle"><span class="ui-radio-group__dot"></span></span>
      <span class="ui-radio-group__label">{{ opt.label }}</span>
    </label>
  </div>
</fieldset>

@import '@annondeveloper/ui-kit/css/components/radio-group.css';`
}

function generateSvelteCode(tier: Tier, size: Size, orientation: Orientation, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<fieldset class="ui-lite-radio-group" data-orientation="${orientation}">
  <legend>Favorite Framework</legend>
  {#each options as opt}
    <label>
      <input type="radio" name="framework" value={opt.value} bind:group={selected}${disabled ? ' disabled' : ''} />
      <span>{opt.label}</span>
    </label>
  {/each}
</fieldset>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { RadioGroup } from '@annondeveloper/ui-kit';
  let selected = 'react';
  const options = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ];
</script>

<RadioGroup
  name="framework"
  label="Favorite Framework"
  {options}
  bind:value={selected}
  size="${size}"
  orientation="${orientation}"
  ${disabled ? 'disabled' : ''}
/>`
}

// ─── Interactive Playground ──────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [orientation, setOrientation] = useState<Orientation>('vertical')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, size, orientation, error, disabled), [tier, size, orientation, error, disabled])
  const htmlCode = useMemo(() => generateHtmlCode(tier, orientation, disabled), [tier, orientation, disabled])
  const vueCode = useMemo(() => generateVueCode(tier, size, orientation, disabled), [tier, size, orientation, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, orientation, disabled), [tier, size, orientation, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, orientation, disabled), [tier, size, orientation, disabled])

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
    <section className="radio-group-page__section" id="playground">
      <h2 className="radio-group-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="radio-group-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="radio-group-page__playground">
        <div className="radio-group-page__playground-preview">
          <div className="radio-group-page__playground-result">
            {tier === 'lite' ? (
              <LiteRadioGroup
                name="pg-framework-lite"
                legend="Favorite Framework"
                options={SAMPLE_OPTIONS}
                value={selected}
                onChange={setSelected}
                orientation={orientation}
              />
            ) : (
              <RadioGroup
                name="pg-framework"
                label="Favorite Framework"
                options={SAMPLE_OPTIONS}
                value={selected}
                onChange={setSelected}
                size={size}
                orientation={orientation}
                error={error || undefined}
              />
            )}
          </div>

          <div className="radio-group-page__code-tabs">
            <div className="radio-group-page__export-row">
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
              {copyStatus && <span className="radio-group-page__export-status">{copyStatus}</span>}
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

        <div className="radio-group-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          <div className="radio-group-page__control-group">
            <span className="radio-group-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>

          {tier !== 'lite' && (
            <div className="radio-group-page__control-group">
              <span className="radio-group-page__control-label">Error message</span>
              <input
                type="text"
                value={error}
                onChange={e => setError(e.target.value)}
                className="radio-group-page__text-input"
                placeholder="Leave empty for no error..."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RadioGroupPage() {
  useStyles('radio-group-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
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

  useEffect(() => {
    const sections = document.querySelectorAll('.radio-group-page__section')
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
    <div className="radio-group-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="radio-group-page__hero">
        <h1 className="radio-group-page__title">RadioGroup</h1>
        <p className="radio-group-page__desc">
          Single-selection group with custom styled radio circles, roving tabindex keyboard navigation,
          orientation control, and error state. Built on native radio inputs within a fieldset.
        </p>
        <div className="radio-group-page__import-row">
          <code className="radio-group-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="radio-group-page__section" id="sizes">
        <h2 className="radio-group-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="radio-group-page__section-desc">
          Five radio circle sizes from compact (xs) to large (xl). Sizes control the circle diameter and label text size.
        </p>
        <div className="radio-group-page__preview radio-group-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <LiteRadioGroup
              name="size-demo-lite"
              legend="Choose one"
              options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
                { value: 'c', label: 'Option C' },
              ]}
            />
          ) : (
            SIZES.map(s => (
              <RadioGroup
                key={s}
                name={`size-demo-${s}`}
                label={`Size: ${s}`}
                size={s}
                options={[
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ]}
                defaultValue="a"
                orientation="horizontal"
              />
            ))
          )}
        </div>
      </section>

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="radio-group-page__section" id="states">
        <h2 className="radio-group-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="radio-group-page__section-desc">
          RadioGroup handles default, selected, disabled, and error states with clear visual feedback.
        </p>
        <div className="radio-group-page__states-grid">
          <div className="radio-group-page__state-cell">
            {tier === 'lite' ? (
              <LiteRadioGroup
                name="state-default-lite"
                legend="Default"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
              />
            ) : (
              <RadioGroup
                name="state-default"
                label="Default"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
              />
            )}
            <span className="radio-group-page__state-label">Default</span>
          </div>
          <div className="radio-group-page__state-cell">
            {tier === 'lite' ? (
              <LiteRadioGroup
                name="state-selected-lite"
                legend="Selected"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                value="a"
              />
            ) : (
              <RadioGroup
                name="state-selected"
                label="Selected"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                value="a"
              />
            )}
            <span className="radio-group-page__state-label">Selected</span>
          </div>
          <div className="radio-group-page__state-cell">
            {tier === 'lite' ? (
              <LiteRadioGroup
                name="state-disabled-lite"
                legend="Disabled"
                options={[{ value: 'a', label: 'Alpha', disabled: true }, { value: 'b', label: 'Beta', disabled: true }]}
              />
            ) : (
              <RadioGroup
                name="state-disabled"
                label="Disabled"
                options={[{ value: 'a', label: 'Alpha', disabled: true }, { value: 'b', label: 'Beta', disabled: true }]}
              />
            )}
            <span className="radio-group-page__state-label">Disabled</span>
          </div>
          {tier !== 'lite' && (
            <div className="radio-group-page__state-cell">
              <RadioGroup
                name="state-error"
                label="With Error"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                error="Please select an option"
              />
              <span className="radio-group-page__state-label">Error</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="radio-group-page__section" id="features">
        <h2 className="radio-group-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="radio-group-page__section-desc">
          Orientation control, mixed disabled options, error validation, and legend/label support.
        </p>
        <div className="radio-group-page__preview radio-group-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <>
              <LiteRadioGroup
                name="feat-vert-lite"
                legend="Vertical (default)"
                options={SAMPLE_OPTIONS}
                orientation="vertical"
              />
              <LiteRadioGroup
                name="feat-horiz-lite"
                legend="Horizontal"
                options={SAMPLE_OPTIONS}
                orientation="horizontal"
              />
            </>
          ) : (
            <>
              <RadioGroup
                name="feat-vert"
                label="Vertical (default)"
                options={SAMPLE_OPTIONS}
                orientation="vertical"
                defaultValue="react"
              />
              <RadioGroup
                name="feat-horiz"
                label="Horizontal layout"
                options={SAMPLE_OPTIONS}
                orientation="horizontal"
                defaultValue="vue"
              />
              <RadioGroup
                name="feat-mixed"
                label="Mixed disabled options"
                options={[
                  { value: 'free', label: 'Free tier' },
                  { value: 'pro', label: 'Pro tier' },
                  { value: 'enterprise', label: 'Enterprise (coming soon)', disabled: true },
                ]}
                defaultValue="free"
              />
              <RadioGroup
                name="feat-error"
                label="With validation error"
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                error="This field is required"
              />
            </>
          )}
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="radio-group-page__section" id="tiers">
        <h2 className="radio-group-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="radio-group-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier uses native radios,
          while Standard adds custom circles, roving tabindex, sizes, error state, and motion.
        </p>

        <div className="radio-group-page__tiers">
          <div
            className={`radio-group-page__tier-card${tier === 'lite' ? ' radio-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="radio-group-page__tier-header">
              <span className="radio-group-page__tier-name">Lite</span>
              <span className="radio-group-page__tier-size">~0.3 KB</span>
            </div>
            <p className="radio-group-page__tier-desc">
              Native radio inputs with minimal wrapper. No custom circles, no sizes, no error state.
            </p>
            <div className="radio-group-page__tier-import">
              import {'{'} RadioGroup {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="radio-group-page__tier-preview">
              <LiteRadioGroup
                name="tier-lite"
                legend="Choice"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                value="a"
              />
            </div>
          </div>

          <div
            className={`radio-group-page__tier-card${tier === 'standard' ? ' radio-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="radio-group-page__tier-header">
              <span className="radio-group-page__tier-name">Standard</span>
              <span className="radio-group-page__tier-size">~2 KB</span>
            </div>
            <p className="radio-group-page__tier-desc">
              Custom styled circles with animated dot, roving tabindex,
              five sizes, error state, and motion levels.
            </p>
            <div className="radio-group-page__tier-import">
              import {'{'} RadioGroup {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="radio-group-page__tier-preview">
              <RadioGroup
                name="tier-standard"
                label="Choice"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                value="a"
              />
            </div>
          </div>

          <div
            className={`radio-group-page__tier-card${tier === 'premium' ? ' radio-group-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="radio-group-page__tier-header">
              <span className="radio-group-page__tier-name">Premium</span>
              <span className="radio-group-page__tier-size">~3-5 KB</span>
            </div>
            <p className="radio-group-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="radio-group-page__tier-import">
              import {'{'} RadioGroup {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="radio-group-page__tier-preview">
              <RadioGroup
                name="tier-premium"
                label="Choice"
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
                value="a"
                size="lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="radio-group-page__section" id="brand-color">
        <h2 className="radio-group-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="radio-group-page__section-desc">
          Pick a brand color to see the radio circles update in real-time.
          The checked state uses your brand color for both border and fill.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="radio-group-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`radio-group-page__color-preset${brandColor === p.hex ? ' radio-group-page__color-preset--active' : ''}`}
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
          <div className="radio-group-page__preview" style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <LiteRadioGroup
                name="brand-demo-lite"
                legend="Branded group"
                options={SAMPLE_OPTIONS}
                value="react"
              />
            ) : (
              <RadioGroup
                name="brand-demo"
                label="Branded group"
                options={SAMPLE_OPTIONS}
                value="react"
                size="lg"
              />
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="radio-group-page__section" id="props">
        <h2 className="radio-group-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="radio-group-page__section-desc">
          All props accepted by RadioGroup. It also spreads any native fieldset HTML attributes
          onto the underlying {'<fieldset>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={radioGroupPropsData} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="radio-group-page__section" id="accessibility">
        <h2 className="radio-group-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="radio-group-page__section-desc">
          Built on native radio inputs within a {'<fieldset>'} with comprehensive keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="radio-group-page__a11y-list">
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="radio-group-page__a11y-key">Arrow Up/Down</code> (vertical) or <code className="radio-group-page__a11y-key">Arrow Left/Right</code> (horizontal) navigate options. <code className="radio-group-page__a11y-key">Home/End</code> jump to first/last.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roving tabindex:</strong> Only the currently selected radio is in the tab order, matching WAI-ARIA APG pattern.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Fieldset/Legend:</strong> Uses native <code className="radio-group-page__a11y-key">{'<fieldset>'}</code> and <code className="radio-group-page__a11y-key">{'<legend>'}</code> for group labeling.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages use <code className="radio-group-page__a11y-key">role="alert"</code> for immediate screen reader announcement.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="radio-group-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="radio-group-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="radio-group-page__a11y-item">
              <span className="radio-group-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="radio-group-page__a11y-key">forced-colors: active</code> with visible borders and Highlight color.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="radio-group-page__section" id="source">
        <h2 className="radio-group-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="radio-group-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            className="radio-group-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/radio-group.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="code" size="sm" />
            src/components/radio-group.tsx — Standard tier
          </a>
          <a
            className="radio-group-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/radio-group.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="code" size="sm" />
            src/lite/radio-group.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
